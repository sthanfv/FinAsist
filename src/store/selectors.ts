import { useAppStore } from './useAppStore';
import { shallow } from 'zustand/shallow';

// Selectores optimizados para prevenir re-renders innecesarios
export const useBalance = () => useAppStore(state => state.balance);
export const useTransactions = () => useAppStore(state => state.transactions, shallow);
export const useGoals = () => useAppStore(state => state.goals, shallow);
export const useBudgets = () => useAppStore(state => state.budgets, shallow);
export const useBudgetAlerts = () => useAppStore(state => state.budgetAlerts, shallow);
export const useUser = () => useAppStore(state => state.user);
export const useIsLoading = () => useAppStore(state => state.isLoading);
export const useIsDarkMode = () => useAppStore(state => state.isDarkMode);

// Selectores calculados
export const useIncomeTransactions = () => 
  useAppStore(state => state.transactions.filter(t => t.type === 'income'), shallow);

export const useExpenseTransactions = () => 
  useAppStore(state => state.transactions.filter(t => t.type === 'expense'), shallow);

export const useTransactionsByCategory = () => 
  useAppStore(state => {
    const grouped = state.transactions.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(transaction);
      return acc;
    }, {} as Record<string, typeof state.transactions>);
    return grouped;
  }, shallow);

// Métricas calculadas
export const useFinancialMetrics = () => 
  useAppStore(state => {
    const income = state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      netIncome: income - expenses,
      savingsRate,
      transactionCount: state.transactions.length
    };
  }, shallow);
