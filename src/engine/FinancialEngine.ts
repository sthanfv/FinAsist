
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


class FinancialEngine {
  private transactions: Transaction[];
  private goals: Goal[];
  private currentBalance: number;

  constructor() {
    this.transactions = [];
    this.goals = [];
    this.currentBalance = 0;
  }

  // Actualizar datos del motor
  updateData(transactions: Transaction[], goals: Goal[], balance: number) {
    this.transactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    this.goals = [...goals];
    this.currentBalance = balance;
  }

  // FUNCIÓN PRINCIPAL: Análisis completo
  runCompleteAnalysis() {
    if (this.transactions.length === 0) {
      return null;
    }

    const metrics = this.calculateFinancialMetrics();
    const trends = this.analyzeTrends();
    const risk = this.assessRiskProfile(metrics, trends);
    const projections = this.generateProjections(metrics, trends);
    const cashFlowProjection = this.calculateCashFlowProjection(metrics);
    const anomalousTransactions = this.detectAnomalousTransactions();
    const seasonality = this.analyzeSeasonality();
    const alerts = this.generateAlerts(anomalousTransactions, metrics, risk);


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

  private generateAlerts(anomalousTransactions: Transaction[], metrics: FinancialMetrics, risk: RiskProfile): FinancialAlert[] {
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
    const riskyGoals = this.goals.filter(goal => {
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
  private calculateFinancialMetrics(): FinancialMetrics {
    const totalIncome = this.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = this.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const netFlow = totalIncome - totalExpenses;
    
    const monthlyAggregates = this.getMonthlyAggregates();
    const monthsWithData = monthlyAggregates.length || 1;

    const averageMonthlyIncome = totalIncome / monthsWithData;
    const averageMonthlyExpenses = totalExpenses / monthsWithData;
    
    const savingsRate = totalIncome > 0 ? (averageMonthlyIncome - averageMonthlyExpenses) / averageMonthlyIncome : 0;
    
    const burnRate = averageMonthlyExpenses > 0 ? 
      Math.max(0, this.currentBalance / averageMonthlyExpenses) : Infinity;
    
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
  private analyzeTrends(): TrendAnalysis {
    const monthlyData = this.getMonthlyAggregates();
    
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
  private assessRiskProfile(metrics: FinancialMetrics, trends: TrendAnalysis): RiskProfile {
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
    const anomalous = this.detectAnomalousTransactions();
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
  private generateProjections(metrics: FinancialMetrics, trends: TrendAnalysis): FinancialProjection[] {
    const projections: FinancialProjection[] = [];
    // Proyecciones para diferentes timeframes
    const timeframes = [3, 6, 12, 24];
    timeframes.forEach(months => {
      const monthlyNetFlow = metrics.averageMonthlyIncome - trends.predictedNextMonthExpenses;
      const projectedBalance = this.currentBalance + (monthlyNetFlow * months);
      const projectedSavings = Math.max(0, projectedBalance - this.currentBalance);
      // Calcular probabilidad de logro de meta principal
      let goalAchievementProbability = 0;
      let requiredMonthlySavings = 0;
      if (this.goals.length > 0) {
        const primaryGoal = this.goals[0]; // Meta más importante
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
    private calculateCashFlowProjection(metrics: FinancialMetrics, months: number = 12): CashFlowProjection[] {
      if(this.transactions.length === 0) return [];
      const monthlyData = this.getMonthlyAggregates();
      
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
    private detectAnomalousTransactions(): Transaction[] {
      if (this.transactions.length < 5) return [];
      const expenseAmounts = this.transactions
        .filter(t => t.type === 'expense')
        .map(t => t.amount);
      
      const mean = expenseAmounts.reduce((a, b) => a + b, 0) / expenseAmounts.length;
      const variance = expenseAmounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / expenseAmounts.length;
      const stdDev = Math.sqrt(variance);
      const threshold = mean + (2 * stdDev); // 2 desviaciones estándar
      
      return this.transactions.filter(t => 
        t.type === 'expense' && t.amount > threshold
      );
    }

    // Análisis de estacionalidad de gastos
    private analyzeSeasonality(): SeasonalityAnalysis[] {
      if (this.transactions.length === 0) return [];
      const monthlyTotals: Record<number, number[]> = {};

      this.transactions
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
  
    private calculateConfidence(dataPoints: number, projectionIndex: number): number {
      const baseConfidence = 1 / (1 + Math.log10(dataPoints + 1));
      const decay = Math.exp(-0.1 * projectionIndex);
      return Math.round(baseConfidence * decay * 100);
  }

  // FUNCIONES MATEMÁTICAS AUXILIARES
  private getUniqueMonths(): string[] {
    const months = new Set<string>();
    this.transactions.forEach(t => {
      const date = new Date(t.date);
      months.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    });
    return Array.from(months);
  }

  private getMonthlyAggregates() {
    const monthlyMap = new Map<string, { income: number; expenses: number; date: Date }>();
    this.transactions.forEach(t => {
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

  private calculateGrowthRate(values: number[]): number {
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

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    if (mean === 0) return 0;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return stdDev / mean; // Coeficiente de variación
  }

  private predictNextValue(values: number[]): number {
    if (values.length === 0) return 0;
    if (values.length < 2) return values[0];
    const trendRate = this.calculateGrowthRate(values);
    const lastValue = values[values.length - 1];
    
    return lastValue * (1 + trendRate);
  }
}

// Singleton del motor
export const financialEngine = new FinancialEngine();
