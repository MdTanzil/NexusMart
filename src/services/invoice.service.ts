import { prisma } from "@/lib/db/prisma";
import { requirePermission, logStaffActivity } from "@/lib/permissions/rbac";

export type InvoiceLayoutMode = "A4_STANDARD" | "THERMAL_80MM" | "COMPACT_MEMO";
export type InvoiceLanguage = "en" | "bn" | "bilingual";

export class InvoiceService {
  /**
   * Fetches authorized, tamper-proof order invoice payload from PostgreSQL
   * and increments the memo print counter with staff audit attribution.
   */
  static async getAuthorizedInvoiceData(orderIds: string[], recordPrintAction = false) {
    const ctx = await requirePermission(["invoices.print", "invoices.bulk_print"]);

    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: {
        items: true,
        payment: true,
        shipping: true,
        assignments: {
          include: {
            staffProfile: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (orders.length === 0) {
      throw new Error("No matching orders found for invoice generation.");
    }

    // Enforce assignment scope if the staff member does not hold orders.view_all
    if (!ctx.permissions.has("*") && !ctx.permissions.has("orders.view_all")) {
      for (const ord of orders) {
        const isAssigned = ord.assignments.some((a) => a.staffProfileId === ctx.staffProfileId);
        if (!isAssigned) {
          throw new Error(`FORBIDDEN: Unauthorized access to invoice for order ${ord.orderNumber}`);
        }
      }
    }

    const settings = await prisma.websiteSettings.findFirst();

    if (recordPrintAction) {
      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: {
          memoPrintCount: { increment: 1 },
          lastPrintedAt: new Date(),
          lastPrintedBy: ctx.name,
        },
      });

      await logStaffActivity({
        ctx,
        action: orderIds.length > 1 ? "BULK_MEMO_PRINTED" : "ORDER_MEMO_PRINTED",
        module: "INVOICES",
        targetId: orders.map((o) => o.orderNumber).join(", "),
        details: `Generated printable order memo(s) for ${orders.length} order(s) by ${ctx.name}`,
      });
    }

    // Strip purchasePrice from items so invoice payloads never leak cost data
    const sanitizedOrders = orders.map((o) => ({
      ...o,
      items: o.items.map(({ purchasePrice, ...safeItem }) => safeItem),
    }));

    return {
      settings,
      orders: sanitizedOrders,
      printedBy: ctx.name,
      printedAt: new Date().toISOString(),
    };
  }
}
