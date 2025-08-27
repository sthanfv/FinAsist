'use client';
import { Inter } from 'next/font/google';
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initializeApp, isInitialized } = useAppStore();

  useEffect(() => {
    const unsubscribe = initializeApp();
    
    // The returned function from initializeApp is the auth state change unsubscriber.
    // We must return it from useEffect to clean up the subscription on unmount.
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initializeApp]);

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
          {!isInitialized ? (
            <div className="flex h-screen items-center justify-center bg-background">
              <p>Cargando aplicación...</p>
            </div>
          ) : (
            children
          )}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
