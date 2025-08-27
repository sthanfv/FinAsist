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
}
export interface TrendAnalysis {
  incomeGrowthRate: number;
  expenseGrowthRate: number;
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
  runCompleteAnalysis(): {
    metrics: FinancialMetrics;
    trends: TrendAnalysis;
    risk: RiskProfile;
    projections: FinancialProjection[];
  } {
    return {
      metrics: this.calculateFinancialMetrics(),
      trends: this.analyzeTrends(),
      risk: this.assessRiskProfile(),
      projections: this.generateProjections(),
    };
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
    // Cálculo de promedios mensuales
    const monthsWithData = this.getUniqueMonths().length || 1;
    const averageMonthlyIncome = totalIncome / monthsWithData;
    const averageMonthlyExpenses = totalExpenses / monthsWithData;
    // Tasa de ahorro
    const savingsRate = totalIncome > 0 ? ((netFlow / totalIncome) * 100) : 0;
    // Burn rate (cuántos meses puede sobrevivir sin ingresos)
    const burnRate = averageMonthlyExpenses > 0 ? 
      Math.max(0, this.currentBalance / averageMonthlyExpenses) : Infinity;
    return {
      totalIncome,
      totalExpenses,
      netFlow,
      averageMonthlyIncome,
      averageMonthlyExpenses,
      savingsRate,
      burnRate,
    };
  }
  // Análisis de tendencias con matemáticas avanzadas
  private analyzeTrends(): TrendAnalysis {
    const monthlyData = this.getMonthlyAggregates();
    
    if (monthlyData.length < 2) {
      return {
        incomeGrowthRate: 0,
        expenseGrowthRate: 0,
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
      volatilityScore: expenseVolatility * 100,
      consistency,
      predictedNextMonthExpenses,
      predictedNextMonthIncome,
    };
  }
  // Sistema de puntuación de riesgo financiero
  private assessRiskProfile(): RiskProfile {
    const metrics = this.calculateFinancialMetrics();
    let score = 100;
    const recommendations: string[] = [];
    // Factor 1: Tasa de ahorro (40% del score)
    if (metrics.savingsRate < 10) {
      score -= 40;
      recommendations.push('Aumenta tu tasa de ahorro al menos al 10%');
    } else if (metrics.savingsRate < 20) {
      score -= 20;
      recommendations.push('Mejora tu tasa de ahorro al 20% para mayor seguridad');
    }
    // Factor 2: Fondo de emergencia (35% del score)
    const emergencyFundMonths = metrics.burnRate;
    if (emergencyFundMonths < 3) {
      score -= 35;
      recommendations.push('Crítico: Construye un fondo de emergencia de al menos 3 meses');
    } else if (emergencyFundMonths < 6) {
      score -= 15;
      recommendations.push('Amplía tu fondo de emergencia a 6 meses');
    }
    // Factor 3: Consistencia de gastos (25% del score)
    const trends = this.analyzeTrends();
    if (trends.consistency < 50) {
      score -= 25;
      recommendations.push('Tus gastos son muy variables, crear un presupuesto te ayudará');
    } else if (trends.consistency < 75) {
      score -= 10;
      recommendations.push('Mejora la consistencia de tus gastos mensuales');
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
  private generateProjections(): FinancialProjection[] {
    const metrics = this.calculateFinancialMetrics();
    const trends = this.analyzeTrends();
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
        requiredMonthlySavings = remainingAmount / months;
        
        // Probabilidad basada en capacidad actual de ahorro
        const currentMonthlySavingsCapacity = Math.max(0, monthlyNetFlow);
        if (requiredMonthlySavings <= currentMonthlySavingsCapacity) {
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
  // FUNCIONES MATEMÁTICAS AUXILIARES
  private getUniqueMonths(): string[] {
    const months = new Set<string>();
    this.transactions.forEach(t => {
      const date = new Date(t.date);
      months.add(`${date.getFullYear()}-${date.getMonth()}`);
    });
    return Array.from(months);
  }
  private getMonthlyAggregates() {
    const monthlyMap = new Map<string, { income: number; expenses: number }>();
    this.transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, { income: 0, expenses: 0 });
      }
      const data = monthlyMap.get(key)!;
      if (t.type === 'income') {
        data.income += t.amount;
      } else {
        data.expenses += t.amount;
      }
    });
    return Array.from(monthlyMap.values());
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
    
    return avgY > 0 ? (slope / avgY) * 100 : 0; // Porcentaje de crecimiento
  }
  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return mean > 0 ? stdDev / mean : 0; // Coeficiente de variación
  }
  private predictNextValue(values: number[]): number {
    if (values.length < 2) return values[0] || 0;
    const trend = this.calculateGrowthRate(values);
    const lastValue = values[values.length - 1];
    
    return lastValue * (1 + trend / 100);
  }
}
// Singleton del motor
export const financialEngine = new FinancialEngine();
