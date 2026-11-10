import { PrismaClient, OrderStatus, PaymentMethod, PaymentStatus, ShippingProvider, ShippingStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const PERMISSIONS_CATALOG = [
  { code: "dashboard.view", name: "View Admin Dashboard", module: "DASHBOARD" },
  { code: "financials.view", name: "View Financial & Profit Reports", module: "REPORTS" },
  { code: "products.view", name: "View Products", module: "PRODUCTS" },
  { code: "products.create", name: "Create Products", module: "PRODUCTS" },
  { code: "products.edit", name: "Edit Products", module: "PRODUCTS" },
  { code: "products.delete", name: "Delete/Archive Products", module: "PRODUCTS" },
  { code: "products.purchase_price", name: "View/Edit Purchase Price (Cost)", module: "PRODUCTS" },
  { code: "categories.manage", name: "Manage Categories & Subcategories", module: "CATEGORIES" },
  { code: "inventory.view", name: "View Inventory & Stock Movements", module: "INVENTORY" },
  { code: "inventory.adjust", name: "Adjust Stock & Bulk Import/Export", module: "INVENTORY" },
  { code: "orders.view_all", name: "View All Orders", module: "ORDERS" },
  { code: "orders.view_assigned", name: "View Assigned Orders", module: "ORDERS" },
  { code: "orders.confirm", name: "Confirm Pending Orders", module: "ORDERS" },
  { code: "orders.process", name: "Update Order Processing Status", module: "ORDERS" },
  { code: "orders.assign", name: "Assign Orders to Staff/Moderators", module: "ORDERS" },
  { code: "orders.cancel_refund", name: "Cancel Orders & Issue Refunds", module: "ORDERS" },
  { code: "orders.internal_notes", name: "Add/View Internal Order Notes", module: "ORDERS" },
  { code: "invoices.print", name: "Print Order Memos & Download PDF Invoices", module: "INVOICES" },
  { code: "invoices.bulk_print", name: "Bulk Print Order Memos", module: "INVOICES" },
  { code: "delivery.view", name: "View Assigned Delivery Orders", module: "DELIVERY" },
  { code: "delivery.update", name: "Mark Delivered/Returned & Record Cash Collected", module: "DELIVERY" },
  { code: "customers.manage", name: "View & Manage Customers", module: "CUSTOMERS" },
  { code: "staff.manage", name: "Create, Edit & Deactivate Staff", module: "STAFF" },
  { code: "roles.manage", name: "Create Custom Roles & Assign Granular Permissions", module: "ROLES" },
  { code: "coupons.manage", name: "Manage Coupons & Promotions", module: "COUPONS" },
  { code: "payments.verify", name: "Verify Manual Bank/bKash/Nagad Payments", module: "PAYMENTS" },
  { code: "shipping.manage", name: "Configure Shipping & Courier Dispatch", module: "SHIPPING" },
  { code: "settings.manage", name: "Manage Website Settings & Audit Logs", module: "SETTINGS" },
];

async function main() {
  console.log("Seeding NexusMart Enterprise database...");

  // 1. Seed Permissions
  for (const perm of PERMISSIONS_CATALOG) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: perm,
      create: perm,
    });
  }

  const allPerms = await prisma.permission.findMany();
  const permMap = new Map(allPerms.map((p) => [p.code, p.id]));

  // 2. Seed Default Roles
  const roleDefinitions = [
    {
      name: "Super Admin",
      slug: "SUPER_ADMIN",
      description: "Full unrestricted system access including financials, custom roles, and website settings.",
      isSystem: true,
      perms: PERMISSIONS_CATALOG.map((p) => p.code),
    },
    {
      name: "Admin / Manager",
      slug: "ADMIN_MANAGER",
      description: "Manages products, categories, inventory, orders, customers, and moderator assignments.",
      isSystem: true,
      perms: [
        "dashboard.view", "products.view", "products.create", "products.edit",
        "categories.manage", "inventory.view", "inventory.adjust",
        "orders.view_all", "orders.confirm", "orders.process", "orders.assign",
        "orders.cancel_refund", "orders.internal_notes", "invoices.print",
        "invoices.bulk_print", "customers.manage", "coupons.manage",
        "payments.verify", "shipping.manage",
      ],
    },
    {
      name: "Moderator",
      slug: "MODERATOR",
      description: "Confirms assigned orders, contacts customers, adds internal notes, and prints order memos. Cannot view restricted financial/purchase prices.",
      isSystem: true,
      perms: [
        "dashboard.view", "products.view", "orders.view_assigned",
        "orders.confirm", "orders.process", "orders.internal_notes", "invoices.print",
      ],
    },
    {
      name: "Order Processing Staff",
      slug: "ORDER_PROCESSING",
      description: "Processes confirmed orders, packs items, prints A4/80mm order memos, and updates shipment readiness.",
      isSystem: true,
      perms: [
        "dashboard.view", "orders.view_assigned", "orders.confirm",
        "orders.process", "invoices.print", "invoices.bulk_print",
      ],
    },
    {
      name: "Delivery Staff",
      slug: "DELIVERY_STAFF",
      description: "Views assigned deliveries, accesses recipient address/phone, marks delivered or returned, and records COD cash collected.",
      isSystem: true,
      perms: [
        "dashboard.view", "orders.view_assigned", "delivery.view", "delivery.update",
      ],
    },
    {
      name: "Customer",
      slug: "CUSTOMER",
      description: "Storefront customer account with order placement, wishlist, and order tracking.",
      isSystem: true,
      perms: [],
    },
  ];

  for (const r of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { slug: r.slug },
      update: { name: r.name, description: r.description },
      create: { name: r.name, slug: r.slug, description: r.description, isSystem: r.isSystem },
    });

    for (const code of r.perms) {
      const pid = permMap.get(code);
      if (pid) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: pid } },
          update: {},
          create: { roleId: role.id, permissionId: pid },
        });
      }
    }
  }

  // 3. Seed Website Settings
  await prisma.websiteSettings.upsert({
    where: { id: "default-settings" },
    update: {},
    create: { id: "default-settings" },
  });

  // 4. Seed Default Staff & Customer Accounts
  const passwordHash = await bcrypt.hash("Password123!", 12);
  const superAdminRole = await prisma.role.findUniqueOrThrow({ where: { slug: "SUPER_ADMIN" } });
  const managerRole = await prisma.role.findUniqueOrThrow({ where: { slug: "ADMIN_MANAGER" } });
  const moderatorRole = await prisma.role.findUniqueOrThrow({ where: { slug: "MODERATOR" } });
  const processorRole = await prisma.role.findUniqueOrThrow({ where: { slug: "ORDER_PROCESSING" } });
  const deliveryRole = await prisma.role.findUniqueOrThrow({ where: { slug: "DELIVERY_STAFF" } });

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@nexusmart.com.bd" },
    update: {},
    create: {
      name: "Tanvir Rahman (Super Admin)",
      email: "superadmin@nexusmart.com.bd",
      phone: "+8801711001100",
      passwordHash,
      isStaff: true,
      userRoles: { create: { roleId: superAdminRole.id } },
      staffProfile: {
        create: {
          employeeCode: "STF-001",
          department: "Executive Operations",
          designation: "Chief Systems Architect",
          ordersAssignedCount: 18,
          ordersCompletedCount: 17,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "manager@nexusmart.com.bd" },
    update: {},
    create: {
      name: "Nusrat Jahan (Operations Manager)",
      email: "manager@nexusmart.com.bd",
      phone: "+8801711002200",
      passwordHash,
      isStaff: true,
      userRoles: { create: { roleId: managerRole.id } },
      staffProfile: {
        create: {
          employeeCode: "STF-002",
          department: "Store & Inventory",
          designation: "Senior Operations Manager",
          ordersAssignedCount: 42,
          ordersCompletedCount: 39,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "moderator@nexusmart.com.bd" },
    update: {},
    create: {
      name: "Rafiqul Islam (Order Moderator)",
      email: "moderator@nexusmart.com.bd",
      phone: "+8801711003300",
      passwordHash,
      isStaff: true,
      userRoles: { create: { roleId: moderatorRole.id } },
      staffProfile: {
        create: {
          employeeCode: "STF-003",
          department: "Customer Verification",
          designation: "Order Moderator",
          ordersAssignedCount: 64,
          ordersCompletedCount: 58,
          ordersCancelledCount: 3,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "processor@nexusmart.com.bd" },
    update: {},
    create: {
      name: "Sadia Afrin (Fulfillment Lead)",
      email: "processor@nexusmart.com.bd",
      phone: "+8801711004400",
      passwordHash,
      isStaff: true,
      userRoles: { create: { roleId: processorRole.id } },
      staffProfile: {
        create: {
          employeeCode: "STF-004",
          department: "Warehouse & Packing",
          designation: "Fulfillment Specialist",
          ordersAssignedCount: 51,
          ordersCompletedCount: 49,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "delivery@nexusmart.com.bd" },
    update: {},
    create: {
      name: "Kamrul Hasan (Delivery Rider)",
      email: "delivery@nexusmart.com.bd",
      phone: "+8801711005500",
      passwordHash,
      isStaff: true,
      userRoles: { create: { roleId: deliveryRole.id } },
      staffProfile: {
        create: {
          employeeCode: "STF-005",
          department: "Fleet Logistics",
          designation: "Senior Delivery Executive",
          ordersAssignedCount: 38,
          ordersCompletedCount: 35,
          cashCollectedTotal: 148500,
        },
      },
    },
  });

  console.log("Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
