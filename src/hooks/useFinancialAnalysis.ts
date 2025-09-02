'use client';
import { useMemo } from 'react';
import { FinancialEngine } from '@/engine/FinancialEngine';
import { ComputationCache } from '@/engine/cache/ComputationCache';
import { useTransactions, useGoals, useBalance } from '@/store/selectors';

export const useFinancialAnalysis = () => {
  const transactions = useTransactions();
  const goals = useGoals();
  const balance = useBalance();
  
  const analysisData = useMemo(() => {
    if (transactions.length === 0) return null;
    
    // OPTIMIZACIÓN: Intentar obtener del cache primero
    const cachedAnalysis = ComputationCache.getCachedAnalysis(
      transactions, 
      goals, 
      balance
    );
    
    if (cachedAnalysis) {
      console.log('🚀 Using cached financial analysis');
      return cachedAnalysis;
    }
    
    // Si no está en cache, calcular y cachear
    console.log('🔥 Computing new financial analysis');
    const newAnalysis = FinancialEngine.runCompleteAnalysis(
      transactions, 
      goals, 
      balance
    );
    
    // Cachear el resultado
    if (newAnalysis) {
      ComputationCache.setCachedAnalysis(
        transactions, 
        goals, 
        balance, 
        newAnalysis
      );
    }
    
    return newAnalysis;
  }, [transactions, goals, balance]);

  // Estadísticas de cache para debugging
  const cacheStats = useMemo(() => {
    return ComputationCache.getCachedAnalysis(transactions, goals, balance) ? 'HIT' : 'MISS';
  }, [transactions, goals, balance]);

  return { 
    analysis: analysisData, 
    cacheStatus: cacheStats,
    // Función para forzar recálculo
    invalidateCache: () => {
      ComputationCache.invalidateTransactionCache();
      ComputationCache.invalidateGoalCache();
    }
  };
};
