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
