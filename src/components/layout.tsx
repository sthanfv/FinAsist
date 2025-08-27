
"use client";

import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, Home, Wallet, Goal, FileText, X, LogOut, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { useAppStore } from '@/store/useAppStore';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { balance, user } = useAppStore();
  const router = useRouter();

  const [balanceChanged, setBalanceChanged] = useState(false);
  const prevBalanceRef = useRef(balance);

  useEffect(() => {
    if (prevBalanceRef.current !== balance) {
      setBalanceChanged(true);
      const timer = setTimeout(() => setBalanceChanged(false), 600); // Duración de la animación
      prevBalanceRef.current = balance;
      return () => clearTimeout(timer);
    }
  }, [balance]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };

  const navItems = [
    { name: 'Dashboard', icon: <Home />, href: '/dashboard' },
    { name: 'Transacciones', icon: <Wallet />, href: '/transactions' },
    { name: 'Metas', icon: <Goal />, href: '/goals' },
    { name: 'Reportes', icon: <FileText />, href: '/reports' },
  ];

  const authAction = user ? (
    <button
      onClick={handleLogout}
      className="w-full flex items-center p-3 rounded-lg text-foreground hover:bg-destructive/10 transition-colors mb-4"
    >
      <span className="mr-3 text-lg"><LogOut /></span>
      Cerrar sesión
    </button>
  ) : (
    <Link
      href="/login"
      className="w-full flex items-center p-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors mb-4"
    >
      <span className="mr-3 text-lg"><LogIn /></span>
      Iniciar sesión
    </Link>
  );

  const BalanceDisplay = () => (
    <div className="p-4 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm opacity-90">Saldo disponible</p>
           <p className={cn(
                "text-2xl font-semibold tracking-tight balance-animation",
                balanceChanged && "animate-[pulse-gentle_0.6s_ease-in-out]"
              )}>
              {formatCurrency(balance)}
            </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background font-body">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-card shadow-soft">
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">FinAssist</h1>
            <ThemeToggle />
          </div>
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center p-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors"
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="mt-auto">
            {authAction}
            <BalanceDisplay />
          </div>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-all duration-300 ease-out md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-900 shadow-2xl md:hidden border-r border-gray-200 dark:border-gray-700"
            >
              <div className="flex flex-col h-full">
                 <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      FinAssist
                    </h2>
                    <button 
                      onClick={() => setSidebarOpen(false)}
                      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                <nav className="flex-1 p-4 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center p-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                </nav>
                <div className="p-4 mt-auto">
                    {authAction}
                    <BalanceDisplay />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between bg-card shadow-soft p-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-primary text-2xl">
            <Menu />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-primary font-headline">FinAssist</h1>
          <div className="text-right">
             <p className="text-sm text-muted-foreground">Saldo</p>
             <p className={cn(
                "text-lg font-semibold text-primary balance-animation",
                balanceChanged && "animate-[pulse-gentle_0.6s_ease_in-out]"
              )}>
              {formatCurrency(balance)}
            </p>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
        <footer className="bg-card shadow-soft p-4 text-center text-muted-foreground text-sm mt-auto">
          © 2025 FinAssist
        </footer>
      </div>
    </div>
  );
}
