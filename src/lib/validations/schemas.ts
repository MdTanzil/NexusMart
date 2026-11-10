import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerCustomerSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().regex(/^(\+?8801|01)[3-9]\d{8}$/, "Enter a valid Bangladesh phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  nameBn: z.string().optional(),
  slug: z.string().min(2, "Product slug is required"),
  sku: z.string().min(2, "SKU is required"),
  barcode: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  regularPrice: z.coerce.number().positive("Regular price must be positive"),
  salePrice: z.coerce.number().nonnegative().optional(),
  purchasePrice: z.coerce.number().nonnegative("Purchase price is required"),
  stockQuantity: z.coerce.number().int().nonnegative("Initial stock cannot be negative"),
  lowStockThreshold: z.coerce.number().int().positive().default(10),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const checkoutOrderSchema = z.object({
  customerName: z.string().min(2, "Recipient name is required"),
  customerPhone: z.string().min(11, "Valid phone number is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  deliveryAddress: z.string().min(8, "Full delivery address is required"),
  deliveryZone: z.enum(["Inside Dhaka", "Dhaka Sub-Urban", "Outside Dhaka"]),
  paymentMethod: z.enum([
    "CASH_ON_DELIVERY",
    "BANK_TRANSFER",
    "BKASH",
    "NAGAD",
    "SSLCOMMERZ",
    "STRIPE",
  ]),
  transactionId: z.string().optional(),
  senderPhone: z.string().optional(),
  couponCode: z.string().optional(),
  customerNotes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Cart cannot be empty"),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().min(1),
  newStatus: z.enum([
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "READY_FOR_SHIPMENT",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "RETURNED",
    "REFUNDED",
  ]),
  note: z.string().optional(),
  cashCollected: z.coerce.number().nonnegative().optional(),
});

export const createRoleSchema = z.object({
  name: z.string().min(2, "Role name is required"),
  slug: z.string().min(2, "Role slug is required"),
  description: z.string().optional(),
  permissionCodes: z.array(z.string()).min(1, "Select at least one permission"),
});

export const createStaffSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(11, "Phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  employeeCode: z.string().min(3, "Employee code is required"),
  department: z.string().min(2, "Department is required"),
  designation: z.string().min(2, "Designation is required"),
  roleId: z.string().min(1, "Primary role is required"),
  directPermissions: z.array(z.string()).default([]),
});
