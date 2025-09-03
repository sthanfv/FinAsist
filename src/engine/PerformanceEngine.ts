
import { Transaction, Goal } from '@/store/useAppStore';
import { ComputationCache } from './cache/ComputationCache';
import { MathUtils } from './utils/MathUtils';
import { workerManager } from './workers/WorkerManager';
import { globalCache } from './cache/MemoryCache';

// NUEVO: Cache inteligente con TTL
interface CacheConfig {
  ttl: number;
  maxSize: number;
  compressionThreshold: number;
}
const CACHE_CONFIG: CacheConfig = {
  ttl: 300000, // 5 minutos
  maxSize: 50, // máximo 50 análisis cacheados
  compressionThreshold: 1000 // comprimir si >1000 transacciones
};
interface PerformanceMetrics {
  calculationTime: number;
  cacheHitRate: number;
  workerUsage: boolean;
  dataSize: number;
}
export class PerformanceEngine {
  private static performanceMetrics: PerformanceMetrics[] = [];
  
  // Análisis financiero optimizado con Workers
  static async runOptimizedAnalysis(
    transactions: Transaction[],
    goals: Goal[],
    balance: number
  ): Promise<any> {
    const startTime = performance.now();
    
    try {
      // Verificar cache primero
      const cachedResult = ComputationCache.getCachedAnalysis(transactions, goals, balance);
      
      if (cachedResult) {
        this.recordMetrics({
          calculationTime: performance.now() - startTime,
          cacheHitRate: 100,
          workerUsage: false,
          dataSize: transactions.length
        });
        
        return {
          ...cachedResult,
          fromCache: true,
          calculationTime: performance.now() - startTime
        };
      }
      // Decidir si usar Worker o main thread
      const shouldUseWorker = this.shouldUseWorker(transactions.length);
      
      let result;
      
      if (shouldUseWorker && workerManager.isWorkerAvailable()) {
        console.log('🔧 Using Worker for complex analysis');
        
        // Ejecutar análisis en Worker
        result = await workerManager.performComplexAnalysis({
          transactions,
          goals,
          balance
        });
        
        result.usedWorker = true;
      } else {
        console.log('🔄 Using main thread for analysis');
        
        // Fallback a main thread
        result = await this.performMainThreadAnalysis(transactions, goals, balance);
        result.usedWorker = false;
      }
      // Cachear resultado
      ComputationCache.setCachedAnalysis(transactions, goals, balance, result);
      
      const calculationTime = performance.now() - startTime;
      
      this.recordMetrics({
        calculationTime,
        cacheHitRate: 0,
        workerUsage: shouldUseWorker,
        dataSize: transactions.length
      });
      return {
        ...result,
        fromCache: false,
        calculationTime
      };
      
    } catch (error) {
      console.error('🚨 Performance Engine error:', error);
      
      // Fallback a análisis básico
      return this.performBasicAnalysis(transactions, goals, balance);
    }
  }
  // Análisis de tendencias optimizado
  static async runTrendAnalysis(transactions: Transaction[]): Promise<any> {
    if (transactions.length < 10) {
      return this.performBasicTrendAnalysis(transactions);
    }
    try {
      if (workerManager.isWorkerAvailable()) {
        return await workerManager.performTrendAnalysis({ transactions });
      } else {
        return this.performBasicTrendAnalysis(transactions);
      }
    } catch (error) {
      console.error('🚨 Trend analysis error:', error);
      return this.performBasicTrendAnalysis(transactions);
    }
  }
  // Cálculo de métricas de riesgo
  static async calculateRiskMetrics(
    transactions: Transaction[], 
    balance: number
  ): Promise<any> {
    const cacheKey = `risk:${transactions.length}:${balance}`;
    const cached = globalCache.get(cacheKey);
    
    if (cached) {
      return cached;
    }
    try {
      let result;
      
      if (workerManager.isWorkerAvailable() && transactions.length > 50) {
        result = await workerManager.calculateRiskMetrics({ transactions, balance });
      } else {
        result = this.performBasicRiskCalculation(transactions, balance);
      }
      
      globalCache.set(cacheKey, result, 600000); // 10 minutos
      return result;
      
    } catch (error) {
      console.error('🚨 Risk calculation error:', error);
      return this.performBasicRiskCalculation(transactions, balance);
    }
  }
  // Proyecciones financieras
  static async generateProjections(
    transactions: Transaction[], 
    goals: Goal[]
  ): Promise<any> {
    try {
      if (workerManager.isWorkerAvailable() && transactions.length > 20) {
        return await workerManager.performProjectionAnalysis({ transactions, goals });
      } else {
        return this.performBasicProjections(transactions, goals);
      }
    } catch (error) {
      console.error('🚨 Projection error:', error);
      return this.performBasicProjections(transactions, goals);
    }
  }
  // Batch processing para múltiples operaciones
  static async performBatchAnalysis(
    operations: Array<{
      type: 'analysis' | 'trend' | 'risk' | 'projection';
      data: any;
    }>
  ): Promise<any[]> {
    const results = await Promise.allSettled(
      operations.map(async (op) => {
        switch (op.type) {
          case 'analysis':
            return this.runOptimizedAnalysis(
              op.data.transactions, 
              op.data.goals, 
              op.data.balance
            );
          case 'trend':
            return this.runTrendAnalysis(op.data.transactions);
          case 'risk':
            return this.calculateRiskMetrics(op.data.transactions, op.data.balance);
          case 'projection':
            return this.generateProjections(op.data.transactions, op.data.goals);
          default:
            throw new Error(`Unknown operation type: ${op.type}`);
        }
      })
    );
    return results.map((result, index) => ({
      operation: operations[index].type,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null
    }));
  }
  // Decidir si usar Worker basado en la carga de trabajo
  private static shouldUseWorker(transactionCount: number): boolean {
    // Nuevo algoritmo más inteligente
    const workerStats = workerManager.getStats();
    const memoryPressure = this.getMemoryPressure();
    const cpuLoad = this.getCPULoad();
    
    // Factores de decisión mejorados
    const factors = {
      dataSize: transactionCount > 50 ? 30 : 0,
      workerAvailability: workerStats.pendingCalculations < 3 ? 25 : 0,
      memoryPressure: memoryPressure < 0.8 ? 25 : 0,
      cpuLoad: cpuLoad < 0.7 ? 20 : 0
    };
    
    const score = Object.values(factors).reduce((sum, val) => sum + val, 0);
    return score >= 60; // 60% threshold
  }
  // NUEVAS funciones de soporte
  private static getMemoryPressure(): number {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    }
    return 0.5; // fallback conservador
  }
  private static getCPULoad(): number {
    const recentMetrics = this.performanceMetrics.slice(-10);
    if (recentMetrics.length === 0) return 0.5;
    
    const avgTime = recentMetrics.reduce((sum, m) => sum + m.calculationTime, 0) / recentMetrics.length;
    return Math.min(avgTime / 200, 1); // normalizar a 0-1
  }

  // Fallback para main thread
  private static async performMainThreadAnalysis(
    transactions: Transaction[],
    goals: Goal[],
    balance: number
  ): Promise<any> {
    // Usar requestIdleCallback para no bloquear UI
    return new Promise((resolve) => {
      const callback = () => {
        const analysis = {
          balance,
          totalIncome: transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0),
          totalExpenses: transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0),
          transactionCount: transactions.length,
          goalProgress: goals.map(g => ({
            id: g.id,
            progress: g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0
          })),
          usedWorker: false
        };
        
        resolve(analysis);
      };
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(callback);
      } else {
        setTimeout(callback, 0);
      }
    });
  }
  private static performBasicAnalysis(
    transactions: Transaction[],
    goals: Goal[],
    balance: number
  ): any {
    return {
      balance,
      totalIncome: transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      goalCount: goals.length,
      error: 'Fallback analysis used',
      usedWorker: false
    };
  }
  private static performBasicTrendAnalysis(transactions: Transaction[]): any {
    const monthlyAmounts = this.getMonthlyAmounts(transactions);
    const trend = MathUtils.linearRegression(monthlyAmounts);
    
    return {
      trend: trend.slope > 0.1 ? 'increasing' : trend.slope < -0.1 ? 'decreasing' : 'stable',
      confidence: Math.min(trend.r2, 0.8),
      dataPoints: monthlyAmounts.length
    };
  }
  private static performBasicRiskCalculation(
    transactions: Transaction[], 
    balance: number
  ): any {
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .map(t => t.amount);
    
    const avgExpense = expenses.reduce((sum, val) => sum + val, 0) / Math.max(1, expenses.length);
    const volatility = MathUtils.standardDeviation(expenses);
    
    return {
      riskScore: balance < avgExpense * 3 ? 70 : 30,
      volatility: volatility,
      emergencyFund: balance / avgExpense
    };
  }
  private static performBasicProjections(
    transactions: Transaction[], 
    goals: Goal[]
  ): any {
    const avgIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) / Math.max(1, transactions.length);
    
    const avgExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) / Math.max(1, transactions.length);
    
    const monthlySavings = Math.max(0, avgIncome - avgExpense);
    
    return {
      monthlySavings,
      goalProjections: goals.map(g => ({
        goalId: g.id,
        monthsToComplete: monthlySavings > 0 
          ? Math.ceil((g.targetAmount - g.currentAmount) / monthlySavings)
          : Infinity
      }))
    };
  }
  private static getMonthlyAmounts(transactions: Transaction[]): number[] {
    const monthly = new Map<string, number>();
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      monthly.set(monthKey, (monthly.get(monthKey) || 0) + t.amount);
    });
    
    return Array.from(monthly.values());
  }
  private static recordMetrics(metrics: PerformanceMetrics): void {
    this.performanceMetrics.push(metrics);
    
    // Mantener solo las últimas 100 métricas
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics = this.performanceMetrics.slice(-100);
    }
  }
  // Obtener estadísticas de rendimiento
  static getPerformanceStats(): any {
    if (this.performanceMetrics.length === 0) {
      return { noData: true };
    }
    const avgCalcTime = this.performanceMetrics
      .reduce((sum, m) => sum + m.calculationTime, 0) / this.performanceMetrics.length;
    
    const avgCacheHit = this.performanceMetrics
      .reduce((sum, m) => sum + m.cacheHitRate, 0) / this.performanceMetrics.length;
    
    const workerUsageRate = (this.performanceMetrics
      .filter(m => m.workerUsage).length / this.performanceMetrics.length) * 100;
    return {
      averageCalculationTime: Math.round(avgCalcTime * 100) / 100,
      averageCacheHitRate: Math.round(avgCacheHit * 100) / 100,
      workerUsageRate: Math.round(workerUsageRate * 100) / 100,
      totalCalculations: this.performanceMetrics.length,
      cacheStats: globalCache.getStats(),
      workerStats: workerManager.getStats()
    };
  }
  // Limpiar cache y reiniciar métricas
  static cleanup(): void {
    globalCache.clear();
    ComputationCache.cleanupOldCache();
    this.performanceMetrics = [];
    console.log('🧹 Performance Engine cleaned up');
  }
}
    
    