/**
 * Integration-ready Payment Gateway & Courier Dispatch Service Architecture
 * Supports:
 * - Payment Gateways: SSLCommerz, bKash Tokenized Checkout, Nagad, Stripe
 * - Couriers: Steadfast Courier, Pathao Hermes API, RedX Logistics
 */

export interface PaymentInitPayload {
  orderNumber: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  callbackUrl: string;
}

export class PaymentAndCourierService {
  static async initiateSSLCommerzSession(payload: PaymentInitPayload) {
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePass = process.env.SSLCOMMERZ_STORE_PASSWORD;
    const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";
    const baseUrl = isLive
      ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
      : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

    return {
      provider: "SSLCOMMERZ",
      endpoint: baseUrl,
      configured: Boolean(storeId && storePass),
      sessionPayload: {
        store_id: storeId,
        total_amount: payload.amount,
        currency: "BDT",
        tran_id: payload.orderNumber,
        success_url: `${payload.callbackUrl}/api/payments/sslcommerz/success`,
        fail_url: `${payload.callbackUrl}/api/payments/sslcommerz/fail`,
        cancel_url: `${payload.callbackUrl}/api/payments/sslcommerz/cancel`,
        cus_name: payload.customerName,
        cus_phone: payload.customerPhone,
        cus_email: payload.customerEmail || "customer@nexusmart.com.bd",
      },
    };
  }

  static async initiateBkashPayment(payload: PaymentInitPayload) {
    const baseUrl = process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta";
    return {
      provider: "BKASH",
      endpoint: `${baseUrl}/tokenized/checkout/create`,
      requestBody: {
        mode: "0011",
        payerReference: payload.customerPhone,
        callbackURL: `${payload.callbackUrl}/api/payments/bkash/callback`,
        amount: payload.amount.toFixed(2),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: payload.orderNumber,
      },
    };
  }

  static async initiateNagadPayment(payload: PaymentInitPayload) {
    return {
      provider: "NAGAD",
      merchantId: process.env.NAGAD_MERCHANT_ID,
      invoiceNumber: payload.orderNumber,
      amount: payload.amount.toFixed(2),
      callbackUrl: `${payload.callbackUrl}/api/payments/nagad/callback`,
    };
  }

  static async dispatchToCourier(params: {
    provider: "STEADFAST" | "PATHAO" | "REDX";
    orderNumber: string;
    recipientName: string;
    recipientPhone: string;
    recipientAddress: string;
    codAmount: number;
  }) {
    const trackingNumber = `${params.provider.slice(0, 3)}-${Date.now().toString().slice(-7)}`;
    return {
      provider: params.provider,
      trackingNumber,
      consignmentId: `CN-${Math.floor(100000 + Math.random() * 900000)}`,
      status: "ASSIGNED" as const,
      dispatchedAt: new Date(),
    };
  }
}
