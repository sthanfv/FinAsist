
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { getFinancialRecommendation } from '@/ai/flows/recommendationFlow';
import { getAdvancedRecommendation } from '@/ai/flows/advancedRecommendationFlow';
import type { Goal, Transaction } from '@/store/useAppStore';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import type { RecommendationInput } from '@/ai/schemas';
import type { AdvancedRecommendationInput } from '@/ai/schemas';

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
        const input: RecommendationInput = { balance, transactions: transactions.slice(-10).map(t => ({...t, type: t.type === 'income' ? 'Ingreso' : 'Gasto'})) };
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
          transactions: transactions.slice(-20), 
          goals,
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
        <button 
          onClick={handleGetAdvancedRecommendation}
          disabled={!!loading} 
          className="group relative w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center space-x-2">
            {loading === 'advanced' ? <Loader2 className="animate-spin" /> : (
              <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            )}
            <span>Obtener Consejo Rápido de IA</span>
          </div>
          <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
         {advancedRecommendations.length > 0 && !error && (
            <Alert className="mt-4 bg-accent/10 border-accent/50 text-accent [&>svg]:text-accent">
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Consejo Financiero</AlertTitle>
                <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {advancedRecommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
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
