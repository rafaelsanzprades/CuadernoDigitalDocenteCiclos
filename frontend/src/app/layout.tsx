import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const viewport: Viewport = {
  themeColor: "#14a085",
};

export const metadata: Metadata = {
  title: "Cuaderno FP",
  description: "Cuaderno Digital Docente para Ciclos Formativos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cuaderno FP",
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";
import { apiInterceptor } from "@/services/apiInterceptor";
import { TourGuide } from "@/components/features/onboarding/TourGuide";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { PageTransition } from "@/components/layout/PageTransition";

if (typeof window !== 'undefined') {
  apiInterceptor.init();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable} font-sans`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="antialiased bg-[var(--background)] text-[var(--foreground)] min-h-screen flex flex-col transition-colors duration-300">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
            <GlobalErrorBoundary>
              <PageTransition>
                {children}
              </PageTransition>
            </GlobalErrorBoundary>
            <TourGuide />
            <Toaster position="bottom-right" toastOptions={{
              style: { background: 'var(--glass-bg)', color: 'var(--foreground)', backdropFilter: 'blur(12px)', border: '1px solid var(--glass-border)' },
              success: { iconTheme: { primary: '#14a085', secondary: '#fff' } }
            }} />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
