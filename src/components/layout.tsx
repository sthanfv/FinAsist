"use client";

import React, { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, Home, Wallet, Goal, FileText, X } from 'lucide-react';
import { useBalance } from '@/hooks/useBalance';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { balance } = useBalance(10000);

  const navItems = [
    { name: 'Dashboard', icon: <Home />, href: '/dashboard' },
    { name: 'Transacciones', icon: <Wallet />, href: '/transactions' },
    { name: 'Metas', icon: <Goal />, href: '/goals' },
    { name: 'Reportes', icon: <FileText />, href: '/reports' },
  ];

  return (
    <div className="min-h-screen flex bg-background font-body">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-card shadow-soft">
        <div className="p-6 flex flex-col h-full">
          <h1 className="text-2xl font-semibold text-primary mb-8 font-headline">Asistente Financiero</h1>
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
          <div className="mt-auto p-4 bg-muted/50 rounded-lg shadow-inner">
            <p className="text-sm text-muted-foreground">Saldo disponible</p>
            <p className="text-xl font-semibold text-secondary-foreground">{balance.toLocaleString('es-ES')} pts</p>
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
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-lg md:hidden"
            >
              <div className="p-6 flex flex-col h-full">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="mb-6 text-muted-foreground hover:text-foreground self-end"
                >
                  <X size={24} />
                </button>
                <nav className="flex-1 space-y-2">
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
                <div className="mt-auto p-4 bg-muted/50 rounded-lg shadow-inner">
                  <p className="text-sm text-muted-foreground">Saldo disponible</p>
                  <p className="text-xl font-semibold text-secondary-foreground">{balance.toLocaleString('es-ES')} pts</p>
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
          <h1 className="text-xl font-semibold text-primary font-headline">FinAssist</h1>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Saldo</p>
            <p className="text-lg font-semibold text-secondary-foreground">{balance.toLocaleString('es-ES')} pts</p>
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
