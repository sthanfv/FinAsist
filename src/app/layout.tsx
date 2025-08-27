'use client';
import { Inter } from 'next/font/google';
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ThemeProvider } from '@/components/ThemeProvider';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { ToastContainer } from '@/components/ui/toast-system';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initializeApp, isInitialized, toasts, removeToast } = useAppStore();

  useEffect(() => {
    const unsubscribe = initializeApp();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initializeApp]);

  if (!isInitialized) {
    return (
      <html lang="es" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
        </head>
        <body className={`${inter.className} font-body antialiased`}>
          <div className="min-h-screen bg-white dark:bg-background"></div>
        </body>
      </html>
    );
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
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
          <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ThemeProvider>
      </body>
    </html>
  );
}
