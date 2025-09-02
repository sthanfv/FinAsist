"use client";
import { Inter } from "next/font/google";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DashboardLoader } from "@/components/ui/professional-loading";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isInitialized = useAppStore((state) => state.isInitialized);
  const initializeAuthListener = useAppStore(
    (state) => state.initializeAuthListener
  );

  useEffect(() => {
    const unsubscribe = initializeAuthListener();
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isInitialized) {
    return (
      <html lang="es" suppressHydrationWarning>
        <head>
          <title>FinAssist</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="anonymous"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
            rel="stylesheet"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className={`${inter.className} font-body antialiased`}>
          <div className="min-h-screen bg-white dark:bg-background flex items-center justify-center">
            <DashboardLoader />
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <title>FinAssist - Tu Asistente Financiero Inteligente</title>
        <meta
          name="description"
          content="FinAssist es una aplicación web moderna para la gestión de finanzas personales, con herramientas inteligentes, asistente IA y calculadoras profesionales."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} font-body antialiased relative`}>
        <div className="absolute inset-0 -z-10 bg-animated opacity-10"></div>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
