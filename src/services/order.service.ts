import { prisma } from "@/lib/db/prisma";
import { InventoryService } from "./inventory.service";
import { generateOrderNumber } from "@/lib/utils";
import { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { AuthenticatedContext, logStaffActivity } from "@/lib/permissions/rbac";

export class OrderService {
  /**
   * Places a customer order inside a serializable database transaction:
   * - Validates stock availability & prevents overselling
   * - Validates optional coupon code
   * - Calculates location-based delivery charges
   * - Deducts stock and logs InventoryTransactions
   * - Creates Order, OrderItems, Payment, Shipping, and OrderStatusHistory
   */
  static async createOrder(input: {
    customerId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    deliveryAddress: string;
    deliveryZone: "Inside Dhaka" | "Dhaka Sub-Urban" | "Outside Dhaka";
    paymentMethod: PaymentMethod;
    transactionId?: string;
    senderPhone?: string;
    couponCode?: string;
    customerNotes?: string;
    items: Array<{ productId: string; variantId?: string; quantity: number }>;
  }) {
    return await prisma.$transaction(async (tx) => {
      const settings = await tx.websiteSettings.findFirst();
      let subtotal = 0;

      const resolvedItems: Array<{
        productId: string;
        variantId?: string;
        productName: string;
        productNameBn?: string | null;
        sku: string;
        variantName?: string;
        quantity: number;
        unitPrice: number;
        purchasePrice: number;
        totalPrice: number;
      }> = [];

      for (const item of input.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { inventory: true, variants: true },
        });

        if (!product || !product.isActive || product.isArchived) {
          throw new Error(`Product unavailable: ${item.productId}`);
        }

        // Prevent overselling with atomic stock deduction
        await InventoryService.adjustStock({
          productId: product.id,
          quantityDelta: -item.quantity,
          type: "ORDER_DEDUCTION",
          note: `Reserved for new checkout order`,
          tx,
        });

        const unitPrice = Number(product.salePrice ?? product.regularPrice);
        const purchasePrice = Number(product.purchasePrice);
        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;

        resolvedItems.push({
          productId: product.id,
          variantId: item.variantId,
          productName: product.name,
          productNameBn: product.nameBn,
          sku: product.sku,
          quantity: item.quantity,
          unitPrice,
          purchasePrice,
          totalPrice,
        });
      }

      // Coupon calculation
      let discountAmount = 0;
      if (input.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: input.couponCode.toUpperCase() },
        });
        const now = new Date();
        if (
          coupon &&
          coupon.isActive &&
          coupon.expiresAt > now &&
          subtotal >= Number(coupon.minPurchaseAmount) &&
          (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)
        ) {
          if (coupon.discountType === "PERCENTAGE") {
            discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
            if (coupon.maxDiscountAmount) {
              discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
            }
          } else {
            discountAmount = Number(coupon.discountValue);
          }
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }

      // Delivery fee calculation
      let deliveryCharge = 60;
      if (input.deliveryZone === "Inside Dhaka") {
        deliveryCharge = Number(settings?.insideDhakaShipping ?? 60);
      } else if (input.deliveryZone === "Dhaka Sub-Urban") {
        deliveryCharge = Number(settings?.subDhakaShipping ?? 100);
      } else {
        deliveryCharge = Number(settings?.outsideDhakaShipping ?? 130);
      }

      if (settings?.freeShippingThreshold && subtotal - discountAmount >= Number(settings.freeShippingThreshold)) {
        deliveryCharge = 0;
      }

      const grandTotal = Math.max(0, subtotal - discountAmount + deliveryCharge);
      const orderNumber = generateOrderNumber();

      const paymentStatus: PaymentStatus =
        input.paymentMethod === "CASH_ON_DELIVERY"
          ? "UNPAID"
          : input.transactionId
          ? "PENDING_VERIFICATION"
          : "UNPAID";

      const order = await tx.order.create({
        data: {
          orderNumber,
          customerId: input.customerId,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          customerEmail: input.customerEmail,
          deliveryAddress: input.deliveryAddress,
          deliveryZone: input.deliveryZone,
          subtotal,
          discountAmount,
          deliveryCharge,
          grandTotal,
          couponCode: input.couponCode?.toUpperCase(),
          paymentMethod: input.paymentMethod,
          paymentStatus,
          orderStatus: "PENDING",
          customerNotes: input.customerNotes,
          items: {
            create: resolvedItems,
          },
          statusHistory: {
            create: {
              newState: "PENDING",
              note: "Order placed by customer via storefront.",
              changedByName: input.customerName,
            },
          },
          payment: {
            create: {
              method: input.paymentMethod,
              status: paymentStatus,
              amount: grandTotal,
              transactionId: input.transactionId || undefined,
              senderPhone: input.senderPhone || undefined,
            },
          },
          shipping: {
            create: {
              provider: "INTERNAL",
              status: "PENDING",
              deliveryZone: input.deliveryZone,
              deliveryFee: deliveryCharge,
            },
          },
        },
        include: {
          items: true,
          payment: true,
          shipping: true,
        },
      });

      return order;
    });
  }

  /**
   * Updates an order's status with strict RBAC validation, automatic stock restoration
   * on CANCELLED/RETURNED, COD cash collection recording, and audit trail logging.
   */
  static async updateOrderStatus(params: {
    ctx: AuthenticatedContext;
    orderId: string;
    newStatus: OrderStatus;
    note?: string;
    cashCollected?: number;
  }) {
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: { items: true, assignments: true },
    });

    if (!order) throw new Error("Order not found");

    // Verify assignment access if user doesn't have orders.view_all
    if (!params.ctx.permissions.has("*") && !params.ctx.permissions.has("orders.view_all")) {
      const isAssigned = order.assignments.some(
        (a) => a.staffProfileId === params.ctx.staffProfileId
      );
      if (!isAssigned) {
        throw new Error("FORBIDDEN: You can only update orders assigned to you.");
      }
    }

    return await prisma.$transaction(async (tx) => {
      const prevStatus = order.orderStatus;

      // Restore inventory if transitioning to CANCELLED or RETURNED from an active state
      if (
        (params.newStatus === "CANCELLED" || params.newStatus === "RETURNED") &&
        prevStatus !== "CANCELLED" &&
        prevStatus !== "RETURNED"
      ) {
        for (const item of order.items) {
          await InventoryService.adjustStock({
            productId: item.productId,
            quantityDelta: item.quantity,
            type:
              params.newStatus === "CANCELLED"
                ? "ORDER_CANCEL_RESTORE"
                : "RETURN_RESTORE",
            referenceId: order.orderNumber,
            note: `Stock restored due to order ${params.newStatus}`,
            performedById: params.ctx.userId,
            tx,
          });
        }
      }

      const updatedPaymentStatus =
        params.newStatus === "DELIVERED" && order.paymentMethod === "CASH_ON_DELIVERY"
          ? "PAID"
          : params.newStatus === "REFUNDED"
          ? "REFUNDED"
          : order.paymentStatus;

      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          orderStatus: params.newStatus,
          paymentStatus: updatedPaymentStatus,
          statusHistory: {
            create: {
              previousState: prevStatus,
              newState: params.newStatus,
              note: params.note || `Status updated from ${prevStatus} to ${params.newStatus}`,
              changedById: params.ctx.userId,
              changedByName: params.ctx.name,
            },
          },
        },
      });

      if (params.cashCollected !== undefined && params.cashCollected > 0) {
        await tx.shipping.updateMany({
          where: { orderId: order.id },
          data: {
            cashCollected: params.cashCollected,
            status: params.newStatus === "DELIVERED" ? "DELIVERED" : undefined,
            deliveredAt: params.newStatus === "DELIVERED" ? new Date() : undefined,
          },
        });
      }

      await logStaffActivity({
        ctx: params.ctx,
        action: "ORDER_STATUS_UPDATED",
        module: "ORDERS",
        targetId: order.orderNumber,
        details: `Updated order ${order.orderNumber} from ${prevStatus} to ${params.newStatus}`,
      });

      return updated;
    });
  }
}
