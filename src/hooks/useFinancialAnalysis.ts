
'use client';
import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { FinancialEngine } from '@/engine/FinancialEngine';
import { useTransactions, useGoals, useBalance } from '@/store/selectors';

export const useFinancialAnalysis = () => {
  const transactions = useTransactions();
  const goals = useGoals();
  const balance = useBalance();
  
  const analysis = useMemo(() => {
    // Llama al método estático directamente, pasando los datos
    if (transactions.length === 0) return null;
    return FinancialEngine.runCompleteAnalysis(transactions, goals, balance);
  }, [transactions, goals, balance]);

  return analysis;
};
