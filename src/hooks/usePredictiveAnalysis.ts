'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { PredictiveEngine } from '@/engine/predictive/PredictiveEngine';
import { RecommendationEngine } from '@/engine/predictive/RecommendationEngine';
import { useTransactions, useGoals, useBalance, useBudgets } from '@/store/selectors';
interface PredictiveAnalysisState {
  cashFlowPrediction: any[];
  stabilityScore: any;
  recommendations: any[];
  anomalies: any[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
export const usePredictiveAnalysis = () => {
  const transactions = useTransactions();
  const goals = useGoals();
  const balance = useBalance();
  const budgets = useBudgets();
  
  const [state, setState] = useState<PredictiveAnalysisState>({
    cashFlowPrediction: [],
    stabilityScore: null,
    recommendations: [],
    anomalies: [],
    isLoading: false,
    error: null,
    lastUpdated: null
  });
  const performPredictiveAnalysis = useCallback(async () => {
    if (transactions.length === 0) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('🔮 Starting predictive analysis...');
      
      // Ejecutar análisis en paralelo
      const [
        cashFlowPrediction,
        stabilityScore,
        recommendations,
        anomalies
      ] = await Promise.all([
        PredictiveEngine.predictCashFlow(transactions, balance, 6),
        PredictiveEngine.calculateFinancialStabilityScore(transactions, goals, balance),
        RecommendationEngine.generateRecommendations(transactions, goals, budgets, balance),
        Promise.resolve(PredictiveEngine.detectSpendingAnomalies(transactions))
      ]);
      setState(prev => ({
        ...prev,
        cashFlowPrediction,
        stabilityScore,
        recommendations,
        anomalies,
        isLoading: false,
        lastUpdated: new Date()
      }));
      
      console.log('✅ Predictive analysis completed');
      
    } catch (error) {
      console.error('🚨 Predictive analysis error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      }));
    }
  }, [transactions, goals, balance, budgets]);
  // Auto-análisis cuando cambian los datos
  useEffect(() => {
    const timeoutId = setTimeout(performPredictiveAnalysis, 1000);
    return () => clearTimeout(timeoutId);
  }, [performPredictiveAnalysis]);
  const refresh = useCallback(() => {
    performPredictiveAnalysis();
  }, [performPredictiveAnalysis]);
  return {
    ...state,
    refresh
  };
};