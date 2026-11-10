"use client";
import React, { useState, useMemo } from "react";
import {
  ShoppingBag,
  ShieldCheck,
  Printer,
  Package,
  Users,
  Settings,
  BarChart3,
  Truck,
  CreditCard,
  Tag,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Search,
  Download,
  Heart,
  ChevronRight,
  X,
  Sun,
  Moon,
  Lock,
  UserCheck,
  ClipboardList,
  RefreshCw,
  MapPin,
  Sparkles,
  DollarSign,
  KeyRound,
  LogOut,
  LogIn,
  Crown,
  TrendingUp,
  ArrowUpRight,
  SlidersHorizontal,
  Star,
  Check,
  Eye,
  Plus,
  FileText,
  Phone,
  Mail,
  ShieldAlert
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "READY_FOR_SHIPMENT"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED"
  | "REFUNDED";

type PaymentMethod =
  | "CASH_ON_DELIVERY"
  | "BKASH"
  | "NAGAD"
  | "SSLCOMMERZ"
  | "STRIPE"
  | "BANK_TRANSFER";

type PaymentStatus =
  | "UNPAID"
  | "PENDING_VERIFICATION"
  | "PAID"
  | "REFUNDED"
  | "FAILED";

type InvoiceLayout = "A4_STANDARD" | "THERMAL_80MM" | "COMPACT_MEMO";
type InvoiceLang = "bilingual" | "en" | "bn";

interface PermissionDef {
  code: string;
  name: string;
  module: string;
}

interface RoleDef {
  id: string;
  name: string;
  slug: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
}

interface StaffUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  employeeCode: string;
  department: string;
  designation: string;
  roleId: string;
  isSuperuser?: boolean;
  directPermissions: string[];
  status: "ACTIVE" | "INACTIVE";
  ordersAssigned: number;
  ordersCompleted: number;
  ordersCancelled: number;
  cashCollected: number;
}

interface CustomerAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
}

interface CategoryItem {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  isActive: boolean;
}

interface ProductVariantItem {
  id: string;
  name: string;
  sku: string;
  priceDelta: number;
  stock: number;
}

interface ProductItem {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  sku: string;
  barcode: string;
  categoryId: string;
  description: string;
  regularPrice: number;
  salePrice: number;
  purchasePrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isFeatured: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  imageGrad: string;
  badgeText?: string;
  variants: ProductVariantItem[];
}

interface InventoryTx {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type:
    | "INITIAL_STOCK"
    | "PURCHASE_RESTOCK"
    | "ORDER_DEDUCTION"
    | "ORDER_CANCEL_RESTORE"
    | "RETURN_RESTORE"
    | "DAMAGE_ADJUSTMENT"
    | "MANUAL_ADJUSTMENT";
  quantityChange: number;
  previousStock: number;
  newStock: number;
  referenceId: string;
  note: string;
  performedBy: string;
  createdAt: string;
}

interface OrderLineItem {
  productId: string;
  productName: string;
  productNameBn: string;
  sku: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  purchasePrice: number;
  totalPrice: number;
}

interface OrderHistoryEntry {
  id: string;
  previousState?: OrderStatus;
  newState: OrderStatus;
  note: string;
  changedBy: string;
  createdAt: string;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryZone: "Inside Dhaka" | "Dhaka Sub-Urban" | "Outside Dhaka";
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  grandTotal: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  senderPhone?: string;
  orderStatus: OrderStatus;
  assignedModeratorId?: string;
  assignedProcessorId?: string;
  assignedDeliveryId?: string;
  courierProvider: "INTERNAL" | "STEADFAST" | "PATHAO" | "REDX";
  trackingNumber?: string;
  cashCollected: number;
  customerNotes?: string;
  internalNotes: string;
  memoPrintCount: number;
  lastPrintedAt?: string;
  lastPrintedBy?: string;
  createdAt: string;
  items: OrderLineItem[];
  history: OrderHistoryEntry[];
}

interface CouponItem {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
}

interface ActivityLogItem {
  id: string;
  staffName: string;
  staffRole: string;
  action: string;
  module: string;
  targetId: string;
  details: string;
  createdAt: string;
}

interface ReviewItem {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const ALL_PERMISSIONS: PermissionDef[] = [
  { code: "dashboard.view", name: "View Admin Dashboard", module: "DASHBOARD" },
  { code: "financials.view", name: "View Financial & Profit Reports", module: "REPORTS" },
  { code: "products.view", name: "View Products", module: "PRODUCTS" },
  { code: "products.create", name: "Create Products", module: "PRODUCTS" },
  { code: "products.edit", name: "Edit Products", module: "PRODUCTS" },
  { code: "products.delete", name: "Delete/Archive Products", module: "PRODUCTS" },
  { code: "products.purchase_price", name: "View/Edit Purchase Cost Price", module: "PRODUCTS" },
  { code: "categories.manage", name: "Manage Categories & Subcategories", module: "CATEGORIES" },
  { code: "inventory.view", name: "View Inventory & Stock Movements", module: "INVENTORY" },
  { code: "inventory.adjust", name: "Adjust Stock & Excel Import/Export", module: "INVENTORY" },
  { code: "orders.view_all", name: "View All Customer Orders", module: "ORDERS" },
  { code: "orders.view_assigned", name: "View Assigned Orders Only", module: "ORDERS" },
  { code: "orders.confirm", name: "Confirm Pending Orders", module: "ORDERS" },
  { code: "orders.process", name: "Update Order Processing Status", module: "ORDERS" },
  { code: "orders.assign", name: "Assign Orders to Staff/Moderators", module: "ORDERS" },
  { code: "orders.cancel_refund", name: "Cancel Orders & Issue Refunds", module: "ORDERS" },
  { code: "orders.internal_notes", name: "Add/View Internal Order Notes", module: "ORDERS" },
  { code: "invoices.print", name: "Print Order Memos & Download PDF", module: "INVOICES" },
  { code: "invoices.bulk_print", name: "Bulk Print Multiple Order Memos", module: "INVOICES" },
  { code: "delivery.view", name: "View Assigned Delivery Orders", module: "DELIVERY" },
  { code: "delivery.update", name: "Mark Delivered/Returned & Record COD", module: "DELIVERY" },
  { code: "customers.manage", name: "View & Manage Customers", module: "CUSTOMERS" },
  { code: "staff.manage", name: "Create, Edit & Deactivate Staff", module: "STAFF" },
  { code: "roles.manage", name: "Create Custom Roles & Permissions", module: "ROLES" },
  { code: "coupons.manage", name: "Manage Coupons & Promotions", module: "COUPONS" },
  { code: "payments.verify", name: "Verify Manual Bank/bKash/Nagad Payments", module: "PAYMENTS" },
  { code: "shipping.manage", name: "Configure Shipping & Courier Dispatch", module: "SHIPPING" },
  { code: "settings.manage", name: "Manage Website Settings & Audit Logs", module: "SETTINGS" }
];

const INITIAL_ROLES: RoleDef[] = [
  {
    id: "role-super-admin",
    name: "Super Admin",
    slug: "SUPER_ADMIN",
    description: "Unrestricted full system access including financials, superuser promotion, custom roles, staff management, and website settings.",
    isSystem: true,
    permissions: ALL_PERMISSIONS.map((p) => p.code)
  },
  {
    id: "role-admin-manager",
    name: "Admin / Manager",
    slug: "ADMIN_MANAGER",
    description: "Manages products, categories, inventory, orders, customers, and moderator assignments.",
    isSystem: true,
    permissions: [
      "dashboard.view",
      "products.view",
      "products.create",
      "products.edit",
      "categories.manage",
      "inventory.view",
      "inventory.adjust",
      "orders.view_all",
      "orders.confirm",
      "orders.process",
      "orders.assign",
      "orders.cancel_refund",
      "orders.internal_notes",
      "invoices.print",
      "invoices.bulk_print",
      "customers.manage",
      "coupons.manage",
      "payments.verify",
      "shipping.manage"
    ]
  },
  {
    id: "role-moderator",
    name: "Moderator",
    slug: "MODERATOR",
    description: "Accesses assigned orders, confirms orders, contacts customers, adds internal notes, and prints order memos. Cannot view restricted financial/purchase prices.",
    isSystem: true,
    permissions: [
      "dashboard.view",
      "products.view",
      "orders.view_assigned",
      "orders.confirm",
      "orders.process",
      "orders.internal_notes",
      "invoices.print"
    ]
  },
  {
    id: "role-processor",
    name: "Order Processing Staff",
    slug: "ORDER_PROCESSING",
    description: "Views assigned orders, confirms and processes fulfillment, prints A4/80mm order memos, and updates shipment readiness.",
    isSystem: true,
    permissions: [
      "dashboard.view",
      "orders.view_assigned",
      "orders.confirm",
      "orders.process",
      "invoices.print",
      "invoices.bulk_print"
    ]
  },
  {
    id: "role-delivery",
    name: "Delivery Staff",
    slug: "DELIVERY_STAFF",
    description: "Views assigned delivery orders, accesses customer delivery address & phone, marks delivered/returned, and records cash collected.",
    isSystem: true,
    permissions: [
      "dashboard.view",
      "orders.view_assigned",
      "delivery.view",
      "delivery.update"
    ]
  }
];

const INITIAL_STAFF: StaffUser[] = [
  {
    id: "stf-1",
    name: "Tanvir Rahman",
    email: "superadmin@nexusmart.com.bd",
    phone: "+8801711001100",
    password: "Password123!",
    employeeCode: "STF-001",
    department: "Executive Operations",
    designation: "Superuser & Chief Systems Architect",
    roleId: "role-super-admin",
    isSuperuser: true,
    directPermissions: [],
    status: "ACTIVE",
    ordersAssigned: 22,
    ordersCompleted: 21,
    ordersCancelled: 1,
    cashCollected: 0
  },
  {
    id: "stf-2",
    name: "Nusrat Jahan",
    email: "manager@nexusmart.com.bd",
    phone: "+8801711002200",
    password: "Password123!",
    employeeCode: "STF-002",
    department: "Catalog & Operations",
    designation: "Senior Operations Manager",
    roleId: "role-admin-manager",
    isSuperuser: false,
    directPermissions: [],
    status: "ACTIVE",
    ordersAssigned: 45,
    ordersCompleted: 42,
    ordersCancelled: 2,
    cashCollected: 0
  },
  {
    id: "stf-3",
    name: "Rafiqul Islam",
    email: "moderator@nexusmart.com.bd",
    phone: "+8801711003300",
    password: "Password123!",
    employeeCode: "STF-003",
    department: "Customer Verification",
    designation: "Lead Order Moderator",
    roleId: "role-moderator",
    isSuperuser: false,
    directPermissions: [],
    status: "ACTIVE",
    ordersAssigned: 68,
    ordersCompleted: 62,
    ordersCancelled: 4,
    cashCollected: 0
  },
  {
    id: "stf-4",
    name: "Sadia Afrin",
    email: "processor@nexusmart.com.bd",
    phone: "+8801711004400",
    password: "Password123!",
    employeeCode: "STF-004",
    department: "Warehouse & Packing",
    designation: "Order Processing Specialist",
    roleId: "role-processor",
    isSuperuser: false,
    directPermissions: [],
    status: "ACTIVE",
    ordersAssigned: 54,
    ordersCompleted: 51,
    ordersCancelled: 1,
    cashCollected: 0
  },
  {
    id: "stf-5",
    name: "Kamrul Hasan",
    email: "delivery@nexusmart.com.bd",
    phone: "+8801711005500",
    password: "Password123!",
    employeeCode: "STF-005",
    department: "Fleet Logistics",
    designation: "Senior Delivery Executive",
    roleId: "role-delivery",
    isSuperuser: false,
    directPermissions: [],
    status: "ACTIVE",
    ordersAssigned: 41,
    ordersCompleted: 38,
    ordersCancelled: 2,
    cashCollected: 164800
  }
];

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: "cat-1", name: "Flagship Electronics", nameBn: "ইলেকট্রনিক্স ও গ্যাজেট", slug: "electronics", isActive: true },
  { id: "cat-2", name: "Smart Watches & Audio", nameBn: "স্মার্ট ওয়াচ ও অডিও", slug: "wearables", isActive: true },
  { id: "cat-3", name: "Executive Apparel", nameBn: "প্রিমিয়াম পোশাক", slug: "apparel", isActive: true },
  { id: "cat-4", name: "Home & Workspace", nameBn: "হোম ও অফিস এক্সেসরিজ", slug: "workspace", isActive: true }
];

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "prd-1",
    name: "AuraPro ANC Wireless Headphones",
    nameBn: "অরাপ্রো এএনসি ওয়্যারলেস হেডফোন",
    slug: "aurapro-anc-wireless-headphones",
    sku: "NX-AUD-101",
    barcode: "8901122334411",
    categoryId: "cat-2",
    description: "Studio-grade 45dB Hybrid Active Noise Cancellation, 60-hour battery life, dual-device Bluetooth 5.4 multipoint, and spatial audio.",
    regularPrice: 6500,
    salePrice: 5490,
    purchasePrice: 3800,
    stockQuantity: 34,
    lowStockThreshold: 10,
    isFeatured: true,
    isActive: true,
    rating: 4.9,
    reviewCount: 42,
    imageGrad: "from-violet-600 via-indigo-700 to-slate-900",
    badgeText: "BESTSELLER",
    variants: [
      { id: "v-101a", name: "Obsidian Black", sku: "NX-AUD-101-BLK", priceDelta: 0, stock: 20 },
      { id: "v-101b", name: "Titanium Silver", sku: "NX-AUD-101-SLV", priceDelta: 200, stock: 14 }
    ]
  },
  {
    id: "prd-2",
    name: "Chronos Ultra AMOLED Smart Watch",
    nameBn: "ক্রোনোস আল্ট্রা অ্যামোলেড স্মার্ট ওয়াচ",
    slug: "chronos-ultra-amoled-smartwatch",
    sku: "NX-WTC-204",
    barcode: "8901122334428",
    categoryId: "cat-2",
    description: "2.04-inch Retina AMOLED display, titanium alloy bezel, Bluetooth calling, ECG & SpO2 monitoring, IP68 waterproof.",
    regularPrice: 4800,
    salePrice: 3990,
    purchasePrice: 2650,
    stockQuantity: 8,
    lowStockThreshold: 12,
    isFeatured: true,
    isActive: true,
    rating: 4.8,
    reviewCount: 31,
    imageGrad: "from-emerald-500 via-teal-700 to-slate-900",
    badgeText: "LOW STOCK",
    variants: [
      { id: "v-204a", name: "Orange Alpine Loop", sku: "NX-WTC-204-ORG", priceDelta: 0, stock: 5 },
      { id: "v-204b", name: "Midnight Ocean Band", sku: "NX-WTC-204-MID", priceDelta: 0, stock: 3 }
    ]
  },
  {
    id: "prd-3",
    name: "KeyMaster Pro 75% Hot-Swap Mechanical Keyboard",
    nameBn: "কিমাস্টার প্রো ৭৫% মেকানিক্যাল কীবোর্ড",
    slug: "keymaster-pro-75-mechanical-keyboard",
    sku: "NX-KBD-309",
    barcode: "8901122334435",
    categoryId: "cat-4",
    description: "Gasket-mounted CNC aluminum frame, tri-mode wireless (2.4GHz/BT/USB-C), pre-lubed tactile switches, PBT keycaps.",
    regularPrice: 8200,
    salePrice: 7250,
    purchasePrice: 5100,
    stockQuantity: 19,
    lowStockThreshold: 8,
    isFeatured: true,
    isActive: true,
    rating: 4.9,
    reviewCount: 27,
    imageGrad: "from-fuchsia-600 via-purple-800 to-slate-950",
    badgeText: "PRO SERIES",
    variants: [
      { id: "v-309a", name: "Tactile Brown Switch", sku: "NX-KBD-309-BRN", priceDelta: 0, stock: 11 },
      { id: "v-309b", name: "Linear Red Switch", sku: "NX-KBD-309-RED", priceDelta: 0, stock: 8 }
    ]
  },
  {
    id: "prd-4",
    name: "VoltEdge 140W GaN Fast Power Bank (27,650mAh)",
    nameBn: "ভোল্টএজ ১৪০ ওয়াট ফাস্ট পাওয়ার ব্যাংক",
    slug: "voltedge-140w-gan-powerbank",
    sku: "NX-PWR-412",
    barcode: "8901122334442",
    categoryId: "cat-1",
    description: "Airline-safe 99.5Wh capacity, smart OLED wattage telemetry screen, charges MacBook Pro & flagship phones simultaneously.",
    regularPrice: 5900,
    salePrice: 4950,
    purchasePrice: 3400,
    stockQuantity: 6,
    lowStockThreshold: 10,
    isFeatured: false,
    isActive: true,
    rating: 4.7,
    reviewCount: 19,
    imageGrad: "from-amber-500 via-orange-700 to-stone-950",
    badgeText: "140W GAN",
    variants: [
      { id: "v-412a", name: "Space Gray 140W", sku: "NX-PWR-412-GRY", priceDelta: 0, stock: 6 }
    ]
  },
  {
    id: "prd-5",
    name: "Artisan Egyptian Cotton Executive Panjabi",
    nameBn: "আর্টিসান ইজিপশিয়ান কটন প্রিমিয়াম পাঞ্জাবি",
    slug: "artisan-egyptian-cotton-panjabi",
    sku: "NX-APR-501",
    barcode: "8901122334459",
    categoryId: "cat-3",
    description: "Breathable 100% Giza cotton weave with subtle minimal embroidery on collar and cuffs.",
    regularPrice: 3200,
    salePrice: 2690,
    purchasePrice: 1550,
    stockQuantity: 42,
    lowStockThreshold: 10,
    isFeatured: true,
    isActive: true,
    rating: 4.8,
    reviewCount: 53,
    imageGrad: "from-sky-500 via-blue-700 to-slate-950",
    badgeText: "NEW ARRIVAL",
    variants: [
      { id: "v-501m", name: "Size M (40)", sku: "NX-APR-501-M", priceDelta: 0, stock: 14 },
      { id: "v-501l", name: "Size L (42)", sku: "NX-APR-501-L", priceDelta: 0, stock: 18 },
      { id: "v-501xl", name: "Size XL (44)", sku: "NX-APR-501-XL", priceDelta: 0, stock: 10 }
    ]
  },
  {
    id: "prd-6",
    name: "LumiDesk Pro Dual-Bar Monitor Light",
    nameBn: "লুমিডেস্ক প্রো মনিটর লাইট বার",
    slug: "lumidesk-pro-monitor-light",
    sku: "NX-WKS-608",
    barcode: "8901122334466",
    categoryId: "cat-4",
    description: "Asymmetric anti-glare optical design with wireless rotary puck controller, CRI>97 eye-care LEDs.",
    regularPrice: 3600,
    salePrice: 2990,
    purchasePrice: 1900,
    stockQuantity: 25,
    lowStockThreshold: 8,
    isFeatured: false,
    isActive: true,
    rating: 4.6,
    reviewCount: 15,
    imageGrad: "from-rose-500 via-pink-700 to-slate-950",
    badgeText: "EYE CARE",
    variants: [
      { id: "v-608a", name: "Matte Black", sku: "NX-WKS-608-BLK", priceDelta: 0, stock: 25 }
    ]
  }
];

