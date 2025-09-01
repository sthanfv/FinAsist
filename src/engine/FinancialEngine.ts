
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
export interface SpendingPrediction {
  predictedAmount: number;
  confidence: number;
  factors: string[];
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
  type: 'income_change' | 'expense_change' | 'one_time_expense';
  amount: number;
  duration: number; // en meses
  category?: string;
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
    const monthlyMap = new Map<string, { income: number; expenses: number; date: Date }>();
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { income: 0, expenses: 0, date: new Date(date.getFullYear(), date.getMonth(), 1) });
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
  static analyzeCategoryCorrelations(transactions: Transaction[]): CategoryCorrelation[] {
    const categories = [...new Set(transactions.filter(t => t.type === 'expense').map(t => t.category))];
    const correlations: CategoryCorrelation[] = [];
    
    for (let i = 0; i < categories.length; i++) {
      for (let j = i + 1; j < categories.length; j++) {
        const cat1 = categories[i];
        const cat2 = categories[j];
        
        const correlation = this.calculatePearsonCorrelation(
          this.getCategorySpendingByMonth(transactions, cat1),
          this.getCategorySpendingByMonth(transactions, cat2)
        );
        
        if (Math.abs(correlation) > 0.3) { // Solo correlaciones significativas
          correlations.push({
            category1: cat1,
            category2: cat2,
            correlation,
            insight: this.interpretCorrelation(cat1, cat2, correlation)
          });
        }
      }
    }
    return correlations;
  }

  static predictMonthlySpending(
    transactions: Transaction[], 
    targetMonth: string
  ): SpendingPrediction {
    const monthlyData = this.groupTransactionsByMonth(transactions);
    if(monthlyData.length < 2) return { predictedAmount: 0, confidence: 0, factors: [], recommendation: 'No hay suficientes datos.' };

    const features = monthlyData.map(month => [
      month.totalExpenses,
      month.transactionCount,
      new Date(month.month).getMonth(), // Factor estacional
      month.categories.length // Diversidad de gastos
    ]);
    
    const targets = monthlyData.map(m => m.totalExpenses);
    
    // Regresión lineal múltiple simplificada
    const coefficients = this.multipleLinearRegression(features, targets);
    const targetDate = new Date(targetMonth);
    const prediction = this.applyRegression(coefficients, [
      targets[targets.length - 1], // Último mes como baseline
      monthlyData[monthlyData.length - 1].transactionCount,
      targetDate.getMonth(),
      monthlyData[monthlyData.length - 1].categories.length
    ]);
    return {
      predictedAmount: prediction,
      confidence: this.calculatePredictionConfidence(monthlyData),
      factors: this.identifySpendingFactors(monthlyData),
      recommendation: this.generateSpendingRecommendation(prediction, targets)
    };
  }

  static analyzeCategoryEfficiency(transactions: Transaction[]): CategoryEfficiency[] {
    const categoryData = this.groupTransactionsByCategory(transactions);
    
    return Object.entries(categoryData).map(([category, data]) => {
      const frequency = data.transactions.length;
      const totalSpent = data.totalAmount;
      const avgTransaction = totalSpent / frequency;
      const monthlyTrend = this.calculateCategoryTrend(data.transactions);
      
      // Índice de eficiencia (gastos necesarios vs opcionales)
      const efficiencyScore = this.calculateCategoryEfficiencyScore(category, data);
      
      return {
        category,
        totalSpent,
        frequency,
        avgTransaction,
        monthlyTrend,
        efficiencyScore,
        recommendations: this.getCategoryRecommendations(category, efficiencyScore, monthlyTrend)
      };
    }).sort((a, b) => b.totalSpent - a.totalSpent);
  }

  static generateOptimizationPlan(
    transactions: Transaction[],
    goals: Goal[],
    balance: number,
    targetSavingsRate: number = 0.2
  ): OptimizationPlan {
    const currentMetrics = this.calculateFinancialMetrics(transactions, balance);
    const categoryEfficiency = this.analyzeCategoryEfficiency(transactions);
    
    const optimizations: Optimization[] = [];
    
    // Identificar categorías con mayor potencial de ahorro
    const inefficientCategories = categoryEfficiency
      .filter(cat => cat.efficiencyScore < 0.6)
      .sort((a, b) => b.totalSpent - a.totalSpent);
    
    let potentialSavings = 0;
    
    inefficientCategories.forEach(category => {
      const reduction = category.totalSpent * (1 - category.efficiencyScore) * 0.3;
      potentialSavings += reduction;
      
      optimizations.push({
        type: 'reduce_spending',
        category: category.category,
        currentAmount: category.totalSpent,
        targetAmount: category.totalSpent - reduction,
        potentialSaving: reduction,
        difficulty: this.assessOptimizationDifficulty(category),
        timeline: this.estimateImplementationTime(category)
      });
    });

    const potentialSavingsRate = currentMetrics.averageMonthlyIncome > 0 ? (currentMetrics.netFlow + potentialSavings) / currentMetrics.averageMonthlyIncome : 0;

    return {
      currentSavingsRate: currentMetrics.savingsRate,
      targetSavingsRate,
      potentialSavingsRate,
      optimizations,
      expectedTimeToGoals: this.calculateOptimizedTimeToGoals(goals, potentialSavings, currentMetrics),
      priorityActions: this.prioritizeOptimizations(optimizations)
    };
  }

  static simulateFinancialScenarios(
    transactions: Transaction[],
    balance: number,
    scenarios: FinancialScenario[]
  ): ScenarioResult[] {
    const baseMetrics = this.calculateFinancialMetrics(transactions, balance);
    
    return scenarios.map(scenario => {
      const modifiedTransactions = this.applyScenarioToTransactions(transactions, scenario);
      const newMetrics = this.calculateFinancialMetrics(modifiedTransactions, balance);
      
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

  // --- STUBS PARA MÉTODOS AUXILIARES FALTANTES ---

  private static getCategorySpendingByMonth(transactions: Transaction[], category: string): number[] { return [1,2,3]; }
  private static calculatePearsonCorrelation(arr1: number[], arr2: number[]): number { return 0.5; }
  private static interpretCorrelation(cat1: string, cat2: string, correlation: number): string { return `Cuando gastas en ${cat1}, tiendes a gastar en ${cat2}.`; }
  private static groupTransactionsByMonth(transactions: Transaction[]): any[] { return [{month: '2023-01', totalExpenses: 100, transactionCount: 5, categories: ['a','b']}] }
  private static multipleLinearRegression(features: number[][], targets: number[]): number[] { return [0.1, 0.2, 0.3]; }
  private static applyRegression(coeffs: number[], features: number[]): number { return 120; }
  private static calculatePredictionConfidence(data: any[]): number { return 85; }
  private static identifySpendingFactors(data: any[]): string[] { return ['Estacionalidad', 'Número de compras']; }
  private static generateSpendingRecommendation(prediction: number, targets: number[]): string { return "Intenta mantener tus gastos por debajo de X."; }
  private static groupTransactionsByCategory(transactions: Transaction[]): Record<string, any> { return {'Comida': { transactions, totalAmount: 1000 }}; }
  private static calculateCategoryTrend(transactions: Transaction[]): number { return 0.1; }
  private static calculateCategoryEfficiencyScore(category: string, data: any): number { return 0.7; }
  private static getCategoryRecommendations(category: string, score: number, trend: number): string[] { return ['Revisa suscripciones.']; }
  private static assessOptimizationDifficulty(category: any): 'EASY' | 'MEDIUM' | 'HARD' { return 'MEDIUM'; }
  private static estimateImplementationTime(category: any): string { return "1 mes"; }
  private static calculateOptimizedTimeToGoals(goals: Goal[], savings: number, metrics: FinancialMetrics): Record<string, number> { return {'Viaje': 12}; }
  private static prioritizeOptimizations(opts: Optimization[]): Optimization[] { return opts; }
  private static applyScenarioToTransactions(transactions: Transaction[], scenario: FinancialScenario): Transaction[] { return transactions; }
  private static assessScenarioRisk(scenario: FinancialScenario, metrics: FinancialMetrics): string { return 'Bajo'; }
  private static assessScenarioFeasibility(scenario: FinancialScenario, metrics: FinancialMetrics): 'HIGH' | 'MEDIUM' | 'LOW' { return 'HIGH'; }

}
