"use client";

import React from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export interface PrintableOrderProps {
  orders: Array<{
    id: string;
    orderNumber: string;
    createdAt: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryZone: string;
    paymentMethod: string;
    paymentStatus: string;
    orderStatus: string;
    subtotal: number;
    discountAmount: number;
    deliveryCharge: number;
    grandTotal: number;
    customerNotes?: string;
    assignedStaffName?: string;
    items: Array<{
      sku: string;
      productName: string;
      productNameBn?: string;
      variantName?: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  }>;
  layout: "A4_STANDARD" | "THERMAL_80MM" | "COMPACT_MEMO";
  lang: "en" | "bn" | "bilingual";
  company: {
    companyName: string;
    companyNameBn: string;
    companyAddress: string;
    companyAddressBn: string;
    companyPhone: string;
    invoiceTermsEn: string;
    invoiceTermsBn: string;
    invoiceThankYouEn: string;
    invoiceThankYouBn: string;
  };
}

export function OrderMemoPrint({ orders, layout, lang, company }: PrintableOrderProps) {
  return (
    <div className="print-container space-y-8">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container,
          .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>
      {orders.map((order, idx) => (
        <div
          key={order.id}
          className={`bg-white text-slate-900 border border-slate-300 mx-auto ${
            layout === "THERMAL_80MM"
              ? "max-w-[302px] p-3 font-mono text-xs"
              : layout === "COMPACT_MEMO"
              ? "max-w-[560px] p-5 text-sm"
              : "max-w-[794px] p-8 text-sm"
          } ${idx < orders.length - 1 ? "page-break" : ""}`}
        >
          <div className="flex justify-between items-start border-b border-slate-300 pb-4 mb-4">
            <div>
              <h1 className="text-lg font-bold">
                {lang === "bn"
                  ? company.companyNameBn
                  : lang === "bilingual"
                  ? `${company.companyName} / ${company.companyNameBn}`
                  : company.companyName}
              </h1>
              <p className="text-xs text-slate-600">{company.companyAddress}</p>
              <p className="text-xs text-slate-600">Hotline: {company.companyPhone}</p>
            </div>
            <div className="text-right">
              <div className="font-bold text-base">INVOICE / অর্ডার মেমো</div>
              <div className="font-mono font-semibold">{order.orderNumber}</div>
              <div className="text-xs text-slate-500">{formatDateTime(order.createdAt)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 text-xs border-b border-slate-200 pb-3">
            <div>
              <div className="font-semibold text-slate-500 uppercase">Customer / গ্রাহক</div>
              <div className="font-bold text-sm">{order.customerName}</div>
              <div>Phone: {order.customerPhone}</div>
              <div>Address: {order.deliveryAddress}</div>
            </div>
            <div className="text-right">
              <div>Payment Method: <span className="font-semibold">{order.paymentMethod}</span></div>
              <div>Payment Status: <span className="font-semibold">{order.paymentStatus}</span></div>
              <div>Handled By: <span className="font-semibold">{order.assignedStaffName || "System"}</span></div>
            </div>
          </div>

          <table className="w-full border-collapse mb-4 text-xs">
            <thead>
              <tr className="border-b-2 border-slate-800 text-left">
                <th className="py-1.5">Item / বিবরণ</th>
                <th className="py-1.5">SKU</th>
                <th className="py-1.5 text-center">Qty</th>
                <th className="py-1.5 text-right">Unit</th>
                <th className="py-1.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-slate-200">
                  <td className="py-2">
                    <div className="font-medium">{item.productName}</div>
                    {lang !== "en" && item.productNameBn && (
                      <div className="text-slate-600">{item.productNameBn}</div>
                    )}
                  </td>
                  <td className="py-2 font-mono">{item.sku}</td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-2 text-right font-semibold">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-4">
            <div className="w-60 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Subtotal / উপমোট:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount / ছাড়:</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery / ডেলিভারি চার্জ:</span>
                <span>{formatCurrency(order.deliveryCharge)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm border-t border-slate-900 pt-1">
                <span>Grand Total / সর্বমোট:</span>
                <span>{formatCurrency(order.grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-300 pt-3 text-center text-[11px] text-slate-600 space-y-1">
            <p>{lang === "bn" ? company.invoiceTermsBn : `${company.invoiceTermsEn} | ${company.invoiceTermsBn}`}</p>
            <p className="font-semibold text-slate-900">
              {lang === "bn" ? company.invoiceThankYouBn : `${company.invoiceThankYouEn} / ${company.invoiceThankYouBn}`}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
