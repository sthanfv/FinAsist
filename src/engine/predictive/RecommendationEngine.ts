
import { Transaction, Goal, Budget } from '@/store/useAppStore';
import { PredictiveEngine } from './PredictiveEngine';
import { MathUtils } from '../utils/MathUtils';
interface Recommendation {
  id: string;
  type: 'saving' | 'spending' | 'goal' | 'investment' | 'warning';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: {
    potential: number; // Impacto económico estimado
    timeframe: string; // "1 mes", "3 meses", etc.
  };
  action: {
    text: string;
    data?: any; // Datos para ejecutar la acción
  };
  confidence: number; // 0-1
}
export class RecommendationEngine {
  
  static async generateRecommendations(
    transactions: Transaction[],
    goals: Goal[],
    budgets: Budget[],
    currentBalance: number
  ): Promise<Recommendation[]> {
    console.log('🤖 Generating intelligent recommendations...');
    
    const recommendations: Recommendation[] = [];
    
    // 1. Recomendaciones de ahorro
    const savingRecs = await this.generateSavingRecommendations(transactions, currentBalance);
    recommendations.push(...savingRecs);
    
    // 2. Recomendaciones de optimización de gastos
    const spendingRecs = await this.generateSpendingOptimizations(transactions);
    recommendations.push(...spendingRecs);
    
    // 3. Recomendaciones de metas
    const goalRecs = await this.generateGoalRecommendations(transactions, goals, currentBalance);
    recommendations.push(...goalRecs);
    
    // 4. Alertas predictivas
    const alertRecs = await this.generatePredictiveAlerts(transactions, currentBalance);
    recommendations.push(...alertRecs);
    
    // 5. Recomendaciones de presupuesto
    const budgetRecs = await this.generateBudgetRecommendations(transactions, budgets);
    recommendations.push(...budgetRecs);
    
    // Ordenar por prioridad y confianza
    return recommendations
      .sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      })
      .slice(0, 8); // Limitar a las 8 mejores recomendaciones
  }
  private static async generateSavingRecommendations(
    transactions: Transaction[],
    currentBalance: number
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    // Analizar patrones de ahorro
    const monthlyData = this.analyzeMonthlyFlow(transactions);
    const avgMonthlySavings = monthlyData.reduce((sum, month) => sum + month.netFlow, 0) / Math.max(1, monthlyData.length);
    
    // Recomendación de incremento de ahorro
    if (avgMonthlySavings > 0 && avgMonthlySavings < 200000) {
      recommendations.push({
        id: 'increase_savings',
        type: 'saving',
        priority: 'medium',
        title: 'Incrementa tu Tasa de Ahorro',
        description: `Actualmente ahorras $${avgMonthlySavings.toLocaleString()} al mes. Podrías ahorrar un 10% más.`,
        impact: {
          potential: avgMonthlySavings * 0.1 * 12,
          timeframe: '1 año'
        },
        action: {
          text: 'Crear plan de ahorro automático',
          data: { suggestedAmount: avgMonthlySavings * 1.1 }
        },
        confidence: 0.8
      });
    }
    
    // Recomendación de fondo de emergencia
    const monthlyExpenses = monthlyData.length > 0 ? 
      monthlyData[monthlyData.length - 1].totalExpenses : 0;
    
    const emergencyMonths = monthlyExpenses > 0 ? currentBalance / monthlyExpenses : 0;
    
    if (emergencyMonths < 3) {
      const neededAmount = (monthlyExpenses * 3) - currentBalance;
      
      recommendations.push({
        id: 'emergency_fund',
        type: 'saving',
        priority: 'high',
        title: 'Construye tu Fondo de Emergencia',
        description: `Te faltan $${neededAmount.toLocaleString()} para tener 3 meses de gastos cubiertos.`,
        impact: {
          potential: neededAmount,
          timeframe: '6-12 meses'
        },
        action: {
          text: 'Crear meta de fondo de emergencia',
          data: { targetAmount: neededAmount, priority: 'high' }
        },
        confidence: 0.95
      });
    }
    return recommendations;
  }
  private static async generateSpendingOptimizations(
    transactions: Transaction[]
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    // Analizar gastos por categoría
    const categoryAnalysis = this.analyzeCategorySpending(transactions);
    
    // Encontrar categorías con mayor potencial de optimización
    for (const [category, data] of Object.entries(categoryAnalysis)) {
      const trend = MathUtils.linearRegression(data.monthlyAmounts);
      
      // Si el gasto está creciendo rápidamente
      if (trend.slope > 50000 && data.totalAmount > 500000) { // Más de 50k de crecimiento mensual y total > 500k
        const potentialSaving = trend.slope * 6; // Proyección 6 meses
        
        recommendations.push({
          id: `optimize_${category.toLowerCase()}`,
          type: 'spending',
          priority: 'medium',
          title: `Optimiza Gastos en ${category}`,
          description: `Tus gastos en ${category} han aumentado $${trend.slope.toLocaleString()} por mes.`,
          impact: {
            potential: potentialSaving,
            timeframe: '6 meses'
          },
          action: {
            text: 'Revisar y crear presupuesto',
            data: { category, currentTrend: trend.slope }
          },
          confidence: Math.min(0.9, trend.r2)
        });
      }
      
      // Detectar gastos excesivos comparado con promedio
      const avgMonthly = data.totalAmount / Math.max(1, data.monthlyAmounts.length);
      const lastMonth = data.monthlyAmounts[data.monthlyAmounts.length - 1] || 0;
      
      if (lastMonth > avgMonthly * 1.5 && lastMonth > 100000) {
        recommendations.push({
          id: `review_${category.toLowerCase()}`,
          type: 'warning',
          priority: 'medium',
          title: `Gasto Alto en ${category}`,
          description: `El mes pasado gastaste 50% más de lo normal en ${category}.`,
          impact: {
            potential: lastMonth - avgMonthly,
            timeframe: '1 mes'
          },
          action: {
            text: 'Revisar transacciones recientes',
            data: { category, excess: lastMonth - avgMonthly }
          },
          confidence: 0.85
        });
      }
    }
    return recommendations;
  }
  private static async generateGoalRecommendations(
    transactions: Transaction[],
    goals: Goal[],
    currentBalance: number
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    if (goals.length === 0) {
      recommendations.push({
        id: 'create_first_goal',
        type: 'goal',
        priority: 'medium',
        title: 'Crea tu Primera Meta Financiera',
        description: 'Establecer metas te ayuda a mantener el enfoque y motivación en tus finanzas.',
        impact: {
          potential: 0,
          timeframe: 'Inmediato'
        },
        action: {
          text: 'Crear nueva meta',
          data: { suggestedAmount: currentBalance * 0.1 }
        },
        confidence: 0.9
      });
      
      return recommendations;
    }
    // Analizar progreso de metas
    for (const goal of goals) {
      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      const remaining = goal.targetAmount - goal.currentAmount;
      
      const deadline = new Date(goal.deadline);
      const now = new Date();
      const monthsLeft = Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
      
      // Meta en riesgo
      if (monthsLeft > 0 && monthsLeft < 6 && progress < 70) {
        const monthlyNeeded = remaining / monthsLeft;
        
        recommendations.push({
          id: `goal_risk_${goal.id}`,
          type: 'warning',
          priority: 'high',
          title: `Meta "${goal.name}" en Riesgo`,
          description: `Necesitas ahorrar $${monthlyNeeded.toLocaleString()} mensuales para alcanzar esta meta.`,
          impact: {
            potential: remaining,
            timeframe: `${Math.ceil(monthsLeft)} meses`
          },
          action: {
            text: 'Ajustar plan de ahorro',
            data: { goalId: goal.id, monthlyNeeded }
          },
          confidence: 0.9
        });
      }
      
      // Meta casi completada
      if (progress > 90 && progress < 100) {
        recommendations.push({
          id: `goal_almost_${goal.id}`,
          type: 'goal',
          priority: 'high',
          title: `¡Casi Logras "${goal.name}"!`,
          description: `Solo te faltan $${remaining.toLocaleString()} para completar esta meta.`,
          impact: {
            potential: remaining,
            timeframe: '1 mes'
          },
          action: {
            text: 'Hacer aporte final',
            data: { goalId: goal.id, finalAmount: remaining }
          },
          confidence: 0.95
        });
      }
    }
    return recommendations;
  }
  private static async generatePredictiveAlerts(
    transactions: Transaction[],
    currentBalance: number
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    // Predicción de cash flow
    const cashFlowPrediction = await PredictiveEngine.predictCashFlow(transactions, currentBalance, 3);
    
    // Alerta si se predice balance negativo
    const negativeBalanceMonth = cashFlowPrediction.find(p => p.predictedBalance < 0);
    
    if (negativeBalanceMonth) {
      recommendations.push({
        id: 'negative_balance_alert',
        type: 'warning',
        priority: 'high',
        title: 'Alerta: Balance Negativo Predicho',
        description: `Se predice que tu balance será negativo en ${negativeBalanceMonth.month} mes(es).`,
        impact: {
          potential: Math.abs(negativeBalanceMonth.predictedBalance),
          timeframe: `${negativeBalanceMonth.month} meses`
        },
        action: {
          text: 'Revisar gastos futuros',
          data: { month: negativeBalanceMonth.month, amount: negativeBalanceMonth.predictedBalance }
        },
        confidence: negativeBalanceMonth.confidence
      });
    }
    
    // Detectar anomalías
    const anomalies = PredictiveEngine.detectSpendingAnomalies(transactions);
    const recentAnomalies = anomalies.filter(a => {
      const transactionDate = new Date(a.transaction.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return transactionDate >= thirtyDaysAgo;
    });
    
    if (recentAnomalies.length > 0) {
      const highSeverityAnomalies = recentAnomalies.filter(a => a.severity === 'high');
      
      if (highSeverityAnomalies.length > 0) {
        recommendations.push({
          id: 'anomaly_alert',
          type: 'warning',
          priority: 'medium',
          title: 'Gastos Inusuales Detectados',
          description: `Se detectaron ${highSeverityAnomalies.length} gastos anómalos en los últimos 30 días.`,
          impact: {
            potential: highSeverityAnomalies.reduce((sum, a) => sum + a.transaction.amount, 0),
            timeframe: '30 días'
          },
          action: {
            text: 'Revisar transacciones',
            data: { anomalies: highSeverityAnomalies }
          },
          confidence: 0.8
        });
      }
    }
    return recommendations;
  }
  private static async generateBudgetRecommendations(
    transactions: Transaction[],
    budgets: Budget[]
  ): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    if (budgets.length === 0) {
      // Sugerir crear presupuestos para las categorías más gastadas
      const categorySpending = this.analyzeCategorySpending(transactions);
      const topCategories = Object.entries(categorySpending)
        .sort(([,a], [,b]) => b.totalAmount - a.totalAmount)
        .slice(0, 3);
      
      if (topCategories.length > 0) {
        recommendations.push({
          id: 'create_budgets',
          type: 'spending',
          priority: 'medium',
          title: 'Crea Presupuestos para Control',
          description: `Crea presupuestos para tus principales categorías de gasto: ${topCategories.map(([cat]) => cat).join(', ')}.`,
          impact: {
            potential: 0,
            timeframe: 'Inmediato'
          },
          action: {
            text: 'Crear presupuestos',
            data: { suggestedCategories: topCategories }
          },
          confidence: 0.85
        });
      }
    }
    return recommendations;
  }
  // Funciones auxiliares
  private static analyzeMonthlyFlow(transactions: Transaction[]) {
    const monthlyData = new Map<string, { totalIncome: number; totalExpenses: number; netFlow: number }>();
    
    transactions.forEach(transaction => {
      const monthKey = transaction.date.substring(0, 7);
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { totalIncome: 0, totalExpenses: 0, netFlow: 0 });
      }
      
      const data = monthlyData.get(monthKey)!;
      if (transaction.type === 'income') {
        data.totalIncome += transaction.amount;
      } else {
        data.totalExpenses += transaction.amount;
      }
      data.netFlow = data.totalIncome - data.totalExpenses;
    });
    
    return Array.from(monthlyData.values());
  }
  private static analyzeCategorySpending(transactions: Transaction[]) {
    const categoryData: Record<string, { 
      totalAmount: number; 
      monthlyAmounts: number[];
      transactionCount: number;
    }> = {};
    
    const monthlyByCategory = new Map<string, Map<string, number>>();
    
    transactions.filter(t => t.type === 'expense').forEach(transaction => {
      const monthKey = transaction.date.substring(0, 7);
      
      if (!categoryData[transaction.category]) {
        categoryData[transaction.category] = {
          totalAmount: 0,
          monthlyAmounts: [],
          transactionCount: 0
        };
      }
      
      categoryData[transaction.category].totalAmount += transaction.amount;
      categoryData[transaction.category].transactionCount++;
      
      if (!monthlyByCategory.has(transaction.category)) {
        monthlyByCategory.set(transaction.category, new Map());
      }
      
      const categoryMonthly = monthlyByCategory.get(transaction.category)!;
      categoryMonthly.set(monthKey, (categoryMonthly.get(monthKey) || 0) + transaction.amount);
    });
    
    // Convertir datos mensuales a arrays
    for (const [category, monthlyMap] of monthlyByCategory.entries()) {
      categoryData[category].monthlyAmounts = Array.from(monthlyMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, amount]) => amount);
    }
    
    return categoryData;
  }
}
