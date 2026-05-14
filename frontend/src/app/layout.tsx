// @ts-nocheck
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "CDD PRO - Cuaderno Digital Docente",
  description: "Cuaderno Digital Docente para Ciclos Formativos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable} font-sans`}>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body suppressHydrationWarning className="antialiased bg-[var(--background)] text-[var(--foreground)] min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
