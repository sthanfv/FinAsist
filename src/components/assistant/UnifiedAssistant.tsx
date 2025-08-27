'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { getFinancialRecommendation, RecommendationInput } from '@/ai/flows/recommendationFlow';
import { getAdvancedRecommendation, AdvancedRecommendationInput } from '@/ai/flows/advancedRecommendationFlow';
import type { Goal, Transaction } from '@/store/useAppStore';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type Props = {
  balance: number;
  transactions: Transaction[];
  goals: Goal[];
  isGlobal?: boolean;
};

export default function UnifiedAssistant({ balance, transactions, goals, isGlobal = false }: Props) {
  const [recommendation, setRecommendation] = useState('');
  const [advancedRecommendations, setAdvancedRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(''); // 'simple' | 'advanced' | ''
  const [error, setError] = useState('');

  const handleGetSimpleRecommendation = async () => {
    setLoading('simple');
    setRecommendation('');
    setError('');
    try {
        const input: RecommendationInput = { balance, transactions: transactions.slice(-10) }; // Solo últimas 10
        const result = await getFinancialRecommendation(input);
        setRecommendation(result.recommendation);
    } catch (err) {
        console.error('Error fetching recommendation:', err);
        setError('No se pudo obtener una recomendación en este momento.');
    } finally {
        setLoading('');
    }
  };

  const handleGetAdvancedRecommendation = async () => {
    setLoading('advanced');
    setAdvancedRecommendations([]);
    setError('');
    try {
        const input: AdvancedRecommendationInput = { 
          balance, 
          transactions: transactions.slice(-20).map(t => ({...t, type: t.type === 'income' ? 'Ingreso' : 'Gasto'})), 
          goals: goals.map(g => ({
            id: g.id,
            title: g.name,
            targetAmount: g.targetAmount,
            savedAmount: g.currentAmount,
            deadline: g.deadline,
          }))
        };
        const result = await getAdvancedRecommendation(input);
        setAdvancedRecommendations(result.recommendations);
    } catch (err) {
        console.error('Error fetching advanced recommendation:', err);
        setError('No se pudo obtener una recomendación avanzada.');
    } finally {
        setLoading('');
    }
  };

  if (isGlobal) {
    return (
      <div className='mb-6'>
        <Button onClick={handleGetSimpleRecommendation} disabled={!!loading} className="w-full">
            {loading === 'simple' ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Obtener Consejo Rápido de IA
        </Button>
         {recommendation && !error && (
            <Alert className="mt-4 bg-accent/10 border-accent/50 text-accent [&>svg]:text-accent">
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Consejo Financiero</AlertTitle>
                <AlertDescription>
                    {recommendation}
                </AlertDescription>
            </Alert>
        )}
        {error && (
             <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
      </div>
    )
  }

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
        {error && (
             <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
    </div>
  );
}
