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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof tailwind !== 'undefined') {
                tailwind.config = {
                  darkMode: 'class',
                  theme: {
                    extend: {
                      colors: {
                        brand: {
                          navy: '#2F4156',
                          teal: '#567C8D',
                          skyblue: '#C8D9E6',
                          beige: '#F5F1EE',
                          white: '#FFFFFF'
                        }
                      }
                    }
                  }
                };
              }
            `,
          }}
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap"
        />
      </head>
      <body className="min-h-screen bg-[#F5F1EE] text-[#2F4156] antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
