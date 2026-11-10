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
  Plus,
  Phone,
  Mail,
  LayoutGrid,
  List,
  Bell,
  User,
  Menu,
  ZoomIn
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

// ============================================================================
// OFFICIAL BRAND COLOR PALETTE TOKENS
// Navy:     #2F4156 (Primary brand color, buttons, sidebar, headings)
// Teal:     #567C8D (Secondary brand color, links, active states, charts)
// Sky Blue: #C8D9E6 (Soft info backgrounds, highlights, secondary containers)
// Beige:    #F5F1EE (Main page background, product backdrops, subtle areas)
// White:    #FFFFFF (Main surfaces, cards, tables, forms, modals)
// ============================================================================

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
  joinDate: string;
  directPermissions: string[];
  status: "ACTIVE" | "INACTIVE";
  ordersAssigned: number;
  ordersCompleted: number;
  ordersCancelled: number;
  cashCollected: number;
}

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  registeredAt: string;
  status: "ACTIVE" | "VIP";
  notes: string;
}

interface CategoryItem {
  id: string;
  name: string;
  nameBn: string;
  slug: string;
  itemCount: number;
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
  specs: Record<string, string>;
  regularPrice: number;
  salePrice: number;
  purchasePrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  isFeatured: boolean;
  isNewArrival?: boolean;
  isSpecialOffer?: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
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
  { code: "dashboard.view", name: "View Admin Dashboard", module: "Dashboard Permissions" },
  { code: "financials.view", name: "View Financial & Profit Reports", module: "Report Permissions" },
  { code: "products.view", name: "View Products", module: "Product Permissions" },
  { code: "products.create", name: "Create Products", module: "Product Permissions" },
  { code: "products.edit", name: "Edit Products", module: "Product Permissions" },
  { code: "products.delete", name: "Delete/Archive Products", module: "Product Permissions" },
  { code: "products.purchase_price", name: "View/Edit Purchase Cost Price", module: "Product Permissions" },
  { code: "categories.manage", name: "Manage Categories & Subcategories", module: "Product Permissions" },
  { code: "inventory.view", name: "View Inventory & Stock Movements", module: "Inventory Permissions" },
  { code: "inventory.adjust", name: "Adjust Stock & Excel Import/Export", module: "Inventory Permissions" },
  { code: "orders.view_all", name: "View All Customer Orders", module: "Order Permissions" },
  { code: "orders.view_assigned", name: "View Assigned Orders Only", module: "Order Permissions" },
  { code: "orders.confirm", name: "Confirm Pending Orders", module: "Order Permissions" },
  { code: "orders.process", name: "Update Order Processing Status", module: "Order Permissions" },
  { code: "orders.assign", name: "Assign Orders to Staff/Moderators", module: "Order Permissions" },
  { code: "orders.cancel_refund", name: "Cancel Orders & Issue Refunds", module: "Order Permissions" },
  { code: "orders.internal_notes", name: "Add/View Internal Order Notes", module: "Order Permissions" },
  { code: "invoices.print", name: "Print Order Memos & Download PDF", module: "Invoice Permissions" },
  { code: "invoices.bulk_print", name: "Bulk Print Multiple Order Memos", module: "Invoice Permissions" },
  { code: "delivery.view", name: "View Assigned Delivery Orders", module: "Order Permissions" },
  { code: "delivery.update", name: "Mark Delivered/Returned & Record COD", module: "Order Permissions" },
  { code: "customers.manage", name: "View & Manage Customers", module: "Customer Permissions" },
  { code: "staff.manage", name: "Create, Edit & Deactivate Staff", module: "Staff Permissions" },
  { code: "roles.manage", name: "Create Custom Roles & Permissions", module: "Staff Permissions" },
  { code: "coupons.manage", name: "Manage Coupons & Promotions", module: "Settings Permissions" },
  { code: "payments.verify", name: "Verify Manual Bank/bKash/Nagad Payments", module: "Payment Permissions" },
  { code: "shipping.manage", name: "Configure Shipping & Courier Dispatch", module: "Order Permissions" },
  { code: "settings.manage", name: "Manage Website Settings & Audit Logs", module: "Settings Permissions" }
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
    joinDate: "12 Jan 2025",
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
    joinDate: "04 Mar 2025",
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
    joinDate: "19 May 2025",
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
    joinDate: "01 Jul 2025",
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
    joinDate: "15 Aug 2025",
    directPermissions: [],
    status: "ACTIVE",
    ordersAssigned: 41,
    ordersCompleted: 38,
    ordersCancelled: 2,
    cashCollected: 164800
  }
];

