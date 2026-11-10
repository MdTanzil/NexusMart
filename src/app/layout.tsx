import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexusMart Enterprise — Architectural eCommerce & Multi-Role SaaS",
  description:
    "Next.js eCommerce Platform with Official Navy, Teal, Sky Blue & Beige Design System, Multi-Role RBAC, and Bilingual Order Memo Printing",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap"
        />
      </head>
      <body className="min-h-screen bg-[#F5F1EE] text-[#2F4156] antialiased dark:bg-[#1B2634] dark:text-[#F5F1EE] font-sans">
        {children}
      </body>
    </html>
  );
}
