
'use client';
import { useState, useCallback } from 'react';
import { categorizeTransaction } from '@/ai/flows/categorizationFlow';
import { useTransactions } from '@/store/selectors';
import type { CategorizationInput, CategorizationOutput } from '@/ai/schemas';

export const useSmartCategorization = () => {
  const [isLoading, setIsLoading] = useState(false);
  const transactions = useTransactions();

  const suggestCategory = useCallback(async (description: string, amount: number): Promise<CategorizationOutput> => {
    if (!description || amount <= 0) {
      return { category: 'Otros', confidence: 0, reason: 'Datos insuficientes' };
    }

    setIsLoading(true);
    try {
      const userHistory = transactions
        .slice(-20)
        .map(t => ({
          description: t.description || '',
          category: t.category
        }));

      const input: CategorizationInput = {
        description,
        amount,
        userHistory
      };
      
      const result = await categorizeTransaction(input);
      return result;
    } catch (error) {
      console.error('Error sugiriendo categoría:', error);
      return {
        category: 'Otros',
        confidence: 0,
        reason: 'Error en el sistema de sugerencias'
      };
    } finally {
      setIsLoading(false);
    }
  }, [transactions]);

  return {
    suggestCategory,
    isLoading
  };
};
