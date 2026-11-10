"use server";

import { revalidatePath } from "next/cache";
import { requirePermission, logStaffActivity } from "@/lib/permissions/rbac";
import { OrderService } from "@/services/order.service";
import { checkoutOrderSchema, updateOrderStatusSchema } from "@/lib/validations/schemas";
import { prisma } from "@/lib/db/prisma";

export async function placeCustomerOrderAction(rawInput: unknown) {
  const parsed = checkoutOrderSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Validation failed" };
  }

  try {
    const order = await OrderService.createOrder(parsed.data);
    revalidatePath("/admin/orders");
    revalidatePath("/account/orders");
    return { success: true, orderNumber: order.orderNumber, orderId: order.id };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to place order" };
  }
}

export async function updateOrderStatusAction(rawInput: unknown) {
  const ctx = await requirePermission(["orders.confirm", "orders.process", "delivery.update", "orders.cancel_refund"]);
  const parsed = updateOrderStatusSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid status payload" };
  }

  try {
    const updated = await OrderService.updateOrderStatus({
      ctx,
      orderId: parsed.data.orderId,
      newStatus: parsed.data.newStatus,
      note: parsed.data.note,
      cashCollected: parsed.data.cashCollected,
    });
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${parsed.data.orderId}`);
    return { success: true, order: updated };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function assignOrderToStaffAction(params: {
  orderId: string;
  staffProfileId: string;
  roleType: "MODERATOR" | "ORDER_PROCESSOR" | "DELIVERY_AGENT";
  notes?: string;
}) {
  const ctx = await requirePermission("orders.assign");

  const assignment = await prisma.orderAssignment.upsert({
    where: {
      orderId_roleType: {
        orderId: params.orderId,
        roleType: params.roleType,
      },
    },
    update: {
      staffProfileId: params.staffProfileId,
      assignedById: ctx.userId,
      notes: params.notes,
      assignedAt: new Date(),
    },
    create: {
      orderId: params.orderId,
      staffProfileId: params.staffProfileId,
      roleType: params.roleType,
      assignedById: ctx.userId,
      notes: params.notes,
    },
  });

  await prisma.staffProfile.update({
    where: { id: params.staffProfileId },
    data: { ordersAssignedCount: { increment: 1 } },
  });

  await logStaffActivity({
    ctx,
    action: "ORDER_ASSIGNED",
    module: "ORDERS",
    targetId: params.orderId,
    details: `Assigned order ${params.orderId} (${params.roleType}) to staff profile ${params.staffProfileId}`,
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/assignments");
  return { success: true, assignment };
}
