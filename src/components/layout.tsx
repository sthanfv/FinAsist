
"use client";

import React, { ReactNode, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, Home, Wallet, Goal, FileText, X, LogOut, LogIn, Target, BarChart } from 'lucide-react';
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
    { name: 'Dashboard', icon: Home, href: '/dashboard', color: 'blue' },
    { name: 'Transacciones', icon: Wallet, href: '/transactions', color: 'green' },
    { name: 'Metas', icon: Target, href: '/goals', color: 'purple' },
    { name: 'Reportes', icon: BarChart, href: '/reports', color: 'indigo' },
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
                balanceChanged && "animate-[pulse-gentle_0.6s_ease_in_out]"
              )}>
              {formatCurrency(balance)}
            </p>
        </div>
      </div>
    </div>
  );

  const NavItem = ({ href, name, icon: Icon, color }: { href: string; name: string; icon: React.ElementType; color: string }) => {
    const colorClasses = {
      blue: {
        text: 'hover:text-blue-600 dark:hover:text-blue-400',
        bg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
        iconContainer: 'bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-900',
        icon: 'text-blue-600 dark:text-blue-400'
      },
      green: {
        text: 'hover:text-green-600 dark:hover:text-green-400',
        bg: 'hover:bg-green-50 dark:hover:bg-green-900/20',
        iconContainer: 'bg-green-100 dark:bg-green-900/50 group-hover:bg-green-200 dark:group-hover:bg-green-900',
        icon: 'text-green-600 dark:text-green-400'
      },
      purple: {
        text: 'hover:text-purple-600 dark:hover:text-purple-400',
        bg: 'hover:bg-purple-50 dark:hover:bg-purple-900/20',
        iconContainer: 'bg-purple-100 dark:bg-purple-900/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-900',
        icon: 'text-purple-600 dark:text-purple-400'
      },
      indigo: {
        text: 'hover:text-indigo-600 dark:hover:text-indigo-400',
        bg: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
        iconContainer: 'bg-indigo-100 dark:bg-indigo-900/50 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900',
        icon: 'text-indigo-600 dark:text-indigo-400'
      }
    };
    const classes = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

    return (
      <Link 
        href={href}
        onClick={() => setSidebarOpen(false)}
        className={cn("group flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 transform hover:scale-[1.02]", classes.text, classes.bg)}
      >
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors", classes.iconContainer)}>
          <Icon className={cn("w-5 h-5", classes.icon)} />
        </div>
        <span className="font-medium">{name}</span>
      </Link>
    );
  };


  return (
    <div className="min-h-screen flex bg-background font-body">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-card shadow-soft">
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-primary font-headline">FinAssist</h1>
          </div>
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavItem key={item.name} {...item} />
            ))}
          </nav>
          <div className="mt-auto space-y-4">
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
                    <NavItem key={item.name} {...item} />
                  ))}
                </nav>
                <div className="p-4 mt-auto space-y-4">
                    {authAction}
                    <BalanceDisplay />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        
        {/* Header Mobile */}
        <header className="flex items-center justify-between bg-card shadow-soft p-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-primary text-2xl">
            <Menu />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-primary font-headline">FinAssist</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className={cn(
                  "text-lg font-semibold text-primary balance-animation",
                  balanceChanged && "animate-[pulse-gentle_0.6s_ease_in_out]"
                )}>
                {formatCurrency(balance)}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </header>

        {/* Header Desktop */}
        <div className="hidden md:flex items-center justify-between bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white p-4 shadow-lg">
            <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            </div>

            <div className="flex items-center space-x-6">
                <div className="text-center">
                    <p className="text-blue-100 text-sm">Saldo Principal</p>
                    <p className={cn(
                        "text-2xl font-bold balance-animation",
                        balanceChanged && "animate-[pulse-gentle_0.6s_ease_in_out]"
                    )}>
                        {formatCurrency(balance)}
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 transform hover:scale-105">
                        <span className="text-sm font-medium">+ Añadir Transacción</span>
                    </button>
                    <button className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-200 transform hover:scale-105">
                        <span className="text-sm font-medium">🤖 Asistente IA</span>
                    </button>

                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </div>

        <main className="flex-1 p-6">{children}</main>
        
        <footer className="bg-card shadow-soft p-4 text-center text-muted-foreground text-sm mt-auto">
          © 2025 FinAssist
        </footer>
      </div>
    </div>
  );
}
