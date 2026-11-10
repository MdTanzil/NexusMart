import { prisma } from "@/lib/db/prisma";
import { InventoryTxType, Prisma } from "@prisma/client";
import ExcelJS from "exceljs";

export class InventoryService {
  /**
   * Adjusts product stock inside an atomic Prisma database transaction
   * and records an immutable InventoryTransaction movement record.
   */
  static async adjustStock(params: {
    productId: string;
    quantityDelta: number;
    type: InventoryTxType;
    referenceId?: string;
    note?: string;
    performedById?: string;
    tx?: Prisma.TransactionClient;
  }) {
    const db = params.tx ?? prisma;

    const inventory = await db.inventory.findUnique({
      where: { productId: params.productId },
    });

    if (!inventory) {
      throw new Error(`Inventory record not found for product ${params.productId}`);
    }

    const previousStock = inventory.stockQuantity;
    const newStock = previousStock + params.quantityDelta;

    if (newStock < 0) {
      throw new Error(
        `INSUFFICIENT_STOCK: Cannot reduce stock below 0 (Available: ${previousStock}, Requested deduction: ${Math.abs(params.quantityDelta)})`
      );
    }

    const updatedInventory = await db.inventory.update({
      where: { id: inventory.id },
      data: { stockQuantity: newStock },
    });

    await db.inventoryTransaction.create({
      data: {
        inventoryId: inventory.id,
        type: params.type,
        quantityChange: params.quantityDelta,
        previousStock,
        newStock,
        referenceId: params.referenceId,
        note: params.note,
        performedById: params.performedById,
      },
    });

    return updatedInventory;
  }

  /**
   * Exports all products and stock quantities to an Excel (.xlsx) buffer using ExcelJS.
   * Masks purchasePrice unless the staff user holds 'products.purchase_price'.
   */
  static async exportInventoryToExcel(canViewPurchasePrice: boolean): Promise<Buffer> {
    const products = await prisma.product.findMany({
      include: { category: true, inventory: true },
      orderBy: { createdAt: "desc" },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Products & Inventory");

    const columns: Partial<ExcelJS.Column>[] = [
      { header: "SKU", key: "sku", width: 16 },
      { header: "Barcode", key: "barcode", width: 16 },
      { header: "Product Name (EN)", key: "name", width: 32 },
      { header: "Product Name (BN)", key: "nameBn", width: 28 },
      { header: "Category", key: "category", width: 20 },
      { header: "Regular Price (BDT)", key: "regularPrice", width: 18 },
      { header: "Sale Price (BDT)", key: "salePrice", width: 18 },
    ];

    if (canViewPurchasePrice) {
      columns.push({ header: "Purchase Price (BDT)", key: "purchasePrice", width: 20 });
    }

    columns.push(
      { header: "Current Stock", key: "stockQuantity", width: 15 },
      { header: "Low Stock Alert", key: "lowStockThreshold", width: 15 },
      { header: "Status", key: "status", width: 14 }
    );

    sheet.columns = columns;
    sheet.getRow(1).font = { bold: true };

    for (const p of products) {
      const rowData: Record<string, unknown> = {
        sku: p.sku,
        barcode: p.barcode || "-",
        name: p.name,
        nameBn: p.nameBn || "-",
        category: p.category.name,
        regularPrice: Number(p.regularPrice),
        salePrice: p.salePrice ? Number(p.salePrice) : Number(p.regularPrice),
        stockQuantity: p.inventory?.stockQuantity ?? 0,
        lowStockThreshold: p.inventory?.lowStockThreshold ?? 10,
        status: p.isActive ? "ACTIVE" : "INACTIVE",
      };
      if (canViewPurchasePrice) {
        rowData.purchasePrice = Number(p.purchasePrice);
      }
      sheet.addRow(rowData);
    }

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }
}
