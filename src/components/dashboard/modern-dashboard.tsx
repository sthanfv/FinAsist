
'use client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp, TrendingDown, DollarSign, Target,
  AlertTriangle, Sparkles, BarChart3, PieChart,
  ArrowUpRight, ArrowDownRight, Plus
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useFinancialAnalysis } from '@/hooks/useFinancialAnalysis';
import { useBalance } from '@/store/selectors';
import { cn } from '@/lib/utils';

export const ModernDashboard = () => {
  const { transactions, goals } = useAppStore();
  const balance = useBalance();
  const analysis = useFinancialAnalysis();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Calcular métricas para widgets
  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && 
           transactionDate.getFullYear() === now.getFullYear();
  });

  const thisMonthIncome = thisMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const thisMonthExpenses = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate = thisMonthIncome > 0 ? 
    ((thisMonthIncome - thisMonthExpenses) / thisMonthIncome) * 100 : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Hero Section con métricas principales */}
      <motion.div variants={itemVariants} className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl" />
        <div className="relative p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Balance Principal - MEJORADO */}
            <div className="md:col-span-2">
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 border border-white/30 dark:border-slate-700/30 shadow-2xl shadow-green-500/10 overflow-hidden"
              >
                {/* Efectos de fondo animados */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-full blur-xl" />
                
                <div className="relative flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Balance Total</p>
                    <motion.h2 
                      className="text-5xl font-black bg-gradient-to-r from-green-600 via-emerald-500 to-green-700 bg-clip-text text-transparent"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", bounce: 0.3 }}
                    >
                      ${balance.toLocaleString()}
                    </motion.h2>
                  </div>
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg shadow-green-500/30"
                    whileHover={{ rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <DollarSign className="h-10 w-10 text-white" />
                  </motion.div>
                </div>
                
                <div className="relative flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    +12.5% este mes
                  </Badge>
                  <motion.div 
                    className="flex items-center gap-1 text-xs text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Actualizado hace un momento
                  </motion.div>
                </div>
              </motion.div>
            </div>
            {/* Ingresos del mes - MEJORADO */}
            <motion.div
              whileHover={{ scale: 1.05, y: -8 }}
              className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-6 border border-white/30 dark:border-slate-700/30 shadow-2xl shadow-blue-500/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-lg" />
              
              <div className="relative flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos</p>
                  <motion.p 
                    className="text-3xl font-bold text-blue-600"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    ${thisMonthIncome.toLocaleString()}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 45 }}
                  className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/25"
                >
                  <ArrowUpRight className="h-6 w-6 text-white" />
                </motion.div>
              </div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </motion.div>
            {/* Gastos del mes - MEJORADO */}
            <motion.div
              whileHover={{ scale: 1.05, y: -8 }}
              className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-6 border border-white/30 dark:border-slate-700/30 shadow-2xl shadow-red-500/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5" />
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-red-400/20 to-pink-500/20 rounded-full blur-lg" />
              
              <div className="relative flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Gastos</p>
                  <motion.p 
                    className="text-3xl font-bold text-red-500"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    ${thisMonthExpenses.toLocaleString()}
                  </motion.p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: -45 }}
                  className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg shadow-red-500/25"
                >
                  <ArrowDownRight className="h-6 w-6 text-white" />
                </motion.div>
              </div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
      {/* Grid de Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasa de Ahorro - MEJORADA */}
        <motion.div variants={itemVariants}>
          <Card className="relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-xl" />
            
            <CardHeader className="pb-3 relative">
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <motion.div
                  className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Target className="h-4 w-4 text-white" />
                </motion.div>
                Tasa de Ahorro
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                <div className="text-center">
                  <motion.p 
                    className="text-4xl font-black text-purple-600 dark:text-purple-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    {savingsRate.toFixed(1)}%
                  </motion.p>
                  <p className="text-sm text-muted-foreground">Este mes</p>
                </div>
                <div className="relative">
                  <Progress value={Math.min(savingsRate, 100)} className="h-3 bg-purple-100 dark:bg-purple-900" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Meta: 20%</span>
                  <motion.span 
                    className={savingsRate >= 20 ? 'text-green-600' : 'text-orange-600'}
                    animate={{ scale: savingsRate >= 20 ? [1, 1.1, 1] : 1 }}
                    transition={{ repeat: savingsRate >= 20 ? Infinity : 0, duration: 2 }}
                  >
                    {savingsRate >= 20 ? '✅ Alcanzada' : '🎯 En progreso'}
                  </motion.span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Metas Activas - MEJORADA */}
        <motion.div variants={itemVariants}>
          <Card className="relative bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full blur-xl" />
            
            <CardHeader className="pb-3 relative">
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <motion.div
                  className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  <Target className="h-4 w-4 text-white" />
                </motion.div>
                Metas Activas
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                <div className="text-center">
                  <motion.p 
                    className="text-4xl font-black text-blue-600 dark:text-blue-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                  >
                    {goals.length}
                  </motion.p>
                  <p className="text-sm text-muted-foreground">En progreso</p>
                </div>
                <div className="space-y-3">
                  {goals.slice(0, 2).map((goal, index) => (
                    <motion.div 
                      key={goal.id} 
                      className="space-y-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between text-sm">
                        <span className="truncate font-medium">{goal.name}</span>
                        <span className="text-blue-600 font-bold">
                          {((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Progress 
                        value={(goal.currentAmount / goal.targetAmount) * 100} 
                        className="h-2 bg-blue-100 dark:bg-blue-900" 
                      />
                    </motion.div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full gap-2 border-blue-200 hover:bg-blue-50">
                  <Plus className="h-4 w-4" />
                  Nueva Meta
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Asistente IA - MEJORADO */}
        <motion.div variants={itemVariants}>
          <Card className="relative bg-gradient-to-br from-pink-50 to-violet-50 dark:from-pink-900/20 dark:to-violet-900/20 border-pink-200 dark:border-pink-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-violet-500/5" />
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-violet-500/20 rounded-full blur-xl" />
            
            <CardHeader className="pb-3 relative">
              <CardTitle className="flex items-center gap-2 text-pink-700 dark:text-pink-300">
                <motion.div
                  className="p-2 bg-gradient-to-br from-pink-500 to-violet-500 rounded-lg"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 3,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="h-4 w-4 text-white" />
                </motion.div>
                Asistente IA
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                <motion.div 
                  className="text-sm text-muted-foreground p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  "Basándome en tus patrones de gasto, podrías ahorrar $150,000 reduciendo gastos de entretenimiento."
                </motion.div>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 gap-2 shadow-lg shadow-pink-500/25">
                  <Sparkles className="h-4 w-4" />
                  Obtener Consejo
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Transacciones Recientes */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Actividad Reciente
              <Button variant="outline" size="sm">Ver Todo</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(-5).map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    )}>
                      {transaction.type === 'income' ? 
                        <ArrowUpRight className="h-5 w-5 text-green-600" /> :
                        <ArrowDownRight className="h-5 w-5 text-red-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-bold",
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    )}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};
