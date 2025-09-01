import { useAppStore } from './useAppStore';
import { shallow } from 'zustand/shallow';

// USAR ESTOS SELECTORES EN LUGAR DE ACCESO DIRECTO
export const useTransactions = () => 
  useAppStore(state => state.transactions, shallow);

export const useBalance = () => 
  useAppStore(state => state.transactions.reduce((sum, t) => 
    sum + (t.type === 'income' ? t.amount : -t.amount), 0
  ));

export const useGoals = () => 
  useAppStore(state => state.goals, shallow);

export const useFinancialSummary = () => 
  useAppStore(state => ({
    balance: state.balance,
    transactionCount: state.transactions.length,
    goalCount: state.goals.length
  }), shallow);
