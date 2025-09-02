
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetAdvancedRecommendation = async () => {
    setLoading(true);
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
        setLoading(false);
    }
  };

  if (isGlobal) {
    return (
      <div className='space-y-4'>
        <Button 
          onClick={handleGetAdvancedRecommendation}
          disabled={loading} 
          className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 gap-2 shadow-lg shadow-pink-500/25"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span>Obtener Consejo de IA</span>
        </Button>
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
        {advancedRecommendations.length === 0 && !loading && !error && (
             <motion.div 
                className="text-sm text-muted-foreground p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                "Basándome en tus patrones de gasto, podría sugerirte formas de optimizar tus finanzas."
              </motion.div>
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

  // Fallback for non-global assistant, can be expanded later
  return (
    <div className="space-y-4">
       <Button onClick={handleGetAdvancedRecommendation} disabled={loading} className="w-full">
            {loading ? <Loader2 className="animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
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
        {error && (
             <Alert variant="destructive" className="mt-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
    </div>
  );
}
