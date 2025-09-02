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
