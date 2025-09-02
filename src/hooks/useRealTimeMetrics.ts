
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { PerformanceEngine } from '@/engine/PerformanceEngine';
import { MathUtils } from '@/engine/utils/MathUtils';
import { useTransactions, useBalance } from '@/store/selectors';
interface RealTimeMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  color: 'green' | 'red' | 'blue' | 'orange';
  unit: 'currency' | 'percentage' | 'number';
}
interface AlertMetric {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  action?: string;
  timestamp: Date;
}
export const useRealTimeMetrics = () => {
  const transactions = useTransactions();
  const balance = useBalance();
  
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [alerts, setAlerts] = useState<AlertMetric[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  
  const previousMetricsRef = useRef<RealTimeMetric[]>([]);
  const lastCalculationRef = useRef<Date>(new Date());
  const calculateMetrics = useCallback(async () => {
    if (transactions.length === 0) return;
    
    setIsCalculating(true);
    
    try {
      console.log('📊 Calculating real-time metrics...');
      
      // Métricas básicas rápidas
      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentMonthTransactions = transactions.filter(t => 
        t.date.startsWith(currentMonth)
      );
      
      const monthlyIncome = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const monthlyExpenses = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const netFlow = monthlyIncome - monthlyExpenses;
      
      // Análisis de tendencias rápido
      const last30Days = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return transactionDate >= thirtyDaysAgo;
      });
      
      const expenseAmounts = last30Days
        .filter(t => t.type === 'expense')
        .map(t => t.amount);
      
      const avgDailyExpense = expenseAmounts.length > 0 
        ? expenseAmounts.reduce((sum, val) => sum + val, 0) / 30
        : 0;
      
      const expenseVolatility = MathUtils.standardDeviation(expenseAmounts);
      
      // Burn rate (cuántos días puede sobrevivir con el balance actual)
      const burnRate = avgDailyExpense > 0 ? balance / avgDailyExpense : Infinity;
      
      // Tasa de ahorro mensual
      const savingsRate = monthlyIncome > 0 ? ((netFlow / monthlyIncome) * 100) : 0;
      
      // Calcular cambios comparado con el mes anterior
      const previousMonth = new Date();
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      const prevMonthStr = previousMonth.toISOString().slice(0, 7);
      
      const prevMonthTransactions = transactions.filter(t => 
        t.date.startsWith(prevMonthStr)
      );
      
      const prevMonthIncome = prevMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const prevMonthExpenses = prevMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const incomeChange = prevMonthIncome > 0 
        ? ((monthlyIncome - prevMonthIncome) / prevMonthIncome) * 100
        : 0;
      
      const expenseChange = prevMonthExpenses > 0 
        ? ((monthlyExpenses - prevMonthExpenses) / prevMonthExpenses) * 100
        : 0;
      // Construir métricas
      const newMetrics: RealTimeMetric[] = [
        {
          label: 'Balance Actual',
          value: balance,
          change: 0, // TODO: Calcular cambio del balance
          trend: balance > 0 ? 'up' : balance < 0 ? 'down' : 'stable',
          color: balance > 0 ? 'green' : balance < 0 ? 'red' : 'blue',
          unit: 'currency'
        },
        {
          label: 'Flujo Mensual',
          value: netFlow,
          change: 0,
          trend: netFlow > 0 ? 'up' : netFlow < 0 ? 'down' : 'stable',
          color: netFlow > 0 ? 'green' : netFlow < 0 ? 'red' : 'blue',
          unit: 'currency'
        },
        {
          label: 'Ingresos Mes',
          value: monthlyIncome,
          change: incomeChange,
          trend: incomeChange > 5 ? 'up' : incomeChange < -5 ? 'down' : 'stable',
          color: incomeChange > 0 ? 'green' : incomeChange < 0 ? 'red' : 'blue',
          unit: 'currency'
        },
        {
          label: 'Gastos Mes',
          value: monthlyExpenses,
          change: expenseChange,
          trend: expenseChange < -5 ? 'up' : expenseChange > 5 ? 'down' : 'stable',
          color: expenseChange < 0 ? 'green' : expenseChange > 0 ? 'red' : 'blue',
          unit: 'currency'
        },
        {
          label: 'Tasa de Ahorro',
          value: savingsRate,
          change: 0,
          trend: savingsRate > 20 ? 'up' : savingsRate < 0 ? 'down' : 'stable',
          color: savingsRate > 15 ? 'green' : savingsRate < 0 ? 'red' : 'orange',
          unit: 'percentage'
        },
        {
          label: 'Días de Supervivencia',
          value: Math.min(999, burnRate),
          change: 0,
          trend: burnRate > 90 ? 'up' : burnRate < 30 ? 'down' : 'stable',
          color: burnRate > 90 ? 'green' : burnRate < 30 ? 'red' : 'orange',
          unit: 'number'
        }
      ];
      setMetrics(newMetrics);
      previousMetricsRef.current = newMetrics;
      
      // Generar alertas inteligentes
      const newAlerts: AlertMetric[] = [];
      
      // Alerta de balance bajo
      if (balance < avgDailyExpense * 7) {
        newAlerts.push({
          id: 'low-balance',
          type: 'danger',
          title: 'Balance Crítico',
          message: `Tu balance actual solo cubre ${Math.floor(burnRate)} días de gastos`,
          action: 'Revisar gastos',
          timestamp: new Date()
        });
      }
      
      // Alerta de gastos altos
      if (expenseChange > 25) {
        newAlerts.push({
          id: 'high-expenses',
          type: 'warning',
          title: 'Gastos Elevados',
          message: `Tus gastos aumentaron ${expenseChange.toFixed(1)}% este mes`,
          action: 'Analizar categorías',
          timestamp: new Date()
        });
      }
      
      // Alerta de volatilidad
      if (expenseVolatility > avgDailyExpense * 0.5) {
        newAlerts.push({
          id: 'high-volatility',
          type: 'info',
          title: 'Gastos Irregulares',
          message: 'Tus gastos han sido muy variables últimamente',
          action: 'Crear presupuesto',
          timestamp: new Date()
        });
      }
      
      // Alerta positiva
      if (savingsRate > 20) {
        newAlerts.push({
          id: 'good-savings',
          type: 'info',
          title: '¡Excelente Ahorro!',
          message: `Estás ahorrando ${savingsRate.toFixed(1)}% de tus ingresos`,
          timestamp: new Date()
        });
      }
      setAlerts(newAlerts);
      lastCalculationRef.current = new Date();
      
      console.log(`✅ Metrics calculated - ${newMetrics.length} metrics, ${newAlerts.length} alerts`);
      
    } catch (error) {
      console.error('🚨 Metrics calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [transactions, balance]);
  // Recalcular métricas cuando cambian los datos
  useEffect(() => {
    const timeoutId = setTimeout(calculateMetrics, 300);
    return () => clearTimeout(timeoutId);
  }, [calculateMetrics]);
  // Auto-refresh cada 5 minutos
  useEffect(() => {
    const interval = setInterval(calculateMetrics, 300000);
    return () => clearInterval(interval);
  }, [calculateMetrics]);
  const dismissAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);
  const refreshMetrics = useCallback(() => {
    calculateMetrics();
  }, [calculateMetrics]);
  return {
    metrics,
    alerts,
    isCalculating,
    lastUpdated: lastCalculationRef.current,
    dismissAlert,
    refreshMetrics
  };
};