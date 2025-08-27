'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { getFinancialRecommendation, RecommendationInput } from '@/ai/flows/recommendationFlow';
import { getAdvancedRecommendation, AdvancedRecommendationInput } from '@/ai/flows/advancedRecommendationFlow';
import type { Goal } from '@/components/goals/GoalsList';
import type { Transaction } from '@/components/transactions/TransactionTable';

type Props = {
  balance: number;
  transactions: Transaction[];
  goals: Goal[];
};

export default function UnifiedAssistant({ balance, transactions, goals }: Props) {
  const [recommendation, setRecommendation] = useState('');
  const [advancedRecommendations, setAdvancedRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(''); // 'simple' | 'advanced' | ''

  const handleGetSimpleRecommendation = async () => {
    setLoading('simple');
    setRecommendation('');
    try {
        const input: RecommendationInput = { balance, transactions };
        const result = await getFinancialRecommendation(input);
        setRecommendation(result.recommendation);
    } catch (error) {
        console.error('Error fetching recommendation:', error);
        setRecommendation('No se pudo obtener una recomendación en este momento.');
    } finally {
        setLoading('');
    }
  };

  const handleGetAdvancedRecommendation = async () => {
    setLoading('advanced');
    setAdvancedRecommendations([]);
    try {
        const input: AdvancedRecommendationInput = { balance, transactions, goals };
        const result = await getAdvancedRecommendation(input);
        setAdvancedRecommendations(result.recommendations);
    } catch (error) {
        console.error('Error fetching advanced recommendation:', error);
        setAdvancedRecommendations(['No se pudo obtener una recomendación avanzada.']);
    } finally {
        setLoading('');
    }
  };

  return (
    <div className="space-y-4">
        <div>
            <Button onClick={handleGetSimpleRecommendation} disabled={loading === 'simple'} className="w-full">
                {loading === 'simple' ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Obtener Consejo Rápido
            </Button>
            {recommendation && (
                <Card className="mt-2">
                    <CardContent className="p-4 text-sm">
                        {recommendation}
                    </CardContent>
                </Card>
            )}
        </div>
        <div>
            <Button onClick={handleGetAdvancedRecommendation} disabled={loading === 'advanced'} className="w-full" variant="secondary">
                 {loading === 'advanced' ? <Loader2 className="animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Análisis Avanzado
            </Button>
            {advancedRecommendations.length > 0 && (
                 <Card className="mt-2">
                    <CardContent className="p-4 text-sm">
                        <ul className="list-disc list-inside space-y-2">
                            {advancedRecommendations.map((rec, index) => <li key={index}>{rec}</li>)}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  );
}
