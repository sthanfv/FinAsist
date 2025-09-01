
'use client';
import { useMemo } from 'react';
import { useTransactions, useGoals, useBalance } from '@/store/selectors';
import { FinancialEngine } from '@/engine/FinancialEngine';

export const useFinancialOptimization = (targetSavingsRate: number = 0.2) => {
  const transactions = useTransactions();
  const goals = useGoals();
  const balance = useBalance();
  
  const optimization = useMemo(() => {
    if (!transactions.length) return null;
    
    return FinancialEngine.generateOptimizationPlan(
      transactions, 
      goals, 
      balance,
      targetSavingsRate
    );
  }, [transactions, goals, balance, targetSavingsRate]);

  const categoryEfficiency = useMemo(() => {
    if (!transactions.length) return [];
    return FinancialEngine.analyzeCategoryEfficiency(transactions)
  }, [transactions]);

  const spendingPrediction = useMemo(() => {
    if (!transactions.length) return null;
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return FinancialEngine.predictMonthlySpending(
      transactions, 
      nextMonth.toISOString().slice(0, 7)
    );
  }, [transactions]);

  const correlations = useMemo(() => {
    if (!transactions.length) return [];
    return FinancialEngine.analyzeCategoryCorrelations(transactions)
  }, [transactions]);

  return {
    optimization,
    categoryEfficiency,
    spendingPrediction,
    correlations,
  };
};