const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: "ord-1001",
    orderNumber: "ORD-20261110-8821",
    customerName: "Mahmudul Hasan",
    customerPhone: "01712345678",
    customerEmail: "mahmudul@example.com",
    deliveryAddress: "Flat 4B, House 19, Road 7, Dhanmondi, Dhaka-1209",
    deliveryZone: "Inside Dhaka",
    subtotal: 9480,
    discountAmount: 500,
    deliveryCharge: 0,
    grandTotal: 8980,
    couponCode: "WELCOME500",
    paymentMethod: "CASH_ON_DELIVERY",
    paymentStatus: "UNPAID",
    orderStatus: "CONFIRMED",
    assignedModeratorId: "stf-3",
    assignedProcessorId: "stf-4",
    assignedDeliveryId: "stf-5",
    courierProvider: "STEADFAST",
    trackingNumber: "STD-9928141",
    cashCollected: 0,
    customerNotes: "Please call before arriving at the gate.",
    internalNotes: "Verified via phone call by Moderator Rafiqul. Ready for packing.",
    memoPrintCount: 2,
    lastPrintedAt: "2026-11-10 10:15 AM",
    lastPrintedBy: "Sadia Afrin",
    createdAt: "2026-11-10 09:30 AM",
    items: [
      {
        productId: "prd-1",
        productName: "AuraPro ANC Wireless Headphones",
        productNameBn: "অরাপ্রো এএনসি ওয়্যারলেস হেডফোন",
        sku: "NX-AUD-101",
        variantName: "Obsidian Black",
        quantity: 1,
        unitPrice: 5490,
        purchasePrice: 3800,
        totalPrice: 5490
      },
      {
        productId: "prd-2",
        productName: "Chronos Ultra AMOLED Smart Watch",
        productNameBn: "ক্রোনোস আল্ট্রা অ্যামোলেড স্মার্ট ওয়াচ",
        sku: "NX-WTC-204",
        variantName: "Orange Alpine Loop",
        quantity: 1,
        unitPrice: 3990,
        purchasePrice: 2650,
        totalPrice: 3990
      }
    ],
    history: [
      {
        id: "h-1",
        newState: "PENDING",
        note: "Order placed via Storefront Checkout",
        changedBy: "Mahmudul Hasan",
        createdAt: "2026-11-10 09:30 AM"
      },
      {
        id: "h-2",
        previousState: "PENDING",
        newState: "CONFIRMED",
        note: "Customer confirmed address and COD readiness over phone.",
        changedBy: "Rafiqul Islam",
        createdAt: "2026-11-10 09:52 AM"
      }
    ]
  },
  {
    id: "ord-1002",
    orderNumber: "ORD-20261110-8822",
    customerName: "Farhana Yasmin",
    customerPhone: "01819876543",
    customerEmail: "farhana.y@example.com",
    deliveryAddress: "Sector 11, Road 14, House 8, Uttara, Dhaka-1230",
    deliveryZone: "Inside Dhaka",
    subtotal: 7250,
    discountAmount: 0,
    deliveryCharge: 0,
    grandTotal: 7250,
    paymentMethod: "BKASH",
    paymentStatus: "PAID",
    transactionId: "BKX984210LM",
    senderPhone: "01819876543",
    orderStatus: "DELIVERED",
    assignedModeratorId: "stf-3",
    assignedProcessorId: "stf-4",
    assignedDeliveryId: "stf-5",
    courierProvider: "PATHAO",
    trackingNumber: "PTH-7741209",
    cashCollected: 0,
    customerNotes: "Leave with security guard if unavailable.",
    internalNotes: "bKash TrxID verified. Delivered on time.",
    memoPrintCount: 1,
    lastPrintedAt: "2026-11-09 03:20 PM",
    lastPrintedBy: "Sadia Afrin",
    createdAt: "2026-11-09 01:10 PM",
    items: [
      {
        productId: "prd-3",
        productName: "KeyMaster Pro 75% Hot-Swap Mechanical Keyboard",
        productNameBn: "কিমাস্টার প্রো ৭৫% মেকানিক্যাল কীবোর্ড",
        sku: "NX-KBD-309",
        variantName: "Tactile Brown Switch",
        quantity: 1,
        unitPrice: 7250,
        purchasePrice: 5100,
        totalPrice: 7250
      }
    ],
    history: [
      {
        id: "h-21",
        newState: "PENDING",
        note: "Order submitted with bKash TrxID BKX984210LM",
        changedBy: "Farhana Yasmin",
        createdAt: "2026-11-09 01:10 PM"
      },
      {
        id: "h-22",
        previousState: "PENDING",
        newState: "DELIVERED",
        note: "Payment verified and parcel delivered via Pathao.",
        changedBy: "Kamrul Hasan",
        createdAt: "2026-11-09 06:45 PM"
      }
    ]
  },
  {
    id: "ord-1003",
    orderNumber: "ORD-20261110-8823",
    customerName: "Tariqul Alam",
    customerPhone: "01911223344",
    customerEmail: "tariqul.ctg@example.com",
    deliveryAddress: "42 Agrabad Commercial Area, Chattogram",
    deliveryZone: "Outside Dhaka",
    subtotal: 5380,
    discountAmount: 0,
    deliveryCharge: 0,
    grandTotal: 5380,
    paymentMethod: "CASH_ON_DELIVERY",
    paymentStatus: "UNPAID",
    orderStatus: "PENDING",
    assignedModeratorId: "stf-3",
    courierProvider: "REDX",
    cashCollected: 0,
    customerNotes: "Deliver during office hours (10 AM - 6 PM).",
    internalNotes: "Awaiting moderator confirmation call.",
    memoPrintCount: 0,
    createdAt: "2026-11-10 11:05 AM",
    items: [
      {
        productId: "prd-5",
        productName: "Artisan Egyptian Cotton Executive Panjabi",
        productNameBn: "আর্টিসান ইজিপশিয়ান কটন প্রিমিয়াম পাঞ্জাবি",
        sku: "NX-APR-501",
        variantName: "Size L (42)",
        quantity: 2,
        unitPrice: 2690,
        purchasePrice: 1550,
        totalPrice: 5380
      }
    ],
    history: [
      {
        id: "h-31",
        newState: "PENDING",
        note: "Order placed via Storefront",
        changedBy: "Tariqul Alam",
        createdAt: "2026-11-10 11:05 AM"
      }
    ]
  },
  {
    id: "ord-1004",
    orderNumber: "ORD-20261110-8824",
    customerName: "Shafiqur Rahman",
    customerPhone: "01615556677",
    customerEmail: "shafiq@example.com",
    deliveryAddress: "House 12, Block C, Bashundhara R/A, Dhaka",
    deliveryZone: "Inside Dhaka",
    subtotal: 4950,
    discountAmount: 0,
    deliveryCharge: 60,
    grandTotal: 5010,
    paymentMethod: "CASH_ON_DELIVERY",
    paymentStatus: "UNPAID",
    orderStatus: "SHIPPED",
    assignedModeratorId: "stf-3",
    assignedProcessorId: "stf-4",
    assignedDeliveryId: "stf-5",
    courierProvider: "INTERNAL",
    trackingNumber: "NXD-550192",
    cashCollected: 0,
    customerNotes: "Urgent delivery requested.",
    internalNotes: "Handed over to delivery rider Kamrul Hasan.",
    memoPrintCount: 1,
    lastPrintedAt: "2026-11-10 10:40 AM",
    lastPrintedBy: "Rafiqul Islam",
    createdAt: "2026-11-10 08:15 AM",
    items: [
      {
        productId: "prd-4",
        productName: "VoltEdge 140W GaN Fast Power Bank (27,650mAh)",
        productNameBn: "ভোল্টএজ ১৪০ ওয়াট ফাস্ট পাওয়ার ব্যাংক",
        sku: "NX-PWR-412",
        variantName: "Space Gray 140W",
        quantity: 1,
        unitPrice: 4950,
        purchasePrice: 3400,
        totalPrice: 4950
      }
    ],
    history: [
      {
        id: "h-41",
        newState: "PENDING",
        note: "Order placed via Storefront",
        changedBy: "Shafiqur Rahman",
        createdAt: "2026-11-10 08:15 AM"
      },
      {
        id: "h-42",
        previousState: "PENDING",
        newState: "SHIPPED",
        note: "Dispatched with internal rider Kamrul Hasan",
        changedBy: "Sadia Afrin",
        createdAt: "2026-11-10 10:45 AM"
      }
    ]
  }
];

const INITIAL_INVENTORY_TX: InventoryTx[] = [
  {
    id: "tx-1",
    productId: "prd-1",
    productName: "AuraPro ANC Wireless Headphones",
    sku: "NX-AUD-101",
    type: "INITIAL_STOCK",
    quantityChange: 35,
    previousStock: 0,
    newStock: 35,
    referenceId: "PO-2026-01",
    note: "Initial warehouse batch import",
    performedBy: "Tanvir Rahman",
    createdAt: "2026-11-08 09:00 AM"
  },
  {
    id: "tx-2",
    productId: "prd-1",
    productName: "AuraPro ANC Wireless Headphones",
    sku: "NX-AUD-101",
    type: "ORDER_DEDUCTION",
    quantityChange: -1,
    previousStock: 35,
    newStock: 34,
    referenceId: "ORD-20261110-8821",
    note: "Reserved for customer order ORD-20261110-8821",
    performedBy: "System Transaction",
    createdAt: "2026-11-10 09:30 AM"
  },
  {
    id: "tx-3",
    productId: "prd-2",
    productName: "Chronos Ultra AMOLED Smart Watch",
    sku: "NX-WTC-204",
    type: "ORDER_DEDUCTION",
    quantityChange: -1,
    previousStock: 9,
    newStock: 8,
    referenceId: "ORD-20261110-8821",
    note: "Low-stock alert triggered (8 remaining < threshold 12)",
    performedBy: "System Transaction",
    createdAt: "2026-11-10 09:30 AM"
  }
];

const INITIAL_COUPONS: CouponItem[] = [
  {
    id: "cpn-1",
    code: "NEXUS15",
    discountType: "PERCENTAGE",
    discountValue: 15,
    minPurchaseAmount: 4000,
    maxDiscountAmount: 1500,
    usedCount: 18,
    expiresAt: "2026-12-31",
    isActive: true
  },
  {
    id: "cpn-2",
    code: "WELCOME500",
    discountType: "FIXED_AMOUNT",
    discountValue: 500,
    minPurchaseAmount: 3000,
    usedCount: 42,
    expiresAt: "2026-12-31",
    isActive: true
  }
];

const INITIAL_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: "log-1",
    staffName: "Sadia Afrin",
    staffRole: "Order Processing Staff",
    action: "ORDER_MEMO_PRINTED",
    module: "INVOICES",
    targetId: "ORD-20261110-8821",
    details: "Printed A4 Bilingual Order Memo (Print #2)",
    createdAt: "2026-11-10 10:15 AM"
  },
  {
    id: "log-2",
    staffName: "Rafiqul Islam",
    staffRole: "Moderator",
    action: "ORDER_STATUS_UPDATED",
    module: "ORDERS",
    targetId: "ORD-20261110-8821",
    details: "Updated status from PENDING to CONFIRMED after phone verification",
    createdAt: "2026-11-10 09:52 AM"
  },
  {
    id: "log-3",
    staffName: "Tanvir Rahman",
    staffRole: "Super Admin",
    action: "SUPERUSER_CONFIGURED",
    module: "ROLES",
    targetId: "SUPER_ADMIN",
    details: "Configured Superuser privileges across all 28 granular permission codes",
    createdAt: "2026-11-10 08:30 AM"
  }
];

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    productId: "prd-1",
    customerName: "Zulkar Nain",
    rating: 5,
    comment: "Incredible ANC performance on flights and super comfortable ear cushions!",
    createdAt: "2026-11-05"
  },
  {
    id: "rev-2",
    productId: "prd-3",
    customerName: "Samia Karim",
    rating: 5,
    comment: "The gasket mount typing feel out of the box is unmatched at this price point.",
    createdAt: "2026-11-07"
  }
];

const REVENUE_CHART_DATA = [
  { day: "04 Nov", revenue: 42500, profit: 14200, orders: 9 },
  { day: "05 Nov", revenue: 58900, profit: 19800, orders: 13 },
  { day: "06 Nov", revenue: 51200, profit: 17100, orders: 11 },
  { day: "07 Nov", revenue: 74800, profit: 25400, orders: 16 },
  { day: "08 Nov", revenue: 68400, profit: 22900, orders: 15 },
  { day: "09 Nov", revenue: 89200, profit: 31200, orders: 19 },
  { day: "10 Nov", revenue: 96400, profit: 33800, orders: 21 }
];

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#0ea5e9", "#ef4444", "#8b5cf6"];

