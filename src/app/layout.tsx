import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexusMart Enterprise — Next.js Multi-Role eCommerce Platform",
  description:
    "Next.js eCommerce Platform with Multi-Role Staff Management, Atomic Inventory & Bilingual Order Memo Printing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}
