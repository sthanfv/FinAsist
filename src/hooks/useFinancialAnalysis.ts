
'use client';
import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { financialEngine } from '@/engine/FinancialEngine';
import { useTransactions, useGoals, useBalance } from '@/store/selectors';

export const useFinancialAnalysis = () => {
  const transactions = useTransactions();
  const goals = useGoals();
  const balance = useBalance();
  
  const analysis = useMemo(() => {
    // Update engine data before running analysis
    financialEngine.updateData(transactions, goals, balance);

    return financialEngine.runCompleteAnalysis();

  }, [transactions, goals, balance]);

  return analysis;
};
