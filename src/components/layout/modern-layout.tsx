'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, X, Plus, Sparkles, TrendingUp, Target, 
  Calculator, FileText, Settings, User, 
  ChevronRight, Home, CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { useBalance } from '@/store/selectors';
import Link from 'next/link';
import { ThemeToggle } from '../ThemeToggle';

interface ModernLayoutProps {
  children: React.ReactNode;
}
export const ModernLayout = ({ children }: ModernLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const user = useAppStore(state => state.user);
  const balance = useBalance();

  const navigationItems = [
    { icon: Home, label: 'Dashboard', href: '/dashboard', color: 'text-blue-500' },
    { icon: CreditCard, label: 'Transacciones', href: '/transactions', color: 'text-green-500' },
    { icon: Target, label: 'Metas', href: '/goals', color: 'text-purple-500' },
    { icon: TrendingUp, label: 'Reportes', href: '/reports', color: 'text-orange-500' },
    { icon: Calculator, label: 'Calculadoras', href: '/calculators', color: 'text-cyan-500' },
  ];
  const quickActions = [
    { icon: Plus, label: 'Nueva Transacción', action: 'add-transaction', color: 'bg-blue-500' },
    { icon: Target, label: 'Nueva Meta', action: 'add-goal', color: 'bg-purple-500' },
    { icon: Sparkles, label: 'Consejo IA', action: 'ai-advice', color: 'bg-gradient-to-r from-pink-500 to-violet-500' },
    { icon: FileText, label: 'Generar Reporte', action: 'generate-report', color: 'bg-orange-500' },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header Flotante */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 rounded-xl sm:rounded-2xl shadow-lg"
      >
        <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
          {/* Left Side */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="lg:hidden p-2"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">F</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FinAssist
                </h1>
                <p className="text-xs text-muted-foreground">
                  {user ? `Bienvenido, ${user.email}` : 'Modo Invitado'}
                </p>
              </div>
            </div>
          </div>
          {/* Center - Balance solo en desktop */}
          <motion.div 
            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-200/50"
            whileHover={{ scale: 1.02 }}
          >
            <TrendingUp className="h-5 w-5 text-green-600" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Balance Total</p>
              <p className="text-lg font-bold text-green-600">
                ${balance.toLocaleString()}
              </p>
            </div>
          </motion.div>
          {/* Right Side */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuickActionsOpen(!quickActionsOpen)}
              className="gap-1 sm:gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:shadow-lg px-2 sm:px-3 py-1 sm:py-2"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline text-xs sm:text-sm">Acciones</span>
              <span className="sm:hidden text-xs">+</span>
            </Button>
            
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="p-1 sm:p-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </motion.header>
      {/* Sidebar Moderno */}
      <motion.aside
        initial={false}
        animate={sidebarCollapsed ? "collapsed" : "expanded"}
        variants={{
          expanded: { width: "16rem" }, // 256px
          collapsed: { width: "4rem" }, // 64px
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed left-4 top-24 bottom-4 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-lg overflow-hidden transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="p-2">
          <nav className="space-y-2">
            {navigationItems.map((item, index) => (
              <motion.div
                key={item.href}
                whileHover={{ backgroundColor: "rgba(100, 116, 139, 0.1)" }}
                className="rounded-lg"
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    "group cursor-pointer"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", item.color)} />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>
      </motion.aside>
      {/* Panel de Acciones Rápidas */}
      <AnimatePresence>
        {quickActionsOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-24 right-4 z-50 w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border border-slate-200/50 dark:border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Acciones Rápidas</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setQuickActionsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-2">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.action}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group"
                >
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", action.color)}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-medium group-hover:text-blue-600 transition-colors">
                    {action.label}
                  </span>
                  <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Overlay para cerrar quick actions */}
      <AnimatePresence>
        {quickActionsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setQuickActionsOpen(false)}
          />
        )}
      </AnimatePresence>
      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 pt-28 pb-6 px-4 sm:px-6 md:px-8",
        sidebarCollapsed ? "lg:pl-24" : "lg:pl-72"
      )}>
        {children}
      </main>
    </div>
  );
};
