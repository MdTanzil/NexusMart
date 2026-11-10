import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/permissions/rbac";
import { InventoryService } from "@/services/inventory.service";

export async function GET() {
  try {
    const ctx = await requirePermission("inventory.view");
    const canViewPurchasePrice =
      ctx.permissions.has("*") || ctx.permissions.has("products.purchase_price");

    const buffer = await InventoryService.exportInventoryToExcel(canViewPurchasePrice);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="nexusmart-inventory-${Date.now()}.xlsx"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
}