const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: "cust-1",
    name: "Mahmudul Hasan",
    email: "mahmudul@example.com",
    phone: "01712345678",
    address: "Flat 4B, House 19, Road 7, Dhanmondi, Dhaka-1209",
    totalOrders: 5,
    totalSpent: 34900,
    registeredAt: "14 Feb 2026",
    status: "VIP",
    notes: "Prefers morning delivery between 10 AM and 1 PM."
  },
  {
    id: "cust-2",
    name: "Farhana Yasmin",
    email: "farhana.y@example.com",
    phone: "01819876543",
    address: "Sector 11, Road 14, House 8, Uttara, Dhaka-1230",
    totalOrders: 3,
    totalSpent: 21450,
    registeredAt: "02 Apr 2026",
    status: "ACTIVE",
    notes: "Frequent bKash prepaid customer."
  },
  {
    id: "cust-3",
    name: "Tariqul Alam",
    email: "tariqul.ctg@example.com",
    phone: "01911223344",
    address: "42 Agrabad Commercial Area, Chattogram",
    totalOrders: 2,
    totalSpent: 11200,
    registeredAt: "21 Aug 2026",
    status: "ACTIVE",
    notes: "Commercial office address."
  },
  {
    id: "cust-4",
    name: "Shafiqur Rahman",
    email: "shafiq@example.com",
    phone: "01615556677",
    address: "House 12, Block C, Bashundhara R/A, Dhaka",
    totalOrders: 4,
    totalSpent: 28400,
    registeredAt: "09 Sep 2026",
    status: "VIP",
    notes: "VIP repeat customer."
  }
];

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: "cat-1", name: "Flagship Electronics", nameBn: "ইলেকট্রনিক্স ও গ্যাজেট", slug: "electronics", itemCount: 18, isActive: true },
  { id: "cat-2", name: "Smart Watches & Audio", nameBn: "স্মার্ট ওয়াচ ও অডিও", slug: "wearables", itemCount: 24, isActive: true },
  { id: "cat-3", name: "Executive Apparel", nameBn: "প্রিমিয়াম পোশাক", slug: "apparel", itemCount: 32, isActive: true },
  { id: "cat-4", name: "Home & Workspace", nameBn: "হোম ও অফিস এক্সেসরিজ", slug: "workspace", itemCount: 15, isActive: true }
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
    specs: {
      "Driver Unit": "40mm Custom Titanium Diaphragm",
      "Noise Cancellation": "45dB Hybrid Active ANC + Transparency",
      "Battery Life": "60 Hours (ANC Off) / 42 Hours (ANC On)",
      "Connectivity": "Bluetooth 5.4 + 3.5mm Studio Jack",
      "Warranty": "12 Months Official Replacement Guarantee"
    },
    regularPrice: 6500,
    salePrice: 5490,
    purchasePrice: 3800,
    stockQuantity: 34,
    lowStockThreshold: 10,
    isFeatured: true,
    isNewArrival: false,
    isSpecialOffer: true,
    isActive: true,
    rating: 4.9,
    reviewCount: 42,
    badgeText: "BESTSELLER",
    variants: [
      { id: "v-101a", name: "Navy Slate", sku: "NX-AUD-101-NVY", priceDelta: 0, stock: 20 },
      { id: "v-101b", name: "Warm Sand Beige", sku: "NX-AUD-101-BGE", priceDelta: 200, stock: 14 }
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
    description: "2.04-inch Retina AMOLED display, titanium alloy bezel, Bluetooth calling, ECG & SpO2 monitoring, IP68 water resistance.",
    specs: {
      "Display": "2.04\" Super Retina AMOLED (1000 nits)",
      "Case Material": "Brushed Aerospace Titanium Alloy",
      "Health Sensors": "Continuous Heart Rate, SpO2, Sleep & Stress",
      "Water Resistance": "IP68 Swimming-Grade Protection",
      "Warranty": "12 Months Official Warranty"
    },
    regularPrice: 4800,
    salePrice: 3990,
    purchasePrice: 2650,
    stockQuantity: 8,
    lowStockThreshold: 12,
    isFeatured: true,
    isNewArrival: true,
    isSpecialOffer: true,
    isActive: true,
    rating: 4.8,
    reviewCount: 31,
    badgeText: "LIMITED STOCK",
    variants: [
      { id: "v-204a", name: "Teal Ocean Strap", sku: "NX-WTC-204-TEL", priceDelta: 0, stock: 5 },
      { id: "v-204b", name: "Deep Navy Milanese", sku: "NX-WTC-204-NVY", priceDelta: 0, stock: 3 }
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
    description: "Gasket-mounted CNC aluminum frame, tri-mode wireless (2.4GHz/BT/USB-C), pre-lubed tactile switches, double-shot PBT keycaps.",
    specs: {
      "Layout": "75% Compact Executive (82 Keys + Rotary Knob)",
      "Mounting Style": "Poron Gasket Mount with Polycarbonate Plate",
      "Keycaps": "Double-Shot PBT in Navy/Beige/Sky Blue colorway",
      "Battery": "4000mAh Li-Po Rechargeable",
      "Warranty": "1 Year Official Brand Warranty"
    },
    regularPrice: 8200,
    salePrice: 7250,
    purchasePrice: 5100,
    stockQuantity: 19,
    lowStockThreshold: 8,
    isFeatured: true,
    isNewArrival: true,
    isSpecialOffer: false,
    isActive: true,
    rating: 4.9,
    reviewCount: 27,
    badgeText: "ARCHITECT SERIES",
    variants: [
      { id: "v-309a", name: "Tactile Brown Switch", sku: "NX-KBD-309-BRN", priceDelta: 0, stock: 11 },
      { id: "v-309b", name: "Linear Silent Switch", sku: "NX-KBD-309-LIN", priceDelta: 0, stock: 8 }
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
    specs: {
      "Capacity": "27,650mAh / 99.54Wh (TSA Airline Approved)",
      "Max Output": "140W PD 3.1 Single Port / 165W Combined",
      "Ports": "2x USB-C PD 3.1 + 1x USB-A QC 4.0",
      "Display": "Real-time Wattage, Voltage & Time Remaining OLED",
      "Warranty": "18 Months Official Warranty"
    },
    regularPrice: 5900,
    salePrice: 4950,
    purchasePrice: 3400,
    stockQuantity: 6,
    lowStockThreshold: 10,
    isFeatured: false,
    isNewArrival: false,
    isSpecialOffer: true,
    isActive: true,
    rating: 4.7,
    reviewCount: 19,
    badgeText: "140W GAN",
    variants: [
      { id: "v-412a", name: "Anodized Navy 140W", sku: "NX-PWR-412-NVY", priceDelta: 0, stock: 6 }
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
    description: "Breathable 100% Giza cotton weave with tailored architectural collar, mother-of-pearl buttons, and tonal embroidery.",
    specs: {
      "Fabric": "100% Long-Staple Egyptian Giza Cotton",
      "Fit": "Tailored Contemporary Executive Fit",
      "Detailing": "Tonal Geometric Collar & Cuff Embroidery",
      "Care": "Gentle Cold Wash or Dry Clean",
      "Exchange": "7-Day Size Exchange Guarantee"
    },
    regularPrice: 3200,
    salePrice: 2690,
    purchasePrice: 1550,
    stockQuantity: 42,
    lowStockThreshold: 10,
    isFeatured: true,
    isNewArrival: true,
    isSpecialOffer: false,
    isActive: true,
    rating: 4.8,
    reviewCount: 53,
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
    description: "Asymmetric anti-glare optical design with wireless aluminum rotary puck controller and CRI>97 eye-care LEDs.",
    specs: {
      "Color Rendering": "Ra > 97 Full-Spectrum Eye Care LED",
      "Color Temp": "2700K Warm to 6500K Daylight Stepless",
      "Controller": "2.4GHz Wireless Machined Aluminum Puck",
      "Mount": "Weighted Counterbalance Clamp (Fits Curved/Flat)",
      "Warranty": "12 Months Warranty"
    },
    regularPrice: 3600,
    salePrice: 2990,
    purchasePrice: 1900,
    stockQuantity: 25,
    lowStockThreshold: 8,
    isFeatured: false,
    isNewArrival: true,
    isSpecialOffer: true,
    isActive: true,
    rating: 4.6,
    reviewCount: 15,
    badgeText: "STUDIO PICK",
    variants: [
      { id: "v-608a", name: "Matte Navy Slate", sku: "NX-WKS-608-NVY", priceDelta: 0, stock: 25 }
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
        variantName: "Navy Slate",
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
        variantName: "Teal Ocean Strap",
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
        variantName: "Anodized Navy 140W",
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

const BRAND_PIE_COLORS = ["#2F4156", "#567C8D", "#8BA9BC", "#0D9488", "#D97706", "#E11D48"];

function formatBDT(amount: number): string {
  return `৳${Number(amount || 0).toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}

function getStatusBadgeStyle(status: OrderStatus): string {
  switch (status) {
    case "PENDING":
      return "bg-amber-500/15 text-amber-800 border-amber-500/30";
    case "CONFIRMED":
      return "bg-sky-500/15 text-sky-800 border-sky-500/30";
    case "PROCESSING":
      return "bg-[#567C8D]/20 text-[#2F4156] border-[#567C8D]/40";
    case "READY_FOR_SHIPMENT":
      return "bg-indigo-500/15 text-indigo-800 border-indigo-500/30";
    case "SHIPPED":
      return "bg-purple-500/15 text-purple-800 border-purple-500/30";
    case "DELIVERED":
      return "bg-emerald-500/15 text-emerald-800 border-emerald-500/30";
    case "CANCELLED":
      return "bg-rose-500/15 text-rose-800 border-rose-500/30";
    case "RETURNED":
      return "bg-slate-500/15 text-slate-700 border-slate-400/40";
    case "REFUNDED":
      return "bg-teal-500/15 text-teal-800 border-teal-500/30";
    default:
      return "bg-slate-500/15 text-slate-600 border-slate-500/30";
  }
}

/**
 * High-Precision Architectural Product Illustration in Official Palette
 * Always renders crisp Beige (#F5F1EE), Sky Blue (#C8D9E6), Teal (#567C8D), and Navy (#2F4156)
 */
function ProductVisualArtwork({ sku, categoryId }: { sku: string; categoryId: string }) {
  return (
    <div className="w-full h-full bg-[#F5F1EE] flex items-center justify-center relative overflow-hidden p-6 select-none">
      {/* Subtle architectural studio grid backdrop */}
      <div className="absolute inset-3 rounded-xl border border-[#C8D9E6]/60 bg-gradient-to-b from-white/70 to-[#C8D9E6]/25" />
      <div className="relative z-10 w-36 h-36 rounded-full bg-[#C8D9E6]/55 flex items-center justify-center border border-[#C8D9E6] shadow-inner transition-transform duration-300 group-hover:scale-105">
        {categoryId === "cat-2" && sku.includes("AUD") && (
          <svg viewBox="0 0 80 80" className="w-20 h-20 text-[#2F4156]" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 44V38a22 22 0 0 1 44 0v6" stroke="#2F4156" strokeWidth="3.5" />
            <rect x="12" y="40" width="13" height="22" rx="6.5" fill="#2F4156" />
            <rect x="55" y="40" width="13" height="22" rx="6.5" fill="#2F4156" />
            <rect x="15" y="43" width="7" height="16" rx="3.5" fill="#567C8D" />
            <rect x="58" y="43" width="7" height="16" rx="3.5" fill="#567C8D" />
          </svg>
        )}
        {categoryId === "cat-2" && sku.includes("WTC") && (
          <svg viewBox="0 0 80 80" className="w-20 h-20 text-[#2F4156]" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M31 20L33 9h14l2 11M31 60l2 11h14l2-11" fill="#567C8D" stroke="#2F4156" strokeWidth="2.5" />
            <rect x="23" y="19" width="34" height="42" rx="9" fill="#2F4156" stroke="#2F4156" strokeWidth="2.5" />
            <rect x="27" y="23" width="26" height="34" rx="6" fill="#FFFFFF" />
            <circle cx="40" cy="40" r="8" stroke="#567C8D" strokeWidth="2.5" />
            <path d="M40 35v5l3.5 3.5" stroke="#2F4156" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        )}
        {categoryId === "cat-4" && sku.includes("KBD") && (
          <svg viewBox="0 0 80 80" className="w-20 h-20 text-[#2F4156]" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="8" y="23" width="64" height="34" rx="6" fill="#2F4156" />
            <rect x="11" y="26" width="58" height="28" rx="4" fill="#FFFFFF" />
            <path d="M16 33h6M26 33h6M36 33h6M46 33h6M56 33h8M16 40h8M28 40h22M54 40h10M20 47h40" stroke="#567C8D" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
        {categoryId === "cat-1" && (
          <svg viewBox="0 0 80 80" className="w-20 h-20 text-[#2F4156]" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="22" y="13" width="36" height="54" rx="7" fill="#2F4156" />
            <rect x="26" y="18" width="28" height="44" rx="4" fill="#FFFFFF" />
            <path d="M42 26l-8 14h12l-6 14" stroke="#567C8D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {categoryId === "cat-3" && (
          <svg viewBox="0 0 80 80" className="w-20 h-20 text-[#2F4156]" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M28 16l12 6 12-6 13 10-8 10v28H23V36l-8-10 13-10z" fill="#FFFFFF" stroke="#2F4156" strokeWidth="2.8" />
            <path d="M40 22v22" stroke="#567C8D" strokeWidth="2.8" strokeLinecap="round" />
          </svg>
        )}
        {categoryId === "cat-4" && !sku.includes("KBD") && (
          <svg viewBox="0 0 80 80" className="w-20 h-20 text-[#2F4156]" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M14 24h52" stroke="#2F4156" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M40 24v32M26 56h28" stroke="#567C8D" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  );
}

export default function App() {
  // Default is Light Mode (#F5F1EE Beige + #FFFFFF White + #2F4156 Navy + #567C8D Teal + #C8D9E6 Sky Blue)
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Strict Customer vs Staff Separation:
  // Normal customers NEVER see Admin menus; only signed-in Staff see the ERP bar & dashboard.
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
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
  const [customerDashTab, setCustomerDashTab] = useState<
    "OVERVIEW" | "MY_ORDERS" | "TRACKING" | "WISHLIST" | "ADDRESSES" | "PROFILE" | "PASSWORD"
  >("OVERVIEW");
  const [shopViewMode, setShopViewMode] = useState<"GRID" | "LIST">("GRID");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(10000);
  const [selectedProductId, setSelectedProductId] = useState<string>("prd-1");
  const [selectedVariantId, setSelectedVariantId] = useState<string>("v-101a");
  const [detailQty, setDetailQty] = useState<number>(1);
  const [detailTab, setDetailTab] = useState<"DESCRIPTION" | "SPECS" | "REVIEWS">("DESCRIPTION");
  const [zoomActive, setZoomActive] = useState<boolean>(false);
  const [newsletterEmail, setNewsletterEmail] = useState<string>("");

  const [authMode, setAuthMode] = useState<"CUSTOMER_LOGIN" | "STAFF_LOGIN" | "SUPERUSER_SETUP">(
    "STAFF_LOGIN"
  );
  const [staffLoginEmail, setStaffLoginEmail] = useState<string>("superadmin@nexusmart.com.bd");
  const [staffLoginPassword, setStaffLoginPassword] = useState<string>("Password123!");
  const [customerLoginEmail, setCustomerLoginEmail] = useState<string>("mahmudul@example.com");
  const [customerLoginName, setCustomerLoginName] = useState<string>("Mahmudul Hasan");
  const [customerLoginPhone, setCustomerLoginPhone] = useState<string>("01712345678");

  const [superuserForm, setSuperuserForm] = useState({
    name: "",
    email: "",
    phone: "+8801700000000",
    password: "",
    employeeCode: "SU-001"
  });

  const [adminTab, setAdminTab] = useState<
    | "DASHBOARD"
    | "MODERATOR_DESK"
    | "DELIVERY_DESK"
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
  const [settingsSubTab, setSettingsSubTab] = useState<
    "GENERAL" | "BRANDING" | "SHIPPING" | "PAYMENT" | "INVOICE" | "SEO_LEGAL"
  >("GENERAL");

  const [roles, setRoles] = useState<RoleDef[]>(INITIAL_ROLES);
  const [staffList, setStaffList] = useState<StaffUser[]>(INITIAL_STAFF);
  const [customers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
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
    currencySymbol: "৳",
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
      "Complimentary Express Delivery on orders above ৳5,000 • Use Code NEXUS15 for 15% Off Flagship Audio",
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
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>("ALL");
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

  /**
   * Clicking ANY Product Card opens its Product Description / Details page
   * and scrolls to the top smoothly.
   */
  const openProductDetail = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    setSelectedProductId(prod.id);
    setSelectedVariantId(prod.variants[0]?.id || "");
    setDetailQty(1);
    setDetailTab("DESCRIPTION");
    setStorePage("PRODUCT_DETAIL");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
      createdAt: "2026-11-10 05:45 PM"
    };
    setActivityLogs((prev) => [entry, ...prev]);
  };

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
    const r = roles.find((rl) => rl.id === matched.roleId);
    if (r?.slug === "MODERATOR") {
      setAdminTab("MODERATOR_DESK");
    } else if (r?.slug === "DELIVERY_STAFF") {
      setAdminTab("DELIVERY_DESK");
    } else {
      setAdminTab("DASHBOARD");
    }
    showToast(`Signed in as ${matched.name} (${r?.name}).`);
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
      joinDate: "10 Nov 2026",
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
      .filter((p) => (inStockOnly ? p.stockQuantity > 0 : true))
      .filter((p) => p.salePrice <= maxPriceFilter)
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
  }, [products, storeCategory, inStockOnly, maxPriceFilter, storeSearch, storeSort]);

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

  const handleAddToCart = (productId: string, variantId?: string, qty = 1) => {
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
        if (existing.quantity + qty > product.stockQuantity) {
          showToast(`Stock limit reached (${product.stockQuantity} available)`, "error");
          return prev;
        }
        return prev.map((i) =>
          i === existing ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [
        ...prev,
        {
          productId,
          variantId: variantId || product.variants[0]?.id,
          quantity: qty
        }
      ];
    });
    showToast(`Added "${product.name}" to shopping cart!`);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartDetails.lines.length === 0) {
      showToast("Your cart is empty!", "error");
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
          createdAt: "2026-11-10 05:46 PM"
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
      createdAt: "2026-11-10 05:46 PM",
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
          createdAt: "2026-11-10 05:46 PM"
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
      .filter((o) => (orderPaymentFilter === "ALL" ? true : o.paymentStatus === orderPaymentFilter))
      .filter((o) => {
        if (!orderSearch.trim()) return true;
        const q = orderSearch.toLowerCase();
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q)
        );
      });
  }, [orders, activeStaff, activePermissions, orderStatusFilter, orderPaymentFilter, orderSearch]);

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
            createdAt: "2026-11-10 05:48 PM"
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
              createdAt: "2026-11-10 05:48 PM"
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
              lastPrintedAt: "2026-11-10 05:50 PM",
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
  body { font-family: 'Inter', 'Segoe UI', sans-serif; margin: 24px; color: #2F4156; }
  .memo { border: 1px solid #C8D9E6; padding: 28px; margin-bottom: 32px; max-width: ${
    invoiceLayout === "THERMAL_80MM" ? "300px" : invoiceLayout === "COMPACT_MEMO" ? "520px" : "800px"
  }; margin-left: auto; margin-right: auto; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { border-bottom: 1px solid #C8D9E6; padding: 8px 4px; text-align: left; font-size: 13px; }
  th { background: #F5F1EE; color: #2F4156; }
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
    const todayRevenue = orders
      .filter((o) => o.createdAt.includes("2026-11-10") && o.orderStatus !== "CANCELLED")
      .reduce((s, o) => s + o.grandTotal, 0);
    const totalCost = activeOrders.reduce(
      (s, o) =>
        s + o.items.reduce((is, item) => is + item.purchasePrice * item.quantity, 0),
      0
    );
    const grossProfit = totalRevenue - totalCost;
    const pendingCount = orders.filter((o) => o.orderStatus === "PENDING").length;
    const confirmedCount = orders.filter((o) => o.orderStatus === "CONFIRMED").length;
    const processingCount = orders.filter((o) => o.orderStatus === "PROCESSING").length;
    const shippedCount = orders.filter((o) => o.orderStatus === "SHIPPED").length;
    const deliveredCount = orders.filter((o) => o.orderStatus === "DELIVERED").length;
    const cancelledCount = orders.filter((o) => o.orderStatus === "CANCELLED").length;
    const lowStockProducts = products.filter((p) => p.stockQuantity <= p.lowStockThreshold);

    const statusPie = [
      { name: "Pending", value: pendingCount || 1 },
      { name: "Confirmed", value: confirmedCount || 1 },
      { name: "Shipped", value: shippedCount || 1 },
      { name: "Delivered", value: deliveredCount || 1 },
      { name: "Cancelled", value: cancelledCount }
    ].filter((s) => s.value > 0);

    return {
      totalRevenue,
      todayRevenue,
      grossProfit,
      pendingCount,
      confirmedCount,
      processingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
      lowStockProducts,
      statusPie
    };
  }, [orders, products]);

  const groupedPermissions = useMemo(() => {
    const map = new Map<string, PermissionDef[]>();
    for (const p of ALL_PERMISSIONS) {
      const list = map.get(p.module) || [];
      list.push(p);
      map.set(p.module, list);
    }
    return Array.from(map.entries());
  }, []);

  // Explicit theme tokens so OS dark mode NEVER overrides the Beige/White/SkyBlue/Teal/Navy palette
  const pageBg = darkMode ? "bg-[#1B2634] text-[#F5F1EE]" : "bg-[#F5F1EE] text-[#2F4156]";
  const surfaceCard = darkMode
    ? "bg-[#243344] text-[#F5F1EE] border-[#567C8D]/40"
    : "bg-white text-[#2F4156] border-[#C8D9E6]";
  const subtleBox = darkMode
    ? "bg-[#1B2634] text-[#F5F1EE] border-[#567C8D]/40"
    : "bg-[#F5F1EE] text-[#2F4156] border-[#C8D9E6]";

  return (
    <div className={`${pageBg} min-h-screen font-sans selection:bg-[#2F4156] selection:text-white`}>
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
        <div className="no-print fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border bg-[#2F4156] text-white border-[#567C8D]">
          {toast.type === "error" ? (
            <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#C8D9E6] shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-[#C8D9E6] hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STAFF EXECUTIVE TOPBAR — STRICTLY HIDDEN FROM NORMAL CUSTOMERS       */}
      {/* Single-line layout on desktop                                        */}
      {/* ==================================================================== */}
      {isStaffLoggedIn && (
        <header className="no-print sticky top-0 z-50 bg-[#2F4156] text-white border-b border-[#567C8D]/40 px-4 h-14 flex items-center shadow-md">
          <div className="max-w-[1440px] w-full mx-auto flex items-center justify-between gap-3 flex-nowrap">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-[#567C8D] flex items-center justify-center font-bold text-sm text-white border border-[#C8D9E6]/30">
                N
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-xs sm:text-sm whitespace-nowrap">
                  {settings.companyName} ERP
                </span>
                {activeStaff.isSuperuser || activeRole.slug === "SUPER_ADMIN" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-[#C8D9E6] text-[#2F4156] px-2 py-0.5 rounded font-bold whitespace-nowrap">
                    <Crown className="w-3 h-3" /> SUPERUSER
                  </span>
                ) : (
                  <span className="text-[10px] bg-[#567C8D] text-white px-2 py-0.5 rounded font-semibold whitespace-nowrap">
                    {activeRole.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 bg-[#243344] p-1 rounded-lg border border-[#567C8D]/40 shrink-0">
              <button
                onClick={() => setPortalMode("STOREFRONT")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition ${
                  portalMode === "STOREFRONT"
                    ? "bg-[#567C8D] text-white shadow-sm"
                    : "text-[#C8D9E6] hover:text-white"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Customer Storefront
              </button>
              <button
                onClick={() => setPortalMode("ADMIN")}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition ${
                  portalMode === "ADMIN"
                    ? "bg-[#567C8D] text-white shadow-sm"
                    : "text-[#C8D9E6] hover:text-white"
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
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition ${
                  portalMode === "ADMIN" && adminTab === "INVOICES"
                    ? "bg-[#C8D9E6] text-[#2F4156] font-bold"
                    : "text-[#C8D9E6] hover:text-white"
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                Memo Printer ({printQueueIds.length})
              </button>
              <button
                onClick={() => setPortalMode("ARCHITECTURE")}
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition ${
                  portalMode === "ARCHITECTURE"
                    ? "bg-[#567C8D] text-white"
                    : "text-[#C8D9E6] hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Schema & Architecture
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden lg:flex items-center gap-1.5 bg-[#243344] px-2.5 py-1 rounded-lg border border-[#567C8D]/40 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-[#C8D9E6]" />
                <select
                  aria-label="Switch Active Staff Role Session"
                  value={activeStaffId}
                  onChange={(e) => {
                    setActiveStaffId(e.target.value);
                    const chosen = staffList.find((s) => s.id === e.target.value);
                    const r = roles.find((rl) => rl.id === chosen?.roleId);
                    if (r?.slug === "MODERATOR") setAdminTab("MODERATOR_DESK");
                    else if (r?.slug === "DELIVERY_STAFF") setAdminTab("DELIVERY_DESK");
                    showToast(`Switched staff session to ${chosen?.name} (${r?.name})`, "info");
                  }}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
                >
                  {staffList.map((stf) => {
                    const r = roles.find((rl) => rl.id === stf.roleId);
                    return (
                      <option key={stf.id} value={stf.id} className="bg-[#2F4156] text-white">
                        {stf.name} — [{r?.name}]
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                onClick={handleStaffLogout}
                title="Sign Out of Staff Portal"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs font-semibold whitespace-nowrap transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ==================================================================== */}
      {/* PORTAL 1: CUSTOMER STOREFRONT (Official Navy, Teal, Sky Blue, Beige) */}
      {/* ==================================================================== */}
      {(portalMode === "STOREFRONT" || !isStaffLoggedIn) && (
        <div className="min-h-screen flex flex-col">
          {/* Top Announcement Bar in Navy (#2F4156) */}
          {settings.promoBannerActive && (
            <div className="bg-[#2F4156] text-[#F5F1EE] text-xs font-medium py-2 px-4 text-center border-b border-[#567C8D]/30">
              <span>{settings.promoBannerText}</span>
            </div>
          )}

          {/* ================================================================ */}
          {/* SINGLE-LINE STICKY STOREFRONT HEADER (Never wraps onto 2 lines!) */}
          {/* ================================================================ */}
          <nav
            className={`${
              darkMode
                ? "bg-[#243344] border-[#567C8D]/40 text-white"
                : "bg-white border-[#C8D9E6] text-[#2F4156]"
            } border-b px-4 h-16 flex items-center sticky ${
              isStaffLoggedIn ? "top-14" : "top-0"
            } z-30 shadow-sm`}
          >
            <div className="max-w-7xl w-full mx-auto flex items-center justify-between gap-3 flex-nowrap">
              {/* Left: Brand Logo (shrink-0) */}
              <button
                onClick={() => setStorePage("HOME")}
                className="flex items-center gap-2.5 text-left shrink-0"
              >
                <div className="w-9 h-9 rounded-lg bg-[#2F4156] text-white flex items-center justify-center font-serif font-bold text-lg shrink-0">
                  N
                </div>
                <div className="leading-tight">
                  <span className="text-lg font-bold tracking-tight block whitespace-nowrap">
                    {settings.companyName}
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#567C8D] block whitespace-nowrap">
                    Architectural Store
                  </span>
                </div>
              </button>

              {/* Center: Single-Line Navigation Links (never wraps) */}
              <div className="hidden lg:flex items-center gap-1 text-xs xl:text-sm font-medium shrink-0">
                <button
                  onClick={() => setStorePage("HOME")}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                    storePage === "HOME"
                      ? "bg-[#2F4156] text-white font-semibold"
                      : "hover:bg-[#C8D9E6]/35"
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    setStoreCategory("ALL");
                    setStorePage("SHOP");
                  }}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                    storePage === "SHOP"
                      ? "bg-[#2F4156] text-white font-semibold"
                      : "hover:bg-[#C8D9E6]/35"
                  }`}
                >
                  Shop Catalog
                </button>
                <button
                  onClick={() => setStorePage("TRACK_ORDER")}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                    storePage === "TRACK_ORDER"
                      ? "bg-[#2F4156] text-white font-semibold"
                      : "hover:bg-[#C8D9E6]/35"
                  }`}
                >
                  Track Order
                </button>
                <button
                  onClick={() => setStorePage("CUSTOMER_DASHBOARD")}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                    storePage === "CUSTOMER_DASHBOARD"
                      ? "bg-[#2F4156] text-white font-semibold"
                      : "hover:bg-[#C8D9E6]/35"
                  }`}
                >
                  My Account
                </button>
                <button
                  onClick={() => setStorePage("ABOUT")}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                    storePage === "ABOUT"
                      ? "bg-[#2F4156] text-white font-semibold"
                      : "hover:bg-[#C8D9E6]/35"
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => setStorePage("CONTACT")}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                    storePage === "CONTACT"
                      ? "bg-[#2F4156] text-white font-semibold"
                      : "hover:bg-[#C8D9E6]/35"
                  }`}
                >
                  Contact
                </button>
              </div>

              {/* Right: Compact Search + Icons + Cart + Sign In (all on the exact same 1 line!) */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="relative hidden sm:block">
                  <Search className="w-3.5 h-3.5 text-[#567C8D] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={storeSearch}
                    onChange={(e) => {
                      setStoreSearch(e.target.value);
                      if (storePage !== "SHOP") setStorePage("SHOP");
                    }}
                    placeholder="Search products..."
                    className={`pl-8 pr-3 py-1.5 text-xs rounded-lg border ${
                      darkMode
                        ? "border-[#567C8D] bg-[#1B2634] text-white"
                        : "border-[#C8D9E6] bg-[#F5F1EE] text-[#2F4156]"
                    } focus:outline-none focus:border-[#2F4156] w-36 xl:w-48 transition`}
                  />
                </div>

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  title="Toggle Light / Dark Mode"
                  className="p-2 rounded-lg border border-[#C8D9E6] hover:bg-[#C8D9E6]/30 shrink-0"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setStorePage("WISHLIST")}
                  className="relative p-2 rounded-lg border border-[#C8D9E6] hover:bg-[#C8D9E6]/30 shrink-0"
                  title="Wishlist"
                >
                  <Heart className="w-4 h-4 text-[#567C8D]" />
                  {wishlist.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#2F4156] text-white text-[10px] font-bold flex items-center justify-center">
                      {wishlist.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setStorePage("CART")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2F4156] hover:bg-[#567C8D] text-white text-xs font-semibold whitespace-nowrap shrink-0 transition"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Cart ({cartDetails.lines.reduce((s, l) => s + l.quantity, 0)})</span>
                  <span className="hidden xl:inline font-bold pl-1 border-l border-white/20">
                    {formatBDT(cartDetails.grandTotal)}
                  </span>
                </button>

                <button
                  onClick={() => setStorePage("AUTH")}
                  className="px-3 py-1.5 rounded-lg border border-[#2F4156] bg-white text-[#2F4156] hover:bg-[#2F4156] hover:text-white text-xs font-semibold whitespace-nowrap shrink-0 transition"
                >
                  Login / Register
                </button>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg border border-[#C8D9E6]"
                  title="Toggle Navigation Menu"
                >
                  <Menu className="w-4 h-4" />
                </button>
              </div>
            </div>
          </nav>

          {/* Mobile Drawer Menu (Only visible on small screens when toggled) */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white border-b border-[#C8D9E6] px-4 py-3 flex flex-wrap gap-2 text-xs font-semibold text-[#2F4156]">
              <button onClick={() => { setStorePage("HOME"); setMobileMenuOpen(false); }} className="px-3 py-1.5 rounded bg-[#F5F1EE]">Home</button>
              <button onClick={() => { setStorePage("SHOP"); setMobileMenuOpen(false); }} className="px-3 py-1.5 rounded bg-[#F5F1EE]">Shop Catalog</button>
              <button onClick={() => { setStorePage("TRACK_ORDER"); setMobileMenuOpen(false); }} className="px-3 py-1.5 rounded bg-[#F5F1EE]">Track Order</button>
              <button onClick={() => { setStorePage("CUSTOMER_DASHBOARD"); setMobileMenuOpen(false); }} className="px-3 py-1.5 rounded bg-[#F5F1EE]">My Account</button>
              <button onClick={() => { setStorePage("ABOUT"); setMobileMenuOpen(false); }} className="px-3 py-1.5 rounded bg-[#F5F1EE]">About</button>
              <button onClick={() => { setStorePage("CONTACT"); setMobileMenuOpen(false); }} className="px-3 py-1.5 rounded bg-[#F5F1EE]">Contact</button>
            </div>
          )}

          {/* Storefront Content Body */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
            {/* ============================================================== */}
            {/* 4.B HOMEPAGE (All 10 Commercial Sections in Official Palette)  */}
            {/* ============================================================== */}
            {storePage === "HOME" && (
              <div className="space-y-14">
                {/* Section 1: Hero Section */}
                <section className={`rounded-2xl border overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 ${surfaceCard}`}>
                  <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#C8D9E6]/60 text-[#2F4156] text-xs font-bold uppercase tracking-widest">
                        2026 Architectural Edition
                      </span>
                      <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-[1.15]">
                        Timeless Precision for Modern Work & Living.
                      </h1>
                      <p className="text-sm sm:text-base text-[#567C8D] leading-relaxed max-w-xl">
                        Thoughtfully engineered acoustics, titanium wearables, and Giza cotton executive apparel—backed by serialized warehouse inventory and same-day Dhaka dispatch.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={() => setStorePage("SHOP")}
                        className="px-6 py-3 rounded-lg bg-[#2F4156] hover:bg-[#567C8D] text-white font-semibold text-sm transition"
                      >
                        Explore Shop Catalog
                      </button>
                      <button
                        onClick={() => setStorePage("TRACK_ORDER")}
                        className="px-6 py-3 rounded-lg bg-[#567C8D] hover:bg-[#2F4156] text-white font-semibold text-sm transition"
                      >
                        Track an Order
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#C8D9E6] text-xs">
                      <div>
                        <div className="font-bold text-sm">Official Warranty</div>
                        <div className="text-[#567C8D]">100% Serialized Stock</div>
                      </div>
                      <div>
                        <div className="font-bold text-sm">Express Courier</div>
                        <div className="text-[#567C8D]">Steadfast, Pathao & RedX</div>
                      </div>
                      <div>
                        <div className="font-bold text-sm">Flexible Payment</div>
                        <div className="text-[#567C8D]">COD, bKash, Nagad & Card</div>
                      </div>
                    </div>
                  </div>

                  {/* Clickable Hero Product Card -> Opens Product Description Page */}
                  <div
                    onClick={() => openProductDetail("prd-1")}
                    className="lg:col-span-5 bg-[#C8D9E6]/45 p-8 sm:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#C8D9E6] cursor-pointer group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#2F4156]">
                        Flagship Highlight
                      </span>
                      <span className="px-3 py-1 rounded-md bg-[#2F4156] text-white text-xs font-semibold">
                        Save ৳1,010
                      </span>
                    </div>
                    <div className="my-6 rounded-xl overflow-hidden border border-[#C8D9E6] bg-white h-52">
                      <ProductVisualArtwork sku="NX-AUD-101" categoryId="cat-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-[#567C8D]">
                        অরাপ্রো এএনসি ওয়্যারলেস হেডফোন
                      </div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-[#2F4156] group-hover:underline">
                          AuraPro ANC Wireless
                        </h3>
                        <span className="text-lg font-bold text-[#2F4156]">
                          {formatBDT(5490)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openProductDetail("prd-1");
                        }}
                        className="w-full py-2.5 rounded-lg bg-[#567C8D] hover:bg-[#2F4156] text-white text-xs font-semibold transition"
                      >
                        Inspect Specifications →
                      </button>
                    </div>
                  </div>
                </section>

                {/* Section 2: Featured Categories */}
                <section className="space-y-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-[#567C8D]">
                        Departments
                      </span>
                      <h2 className="font-serif text-2xl font-bold mt-1">
                        Featured Categories
                      </h2>
                    </div>
                    <button
                      onClick={() => setStorePage("SHOP")}
                      className="text-xs font-semibold text-[#567C8D] hover:text-[#2F4156] flex items-center gap-1"
                    >
                      View All Products <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setStoreCategory(cat.id);
                          setStorePage("SHOP");
                        }}
                        className={`p-6 rounded-xl border text-left transition group shadow-sm hover:bg-[#C8D9E6]/35 ${surfaceCard}`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-[#C8D9E6]/60 text-[#2F4156] flex items-center justify-center mb-4 group-hover:bg-[#2F4156] group-hover:text-white transition">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div className="font-bold text-base">{cat.name}</div>
                        <div className="text-xs text-[#567C8D] mt-0.5">{cat.nameBn}</div>
                        <div className="text-[11px] font-semibold text-[#567C8D] mt-3 flex items-center justify-between pt-3 border-t border-[#C8D9E6]/50">
                          <span>{cat.itemCount} Products</span>
                          <span>Browse →</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Section 3: Best-Selling Products (Entire Card Clickable -> Opens Description Page!) */}
                <section className="space-y-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-[#567C8D]">
                        Most Popular • Click Any Product Card for Full Specs & Reviews
                      </span>
                      <h2 className="font-serif text-2xl font-bold mt-1">
                        Best-Selling Products
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => {
                      const discountPct = Math.round(
                        ((product.regularPrice - product.salePrice) / product.regularPrice) * 100
                      );
                      return (
                        <div
                          key={product.id}
                          onClick={() => openProductDetail(product.id)}
                          className={`group rounded-xl border overflow-hidden shadow-sm hover:shadow-md hover:border-[#567C8D] transition flex flex-col cursor-pointer ${surfaceCard}`}
                        >
                          <div className="h-52 relative border-b border-[#C8D9E6]/60">
                            <ProductVisualArtwork
                              sku={product.sku}
                              categoryId={product.categoryId}
                            />
                            <div className="absolute top-3 left-3 flex gap-1.5 z-20">
                              {product.badgeText && (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#2F4156] text-white px-2.5 py-1 rounded">
                                  {product.badgeText}
                                </span>
                              )}
                              {discountPct > 0 && (
                                <span className="text-[10px] font-bold bg-[#567C8D] text-white px-2 py-1 rounded">
                                  -{discountPct}%
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setWishlist((prev) =>
                                  prev.includes(product.id)
                                    ? prev.filter((id) => id !== product.id)
                                    : [...prev, product.id]
                                );
                              }}
                              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 hover:bg-white border border-[#C8D9E6] text-[#2F4156]"
                            >
                              <Heart
                                className={`w-4 h-4 ${
                                  wishlist.includes(product.id)
                                    ? "fill-rose-600 text-rose-600"
                                    : "text-[#2F4156]"
                                }`}
                              />
                            </button>
                          </div>

                          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <div>
                              <div className="flex items-center justify-between text-xs text-[#567C8D]">
                                <span className="font-mono">{product.sku}</span>
                                <span className="font-semibold text-amber-600">
                                  ★ {product.rating} ({product.reviewCount})
                                </span>
                              </div>
                              <h3 className="font-bold text-base mt-1 group-hover:text-[#567C8D] group-hover:underline transition">
                                {product.name}
                              </h3>
                              <p className="text-xs text-[#567C8D]">{product.nameBn}</p>
                              <p className="text-xs opacity-75 line-clamp-2 mt-2">
                                {product.description}
                              </p>
                            </div>

                            <div className="space-y-3 pt-3 border-t border-[#C8D9E6]/50">
                              <div className="flex items-baseline justify-between">
                                <div>
                                  <span className="text-lg font-bold">
                                    {formatBDT(product.salePrice)}
                                  </span>
                                  <span className="text-xs text-slate-400 line-through ml-2">
                                    {formatBDT(product.regularPrice)}
                                  </span>
                                </div>
                                <span
                                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                                    product.stockQuantity <= product.lowStockThreshold
                                      ? "bg-amber-500/15 text-amber-700"
                                      : "bg-[#C8D9E6]/60 text-[#2F4156]"
                                  }`}
                                >
                                  {product.stockQuantity} in stock
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openProductDetail(product.id);
                                  }}
                                  className="flex-1 py-2 px-3 rounded-lg border border-[#C8D9E6] text-xs font-semibold hover:bg-[#C8D9E6]/35 transition"
                                >
                                  View Details
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToCart(product.id, product.variants[0]?.id);
                                  }}
                                  className="flex-1 py-2 px-3 rounded-lg bg-[#2F4156] hover:bg-[#567C8D] text-white text-xs font-semibold transition"
                                >
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Section 4: Seasonal Promotional Banner */}
                <section className="rounded-2xl bg-[#2F4156] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#567C8D]">
                  <div className="space-y-2 max-w-xl">
                    <span className="text-xs uppercase tracking-widest text-[#C8D9E6] font-semibold">
                      Seasonal Privilege Offer
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold">
                      Save 15% on Executive Workspace Bundles
                    </h3>
                    <p className="text-xs sm:text-sm text-[#C8D9E6]">
                      Apply voucher code <strong>NEXUS15</strong> at checkout on orders over ৳4,000 for instant discount plus complimentary Dhaka courier delivery.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAppliedCoupon("NEXUS15");
                      setCouponInput("NEXUS15");
                      setStorePage("SHOP");
                      showToast("Promo code NEXUS15 activated for your shopping session!");
                    }}
                    className="px-6 py-3 rounded-lg bg-[#C8D9E6] hover:bg-white text-[#2F4156] font-bold text-xs sm:text-sm shrink-0 transition"
                  >
                    Activate NEXUS15 Offer
                  </button>
                </section>

                {/* Section 5, 6 & 7: New Arrivals, Featured Collections & Special Offers */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    onClick={() => openProductDetail("prd-3")}
                    className={`p-6 rounded-xl border space-y-3 cursor-pointer hover:border-[#567C8D] transition ${surfaceCard}`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#567C8D]">
                      New Arrivals
                    </span>
                    <h3 className="font-serif text-lg font-bold">
                      Acoustic & Desk Releases
                    </h3>
                    <p className="text-xs text-[#567C8D]">
                      Explore our latest CNC aluminum mechanical keyboards and full-spectrum studio monitor lighting.
                    </p>
                    <span className="text-xs font-bold text-[#2F4156] inline-block pt-1">
                      Explore New Arrivals →
                    </span>
                  </div>

                  <div
                    onClick={() => openProductDetail("prd-5")}
                    className="p-6 rounded-xl bg-[#C8D9E6]/50 border border-[#C8D9E6] text-[#2F4156] space-y-3 cursor-pointer hover:bg-[#C8D9E6]/70 transition"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F4156]">
                      Featured Collection
                    </span>
                    <h3 className="font-serif text-lg font-bold">
                      The Giza Cotton Sartorial Line
                    </h3>
                    <p className="text-xs text-[#2F4156]/80">
                      Tailored Egyptian cotton panjabis crafted for executive gatherings and seasonal celebrations.
                    </p>
                    <span className="text-xs font-bold underline inline-block pt-1">
                      Inspect Sartorial Line →
                    </span>
                  </div>

                  <div
                    onClick={() => setStorePage("CART")}
                    className={`p-6 rounded-xl border space-y-3 cursor-pointer hover:border-[#567C8D] transition ${surfaceCard}`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#567C8D]">
                      Special Offers
                    </span>
                    <h3 className="font-serif text-lg font-bold">
                      ৳500 Welcome Privilege
                    </h3>
                    <p className="text-xs text-[#567C8D]">
                      First-time customers enjoy ৳500 off orders above ৳3,000 using code{" "}
                      <strong>WELCOME500</strong>.
                    </p>
                    <span className="text-xs font-bold text-[#2F4156] inline-block pt-1">
                      Redeem in Cart →
                    </span>
                  </div>
                </section>

                {/* Section 8 & 9: Customer Testimonials & Newsletter Subscription */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className={`lg:col-span-7 p-7 rounded-xl border space-y-4 ${surfaceCard}`}>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#567C8D]">
                      Verified Buyer Voices
                    </span>
                    <h3 className="font-serif text-xl font-bold">
                      Customer Testimonials
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className={`p-4 rounded-lg border space-y-2 ${subtleBox}`}
                        >
                          <div className="text-xs text-amber-600 font-bold">
                            {"★".repeat(rev.rating)}
                          </div>
                          <p className="text-xs italic">
                            &ldquo;{rev.comment}&rdquo;
                          </p>
                          <div className="text-[11px] font-bold text-[#567C8D]">
                            — {rev.customerName} (Verified Purchase)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-[#C8D9E6]/50 text-[#2F4156] p-7 rounded-xl border border-[#C8D9E6] flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-[#567C8D]">
                        Private Dispatch
                      </span>
                      <h3 className="font-serif text-xl font-bold">
                        Subscribe to Our Newsletter
                      </h3>
                      <p className="text-xs text-[#2F4156]/80">
                        Receive early access to restocked flagship electronics and seasonal lookbooks.
                      </p>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newsletterEmail.trim()) return;
                        showToast(`Subscribed ${newsletterEmail} to NexusMart dispatches!`);
                        setNewsletterEmail("");
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="email"
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter your email address..."
                        className="flex-1 px-3.5 py-2.5 rounded-lg bg-white border border-[#C8D9E6] text-xs text-[#2F4156]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-lg bg-[#2F4156] hover:bg-[#567C8D] text-white text-xs font-semibold"
                      >
                        Subscribe
                      </button>
                    </form>
                  </div>
                </section>
              </div>
            )}

            {/* ============================================================== */}
            {/* 4.C PRODUCT LISTING PAGE (Entire Card Clickable -> Details!)   */}
            {/* ============================================================== */}
            {storePage === "SHOP" && (
              <div className="space-y-6">
                <div className={`flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl border ${surfaceCard}`}>
                  <div>
                    <div className="text-xs text-[#567C8D] flex items-center gap-1.5">
                      <button onClick={() => setStorePage("HOME")} className="hover:underline">
                        Home
                      </button>
                      <span>/</span>
                      <span className="font-semibold">Shop Catalog</span>
                    </div>
                    <h1 className="font-serif text-2xl font-bold mt-1">
                      Complete Collection ({filteredStoreProducts.length} Products)
                    </h1>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className={`flex items-center gap-1 p-1 rounded-lg border ${subtleBox}`}>
                      <button
                        onClick={() => setShopViewMode("GRID")}
                        className={`p-1.5 rounded ${
                          shopViewMode === "GRID"
                            ? "bg-[#2F4156] text-white"
                            : "text-[#567C8D]"
                        }`}
                        title="Grid View"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShopViewMode("LIST")}
                        className={`p-1.5 rounded ${
                          shopViewMode === "LIST"
                            ? "bg-[#2F4156] text-white"
                            : "text-[#567C8D]"
                        }`}
                        title="List View"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>

                    <span className="text-[#567C8D]">Sort by:</span>
                    <select
                      value={storeSort}
                      onChange={(e) => setStoreSort(e.target.value as any)}
                      className={`rounded-lg border px-3 py-2 font-semibold ${subtleBox}`}
                    >
                      <option value="FEATURED">Featured First</option>
                      <option value="PRICE_ASC">Price: Low to High</option>
                      <option value="PRICE_DESC">Price: High to Low</option>
                      <option value="RATING">Top Customer Rating</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <aside className="lg:col-span-3 space-y-4">
                    <div className={`p-5 rounded-xl border space-y-5 text-xs ${surfaceCard}`}>
                      <div>
                        <div className="font-bold uppercase tracking-wider mb-2.5">
                          Categories
                        </div>
                        <div className="space-y-1.5">
                          <button
                            onClick={() => setStoreCategory("ALL")}
                            className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition ${
                              storeCategory === "ALL"
                                ? "bg-[#2F4156] text-white"
                                : "hover:bg-[#C8D9E6]/35"
                            }`}
                          >
                            All Categories
                          </button>
                          {categories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => setStoreCategory(cat.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg font-semibold transition ${
                                storeCategory === cat.id
                                  ? "bg-[#2F4156] text-white"
                                  : "hover:bg-[#C8D9E6]/35"
                              }`}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#C8D9E6]/50">
                        <div className="flex justify-between font-bold mb-2">
                          <span>Max Price</span>
                          <span className="text-[#567C8D]">{formatBDT(maxPriceFilter)}</span>
                        </div>
                        <input
                          type="range"
                          min={2000}
                          max={10000}
                          step={500}
                          value={maxPriceFilter}
                          onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                          className="w-full accent-[#2F4156]"
                        />
                      </div>

                      <div className="pt-4 border-t border-[#C8D9E6]/50">
                        <label className="flex items-center gap-2 font-semibold cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inStockOnly}
                            onChange={(e) => setInStockOnly(e.target.checked)}
                          />
                          <span>In-Stock Items Only</span>
                        </label>
                      </div>
                    </div>
                  </aside>

                  <div className="lg:col-span-9">
                    <div
                      className={
                        shopViewMode === "GRID"
                          ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                          : "space-y-4"
                      }
                    >
                      {filteredStoreProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => openProductDetail(product.id)}
                          className={`group rounded-xl border overflow-hidden shadow-sm hover:shadow-md hover:border-[#567C8D] cursor-pointer flex ${
                            shopViewMode === "LIST"
                              ? "flex-col sm:flex-row items-center"
                              : "flex-col"
                          } ${surfaceCard}`}
                        >
                          <div
                            className={
                              shopViewMode === "LIST"
                                ? "w-full sm:w-56 h-48 shrink-0"
                                : "h-48 w-full border-b border-[#C8D9E6]/50"
                            }
                          >
                            <ProductVisualArtwork
                              sku={product.sku}
                              categoryId={product.categoryId}
                            />
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-3 w-full">
                            <div>
                              <div className="flex justify-between text-xs text-[#567C8D]">
                                <span className="font-mono">{product.sku}</span>
                                <span>★ {product.rating} ({product.reviewCount})</span>
                              </div>
                              <div className="font-bold text-base mt-1 group-hover:text-[#567C8D] group-hover:underline">
                                {product.name}
                              </div>
                              <p className="text-xs opacity-75 mt-1 line-clamp-2">
                                {product.description}
                              </p>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-lg font-bold">
                                {formatBDT(product.salePrice)}
                              </span>
                              <span className="text-xs text-[#567C8D]">
                                Stock: {product.stockQuantity}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openProductDetail(product.id);
                                }}
                                className="flex-1 py-2 rounded-lg border border-[#C8D9E6] text-xs font-semibold hover:bg-[#C8D9E6]/35"
                              >
                                Details
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product.id, product.variants[0]?.id);
                                }}
                                className="flex-1 py-2 rounded-lg bg-[#2F4156] hover:bg-[#567C8D] text-white text-xs font-semibold"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* 4.D PRODUCT DETAILS PAGE (2-Column + Specs, Reviews, Related)  */}
            {/* ============================================================== */}
            {storePage === "PRODUCT_DETAIL" && (() => {
              const product = products.find((p) => p.id === selectedProductId) || products[0];
              const prodReviews = reviews.filter((r) => r.productId === product.id);
              const relatedProducts = products
                .filter((p) => p.id !== product.id)
                .slice(0, 3);
              return (
                <div className="space-y-8">
                  <button
                    onClick={() => setStorePage("SHOP")}
                    className="text-xs font-semibold text-[#567C8D] hover:text-[#2F4156]"
                  >
                    ← Back to Shop Catalog
                  </button>

                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 p-7 rounded-2xl border shadow-sm ${surfaceCard}`}>
                    <div className="space-y-3">
                      <div
                        onClick={() => setZoomActive(!zoomActive)}
                        className={`h-80 rounded-xl border border-[#C8D9E6] overflow-hidden relative cursor-zoom-in transition-transform ${
                          zoomActive ? "scale-[1.03]" : ""
                        }`}
                      >
                        <ProductVisualArtwork
                          sku={product.sku}
                          categoryId={product.categoryId}
                        />
                        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-white/90 text-[#2F4156] text-[11px] font-semibold flex items-center gap-1 border border-[#C8D9E6]">
                          <ZoomIn className="w-3.5 h-3.5" /> {zoomActive ? "Reset Zoom" : "Click to Zoom"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {["Front Studio View", "Side Profile", "Packaging & Box"].map((lbl, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-lg border text-center text-[11px] font-medium text-[#567C8D] ${subtleBox}`}
                          >
                            {lbl}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[#567C8D]">
                            SKU: {product.sku} | Barcode: {product.barcode}
                          </span>
                          <span className="text-amber-600 font-bold">
                            ★★★★★ {product.rating} ({product.reviewCount} reviews)
                          </span>
                        </div>
                        <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-2">
                          {product.name}
                        </h1>
                        <p className="text-xs text-[#567C8D] mt-0.5">{product.nameBn}</p>
                        <p className="text-sm opacity-85 mt-3 leading-relaxed">
                          {product.description}
                        </p>
                      </div>

                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold">
                          {formatBDT(product.salePrice)}
                        </span>
                        <span className="text-base text-slate-400 line-through">
                          {formatBDT(product.regularPrice)}
                        </span>
                        <span className="text-xs bg-[#C8D9E6]/60 text-[#2F4156] px-2.5 py-1 rounded font-semibold">
                          {product.stockQuantity} units available
                        </span>
                      </div>

                      {product.variants.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-xs font-semibold uppercase text-[#567C8D]">
                            Select Variant:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {product.variants.map((v) => (
                              <button
                                key={v.id}
                                onClick={() => setSelectedVariantId(v.id)}
                                className={`px-3.5 py-2 rounded-lg text-xs font-semibold border transition ${
                                  selectedVariantId === v.id
                                    ? "border-[#2F4156] bg-[#2F4156] text-white"
                                    : "border-[#C8D9E6]"
                                }`}
                              >
                                {v.name} ({v.stock} in stock)
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <div className={`flex items-center border rounded-lg ${subtleBox}`}>
                          <button
                            onClick={() => setDetailQty(Math.max(1, detailQty - 1))}
                            className="px-3 py-2.5 font-bold text-sm"
                          >
                            -
                          </button>
                          <span className="px-4 font-bold text-sm">{detailQty}</span>
                          <button
                            onClick={() =>
                              setDetailQty(Math.min(product.stockQuantity, detailQty + 1))
                            }
                            className="px-3 py-2.5 font-bold text-sm"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            handleAddToCart(product.id, selectedVariantId, detailQty)
                          }
                          className="flex-1 py-3 px-5 rounded-lg bg-[#2F4156] hover:bg-[#567C8D] text-white font-semibold text-sm transition"
                        >
                          Add to Shopping Cart
                        </button>
                        <button
                          onClick={() => {
                            handleAddToCart(product.id, selectedVariantId, detailQty);
                            setStorePage("CHECKOUT");
                          }}
                          className="py-3 px-5 rounded-lg bg-[#567C8D] hover:bg-[#2F4156] text-white font-semibold text-sm transition"
                        >
                          Buy Now
                        </button>
                      </div>

                      <div className={`p-3.5 rounded-lg border text-xs space-y-1 ${subtleBox}`}>
                        <div className="font-semibold">
                          Delivery & Return Information:
                        </div>
                        <div className="text-[#567C8D]">
                          Inside Dhaka: ৳{settings.insideDhakaShipping} (24h) • Outside Dhaka: ৳{settings.outsideDhakaShipping} (48-72h) • Free over ৳{settings.freeShippingThreshold}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Below: Tabs for Description, Specifications, Reviews */}
                  <div className={`p-7 rounded-2xl border space-y-5 ${surfaceCard}`}>
                    <div className="flex gap-2 border-b border-[#C8D9E6] pb-3 text-xs font-bold">
                      <button
                        onClick={() => setDetailTab("DESCRIPTION")}
                        className={`px-4 py-2 rounded-lg ${
                          detailTab === "DESCRIPTION"
                            ? "bg-[#2F4156] text-white"
                            : "text-[#567C8D]"
                        }`}
                      >
                        Product Description
                      </button>
                      <button
                        onClick={() => setDetailTab("SPECS")}
                        className={`px-4 py-2 rounded-lg ${
                          detailTab === "SPECS"
                            ? "bg-[#2F4156] text-white"
                            : "text-[#567C8D]"
                        }`}
                      >
                        Technical Specifications
                      </button>
                      <button
                        onClick={() => setDetailTab("REVIEWS")}
                        className={`px-4 py-2 rounded-lg ${
                          detailTab === "REVIEWS"
                            ? "bg-[#2F4156] text-white"
                            : "text-[#567C8D]"
                        }`}
                      >
                        Customer Reviews ({prodReviews.length})
                      </button>
                    </div>

                    {detailTab === "DESCRIPTION" && (
                      <p className="text-sm opacity-85 leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    {detailTab === "SPECS" && (
                      <div className="divide-y divide-[#C8D9E6]/60 text-xs max-w-xl">
                        {Object.entries(product.specs || {}).map(([k, v]) => (
                          <div key={k} className="py-2.5 flex justify-between gap-4">
                            <span className="font-semibold text-[#567C8D]">{k}</span>
                            <span className="font-bold">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {detailTab === "REVIEWS" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {prodReviews.map((rev) => (
                            <div
                              key={rev.id}
                              className={`p-4 rounded-xl border ${subtleBox}`}
                            >
                              <div className="flex justify-between text-xs mb-1">
                                <span className="font-bold">{rev.customerName}</span>
                                <span className="text-amber-500">{"★".repeat(rev.rating)}</span>
                              </div>
                              <p className="text-xs opacity-85">{rev.comment}</p>
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
                          className="flex flex-wrap gap-3 pt-3 border-t border-[#C8D9E6]"
                        >
                          <input
                            type="text"
                            value={newReviewForm.customerName}
                            onChange={(e) =>
                              setNewReviewForm({
                                ...newReviewForm,
                                customerName: e.target.value
                              })
                            }
                            placeholder="Your Name"
                            className="px-3 py-2 text-xs rounded-lg border border-[#C8D9E6] bg-transparent"
                          />
                          <select
                            value={newReviewForm.rating}
                            onChange={(e) =>
                              setNewReviewForm({
                                ...newReviewForm,
                                rating: Number(e.target.value)
                              })
                            }
                            className="px-3 py-2 text-xs rounded-lg border border-[#C8D9E6] bg-transparent"
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
                            placeholder="Write your product experience..."
                            className="flex-1 min-w-[200px] px-3 py-2 text-xs rounded-lg border border-[#C8D9E6] bg-transparent"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-[#2F4156] text-white text-xs font-semibold"
                          >
                            Submit Review
                          </button>
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Related Products */}
                  <div className="space-y-4">
                    <h3 className="font-serif text-xl font-bold">Related Products</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      {relatedProducts.map((rp) => (
                        <div
                          key={rp.id}
                          onClick={() => openProductDetail(rp.id)}
                          className={`p-4 rounded-xl border cursor-pointer hover:border-[#2F4156] transition flex items-center justify-between ${surfaceCard}`}
                        >
                          <div>
                            <div className="font-bold text-xs">{rp.name}</div>
                            <div className="text-xs font-bold text-[#567C8D] mt-0.5">
                              {formatBDT(rp.salePrice)}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-[#567C8D]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SHOPPING CART & CHECKOUT */}
            {(storePage === "CART" || storePage === "CHECKOUT") && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className={`p-6 rounded-xl border space-y-4 ${surfaceCard}`}>
                    <h2 className="font-serif text-xl font-bold">
                      Shopping Cart & Stock Verification
                    </h2>
                    {cartDetails.lines.length === 0 ? (
                      <div className="text-center py-8 text-[#567C8D] text-sm">
                        Your shopping cart is empty.{" "}
                        <button
                          onClick={() => setStorePage("SHOP")}
                          className="text-[#2F4156] font-semibold underline"
                        >
                          Browse products
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cartDetails.lines.map((line, i) => (
                          <div
                            key={i}
                            className={`flex items-center justify-between gap-4 p-4 rounded-lg border ${subtleBox}`}
                          >
                            <div
                              onClick={() => openProductDetail(line.product.id)}
                              className="cursor-pointer"
                            >
                              <div className="font-bold text-sm hover:underline">
                                {line.product.name}
                              </div>
                              <div className="text-xs text-[#567C8D]">
                                SKU: {line.product.sku}{" "}
                                {line.variant ? `| Variant: ${line.variant.name}` : ""}
                              </div>
                              <div className="text-xs font-semibold mt-0.5">
                                {formatBDT(line.unitPrice)} each
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
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
                                className="w-7 h-7 rounded border border-[#C8D9E6] bg-white text-[#2F4156] font-bold"
                              >
                                -
                              </button>
                              <span className="text-sm font-bold w-6 text-center">
                                {line.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleAddToCart(line.productId, line.variantId)
                                }
                                className="w-7 h-7 rounded border border-[#C8D9E6] bg-white text-[#2F4156] font-bold"
                              >
                                +
                              </button>
                              <div className="w-24 text-right font-bold text-sm">
                                {formatBDT(line.totalPrice)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#C8D9E6]">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Promo Code (e.g. NEXUS15 or WELCOME500)"
                        className="px-3.5 py-2 text-xs rounded-lg border border-[#C8D9E6] bg-transparent flex-1"
                      />
                      <button
                        onClick={() => {
                          setAppliedCoupon(couponInput);
                          showToast(`Applied promo code: ${couponInput}`);
                        }}
                        className="px-4 py-2 rounded-lg bg-[#567C8D] hover:bg-[#2F4156] text-white text-xs font-semibold"
                      >
                        Apply Coupon
                      </button>
                    </div>
                  </div>

                  <form
                    onSubmit={handlePlaceOrder}
                    className={`p-6 rounded-xl border space-y-4 ${surfaceCard}`}
                  >
                    <h3 className="font-serif text-lg font-bold">
                      Delivery & Payment Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="font-semibold block mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={checkoutForm.customerName}
                          onChange={(e) =>
                            setCheckoutForm({ ...checkoutForm, customerName: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#C8D9E6] bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1">Mobile Number (BD) *</label>
                        <input
                          type="text"
                          required
                          value={checkoutForm.customerPhone}
                          onChange={(e) =>
                            setCheckoutForm({ ...checkoutForm, customerPhone: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#C8D9E6] bg-transparent"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="font-semibold block mb-1">Detailed Delivery Address *</label>
                        <input
                          type="text"
                          required
                          value={checkoutForm.deliveryAddress}
                          onChange={(e) =>
                            setCheckoutForm({ ...checkoutForm, deliveryAddress: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#C8D9E6] bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1">Delivery Zone</label>
                        <select
                          value={checkoutForm.deliveryZone}
                          onChange={(e) =>
                            setCheckoutForm({
                              ...checkoutForm,
                              deliveryZone: e.target.value as any
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#C8D9E6] bg-transparent"
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
                        <label className="font-semibold block mb-1">Payment Method</label>
                        <select
                          value={checkoutForm.paymentMethod}
                          onChange={(e) =>
                            setCheckoutForm({
                              ...checkoutForm,
                              paymentMethod: e.target.value as PaymentMethod
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#C8D9E6] bg-transparent"
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
                            <label className="font-semibold block mb-1">
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
                              className="w-full px-3 py-2 rounded-lg border border-[#C8D9E6] bg-transparent"
                            />
                          </div>
                          <div>
                            <label className="font-semibold block mb-1">Sender Account / Phone</label>
                            <input
                              type="text"
                              value={checkoutForm.senderPhone}
                              onChange={(e) =>
                                setCheckoutForm({ ...checkoutForm, senderPhone: e.target.value })
                              }
                              placeholder="017XXXXXXXX"
                              className="w-full px-3 py-2 rounded-lg border border-[#C8D9E6] bg-transparent"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-lg bg-[#2F4156] hover:bg-[#567C8D] text-white font-bold text-sm transition"
                    >
                      Confirm & Place Order ({formatBDT(cartDetails.grandTotal)})
                    </button>
                  </form>
                </div>

                <div className={`p-6 rounded-xl border h-fit space-y-3 text-sm ${surfaceCard}`}>
                  <h3 className="font-serif font-bold text-base border-b border-[#C8D9E6] pb-2">
                    Order Summary
                  </h3>
                  <div className="flex justify-between">
                    <span className="text-[#567C8D]">Subtotal</span>
                    <span className="font-semibold">{formatBDT(cartDetails.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount ({appliedCoupon || "None"})</span>
                    <span>-{formatBDT(cartDetails.discountAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#567C8D]">
                      Delivery ({checkoutForm.deliveryZone})
                    </span>
                    <span className="font-semibold">{formatBDT(cartDetails.deliveryCharge)}</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold border-t border-[#C8D9E6] pt-2">
                    <span>Grand Total</span>
                    <span>{formatBDT(cartDetails.grandTotal)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* WISHLIST VIEW */}
            {storePage === "WISHLIST" && (
              <div className={`p-6 rounded-xl border space-y-4 ${surfaceCard}`}>
                <h2 className="font-serif text-xl font-bold">Saved Wishlist ({wishlist.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {products
                    .filter((p) => wishlist.includes(p.id))
                    .map((p) => (
                      <div
                        key={p.id}
                        onClick={() => openProductDetail(p.id)}
                        className="p-4 rounded-lg border border-[#C8D9E6] flex flex-col justify-between gap-3 cursor-pointer hover:border-[#2F4156]"
                      >
                        <div>
                          <div className="font-bold text-sm hover:underline">{p.name}</div>
                          <div className="text-xs text-[#567C8D]">{p.nameBn}</div>
                          <div className="text-sm font-bold mt-1">
                            {formatBDT(p.salePrice)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(p.id, p.variants[0]?.id);
                            }}
                            className="flex-1 py-1.5 rounded bg-[#2F4156] text-white text-xs font-semibold"
                          >
                            Move to Cart
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setWishlist((prev) => prev.filter((id) => id !== p.id));
                            }}
                            className="px-3 py-1.5 rounded border border-[#C8D9E6] text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* CUSTOMER ACCOUNT DASHBOARD & ORDER TRACKING */}
            {(storePage === "CUSTOMER_DASHBOARD" || storePage === "TRACK_ORDER") && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <aside className="lg:col-span-3">
                  <div className={`rounded-xl border p-4 space-y-1 text-xs font-semibold ${surfaceCard}`}>
                    <div className="p-3 rounded-lg bg-[#C8D9E6]/50 text-[#2F4156] mb-2">
                      <div className="font-bold text-sm">{customerLoginName}</div>
                      <div className="text-[11px] text-[#567C8D]">{customerLoginEmail}</div>
                    </div>
                    {[
                      { id: "OVERVIEW", label: "Overview" },
                      { id: "MY_ORDERS", label: "My Orders" },
                      { id: "TRACKING", label: "Order Tracking" },
                      { id: "WISHLIST", label: "Wishlist" },
                      { id: "ADDRESSES", label: "My Addresses" },
                      { id: "PROFILE", label: "Profile Settings" },
                      { id: "PASSWORD", label: "Change Password" }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setCustomerDashTab(t.id as any)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          customerDashTab === t.id
                            ? "bg-[#2F4156] text-white"
                            : "hover:bg-[#C8D9E6]/35"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </aside>

                <div className="lg:col-span-9 space-y-6">
                  <div className={`p-6 rounded-xl border space-y-4 ${surfaceCard}`}>
                    <h2 className="font-serif text-xl font-bold">
                      Real-Time Order & Courier Tracking
                    </h2>
                    <div className="flex gap-2 max-w-lg">
                      <input
                        type="text"
                        value={trackingQuery}
                        onChange={(e) => setTrackingQuery(e.target.value)}
                        placeholder="Enter Order ID (e.g. ORD-20261110-8821) or Phone"
                        className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-[#C8D9E6] bg-transparent"
                      />
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
                          className={`p-5 rounded-xl border space-y-4 ${subtleBox}`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="font-mono font-bold text-base">
                                {ord.orderNumber}
                              </span>
                              <span className="text-xs text-[#567C8D] ml-3">{ord.createdAt}</span>
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
                                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#2F4156] text-white text-xs font-semibold"
                              >
                                <Printer className="w-3.5 h-3.5" /> View / Print Invoice
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <div className="text-[#567C8D] uppercase font-semibold">
                                Recipient
                              </div>
                              <div className="font-bold">{ord.customerName}</div>
                              <div>{ord.customerPhone}</div>
                              <div>{ord.deliveryAddress}</div>
                            </div>
                            <div>
                              <div className="text-[#567C8D] uppercase font-semibold">
                                Courier & Tracking
                              </div>
                              <div className="font-bold">Provider: {ord.courierProvider}</div>
                              <div>Tracking #: {ord.trackingNumber || "Assigning soon"}</div>
                            </div>
                            <div>
                              <div className="text-[#567C8D] uppercase font-semibold">
                                Payment Summary
                              </div>
                              <div className="font-bold">
                                Total: {formatBDT(ord.grandTotal)} ({ord.paymentMethod})
                              </div>
                              <div>Status: {ord.paymentStatus}</div>
                            </div>
                          </div>

                          <div className="border-t border-[#C8D9E6] pt-3">
                            <div className="text-xs font-semibold mb-2">Status Timeline:</div>
                            <div className="space-y-1.5">
                              {ord.history.map((h) => (
                                <div key={h.id} className="text-xs flex items-center gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#567C8D] shrink-0" />
                                  <span className="font-semibold">{h.newState}</span>
                                  <span className="text-[#567C8D]">— {h.note}</span>
                                  <span className="text-slate-400 ml-auto">{h.createdAt}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* UNIFIED AUTHENTICATION & SUPERUSER SETUP PORTAL */}
            {storePage === "AUTH" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className={`rounded-2xl border overflow-hidden shadow-md ${surfaceCard}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[#C8D9E6] text-xs font-bold">
                    <button
                      onClick={() => setAuthMode("STAFF_LOGIN")}
                      className={`py-4 px-5 flex items-center justify-center gap-2 transition ${
                        authMode === "STAFF_LOGIN"
                          ? "bg-[#2F4156] text-white"
                          : "text-[#567C8D] hover:bg-[#C8D9E6]/30"
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>1. Staff & Admin Sign In</span>
                    </button>
                    <button
                      onClick={() => setAuthMode("SUPERUSER_SETUP")}
                      className={`py-4 px-5 flex items-center justify-center gap-2 transition ${
                        authMode === "SUPERUSER_SETUP"
                          ? "bg-[#567C8D] text-white"
                          : "text-[#2F4156] hover:bg-[#C8D9E6]/30"
                      }`}
                    >
                      <Crown className="w-4 h-4" />
                      <span>2. Create / Set Superuser</span>
                    </button>
                    <button
                      onClick={() => setAuthMode("CUSTOMER_LOGIN")}
                      className={`py-4 px-5 flex items-center justify-center gap-2 transition ${
                        authMode === "CUSTOMER_LOGIN"
                          ? "bg-[#2F4156] text-white"
                          : "text-[#567C8D] hover:bg-[#C8D9E6]/30"
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
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#567C8D]">
                              Protected RBAC Staff Portal
                            </span>
                            <h2 className="font-serif text-2xl font-bold mt-1">
                              Sign In to Admin & Staff ERP
                            </h2>
                            <p className="text-xs text-[#567C8D] mt-1">
                              Normal customers never see the admin menu. Sign in below to unlock the Admin, Moderator, or Delivery Dashboard for your role.
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
                                className="w-full px-3.5 py-2.5 rounded-lg border border-[#C8D9E6] bg-transparent"
                              />
                            </div>
                            <div>
                              <label className="font-bold block mb-1">Password</label>
                              <input
                                type="password"
                                required
                                value={staffLoginPassword}
                                onChange={(e) => setStaffLoginPassword(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-[#C8D9E6] bg-transparent"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 rounded-lg bg-[#2F4156] hover:bg-[#567C8D] text-white font-bold text-xs transition"
                          >
                            Unlock Admin & Staff Dashboard →
                          </button>
                        </form>

                        <div className={`p-5 rounded-xl border space-y-3 ${subtleBox}`}>
                          <div className="text-xs font-bold uppercase tracking-wider">
                            1-Click Instant Role Login (Pre-Seeded Staff)
                          </div>
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
                                    if (r?.slug === "MODERATOR") setAdminTab("MODERATOR_DESK");
                                    else if (r?.slug === "DELIVERY_STAFF")
                                      setAdminTab("DELIVERY_DESK");
                                    else setAdminTab("DASHBOARD");
                                    showToast(`Signed in as ${stf.name} (${r?.name})`);
                                  }}
                                  className={`w-full p-3 rounded-lg border hover:border-[#2F4156] flex items-center justify-between text-left text-xs transition ${surfaceCard}`}
                                >
                                  <div>
                                    <div className="font-bold flex items-center gap-1.5">
                                      <span>{stf.name}</span>
                                      {(stf.isSuperuser || r?.slug === "SUPER_ADMIN") && (
                                        <Crown className="w-3.5 h-3.5 text-[#567C8D]" />
                                      )}
                                    </div>
                                    <div className="text-[11px] text-[#567C8D]">{stf.email}</div>
                                  </div>
                                  <span className="px-2.5 py-1 rounded bg-[#C8D9E6]/60 text-[#2F4156] font-bold text-[11px]">
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
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-[#C8D9E6] text-[#2F4156] px-2.5 py-1 rounded">
                              <Crown className="w-3.5 h-3.5" /> Superuser Configuration
                            </span>
                            <h2 className="font-serif text-2xl font-bold mt-2">
                              Create or Promote a Superuser (`SUPER_ADMIN`)
                            </h2>
                            <p className="text-xs text-[#567C8D] mt-1">
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
                                className="w-full px-3.5 py-2.5 rounded-lg border border-[#C8D9E6] bg-transparent"
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
                                className="w-full px-3.5 py-2.5 rounded-lg border border-[#C8D9E6] bg-transparent"
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
                                className="w-full px-3.5 py-2.5 rounded-lg border border-[#C8D9E6] bg-transparent"
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
                                className="w-full px-3.5 py-2.5 rounded-lg border border-[#C8D9E6] bg-transparent"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-3 rounded-lg bg-[#2F4156] hover:bg-[#567C8D] text-white font-bold text-xs transition flex items-center justify-center gap-2"
                          >
                            <Crown className="w-4 h-4" />
                            <span>Create Superuser & Launch Admin Dashboard</span>
                          </button>
                        </form>

                        <div className="bg-[#2F4156] text-white p-6 rounded-xl space-y-4 text-xs">
                          <div className="font-bold text-[#C8D9E6] uppercase tracking-wider flex items-center gap-1.5">
                            <KeyRound className="w-4 h-4" /> How to Set a Superuser Locally
                          </div>
                          <div className="space-y-3">
                            <div className="p-3 rounded-lg bg-[#243344] border border-[#567C8D]/40">
                              <div className="font-bold">1. Default Seeded Superuser</div>
                              <div className="font-mono text-[11px] text-[#C8D9E6] mt-1">
                                Email: superadmin@nexusmart.com.bd | Pass: Password123!
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-[#243344] border border-[#567C8D]/40">
                              <div className="font-bold">2. Terminal CLI Command</div>
                              <div className="font-mono text-[11px] text-[#C8D9E6] mt-1">
                                npm run create-superuser -- your@email.com &quot;Name&quot; &quot;Pass123!&quot;
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {authMode === "CUSTOMER_LOGIN" && (
                      <div className="max-w-md mx-auto space-y-4">
                        <h2 className="font-serif text-2xl font-bold">Customer Account Sign In</h2>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
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
                              className="w-full px-3.5 py-2.5 rounded-lg border border-[#C8D9E6] bg-transparent"
                            />
                          </div>
                          <div>
                            <label className="font-bold block mb-1">Email</label>
                            <input
                              type="email"
                              required
                              value={customerLoginEmail}
                              onChange={(e) => setCustomerLoginEmail(e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-lg border border-[#C8D9E6] bg-transparent"
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full py-3 rounded-lg bg-[#2F4156] text-white font-bold"
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

            {/* ABOUT, CONTACT, PRIVACY, TERMS */}
            {(storePage === "ABOUT" ||
              storePage === "CONTACT" ||
              storePage === "PRIVACY" ||
              storePage === "TERMS") && (
              <div className={`p-8 rounded-2xl border max-w-3xl mx-auto space-y-4 ${surfaceCard}`}>
                {storePage === "ABOUT" && (
                  <>
                    <h2 className="font-serif text-2xl font-bold">About {settings.companyName}</h2>
                    <p className="text-sm text-[#567C8D] leading-relaxed">
                      {settings.companyName} ({settings.companyNameBn}) is a flagship multi-role eCommerce platform engineered with Next.js App Router, Prisma ORM, PostgreSQL, and granular Role-Based Access Control.
                    </p>
                  </>
                )}
                {storePage === "CONTACT" && (
                  <>
                    <h2 className="font-serif text-2xl font-bold">Contact & Showroom Support</h2>
                    <p className="text-sm text-[#567C8D]">
                      Address: {settings.companyAddress} ({settings.companyAddressBn})
                    </p>
                    <p className="text-sm text-[#567C8D]">
                      Hotline: {settings.companyPhone} | Email: {settings.companyEmail}
                    </p>
                  </>
                )}
                {storePage === "PRIVACY" && (
                  <>
                    <h2 className="font-serif text-2xl font-bold">Privacy Policy</h2>
                    <p className="text-sm text-[#567C8D]">
                      Customer phone numbers, addresses, and payment transaction references are encrypted, validated via Zod schemas, and restricted strictly to authorized order fulfillment personnel under RBAC audit logging.
                    </p>
                  </>
                )}
                {storePage === "TERMS" && (
                  <>
                    <h2 className="font-serif text-2xl font-bold">Terms & Conditions</h2>
                    <p className="text-sm text-[#567C8D]">{settings.invoiceTermsEn}</p>
                    <p className="text-sm text-[#567C8D]">{settings.invoiceTermsBn}</p>
                  </>
                )}
              </div>
            )}
          </main>

          {/* Storefront Footer in Official Navy (#2F4156) */}
          <footer className="bg-[#2F4156] text-[#C8D9E6] text-xs py-10 px-4 border-t border-[#567C8D]/40 mt-12">
            <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-6">
              <div>
                <div className="text-white font-serif font-bold text-base">
                  {settings.companyName}
                </div>
                <p className="mt-1">{settings.companyAddress}</p>
                <p>Hotline: {settings.companyPhone}</p>
              </div>
              <div className="flex flex-wrap gap-4 items-center">
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
                  className="px-3.5 py-1.5 rounded-lg bg-[#567C8D] hover:bg-white text-white hover:text-[#2F4156] font-semibold transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Staff & Superuser Login</span>
                </button>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PORTAL 2: ENTERPRISE SAAS ADMIN, MODERATOR & DELIVERY DASHBOARDS     */}
      {/* ==================================================================== */}
      {isStaffLoggedIn && portalMode === "ADMIN" && (
        <div className="max-w-[1440px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
          <aside
            className={`no-print shrink-0 transition-all ${
              sidebarCollapsed ? "w-full lg:w-20" : "w-full lg:w-64"
            }`}
          >
            <div className="bg-[#2F4156] text-white rounded-2xl border border-[#567C8D]/40 p-4 space-y-4 shadow-lg sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-[#567C8D]/40">
                {!sidebarCollapsed && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#C8D9E6]">
                      Logged-In Role
                    </div>
                    <div className="font-bold text-sm">{activeStaff.name}</div>
                    <div className="text-xs text-[#C8D9E6]">
                      {activeRole.name} ({activeStaff.employeeCode})
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="p-2 rounded-lg bg-[#243344] hover:bg-[#567C8D] text-[#C8D9E6] hover:text-white"
                  title="Collapse / Expand Sidebar"
                >
                  <Menu className="w-4 h-4" />
                </button>
              </div>

              <nav className="space-y-1 text-xs font-medium">
                {[
                  { id: "DASHBOARD", label: "Dashboard & KPIs", icon: BarChart3, perm: "dashboard.view" },
                  { id: "MODERATOR_DESK", label: "Moderator Workspace", icon: UserCheck, perm: ["orders.confirm", "orders.view_assigned"] },
                  { id: "DELIVERY_DESK", label: "Delivery Rider App", icon: Truck, perm: ["delivery.view", "delivery.update"] },
                  { id: "ORDERS", label: `Orders (${visibleOrders.length})`, icon: ClipboardList, perm: ["orders.view_all", "orders.view_assigned"] },
                  { id: "INVOICES", label: "Invoice & Memo Printing", icon: Printer, perm: ["invoices.print", "invoices.bulk_print", "orders.view_assigned"] },
                  { id: "PRODUCTS", label: "Products Catalog", icon: Package, perm: "products.view" },
                  { id: "CATEGORIES", label: "Categories", icon: Layers, perm: "categories.manage" },
                  { id: "INVENTORY", label: "Inventory & Ledger", icon: RefreshCw, perm: "inventory.view" },
                  { id: "CUSTOMERS", label: `Customers (${customers.length})`, icon: User, perm: "customers.manage" },
                  { id: "ASSIGNMENTS", label: "Order Assignments & COD", icon: CheckCircle2, perm: ["orders.assign", "delivery.view", "orders.view_assigned"] },
                  { id: "STAFF", label: "Staff & Audit Logs", icon: Users, perm: "staff.manage" },
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
                      title={item.label}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition ${
                        adminTab === item.id
                          ? "bg-[#567C8D] text-white font-semibold shadow-sm"
                          : allowed
                          ? "text-[#F5F1EE] hover:bg-[#243344]"
                          : "text-slate-400 opacity-50 hover:bg-[#243344]"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                      </span>
                      {!sidebarCollapsed && !allowed && (
                        <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="flex-1 min-w-0 space-y-6">
            {/* Breadcrumb & Global Search Topbar */}
            <div className={`no-print px-5 py-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-4 shadow-sm ${surfaceCard}`}>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#567C8D]">Admin Portal</span>
                <span>/</span>
                <span className="font-bold">{adminTab}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#567C8D] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Quick search order ID or phone..."
                    className={`pl-8 pr-3 py-1.5 text-xs rounded-lg border w-48 sm:w-64 ${subtleBox}`}
                  />
                </div>
                <button
                  onClick={() => setAdminTab("ORDERS")}
                  className="p-2 rounded-lg bg-[#C8D9E6]/50 text-[#2F4156] relative"
                  title="Pending Order Alerts"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#2F4156] text-white text-[10px] font-bold flex items-center justify-center">
                    {kpiMetrics.pendingCount}
                  </span>
                </button>
              </div>
            </div>

            {/* ADMIN DASHBOARD OVERVIEW */}
            {adminTab === "DASHBOARD" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-xl border flex flex-wrap items-center justify-between gap-4 shadow-sm ${surfaceCard}`}>
                  <div>
                    <h1 className="font-serif text-2xl font-bold">
                      Executive eCommerce Dashboard — {activeRole.name} View
                    </h1>
                    <p className="text-xs text-[#567C8D] mt-0.5">
                      Real-time operations telemetry. Restricted financial figures automatically adapt to your RBAC permissions.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setAdminTab("ORDERS")}
                      className="px-4 py-2 rounded-lg bg-[#2F4156] hover:bg-[#567C8D] text-white text-xs font-semibold transition"
                    >
                      Manage Orders
                    </button>
                    <button
                      onClick={() => setAdminTab("INVOICES")}
                      className="px-4 py-2 rounded-lg bg-[#567C8D] hover:bg-[#2F4156] text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Order Memos
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                  {[
                    {
                      label: "Total Revenue",
                      value: hasPerm("financials.view") ? formatBDT(kpiMetrics.totalRevenue) : "Restricted",
                      sub: "+18.4% vs last week",
                      icon: DollarSign
                    },
                    {
                      label: "Today's Sales",
                      value: hasPerm("financials.view") ? formatBDT(kpiMetrics.todayRevenue) : "Restricted",
                      sub: "10 Nov 2026",
                      icon: TrendingUp
                    },
                    {
                      label: "Monthly Sales",
                      value: hasPerm("financials.view") ? formatBDT(kpiMetrics.totalRevenue * 4) : "Restricted",
                      sub: "Nov 2026 Run-Rate",
                      icon: BarChart3
                    },
                    {
                      label: "Total Orders",
                      value: `${orders.length}`,
                      sub: `${visibleOrders.length} in your scope`,
                      icon: ClipboardList
                    },
                    {
                      label: "Pending Orders",
                      value: `${kpiMetrics.pendingCount}`,
                      sub: "Awaiting confirmation",
                      icon: AlertTriangle
                    },
                    {
                      label: "Confirmed Orders",
                      value: `${kpiMetrics.confirmedCount}`,
                      sub: "Ready for packing",
                      icon: CheckCircle2
                    },
                    {
                      label: "Delivered Orders",
                      value: `${kpiMetrics.deliveredCount}`,
                      sub: "Completed fulfillment",
                      icon: Truck
                    },
                    {
                      label: "Total Customers",
                      value: `${customers.length}`,
                      sub: "2 VIP Repeat Buyers",
                      icon: Users
                    },
                    {
                      label: "Total Products",
                      value: `${products.length}`,
                      sub: `${categories.length} Categories`,
                      icon: Package
                    },
                    {
                      label: "Low Stock Products",
                      value: `${kpiMetrics.lowStockProducts.length} SKUs`,
                      sub: "Below threshold",
                      icon: RefreshCw
                    }
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <div
                        key={i}
                        className={`p-4 rounded-xl border shadow-sm flex flex-col justify-between ${surfaceCard}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-[#567C8D]">
                            {stat.label}
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-[#C8D9E6]/60 text-[#2F4156] flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div className="text-xl font-bold mt-2">
                          {stat.value}
                        </div>
                        <div className="text-[10px] text-[#567C8D] mt-1">{stat.sub}</div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className={`lg:col-span-2 p-6 rounded-xl border shadow-sm ${surfaceCard}`}>
                    <h3 className="font-bold text-sm mb-1">
                      7-Day Revenue & Order Volume Trend
                    </h3>
                    <p className="text-xs text-[#567C8D] mb-4">
                      Navy (#2F4156) Gross Revenue vs. Teal (#567C8D) Net Profit
                    </p>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={REVENUE_CHART_DATA}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#C8D9E6" opacity={0.5} />
                          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#567C8D" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#567C8D" }} />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            name="Revenue (BDT)"
                            stroke="#2F4156"
                            strokeWidth={2.5}
                            fill="#C8D9E6"
                            fillOpacity={0.5}
                          />
                          {hasPerm("financials.view") && (
                            <Area
                              type="monotone"
                              dataKey="profit"
                              name="Net Profit (BDT)"
                              stroke="#567C8D"
                              strokeWidth={2.5}
                              fill="#567C8D"
                              fillOpacity={0.25}
                            />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className={`p-6 rounded-xl border shadow-sm ${surfaceCard}`}>
                    <h3 className="font-bold text-sm mb-1">Order Status Distribution</h3>
                    <p className="text-xs text-[#567C8D] mb-3">Live pipeline donut chart</p>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={kpiMetrics.statusPie}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={42}
                            outerRadius={72}
                            label
                          >
                            {kpiMetrics.statusPie.map((_, idx) => (
                              <Cell key={idx} fill={BRAND_PIE_COLORS[idx % BRAND_PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className={`p-6 rounded-xl border shadow-sm ${surfaceCard}`}>
                    <h3 className="font-bold text-sm mb-3">
                      Staff Order Fulfillment Performance
                    </h3>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={staffList}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#C8D9E6" opacity={0.4} />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#567C8D" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#567C8D" }} />
                          <Tooltip />
                          <Bar dataKey="ordersAssigned" name="Assigned" fill="#2F4156" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="ordersCompleted" name="Completed" fill="#567C8D" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className={`p-6 rounded-xl border shadow-sm space-y-3 ${surfaceCard}`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm">Low-Stock Inventory Alerts</h3>
                      <button
                        onClick={() => setAdminTab("INVENTORY")}
                        className="text-xs text-[#567C8D] font-semibold hover:underline"
                      >
                        Restock Now →
                      </button>
                    </div>
                    {kpiMetrics.lowStockProducts.map((p) => (
                      <div
                        key={p.id}
                        className={`flex items-center justify-between p-3.5 rounded-lg border text-xs ${subtleBox}`}
                      >
                        <div>
                          <div className="font-bold">{p.name}</div>
                          <div className="text-[#567C8D]">SKU: {p.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-amber-600">
                            {p.stockQuantity} left
                          </div>
                          <div className="text-[11px] text-[#567C8D]">
                            Alert Threshold: {p.lowStockThreshold}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* MODERATOR WORKSPACE */}
            {adminTab === "MODERATOR_DESK" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-xl border flex flex-wrap items-center justify-between gap-4 ${surfaceCard}`}>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#567C8D]">
                      Rapid Order Verification Desk
                    </span>
                    <h2 className="font-serif text-xl font-bold mt-0.5">
                      Moderator Operational Workspace
                    </h2>
                    <p className="text-xs text-[#567C8D]">
                      Streamlined queue for calling customers, confirming pending orders, adding internal notes, and printing order memos.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Assigned Orders", val: visibleOrders.length },
                    { label: "Pending Confirmation", val: kpiMetrics.pendingCount },
                    { label: "Processing Orders", val: kpiMetrics.confirmedCount },
                    { label: "Completed Orders", val: kpiMetrics.deliveredCount }
                  ].map((c, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${surfaceCard}`}
                    >
                      <div className="text-xs text-[#567C8D]">{c.label}</div>
                      <div className="text-2xl font-bold mt-1">{c.val}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  {visibleOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className={`p-5 rounded-xl border grid grid-cols-1 lg:grid-cols-12 gap-4 items-center text-xs ${surfaceCard}`}
                    >
                      <div className="lg:col-span-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm">
                            {ord.orderNumber}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeStyle(
                              ord.orderStatus
                            )}`}
                          >
                            {ord.orderStatus}
                          </span>
                        </div>
                        <div className="font-bold text-sm">{ord.customerName}</div>
                        <div className="text-[#567C8D] font-semibold">
                          Phone: {ord.customerPhone} • {formatBDT(ord.grandTotal)} ({ord.paymentMethod})
                        </div>
                        <div className="opacity-75">{ord.deliveryAddress}</div>
                      </div>

                      <div className="lg:col-span-4">
                        <label className="text-[11px] font-semibold text-[#567C8D] block mb-1">
                          Internal Verification Note:
                        </label>
                        <input
                          type="text"
                          value={ord.internalNotes}
                          onChange={(e) => {
                            const val = e.target.value;
                            setOrders((prev) =>
                              prev.map((o) =>
                                o.id === ord.id ? { ...o, internalNotes: val } : o
                              )
                            );
                          }}
                          className={`w-full px-3 py-2 rounded-lg border ${subtleBox}`}
                        />
                      </div>

                      <div className="lg:col-span-4 flex flex-wrap justify-end gap-2">
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(
                              ord.id,
                              "CONFIRMED",
                              "Customer confirmed order via moderator call"
                            )
                          }
                          className="px-4 py-2.5 rounded-lg bg-[#2F4156] hover:bg-[#567C8D] text-white font-semibold"
                        >
                          Confirm Order
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(
                              ord.id,
                              "PROCESSING",
                              "Sent to warehouse packing queue"
                            )
                          }
                          className="px-4 py-2.5 rounded-lg bg-[#567C8D] text-white font-semibold"
                        >
                          Send to Packing
                        </button>
                        <button
                          onClick={() => handleBulkPrintMemos([ord.id])}
                          className="px-3.5 py-2.5 rounded-lg border border-[#2F4156] font-semibold flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5" /> Memo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DELIVERY RIDER MOBILE DISPATCH */}
            {adminTab === "DELIVERY_DESK" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-xl border ${surfaceCard}`}>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#567C8D]">
                    One-Handed Field Logistics
                  </span>
                  <h2 className="font-serif text-xl font-bold mt-0.5">
                    Delivery Rider Mobile Dispatch Cards
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {visibleOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className={`p-6 rounded-xl border space-y-4 shadow-sm ${surfaceCard}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-base">
                          {ord.orderNumber}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeStyle(
                            ord.orderStatus
                          )}`}
                        >
                          {ord.orderStatus}
                        </span>
                      </div>

                      <div className={`p-4 rounded-lg border space-y-1 text-xs ${subtleBox}`}>
                        <div className="font-bold text-sm">{ord.customerName}</div>
                        <div className="font-semibold text-[#567C8D]">
                          Phone: {ord.customerPhone}
                        </div>
                        <div className="opacity-85">{ord.deliveryAddress}</div>
                        <div className="pt-2 font-bold text-sm">
                          COD Amount to Collect: {formatBDT(ord.grandTotal)} ({ord.paymentMethod})
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold">
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(
                              ord.id,
                              "DELIVERED",
                              `Delivered & collected cash ${formatBDT(ord.grandTotal)}`,
                              ord.grandTotal
                            )
                          }
                          className="py-3 px-4 rounded-lg bg-[#2F4156] hover:bg-[#567C8D] text-white"
                        >
                          ✓ Mark Delivered & Collect COD
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateOrderStatus(
                              ord.id,
                              "RETURNED",
                              "Customer unreachable / parcel returned"
                            )
                          }
                          className="py-3 px-4 rounded-lg border border-rose-500/40 text-rose-600"
                        >
                          ↺ Mark Returned
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ORDERS */}
            {adminTab === "ORDERS" && (
              <div className="space-y-5">
                <div className={`p-6 rounded-xl border space-y-4 shadow-sm ${surfaceCard}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-serif text-xl font-bold">Advanced Order Management</h2>
                      <p className="text-xs text-[#567C8D]">
                        {hasPerm("orders.view_all")
                          ? "Showing all platform orders"
                          : `Showing orders assigned to ${activeStaff.name}`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleBulkPrintMemos(selectedOrderIds)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2F4156] hover:bg-[#567C8D] text-white text-xs font-semibold shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Bulk Print Memos ({selectedOrderIds.length})
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 text-[#567C8D] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Search by Order Number, Customer Name, or Phone..."
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-[#C8D9E6] bg-transparent"
                      />
                    </div>
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="px-3 py-2 text-xs rounded-lg border border-[#C8D9E6] bg-transparent font-semibold"
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
                        <tr className={`border-b uppercase ${subtleBox}`}>
                          <th className="py-3 px-2.5">
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
                          <th className="py-3 px-2.5">Order ID & Date</th>
                          <th className="py-3 px-2.5">Customer & Phone</th>
                          <th className="py-3 px-2.5">Total & Payment</th>
                          <th className="py-3 px-2.5">Status</th>
                          <th className="py-3 px-2.5">Assigned Staff</th>
                          <th className="py-3 px-2.5">Memo Prints</th>
                          <th className="py-3 px-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C8D9E6]/60">
                        {visibleOrders.map((ord) => {
                          const mod = staffList.find((s) => s.id === ord.assignedModeratorId);
                          return (
                            <tr
                              key={ord.id}
                              className="hover:bg-[#C8D9E6]/20 transition"
                            >
                              <td className="py-3 px-2.5">
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
                              <td className="py-3 px-2.5">
                                <div className="font-mono font-bold">
                                  {ord.orderNumber}
                                </div>
                                <div className="text-[11px] text-[#567C8D]">{ord.createdAt}</div>
                              </td>
                              <td className="py-3 px-2.5">
                                <div className="font-bold">{ord.customerName}</div>
                                <div className="text-[#567C8D]">{ord.customerPhone}</div>
                                <div className="text-[11px] opacity-70 truncate max-w-[180px]">
                                  {ord.deliveryAddress}
                                </div>
                              </td>
                              <td className="py-3 px-2.5">
                                <div className="font-bold">{formatBDT(ord.grandTotal)}</div>
                                <div className="text-[11px] text-[#567C8D]">
                                  {ord.paymentMethod} ({ord.paymentStatus})
                                </div>
                              </td>
                              <td className="py-3 px-2.5">
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
                              <td className="py-3 px-2.5">
                                <div className="text-[11px]">
                                  Mod: <span className="font-semibold">{mod?.name || "Unassigned"}</span>
                                </div>
                                <div className="text-[11px] text-[#567C8D]">
                                  Courier: {ord.courierProvider}
                                </div>
                              </td>
                              <td className="py-3 px-2.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] ${subtleBox}`}>
                                  <Printer className="w-3 h-3" /> {ord.memoPrintCount}x
                                </span>
                              </td>
                              <td className="py-3 px-2.5 text-right space-x-1.5">
                                <button
                                  onClick={() => setInspectingOrderId(ord.id)}
                                  className="px-2.5 py-1.5 rounded-lg border border-[#C8D9E6] font-semibold hover:bg-[#C8D9E6]/30"
                                >
                                  Details
                                </button>
                                <button
                                  onClick={() => handleBulkPrintMemos([ord.id])}
                                  className="px-2.5 py-1.5 rounded-lg bg-[#567C8D] hover:bg-[#2F4156] text-white font-semibold"
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
                    <div className={`p-6 rounded-xl border-2 border-[#567C8D] space-y-4 ${surfaceCard}`}>
                      <div className="flex items-center justify-between border-b border-[#C8D9E6] pb-3">
                        <div>
                          <h3 className="font-serif text-lg font-bold">
                            Order Details & Audit History — {ord.orderNumber}
                          </h3>
                          <p className="text-xs text-[#567C8D]">
                            Printed {ord.memoPrintCount} time(s){" "}
                            {ord.lastPrintedBy ? `| Last printed by ${ord.lastPrintedBy}` : ""}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBulkPrintMemos([ord.id])}
                            className="px-3.5 py-1.5 rounded-lg bg-[#2F4156] text-white text-xs font-semibold flex items-center gap-1"
                          >
                            <Printer className="w-3.5 h-3.5" /> Open in Memo Printer
                          </button>
                          <button
                            onClick={() => setInspectingOrderId(null)}
                            className="p-1.5 rounded-lg border border-[#C8D9E6]"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className={`p-4 rounded-lg space-y-1 ${subtleBox}`}>
                          <div className="font-bold text-[#567C8D] uppercase">
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
                              className={`w-full p-2 rounded-lg border ${surfaceCard}`}
                            />
                          ) : (
                            <p className="text-rose-500">
                              Requires orders.internal_notes permission.
                            </p>
                          )}
                        </div>

                        <div className={`p-4 rounded-lg space-y-1.5 ${subtleBox}`}>
                          <div className="font-bold text-[#567C8D] uppercase">
                            Status Audit Trail
                          </div>
                          {ord.history.map((h) => (
                            <div key={h.id} className="flex justify-between">
                              <span>
                                <strong>{h.newState}</strong> ({h.changedBy}): {h.note}
                              </span>
                              <span className="text-[#567C8D]">{h.createdAt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* INVOICES */}
            {adminTab === "INVOICES" && (
              <div className="space-y-6">
                <div className={`no-print p-6 rounded-xl border space-y-4 shadow-sm ${surfaceCard}`}>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F4156] bg-[#C8D9E6] px-2.5 py-0.5 rounded">
                        Commercial Printing Engine
                      </span>
                      <h2 className="font-serif text-xl font-bold mt-1">
                        Order Memo & Invoice Printing Center
                      </h2>
                      <p className="text-xs text-[#567C8D]">
                        Supports A4 Corporate Invoice, 80mm POS Thermal Receipt, and Compact Order Memo with Bengali & English typography.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleTriggerBrowserPrint}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#2F4156] hover:bg-[#567C8D] text-white text-xs font-bold shadow"
                      >
                        <Printer className="w-4 h-4" />
                        Print Now ({printQueueIds.length} Memo{printQueueIds.length > 1 ? "s" : ""})
                      </button>
                      <button
                        onClick={handleDownloadInvoiceHtml}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#567C8D] hover:bg-[#2F4156] text-white text-xs font-bold shadow"
                      >
                        <Download className="w-4 h-4" />
                        Download Invoice File
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-[#C8D9E6] text-xs">
                    <div>
                      <label className="font-semibold block mb-1.5 text-[#567C8D]">
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
                            className={`flex-1 py-2 px-2.5 rounded-lg font-semibold border ${
                              invoiceLayout === tpl.id
                                ? "bg-[#2F4156] text-white border-[#2F4156]"
                                : "border-[#C8D9E6]"
                            }`}
                          >
                            {tpl.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold block mb-1.5 text-[#567C8D]">
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
                            className={`flex-1 py-2 px-2.5 rounded-lg font-semibold border ${
                              invoiceLang === lng.id
                                ? "bg-[#2F4156] text-white border-[#2F4156]"
                                : "border-[#C8D9E6]"
                            }`}
                          >
                            {lng.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold block mb-1.5 text-[#567C8D]">
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
                                  ? "bg-[#567C8D] text-white border-[#567C8D]"
                                  : "border-[#C8D9E6]"
                              }`}
                            >
                              {o.orderNumber.slice(-4)} ({o.memoPrintCount}x)
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setPrintQueueIds(visibleOrders.map((o) => o.id))}
                          className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#C8D9E6]/60 text-[#2F4156]"
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
                          className={`bg-white text-[#2F4156] rounded-xl shadow-md border border-[#C8D9E6] mx-auto transition-all ${
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
                            } border-b-2 border-[#2F4156] pb-4 mb-4`}
                          >
                            <div className="space-y-0.5">
                              <div className="inline-flex items-center gap-2">
                                <span className="w-7 h-7 rounded bg-[#2F4156] text-white font-serif font-bold flex items-center justify-center text-sm">
                                  N
                                </span>
                                <span className="font-bold text-base tracking-tight">
                                  {invoiceLang === "bn"
                                    ? settings.companyNameBn
                                    : invoiceLang === "en"
                                    ? settings.companyName
                                    : `${settings.companyName} | ${settings.companyNameBn}`}
                                </span>
                              </div>
                              <p className="text-xs text-[#567C8D]">
                                {invoiceLang === "bn"
                                  ? settings.companyAddressBn
                                  : settings.companyAddress}
                              </p>
                              <p className="text-xs text-[#567C8D] font-semibold">
                                Hotline: {settings.companyPhone} | {settings.companyEmail}
                              </p>
                            </div>

                            <div
                              className={
                                invoiceLayout === "THERMAL_80MM"
                                  ? "border-t border-dashed border-[#C8D9E6] pt-2"
                                  : "text-right"
                              }
                            >
                              <div className="font-extrabold uppercase tracking-wider text-xs text-[#567C8D]">
                                {invoiceLayout === "THERMAL_80MM"
                                  ? "80MM POS RECEIPT / ক্যাশ মেমো"
                                  : invoiceLayout === "COMPACT_MEMO"
                                  ? "COMPACT ORDER MEMO / অর্ডার স্লিপ"
                                  : "OFFICIAL COMMERCIAL INVOICE / অর্ডার মেমো"}
                              </div>
                              <div className="font-mono font-bold text-base">
                                {order.orderNumber}
                              </div>
                              <div className="text-[11px] text-[#567C8D]">
                                Date: {order.createdAt}
                              </div>
                              {order.trackingNumber && (
                                <div className="text-[11px] font-mono font-semibold">
                                  Courier: {order.courierProvider} ({order.trackingNumber})
                                </div>
                              )}
                            </div>
                          </div>

                          <div
                            className={`grid ${
                              invoiceLayout === "THERMAL_80MM" ? "grid-cols-1 gap-2" : "grid-cols-2 gap-4"
                            } mb-4 bg-[#F5F1EE] p-3.5 rounded-lg border border-[#C8D9E6] text-xs`}
                          >
                            <div>
                              <div className="font-bold uppercase text-[#567C8D] text-[10px]">
                                {invoiceLang === "bn"
                                  ? "গ্রাহকের তথ্য (Billed & Shipped To)"
                                  : "Customer & Delivery Info / গ্রাহকের তথ্য"}
                              </div>
                              <div className="font-bold text-[#2F4156] mt-0.5">
                                {order.customerName}
                              </div>
                              <div className="font-semibold">Phone: {order.customerPhone}</div>
                              <div>{order.deliveryAddress}</div>
                              <div className="text-[#567C8D]">Zone: {order.deliveryZone}</div>
                            </div>

                            <div
                              className={
                                invoiceLayout === "THERMAL_80MM"
                                  ? "border-t border-dashed border-[#C8D9E6] pt-2"
                                  : "text-right"
                              }
                            >
                              <div className="font-bold uppercase text-[#567C8D] text-[10px]">
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
                              <tr className="bg-[#F5F1EE] border-b-2 border-[#2F4156] text-left">
                                <th className="py-2 px-2">
                                  {invoiceLang === "bn" ? "পণ্যের বিবরণ" : "Product / বিবরণ"}
                                </th>
                                {invoiceLayout !== "THERMAL_80MM" && (
                                  <th className="py-2 px-2">SKU</th>
                                )}
                                <th className="py-2 px-2 text-center">Qty</th>
                                <th className="py-2 px-2 text-right">Unit</th>
                                <th className="py-2 px-2 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#C8D9E6]">
                              {order.items.map((item, i) => (
                                <tr key={i}>
                                  <td className="py-2 px-2">
                                    {invoiceLang !== "bn" && (
                                      <div className="font-bold text-[#2F4156]">
                                        {item.productName}
                                      </div>
                                    )}
                                    {invoiceLang !== "en" && (
                                      <div className="text-[#567C8D] font-medium">
                                        {item.productNameBn}
                                      </div>
                                    )}
                                    {item.variantName && (
                                      <div className="text-[11px] text-[#567C8D]">
                                        Variant: {item.variantName}
                                      </div>
                                    )}
                                  </td>
                                  {invoiceLayout !== "THERMAL_80MM" && (
                                    <td className="py-2 px-2 font-mono text-[11px]">{item.sku}</td>
                                  )}
                                  <td className="py-2 px-2 text-center font-semibold">
                                    {item.quantity}
                                  </td>
                                  <td className="py-2 px-2 text-right">
                                    {formatBDT(item.unitPrice)}
                                  </td>
                                  <td className="py-2 px-2 text-right font-bold">
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
                            } border-t border-[#C8D9E6] pt-3 mb-4 text-xs`}
                          >
                            <div className="space-y-1 max-w-xs">
                              {order.customerNotes && (
                                <div>
                                  <span className="font-bold">Customer Note: </span>
                                  <span className="text-[#567C8D]">{order.customerNotes}</span>
                                </div>
                              )}
                              <div className="text-[11px] text-[#567C8D]">
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
                              <div className="flex justify-between py-1.5 mt-1 border-t-2 border-[#2F4156] font-extrabold text-sm">
                                <span>Grand Total / সর্বমোট:</span>
                                <span>{formatBDT(order.grandTotal)}</span>
                              </div>
                            </div>
                          </div>

                          {invoiceLayout === "A4_STANDARD" && (
                            <div className="grid grid-cols-2 gap-12 pt-8 pb-4 text-xs text-[#567C8D]">
                              <div className="border-t border-[#C8D9E6] pt-1 text-center">
                                Customer Signature / গ্রাহকের স্বাক্ষর
                              </div>
                              <div className="border-t border-[#C8D9E6] pt-1 text-center">
                                Authorized Signatory ({activeStaff.name})
                              </div>
                            </div>
                          )}

                          <div className="border-t border-dashed border-[#C8D9E6] pt-3 text-center text-[11px] text-[#567C8D] space-y-1">
                            {invoiceLang !== "bn" && <p>{settings.invoiceTermsEn}</p>}
                            {invoiceLang !== "en" && <p>{settings.invoiceTermsBn}</p>}
                            <p className="font-bold text-[#2F4156] pt-1">
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

            {/* PRODUCTS */}
            {adminTab === "PRODUCTS" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-xl border space-y-4 ${surfaceCard}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-serif text-xl font-bold">
                        Product Catalog & SKU Management
                      </h2>
                      <p className="text-xs text-[#567C8D]">
                        Purchase cost prices are strictly protected by the{" "}
                        <code className="font-mono">products.purchase_price</code> permission.
                      </p>
                    </div>
                    <button
                      onClick={handleExportProductsCsv}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#567C8D] hover:bg-[#2F4156] text-white text-xs font-semibold"
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
                          specs: { Warranty: "12 Months Official Warranty" },
                          regularPrice: Number(newProductForm.regularPrice),
                          salePrice: Number(newProductForm.salePrice),
                          purchasePrice: Number(newProductForm.purchasePrice),
                          stockQuantity: Number(newProductForm.stockQuantity),
                          lowStockThreshold: Number(newProductForm.lowStockThreshold),
                          isFeatured: true,
                          isActive: true,
                          rating: 5.0,
                          reviewCount: 1,
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
                      className={`grid grid-cols-2 md:grid-cols-6 gap-3 p-4 rounded-xl border text-xs ${subtleBox}`}
                    >
                      <input
                        type="text"
                        required
                        value={newProductForm.name}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, name: e.target.value })
                        }
                        placeholder="Product Name (EN)"
                        className={`px-3 py-2 rounded-lg border ${surfaceCard}`}
                      />
                      <input
                        type="text"
                        value={newProductForm.nameBn}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, nameBn: e.target.value })
                        }
                        placeholder="নাম (বাংলা)"
                        className={`px-3 py-2 rounded-lg border ${surfaceCard}`}
                      />
                      <input
                        type="text"
                        required
                        value={newProductForm.sku}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, sku: e.target.value })
                        }
                        placeholder="SKU (e.g. NX-700)"
                        className={`px-3 py-2 rounded-lg border ${surfaceCard}`}
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
                        className={`px-3 py-2 rounded-lg border ${surfaceCard}`}
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
                        className={`px-3 py-2 rounded-lg border ${surfaceCard}`}
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-[#2F4156] hover:bg-[#567C8D] text-white font-semibold"
                      >
                        + Add Product
                      </button>
                    </form>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className={`border-b uppercase ${subtleBox}`}>
                          <th className="py-2.5 px-2.5">Product / বাংলা নাম</th>
                          <th className="py-2.5 px-2.5">SKU & Barcode</th>
                          <th className="py-2.5 px-2.5">Sale Price</th>
                          <th className="py-2.5 px-2.5">Purchase Cost (RBAC)</th>
                          <th className="py-2.5 px-2.5">Stock</th>
                          <th className="py-2.5 px-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C8D9E6]/60">
                        {products.map((p) => (
                          <tr key={p.id}>
                            <td className="py-2.5 px-2.5">
                              <div className="font-bold">{p.name}</div>
                              <div className="text-[#567C8D]">{p.nameBn}</div>
                            </td>
                            <td className="py-2.5 px-2.5 font-mono">
                              <div>{p.sku}</div>
                              <div className="text-[10px] text-[#567C8D]">{p.barcode}</div>
                            </td>
                            <td className="py-2.5 px-2.5 font-bold">
                              {formatBDT(p.salePrice)}
                            </td>
                            <td className="py-2.5 px-2.5">
                              {hasPerm("products.purchase_price") ? (
                                <span className="font-mono font-semibold text-emerald-700">
                                  {formatBDT(p.purchasePrice)}
                                </span>
                              ) : (
                                <span className="text-rose-500 flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Restricted
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-2.5">
                              <span
                                className={`px-2 py-0.5 rounded font-bold ${
                                  p.stockQuantity <= p.lowStockThreshold
                                    ? "bg-amber-500/15 text-amber-700"
                                    : "bg-[#C8D9E6]/60 text-[#2F4156]"
                                }`}
                              >
                                {p.stockQuantity} pcs
                              </span>
                            </td>
                            <td className="py-2.5 px-2.5 text-right">
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
                                    ? "bg-[#C8D9E6]/60 text-[#2F4156]"
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

            {/* CATEGORIES */}
            {adminTab === "CATEGORIES" && (
              <div className={`p-6 rounded-xl border space-y-4 ${surfaceCard}`}>
                <h2 className="font-serif text-xl font-bold">
                  Product Categories & Bilingual Labels
                </h2>
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
                        itemCount: 0,
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
                    className="px-3 py-2 rounded-lg border border-[#C8D9E6] bg-transparent"
                  />
                  <input
                    type="text"
                    value={newCategoryForm.nameBn}
                    onChange={(e) =>
                      setNewCategoryForm({ ...newCategoryForm, nameBn: e.target.value })
                    }
                    placeholder="ক্যাটাগরি নাম (বাংলা)"
                    className="px-3 py-2 rounded-lg border border-[#C8D9E6] bg-transparent"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#2F4156] text-white font-semibold"
                  >
                    + Create Category
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl border border-[#C8D9E6] flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-sm">{c.name}</div>
                        <div className="text-xs text-[#567C8D]">{c.nameBn}</div>
                      </div>
                      <span className={`text-xs font-mono px-2.5 py-1 rounded ${subtleBox}`}>
                        /{c.slug}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INVENTORY */}
            {adminTab === "INVENTORY" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-xl border space-y-4 ${surfaceCard}`}>
                  <h2 className="font-serif text-xl font-bold">
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
                        createdAt: "2026-11-10 05:50 PM"
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
                    className={`grid grid-cols-1 md:grid-cols-5 gap-3 p-4 rounded-xl border text-xs ${subtleBox}`}
                  >
                    <select
                      value={stockAdjustForm.productId}
                      onChange={(e) =>
                        setStockAdjustForm({ ...stockAdjustForm, productId: e.target.value })
                      }
                      className={`px-3 py-2 rounded-lg border ${surfaceCard}`}
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
                      className={`px-3 py-2 rounded-lg border ${surfaceCard}`}
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
                      className={`px-3 py-2 rounded-lg border ${surfaceCard}`}
                    />
                    <input
                      type="text"
                      value={stockAdjustForm.note}
                      onChange={(e) =>
                        setStockAdjustForm({ ...stockAdjustForm, note: e.target.value })
                      }
                      placeholder="Reason / PO Reference"
                      className={`px-3 py-2 rounded-lg border ${surfaceCard}`}
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-[#2F4156] text-white font-semibold"
                    >
                      Record Movement
                    </button>
                  </form>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className={`border-b uppercase ${subtleBox}`}>
                          <th className="py-2.5 px-2.5">Timestamp</th>
                          <th className="py-2.5 px-2.5">Product & SKU</th>
                          <th className="py-2.5 px-2.5">Movement Type</th>
                          <th className="py-2.5 px-2.5">Prev → Delta → New</th>
                          <th className="py-2.5 px-2.5">Reference & Note</th>
                          <th className="py-2.5 px-2.5">Staff</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C8D9E6]/60">
                        {inventoryTx.map((tx) => (
                          <tr key={tx.id}>
                            <td className="py-2.5 px-2.5 text-[#567C8D]">{tx.createdAt}</td>
                            <td className="py-2.5 px-2.5">
                              <div className="font-bold">{tx.productName}</div>
                              <div className="font-mono text-[11px] text-[#567C8D]">{tx.sku}</div>
                            </td>
                            <td className="py-2.5 px-2.5 font-mono text-[11px]">{tx.type}</td>
                            <td className="py-2.5 px-2.5 font-mono">
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
                            <td className="py-2.5 px-2.5">
                              <span className="font-mono font-semibold">{tx.referenceId}</span>:{" "}
                              {tx.note}
                            </td>
                            <td className="py-2.5 px-2.5 font-semibold">{tx.performedBy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* CUSTOMERS */}
            {adminTab === "CUSTOMERS" && (
              <div className={`p-6 rounded-xl border space-y-4 ${surfaceCard}`}>
                <h2 className="font-serif text-xl font-bold">
                  Customer Directory & Purchase History
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b uppercase ${subtleBox}`}>
                        <th className="py-3 px-2.5">Customer</th>
                        <th className="py-3 px-2.5">Phone & Email</th>
                        <th className="py-3 px-2.5">Total Orders</th>
                        <th className="py-3 px-2.5">Total Spent</th>
                        <th className="py-3 px-2.5">Registered</th>
                        <th className="py-3 px-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C8D9E6]/60">
                      {customers.map((c) => (
                        <tr key={c.id}>
                          <td className="py-3 px-2.5">
                            <div className="font-bold">{c.name}</div>
                            <div className="text-[11px] text-[#567C8D]">{c.address}</div>
                          </td>
                          <td className="py-3 px-2.5">
                            <div className="font-semibold">{c.phone}</div>
                            <div className="text-[#567C8D]">{c.email}</div>
                          </td>
                          <td className="py-3 px-2.5 font-bold">{c.totalOrders} orders</td>
                          <td className="py-3 px-2.5 font-bold">
                            {formatBDT(c.totalSpent)}
                          </td>
                          <td className="py-3 px-2.5 text-[#567C8D]">{c.registeredAt}</td>
                          <td className="py-3 px-2.5">
                            <span className="px-2.5 py-0.5 rounded bg-[#C8D9E6]/60 text-[#2F4156] font-bold">
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ORDER ASSIGNMENTS & COD */}
            {adminTab === "ASSIGNMENTS" && (
              <div className={`p-6 rounded-xl border space-y-4 ${surfaceCard}`}>
                <h2 className="font-serif text-xl font-bold">
                  Moderator, Order Processor & Delivery Rider Assignments
                </h2>
                <div className="space-y-3">
                  {visibleOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-xl border border-[#C8D9E6] grid grid-cols-1 md:grid-cols-4 gap-4 items-center text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold">
                          {ord.orderNumber}
                        </div>
                        <div className="font-bold">{ord.customerName}</div>
                        <div className="text-[#567C8D]">{ord.customerPhone}</div>
                        <div className="opacity-70">{ord.deliveryAddress}</div>
                      </div>

                      <div>
                        <label className="text-[11px] text-[#567C8D] block">
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
                          className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-[#C8D9E6] bg-transparent"
                        >
                          {staffList.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.employeeCode})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-[#567C8D] block">
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
                          className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-[#C8D9E6] bg-transparent"
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
                          className="px-3 py-1.5 rounded-lg bg-[#2F4156] text-white font-semibold"
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
                          className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-500 font-semibold"
                        >
                          Mark Returned (Auto-Restock)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STAFF MANAGEMENT, SUPERUSER & AUDIT LOGS */}
            {adminTab === "STAFF" && (
              <div className="space-y-6">
                <div className="rounded-xl bg-[#2F4156] text-white p-6 border border-[#567C8D] space-y-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-[#C8D9E6] text-[#2F4156] px-2.5 py-0.5 rounded">
                      <Crown className="w-3.5 h-3.5" /> Superuser (`SUPER_ADMIN`) Management
                    </span>
                    <h2 className="font-serif text-xl font-bold mt-2">
                      Set or Promote a Superuser
                    </h2>
                    <p className="text-xs text-[#C8D9E6] mt-0.5">
                      Create a new Superuser below or click <strong>&quot;Make Superuser&quot;</strong> on any staff row.
                    </p>
                  </div>

                  {hasPerm("staff.manage") && (
                    <form
                      onSubmit={handleCreateOrPromoteSuperuser}
                      className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-[#243344] border border-[#567C8D]/40 text-xs"
                    >
                      <input
                        type="text"
                        required
                        value={superuserForm.name}
                        onChange={(e) =>
                          setSuperuserForm({ ...superuserForm, name: e.target.value })
                        }
                        placeholder="Superuser Full Name"
                        className="px-3 py-2 rounded-lg border border-[#567C8D] bg-[#1B2634] text-white"
                      />
                      <input
                        type="email"
                        required
                        value={superuserForm.email}
                        onChange={(e) =>
                          setSuperuserForm({ ...superuserForm, email: e.target.value })
                        }
                        placeholder="Superuser Email"
                        className="px-3 py-2 rounded-lg border border-[#567C8D] bg-[#1B2634] text-white"
                      />
                      <input
                        type="text"
                        value={superuserForm.phone}
                        onChange={(e) =>
                          setSuperuserForm({ ...superuserForm, phone: e.target.value })
                        }
                        placeholder="Phone Number"
                        className="px-3 py-2 rounded-lg border border-[#567C8D] bg-[#1B2634] text-white"
                      />
                      <input
                        type="password"
                        required
                        value={superuserForm.password}
                        onChange={(e) =>
                          setSuperuserForm({ ...superuserForm, password: e.target.value })
                        }
                        placeholder="Password"
                        className="px-3 py-2 rounded-lg border border-[#567C8D] bg-[#1B2634] text-white"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-[#C8D9E6] hover:bg-white text-[#2F4156] font-bold flex items-center justify-center gap-1"
                      >
                        <Crown className="w-4 h-4" /> + Create Superuser
                      </button>
                    </form>
                  )}
                </div>

                <div className={`p-6 rounded-xl border space-y-4 ${surfaceCard}`}>
                  <h2 className="font-serif text-xl font-bold">Multi-Role Staff Management</h2>
                  {hasPerm("staff.manage") && (
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
                          joinDate: "10 Nov 2026",
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
                      className={`grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 rounded-xl border text-xs ${subtleBox}`}
                    >
                      <input
                        type="text"
                        required
                        value={newStaffForm.name}
                        onChange={(e) =>
                          setNewStaffForm({ ...newStaffForm, name: e.target.value })
                        }
                        placeholder="Full Name"
                        className={`px-3 py-2 rounded-lg border ${surfaceCard}`}
                      />
                      <input
                        type="email"
                        required
                        value={newStaffForm.email}
                        onChange={(e) =>
                          setNewStaffForm({ ...newStaffForm, email: e.target.value })
                        }
                        placeholder="Email Address"
                        className={`px-3 py-2 rounded-lg border ${surfaceCard}`}
                      />
                      <input
                        type="text"
                        value={newStaffForm.designation}
                        onChange={(e) =>
                          setNewStaffForm({ ...newStaffForm, designation: e.target.value })
                        }
                        placeholder="Designation"
                        className={`px-3 py-2 rounded-lg border ${surfaceCard}`}
                      />
                      <select
                        value={newStaffForm.roleId}
                        onChange={(e) =>
                          setNewStaffForm({ ...newStaffForm, roleId: e.target.value })
                        }
                        className={`px-3 py-2 rounded-lg border ${surfaceCard}`}
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-[#2F4156] text-white font-semibold"
                      >
                        + Create Staff
                      </button>
                    </form>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className={`border-b uppercase ${subtleBox}`}>
                          <th className="py-2.5 px-2.5">Staff Member</th>
                          <th className="py-2.5 px-2.5">Role</th>
                          <th className="py-2.5 px-2.5">Assigned / Completed / Cancelled</th>
                          <th className="py-2.5 px-2.5">Join Date</th>
                          <th className="py-2.5 px-2.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#C8D9E6]/60">
                        {staffList.map((stf) => {
                          const r = roles.find((rl) => rl.id === stf.roleId);
                          const isSu = stf.isSuperuser || r?.slug === "SUPER_ADMIN";
                          return (
                            <tr key={stf.id}>
                              <td className="py-2.5 px-2.5">
                                <div className="font-bold flex items-center gap-1.5">
                                  <span>
                                    {stf.name} ({stf.employeeCode})
                                  </span>
                                  {isSu && (
                                    <span className="px-2 py-0.5 rounded bg-[#C8D9E6] text-[#2F4156] text-[10px] font-bold">
                                      SUPERUSER
                                    </span>
                                  )}
                                </div>
                                <div className="text-[#567C8D]">{stf.email}</div>
                              </td>
                              <td className="py-2.5 px-2.5 font-semibold text-[#567C8D]">
                                {r?.name}
                              </td>
                              <td className="py-2.5 px-2.5 font-mono">
                                {stf.ordersAssigned} /{" "}
                                <span className="text-emerald-600 font-bold">
                                  {stf.ordersCompleted}
                                </span>{" "}
                                / <span className="text-rose-500">{stf.ordersCancelled}</span>
                              </td>
                              <td className="py-2.5 px-2.5 text-[#567C8D]">{stf.joinDate}</td>
                              <td className="py-2.5 px-2.5 text-right space-x-2">
                                {!isSu && (
                                  <button
                                    onClick={() => handlePromoteStaffToSuperuser(stf.id)}
                                    className="px-2.5 py-1 rounded bg-[#C8D9E6]/60 text-[#2F4156] font-semibold"
                                  >
                                    Make Superuser
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setActiveStaffId(stf.id);
                                    showToast(`Switched active session to ${stf.name}`);
                                  }}
                                  className="px-3 py-1 rounded bg-[#2F4156] text-white font-semibold"
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

                <div className={`p-6 rounded-xl border space-y-3 ${surfaceCard}`}>
                  <h3 className="font-bold text-sm">Immutable Staff Activity Audit Log</h3>
                  <div className="space-y-2">
                    {activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-xs ${subtleBox}`}
                      >
                        <div>
                          <span className="font-bold">{log.staffName}</span>{" "}
                          <span className="text-[#567C8D] font-semibold">[{log.staffRole}]</span>{" "}
                          — <span className="font-mono font-bold">{log.action}</span>:{" "}
                          <span>{log.details}</span>
                        </div>
                        <span className="text-[#567C8D] font-mono text-[11px]">
                          {log.createdAt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ROLES & PERMISSIONS */}
            {adminTab === "ROLES" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-xl border space-y-5 ${surfaceCard}`}>
                  <div>
                    <h2 className="font-serif text-xl font-bold">
                      Custom Role Builder & Grouped 28-Permission Matrix
                    </h2>
                    <p className="text-xs text-[#567C8D]">
                      Configure custom roles grouped by operational module (Dashboard, Orders, Products, Inventory, Invoices, Staff, Reports, Settings).
                    </p>
                  </div>

                  {hasPerm("roles.manage") && (
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
                      className={`space-y-5 p-5 rounded-xl border text-xs ${subtleBox}`}
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
                          className={`px-3 py-2 rounded-lg border ${surfaceCard}`}
                        />
                        <input
                          type="text"
                          value={newRoleForm.description}
                          onChange={(e) =>
                            setNewRoleForm({ ...newRoleForm, description: e.target.value })
                          }
                          placeholder="Role description"
                          className={`px-3 py-2 rounded-lg border ${surfaceCard}`}
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-[#2F4156] text-white font-bold"
                        >
                          + Save Custom Role ({newRoleForm.permissions.length} Perms)
                        </button>
                      </div>

                      <div className="space-y-4">
                        {groupedPermissions.map(([moduleName, perms]) => (
                          <div key={moduleName} className="space-y-2">
                            <div className="font-bold uppercase tracking-wider text-[11px] text-[#567C8D]">
                              {moduleName}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                              {perms.map((perm) => {
                                const checked = newRoleForm.permissions.includes(perm.code);
                                return (
                                  <label
                                    key={perm.code}
                                    className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer ${
                                      checked
                                        ? "border-[#2F4156] bg-[#C8D9E6]/50 text-[#2F4156]"
                                        : surfaceCard
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
                                      <div className="font-mono text-[10px] text-[#567C8D]">
                                        {perm.code}
                                      </div>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roles.map((r) => (
                      <div
                        key={r.id}
                        className="p-4 rounded-xl border border-[#C8D9E6] space-y-2"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm">{r.name}</span>
                          <span className="text-[11px] font-mono bg-[#C8D9E6]/60 text-[#2F4156] px-2 py-0.5 rounded font-semibold">
                            {r.permissions.length} permissions
                          </span>
                        </div>
                        <p className="text-xs text-[#567C8D]">{r.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PAYMENTS, SHIPPING, COUPONS, REPORTS & SETTINGS */}
            {(adminTab === "PAYMENTS" ||
              adminTab === "SHIPPING" ||
              adminTab === "COUPONS" ||
              adminTab === "REPORTS" ||
              adminTab === "SETTINGS") && (
              <div className="space-y-6">
                {adminTab === "PAYMENTS" && (
                  <div className={`p-6 rounded-xl border space-y-4 ${surfaceCard}`}>
                    <h2 className="font-serif text-xl font-bold">
                      Payment Verification & Gateway Architecture (SSLCommerz, bKash, Nagad, Stripe)
                    </h2>
                    <div className="space-y-2">
                      {orders.map((o) => (
                        <div
                          key={o.id}
                          className="p-3.5 rounded-lg border border-[#C8D9E6] flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <div>
                            <span className="font-mono font-bold">{o.orderNumber}</span> —{" "}
                            <span>{o.customerName}</span> ({o.paymentMethod})
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
                              className="px-3 py-1 rounded bg-[#2F4156] text-white font-semibold"
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
                  <div className={`p-6 rounded-xl border space-y-4 ${surfaceCard}`}>
                    <h2 className="font-serif text-xl font-bold">
                      Courier Integration & Dispatch (Steadfast, Pathao Courier, RedX)
                    </h2>
                    <div className="space-y-3">
                      {orders.map((o) => (
                        <div
                          key={o.id}
                          className="p-3.5 rounded-lg border border-[#C8D9E6] flex flex-wrap items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-bold">
                              {o.orderNumber} — {o.customerName} ({o.deliveryZone})
                            </div>
                            <div className="text-[#567C8D]">{o.deliveryAddress}</div>
                            <div className="font-mono mt-0.5">
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
                                className="px-3 py-1.5 rounded-lg border border-[#C8D9E6] font-semibold hover:bg-[#2F4156] hover:text-white"
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
                  <div className={`p-6 rounded-xl border space-y-4 ${surfaceCard}`}>
                    <h2 className="font-serif text-xl font-bold">
                      Coupons & Promotional Discounts
                    </h2>
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
                        className="px-3 py-2 rounded-lg border border-[#C8D9E6] bg-transparent"
                      />
                      <select
                        value={newCouponForm.discountType}
                        onChange={(e) =>
                          setNewCouponForm({
                            ...newCouponForm,
                            discountType: e.target.value as any
                          })
                        }
                        className="px-3 py-2 rounded-lg border border-[#C8D9E6] bg-transparent"
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
                        className="px-3 py-2 rounded-lg border border-[#C8D9E6] bg-transparent"
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
                        className="px-3 py-2 rounded-lg border border-[#C8D9E6] bg-transparent"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-[#2F4156] text-white font-semibold"
                      >
                        + Create Coupon
                      </button>
                    </form>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {coupons.map((c) => (
                        <div
                          key={c.id}
                          className="p-4 rounded-xl border border-[#C8D9E6] flex justify-between items-center"
                        >
                          <div>
                            <div className="font-mono font-bold text-sm">{c.code}</div>
                            <div className="text-[#567C8D]">
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
                  <div className={`p-6 rounded-xl border space-y-4 ${surfaceCard}`}>
                    <h2 className="font-serif text-xl font-bold">
                      Financial & Profitability Reports
                    </h2>
                    {hasPerm("financials.view") ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                        <div className={`p-4 rounded-xl border ${subtleBox}`}>
                          <div className="text-[#567C8D]">Today&apos;s Sales</div>
                          <div className="text-xl font-extrabold mt-1">
                            {formatBDT(kpiMetrics.todayRevenue)}
                          </div>
                        </div>
                        <div className={`p-4 rounded-xl border ${subtleBox}`}>
                          <div className="text-[#567C8D]">Weekly Sales</div>
                          <div className="text-xl font-extrabold mt-1">
                            {formatBDT(kpiMetrics.totalRevenue)}
                          </div>
                        </div>
                        <div className={`p-4 rounded-xl border ${subtleBox}`}>
                          <div className="text-[#567C8D]">Net Profit Margin</div>
                          <div className="text-xl font-extrabold text-emerald-700 mt-1">
                            {formatBDT(kpiMetrics.grossProfit)}
                          </div>
                        </div>
                        <div className={`p-4 rounded-xl border ${subtleBox}`}>
                          <div className="text-[#567C8D]">Delivered Orders</div>
                          <div className="text-xl font-extrabold mt-1">
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
                  <div className={`p-6 rounded-xl border space-y-5 ${surfaceCard}`}>
                    <div>
                      <h2 className="font-serif text-xl font-bold">
                        Website & Bilingual Invoice Header Configuration
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-3 border-b border-[#C8D9E6] pb-3 text-xs font-semibold">
                        {[
                          { id: "GENERAL", label: "General & Company" },
                          { id: "BRANDING", label: "Branding & Palette" },
                          { id: "SHIPPING", label: "Shipping Rates" },
                          { id: "PAYMENT", label: "Payment Gateways" },
                          { id: "INVOICE", label: "Invoice Terms" },
                          { id: "SEO_LEGAL", label: "SEO & Legal" }
                        ].map((st) => (
                          <button
                            key={st.id}
                            onClick={() => setSettingsSubTab(st.id as any)}
                            className={`px-3.5 py-1.5 rounded-lg ${
                              settingsSubTab === st.id
                                ? "bg-[#2F4156] text-white"
                                : "bg-[#F5F1EE] text-[#2F4156]"
                            }`}
                          >
                            {st.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="font-semibold block mb-1">Company Name (English)</label>
                        <input
                          type="text"
                          value={settings.companyName}
                          onChange={(e) =>
                            setSettings({ ...settings, companyName: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#C8D9E6] bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1">Company Name (বাংলা)</label>
                        <input
                          type="text"
                          value={settings.companyNameBn}
                          onChange={(e) =>
                            setSettings({ ...settings, companyNameBn: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#C8D9E6] bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1">Hotline Phone</label>
                        <input
                          type="text"
                          value={settings.companyPhone}
                          onChange={(e) =>
                            setSettings({ ...settings, companyPhone: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#C8D9E6] bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="font-semibold block mb-1">
                          Promotional Storefront Banner
                        </label>
                        <input
                          type="text"
                          value={settings.promoBannerText}
                          onChange={(e) =>
                            setSettings({ ...settings, promoBannerText: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-lg border border-[#C8D9E6] bg-transparent"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => showToast("Website & Invoice settings updated!")}
                      className="px-5 py-2.5 rounded-lg bg-[#2F4156] text-white text-xs font-semibold"
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

      {/* PORTAL 3: ARCHITECTURE, PRISMA SCHEMA & BRAND PALETTE */}
      {isStaffLoggedIn && portalMode === "ARCHITECTURE" && (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div className={`p-6 rounded-xl border space-y-4 ${surfaceCard}`}>
            <h1 className="font-serif text-2xl font-bold">
              System Architecture, 29-Model Prisma Schema & Official Brand Palette
            </h1>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              {[
                { name: "Navy", hex: "#2F4156", bg: "bg-[#2F4156] text-white" },
                { name: "Teal", hex: "#567C8D", bg: "bg-[#567C8D] text-white" },
                { name: "Sky Blue", hex: "#C8D9E6", bg: "bg-[#C8D9E6] text-[#2F4156]" },
                { name: "Beige", hex: "#F5F1EE", bg: "bg-[#F5F1EE] text-[#2F4156] border border-[#C8D9E6]" },
                { name: "White", hex: "#FFFFFF", bg: "bg-white text-[#2F4156] border border-[#C8D9E6]" }
              ].map((sw) => (
                <div key={sw.hex} className={`p-4 rounded-xl font-bold ${sw.bg}`}>
                  <div>{sw.name}</div>
                  <div className="font-mono text-[11px] opacity-80">{sw.hex}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
