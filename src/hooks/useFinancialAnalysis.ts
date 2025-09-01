
'use client';
import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { financialEngine } from '@/engine/FinancialEngine';

export const useFinancialAnalysis = () => {
  const { transactions, goals, balance } = useAppStore();
  
  const analysis = useMemo(() => {
    // Update engine data before running analysis
    financialEngine.updateData(transactions, goals, balance);

    return financialEngine.runCompleteAnalysis();

  }, [transactions, goals, balance]);

  return analysis;
};