function formatBDT(amount: number): string {
  return `৳${Number(amount || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}

function getStatusBadgeStyle(status: OrderStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
    case "CONFIRMED":
      return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
    case "PROCESSING":
      return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
    case "READY_FOR_SHIPMENT":
      return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
    case "SHIPPED":
      return "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30";
    case "DELIVERED":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    case "CANCELLED":
    case "RETURNED":
    case "REFUNDED":
      return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
    default:
      return "bg-slate-500/15 text-slate-600 border-slate-500/30";
  }
}

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // ==========================================================================
  // STRICT SESSION SEPARATION:
  // - By default, visitors are normal customers ("CUSTOMER") on the Storefront.
  // - Normal users NEVER see the Admin menu, Staff ERP bar, or RBAC switcher.
  // - Only when signed in as Staff / Superuser (`isStaffLoggedIn === true`)
  //   does the Admin Dashboard & Staff Control Bar become visible!
  // ==========================================================================
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState<boolean>(false);
  const [loggedInCustomer, setLoggedInCustomer] = useState<CustomerAccount | null>({
    id: "cust-1",
    name: "Mahmudul Hasan",
    email: "mahmudul@example.com",
    phone: "01712345678",
    loyaltyPoints: 420
  });

  const [portalMode, setPortalMode] = useState<"STOREFRONT" | "ADMIN" | "ARCHITECTURE">(
    "STOREFRONT"
  );
  const [activeStaffId, setActiveStaffId] = useState<string>("stf-1");

  const [storePage, setStorePage] = useState<
    | "HOME"
    | "SHOP"
    | "PRODUCT_DETAIL"
    | "CART"
    | "CHECKOUT"
    | "WISHLIST"
    | "TRACK_ORDER"
    | "CUSTOMER_DASHBOARD"
    | "ABOUT"
    | "CONTACT"
    | "PRIVACY"
    | "TERMS"
    | "AUTH"
  >("HOME");
  const [selectedProductId, setSelectedProductId] = useState<string>("prd-1");
  const [selectedVariantId, setSelectedVariantId] = useState<string>("v-101a");

  // Auth page sub-tabs ("CUSTOMER_LOGIN" | "STAFF_LOGIN" | "SUPERUSER_SETUP")
  const [authMode, setAuthMode] = useState<"CUSTOMER_LOGIN" | "STAFF_LOGIN" | "SUPERUSER_SETUP">(
    "STAFF_LOGIN"
  );
  const [staffLoginEmail, setStaffLoginEmail] = useState<string>("superadmin@nexusmart.com.bd");
  const [staffLoginPassword, setStaffLoginPassword] = useState<string>("Password123!");
  const [customerLoginEmail, setCustomerLoginEmail] = useState<string>("mahmudul@example.com");
  const [customerLoginName, setCustomerLoginName] = useState<string>("Mahmudul Hasan");
  const [customerLoginPhone, setCustomerLoginPhone] = useState<string>("01712345678");

  // Superuser creation / promotion state
  const [superuserForm, setSuperuserForm] = useState({
    name: "",
    email: "",
    phone: "+8801700000000",
    password: "",
    employeeCode: "SU-001"
  });

  const [adminTab, setAdminTab] = useState<
    | "DASHBOARD"
    | "ORDERS"
    | "INVOICES"
    | "PRODUCTS"
    | "CATEGORIES"
    | "INVENTORY"
    | "CUSTOMERS"
    | "STAFF"
    | "ROLES"
    | "ASSIGNMENTS"
    | "PAYMENTS"
    | "SHIPPING"
    | "COUPONS"
    | "REPORTS"
    | "SETTINGS"
  >("DASHBOARD");

  const [roles, setRoles] = useState<RoleDef[]>(INITIAL_ROLES);
  const [staffList, setStaffList] = useState<StaffUser[]>(INITIAL_STAFF);
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<OrderRecord[]>(INITIAL_ORDERS);
  const [inventoryTx, setInventoryTx] = useState<InventoryTx[]>(INITIAL_INVENTORY_TX);
  const [coupons, setCoupons] = useState<CouponItem[]>(INITIAL_COUPONS);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(INITIAL_ACTIVITY_LOGS);
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);

  const [settings, setSettings] = useState({
    companyName: "NexusMart",
    companyNameBn: "নেক্সাসমার্ট এন্টারপ্রাইজ",
    companyAddress: "House 42, Road 11, Banani, Dhaka-1213, Bangladesh",
    companyAddressBn: "বাড়ি ৪২, রোড ১১, বনানী, ঢাকা-১২১৩, বাংলাদেশ",
    companyPhone: "+880 1711-009988",
    companyEmail: "support@nexusmart.com.bd",
    insideDhakaShipping: 60,
    subDhakaShipping: 100,
    outsideDhakaShipping: 130,
    freeShippingThreshold: 5000,
    invoiceTermsEn:
      "Goods once sold can be exchanged within 7 days with original invoice and intact packaging.",
    invoiceTermsBn:
      "পণ্য ক্রয়ের ৭ দিনের মধ্যে মূল মেমো এবং অক্ষত প্যাকেজিং সহ পরিবর্তনযোগ্য।",
    invoiceThankYouEn: "Thank you for shopping with NexusMart Enterprise!",
    invoiceThankYouBn: "নেক্সাসমার্ট এন্টারপ্রাইজ থেকে কেনাকাটার জন্য আপনাকে ধন্যবাদ!",
    promoBannerText:
      "SEASON FINALE: Up to 25% OFF Flagship Audio & Wearables + Free Express Delivery over ৳5,000 — Code: NEXUS15",
    promoBannerActive: true
  });

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(
    null
  );
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const [cart, setCart] = useState<
    Array<{ productId: string; variantId?: string; quantity: number }>
  >([
    { productId: "prd-1", variantId: "v-101a", quantity: 1 },
    { productId: "prd-5", variantId: "v-501l", quantity: 1 }
  ]);
  const [wishlist, setWishlist] = useState<string[]>(["prd-2", "prd-3"]);
  const [appliedCoupon, setAppliedCoupon] = useState<string>("WELCOME500");
  const [couponInput, setCouponInput] = useState<string>("WELCOME500");

  const [storeSearch, setStoreSearch] = useState<string>("");
  const [storeCategory, setStoreCategory] = useState<string>("ALL");
  const [storeSort, setStoreSort] = useState<"FEATURED" | "PRICE_ASC" | "PRICE_DESC" | "RATING">(
    "FEATURED"
  );

  const [checkoutForm, setCheckoutForm] = useState({
    customerName: "Arifuzzaman Chowdhury",
    customerPhone: "01715998877",
    customerEmail: "arif@example.com",
    deliveryAddress: "House 15, Road 4, Sector 3, Uttara, Dhaka",
    deliveryZone: "Inside Dhaka" as "Inside Dhaka" | "Dhaka Sub-Urban" | "Outside Dhaka",
    paymentMethod: "CASH_ON_DELIVERY" as PaymentMethod,
    transactionId: "",
    senderPhone: "",
    customerNotes: "Call before delivery."
  });

  const [trackingQuery, setTrackingQuery] = useState<string>("ORD-20261110-8821");

  const [orderSearch, setOrderSearch] = useState<string>("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>(["ord-1001", "ord-1002"]);
  const [inspectingOrderId, setInspectingOrderId] = useState<string | null>(null);

  const [invoiceLayout, setInvoiceLayout] = useState<InvoiceLayout>("A4_STANDARD");
  const [invoiceLang, setInvoiceLang] = useState<InvoiceLang>("bilingual");
  const [printQueueIds, setPrintQueueIds] = useState<string[]>(["ord-1001"]);

  const [newProductForm, setNewProductForm] = useState({
    name: "",
    nameBn: "",
    sku: "",
    categoryId: "cat-1",
    regularPrice: 3500,
    salePrice: 2990,
    purchasePrice: 2100,
    stockQuantity: 25,
    lowStockThreshold: 8
  });

  const [stockAdjustForm, setStockAdjustForm] = useState({
    productId: "prd-2",
    delta: 15,
    type: "PURCHASE_RESTOCK" as InventoryTx["type"],
    note: "Supplier restock shipment received"
  });

  const [newRoleForm, setNewRoleForm] = useState({
    name: "",
    slug: "",
    description: "",
    permissions: ["dashboard.view", "orders.view_all", "invoices.print"] as string[]
  });

  const [newStaffForm, setNewStaffForm] = useState({
    name: "",
    email: "",
    phone: "",
    employeeCode: "STF-006",
    department: "Operations",
    designation: "Junior Moderator",
    roleId: "role-moderator"
  });

  const [newCouponForm, setNewCouponForm] = useState({
    code: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: 10,
    minPurchaseAmount: 2000,
    expiresAt: "2026-12-31"
  });

  const [newCategoryForm, setNewCategoryForm] = useState({
    name: "",
    nameBn: "",
    slug: ""
  });

  const [newReviewForm, setNewReviewForm] = useState({
    customerName: "Nabil Ahmed",
    rating: 5,
    comment: ""
  });

  const activeStaff = useMemo(
    () => staffList.find((s) => s.id === activeStaffId) || staffList[0],
    [staffList, activeStaffId]
  );

  const activeRole = useMemo(
    () => roles.find((r) => r.id === activeStaff.roleId) || roles[0],
    [roles, activeStaff]
  );

  const activePermissions = useMemo(() => {
    const set = new Set<string>([
      ...(activeRole?.permissions || []),
      ...(activeStaff?.directPermissions || [])
    ]);
    if (activeRole?.slug === "SUPER_ADMIN" || activeStaff?.isSuperuser) {
      ALL_PERMISSIONS.forEach((p) => set.add(p.code));
    }
    return set;
  }, [activeRole, activeStaff]);

  const hasPerm = (code: string | string[]): boolean => {
    if (activeRole?.slug === "SUPER_ADMIN" || activeStaff?.isSuperuser) return true;
    const list = Array.isArray(code) ? code : [code];
    return list.some((c) => activePermissions.has(c));
  };

  const logAction = (action: string, module: string, targetId: string, details: string) => {
    const entry: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      staffName: activeStaff.name,
      staffRole: activeRole.name,
      action,
      module,
      targetId,
      details,
      createdAt: "2026-11-10 04:15 PM"
    };
    setActivityLogs((prev) => [entry, ...prev]);
  };

  // ==========================================================================
  // STAFF LOGIN, CUSTOMER LOGIN & SUPERUSER CREATION HANDLERS
  // ==========================================================================

  const handleStaffLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = staffList.find(
      (s) => s.email.toLowerCase() === staffLoginEmail.trim().toLowerCase()
    );
    if (!matched) {
      showToast("No staff account found with that email. Use Superuser Setup to create one!", "error");
      return;
    }
    if (matched.status !== "ACTIVE") {
      showToast("This staff account is currently deactivated.", "error");
      return;
    }
    setActiveStaffId(matched.id);
    setIsStaffLoggedIn(true);
    setPortalMode("ADMIN");
    setAdminTab("DASHBOARD");
    const r = roles.find((rl) => rl.id === matched.roleId);
    showToast(`Welcome back, ${matched.name}! Logged into ${r?.name} Dashboard.`);
  };

  const handleCreateOrPromoteSuperuser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!superuserForm.name.trim() || !superuserForm.email.trim()) {
      showToast("Please enter both name and email to configure a Superuser.", "error");
      return;
    }
    const existing = staffList.find(
      (s) => s.email.toLowerCase() === superuserForm.email.trim().toLowerCase()
    );
    if (existing) {
      setStaffList((prev) =>
        prev.map((s) =>
          s.id === existing.id
            ? {
                ...s,
                name: superuserForm.name,
                roleId: "role-super-admin",
                isSuperuser: true,
                designation: "Superuser (Owner)"
              }
            : s
        )
      );
      setActiveStaffId(existing.id);
      setIsStaffLoggedIn(true);
      setPortalMode("ADMIN");
      setAdminTab("DASHBOARD");
      showToast(`Promoted ${superuserForm.email} to full Superuser (SUPER_ADMIN)!`);
      return;
    }

    const newSu: StaffUser = {
      id: `stf-su-${Date.now()}`,
      name: superuserForm.name.trim(),
      email: superuserForm.email.trim().toLowerCase(),
      phone: superuserForm.phone || "+8801700000000",
      password: superuserForm.password || "Password123!",
      employeeCode: superuserForm.employeeCode || `SU-${staffList.length + 1}`,
      department: "Executive Board",
      designation: "Superuser / Platform Owner",
      roleId: "role-super-admin",
      isSuperuser: true,
      directPermissions: ALL_PERMISSIONS.map((p) => p.code),
      status: "ACTIVE",
      ordersAssigned: 0,
      ordersCompleted: 0,
      ordersCancelled: 0,
      cashCollected: 0
    };

    setStaffList((prev) => [newSu, ...prev]);
    setActiveStaffId(newSu.id);
    setIsStaffLoggedIn(true);
    setPortalMode("ADMIN");
    setAdminTab("DASHBOARD");
    setSuperuserForm({ name: "", email: "", phone: "+8801700000000", password: "", employeeCode: "SU-002" });
    showToast(`Created Superuser "${newSu.name}" and unlocked Executive Admin Portal!`);
  };

  const handlePromoteStaffToSuperuser = (staffId: string) => {
    if (!hasPerm("roles.manage") && !activeStaff.isSuperuser) {
      showToast("Only an existing Superuser can promote another account to Superuser.", "error");
      return;
    }
    const target = staffList.find((s) => s.id === staffId);
    if (!target) return;
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? {
              ...s,
              roleId: "role-super-admin",
              isSuperuser: true,
              designation: s.designation.includes("Superuser")
                ? s.designation
                : `${s.designation} (Superuser)`
            }
          : s
      )
    );
    logAction(
      "SUPERUSER_GRANTED",
      "STAFF",
      target.employeeCode,
      `Promoted ${target.name} (${target.email}) to Superuser (SUPER_ADMIN)`
    );
    showToast(`${target.name} is now a full Superuser (SUPER_ADMIN)!`);
  };

  const handleStaffLogout = () => {
    setIsStaffLoggedIn(false);
    setPortalMode("STOREFRONT");
    setStorePage("HOME");
    showToast("Signed out of Staff Portal. Viewing as normal Storefront customer.", "info");
  };

  const filteredStoreProducts = useMemo(() => {
    return products
      .filter((p) => p.isActive)
      .filter((p) => (storeCategory === "ALL" ? true : p.categoryId === storeCategory))
      .filter((p) => {
        if (!storeSearch.trim()) return true;
        const q = storeSearch.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.nameBn.includes(q) ||
          p.sku.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (storeSort === "PRICE_ASC") return a.salePrice - b.salePrice;
        if (storeSort === "PRICE_DESC") return b.salePrice - a.salePrice;
        if (storeSort === "RATING") return b.rating - a.rating;
        return Number(b.isFeatured) - Number(a.isFeatured);
      });
  }, [products, storeCategory, storeSearch, storeSort]);

  const cartDetails = useMemo(() => {
    const lines = cart
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        const variant = product.variants.find((v) => v.id === item.variantId);
        const unitPrice = product.salePrice + (variant?.priceDelta || 0);
        return {
          ...item,
          product,
          variant,
          unitPrice,
          totalPrice: unitPrice * item.quantity
        };
      })
      .filter(Boolean) as Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      product: ProductItem;
      variant?: ProductVariantItem;
      unitPrice: number;
      totalPrice: number;
    }>;

    const subtotal = lines.reduce((sum, l) => sum + l.totalPrice, 0);

    let discountAmount = 0;
    const matchedCoupon = coupons.find(
      (c) => c.code.toUpperCase() === appliedCoupon.toUpperCase() && c.isActive
    );
    if (matchedCoupon && subtotal >= matchedCoupon.minPurchaseAmount) {
      if (matchedCoupon.discountType === "PERCENTAGE") {
        discountAmount = Math.round((subtotal * matchedCoupon.discountValue) / 100);
        if (matchedCoupon.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, matchedCoupon.maxDiscountAmount);
        }
      } else {
        discountAmount = matchedCoupon.discountValue;
      }
    }

    let deliveryCharge =
      checkoutForm.deliveryZone === "Inside Dhaka"
        ? settings.insideDhakaShipping
        : checkoutForm.deliveryZone === "Dhaka Sub-Urban"
        ? settings.subDhakaShipping
        : settings.outsideDhakaShipping;

    if (subtotal - discountAmount >= settings.freeShippingThreshold && subtotal > 0) {
      deliveryCharge = 0;
    }
    if (subtotal === 0) deliveryCharge = 0;

    const grandTotal = Math.max(0, subtotal - discountAmount + deliveryCharge);

    return { lines, subtotal, discountAmount, deliveryCharge, grandTotal, matchedCoupon };
  }, [cart, products, coupons, appliedCoupon, checkoutForm.deliveryZone, settings]);

  const handleAddToCart = (productId: string, variantId?: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (product.stockQuantity <= 0) {
      showToast(`Out of stock: ${product.name}`, "error");
      return;
    }
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.productId === productId && i.variantId === (variantId || product.variants[0]?.id)
      );
      if (existing) {
        if (existing.quantity + 1 > product.stockQuantity) {
          showToast(`Stock limit reached (${product.stockQuantity} available)`, "error");
          return prev;
        }
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId,
          variantId: variantId || product.variants[0]?.id,
          quantity: 1
        }
      ];
    });
    showToast(`Added "${product.name}" to bag!`);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartDetails.lines.length === 0) {
      showToast("Your shopping bag is empty!", "error");
      return;
    }
    if (!checkoutForm.customerName.trim() || !checkoutForm.customerPhone.trim()) {
      showToast("Please provide recipient name and phone number.", "error");
      return;
    }

    for (const line of cartDetails.lines) {
      if (line.quantity > line.product.stockQuantity) {
        showToast(`Insufficient stock for ${line.product.name}`, "error");
        return;
      }
    }

    const newOrderNum = `ORD-20261110-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrderId = `ord-${Date.now()}`;

    const newTxEntries: InventoryTx[] = [];
    setProducts((prev) =>
      prev.map((p) => {
        const line = cartDetails.lines.find((l) => l.productId === p.id);
        if (!line) return p;
        const prevStock = p.stockQuantity;
        const nextStock = prevStock - line.quantity;
        newTxEntries.push({
          id: `tx-${Date.now()}-${p.id}`,
          productId: p.id,
          productName: p.name,
          sku: p.sku,
          type: "ORDER_DEDUCTION",
          quantityChange: -line.quantity,
          previousStock: prevStock,
          newStock: nextStock,
          referenceId: newOrderNum,
          note: `Deducted for checkout order ${newOrderNum}`,
          performedBy: checkoutForm.customerName,
          createdAt: "2026-11-10 04:20 PM"
        });
        return { ...p, stockQuantity: nextStock };
      })
    );
    setInventoryTx((prev) => [...newTxEntries, ...prev]);

    const newOrder: OrderRecord = {
      id: newOrderId,
      orderNumber: newOrderNum,
      customerName: checkoutForm.customerName,
      customerPhone: checkoutForm.customerPhone,
      customerEmail: checkoutForm.customerEmail,
      deliveryAddress: checkoutForm.deliveryAddress,
      deliveryZone: checkoutForm.deliveryZone,
      subtotal: cartDetails.subtotal,
      discountAmount: cartDetails.discountAmount,
      deliveryCharge: cartDetails.deliveryCharge,
      grandTotal: cartDetails.grandTotal,
      couponCode: cartDetails.matchedCoupon?.code,
      paymentMethod: checkoutForm.paymentMethod,
      paymentStatus:
        checkoutForm.paymentMethod === "CASH_ON_DELIVERY"
          ? "UNPAID"
          : checkoutForm.transactionId
          ? "PENDING_VERIFICATION"
          : "UNPAID",
      transactionId: checkoutForm.transactionId || undefined,
      senderPhone: checkoutForm.senderPhone || undefined,
      orderStatus: "PENDING",
      assignedModeratorId: "stf-3",
      courierProvider: "INTERNAL",
      cashCollected: 0,
      customerNotes: checkoutForm.customerNotes,
      internalNotes: "New customer order placed via storefront.",
      memoPrintCount: 0,
      createdAt: "2026-11-10 04:20 PM",
      items: cartDetails.lines.map((l) => ({
        productId: l.product.id,
        productName: l.product.name,
        productNameBn: l.product.nameBn,
        sku: l.product.sku,
        variantName: l.variant?.name,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        purchasePrice: l.product.purchasePrice,
        totalPrice: l.totalPrice
      })),
      history: [
        {
          id: `h-${Date.now()}`,
          newState: "PENDING",
          note: "Order placed by customer via Checkout.",
          changedBy: checkoutForm.customerName,
          createdAt: "2026-11-10 04:20 PM"
        }
      ]
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setTrackingQuery(newOrderNum);
    setStorePage("TRACK_ORDER");
    showToast(`Order ${newOrderNum} placed! Stock reserved & ready for confirmation.`);
  };

  const visibleOrders = useMemo(() => {
    const canSeeAll = hasPerm("orders.view_all");
    return orders
      .filter((o) => {
        if (canSeeAll) return true;
        return (
          o.assignedModeratorId === activeStaff.id ||
          o.assignedProcessorId === activeStaff.id ||
          o.assignedDeliveryId === activeStaff.id
        );
      })
      .filter((o) => (orderStatusFilter === "ALL" ? true : o.orderStatus === orderStatusFilter))
      .filter((o) => {
        if (!orderSearch.trim()) return true;
        const q = orderSearch.toLowerCase();
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q)
        );
      });
  }, [orders, activeStaff, activePermissions, orderStatusFilter, orderSearch]);

  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
    cashCollected?: number
  ) => {
    if (!hasPerm(["orders.confirm", "orders.process", "delivery.update", "orders.cancel_refund"])) {
      showToast("RBAC Forbidden: Your role lacks permission to update order status.", "error");
      return;
    }

    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    if (
      (newStatus === "CANCELLED" || newStatus === "RETURNED") &&
      target.orderStatus !== "CANCELLED" &&
      target.orderStatus !== "RETURNED"
    ) {
      const restoredTx: InventoryTx[] = [];
      setProducts((prev) =>
        prev.map((p) => {
          const item = target.items.find((i) => i.productId === p.id);
          if (!item) return p;
          const prevStock = p.stockQuantity;
          const nextStock = prevStock + item.quantity;
          restoredTx.push({
            id: `tx-restore-${Date.now()}-${p.id}`,
            productId: p.id,
            productName: p.name,
            sku: p.sku,
            type: newStatus === "CANCELLED" ? "ORDER_CANCEL_RESTORE" : "RETURN_RESTORE",
            quantityChange: item.quantity,
            previousStock: prevStock,
            newStock: nextStock,
            referenceId: target.orderNumber,
            note: `Automatic stock restoration on order ${newStatus}`,
            performedBy: activeStaff.name,
            createdAt: "2026-11-10 04:22 PM"
          });
          return { ...p, stockQuantity: nextStock };
        })
      );
      setInventoryTx((prev) => [...restoredTx, ...prev]);
    }

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const nextPaymentStatus: PaymentStatus =
          newStatus === "DELIVERED" && o.paymentMethod === "CASH_ON_DELIVERY"
            ? "PAID"
            : newStatus === "REFUNDED"
            ? "REFUNDED"
            : o.paymentStatus;
        return {
          ...o,
          orderStatus: newStatus,
          paymentStatus: nextPaymentStatus,
          cashCollected: cashCollected !== undefined ? cashCollected : o.cashCollected,
          history: [
            ...o.history,
            {
              id: `h-${Date.now()}`,
              previousState: o.orderStatus,
              newState: newStatus,
              note: note || `Updated to ${newStatus} by ${activeStaff.name}`,
              changedBy: activeStaff.name,
              createdAt: "2026-11-10 04:22 PM"
            }
          ]
        };
      })
    );

    logAction(
      "ORDER_STATUS_UPDATED",
      "ORDERS",
      target.orderNumber,
      `Changed status from ${target.orderStatus} to ${newStatus}`
    );
    showToast(`Order ${target.orderNumber} updated to ${newStatus}`);
  };

  const handleBulkPrintMemos = (orderIdsToPrint: string[]) => {
    if (!isStaffLoggedIn) {
      // Allow customer to print their own order invoice on storefront, or open print dialog
      window.print();
      return;
    }
    if (!hasPerm(["invoices.print", "invoices.bulk_print"])) {
      showToast("RBAC Forbidden: You do not have permission to print order memos.", "error");
      return;
    }
    if (orderIdsToPrint.length === 0) {
      showToast("Select at least one order to print.", "error");
      return;
    }

    setOrders((prev) =>
      prev.map((o) =>
        orderIdsToPrint.includes(o.id)
          ? {
              ...o,
              memoPrintCount: o.memoPrintCount + 1,
              lastPrintedAt: "2026-11-10 04:25 PM",
              lastPrintedBy: activeStaff.name
            }
          : o
      )
    );

    setPrintQueueIds(orderIdsToPrint);
    setPortalMode("ADMIN");
    setAdminTab("INVOICES");
    logAction(
      orderIdsToPrint.length > 1 ? "BULK_MEMO_PRINTED" : "ORDER_MEMO_PRINTED",
      "INVOICES",
      `${orderIdsToPrint.length} order(s)`,
      `Generated printable ${invoiceLayout} memo(s) by ${activeStaff.name}`
    );
    showToast(`Loaded ${orderIdsToPrint.length} order memo(s) into Print Preview!`);
  };

  const handleTriggerBrowserPrint = () => {
    if (!hasPerm(["invoices.print", "invoices.bulk_print"])) {
      showToast("Unauthorized to print invoices.", "error");
      return;
    }
    window.print();
  };

  const handleDownloadInvoiceHtml = () => {
    const queueOrders = orders.filter((o) => printQueueIds.includes(o.id));
    if (queueOrders.length === 0) return;
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Order Memo - ${queueOrders.map((o) => o.orderNumber).join(", ")}</title>
<style>
  body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 24px; color: #0f172a; }
  .memo { border: 1px solid #cbd5e1; padding: 24px; margin-bottom: 32px; max-width: ${
    invoiceLayout === "THERMAL_80MM" ? "300px" : invoiceLayout === "COMPACT_MEMO" ? "520px" : "800px"
  }; margin-left: auto; margin-right: auto; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { border-bottom: 1px solid #e2e8f0; padding: 8px 4px; text-align: left; font-size: 13px; }
  .right { text-align: right; }
</style>
</head>
<body>
${queueOrders
  .map(
    (o) => `
  <div class="memo">
    <h2>${settings.companyName} / ${settings.companyNameBn}</h2>
    <p>${settings.companyAddress}<br/>Hotline: ${settings.companyPhone}</p>
    <hr/>
    <p><strong>Order ID:</strong> ${o.orderNumber} | <strong>Date:</strong> ${o.createdAt}</p>
    <p><strong>Customer:</strong> ${o.customerName} (${o.customerPhone})<br/>
    <strong>Address:</strong> ${o.deliveryAddress}</p>
    <table>
      <thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th class="right">Price</th><th class="right">Total</th></tr></thead>
      <tbody>
        ${o.items
          .map(
            (i) =>
              `<tr><td>${i.productName}<br/><small>${i.productNameBn || ""}</small></td><td>${
                i.sku
              }</td><td>${i.quantity}</td><td class="right">৳${i.unitPrice}</td><td class="right">৳${
                i.totalPrice
              }</td></tr>`
          )
          .join("")}
      </tbody>
    </table>
    <p class="right">Subtotal: ৳${o.subtotal} | Discount: -৳${o.discountAmount} | Delivery: ৳${
      o.deliveryCharge
    }<br/><strong>Grand Total: ৳${o.grandTotal} (${o.paymentMethod} - ${o.paymentStatus})</strong></p>
    <hr/>
    <p><small>${settings.invoiceTermsEn}<br/>${settings.invoiceTermsBn}</small></p>
    <p><strong>${settings.invoiceThankYouEn} / ${settings.invoiceThankYouBn}</strong></p>
  </div>`
  )
  .join("")}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexusmart-invoice-${queueOrders[0].orderNumber}.html`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded printable Invoice file!");
  };

  const handleExportProductsCsv = () => {
    if (!hasPerm("inventory.view")) {
      showToast("RBAC Forbidden: Cannot export inventory.", "error");
      return;
    }
    const canSeeCost = hasPerm("products.purchase_price");
    const headers = [
      "SKU",
      "Barcode",
      "Name (EN)",
      "Name (BN)",
      "Regular Price",
      "Sale Price",
      ...(canSeeCost ? ["Purchase Cost Price"] : []),
      "Stock Quantity",
      "Low Stock Alert"
    ];
    const rows = products.map((p) => [
      p.sku,
      p.barcode,
      `"${p.name}"`,
      `"${p.nameBn}"`,
      p.regularPrice,
      p.salePrice,
      ...(canSeeCost ? [p.purchasePrice] : []),
      p.stockQuantity,
      p.lowStockThreshold
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexusmart-products-${canSeeCost ? "with-cost" : "masked"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    logAction(
      "PRODUCTS_EXPORTED",
      "INVENTORY",
      "ALL_PRODUCTS",
      `Exported product catalog (${canSeeCost ? "including cost price" : "purchase cost masked by RBAC"})`
    );
    showToast("Exported product & inventory sheet!");
  };

  const kpiMetrics = useMemo(() => {
    const activeOrders = orders.filter(
      (o) => !["CANCELLED", "RETURNED", "REFUNDED"].includes(o.orderStatus)
    );
    const totalRevenue = activeOrders.reduce((s, o) => s + o.grandTotal, 0);
    const totalCost = activeOrders.reduce(
      (s, o) =>
        s + o.items.reduce((is, item) => is + item.purchasePrice * item.quantity, 0),
      0
    );
    const grossProfit = totalRevenue - totalCost;
    const pendingCount = orders.filter((o) => o.orderStatus === "PENDING").length;
    const confirmedCount = orders.filter((o) => o.orderStatus === "CONFIRMED").length;
    const deliveredCount = orders.filter((o) => o.orderStatus === "DELIVERED").length;
    const cancelledCount = orders.filter((o) => o.orderStatus === "CANCELLED").length;
    const lowStockProducts = products.filter((p) => p.stockQuantity <= p.lowStockThreshold);

    const statusPie = [
      { name: "Pending", value: pendingCount || 1 },
      { name: "Confirmed", value: confirmedCount || 1 },
      { name: "Shipped", value: orders.filter((o) => o.orderStatus === "SHIPPED").length || 1 },
      { name: "Delivered", value: deliveredCount || 1 },
      { name: "Cancelled", value: cancelledCount }
    ].filter((s) => s.value > 0);

    return {
      totalRevenue,
      grossProfit,
      pendingCount,
      confirmedCount,
      deliveredCount,
      cancelledCount,
      lowStockProducts,
      statusPie
    };
  }, [orders, products]);

  return (
    <div
      className={
        darkMode
          ? "dark bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-indigo-500 selection:text-white"
          : "bg-[#f8fafc] text-slate-900 min-h-screen font-sans selection:bg-indigo-600 selection:text-white"
      }
    >
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only-area {
            display: block !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .memo-page-break {
            page-break-after: always;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <div className="no-print fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border bg-slate-900/95 backdrop-blur-md text-white border-slate-700/80">
          {toast.type === "error" ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STAFF EXECUTIVE BAR — STRICTLY HIDDEN FROM NORMAL CUSTOMERS!         */}
      {/* Only renders when `isStaffLoggedIn === true`                         */}
      {/* ==================================================================== */}
      {isStaffLoggedIn && (
        <header className="no-print sticky top-0 z-50 bg-slate-950/95 backdrop-blur-xl text-white border-b border-slate-800/80 px-4 py-2.5 shadow-lg">
          <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-base shadow-md shadow-indigo-500/20">
                N
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold tracking-tight text-sm">
                    {settings.companyName} Executive ERP
                  </span>
                  {activeStaff.isSuperuser || activeRole.slug === "SUPER_ADMIN" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
                      <Crown className="w-3 h-3" /> SUPERUSER
                    </span>
                  ) : (
                    <span className="text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-full font-semibold">
                      {activeRole.name}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Signed in as {activeStaff.name} ({activeStaff.email})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setPortalMode("STOREFRONT")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  portalMode === "STOREFRONT"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Customer Storefront
              </button>
              <button
                onClick={() => setPortalMode("ADMIN")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  portalMode === "ADMIN"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin & Staff ERP
              </button>
              <button
                onClick={() => {
                  setPortalMode("ADMIN");
                  setAdminTab("INVOICES");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  portalMode === "ADMIN" && adminTab === "INVOICES"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-emerald-400 hover:text-white"
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                Memo Printer ({printQueueIds.length})
              </button>
              <button
                onClick={() => setPortalMode("ARCHITECTURE")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  portalMode === "ARCHITECTURE"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Schema & Architecture
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1.5 rounded-xl border border-slate-800 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400 hidden xl:inline">Role Simulator:</span>
                <select
                  aria-label="Switch Active Staff Role Session"
                  value={activeStaffId}
                  onChange={(e) => {
                    setActiveStaffId(e.target.value);
                    const chosen = staffList.find((s) => s.id === e.target.value);
                    const r = roles.find((rl) => rl.id === chosen?.roleId);
                    showToast(`Switched staff session to ${chosen?.name} (${r?.name})`, "info");
                  }}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                >
                  {staffList.map((stf) => {
                    const r = roles.find((rl) => rl.id === stf.roleId);
                    return (
                      <option key={stf.id} value={stf.id} className="bg-slate-900 text-white">
                        {stf.name} — [{r?.name}]
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                title="Toggle Dark/Light Theme"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={handleStaffLogout}
                title="Sign Out of Staff Portal"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Staff</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ==================================================================== */}
      {/* PORTAL 1: LUXURY CUSTOMER-FACING STOREFRONT                          */}
      {/* (What normal customers see — clean, modern, zero admin clutter!)     */}
      {/* ==================================================================== */}
      {(portalMode === "STOREFRONT" || !isStaffLoggedIn) && (
        <div className="min-h-screen flex flex-col">
          {/* Announcement Ribbon */}
          {settings.promoBannerActive && (
            <div className="bg-slate-950 text-white text-xs font-medium py-2.5 px-4 text-center border-b border-slate-800">
              <span className="inline-flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-[10px] font-extrabold uppercase tracking-wider">
                  Live Offer
                </span>
                <span className="text-slate-200">{settings.promoBannerText}</span>
              </span>
            </div>
          )}

          {/* Glassmorphic Storefront Header */}
          <nav
            className={`bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3.5 sticky ${
              isStaffLoggedIn ? "top-[53px]" : "top-0"
            } z-30 transition-all`}
          >
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-8">
                <button
                  onClick={() => setStorePage("HOME")}
                  className="flex items-center gap-2.5 text-left group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
                    N
                  </div>
                  <div>
                    <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white bg-clip-text text-transparent">
                      {settings.companyName}
                    </span>
                    <span className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400 -mt-1">
                      Flagship Store
                    </span>
                  </div>
                </button>

                <div className="hidden lg:flex items-center gap-1 text-sm font-semibold">
                  {[
                    { id: "HOME", label: "Home" },
                    { id: "SHOP", label: "Shop Collection" },
                    { id: "TRACK_ORDER", label: "Track Order" },
                    { id: "CUSTOMER_DASHBOARD", label: "My Orders" },
                    { id: "ABOUT", label: "Our Story" },
                    { id: "CONTACT", label: "Showroom" }
                  ].map((nav) => (
                    <button
                      key={nav.id}
                      onClick={() => setStorePage(nav.id as any)}
                      className={`px-3.5 py-2 rounded-xl transition ${
                        storePage === nav.id
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900"
                      }`}
                    >
                      {nav.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={storeSearch}
                    onChange={(e) => {
                      setStoreSearch(e.target.value);
                      if (storePage !== "SHOP") setStorePage("SHOP");
                    }}
                    placeholder="Search headphones, watches..."
                    className="pl-9 pr-4 py-2 text-xs font-medium rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44 sm:w-64 transition"
                  />
                </div>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  title="Toggle Theme"
                  className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300"
                >
                  {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setStorePage("WISHLIST")}
                  className="relative p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900"
                  title="Saved Wishlist"
                >
                  <Heart className="w-4 h-4 text-rose-500" />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setStorePage("CART")}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Bag ({cartDetails.lines.reduce((s, l) => s + l.quantity, 0)})</span>
                  <span className="hidden sm:inline pl-1 border-l border-white/20">
                    {formatBDT(cartDetails.grandTotal)}
                  </span>
                </button>

                {!isStaffLoggedIn ? (
                  <button
                    onClick={() => {
                      setAuthMode("STAFF_LOGIN");
                      setStorePage("AUTH");
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-xs font-bold transition"
                  >
                    <LogIn className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Sign In</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setPortalMode("ADMIN")}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-bold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Staff Dashboard</span>
                  </button>
                )}
              </div>
            </div>
          </nav>

          {/* Storefront Main Content */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
            {/* HOME VIEW */}
            {storePage === "HOME" && (
              <div className="space-y-12">
                {/* Editorial Luxury Hero Bento */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8 rounded-[2rem] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-white/10">
                    <div className="space-y-5 max-w-xl relative z-10">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>2026 Flagship Collection • Official Warranty</span>
                      </div>
                      <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.12]">
                         Crafted for Sound, Speed & Executive Style.
                      </h1>
                      <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                        Experience studio-grade acoustics, titanium wearables, and artisan apparel with instant Dhaka express dispatch and verified authentic warranty.
                      </p>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          onClick={() => setStorePage("SHOP")}
                          className="px-6 py-3.5 rounded-2xl bg-white text-slate-950 hover:bg-indigo-50 font-extrabold text-xs sm:text-sm shadow-xl transition flex items-center gap-2"
                        >
                          <span>Explore Collection</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setStorePage("TRACK_ORDER")}
                          className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/15 backdrop-blur transition"
                        >
                          Track Your Order
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-10 mt-8 border-t border-white/10 relative z-10 text-xs">
                      <div>
                        <div className="font-black text-lg text-white">24h Dispatch</div>
                        <div className="text-slate-400">Inside Dhaka Express</div>
                      </div>
                      <div>
                        <div className="font-black text-lg text-emerald-400">100% Genuine</div>
                        <div className="text-slate-400">Barcode Verified Stock</div>
                      </div>
                      <div>
                        <div className="font-black text-lg text-amber-300">COD & bKash</div>
                        <div className="text-slate-400">Flexible Checkout</div>
                      </div>
                    </div>
                  </div>

                  {/* Side Bento Stack */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    <div
                      onClick={() => {
                        setSelectedProductId("prd-1");
                        setStorePage("PRODUCT_DETAIL");
                      }}
                      className="flex-1 rounded-[2rem] bg-gradient-to-br from-indigo-600 via-violet-700 to-purple-900 text-white p-7 flex flex-col justify-between cursor-pointer hover:scale-[1.01] transition shadow-xl"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider bg-black/30 px-3 py-1 rounded-full">
                          Editor&apos;s Pick
                        </span>
                        <span className="text-sm font-black bg-white text-slate-900 px-3 py-1 rounded-full">
                          Save ৳1,010
                        </span>
                      </div>
                      <div className="my-4">
                        <div className="text-xs text-indigo-200 font-medium">
                          45dB Hybrid ANC • 60H Battery
                        </div>
                        <h3 className="text-2xl font-black tracking-tight mt-1">
                          AuraPro ANC Wireless
                        </h3>
                        <p className="text-xs text-indigo-100 mt-1">
                          অরাপ্রো এএনসি ওয়্যারলেস হেডফোন
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-white/15">
                        <span className="text-xl font-black">{formatBDT(5490)}</span>
                        <span className="text-xs font-bold underline flex items-center gap-1">
                          Shop Now <ArrowUpRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                          Browse by Department
                        </span>
                        <Layers className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {categories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setStoreCategory(cat.id);
                              setStorePage("SHOP");
                            }}
                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-800 text-left transition group"
                          >
                            <div className="font-bold text-xs group-hover:text-indigo-600 transition">
                              {cat.name}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{cat.nameBn}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Curated Products Showcase */}
                <div className="space-y-6">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                        Curated Catalog
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                        Trending Flagship Essentials
                      </h2>
                    </div>
                    <button
                      onClick={() => setStorePage("SHOP")}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold hover:border-indigo-500 transition flex items-center gap-1.5"
                    >
                      <span>View Full Catalog ({products.length})</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                    {products.map((product) => {
                      const discountPct = Math.round(
                        ((product.regularPrice - product.salePrice) / product.regularPrice) * 100
                      );
                      return (
                        <div
                          key={product.id}
                          className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                        >
                          <div
                            onClick={() => {
                              setSelectedProductId(product.id);
                              setSelectedVariantId(product.variants[0]?.id || "");
                              setStorePage("PRODUCT_DETAIL");
                            }}
                            className={`h-52 bg-gradient-to-br ${product.imageGrad} p-6 flex flex-col justify-between text-white relative cursor-pointer`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex gap-1.5">
                                {product.badgeText && (
                                  <span className="text-[10px] font-black uppercase tracking-wider bg-white text-slate-950 px-2.5 py-1 rounded-full shadow">
                                    {product.badgeText}
                                  </span>
                                )}
                                {discountPct > 0 && (
                                  <span className="text-[10px] font-extrabold uppercase bg-emerald-500 text-white px-2.5 py-1 rounded-full">
                                    -{discountPct}%
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setWishlist((prev) =>
                                    prev.includes(product.id)
                                      ? prev.filter((id) => id !== product.id)
                                      : [...prev, product.id]
                                  );
                                }}
                                className="p-2 rounded-full bg-black/25 hover:bg-black/50 backdrop-blur transition"
                              >
                                <Heart
                                  className={`w-4 h-4 ${
                                    wishlist.includes(product.id)
                                      ? "fill-rose-500 text-rose-500"
                                      : "text-white"
                                  }`}
                                />
                              </button>
                            </div>

                            <div>
                              <div className="text-xs text-white/75 font-medium">
                                {product.nameBn}
                              </div>
                              <div className="font-extrabold text-lg leading-snug mt-0.5 group-hover:underline">
                                {product.name}
                              </div>
                            </div>
                          </div>

                          <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-mono text-slate-400">{product.sku}</span>
                                <span className="font-bold text-amber-500 flex items-center gap-1">
                                  ★ {product.rating}{" "}
                                  <span className="text-slate-400 font-normal">
                                    ({product.reviewCount})
                                  </span>
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {product.description}
                              </p>
                            </div>

                            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                              <div className="flex items-baseline justify-between">
                                <div>
                                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                                    {formatBDT(product.salePrice)}
                                  </span>
                                  <span className="text-xs text-slate-400 line-through ml-2">
                                    {formatBDT(product.regularPrice)}
                                  </span>
                                </div>
                                <span
                                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                                    product.stockQuantity <= product.lowStockThreshold
                                      ? "bg-amber-500/15 text-amber-600"
                                      : "bg-emerald-500/15 text-emerald-600"
                                  }`}
                                >
                                  {product.stockQuantity} in stock
                                </span>
                              </div>

                              <div className="flex gap-2.5">
                                <button
                                  onClick={() => {
                                    setSelectedProductId(product.id);
                                    setSelectedVariantId(product.variants[0]?.id || "");
                                    setStorePage("PRODUCT_DETAIL");
                                  }}
                                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                >
                                  Specs
                                </button>
                                <button
                                  onClick={() =>
                                    handleAddToCart(product.id, product.variants[0]?.id)
                                  }
                                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition"
                                >
                                  + Add to Bag
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* SHOP CATALOG VIEW */}
            {storePage === "SHOP" && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setStoreCategory("ALL")}
                      className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
                        storeCategory === "ALL"
                          ? "bg-slate-900 text-white dark:bg-indigo-600"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      All Items ({products.length})
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setStoreCategory(cat.id)}
                        className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
                          storeCategory === cat.id
                            ? "bg-slate-900 text-white dark:bg-indigo-600"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500 font-medium">Sort:</span>
                    <select
                      value={storeSort}
                      onChange={(e) => setStoreSort(e.target.value as any)}
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-transparent px-3.5 py-2 font-bold"
                    >
                      <option value="FEATURED">Featured Collection</option>
                      <option value="PRICE_ASC">Price: Low to High</option>
                      <option value="PRICE_DESC">Price: High to Low</option>
                      <option value="RATING">Top Rated</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
                  {filteredStoreProducts.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col"
                    >
                      <div
                        className={`h-44 bg-gradient-to-br ${product.imageGrad} p-5 text-white flex flex-col justify-between`}
                      >
                        <div className="flex justify-between text-xs">
                          <span className="bg-black/30 px-2.5 py-0.5 rounded-full font-mono">
                            {product.sku}
                          </span>
                          <span className="font-bold">★ {product.rating}</span>
                        </div>
                        <div>
                          <div className="text-xs text-white/80">{product.nameBn}</div>
                          <div className="font-extrabold text-base">{product.name}</div>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-black text-slate-900 dark:text-white">
                            {formatBDT(product.salePrice)}
                          </span>
                          <span className="text-xs font-semibold text-emerald-600">
                            {product.stockQuantity} available
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedProductId(product.id);
                              setSelectedVariantId(product.variants[0]?.id || "");
                              setStorePage("PRODUCT_DETAIL");
                            }}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleAddToCart(product.id, product.variants[0]?.id)}
                            className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold"
                          >
                            Add to Bag
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PRODUCT DETAILS VIEW */}
            {storePage === "PRODUCT_DETAIL" && (() => {
              const product = products.find((p) => p.id === selectedProductId) || products[0];
              const prodReviews = reviews.filter((r) => r.productId === product.id);
              return (
                <div className="space-y-8">
                  <button
                    onClick={() => setStorePage("SHOP")}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    ← Back to Collection
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div
                      className={`h-80 md:h-full min-h-[320px] rounded-3xl bg-gradient-to-br ${product.imageGrad} p-8 text-white flex flex-col justify-between shadow-inner`}
                    >
                      <span className="text-xs uppercase tracking-wider bg-black/30 px-3 py-1 rounded-full w-fit font-mono">
                        SKU: {product.sku} • Barcode: {product.barcode}
                      </span>
                      <div>
                        <p className="text-sm text-white/80 mb-1">{product.nameBn}</p>
                        <h1 className="text-2xl md:text-4xl font-black tracking-tight">
                          {product.name}
                        </h1>
                      </div>
                    </div>

                    <div className="space-y-6 flex flex-col justify-center">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-amber-500 font-bold">
                          <span>★★★★★ {product.rating}</span>
                          <span className="text-slate-400">
                            ({product.reviewCount} verified customer reviews)
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black mt-1">{product.name}</h2>
                        <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                          {formatBDT(product.salePrice)}
                        </span>
                        <span className="text-base text-slate-400 line-through">
                          {formatBDT(product.regularPrice)}
                        </span>
                        <span className="text-xs bg-emerald-500/15 text-emerald-600 px-3 py-1 rounded-full font-bold">
                          {product.stockQuantity} units in warehouse
                        </span>
                      </div>

                      {product.variants.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Choose Option / Variant:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {product.variants.map((v) => (
                              <button
                                key={v.id}
                                onClick={() => setSelectedVariantId(v.id)}
                                className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition ${
                                  selectedVariantId === v.id
                                    ? "border-indigo-600 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400"
                                    : "border-slate-200 dark:border-slate-700"
                                }`}
                              >
                                {v.name} ({v.stock} left)
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleAddToCart(product.id, selectedVariantId)}
                          className="flex-1 py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-indigo-600 dark:bg-indigo-600 text-white font-bold text-sm shadow-lg transition"
                        >
                          Add to Shopping Bag
                        </button>
                        <button
                          onClick={() => {
                            handleAddToCart(product.id, selectedVariantId);
                            setStorePage("CHECKOUT");
                          }}
                          className="py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg transition"
                        >
                          Express Buy Now
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 space-y-5">
                    <h3 className="text-lg font-black">Verified Customer Reviews ({prodReviews.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {prodReviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800"
                        >
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-bold">{rev.customerName}</span>
                            <span className="text-amber-500">{"★".repeat(rev.rating)}</span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300">{rev.comment}</p>
                        </div>
                      ))}
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newReviewForm.comment.trim()) return;
                        setReviews((prev) => [
                          {
                            id: `rev-${Date.now()}`,
                            productId: product.id,
                            customerName: newReviewForm.customerName,
                            rating: newReviewForm.rating,
                            comment: newReviewForm.comment,
                            createdAt: "2026-11-10"
                          },
                          ...prev
                        ]);
                        setNewReviewForm({ ...newReviewForm, comment: "" });
                        showToast("Thank you! Your verified review has been posted.");
                      }}
                      className="flex flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-slate-800"
                    >
                      <input
                        type="text"
                        value={newReviewForm.customerName}
                        onChange={(e) =>
                          setNewReviewForm({ ...newReviewForm, customerName: e.target.value })
                        }
                        placeholder="Your Name"
                        className="px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                      />
                      <select
                        value={newReviewForm.rating}
                        onChange={(e) =>
                          setNewReviewForm({ ...newReviewForm, rating: Number(e.target.value) })
                        }
                        className="px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                      >
                        <option value={5}>5 Stars</option>
                        <option value={4}>4 Stars</option>
                        <option value={3}>3 Stars</option>
                      </select>
                      <input
                        type="text"
                        value={newReviewForm.comment}
                        onChange={(e) =>
                          setNewReviewForm({ ...newReviewForm, comment: e.target.value })
                        }
                        placeholder="Share your experience with this product..."
                        className="flex-1 min-w-[200px] px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                      />
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold"
                      >
                        Submit Review
                      </button>
                    </form>
                  </div>
                </div>
              );
            })()}

            {/* CART & CHECKOUT VIEW */}
            {(storePage === "CART" || storePage === "CHECKOUT") && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                    <h2 className="text-xl font-black">Your Shopping Bag</h2>
                    {cartDetails.lines.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 text-sm">
                        Your shopping bag is currently empty.{" "}
                        <button
                          onClick={() => setStorePage("SHOP")}
                          className="text-indigo-600 font-bold underline"
                        >
                          Explore products
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cartDetails.lines.map((line, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800"
                          >
                            <div>
                              <div className="font-bold text-sm">{line.product.name}</div>
                              <div className="text-xs text-slate-500">
                                SKU: {line.product.sku}{" "}
                                {line.variant ? `• Variant: ${line.variant.name}` : ""}
                              </div>
                              <div className="text-xs font-bold text-indigo-600 mt-1">
                                {formatBDT(line.unitPrice)} each
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={() =>
                                  setCart((prev) =>
                                    prev
                                      .map((item) =>
                                        item.productId === line.productId &&
                                        item.variantId === line.variantId
                                          ? { ...item, quantity: item.quantity - 1 }
                                          : item
                                      )
                                      .filter((item) => item.quantity > 0)
                                  )
                                }
                                className="w-8 h-8 rounded-xl border border-slate-300 dark:border-slate-700 font-bold"
                              >
                                -
                              </button>
                              <span className="text-sm font-black w-6 text-center">
                                {line.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleAddToCart(line.productId, line.variantId)
                                }
                                className="w-8 h-8 rounded-xl border border-slate-300 dark:border-slate-700 font-bold"
                              >
                                +
                              </button>
                              <div className="w-24 text-right font-black text-sm">
                                {formatBDT(line.totalPrice)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Promo Code (e.g. NEXUS15 or WELCOME500)"
                        className="px-4 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent flex-1 font-mono"
                      />
                      <button
                        onClick={() => {
                          setAppliedCoupon(couponInput);
                          showToast(`Applied promo code: ${couponInput}`);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold"
                      >
                        Apply Coupon
                      </button>
                    </div>
                  </div>

                  <form
                    onSubmit={handlePlaceOrder}
                    className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm"
                  >
                    <h3 className="text-lg font-black">Express Checkout & Delivery Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="font-bold block mb-1.5">Recipient Full Name *</label>
                        <input
                          type="text"
                          required
                          value={checkoutForm.customerName}
                          onChange={(e) =>
                            setCheckoutForm({ ...checkoutForm, customerName: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1.5">Mobile Number (BD) *</label>
                        <input
                          type="text"
                          required
                          value={checkoutForm.customerPhone}
                          onChange={(e) =>
                            setCheckoutForm({ ...checkoutForm, customerPhone: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="font-bold block mb-1.5">Full Delivery Address *</label>
                        <input
                          type="text"
                          required
                          value={checkoutForm.deliveryAddress}
                          onChange={(e) =>
                            setCheckoutForm({ ...checkoutForm, deliveryAddress: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1.5">Delivery Area / Zone</label>
                        <select
                          value={checkoutForm.deliveryZone}
                          onChange={(e) =>
                            setCheckoutForm({
                              ...checkoutForm,
                              deliveryZone: e.target.value as any
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                        >
                          <option value="Inside Dhaka">
                            Inside Dhaka ({formatBDT(settings.insideDhakaShipping)})
                          </option>
                          <option value="Dhaka Sub-Urban">
                            Dhaka Sub-Urban ({formatBDT(settings.subDhakaShipping)})
                          </option>
                          <option value="Outside Dhaka">
                            Outside Dhaka ({formatBDT(settings.outsideDhakaShipping)})
                          </option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold block mb-1.5">Payment Method</label>
                        <select
                          value={checkoutForm.paymentMethod}
                          onChange={(e) =>
                            setCheckoutForm({
                              ...checkoutForm,
                              paymentMethod: e.target.value as PaymentMethod
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                        >
                          <option value="CASH_ON_DELIVERY">Cash on Delivery (COD)</option>
                          <option value="BKASH">bKash Merchant Payment</option>
                          <option value="NAGAD">Nagad Merchant Payment</option>
                          <option value="SSLCOMMERZ">SSLCommerz Online Gateway</option>
                          <option value="STRIPE">Stripe International Card</option>
                          <option value="BANK_TRANSFER">Manual Bank Transfer</option>
                        </select>
                      </div>

                      {checkoutForm.paymentMethod !== "CASH_ON_DELIVERY" && (
                        <>
                          <div>
                            <label className="font-bold block mb-1.5">
                              Transaction ID (TrxID / Reference)
                            </label>
                            <input
                              type="text"
                              value={checkoutForm.transactionId}
                              onChange={(e) =>
                                setCheckoutForm({
                                  ...checkoutForm,
                                  transactionId: e.target.value
                                })
                              }
                              placeholder="e.g. BKX9988112"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                            />
                          </div>
                          <div>
                            <label className="font-bold block mb-1.5">Sender Account / Phone</label>
                            <input
                              type="text"
                              value={checkoutForm.senderPhone}
                              onChange={(e) =>
                                setCheckoutForm({ ...checkoutForm, senderPhone: e.target.value })
                              }
                              placeholder="017XXXXXXXX"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-xl transition"
                    >
                      Confirm & Place Order ({formatBDT(cartDetails.grandTotal)})
                    </button>
                  </form>
                </div>

                <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 h-fit space-y-4 text-sm shadow-sm">
                  <h3 className="font-black text-base border-b border-slate-200 dark:border-slate-800 pb-3">
                    Order Summary
                  </h3>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-bold">{formatBDT(cartDetails.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount ({appliedCoupon || "None"})</span>
                    <span>-{formatBDT(cartDetails.discountAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Delivery ({checkoutForm.deliveryZone})
                    </span>
                    <span className="font-bold">{formatBDT(cartDetails.deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black border-t border-slate-200 dark:border-slate-800 pt-3">
                    <span>Grand Total</span>
                    <span className="text-indigo-600">{formatBDT(cartDetails.grandTotal)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* WISHLIST VIEW */}
            {storePage === "WISHLIST" && (
              <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h2 className="text-xl font-black">Saved Wishlist ({wishlist.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {products
                    .filter((p) => wishlist.includes(p.id))
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-sm">{p.name}</div>
                          <div className="text-xs text-slate-500">{p.nameBn}</div>
                          <div className="text-base font-black text-indigo-600 mt-1">
                            {formatBDT(p.salePrice)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddToCart(p.id, p.variants[0]?.id)}
                            className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                          >
                            Move to Bag
                          </button>
                          <button
                            onClick={() =>
                              setWishlist((prev) => prev.filter((id) => id !== p.id))
                            }
                            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ORDER TRACKING & CUSTOMER ORDERS VIEW */}
            {(storePage === "TRACK_ORDER" || storePage === "CUSTOMER_DASHBOARD") && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black">Live Order & Courier Status Tracker</h2>
                      <p className="text-xs text-slate-500">
                        Enter your Order ID or mobile number to inspect real-time fulfillment milestones.
                      </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-80">
                      <input
                        type="text"
                        value={trackingQuery}
                        onChange={(e) => setTrackingQuery(e.target.value)}
                        placeholder="Order ID (e.g. ORD-20261110-8821) or Phone"
                        className="flex-1 px-4 py-2.5 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-transparent font-mono"
                      />
                    </div>
                  </div>

                  {orders
                    .filter(
                      (o) =>
                        o.orderNumber.toLowerCase().includes(trackingQuery.toLowerCase()) ||
                        o.customerPhone.includes(trackingQuery)
                    )
                    .map((ord) => (
                      <div
                        key={ord.id}
                        className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="font-mono font-black text-base text-indigo-600">
                              {ord.orderNumber}
                            </span>
                            <span className="text-xs text-slate-500 ml-3">{ord.createdAt}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadgeStyle(
                                ord.orderStatus
                              )}`}
                            >
                              {ord.orderStatus}
                            </span>
                            <button
                              onClick={() => handleBulkPrintMemos([ord.id])}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-bold"
                            >
                              <Printer className="w-3.5 h-3.5" /> View / Print Invoice
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <div className="text-slate-400 uppercase font-bold">Recipient</div>
                            <div className="font-bold text-sm mt-0.5">{ord.customerName}</div>
                            <div>{ord.customerPhone}</div>
                            <div>{ord.deliveryAddress}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 uppercase font-bold">
                              Courier & Tracking
                            </div>
                            <div className="font-bold text-sm mt-0.5">
                              Provider: {ord.courierProvider}
                            </div>
                            <div>Tracking #: {ord.trackingNumber || "Assigning soon"}</div>
                          </div>
                          <div>
                            <div className="text-slate-400 uppercase font-bold">
                              Payment Summary
                            </div>
                            <div className="font-bold text-sm mt-0.5">
                              Total: {formatBDT(ord.grandTotal)} ({ord.paymentMethod})
                            </div>
                            <div>Status: {ord.paymentStatus}</div>
                          </div>
                        </div>

                        <div className="border-t border-slate-200 dark:border-slate-700 pt-3">
                          <div className="text-xs font-bold mb-2">Fulfillment Timeline:</div>
                          <div className="space-y-1.5">
                            {ord.history.map((h) => (
                              <div key={h.id} className="text-xs flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span className="font-bold">{h.newState}</span>
                                <span className="text-slate-500">— {h.note}</span>
                                <span className="text-slate-400 ml-auto">{h.createdAt}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* UNIFIED AUTHENTICATION & SUPERUSER SETUP PORTAL                */}
            {/* ============================================================== */}
            {storePage === "AUTH" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
                  <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
                    <button
                      onClick={() => setAuthMode("STAFF_LOGIN")}
                      className={`py-4 px-5 flex items-center justify-center gap-2 transition ${
                        authMode === "STAFF_LOGIN"
                          ? "bg-slate-900 text-white dark:bg-indigo-600"
                          : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>1. Staff & Admin Sign In</span>
                    </button>
                    <button
                      onClick={() => setAuthMode("SUPERUSER_SETUP")}
                      className={`py-4 px-5 flex items-center justify-center gap-2 transition ${
                        authMode === "SUPERUSER_SETUP"
                          ? "bg-amber-500 text-slate-950 font-black"
                          : "text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                      }`}
                    >
                      <Crown className="w-4 h-4" />
                      <span>2. Create / Set Superuser</span>
                    </button>
                    <button
                      onClick={() => setAuthMode("CUSTOMER_LOGIN")}
                      className={`py-4 px-5 flex items-center justify-center gap-2 transition ${
                        authMode === "CUSTOMER_LOGIN"
                          ? "bg-slate-900 text-white dark:bg-indigo-600"
                          : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>3. Customer Account</span>
                    </button>
                  </div>

                  <div className="p-8">
                    {authMode === "STAFF_LOGIN" && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <form onSubmit={handleStaffLoginSubmit} className="space-y-4">
                          <div>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600">
                              Protected RBAC Staff Portal
                            </span>
                            <h2 className="text-2xl font-black mt-1">
                              Sign In to Admin & Staff ERP
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                              Normal customers never see the admin menu. Sign in below to unlock the Admin Dashboard for your role.
                            </p>
                          </div>

                          <div className="space-y-3 text-xs">
                            <div>
                              <label className="font-bold block mb-1">Staff Email Address</label>
                              <input
                                type="email"
                                required
                                value={staffLoginEmail}
                                onChange={(e) => setStaffLoginEmail(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-medium"
                              />
                            </div>
                            <div>
                              <label className="font-bold block mb-1">Password</label>
                              <input
                                type="password"
                                required
                                value={staffLoginPassword}
                                onChange={(e) => setStaffLoginPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent font-medium"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg transition"
                          >
                            Unlock Admin & Staff Dashboard →
                          </button>
                        </form>

                        <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                            1-Click Instant Role Login (Pre-Seeded Staff)
                          </div>
                          <p className="text-xs text-slate-500">
                            Click any staff account below to immediately sign in and test that role&apos;s permissions:
                          </p>
                          <div className="space-y-2">
                            {staffList.map((stf) => {
                              const r = roles.find((rl) => rl.id === stf.roleId);
                              return (
                                <button
                                  key={stf.id}
                                  type="button"
                                  onClick={() => {
                                    setActiveStaffId(stf.id);
                                    setIsStaffLoggedIn(true);
                                    setPortalMode("ADMIN");
                                    setAdminTab("DASHBOARD");
                                    showToast(`Signed in as ${stf.name} (${r?.name})`);
                                  }}
                                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 hover:border-indigo-500 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-left text-xs transition"
                                >
                                  <div>
                                    <div className="font-bold flex items-center gap-1.5">
                                      <span>{stf.name}</span>
                                      {(stf.isSuperuser || r?.slug === "SUPER_ADMIN") && (
                                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                                      )}
                                    </div>
                                    <div className="text-[11px] text-slate-400">{stf.email}</div>
                                  </div>
                                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">
                                    {r?.name} →
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {authMode === "SUPERUSER_SETUP" && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <form onSubmit={handleCreateOrPromoteSuperuser} className="space-y-4">
                          <div>
                            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full">
                              <Crown className="w-3.5 h-3.5" /> Superuser Configuration
                            </span>
                            <h2 className="text-2xl font-black mt-2">
                              Create or Promote a Superuser (`SUPER_ADMIN`)
                            </h2>
                            <p className="text-xs text-slate-500 mt-1">
                              Create your own personal Superuser account with full unrestricted access to all 28 permissions, financial reports, custom roles, and staff management.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="sm:col-span-2">
                              <label className="font-bold block mb-1">Your Full Name *</label>
                              <input
                                type="text"
                                required
                                value={superuserForm.name}
                                onChange={(e) =>
                                  setSuperuserForm({ ...superuserForm, name: e.target.value })
                                }
                                placeholder="e.g. Md. Rakibul Islam"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                              />
                            </div>
                            <div>
                              <label className="font-bold block mb-1">Superuser Email *</label>
                              <input
                                type="email"
                                required
                                value={superuserForm.email}
                                onChange={(e) =>
                                  setSuperuserForm({ ...superuserForm, email: e.target.value })
                                }
                                placeholder="owner@yourdomain.com"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                              />
                            </div>
                            <div>
                              <label className="font-bold block mb-1">Phone Number</label>
                              <input
                                type="text"
                                value={superuserForm.phone}
                                onChange={(e) =>
                                  setSuperuserForm({ ...superuserForm, phone: e.target.value })
                                }
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="font-bold block mb-1">Password *</label>
                              <input
                                type="password"
                                required
                                value={superuserForm.password}
                                onChange={(e) =>
                                  setSuperuserForm({ ...superuserForm, password: e.target.value })
                                }
                                placeholder="Enter strong password"
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
                          >
                            <Crown className="w-4 h-4" />
                            <span>Create Superuser & Launch Admin Dashboard</span>
                          </button>
                        </form>

                        <div className="bg-slate-950 text-slate-200 p-6 rounded-2xl border border-slate-800 space-y-4 text-xs">
                          <div className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                            <KeyRound className="w-4 h-4" /> How to Set a Superuser in PostgreSQL / CLI
                          </div>
                          <p className="text-slate-400 leading-relaxed">
                            When running locally with PostgreSQL, you have three ways to set or create a Superuser:
                          </p>
                          <div className="space-y-3">
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                              <div className="font-bold text-white">
                                Way 1: Pre-Seeded Superuser Account
                              </div>
                              <div className="font-mono text-[11px] text-emerald-400 mt-1">
                                Email: superadmin@nexusmart.com.bd
                                <br />
                                Password: Password123!
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                              <div className="font-bold text-white">
                                Way 2: Run the Superuser CLI Command
                              </div>
                              <div className="font-mono text-[11px] text-indigo-300 mt-1">
                                npm run create-superuser -- your@email.com &quot;Your Name&quot; &quot;MyPass123!&quot;
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                              <div className="font-bold text-white">
                                Way 3: Visual Prisma Studio GUI
                              </div>
                              <div className="font-mono text-[11px] text-slate-300 mt-1">
                                Run `npx prisma studio` → open `User` table → set `isStaff = true` and assign `SUPER_ADMIN` in `UserRole`.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {authMode === "CUSTOMER_LOGIN" && (
                      <div className="max-w-md mx-auto space-y-4">
                        <h2 className="text-2xl font-black">Customer Account Sign In</h2>
                        <p className="text-xs text-slate-500">
                          Customers can browse products, place orders, and track deliveries. (Admin menus remain hidden for customer accounts).
                        </p>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            setLoggedInCustomer({
                              id: `cust-${Date.now()}`,
                              name: customerLoginName,
                              email: customerLoginEmail,
                              phone: customerLoginPhone,
                              loyaltyPoints: 500
                            });
                            setIsStaffLoggedIn(false);
                            setPortalMode("STOREFRONT");
                            setStorePage("CUSTOMER_DASHBOARD");
                            showToast(`Signed in as customer ${customerLoginName}`);
                          }}
                          className="space-y-3 text-xs"
                        >
                          <div>
                            <label className="font-bold block mb-1">Full Name</label>
                            <input
                              type="text"
                              required
                              value={customerLoginName}
                              onChange={(e) => setCustomerLoginName(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                            />
                          </div>
                          <div>
                            <label className="font-bold block mb-1">Email</label>
                            <input
                              type="email"
                              required
                              value={customerLoginEmail}
                              onChange={(e) => setCustomerLoginEmail(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                            />
                          </div>
                          <div>
                            <label className="font-bold block mb-1">Mobile Phone</label>
                            <input
                              type="text"
                              required
                              value={customerLoginPhone}
                              onChange={(e) => setCustomerLoginPhone(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-bold"
                          >
                            Continue as Customer
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STATIC INFORMATION PAGES: ABOUT, CONTACT, PRIVACY, TERMS */}
            {(storePage === "ABOUT" ||
              storePage === "CONTACT" ||
              storePage === "PRIVACY" ||
              storePage === "TERMS") && (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-3xl mx-auto space-y-4">
                {storePage === "ABOUT" && (
                  <>
                    <h2 className="text-2xl font-black">About {settings.companyName}</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {settings.companyName} ({settings.companyNameBn}) is a flagship multi-role eCommerce platform engineered with Next.js App Router, Prisma ORM, PostgreSQL, and granular Role-Based Access Control.
                    </p>
                  </>
                )}
                {storePage === "CONTACT" && (
                  <>
                    <h2 className="text-2xl font-black">Showroom & Support</h2>
                    <p className="text-sm text-slate-500">
                      Address: {settings.companyAddress} ({settings.companyAddressBn})
                    </p>
                    <p className="text-sm text-slate-500">
                      Hotline: {settings.companyPhone} | Email: {settings.companyEmail}
                    </p>
                  </>
                )}
                {storePage === "PRIVACY" && (
                  <>
                    <h2 className="text-2xl font-black">Privacy Policy</h2>
                    <p className="text-sm text-slate-500">
                      Customer phone numbers, addresses, and payment transaction references are encrypted, validated via Zod schemas, and restricted strictly to authorized order fulfillment personnel under RBAC audit logging.
                    </p>
                  </>
                )}
                {storePage === "TERMS" && (
                  <>
                    <h2 className="text-2xl font-black">Terms & Conditions</h2>
                    <p className="text-sm text-slate-500">{settings.invoiceTermsEn}</p>
                    <p className="text-sm text-slate-500">{settings.invoiceTermsBn}</p>
                  </>
                )}
              </div>
            )}
          </main>

          {/* Luxury Storefront Footer with subtle Staff Portal Entry Link */}
          <footer className="bg-slate-950 text-slate-400 text-xs py-12 px-4 border-t border-slate-900 mt-16">
            <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-6">
              <div className="space-y-1">
                <div className="text-white font-black text-base">{settings.companyName}</div>
                <p>{settings.companyAddress}</p>
                <p>Hotline: {settings.companyPhone} • {settings.companyEmail}</p>
              </div>
              <div className="flex flex-wrap gap-5 items-center">
                <button onClick={() => setStorePage("ABOUT")} className="hover:text-white">
                  About Us
                </button>
                <button onClick={() => setStorePage("CONTACT")} className="hover:text-white">
                  Contact
                </button>
                <button onClick={() => setStorePage("PRIVACY")} className="hover:text-white">
                  Privacy Policy
                </button>
                <button onClick={() => setStorePage("TERMS")} className="hover:text-white">
                  Terms & Conditions
                </button>
                <button
                  onClick={() => {
                    setAuthMode("STAFF_LOGIN");
                    setStorePage("AUTH");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-800 font-semibold transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Staff & Superuser Portal</span>
                </button>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PORTAL 2: REDESIGNED EXECUTIVE ADMIN & STAFF ERP DASHBOARD           */}
      {/* (Strictly accessible ONLY when `isStaffLoggedIn === true`)           */}
      {/* ==================================================================== */}
      {isStaffLoggedIn && portalMode === "ADMIN" && (
        <div className="max-w-[1440px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
          {/* Sleek Executive Sidebar */}
          <aside className="no-print w-full lg:w-64 shrink-0">
            <div className="bg-slate-950 text-slate-200 rounded-3xl border border-slate-800/90 p-4 space-y-5 shadow-2xl sticky top-[68px]">
              {/* Active Staff Profile Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600/25 via-violet-600/15 to-slate-900 border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                    {activeStaff.employeeCode}
                  </span>
                  {(activeStaff.isSuperuser || activeRole.slug === "SUPER_ADMIN") && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                      <Crown className="w-3 h-3" /> SUPERUSER
                    </span>
                  )}
                </div>
                <div className="font-black text-sm text-white truncate">{activeStaff.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{activeRole.name}</div>
                <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-400 font-semibold border-t border-white/10">
                  <span>Effective Perms</span>
                  <span>{activePermissions.size} / 28</span>
                </div>
              </div>

              {/* Grouped Sidebar Navigation */}
              <nav className="space-y-1 text-xs font-semibold">
                {[
                  { id: "DASHBOARD", label: "Dashboard & KPIs", icon: BarChart3, perm: "dashboard.view" },
                  { id: "ORDERS", label: `Orders (${visibleOrders.length})`, icon: ClipboardList, perm: ["orders.view_all", "orders.view_assigned"] },
                  { id: "INVOICES", label: "Invoice & Memo Printing", icon: Printer, perm: ["invoices.print", "invoices.bulk_print", "orders.view_assigned"] },
                  { id: "PRODUCTS", label: "Products Catalog", icon: Package, perm: "products.view" },
                  { id: "CATEGORIES", label: "Categories", icon: Layers, perm: "categories.manage" },
                  { id: "INVENTORY", label: "Inventory & Ledger", icon: RefreshCw, perm: "inventory.view" },
                  { id: "ASSIGNMENTS", label: "Order Assignments & COD", icon: Truck, perm: ["orders.assign", "delivery.view", "orders.view_assigned"] },
                  { id: "STAFF", label: "Staff & Superuser", icon: Users, perm: "staff.manage" },
                  { id: "ROLES", label: "Roles & Permissions", icon: KeyRound, perm: "roles.manage" },
                  { id: "PAYMENTS", label: "Payments & Gateways", icon: CreditCard, perm: "payments.verify" },
                  { id: "SHIPPING", label: "Shipping & Couriers", icon: MapPin, perm: ["shipping.manage", "delivery.view"] },
                  { id: "COUPONS", label: "Coupons & Banners", icon: Tag, perm: "coupons.manage" },
                  { id: "REPORTS", label: "Financial Reports", icon: DollarSign, perm: "financials.view" },
                  { id: "SETTINGS", label: "Website Settings", icon: Settings, perm: "settings.manage" }
                ].map((item) => {
                  const allowed = hasPerm(item.perm);
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAdminTab(item.id as any)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition ${
                        adminTab === item.id
                          ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 font-bold"
                          : allowed
                          ? "text-slate-300 hover:bg-slate-900 hover:text-white"
                          : "text-slate-600 opacity-55 hover:bg-slate-900"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {!allowed && <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Admin Workspace Content */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* ============================================================== */}
            {/* TAB 1: REDESIGNED EXECUTIVE ADMIN DASHBOARD                    */}
            {/* ============================================================== */}
            {adminTab === "DASHBOARD" && (
              <div className="space-y-6">
                {/* Hero Command Header */}
                <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-7 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-6">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>PostgreSQL & Prisma ORM Connected • Live Telemetry</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                      Executive Command Center — {activeRole.name}
                    </h1>
                    <p className="text-xs text-slate-300 max-w-2xl">
                      All KPIs, purchase cost margins, and order queues below are dynamically scoped to your active role permissions.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => setAdminTab("STAFF")}
                      className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg transition"
                    >
                      <Crown className="w-4 h-4" /> Set / Manage Superusers
                    </button>
                    <button
                      onClick={() => setAdminTab("ORDERS")}
                      className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition"
                    >
                      Manage Orders
                    </button>
                    <button
                      onClick={() => setAdminTab("INVOICES")}
                      className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition"
                    >
                      <Printer className="w-4 h-4" /> Print Order Memos
                    </button>
                  </div>
                </div>

                {/* 4 Luxury KPI Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Total Revenue
                      </span>
                      <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                        <DollarSign className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black mt-3">
                      {hasPerm("financials.view") ? (
                        formatBDT(kpiMetrics.totalRevenue)
                      ) : (
                        <span className="text-sm text-rose-500 flex items-center gap-1.5 py-1">
                          <Lock className="w-4 h-4" /> Restricted by RBAC
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-2">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+18.4% vs last 7 days</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Net Gross Profit
                      </span>
                      <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black mt-3 text-emerald-600">
                      {hasPerm(["financials.view", "products.purchase_price"]) ? (
                        formatBDT(kpiMetrics.grossProfit)
                      ) : (
                        <span className="text-sm text-rose-500 flex items-center gap-1.5 py-1">
                          <Lock className="w-4 h-4" /> Cost Price Masked
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Protected by <code>financials.view</code>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Order Pipeline
                      </span>
                      <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black mt-3">
                      {visibleOrders.length} Orders
                    </div>
                    <div className="text-xs text-amber-600 font-semibold mt-2">
                      {kpiMetrics.pendingCount} Pending • {kpiMetrics.confirmedCount} Confirmed
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Low-Stock Alerts
                      </span>
                      <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black mt-3 text-amber-500">
                      {kpiMetrics.lowStockProducts.length} SKUs
                    </div>
                    <div className="text-xs text-slate-400 mt-2">
                      Across {products.length} active products
                    </div>
                  </div>
                </div>

                {/* Analytics Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-black text-base">7-Day Revenue & Profit Velocity</h3>
                        <p className="text-xs text-slate-500">
                          Real-time financial trajectory across storefront and courier channels
                        </p>
                      </div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={REVENUE_CHART_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                          <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue (BDT)"
                            stroke="#6366f1"
                            strokeWidth={2.5}
                            fill="#6366f1"
                            fillOpacity={0.2}
                          />
                          {hasPerm("financials.view") && (
                            <Area
                              type="monotone"
                              dataKey="profit"
                              name="Net Profit (BDT)"
                              stroke="#10b981"
                              strokeWidth={2.5}
                              fill="#10b981"
                              fillOpacity={0.2}
                            />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <h3 className="font-black text-base mb-1">Order Status Breakdown</h3>
                    <p className="text-xs text-slate-500 mb-3">Live fulfillment distribution</p>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={kpiMetrics.statusPie}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={75}
                            paddingAngle={3}
                            label
                          >
                            {kpiMetrics.statusPie.map((_, idx) => (
                              <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Staff Performance & Low Stock Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <h3 className="font-black text-base mb-3">Staff Order Fulfillment KPIs</h3>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={staffList}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip />
                          <Bar dataKey="ordersAssigned" name="Assigned" fill="#6366f1" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="ordersCompleted" name="Completed" fill="#10b981" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-base">Low-Stock Warehouse Alerts</h3>
                      <button
                        onClick={() => setAdminTab("INVENTORY")}
                        className="text-xs text-indigo-600 font-bold hover:underline"
                      >
                        Restock Ledger →
                      </button>
                    </div>
                    {kpiMetrics.lowStockProducts.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs"
                      >
                        <div>
                          <div className="font-bold text-sm">{p.name}</div>
                          <div className="text-slate-500 font-mono">SKU: {p.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-sm text-amber-600">
                            {p.stockQuantity} left
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Min Threshold: {p.lowStockThreshold}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: ADVANCED ORDER MANAGEMENT                               */}
            {/* ============================================================== */}
            {adminTab === "ORDERS" && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black">Advanced Order Management</h2>
                      <p className="text-xs text-slate-500">
                        {hasPerm("orders.view_all")
                          ? "Showing all platform orders"
                          : `Showing orders assigned to ${activeStaff.name}`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleBulkPrintMemos(selectedOrderIds)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                      >
                        <Printer className="w-4 h-4" />
                        Bulk Print Memos ({selectedOrderIds.length})
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Search by Order Number, Customer Name, or Phone..."
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-transparent"
                      />
                    </div>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="px-3.5 py-2 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-transparent font-bold"
                    >
                      <option value="ALL">All Statuses (9)</option>
                      <option value="PENDING">1. Pending</option>
                      <option value="CONFIRMED">2. Confirmed</option>
                      <option value="PROCESSING">3. Processing</option>
                      <option value="READY_FOR_SHIPMENT">4. Ready for Shipment</option>
                      <option value="SHIPPED">5. Shipped</option>
                      <option value="DELIVERED">6. Delivered</option>
                      <option value="CANCELLED">7. Cancelled</option>
                      <option value="RETURNED">8. Returned</option>
                      <option value="REFUNDED">9. Refunded</option>
                    </select>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase">
                          <th className="py-3 px-2">
                            <input
                              type="checkbox"
                              checked={
                                visibleOrders.length > 0 &&
                                visibleOrders.every((o) => selectedOrderIds.includes(o.id))
                              }
                              onChange={(e) =>
                                setSelectedOrderIds(
                                  e.target.checked ? visibleOrders.map((o) => o.id) : []
                                )
                              }
                            />
                          </th>
                          <th className="py-3 px-2">Order ID & Date</th>
                          <th className="py-3 px-2">Customer & Phone</th>
                          <th className="py-3 px-2">Total & Payment</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2">Assigned Staff</th>
                          <th className="py-3 px-2">Memo Prints</th>
                          <th className="py-3 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {visibleOrders.map((ord) => {
                          const mod = staffList.find((s) => s.id === ord.assignedModeratorId);
                          return (
                            <tr
                              key={ord.id}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                            >
                              <td className="py-3.5 px-2">
                                <input
                                  type="checkbox"
                                  checked={selectedOrderIds.includes(ord.id)}
                                  onChange={(e) =>
                                    setSelectedOrderIds((prev) =>
                                      e.target.checked
                                        ? [...prev, ord.id]
                                        : prev.filter((id) => id !== ord.id)
                                    )
                                  }
                                />
                              </td>
                              <td className="py-3.5 px-2">
                                <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                  {ord.orderNumber}
                                </div>
                                <div className="text-[11px] text-slate-400">{ord.createdAt}</div>
                              </td>
                              <td className="py-3.5 px-2">
                                <div className="font-bold">{ord.customerName}</div>
                                <div className="text-slate-500">{ord.customerPhone}</div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                                  {ord.deliveryAddress}
                                </div>
                              </td>
                              <td className="py-3.5 px-2">
                                <div className="font-black">{formatBDT(ord.grandTotal)}</div>
                                <div className="text-[11px] text-slate-500">
                                  {ord.paymentMethod} ({ord.paymentStatus})
                                </div>
                              </td>
                              <td className="py-3.5 px-2">
                                <select
                                  aria-label={`Change status for ${ord.orderNumber}`}
                                  value={ord.orderStatus}
                                  onChange={(e) =>
                                    handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)
                                  }
                                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadgeStyle(
                                    ord.orderStatus
                                  )} bg-transparent cursor-pointer`}
                                >
                                  <option value="PENDING">PENDING</option>
                                  <option value="CONFIRMED">CONFIRMED</option>
                                  <option value="PROCESSING">PROCESSING</option>
                                  <option value="READY_FOR_SHIPMENT">READY_FOR_SHIPMENT</option>
                                  <option value="SHIPPED">SHIPPED</option>
                                  <option value="DELIVERED">DELIVERED</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                  <option value="RETURNED">RETURNED</option>
                                  <option value="REFUNDED">REFUNDED</option>
                                </select>
                              </td>
                              <td className="py-3.5 px-2">
                                <div className="text-[11px]">
                                  Mod: <span className="font-semibold">{mod?.name || "Unassigned"}</span>
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  Courier: {ord.courierProvider}
                                </div>
                              </td>
                              <td className="py-3.5 px-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
                                  <Printer className="w-3 h-3" /> {ord.memoPrintCount}x
                                </span>
                              </td>
                              <td className="py-3.5 px-2 text-right space-x-1.5">
                                <button
                                  onClick={() => setInspectingOrderId(ord.id)}
                                  className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  Details
                                </button>
                                <button
                                  onClick={() => handleBulkPrintMemos([ord.id])}
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                                >
                                  Print Memo
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {inspectingOrderId && (() => {
                  const ord = orders.find((o) => o.id === inspectingOrderId);
                  if (!ord) return null;
                  return (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-indigo-500/40 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-black">
                            Order Details & Audit History — {ord.orderNumber}
                          </h3>
                          <p className="text-xs text-slate-500">
                            Printed {ord.memoPrintCount} time(s){" "}
                            {ord.lastPrintedBy ? `| Last printed by ${ord.lastPrintedBy}` : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBulkPrintMemos([ord.id])}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" /> Open in Memo Printer
                          </button>
                          <button
                            onClick={() => setInspectingOrderId(null)}
                            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                          <div className="font-bold text-slate-400 uppercase">
                            Internal Staff Notes (RBAC Protected)
                          </div>
                          {hasPerm("orders.internal_notes") ? (
                            <textarea
                              rows={3}
                              value={ord.internalNotes}
                              onChange={(e) => {
                                const val = e.target.value;
                                setOrders((prev) =>
                                  prev.map((o) =>
                                    o.id === ord.id ? { ...o, internalNotes: val } : o
                                  )
                                );
                              }}
                              className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            />
                          ) : (
                            <p className="text-rose-500">
                              Requires orders.internal_notes permission.
                            </p>
                          )}
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                          <div className="font-bold text-slate-400 uppercase">
                            Status Audit Trail
                          </div>
                          {ord.history.map((h) => (
                            <div key={h.id} className="flex justify-between">
                              <span>
                                <strong>{h.newState}</strong> ({h.changedBy}): {h.note}
                              </span>
                              <span className="text-slate-400">{h.createdAt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: PROFESSIONAL ORDER MEMO & INVOICE PRINTING SYSTEM       */}
            {/* ============================================================== */}
            {adminTab === "INVOICES" && (
              <div className="space-y-6">
                <div className="no-print bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                        High-Priority Printing Engine
                      </span>
                      <h2 className="text-xl font-black mt-1">
                        Order Memo & Invoice Printing Center
                      </h2>
                      <p className="text-xs text-slate-500">
                        Supports A4 Corporate Invoice, 80mm POS Thermal Receipt, and Compact Order Memo with Bengali & English typography.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleTriggerBrowserPrint}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow"
                      >
                        <Printer className="w-4 h-4" />
                        Print Now ({printQueueIds.length} Memo{printQueueIds.length > 1 ? "s" : ""})
                      </button>
                      <button
                        onClick={handleDownloadInvoiceHtml}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow"
                      >
                        <Download className="w-4 h-4" />
                        Download Invoice File
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <label className="font-semibold block mb-1.5 text-slate-500">
                        1. Select Print Template Layout:
                      </label>
                      <div className="flex gap-1.5">
                        {(
                          [
                            { id: "A4_STANDARD", label: "A4 Invoice" },
                            { id: "THERMAL_80MM", label: "80mm Thermal" },
                            { id: "COMPACT_MEMO", label: "Compact Memo" }
                          ] as const
                        ).map((tpl) => (
                          <button
                            key={tpl.id}
                            onClick={() => setInvoiceLayout(tpl.id)}
                            className={`flex-1 py-2 px-2.5 rounded-xl font-semibold border ${
                              invoiceLayout === tpl.id
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "border-slate-300 dark:border-slate-700"
                            }`}
                          >
                            {tpl.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold block mb-1.5 text-slate-500">
                        2. Select Memo Language:
                      </label>
                      <div className="flex gap-1.5">
                        {(
                          [
                            { id: "bilingual", label: "Bilingual (EN+বাংলা)" },
                            { id: "en", label: "English" },
                            { id: "bn", label: "বাংলা (Bengali)" }
                          ] as const
                        ).map((lng) => (
                          <button
                            key={lng.id}
                            onClick={() => setInvoiceLang(lng.id)}
                            className={`flex-1 py-2 px-2.5 rounded-xl font-semibold border ${
                              invoiceLang === lng.id
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "border-slate-300 dark:border-slate-700"
                            }`}
                          >
                            {lng.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold block mb-1.5 text-slate-500">
                        3. Select Orders in Bulk Print Queue:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {visibleOrders.map((o) => {
                          const active = printQueueIds.includes(o.id);
                          return (
                            <button
                              key={o.id}
                              onClick={() =>
                                setPrintQueueIds((prev) =>
                                  active
                                    ? prev.length > 1
                                      ? prev.filter((id) => id !== o.id)
                                      : prev
                                    : [...prev, o.id]
                                )
                              }
                              className={`px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-semibold border ${
                                active
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "border-slate-300 dark:border-slate-700"
                              }`}
                            >
                              {o.orderNumber.slice(-4)} ({o.memoPrintCount}x)
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setPrintQueueIds(visibleOrders.map((o) => o.id))}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-200 dark:bg-slate-800"
                        >
                          Select All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="print-only-area space-y-8">
                  {orders
                    .filter((o) => printQueueIds.includes(o.id))
                    .map((order, idx, arr) => {
                      const assignedMod = staffList.find(
                        (s) => s.id === order.assignedModeratorId
                      );
                      return (
                        <div
                          key={order.id}
                          className={`bg-white text-slate-900 rounded-2xl shadow-lg border border-slate-300 mx-auto transition-all ${
                            invoiceLayout === "THERMAL_80MM"
                              ? "max-w-[320px] p-4 font-mono text-[11px]"
                              : invoiceLayout === "COMPACT_MEMO"
                              ? "max-w-[540px] p-6 text-xs"
                              : "max-w-[820px] p-8 text-sm"
                          } ${idx < arr.length - 1 ? "memo-page-break" : ""}`}
                        >
                          <div
                            className={`flex ${
                              invoiceLayout === "THERMAL_80MM"
                                ? "flex-col text-center gap-2"
                                : "justify-between items-start"
                            } border-b-2 border-slate-900 pb-4 mb-4`}
                          >
                            <div className="space-y-0.5">
                              <div className="inline-flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-extrabold flex items-center justify-center text-sm">
                                  N
                                </span>
                                <span className="font-extrabold text-base tracking-tight">
                                  {invoiceLang === "bn"
                                    ? settings.companyNameBn
                                    : invoiceLang === "en"
                                    ? settings.companyName
                                    : `${settings.companyName} | ${settings.companyNameBn}`}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600">
                                {invoiceLang === "bn"
                                  ? settings.companyAddressBn
                                  : settings.companyAddress}
                              </p>
                              <p className="text-xs text-slate-600 font-semibold">
                                Hotline: {settings.companyPhone} | {settings.companyEmail}
                              </p>
                            </div>

                            <div
                              className={
                                invoiceLayout === "THERMAL_80MM"
                                  ? "border-t border-dashed border-slate-400 pt-2"
                                  : "text-right"
                              }
                            >
                              <div className="font-extrabold uppercase tracking-wider text-xs text-indigo-700">
                                {invoiceLayout === "THERMAL_80MM"
                                  ? "80MM POS RECEIPT / ক্যাশ মেমো"
                                  : invoiceLayout === "COMPACT_MEMO"
                                  ? "COMPACT ORDER MEMO / অর্ডার স্লিপ"
                                  : "OFFICIAL TAX INVOICE / অর্ডার মেমো"}
                              </div>
                              <div className="font-mono font-bold text-base">
                                {order.orderNumber}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Date: {order.createdAt}
                              </div>
                              {order.trackingNumber && (
                                <div className="text-[11px] font-mono font-semibold text-slate-700">
                                  Courier: {order.courierProvider} ({order.trackingNumber})
                                </div>
                              )}
                            </div>
                          </div>

                          <div
                            className={`grid ${
                              invoiceLayout === "THERMAL_80MM" ? "grid-cols-1 gap-2" : "grid-cols-2 gap-4"
                            } mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs`}
                          >
                            <div>
                              <div className="font-bold uppercase text-slate-400 text-[10px]">
                                {invoiceLang === "bn"
                                  ? "গ্রাহকের তথ্য (Billed & Shipped To)"
                                  : "Customer & Delivery Info / গ্রাহকের তথ্য"}
                              </div>
                              <div className="font-bold text-slate-900 mt-0.5">
                                {order.customerName}
                              </div>
                              <div className="font-semibold">Phone: {order.customerPhone}</div>
                              <div className="text-slate-700">{order.deliveryAddress}</div>
                              <div className="text-slate-500">Zone: {order.deliveryZone}</div>
                            </div>

                            <div
                              className={
                                invoiceLayout === "THERMAL_80MM"
                                  ? "border-t border-dashed border-slate-300 pt-2"
                                  : "text-right"
                              }
                            >
                              <div className="font-bold uppercase text-slate-400 text-[10px]">
                                Payment & Fulfillment / পেমেন্ট ও স্টাফ
                              </div>
                              <div>
                                Method: <strong>{order.paymentMethod}</strong>
                              </div>
                              <div>
                                Payment Status:{" "}
                                <strong className="uppercase">{order.paymentStatus}</strong>
                              </div>
                              <div>
                                Order Status:{" "}
                                <strong className="uppercase">{order.orderStatus}</strong>
                              </div>
                              <div>
                                Prepared By:{" "}
                                <strong>{assignedMod?.name || activeStaff.name}</strong>
                              </div>
                            </div>
                          </div>

                          <table className="w-full border-collapse mb-4 text-xs">
                            <thead>
                              <tr className="border-b-2 border-slate-900 text-left">
                                <th className="py-1.5">
                                  {invoiceLang === "bn" ? "পণ্যের বিবরণ" : "Product / বিবরণ"}
                                </th>
                                {invoiceLayout !== "THERMAL_80MM" && (
                                  <th className="py-1.5">SKU</th>
                                )}
                                <th className="py-1.5 text-center">Qty</th>
                                <th className="py-1.5 text-right">Unit</th>
                                <th className="py-1.5 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                              {order.items.map((item, i) => (
                                <tr key={i}>
                                  <td className="py-2 pr-2">
                                    {invoiceLang !== "bn" && (
                                      <div className="font-bold text-slate-900">
                                        {item.productName}
                                      </div>
                                    )}
                                    {invoiceLang !== "en" && (
                                      <div className="text-slate-700 font-medium">
                                        {item.productNameBn}
                                      </div>
                                    )}
                                    {item.variantName && (
                                      <div className="text-[11px] text-slate-500">
                                        Variant: {item.variantName}
                                      </div>
                                    )}
                                  </td>
                                  {invoiceLayout !== "THERMAL_80MM" && (
                                    <td className="py-2 font-mono text-[11px]">{item.sku}</td>
                                  )}
                                  <td className="py-2 text-center font-semibold">
                                    {item.quantity}
                                  </td>
                                  <td className="py-2 text-right">
                                    {formatBDT(item.unitPrice)}
                                  </td>
                                  <td className="py-2 text-right font-bold">
                                    {formatBDT(item.totalPrice)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          <div
                            className={`flex ${
                              invoiceLayout === "THERMAL_80MM"
                                ? "flex-col gap-3"
                                : "justify-between items-start gap-6"
                            } border-t border-slate-300 pt-3 mb-4 text-xs`}
                          >
                            <div className="space-y-1 max-w-xs">
                              {order.customerNotes && (
                                <div>
                                  <span className="font-bold">Customer Note: </span>
                                  <span className="text-slate-600">{order.customerNotes}</span>
                                </div>
                              )}
                              <div className="text-[11px] text-slate-500">
                                Print Count: #{order.memoPrintCount + 1} | Verified Order Data
                              </div>
                            </div>

                            <div
                              className={
                                invoiceLayout === "THERMAL_80MM" ? "w-full" : "w-64 shrink-0"
                              }
                            >
                              <div className="flex justify-between py-0.5">
                                <span>Subtotal / উপমোট:</span>
                                <span className="font-semibold">{formatBDT(order.subtotal)}</span>
                              </div>
                              <div className="flex justify-between py-0.5 text-emerald-700">
                                <span>Discount / ছাড়:</span>
                                <span>-{formatBDT(order.discountAmount)}</span>
                              </div>
                              <div className="flex justify-between py-0.5">
                                <span>Delivery / ডেলিভারি চার্জ:</span>
                                <span>{formatBDT(order.deliveryCharge)}</span>
                              </div>
                              <div className="flex justify-between py-1.5 mt-1 border-t-2 border-slate-900 font-extrabold text-sm">
                                <span>Grand Total / সর্বমোট:</span>
                                <span>{formatBDT(order.grandTotal)}</span>
                              </div>
                            </div>
                          </div>

                          {invoiceLayout === "A4_STANDARD" && (
                            <div className="grid grid-cols-2 gap-12 pt-8 pb-4 text-xs text-slate-500">
                              <div className="border-t border-slate-400 pt-1 text-center">
                                Customer Signature / গ্রাহকের স্বাক্ষর
                              </div>
                              <div className="border-t border-slate-400 pt-1 text-center">
                                Authorized Signatory ({activeStaff.name})
                              </div>
                            </div>
                          )}

                          <div className="border-t border-dashed border-slate-300 pt-3 text-center text-[11px] text-slate-600 space-y-1">
                            {invoiceLang !== "bn" && <p>{settings.invoiceTermsEn}</p>}
                            {invoiceLang !== "en" && <p>{settings.invoiceTermsBn}</p>}
                            <p className="font-bold text-slate-900 pt-1">
                              {invoiceLang === "bn"
                                ? settings.invoiceThankYouBn
                                : invoiceLang === "en"
                                ? settings.invoiceThankYouEn
                                : `${settings.invoiceThankYouEn} | ${settings.invoiceThankYouBn}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 4: PRODUCTS CATALOG MANAGEMENT                             */}
            {/* ============================================================== */}
            {adminTab === "PRODUCTS" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black">Product Catalog & SKU Management</h2>
                      <p className="text-xs text-slate-500">
                        Purchase cost prices are strictly protected by the{" "}
                        <code className="font-mono text-indigo-500">products.purchase_price</code>{" "}
                        permission.
                      </p>
                    </div>
                    <button
                      onClick={handleExportProductsCsv}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-bold"
                    >
                      <Download className="w-3.5 h-3.5" /> Export Excel / CSV
                    </button>
                  </div>

                  {hasPerm("products.create") && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newProductForm.name.trim() || !newProductForm.sku.trim()) return;
                        const created: ProductItem = {
                          id: `prd-${Date.now()}`,
                          name: newProductForm.name,
                          nameBn: newProductForm.nameBn || newProductForm.name,
                          slug: newProductForm.name.toLowerCase().replace(/\s+/g, "-"),
                          sku: newProductForm.sku.toUpperCase(),
                          barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                          categoryId: newProductForm.categoryId,
                          description: "Enterprise catalog item with tracked warehouse stock.",
                          regularPrice: Number(newProductForm.regularPrice),
                          salePrice: Number(newProductForm.salePrice),
                          purchasePrice: Number(newProductForm.purchasePrice),
                          stockQuantity: Number(newProductForm.stockQuantity),
                          lowStockThreshold: Number(newProductForm.lowStockThreshold),
                          isFeatured: true,
                          isActive: true,
                          rating: 5.0,
                          reviewCount: 1,
                          imageGrad: "from-indigo-600 to-slate-900",
                          variants: [
                            {
                              id: `v-${Date.now()}`,
                              name: "Standard Edition",
                              sku: `${newProductForm.sku.toUpperCase()}-STD`,
                              priceDelta: 0,
                              stock: Number(newProductForm.stockQuantity)
                            }
                          ]
                        };
                        setProducts((prev) => [created, ...prev]);
                        logAction(
                          "PRODUCT_CREATED",
                          "PRODUCTS",
                          created.sku,
                          `Created product ${created.name} with initial stock ${created.stockQuantity}`
                        );
                        setNewProductForm({ ...newProductForm, name: "", nameBn: "", sku: "" });
                        showToast(`Created product ${created.name} (${created.sku})`);
                      }}
                      className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <input
                        type="text"
                        required
                        value={newProductForm.name}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, name: e.target.value })
                        }
                        placeholder="Product Name (EN)"
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="text"
                        value={newProductForm.nameBn}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, nameBn: e.target.value })
                        }
                        placeholder="নাম (বাংলা)"
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="text"
                        required
                        value={newProductForm.sku}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, sku: e.target.value })
                        }
                        placeholder="SKU (e.g. NX-700)"
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="number"
                        required
                        value={newProductForm.salePrice}
                        onChange={(e) =>
                          setNewProductForm({
                            ...newProductForm,
                            salePrice: Number(e.target.value)
                          })
                        }
                        placeholder="Sale Price"
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="number"
                        required
                        value={newProductForm.stockQuantity}
                        onChange={(e) =>
                          setNewProductForm({
                            ...newProductForm,
                            stockQuantity: Number(e.target.value)
                          })
                        }
                        placeholder="Initial Stock"
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                      >
                        + Add Product
                      </button>
                    </form>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase">
                          <th className="py-2.5 px-2">Product / বাংলা নাম</th>
                          <th className="py-2.5 px-2">SKU & Barcode</th>
                          <th className="py-2.5 px-2">Sale Price</th>
                          <th className="py-2.5 px-2">Purchase Cost (RBAC)</th>
                          <th className="py-2.5 px-2">Stock</th>
                          <th className="py-2.5 px-2 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {products.map((p) => (
                          <tr key={p.id}>
                            <td className="py-3 px-2">
                              <div className="font-bold">{p.name}</div>
                              <div className="text-slate-500">{p.nameBn}</div>
                            </td>
                            <td className="py-3 px-2 font-mono">
                              <div>{p.sku}</div>
                              <div className="text-[10px] text-slate-400">{p.barcode}</div>
                            </td>
                            <td className="py-3 px-2 font-black text-indigo-600">
                              {formatBDT(p.salePrice)}
                            </td>
                            <td className="py-3 px-2">
                              {hasPerm("products.purchase_price") ? (
                                <span className="font-mono font-bold text-emerald-600">
                                  {formatBDT(p.purchasePrice)}
                                </span>
                              ) : (
                                <span className="text-rose-500 flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Restricted
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold ${
                                  p.stockQuantity <= p.lowStockThreshold
                                    ? "bg-amber-500/15 text-amber-600"
                                    : "bg-emerald-500/15 text-emerald-600"
                                }`}
                              >
                                {p.stockQuantity} pcs
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <button
                                onClick={() =>
                                  setProducts((prev) =>
                                    prev.map((item) =>
                                      item.id === p.id
                                        ? { ...item, isActive: !item.isActive }
                                        : item
                                    )
                                  )
                                }
                                className={`px-2.5 py-1 rounded-lg font-semibold ${
                                  p.isActive
                                    ? "bg-emerald-500/15 text-emerald-600"
                                    : "bg-slate-200 text-slate-600"
                                }`}
                              >
                                {p.isActive ? "Active" : "Archived"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CATEGORIES */}
            {adminTab === "CATEGORIES" && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h2 className="text-xl font-black">Product Categories & Bilingual Labels</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newCategoryForm.name.trim()) return;
                    setCategories((prev) => [
                      ...prev,
                      {
                        id: `cat-${Date.now()}`,
                        name: newCategoryForm.name,
                        nameBn: newCategoryForm.nameBn || newCategoryForm.name,
                        slug:
                          newCategoryForm.slug ||
                          newCategoryForm.name.toLowerCase().replace(/\s+/g, "-"),
                        isActive: true
                      }
                    ]);
                    setNewCategoryForm({ name: "", nameBn: "", slug: "" });
                    showToast("Category added!");
                  }}
                  className="flex flex-wrap gap-3 text-xs"
                >
                  <input
                    type="text"
                    value={newCategoryForm.name}
                    onChange={(e) =>
                      setNewCategoryForm({ ...newCategoryForm, name: e.target.value })
                    }
                    placeholder="Category Name (English)"
                    className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                  <input
                    type="text"
                    value={newCategoryForm.nameBn}
                    onChange={(e) =>
                      setNewCategoryForm({ ...newCategoryForm, nameBn: e.target.value })
                    }
                    placeholder="ক্যাটাগরি নাম (বাংলা)"
                    className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                  >
                    + Create Category
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-sm">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.nameBn}</div>
                      </div>
                      <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
                        /{c.slug}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: INVENTORY & STOCK LEDGER */}
            {adminTab === "INVENTORY" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h2 className="text-xl font-black">
                    Atomic Inventory Adjustment & Movement Ledger
                  </h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!hasPerm("inventory.adjust")) {
                        showToast("RBAC Forbidden: Requires inventory.adjust permission.", "error");
                        return;
                      }
                      const target = products.find((p) => p.id === stockAdjustForm.productId);
                      if (!target) return;
                      const prevStock = target.stockQuantity;
                      const nextStock = Math.max(0, prevStock + Number(stockAdjustForm.delta));

                      setProducts((prev) =>
                        prev.map((p) =>
                          p.id === target.id ? { ...p, stockQuantity: nextStock } : p
                        )
                      );

                      const tx: InventoryTx = {
                        id: `tx-${Date.now()}`,
                        productId: target.id,
                        productName: target.name,
                        sku: target.sku,
                        type: stockAdjustForm.type,
                        quantityChange: Number(stockAdjustForm.delta),
                        previousStock: prevStock,
                        newStock: nextStock,
                        referenceId: `ADJ-${Date.now().toString().slice(-4)}`,
                        note: stockAdjustForm.note,
                        performedBy: activeStaff.name,
                        createdAt: "2026-11-10 04:25 PM"
                      };
                      setInventoryTx((prev) => [tx, ...prev]);
                      logAction(
                        "STOCK_ADJUSTED",
                        "INVENTORY",
                        target.sku,
                        `Adjusted ${target.sku} by ${stockAdjustForm.delta} (${prevStock} -> ${nextStock})`
                      );
                      showToast(`Updated ${target.name} stock to ${nextStock} units!`);
                    }}
                    className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <select
                      value={stockAdjustForm.productId}
                      onChange={(e) =>
                        setStockAdjustForm({ ...stockAdjustForm, productId: e.target.value })
                      }
                      className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} — {p.name} ({p.stockQuantity} in stock)
                        </option>
                      ))}
                    </select>
                    <select
                      value={stockAdjustForm.type}
                      onChange={(e) =>
                        setStockAdjustForm({
                          ...stockAdjustForm,
                          type: e.target.value as InventoryTx["type"]
                        })
                      }
                      className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="PURCHASE_RESTOCK">PURCHASE_RESTOCK (+)</option>
                      <option value="MANUAL_ADJUSTMENT">MANUAL_ADJUSTMENT (+/-)</option>
                      <option value="DAMAGE_ADJUSTMENT">DAMAGE_ADJUSTMENT (-)</option>
                    </select>
                    <input
                      type="number"
                      value={stockAdjustForm.delta}
                      onChange={(e) =>
                        setStockAdjustForm({
                          ...stockAdjustForm,
                          delta: Number(e.target.value)
                        })
                      }
                      placeholder="Qty Delta (e.g. 15 or -3)"
                      className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <input
                      type="text"
                      value={stockAdjustForm.note}
                      onChange={(e) =>
                        setStockAdjustForm({ ...stockAdjustForm, note: e.target.value })
                      }
                      placeholder="Reason / PO Reference"
                      className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                    >
                      Record Movement
                    </button>
                  </form>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase">
                          <th className="py-2.5 px-2">Timestamp</th>
                          <th className="py-2.5 px-2">Product & SKU</th>
                          <th className="py-2.5 px-2">Movement Type</th>
                          <th className="py-2.5 px-2">Prev → Delta → New</th>
                          <th className="py-2.5 px-2">Reference & Note</th>
                          <th className="py-2.5 px-2">Staff</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {inventoryTx.map((tx) => (
                          <tr key={tx.id}>
                            <td className="py-2.5 px-2 text-slate-400">{tx.createdAt}</td>
                            <td className="py-2.5 px-2">
                              <div className="font-bold">{tx.productName}</div>
                              <div className="font-mono text-[11px] text-slate-500">{tx.sku}</div>
                            </td>
                            <td className="py-2.5 px-2 font-mono text-[11px]">{tx.type}</td>
                            <td className="py-2.5 px-2 font-mono">
                              {tx.previousStock} →{" "}
                              <span
                                className={
                                  tx.quantityChange >= 0
                                    ? "text-emerald-600 font-bold"
                                    : "text-rose-600 font-bold"
                                }
                              >
                                {tx.quantityChange >= 0
                                  ? `+${tx.quantityChange}`
                                  : tx.quantityChange}
                              </span>{" "}
                              → <strong>{tx.newStock}</strong>
                            </td>
                            <td className="py-2.5 px-2">
                              <span className="font-mono font-semibold">{tx.referenceId}</span>:{" "}
                              {tx.note}
                            </td>
                            <td className="py-2.5 px-2 font-semibold">{tx.performedBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: ORDER ASSIGNMENTS & DELIVERY STAFF COD PORTAL */}
            {adminTab === "ASSIGNMENTS" && (
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h2 className="text-xl font-black">
                  Moderator, Order Processor & Delivery Rider Assignments
                </h2>
                <p className="text-xs text-slate-500">
                  Assign orders to specific staff members and record Cash on Delivery (COD) collections.
                </p>

                <div className="space-y-3">
                  {visibleOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-indigo-600">
                          {ord.orderNumber}
                        </div>
                        <div className="font-bold">{ord.customerName}</div>
                        <div className="text-slate-500">{ord.customerPhone}</div>
                        <div className="text-slate-400">{ord.deliveryAddress}</div>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block">
                          Assigned Moderator:
                        </label>
                        <select
                          disabled={!hasPerm("orders.assign")}
                          value={ord.assignedModeratorId || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOrders((prev) =>
                              prev.map((o) =>
                                o.id === ord.id ? { ...o, assignedModeratorId: val } : o
                              )
                            );
                            showToast(`Assigned moderator for ${ord.orderNumber}`);
                          }}
                          className="w-full mt-1 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                        >
                          {staffList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.employeeCode})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block">
                          Assigned Delivery Rider:
                        </label>
                        <select
                          disabled={!hasPerm("orders.assign")}
                          value={ord.assignedDeliveryId || "stf-5"}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOrders((prev) =>
                              prev.map((o) =>
                                o.id === ord.id ? { ...o, assignedDeliveryId: val } : o
                              )
                            );
                            showToast(`Assigned delivery rider for ${ord.orderNumber}`);
                          }}
                          className="w-full mt-1 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                        >
                          {staffList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.designation})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(
                              ord.id,
                              "DELIVERED",
                              `Delivered & collected COD ${formatBDT(ord.grandTotal)}`,
                              ord.grandTotal
                            )
                          }
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold"
                        >
                          Mark Delivered + Collect {formatBDT(ord.grandTotal)}
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(
                              ord.id,
                              "RETURNED",
                              "Customer unavailable / returned parcel"
                            )
                          }
                          className="px-3 py-1.5 rounded-xl border border-rose-500/40 text-rose-500 font-bold"
                        >
                          Mark Returned (Auto-Restock)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 8: STAFF MANAGEMENT, SUPERUSER PROMOTION & AUDIT LOGS      */}
            {/* ============================================================== */}
            {adminTab === "STAFF" && (
              <div className="space-y-6">
                {/* Dedicated Superuser Setup & Promotion Box */}
                <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 border border-amber-500/30 shadow-xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-3 py-1 rounded-full">
                        <Crown className="w-3.5 h-3.5" /> Superuser (`SUPER_ADMIN`) Management
                      </span>
                      <h2 className="text-xl font-black mt-2">
                        Where to Set or Create a Superuser
                      </h2>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Create a new Superuser account directly below, or click <strong>&quot;Make Superuser&quot;</strong> next to any staff member in the table.
                      </p>
                    </div>
                  </div>

                  {hasPerm("staff.manage") ? (
                    <form
                      onSubmit={handleCreateOrPromoteSuperuser}
                      className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-xs"
                    >
                      <input
                        type="text"
                        required
                        value={superuserForm.name}
                        onChange={(e) =>
                          setSuperuserForm({ ...superuserForm, name: e.target.value })
                        }
                        placeholder="Superuser Full Name"
                        className="px-3.5 py-2.5 rounded-xl border border-white/15 bg-slate-900 text-white"
                      />
                      <input
                        type="email"
                        required
                        value={superuserForm.email}
                        onChange={(e) =>
                          setSuperuserForm({ ...superuserForm, email: e.target.value })
                        }
                        placeholder="Superuser Email"
                        className="px-3.5 py-2.5 rounded-xl border border-white/15 bg-slate-900 text-white"
                      />
                      <input
                        type="text"
                        value={superuserForm.phone}
                        onChange={(e) =>
                          setSuperuserForm({ ...superuserForm, phone: e.target.value })
                        }
                        placeholder="Phone Number"
                        className="px-3.5 py-2.5 rounded-xl border border-white/15 bg-slate-900 text-white"
                      />
                      <input
                        type="password"
                        required
                        value={superuserForm.password}
                        onChange={(e) =>
                          setSuperuserForm({ ...superuserForm, password: e.target.value })
                        }
                        placeholder="Password"
                        className="px-3.5 py-2.5 rounded-xl border border-white/15 bg-slate-900 text-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center justify-center gap-1.5"
                      >
                        <Crown className="w-4 h-4" /> + Create Superuser
                      </button>
                    </form>
                  ) : (
                    <div className="p-3 rounded-xl bg-rose-500/20 text-rose-200 text-xs">
                      Switch to a Super Admin session to create or promote Superusers.
                    </div>
                  )}
                </div>

                {/* Regular Staff Creation & Directory */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h2 className="text-lg font-black">Staff Directory & Role Assignments</h2>
                  {hasPerm("staff.manage") ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newStaffForm.name.trim() || !newStaffForm.email.trim()) return;
                        const created: StaffUser = {
                          id: `stf-${Date.now()}`,
                          name: newStaffForm.name,
                          email: newStaffForm.email,
                          phone: newStaffForm.phone || "+8801700000000",
                          employeeCode: newStaffForm.employeeCode,
                          department: newStaffForm.department,
                          designation: newStaffForm.designation,
                          roleId: newStaffForm.roleId,
                          isSuperuser: newStaffForm.roleId === "role-super-admin",
                          directPermissions: [],
                          status: "ACTIVE",
                          ordersAssigned: 0,
                          ordersCompleted: 0,
                          ordersCancelled: 0,
                          cashCollected: 0
                        };
                        setStaffList((prev) => [...prev, created]);
                        logAction(
                          "STAFF_CREATED",
                          "STAFF",
                          created.employeeCode,
                          `Created staff account for ${created.name}`
                        );
                        setNewStaffForm({ ...newStaffForm, name: "", email: "" });
                        showToast(`Added staff member ${created.name}!`);
                      }}
                      className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs"
                    >
                      <input
                        type="text"
                        required
                        value={newStaffForm.name}
                        onChange={(e) =>
                          setNewStaffForm({ ...newStaffForm, name: e.target.value })
                        }
                        placeholder="Full Name"
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="email"
                        required
                        value={newStaffForm.email}
                        onChange={(e) =>
                          setNewStaffForm({ ...newStaffForm, email: e.target.value })
                        }
                        placeholder="Email Address"
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <input
                        type="text"
                        value={newStaffForm.designation}
                        onChange={(e) =>
                          setNewStaffForm({ ...newStaffForm, designation: e.target.value })
                        }
                        placeholder="Designation"
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                      <select
                        value={newStaffForm.roleId}
                        onChange={(e) =>
                          setNewStaffForm({ ...newStaffForm, roleId: e.target.value })
                        }
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold"
                      >
                        + Create Staff
                      </button>
                    </form>
                  ) : (
                    <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 text-xs">
                      Only Super Admin or staff with <code>staff.manage</code> can add or modify staff accounts.
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase">
                          <th className="py-2.5 px-2">Staff Member</th>
                          <th className="py-2.5 px-2">Role & Superuser Status</th>
                          <th className="py-2.5 px-2">Assigned / Completed / Cancelled</th>
                          <th className="py-2.5 px-2">COD Collected</th>
                          <th className="py-2.5 px-2 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {staffList.map((stf) => {
                          const r = roles.find((rl) => rl.id === stf.roleId);
                          const isSu = stf.isSuperuser || r?.slug === "SUPER_ADMIN";
                          return (
                            <tr key={stf.id}>
                              <td className="py-3 px-2">
                                <div className="font-bold flex items-center gap-1.5">
                                  <span>
                                    {stf.name} ({stf.employeeCode})
                                  </span>
                                  {isSu && (
                                    <span className="inline-flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-black">
                                      <Crown className="w-3 h-3" /> SUPERUSER
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-500">{stf.email}</div>
                              </td>
                              <td className="py-3 px-2 font-bold text-indigo-600">
                                {r?.name}
                              </td>
                              <td className="py-3 px-2 font-mono">
                                {stf.ordersAssigned} /{" "}
                                <span className="text-emerald-600 font-bold">
                                  {stf.ordersCompleted}
                                </span>{" "}
                                / <span className="text-rose-500">{stf.ordersCancelled}</span>
                              </td>
                              <td className="py-3 px-2 font-bold">
                                {formatBDT(stf.cashCollected)}
                              </td>
                              <td className="py-3 px-2 text-right space-x-2">
                                {!isSu && (
                                  <button
                                    onClick={() => handlePromoteStaffToSuperuser(stf.id)}
                                    className="px-3 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-600 hover:text-slate-950 font-bold transition"
                                  >
                                    Make Superuser
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setActiveStaffId(stf.id);
                                    showToast(`Switched active session to ${stf.name}`);
                                  }}
                                  className="px-3 py-1 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-semibold"
                                >
                                  Test Role
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="font-black text-sm">Immutable Staff Activity Audit Log</h3>
                  <div className="space-y-2">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <span className="font-bold">{log.staffName}</span>{" "}
                          <span className="text-indigo-500 font-semibold">[{log.staffRole}]</span>{" "}
                          — <span className="font-mono font-bold">{log.action}</span>:{" "}
                          <span>{log.details}</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {log.createdAt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 9: CUSTOM ROLES & GRANULAR PERMISSION BUILDER */}
            {adminTab === "ROLES" && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div>
                    <h2 className="text-xl font-black">
                      Custom Role Builder & 28-Permission Matrix
                    </h2>
                    <p className="text-xs text-slate-500">
                      Super Admin can create custom roles with granular module permissions and assign them to staff.
                    </p>
                  </div>

                  {hasPerm("roles.manage") ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newRoleForm.name.trim()) return;
                        const slug =
                          newRoleForm.slug.trim() ||
                          newRoleForm.name.toUpperCase().replace(/\s+/g, "_");
                        const created: RoleDef = {
                          id: `role-${Date.now()}`,
                          name: newRoleForm.name,
                          slug,
                          description:
                            newRoleForm.description || "Custom granular RBAC role",
                          isSystem: false,
                          permissions: newRoleForm.permissions
                        };
                        setRoles((prev) => [...prev, created]);
                        logAction(
                          "CUSTOM_ROLE_CREATED",
                          "ROLES",
                          created.slug,
                          `Created custom role ${created.name} with ${created.permissions.length} permissions`
                        );
                        setNewRoleForm({
                          name: "",
                          slug: "",
                          description: "",
                          permissions: ["dashboard.view", "orders.view_all", "invoices.print"]
                        });
                        showToast(`Created custom role "${created.name}"!`);
                      }}
                      className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          required
                          value={newRoleForm.name}
                          onChange={(e) =>
                            setNewRoleForm({ ...newRoleForm, name: e.target.value })
                          }
                          placeholder="Custom Role Name (e.g. Night Shift Supervisor)"
                          className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <input
                          type="text"
                          value={newRoleForm.description}
                          onChange={(e) =>
                            setNewRoleForm({ ...newRoleForm, description: e.target.value })
                          }
                          placeholder="Role description"
                          className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold"
                        >
                          + Save Custom Role ({newRoleForm.permissions.length} Perms)
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2">
                        {ALL_PERMISSIONS.map((perm) => {
                          const checked = newRoleForm.permissions.includes(perm.code);
                          return (
                            <label
                              key={perm.code}
                              className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer ${
                                checked
                                  ? "border-indigo-500 bg-indigo-500/10"
                                  : "border-slate-200 dark:border-slate-700"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) =>
                                  setNewRoleForm((prev) => ({
                                    ...prev,
                                    permissions: e.target.checked
                                      ? [...prev.permissions, perm.code]
                                      : prev.permissions.filter((c) => c !== perm.code)
                                  }))
                                }
                                className="mt-0.5"
                              />
                              <div>
                                <div className="font-semibold leading-tight">{perm.name}</div>
                                <div className="font-mono text-[10px] text-slate-400">
                                  {perm.code}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </form>
                  ) : (
                    <div className="p-4 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-semibold">
                      RBAC Guard: Your current role ({activeRole.name}) does not hold{" "}
                      <code>roles.manage</code>. Switch to Super Admin in the top bar to create custom roles.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roles.map((r) => (
                      <div
                        key={r.id}
                        className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-black text-sm">{r.name}</span>
                          <span className="text-[11px] font-mono bg-indigo-500/10 text-indigo-500 px-2.5 py-0.5 rounded-full font-bold">
                            {r.permissions.length} permissions
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{r.description}</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {r.permissions.slice(0, 8).map((c) => (
                            <span
                              key={c}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800"
                            >
                              {c}
                            </span>
                          ))}
                          {r.permissions.length > 8 && (
                            <span className="text-[10px] text-slate-400">
                              +{r.permissions.length - 8} more
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 10: PAYMENTS, SHIPPING, COUPONS, REPORTS & SETTINGS */}
            {(adminTab === "PAYMENTS" ||
              adminTab === "SHIPPING" ||
              adminTab === "COUPONS" ||
              adminTab === "REPORTS" ||
              adminTab === "SETTINGS" ||
              adminTab === "CUSTOMERS") && (
              <div className="space-y-6">
                {adminTab === "PAYMENTS" && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <h2 className="text-xl font-black">
                      Payment Verification & Gateway Architecture (SSLCommerz, bKash, Nagad, Stripe)
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      {[
                        { name: "SSLCommerz V4", status: "Sandbox Ready", env: "SSLCOMMERZ_STORE_ID" },
                        { name: "bKash Tokenized", status: "Sandbox Ready", env: "BKASH_APP_KEY" },
                        { name: "Nagad Merchant", status: "Sandbox Ready", env: "NAGAD_MERCHANT_ID" },
                        { name: "Stripe Webhook", status: "Sandbox Ready", env: "STRIPE_SECRET_KEY" }
                      ].map((gw) => (
                        <div
                          key={gw.name}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800"
                        >
                          <div className="font-bold">{gw.name}</div>
                          <div className="text-emerald-600 font-semibold mt-0.5">{gw.status}</div>
                          <div className="font-mono text-[10px] text-slate-400 mt-1">{gw.env}</div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 pt-2">
                      {orders.map((o) => (
                        <div
                          key={o.id}
                          className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold">{o.orderNumber}</span> —{" "}
                            <span>{o.customerName}</span> ({o.paymentMethod})
                            {o.transactionId && (
                              <span className="ml-2 font-mono bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded">
                                TrxID: {o.transactionId}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{formatBDT(o.grandTotal)}</span>
                            <button
                              onClick={() => {
                                setOrders((prev) =>
                                  prev.map((item) =>
                                    item.id === o.id ? { ...item, paymentStatus: "PAID" } : item
                                  )
                                );
                                showToast(`Verified payment for ${o.orderNumber}`);
                              }}
                              className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-semibold"
                            >
                              Mark Paid
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === "SHIPPING" && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <h2 className="text-xl font-black">
                      Courier Integration & Dispatch (Steadfast, Pathao Courier, RedX)
                    </h2>
                    <div className="space-y-3">
                      {orders.map((o) => (
                        <div
                          key={o.id}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-bold">
                              {o.orderNumber} — {o.customerName} ({o.deliveryZone})
                            </div>
                            <div className="text-slate-500">{o.deliveryAddress}</div>
                            <div className="font-mono text-indigo-600 mt-0.5">
                              Provider: {o.courierProvider} | Tracking:{" "}
                              {o.trackingNumber || "Not Dispatched"}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {(["STEADFAST", "PATHAO", "REDX"] as const).map((provider) => (
                              <button
                                key={provider}
                                onClick={() => {
                                  const trk = `${provider.slice(0, 3)}-${Math.floor(
                                    1000000 + Math.random() * 9000000
                                  )}`;
                                  setOrders((prev) =>
                                    prev.map((item) =>
                                      item.id === o.id
                                        ? {
                                            ...item,
                                            courierProvider: provider,
                                            trackingNumber: trk,
                                            orderStatus: "SHIPPED"
                                          }
                                        : item
                                    )
                                  );
                                  showToast(
                                    `Dispatched ${o.orderNumber} to ${provider} (Tracking: ${trk})`
                                  );
                                }}
                                className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold hover:bg-indigo-600 hover:text-white"
                              >
                                Send to {provider}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === "COUPONS" && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <h2 className="text-xl font-black">Coupons & Promotional Discounts</h2>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newCouponForm.code.trim()) return;
                        setCoupons((prev) => [
                          ...prev,
                          {
                            id: `cpn-${Date.now()}`,
                            code: newCouponForm.code.toUpperCase(),
                            discountType: newCouponForm.discountType,
                            discountValue: Number(newCouponForm.discountValue),
                            minPurchaseAmount: Number(newCouponForm.minPurchaseAmount),
                            usedCount: 0,
                            expiresAt: newCouponForm.expiresAt,
                            isActive: true
                          }
                        ]);
                        setNewCouponForm({ ...newCouponForm, code: "" });
                        showToast("Created promotional coupon!");
                      }}
                      className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs"
                    >
                      <input
                        type="text"
                        value={newCouponForm.code}
                        onChange={(e) =>
                          setNewCouponForm({ ...newCouponForm, code: e.target.value })
                        }
                        placeholder="Code (e.g. WINTER20)"
                        className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                      />
                      <select
                        value={newCouponForm.discountType}
                        onChange={(e) =>
                          setNewCouponForm({
                            ...newCouponForm,
                            discountType: e.target.value as any
                          })
                        }
                        className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED_AMOUNT">Fixed Amount (৳)</option>
                      </select>
                      <input
                        type="number"
                        value={newCouponForm.discountValue}
                        onChange={(e) =>
                          setNewCouponForm({
                            ...newCouponForm,
                            discountValue: Number(e.target.value)
                          })
                        }
                        placeholder="Discount Value"
                        className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                      />
                      <input
                        type="number"
                        value={newCouponForm.minPurchaseAmount}
                        onChange={(e) =>
                          setNewCouponForm({
                            ...newCouponForm,
                            minPurchaseAmount: Number(e.target.value)
                          })
                        }
                        placeholder="Min Purchase"
                        className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-bold"
                      >
                        + Create Coupon
                      </button>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {coupons.map((c) => (
                        <div
                          key={c.id}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center"
                        >
                          <div>
                            <div className="font-mono font-bold text-sm text-indigo-600">
                              {c.code}
                            </div>
                            <div className="text-slate-500">
                              {c.discountType === "PERCENTAGE"
                                ? `${c.discountValue}% OFF`
                                : `${formatBDT(c.discountValue)} OFF`}{" "}
                              (Min Order: {formatBDT(c.minPurchaseAmount)})
                            </div>
                          </div>
                          <span className="text-emerald-600 font-semibold">
                            Used {c.usedCount}x
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === "REPORTS" && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <h2 className="text-xl font-black">Financial & Profitability Reports</h2>
                    {hasPerm("financials.view") ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800">
                          <div className="text-slate-500">Gross Revenue</div>
                          <div className="text-2xl font-black mt-1">
                            {formatBDT(kpiMetrics.totalRevenue)}
                          </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800">
                          <div className="text-slate-500">Net Profit Margin</div>
                          <div className="text-2xl font-black text-emerald-600 mt-1">
                            {formatBDT(kpiMetrics.grossProfit)}
                          </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800">
                          <div className="text-slate-500">Delivered Orders</div>
                          <div className="text-2xl font-black mt-1">
                            {kpiMetrics.deliveredCount}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-semibold">
                        RBAC Access Denied: Your role ({activeRole.name}) is restricted from accessing financial and cost-margin reports.
                      </div>
                    )}
                  </div>
                )}

                {adminTab === "SETTINGS" && (
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <h2 className="text-xl font-black">
                      Website & Bilingual Invoice Header Configuration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="font-bold block mb-1">Company Name (English)</label>
                        <input
                          type="text"
                          value={settings.companyName}
                          onChange={(e) =>
                            setSettings({ ...settings, companyName: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Company Name (বাংলা)</label>
                        <input
                          type="text"
                          value={settings.companyNameBn}
                          onChange={(e) =>
                            setSettings({ ...settings, companyNameBn: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">Hotline Phone</label>
                        <input
                          type="text"
                          value={settings.companyPhone}
                          onChange={(e) =>
                            setSettings({ ...settings, companyPhone: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">
                          Promotional Storefront Banner
                        </label>
                        <input
                          type="text"
                          value={settings.promoBannerText}
                          onChange={(e) =>
                            setSettings({ ...settings, promoBannerText: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => showToast("Website & Invoice settings updated!")}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                    >
                      Save Configuration
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PORTAL 3: ARCHITECTURE, PRISMA SCHEMA & FOLDER STRUCTURE VIEWER      */}
      {/* ==================================================================== */}
      {isStaffLoggedIn && portalMode === "ARCHITECTURE" && (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-7 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h1 className="text-2xl font-black">
              System Architecture, 29-Model Prisma Schema & Next.js App Router Blueprint
            </h1>
            <p className="text-xs text-slate-500">
              All source files, Server Actions, Route Handlers, RBAC middleware, and Prisma models are packaged in the downloadable project archive.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-bold text-indigo-600 uppercase">
                  1. Normalized 29-Model Prisma Schema
                </div>
                <p className="text-slate-500 leading-relaxed">
                  User, Account, Session, Role, Permission, RolePermission, UserRole, CustomerProfile, StaffProfile, Address, Category, Product, ProductVariant, ProductImage, Inventory, InventoryTransaction, Cart, CartItem, Wishlist, Order, OrderItem, OrderStatusHistory, OrderAssignment, Payment, Shipping, Coupon, Review, StaffActivityLog, WebsiteSettings.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-bold text-emerald-600 uppercase">
                  2. Server-Side RBAC Enforcement
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Every Server Action and API Route calls <code>requirePermission()</code> to verify role permissions and user-level overrides against PostgreSQL before mutating data or returning cost prices.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="font-bold text-purple-600 uppercase">
                  3. Bilingual 3-Layout Order Memo Engine
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Supports A4 Standard Invoice, 80mm POS Thermal Receipt, and Compact Order Memo in English, বাংলা (Bengali), or Bilingual mode with print-count audit logging.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
