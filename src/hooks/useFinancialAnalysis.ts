
'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { PerformanceEngine } from '@/engine/PerformanceEngine';
import { ComputationCache } from '@/engine/cache/ComputationCache';
import { useTransactions, useGoals, useBalance } from '@/store/selectors';
interface AnalysisState {
  analysis: any;
  trendAnalysis: any;
  riskMetrics: any;
  projections: any;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  performance: {
    calculationTime: number;
    cacheHitRate: number;
    workerUsage: boolean;
  };
}
interface UseFinancialAnalysisResult extends AnalysisState {
  refresh: () => Promise<void>;
  forceRecalculate: () => Promise<void>;
  getAnalysisScore: () => number;
  invalidateCache: () => void;
}
export const useFinancialAnalysis = (): UseFinancialAnalysisResult => {
  const transactions = useTransactions();
  const goals = useGoals();
  const balance = useBalance();
  
  const [state, setState] = useState<AnalysisState>({
    analysis: null,
    trendAnalysis: null,
    riskMetrics: null,
    projections: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
    performance: {
      calculationTime: 0,
      cacheHitRate: 0,
      workerUsage: false
    }
  });
  const isCalculatingRef = useRef(false);
  const lastDataHashRef = useRef<string>('');
  // Generar hash único de los datos para detectar cambios
  const dataHash = useMemo(() => {
    return `${transactions.length}-${balance}-${goals.length}-${JSON.stringify(goals.map(g => g.currentAmount))}`;
  }, [transactions, goals, balance]);
  // Función principal de análisis optimizada
  const performAnalysis = useCallback(async (forceRecalculate = false) => {
    // Evitar cálculos duplicados simultáneos
    if (isCalculatingRef.current) {
      console.log('🔄 Analysis already in progress, skipping...');
      return;
    }
    // Si los datos no han cambiado y no es forzado, no recalcular
    if (!forceRecalculate && dataHash === lastDataHashRef.current && state.analysis) {
      console.log('📊 Data unchanged, using existing analysis');
      return;
    }
    isCalculatingRef.current = true;
    
    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }));
    try {
      console.log('🚀 Starting optimized financial analysis...');
      const startTime = performance.now();
      // Si no hay datos suficientes, análisis básico
      if (transactions.length === 0) {
        setState(prev => ({
          ...prev,
          analysis: { balance, message: 'No transactions yet' },
          trendAnalysis: null,
          riskMetrics: null,
          projections: null,
          isLoading: false,
          lastUpdated: new Date(),
          performance: {
            calculationTime: performance.now() - startTime,
            cacheHitRate: 0,
            workerUsage: false
          }
        }));
        return;
      }
      // Realizar análisis en batch para máxima eficiencia
      const batchOperations = [
        { type: 'analysis' as const, data: { transactions, goals, balance } },
        { type: 'trend' as const, data: { transactions } },
        { type: 'risk' as const, data: { transactions, balance } },
        { type: 'projection' as const, data: { transactions, goals } }
      ];
      console.log('⚡ Running batch analysis with Performance Engine...');
      const results = await PerformanceEngine.performBatchAnalysis(batchOperations);
      const calculationTime = performance.now() - startTime;
      // Procesar resultados
      const [analysisResult, trendResult, riskResult, projectionResult] = results;
      setState(prev => ({
        ...prev,
        analysis: analysisResult.success ? analysisResult.data : null,
        trendAnalysis: trendResult.success ? trendResult.data : null,
        riskMetrics: riskResult.success ? riskResult.data : null,
        projections: projectionResult.success ? projectionResult.data : null,
        isLoading: false,
        lastUpdated: new Date(),
        error: results.some(r => !r.success) 
          ? 'Some calculations failed, partial results shown'
          : null,
        performance: {
          calculationTime,
          cacheHitRate: analysisResult.data?.fromCache ? 100 : 0,
          workerUsage: analysisResult.data?.usedWorker || false
        }
      }));
      lastDataHashRef.current = dataHash;
      
      console.log(`✅ Analysis completed in ${calculationTime.toFixed(2)}ms`);
      console.log(`💾 Cache: ${analysisResult.data?.fromCache ? 'HIT' : 'MISS'}`);
      console.log(`🔧 Worker: ${analysisResult.data?.usedWorker ? 'USED' : 'MAIN THREAD'}`);
    } catch (error) {
      console.error('🚨 Financial analysis error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      }));
    } finally {
      isCalculatingRef.current = false;
    }
  }, [transactions, goals, balance, dataHash, state.analysis]);
  // Auto-análisis cuando cambian los datos (con debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performAnalysis();
    }, 500); // Debounce de 500ms
    return () => clearTimeout(timeoutId);
  }, [performAnalysis]);
  // Limpiar cache automáticamente cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      ComputationCache.cleanupOldCache();
    }, 300000); // 5 minutos
    return () => clearInterval(interval);
  }, []);
  // Funciones utilitarias
  const refresh = useCallback(() => performAnalysis(false), [performAnalysis]);
  const forceRecalculate = useCallback(() => performAnalysis(true), [performAnalysis]);
  const getAnalysisScore = useCallback((): number => {
    if (!state.analysis || !state.riskMetrics) return 0;
    
    // Score basado en balance, savings rate y risk score
    const balanceScore = Math.min(30, Math.max(0, state.analysis.balance / 1000));
    const savingsScore = Math.min(30, Math.max(0, state.analysis.savingsRate || 0));
    const riskScore = Math.min(40, Math.max(0, 100 - (state.riskMetrics.riskScore || 100)));
    
    return Math.round(balanceScore + savingsScore + riskScore);
  }, [state.analysis, state.riskMetrics]);
  const invalidateCache = useCallback(() => {
    ComputationCache.invalidateTransactionCache();
    ComputationCache.invalidateGoalCache();
    lastDataHashRef.current = '';
    console.log('🗑️ Analysis cache invalidated');
  }, []);
  return {
    ...state,
    refresh,
    forceRecalculate,
    getAnalysisScore,
    invalidateCache
  };
};
