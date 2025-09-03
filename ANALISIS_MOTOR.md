# Código Completo y Consolidado del Motor Financiero

Este documento contiene el código fuente completo y final de los cuatro archivos que componen el núcleo de la inteligencia financiera de la aplicación.

---

## 1. src/engine/FinancialEngine.ts

```typescript
import { Transaction, Goal } from '@/store/useAppStore';

// Interfaces del motor
export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  averageMonthlyIncome: number;
  averageMonthlyExpenses: number;
  savingsRate: number;
  burnRate: number; // Cuánto tiempo durarían los ahorros
  efficiency: number;
  savingsGrowth: number;
}

export interface TrendAnalysis {
  incomeGrowthRate: number;
  expenseGrowthRate: number;
  savingsGrowth: number;
  volatilityScore: number;
  consistency: number;
  predictedNextMonthExpenses: number;
  predictedNextMonthIncome: number;
}

export interface RiskProfile {
  financialHealthScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  emergencyFundMonths: number;
  debtToIncomeRatio: number;
  recommendations: string[];
}

export interface FinancialProjection {
  timeframe: number; // meses
  projectedBalance: number;
  projectedSavings: number;
  goalAchievementProbability: number;
  requiredMonthlySavings: number;
}

export interface CashFlowProjection {
  month: string;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
  confidenceLevel: number;
}

export interface SeasonalityAnalysis {
  month: string;
  amount: number;
  variance: number;
}

export interface FinancialAlert {
    id: string;
    type: 'warning' | 'error' | 'success' | 'info';
    title: string;
    message: string;
    amount?: number;
    actionable: boolean;
    category: 'spending' | 'goals' | 'investment' | 'general';
}

// Interfaces para métodos avanzados
export interface CategoryCorrelation {
  category1: string;
  category2: string;
  correlation: number;
  insight: string;
}
export interface SpendingFactor {
  name: string;
  impact: number;
  trend: number;
}
export interface SpendingPrediction {
  predictedAmount: number;
  confidence: number;
  factors: SpendingFactor[];
  recommendation: string;
}
export interface CategoryEfficiency {
  category: string;
  totalSpent: number;
  frequency: number;
  avgTransaction: number;
  monthlyTrend: number;
  efficiencyScore: number;
  recommendations: string[];
}
export interface Optimization {
  type: 'reduce_spending' | 'increase_income';
  category?: string;
  currentAmount: number;
  targetAmount: number;
  potentialSaving: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeline: string;
}
export interface OptimizationPlan {
  currentSavingsRate: number;
  targetSavingsRate: number;
  potentialSavingsRate: number;
  optimizations: Optimization[];
  expectedTimeToGoals: Record<string, number>;
  priorityActions: Optimization[];
}
export interface FinancialScenario {
  name: string;
  type: 'reduce_spending' | 'increase_income' | 'optimize_spending';
  category: string;
  percentageChange: number;
  duration: number; // en meses
  id?: string;
}

export interface ScenarioResult {
  scenario: string;
  impact: {
    savingsRateChange: number;
    burnRateChange: number;
    balanceChange: number;
  };
  riskAssessment: string;
  timeline: number;
  feasibility: 'HIGH' | 'MEDIUM' | 'LOW';
}


export class FinancialEngine {

  // FUNCIÓN PRINCIPAL: Análisis completo
  static runCompleteAnalysis(transactions: Transaction[], goals: Goal[], balance: number) {
    if (transactions.length === 0) {
      return null;
    }
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const metrics = this.calculateFinancialMetrics(sortedTransactions, balance);
    const trends = this.analyzeTrends(sortedTransactions);
    const risk = this.assessRiskProfile(sortedTransactions, metrics, trends);
    const projections = this.generateProjections(sortedTransactions, goals, balance, metrics, trends);
    const cashFlowProjection = this.calculateCashFlowProjection(sortedTransactions, metrics);
    const anomalousTransactions = this.detectAnomalousTransactions(sortedTransactions);
    const seasonality = this.analyzeSeasonality(sortedTransactions);
    const alerts = this.generateAlerts(anomalousTransactions, goals, metrics, risk);


    return {
      metrics,
      trends,
      risk,
      projections,
      cashFlowProjection,
      anomalousTransactions,
      seasonality,
      alerts
    };
  }

  private static generateAlerts(anomalousTransactions: Transaction[], goals: Goal[], metrics: FinancialMetrics, risk: RiskProfile): FinancialAlert[] {
    const alerts: FinancialAlert[] = [];

    // Alerta por gasto inusual
    if (anomalousTransactions.length > 0) {
      alerts.push({
        id: 'anomalous-spending',
        type: 'warning',
        title: 'Gasto Inusual Detectado',
        message: `Detectamos ${anomalousTransactions.length} transacciones fuera de tu patrón normal de gastos.`,
        amount: anomalousTransactions.reduce((sum, t) => sum + t.amount, 0),
        actionable: true,
        category: 'spending'
      });
    }

    // Alerta por meta en riesgo
    const riskyGoals = goals.filter(goal => {
      const timeLeft = new Date(goal.deadline).getTime() - Date.now();
      if(timeLeft <= 0) return true; // Si ya pasó la fecha, está en riesgo.

      const daysLeft = timeLeft / (1000 * 60 * 60 * 24);
      if(daysLeft <=0) return true;
      
      const requiredDailyContribution = (goal.targetAmount - goal.currentAmount) / daysLeft;
      const avgDailySavings = (metrics.averageMonthlyIncome - metrics.averageMonthlyExpenses) / 30;
      
      return requiredDailyContribution > Math.max(0, avgDailySavings);
    });

    if (riskyGoals.length > 0) {
      alerts.push({
        id: 'goals-at-risk',
        type: 'error',
        title: 'Metas en Riesgo',
        message: `${riskyGoals.length} de tus metas podrían no cumplirse con tu ritmo actual de ahorro.`,
        actionable: true,
        category: 'goals'
      });
    }

    // Alerta por oportunidad de ahorro/inversión
    if (metrics.savingsRate > 0.25 && risk.financialHealthScore > 70) {
      alerts.push({
        id: 'investment-opportunity',
        type: 'success',
        title: '¡Oportunidad de Inversión!',
        message: `Con tu excelente tasa de ahorro del ${(metrics.savingsRate * 100).toFixed(0)}%, considera invertir parte de tus ahorros para que tu dinero crezca.`,
        actionable: true,
        category: 'investment'
      });
    }
    
    return alerts;
  }

  // Métricas básicas pero poderosas
  private static calculateFinancialMetrics(transactions: Transaction[], balance: number): FinancialMetrics {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const netFlow = totalIncome - totalExpenses;
    
    const monthlyAggregates = this.getMonthlyAggregates(transactions);
    const monthsWithData = monthlyAggregates.length || 1;

    const averageMonthlyIncome = totalIncome / monthsWithData;
    const averageMonthlyExpenses = totalExpenses / monthsWithData;
    
    const savingsRate = totalIncome > 0 ? (averageMonthlyIncome - averageMonthlyExpenses) / averageMonthlyIncome : 0;
    
    const burnRate = averageMonthlyExpenses > 0 ? 
      Math.max(0, balance / averageMonthlyExpenses) : Infinity;
    
    const efficiency = totalIncome > 0 ? netFlow / totalIncome : 0;

    const savingsGrowth = this.calculateGrowthRate(monthlyAggregates.map(m => m.income - m.expenses));


    return {
      totalIncome,
      totalExpenses,
      netFlow,
      averageMonthlyIncome,
      averageMonthlyExpenses,
      savingsRate,
      burnRate,
      efficiency,
      savingsGrowth
    };
  }

  // Análisis de tendencias con matemáticas avanzadas
  private static analyzeTrends(transactions: Transaction[]): TrendAnalysis {
    const monthlyData = this.getMonthlyAggregates(transactions);
    
    if (monthlyData.length < 2) {
      return {
        incomeGrowthRate: 0,
        expenseGrowthRate: 0,
        savingsGrowth: 0,
        volatilityScore: 0,
        consistency: 100,
        predictedNextMonthExpenses: monthlyData[0]?.expenses || 0,
        predictedNextMonthIncome: monthlyData[0]?.income || 0,
      };
    }
    // Calcular tasas de crecimiento usando regresión lineal simple
    const incomeGrowthRate = this.calculateGrowthRate(
      monthlyData.map(m => m.income)
    );
    
    const expenseGrowthRate = this.calculateGrowthRate(
      monthlyData.map(m => m.expenses)
    );

    const savingsGrowth = this.calculateGrowthRate(
        monthlyData.map(m => m.income - m.expenses)
    );

    // Puntuación de volatilidad
    const expenseVolatility = this.calculateVolatility(
      monthlyData.map(m => m.expenses)
    );
    // Consistencia (inverso de volatilidad)
    const consistency = Math.max(0, 100 - (expenseVolatility * 100));
    // Predicciones usando tendencia lineal
    const predictedNextMonthExpenses = this.predictNextValue(
      monthlyData.map(m => m.expenses)
    );
    
    const predictedNextMonthIncome = this.predictNextValue(
      monthlyData.map(m => m.income)
    );
    return {
      incomeGrowthRate,
      expenseGrowthRate,
      savingsGrowth,
      volatilityScore: expenseVolatility * 100,
      consistency,
      predictedNextMonthExpenses,
      predictedNextMonthIncome,
    };
  }

  // Sistema de puntuación de riesgo financiero
  private static assessRiskProfile(transactions: Transaction[], metrics: FinancialMetrics, trends: TrendAnalysis): RiskProfile {
    let score = 100;
    const recommendations: string[] = [];
    // Factor 1: Tasa de ahorro (40% del score)
    if (metrics.savingsRate < 0.1) { // Ahorro < 10%
      score -= 40;
      recommendations.push('Aumenta tu tasa de ahorro al menos al 10%');
    } else if (metrics.savingsRate < 0.2) { // Ahorro < 20%
      score -= 20;
      recommendations.push('Mejora tu tasa de ahorro al 20% para mayor seguridad');
    }
    // Factor 2: Fondo de emergencia (35% del score)
    const emergencyFundMonths = metrics.burnRate;
    if (emergencyFundMonths < 3) {
      score -= 35;
      recommendations.push('Crítico: Construye un fondo de emergencia de al menos 3 meses de gastos');
    } else if (emergencyFundMonths < 6) {
      score -= 15;
      recommendations.push('Excelente progreso. Intenta ampliar tu fondo de emergencia a 6 meses para una tranquilidad total');
    }
    // Factor 3: Consistencia de gastos (25% del score)
    if (trends.consistency < 50) {
      score -= 25;
      recommendations.push('Tus gastos son muy variables. Crear un presupuesto te ayudará a tener más control');
    } else if (trends.consistency < 75) {
      score -= 10;
      recommendations.push('Busca mejorar la consistencia de tus gastos mensuales para facilitar la planificación');
    }

    // Detectar gastos anómalos
    const anomalous = this.detectAnomalousTransactions(transactions);
    if(anomalous.length > 0) {
        recommendations.push(`Hemos detectado ${anomalous.length} transacción(es) inusualmente alta(s). Revísalas para asegurar que todo esté en orden.`);
    }

    // Determinar nivel de riesgo
    let riskLevel: RiskProfile['riskLevel'];
    if (score >= 80) riskLevel = 'LOW';
    else if (score >= 60) riskLevel = 'MEDIUM';
    else if (score >= 40) riskLevel = 'HIGH';
    else riskLevel = 'CRITICAL';
    return {
      financialHealthScore: Math.max(0, score),
      riskLevel,
      emergencyFundMonths,
      debtToIncomeRatio: 0, // Por ahora, expandible
      recommendations,
    };
  }

  // Proyecciones financieras inteligentes
  private static generateProjections(transactions: Transaction[], goals: Goal[], balance: number, metrics: FinancialMetrics, trends: TrendAnalysis): FinancialProjection[] {
    const projections: FinancialProjection[] = [];
    // Proyecciones para diferentes timeframes
    const timeframes = [3, 6, 12, 24];
    timeframes.forEach(months => {
      const monthlyNetFlow = metrics.averageMonthlyIncome - trends.predictedNextMonthExpenses;
      const projectedBalance = balance + (monthlyNetFlow * months);
      const projectedSavings = Math.max(0, projectedBalance - balance);
      // Calcular probabilidad de logro de meta principal
      let goalAchievementProbability = 0;
      let requiredMonthlySavings = 0;
      if (goals.length > 0) {
        const primaryGoal = goals[0]; // Meta más importante
        const remainingAmount = primaryGoal.targetAmount - primaryGoal.currentAmount;
        requiredMonthlySavings = remainingAmount > 0 && months > 0 ? remainingAmount / months : 0;
        
        // Probabilidad basada en capacidad actual de ahorro
        const currentMonthlySavingsCapacity = Math.max(0, monthlyNetFlow);
        if (requiredMonthlySavings <= 0 || requiredMonthlySavings <= currentMonthlySavingsCapacity) {
          goalAchievementProbability = Math.min(95, 85 + (trends.consistency / 10));
        } else {
          goalAchievementProbability = Math.max(5, 50 * (currentMonthlySavingsCapacity / requiredMonthlySavings));
        }
      }
      projections.push({
        timeframe: months,
        projectedBalance,
        projectedSavings,
        goalAchievementProbability,
        requiredMonthlySavings,
      });
    });
    return projections;
  }
  
    // Método para calcular proyecciones de flujo de caja
    private static calculateCashFlowProjection(transactions: Transaction[], metrics: FinancialMetrics, months: number = 12): CashFlowProjection[] {
      if(transactions.length === 0) return [];
      const monthlyData = this.getMonthlyAggregates(transactions);
      
      return Array.from({ length: months }, (_, i) => {
        const projectedDate = new Date();
        projectedDate.setMonth(projectedDate.getMonth() + i + 1);
        
        return {
          month: projectedDate.toISOString().slice(0, 7),
          projectedIncome: metrics.averageMonthlyIncome,
          projectedExpenses: metrics.averageMonthlyExpenses,
          projectedBalance: metrics.averageMonthlyIncome - metrics.averageMonthlyExpenses,
          confidenceLevel: this.calculateConfidence(monthlyData.length, i)
        };
      });
    }

    // Detector de gastos anómalos usando desviación estándar
    private static detectAnomalousTransactions(transactions: Transaction[]): Transaction[] {
      if (transactions.length < 5) return [];
      const expenseAmounts = transactions
        .filter(t => t.type === 'expense')
        .map(t => t.amount);
      
      const mean = expenseAmounts.reduce((a, b) => a + b, 0) / expenseAmounts.length;
      const variance = expenseAmounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / expenseAmounts.length;
      const stdDev = Math.sqrt(variance);
      const threshold = mean + (2 * stdDev); // 2 desviaciones estándar
      
      return transactions.filter(t => 
        t.type === 'expense' && t.amount > threshold
      );
    }

    // Análisis de estacionalidad de gastos
    private static analyzeSeasonality(transactions: Transaction[]): SeasonalityAnalysis[] {
      if (transactions.length === 0) return [];
      const monthlyTotals: Record<number, number[]> = {};

      transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            const month = new Date(t.date).getMonth();
            if (!monthlyTotals[month]) {
                monthlyTotals[month] = [];
            }
            monthlyTotals[month].push(t.amount);
        });

      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                     'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      return months.map((name, index) => {
          const amounts = monthlyTotals[index] || [0];
          const totalAmount = amounts.reduce((sum, val) => sum + val, 0);
          
          return {
              month: name,
              amount: totalAmount,
              variance: this.calculateVolatility(amounts)
          };
      });
    }
  
    private static calculateConfidence(dataPoints: number, projectionIndex: number): number {
      const baseConfidence = 1 / (1 + Math.log10(dataPoints + 1));
      const decay = Math.exp(-0.1 * projectionIndex);
      return Math.round(baseConfidence * decay * 100);
  }

  // FUNCIONES MATEMÁTICAS AUXILIARES
  private static getUniqueMonths(transactions: Transaction[]): string[] {
    const months = new Set<string>();
    transactions.forEach(t => {
      const date = new Date(t.date);
      months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    });
    return Array.from(months);
  }

  private static getMonthlyAggregates(transactions: Transaction[]) {
    const monthlyMap = new Map<string, { income: number; expenses: number; date: Date, month: string }>();
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { income: 0, expenses: 0, date: new Date(date.getFullYear(), date.getMonth(), 1), month: key });
      }
      const data = monthlyMap.get(key)!;
      if (t.type === 'income') {
        data.income += t.amount;
      } else {
        data.expenses += t.amount;
      }
    });

    return Array.from(monthlyMap.values()).sort((a,b) => a.date.getTime() - b.date.getTime());
  }

  private static calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    const n = values.length;
    values.forEach((y, x) => {
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgY = sumY / n;
    
    return avgY !== 0 ? (slope / Math.abs(avgY)) : 0; // Porcentaje de crecimiento relativo
  }

  private static calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    if (mean === 0) return 0;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return stdDev / mean; // Coeficiente de variación
  }

  private static predictNextValue(values: number[]): number {
    if (values.length === 0) return 0;
    if (values.length < 2) return values[0];
    const trendRate = this.calculateGrowthRate(values);
    const lastValue = values[values.length - 1];
    
    return lastValue * (1 + trendRate);
  }

  // ============== MÉTODOS AVANZADOS =================
  
  static simulateFinancialScenarios(
    transactions: Transaction[],
    scenarios: FinancialScenario[]
  ): ScenarioResult[] {
    const baseMetrics = this.calculateFinancialMetrics(transactions, 0); // Balance 0 for base simulation
    
    return scenarios.map(scenario => {
      const modifiedTransactions = this.applyScenarioToTransactions(transactions, scenario);
      const newMetrics = this.calculateFinancialMetrics(modifiedTransactions, 0);
      
      return {
        scenario: scenario.name,
        impact: {
          savingsRateChange: newMetrics.savingsRate - baseMetrics.savingsRate,
          burnRateChange: newMetrics.burnRate - baseMetrics.burnRate,
          balanceChange: newMetrics.netFlow - baseMetrics.netFlow
        },
        riskAssessment: this.assessScenarioRisk(scenario, newMetrics),
        timeline: scenario.duration,
        feasibility: this.assessScenarioFeasibility(scenario, baseMetrics)
      };
    });
  }
  
  private static applyScenarioToTransactions(transactions: Transaction[], scenario: FinancialScenario): Transaction[] { return transactions; }
  private static assessScenarioRisk(scenario: FinancialScenario, metrics: FinancialMetrics): 'low' | 'medium' | 'high' { return 'low'; }
  private static assessScenarioFeasibility(scenario: FinancialScenario, metrics: FinancialMetrics): 'HIGH' | 'MEDIUM' | 'LOW' { return 'HIGH'; }

  // NUEVO: Análisis de correlación entre categorías
  static analyzeCategoryCorrelations(transactions: Transaction[]): CategoryCorrelation[] {
    if (transactions.length < 10) return []; // Necesitamos datos suficientes
    
    const categories = [...new Set(transactions.filter(t => t.type === 'expense').map(t => t.category))];
    const correlations: CategoryCorrelation[] = [];
    
    for (let i = 0; i < categories.length; i++) {
      for (let j = i + 1; j < categories.length; j++) {
        const cat1 = categories[i];
        const cat2 = categories[j];
        
        const cat1Spending = this.getCategorySpendingByMonth(transactions, cat1);
        const cat2Spending = this.getCategorySpendingByMonth(transactions, cat2);
        
        if (cat1Spending.length > 1 && cat2Spending.length > 1) {
          const correlation = this.calculatePearsonCorrelation(cat1Spending, cat2Spending);
          
          if (Math.abs(correlation) > 0.3) {
            correlations.push({
              category1: cat1,
              category2: cat2,
              correlation,
              insight: this.interpretCorrelation(cat1, cat2, correlation)
            });
          }
        }
      }
    }
    return correlations;
  }
  // NUEVO: Predicción de gastos
  static predictMonthlySpending(transactions: Transaction[], targetMonth: string): SpendingPrediction {
    const monthlyData = this.getMonthlyAggregates(transactions);
    if (monthlyData.length < 2) {
      return {
        predictedAmount: monthlyData[0]?.expenses || 0,
        confidence: 0.1,
        factors: [],
        recommendation: 'Necesitamos más datos para hacer predicciones precisas.'
      };
    }
    const expenseAmounts = monthlyData.map(m => m.expenses);
    const avgExpenses = expenseAmounts.reduce((a, b) => a + b, 0) / expenseAmounts.length;
    const trend = this.calculateGrowthRate(expenseAmounts);
    
    const prediction = avgExpenses * (1 + trend);
    const confidence = Math.max(0.1, Math.min(0.9, 1 - this.calculateVolatility(expenseAmounts)));
    return {
      predictedAmount: Math.max(0, prediction),
      confidence,
      factors: [
        { name: 'Tendencia histórica', impact: Math.abs(trend), trend },
        { name: 'Promedio mensual', impact: 0.7, trend: 0 }
      ],
      recommendation: trend > 0.1 ? 
        'Tus gastos están creciendo. Considera revisar tu presupuesto.' :
        'Tus gastos se mantienen estables. ¡Buen control!'
    };
  }
  // NUEVO: Análisis de eficiencia por categoría
  static analyzeCategoryEfficiency(transactions: Transaction[]): CategoryEfficiency[] {
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const categoryData = this.groupTransactionsByCategory(expenseTransactions);
    
    return Object.entries(categoryData).map(([category, data]) => {
      const frequency = data.length;
      const totalSpent = data.reduce((sum, t) => sum + t.amount, 0);
      const avgTransaction = totalSpent / frequency;
      
      // Score simple basado en esencialidad de la categoría
      const essentialCategories = ['Alimentación', 'Salud', 'Servicios', 'Transporte'];
      const baseScore = essentialCategories.includes(category) ? 0.7 : 0.4;
      
      return {
        category,
        totalSpent,
        frequency,
        avgTransaction,
        monthlyTrend: 0, // Simplificado por ahora
        efficiencyScore: baseScore,
        recommendations: frequency > 20 ? 
          [`Muchas transacciones en ${category}. Considera consolidar compras.`] :
          [`Buen control en ${category}.`]
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);
  }
  // NUEVO: Plan de optimización
  static generateOptimizationPlan(
    transactions: Transaction[], 
    goals: Goal[],
    balance: number,
    targetSavingsRate: number = 0.2
  ): OptimizationPlan {
    const metrics = this.calculateFinancialMetrics(transactions, balance);
    const categoryEfficiency = this.analyzeCategoryEfficiency(transactions);
    
    const optimizations: Optimization[] = [];
    
    // Buscar categorías con mayor gasto y menor eficiencia
    const inefficientCategories = categoryEfficiency
      .filter(cat => cat.efficiencyScore < 0.6)
      .slice(0, 3); // Top 3
    
    let potentialSavings = 0;
    
    inefficientCategories.forEach(category => {
      const reduction = category.totalSpent * 0.15; // 15% de reducción
      potentialSavings += reduction;
      
      optimizations.push({
        type: 'reduce_spending',
        category: category.category,
        currentAmount: category.totalSpent,
        targetAmount: category.totalSpent - reduction,
        potentialSaving: reduction,
        difficulty: category.totalSpent > 500000 ? 'HARD' : 'MEDIUM',
        timeline: '3 meses'
      });
    });
    const currentSavingsRate = metrics.savingsRate;
    const newMonthlyIncome = metrics.averageMonthlyIncome;
    const potentialMonthlySavings = (metrics.averageMonthlyIncome - metrics.averageMonthlyExpenses) + (potentialSavings / 3);
    const potentialSavingsRate = newMonthlyIncome > 0 ? 
      potentialMonthlySavings / newMonthlyIncome : 0;
    return {
      currentSavingsRate,
      targetSavingsRate,
      potentialSavingsRate: Math.max(0, potentialSavingsRate),
      optimizations,
      expectedTimeToGoals: {},
      priorityActions: optimizations.sort((a, b) => b.potentialSaving - a.potentialSaving)
    };
  }
  // MÉTODOS AUXILIARES NECESARIOS
  private static getCategorySpendingByMonth(transactions: Transaction[], category: string): number[] {
    const monthlyData = this.getMonthlyAggregates(transactions);
    return monthlyData.map(month => {
      const categoryTransactions = transactions.filter(t => 
        t.category === category && 
        t.date.startsWith(month.month) && 
        t.type === 'expense'
      );
      return categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
    });
  }
  private static calculatePearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;
    
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
  private static interpretCorrelation(cat1: string, cat2: string, correlation: number): string {
    const absCorr = Math.abs(correlation);
    if (absCorr > 0.7) {
      return `Fuerte relación: cuando gastas más en ${cat1}, también gastas ${correlation > 0 ? 'más' : 'menos'} en ${cat2}`;
    } else if (absCorr > 0.4) {
      return `Relación moderada entre ${cat1} y ${cat2}`;
    }
    return `Relación débil entre ${cat1} y ${cat2}`;
  }
  private static groupTransactionsByCategory(transactions: Transaction[]): Record<string, Transaction[]> {
    return transactions.reduce((groups, transaction) => {
      const category = transaction.category;
      if (!groups[category]) groups[category] = [];
      groups[category].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);
  }
}
```

