# NexusMart Enterprise — Full-Featured Next.js eCommerce Platform with Multi-Role Staff Management

Production-ready eCommerce platform built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **shadcn/ui**, **Prisma ORM**, **PostgreSQL**, **Auth.js**, **TanStack Table**, **Recharts**, **ExcelJS**, and a **3-Layout Bilingual (English & Bengali) Order Memo Printing Engine**.

## Architecture & Key Capabilities

1. **Multi-Role RBAC & Custom Permission Engine (`src/lib/permissions/rbac.ts`)**
   - Pre-configured system roles: **Super Admin**, **Admin / Manager**, **Moderator**, **Order Processing Staff**, **Delivery Staff**, and **Customer**.
   - Supports creating custom roles and assigning any combination of **28 granular permission codes** (`products.purchase_price`, `financials.view`, `orders.confirm`, `invoices.bulk_print`, `delivery.update`, etc.) plus per-user direct permission overrides.
   - Server-side enforcement in all Server Actions and Route Handlers (`requirePermission()`).
   - Purchase price (`purchasePrice`) and net profit metrics are strictly masked unless the logged-in staff member holds `products.purchase_price` or `financials.view`.

2. **Normalized 29-Model PostgreSQL Database (`prisma/schema.prisma`)**
   - `User`, `Account`, `Session`, `Role`, `Permission`, `RolePermission`, `UserRole`, `CustomerProfile`, `StaffProfile`, `Address`, `Category`, `Product`, `ProductVariant`, `ProductImage`, `Inventory`, `InventoryTransaction`, `Cart`, `CartItem`, `Wishlist`, `Order`, `OrderItem`, `OrderStatusHistory`, `OrderAssignment`, `Payment`, `Shipping`, `Coupon`, `Review`, `StaffActivityLog`, `WebsiteSettings`.

3. **Professional Order Memo & Invoice Printing System (`src/services/invoice.service.ts` & `src/components/invoices/OrderMemoPrint.tsx`)**
   - **Three Print Layouts**:
     - **A4 Standard Invoice** (full corporate layout with item SKU, unit price, signature blocks, bilingual terms).
     - **80mm POS Thermal Receipt** (optimized for 80mm thermal printers).
     - **Compact Order Memo** (half-page packing & courier dispatch slip).
   - **Bilingual Support**: English, Bengali (`বাংলা`), or Bilingual side-by-side mode.
   - **Single & Bulk Printing**: Print directly from the orders table, order detail modal, or dedicated Invoice Printing Center with automatic `memoPrintCount` tracking and staff audit logs.

4. **Atomic Inventory & Order Processing (`src/services/inventory.service.ts`, `src/services/order.service.ts`)**
   - Prevents overselling via serializable Prisma transactions.
   - Records every stock movement (`INITIAL_STOCK`, `PURCHASE_RESTOCK`, `ORDER_DEDUCTION`, `ORDER_CANCEL_RESTORE`, `RETURN_RESTORE`, `DAMAGE_ADJUSTMENT`) with before/after quantities and staff attribution.

## Quick Start

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```
