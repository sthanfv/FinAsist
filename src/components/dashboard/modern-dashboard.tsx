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
            {/* Balance Principal */}
            <div className="md:col-span-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Balance Total</p>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ${balance.toLocaleString()}
                    </h2>
                  </div>
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.5% este mes
                  </Badge>
                </div>
              </motion.div>
            </div>

            {/* Ingresos del mes */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Ingresos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${thisMonthIncome.toLocaleString()}
                  </p>
                </div>
                <ArrowUpRight className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </motion.div>
            {/* Gastos del mes */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Gastos</p>
                  <p className="text-2xl font-bold text-red-500">
                    ${thisMonthExpenses.toLocaleString()}
                  </p>
                </div>
                <ArrowDownRight className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </motion.div>
          </div>
        </div>
      </motion.div>
      {/* Grid de Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasa de Ahorro */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700">
                <Target className="h-5 w-5" />
                Tasa de Ahorro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {savingsRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Este mes</p>
                </div>
                <Progress value={Math.min(savingsRate, 100)} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Meta: 20%</span>
                  <span>{savingsRate >= 20 ? '✅ Alcanzada' : '🎯 En progreso'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Metas Activas */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Target className="h-5 w-5" />
                Metas Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{goals.length}</p>
                  <p className="text-sm text-muted-foreground">En progreso</p>
                </div>
                {goals.slice(0, 2).map(goal => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="truncate">{goal.name}</span>
                      <span>{((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-1" />
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Meta
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Asistente IA */}
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-pink-50 to-violet-50 border-pink-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-pink-700">
                <Sparkles className="h-5 w-5" />
                Asistente IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  "Basándome en tus patrones de gasto, podrías ahorrar $150,000 reduciendo gastos de entretenimiento."
                </div>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 gap-2">
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