---

## 2. src/engine/predictive/PredictiveEngine.ts

```typescript
import { Transaction, Goal } from '@/store/useAppStore';
import { MathUtils } from '../utils/MathUtils';
import { globalCache } from '../cache/MemoryCache';
interface PredictionResult {
  prediction: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: 'high' | 'medium' | 'low' | 'none';
  factors: string[];
}
interface CashFlowPrediction {
  month: number;
  predictedIncome: number;
  predictedExpenses: number;
  predictedBalance: number;
  confidence: number;
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}
export class PredictiveEngine {
  
  // Predicción de cash flow avanzada
  static async predictCashFlow(
    transactions: Transaction[], 
    currentBalance: number, 
    monthsAhead: number = 6
  ): Promise<CashFlowPrediction[]> {
    const cacheKey = `predict_cashflow:${transactions.length}:${currentBalance}:${monthsAhead}`;
    const cached = globalCache.get<CashFlowPrediction[]>(cacheKey);
    
    if (cached) {
      console.log('🎯 Using cached cash flow prediction');
      return cached;
    }
    console.log('🔮 Generating cash flow predictions...');
    
    // Análisis histórico por meses
    const monthlyData = this.analyzeMonthlyPatterns(transactions);
    const seasonalityFactors = this.calculateSeasonalityFactors(monthlyData);
    
    // Análisis de tendencias
    const incomeData = monthlyData.map(m => m.totalIncome);
    const expenseData = monthlyData.map(m => m.totalExpenses);
    
    const incomeTrend = MathUtils.linearRegression(incomeData);
    const expenseTrend = MathUtils.linearRegression(expenseData);
    
    // Calcular volatilidad
    const incomeVolatility = MathUtils.standardDeviation(incomeData);
    const expenseVolatility = MathUtils.standardDeviation(expenseData);
    
    const predictions: CashFlowPrediction[] = [];
    let runningBalance = currentBalance;
    
    for (let month = 1; month <= monthsAhead; month++) {
      // Aplicar tendencia
      const baseIncome = incomeData.length > 0 
        ? incomeData[incomeData.length - 1] + (incomeTrend.slope * month)
        : 0;
      
      const baseExpense = expenseData.length > 0 
        ? expenseData[expenseData.length - 1] + (expenseTrend.slope * month)
        : 0;
      
      // Aplicar factores de estacionalidad
      const currentMonth = (new Date().getMonth() + month) % 12;
      const seasonalFactor = seasonalityFactors[currentMonth] || 1;
      
      const predictedIncome = Math.max(0, baseIncome * seasonalFactor);
      const predictedExpenses = Math.max(0, baseExpense * seasonalFactor);
      
      // Calcular escenarios
      const incomeVariation = incomeVolatility * 0.5;
      const expenseVariation = expenseVolatility * 0.5;
      
      const netFlow = predictedIncome - predictedExpenses;
      runningBalance += netFlow;
      
      // Confianza basada en cantidad de datos históricos y volatilidad
      const dataConfidence = Math.min(1, monthlyData.length / 12);
      const volatilityPenalty = Math.min(0.5, (incomeVolatility + expenseVolatility) / 10000);
      const timeDecay = Math.max(0.3, 1 - (month * 0.1));
      
      const confidence = (dataConfidence - volatilityPenalty) * timeDecay;
      
      predictions.push({
        month,
        predictedIncome,
        predictedExpenses,
        predictedBalance: runningBalance,
        confidence: Math.max(0.1, confidence),
        scenarios: {
          optimistic: runningBalance + (incomeVariation - expenseVariation/2),
          realistic: runningBalance,
          pessimistic: runningBalance - (incomeVariation/2 + expenseVariation)
        }
      });
    }
    
    // Cachear por 1 hora
    globalCache.set(cacheKey, predictions, 3600000);
    
    return predictions;
  }
  // Predicción de gastos por categoría
  static async predictCategorySpending(
    transactions: Transaction[], 
    category: string,
    monthsAhead: number = 3
  ): Promise<PredictionResult> {
    const categoryTransactions = transactions.filter(t => 
      t.category === category && t.type === 'expense'
    );
    
    if (categoryTransactions.length < 3) {
      return {
        prediction: 0,
        confidence: 0.1,
        trend: 'stable',
        seasonality: 'none',
        factors: ['Datos insuficientes']
      };
    }
    // Análisis mensual de la categoría
    const monthlyAmounts = this.getMonthlyAmountsForCategory(categoryTransactions);
    const trend = MathUtils.linearRegression(monthlyAmounts);
    const volatility = MathUtils.standardDeviation(monthlyAmounts);
    
    // Detectar estacionalidad
    const seasonality = this.detectCategorySeasonality(monthlyAmounts);
    
    // Predicción base
    const lastAmount = monthlyAmounts[monthlyAmounts.length - 1] || 0;
    const prediction = Math.max(0, lastAmount + (trend.slope * monthsAhead));
    
    // Factores que influyen en la predicción
    const factors = this.identifyPredictionFactors(categoryTransactions, trend, volatility);
    
    // Confianza basada en R² y cantidad de datos
    const confidence = Math.min(0.95, trend.r2 * (monthlyAmounts.length / 12));
    
    return {
      prediction,
      confidence: Math.max(0.1, confidence),
      trend: trend.slope > 10 ? 'increasing' : trend.slope < -10 ? 'decreasing' : 'stable',
      seasonality,
      factors
    };
  }
  // Detección de anomalías en patrones de gasto
  static detectSpendingAnomalies(transactions: Transaction[]): Array<{
    transaction: Transaction;
    anomalyScore: number;
    reason: string;
    severity: 'low' | 'medium' | 'high';
  }> {
    const anomalies: Array<{
      transaction: Transaction;
      anomalyScore: number;
      reason: string;
      severity: 'low' | 'medium' | 'high';
    }> = [];
    // Agrupar por categoría
    const categories = [...new Set(transactions.map(t => t.category))];
    
    categories.forEach(category => {
      const categoryTransactions = transactions
        .filter(t => t.category === category && t.type === 'expense')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      if (categoryTransactions.length < 5) return;
      
      const amounts = categoryTransactions.map(t => t.amount);
      const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
      const stdDev = MathUtils.standardDeviation(amounts);
      
      // Detectar outliers usando z-score
      categoryTransactions.forEach(transaction => {
        const zScore = Math.abs((transaction.amount - mean) / stdDev);
        
        if (zScore > 2) { // Más de 2 desviaciones estándar
          let severity: 'low' | 'medium' | 'high' = 'low';
          let reason = '';
          
          if (zScore > 3) {
            severity = 'high';
            reason = `Gasto extremadamente alto (${zScore.toFixed(1)}x más que el promedio)`;
          } else if (zScore > 2.5) {
            severity = 'medium';
            reason = `Gasto significativamente alto (${zScore.toFixed(1)}x más que el promedio)`;
          } else {
            reason = `Gasto inusual en la categoría ${category}`;
          }
          
          anomalies.push({
            transaction,
            anomalyScore: zScore,
            reason,
            severity
          });
        }
      });
    });
    return anomalies.sort((a, b) => b.anomalyScore - a.anomalyScore);
  }
  // Score de estabilidad financiera dinámico
  static calculateFinancialStabilityScore(
    transactions: Transaction[], 
    goals: Goal[], 
    currentBalance: number
  ): {
    score: number;
    factors: Array<{ factor: string; impact: number; description: string }>;
    recommendations: string[];
  } {
    let score = 50; // Base score
    const factors: Array<{ factor: string; impact: number; description: string }> = [];
    const recommendations: string[] = [];
    // Factor 1: Estabilidad de ingresos (0-25 puntos)
    const incomes = transactions
      .filter(t => t.type === 'income')
      .map(t => t.amount);
    
    if (incomes.length > 0) {
      const incomeStability = 100 - (MathUtils.standardDeviation(incomes) / 
        (incomes.reduce((sum, val) => sum + val, 0) / incomes.length) * 100);
      
      const incomePoints = Math.min(25, incomeStability * 0.25);
      score += incomePoints;
      
      factors.push({
        factor: 'Estabilidad de Ingresos',
        impact: incomePoints,
        description: `Tus ingresos son ${incomeStability > 80 ? 'muy estables' : 
          incomeStability > 60 ? 'moderadamente estables' : 'variables'}`
      });
      
      if (incomeStability < 60) {
        recommendations.push('Busca fuentes de ingresos más estables o diversifica tus ingresos');
      }
    }
    // Factor 2: Control de gastos (0-20 puntos)
    const monthlyData = this.analyzeMonthlyPatterns(transactions);
    const expenseGrowth = monthlyData.length > 1 ? 
      this.calculateGrowthRate(monthlyData.map(m => m.totalExpenses)) : 0;
    
    const expenseControl = expenseGrowth < 0 ? 20 : 
      expenseGrowth < 0.05 ? 15 : 
      expenseGrowth < 0.1 ? 10 : 5;
    
    score += expenseControl;
    factors.push({
      factor: 'Control de Gastos',
      impact: expenseControl,
      description: `Tus gastos han ${expenseGrowth < 0 ? 'disminuido' : 
        expenseGrowth < 0.05 ? 'crecido moderadamente' : 'crecido significativamente'}`
    });
    // Factor 3: Fondo de emergencia (0-25 puntos)
    const monthlyExpenses = monthlyData.length > 0 ? 
      monthlyData[monthlyData.length - 1].totalExpenses : 0;
    
    const emergencyMonths = monthlyExpenses > 0 ? currentBalance / monthlyExpenses : 0;
    
    const emergencyPoints = emergencyMonths >= 6 ? 25 : 
      emergencyMonths >= 3 ? 20 : 
      emergencyMonths >= 1 ? 15 : 5;
    
    score += emergencyPoints;
    factors.push({
      factor: 'Fondo de Emergencia',
      impact: emergencyPoints,
      description: `Tienes ${emergencyMonths.toFixed(1)} meses de gastos cubiertos`
    });
    
    if (emergencyMonths < 3) {
      recommendations.push('Construye un fondo de emergencia de al menos 3-6 meses de gastos');
    }
    // Factor 4: Progreso en metas (0-15 puntos)
    if (goals.length > 0) {
      const avgProgress = goals.reduce((sum, goal) => 
        sum + Math.min(100, (goal.currentAmount / goal.targetAmount) * 100), 0) / goals.length;
      
      const goalPoints = (avgProgress / 100) * 15;
      score += goalPoints;
      
      factors.push({
        factor: 'Progreso en Metas',
        impact: goalPoints,
        description: `Progreso promedio del ${avgProgress.toFixed(1)}% en tus metas`
      });
      
      if (avgProgress < 50) {
        recommendations.push('Ajusta tus metas para que sean más alcanzables o aumenta tus ahorros');
      }
    }
    // Factor 5: Diversificación de gastos (0-15 puntos)
    const categories = [...new Set(transactions.filter(t => t.type === 'expense').map(t => t.category))];
    const diversificationPoints = Math.min(15, categories.length * 2);
    
    score += diversificationPoints;
    factors.push({
      factor: 'Diversificación',
      impact: diversificationPoints,
      description: `Gastas en ${categories.length} categorías diferentes`
    });
    // Limitar score entre 0 y 100
    score = Math.min(100, Math.max(0, score));
    // Recomendaciones generales basadas en el score
    if (score < 50) {
      recommendations.push('Considera revisar y ajustar tu estrategia financiera general');
    } else if (score > 80) {
      recommendations.push('¡Excelente gestión financiera! Considera inversiones para hacer crecer tu dinero');
    }
    return {
      score: Math.round(score),
      factors: factors.sort((a, b) => b.impact - a.impact),
      recommendations
    };
  }
  // Funciones auxiliares privadas
  private static analyzeMonthlyPatterns(transactions: Transaction[]) {
    const monthlyData = new Map<string, { totalIncome: number; totalExpenses: number }>();
    
    transactions.forEach(transaction => {
      const monthKey = transaction.date.substring(0, 7); // YYYY-MM
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { totalIncome: 0, totalExpenses: 0 });
      }
      
      const data = monthlyData.get(monthKey)!;
      if (transaction.type === 'income') {
        data.totalIncome += transaction.amount;
      } else {
        data.totalExpenses += transaction.amount;
      }
    });
    
    return Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));
  }
  private static calculateSeasonalityFactors(monthlyData: any[]): number[] {
    // Calcular factores de estacionalidad por mes (0-11)
    const factors = new Array(12).fill(1);
    
    if (monthlyData.length < 12) return factors;
    
    // Agrupar por mes del año
    const monthlyTotals = new Array(12).fill(0);
    const monthlyCounts = new Array(12).fill(0);
    
    monthlyData.forEach(data => {
      const month = new Date(data.month + '-01').getMonth();
      monthlyTotals[month] += (data.totalIncome + data.totalExpenses);
      monthlyCounts[month]++;
    });
    
    // Calcular promedio por mes
    const monthlyAverages = monthlyTotals.map((total, i) => 
      monthlyCounts[i] > 0 ? total / monthlyCounts[i] : 0
    );
    
    const overallAverage = monthlyAverages.reduce((sum, val) => sum + val, 0) / 12;
    
    // Calcular factores de estacionalidad
    return monthlyAverages.map(avg => 
      overallAverage > 0 ? avg / overallAverage : 1
    );
  }
  private static getMonthlyAmountsForCategory(transactions: Transaction[]): number[] {
    const monthlyData = new Map<string, number>();
    
    transactions.forEach(transaction => {
      const monthKey = transaction.date.substring(0, 7);
      monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + transaction.amount);
    });
    
    return Array.from(monthlyData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, amount]) => amount);
  }
  private static detectCategorySeasonality(monthlyAmounts: number[]): 'high' | 'medium' | 'low' | 'none' {
    if (monthlyAmounts.length < 12) return 'none';
    
    const avg = monthlyAmounts.reduce((sum, val) => sum + val, 0) / monthlyAmounts.length;
    const maxDeviation = Math.max(...monthlyAmounts.map(val => Math.abs(val - avg)));
    
    const coefficient = avg > 0 ? maxDeviation / avg : 0;
    
    if (coefficient > 0.5) return 'high';
    if (coefficient > 0.3) return 'medium';
    if (coefficient > 0.15) return 'low';
    return 'none';
  }
  private static identifyPredictionFactors(
    transactions: Transaction[], 
    trend: any, 
    volatility: number
  ): string[] {
    const factors: string[] = [];
    
    if (trend.slope > 10) {
      factors.push('Tendencia creciente identificada');
    } else if (trend.slope < -10) {
      factors.push('Tendencia decreciente identificada');
    }
    
    if (volatility > 1000) {
      factors.push('Alta variabilidad en gastos');
    }
    
    if (transactions.length < 6) {
      factors.push('Datos históricos limitados');
    }
    
    return factors;
  }
  private static calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;
    
    const first = values[0];
    const last = values[values.length - 1];
    
    if (first === 0) return 0;
    
    return (last - first) / first;
  }
}
```

---

## 3. src/engine/predictive/RecommendationEngine.ts

```typescript
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
```

---

## 4. src/engine/cache/ComputationCache.ts

```typescript
import { globalCache } from './MemoryCache';
import { Transaction, Goal } from '@/store/useAppStore';
type ComputationFunction = (...args: any[]) => any;
interface MemoOptions {
  ttl?: number;
  keyGenerator?: (...args: any[]) => string;
  shouldCache?: (...args: any[]) => boolean;
}
export class ComputationCache {
  
  // Decorator para memoizar funciones automáticamente
  static memoize<T extends ComputationFunction>(
    fn: T, 
    options: MemoOptions = {}
  ): T {
    const {
      ttl = 300000, // 5 minutos default
      keyGenerator = (...args) => JSON.stringify(args),
      shouldCache = () => true
    } = options;
    return ((...args: any[]) => {
      // Generar clave única
      const cacheKey = `memo:${fn.name}:${keyGenerator(...args)}`;
      
      // Si no debería cachear, ejecutar directamente
      if (!shouldCache(...args)) {
        return fn(...args);
      }
      // Intentar obtener del cache
      const cached = globalCache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
      // Ejecutar función y cachear resultado
      const result = fn(...args);
      globalCache.set(cacheKey, result, ttl);
      
      return result;
    }) as T;
  }
  // Invalidar cache específico para transacciones
  static invalidateTransactionCache(userId?: string): void {
    const pattern = userId 
      ? `memo:.*:.*${userId}.*` 
      : 'memo:.*transaction.*';
    
    globalCache.invalidatePattern(pattern);
  }
  // Invalidar cache específico para metas
  static invalidateGoalCache(userId?: string): void {
    const pattern = userId 
      ? `memo:.*:.*${userId}.*goal.*` 
      : 'memo:.*goal.*';
    
    globalCache.invalidatePattern(pattern);
  }
  // Cache específico para análisis financiero
  static getCachedAnalysis(
    transactions: Transaction[], 
    goals: Goal[], 
    balance: number
  ): any {
    // Generar hash único basado en los datos
    const dataHash = this.generateDataHash(transactions, goals, balance);
    const cacheKey = `analysis:${dataHash}`;
    
    return globalCache.get(cacheKey);
  }
  static setCachedAnalysis(
    transactions: Transaction[], 
    goals: Goal[], 
    balance: number, 
    analysis: any
  ): void {
    const dataHash = this.generateDataHash(transactions, goals, balance);
    const cacheKey = `analysis:${dataHash}`;
    
    // Cache por 10 minutos para análisis
    globalCache.set(cacheKey, analysis, 600000);
  }
  private static generateDataHash(
    transactions: Transaction[], 
    goals: Goal[], 
    balance: number
  ): string {
    // Crear hash simple pero efectivo
    const transactionHash = transactions.length > 0 
      ? `${transactions.length}-${transactions[0]?.id}-${transactions[transactions.length - 1]?.id}`
      : '0';
    
    const goalHash = goals.length > 0
      ? `${goals.length}-${goals.map(g => g.currentAmount).join('-')}`
      : '0';
    return `${transactionHash}_${goalHash}_${balance}`;
  }
  // Limpiar cache antiguo automáticamente
  static cleanupOldCache(): void {
    const stats = globalCache.getStats();
    console.log('🧹 Cache cleanup - Stats before:', stats);
    
    // Limpiar entradas específicas si es necesario
    if (stats.hitRate < 50 && globalCache.size() > 200) {
      globalCache.clear();
      console.log('🧹 Cache cleared due to low hit rate');
    }
  }
  // Pre-cargar datos frecuentemente usados
  static preloadCommonCalculations(
    transactions: Transaction[], 
    goals: Goal[]
  ): void {
    // Pre-calcular métricas básicas que se usan frecuentemente
    const commonMetrics = [
      () => transactions.filter(t => t.type === 'income').length,
      () => transactions.filter(t => t.type === 'expense').length,
      () => transactions.reduce((sum, t) => sum + t.amount, 0),
      () => goals.filter(g => g.currentAmount >= g.targetAmount).length
    ];
    commonMetrics.forEach((calc, index) => {
      const key = `preload:metric_${index}:${Date.now()}`;
      globalCache.set(key, calc(), 60000); // 1 minuto
    });
  }
}
```