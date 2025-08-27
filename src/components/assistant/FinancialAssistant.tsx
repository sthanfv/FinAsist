'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { getFinancialRecommendation, RecommendationInput } from '@/ai/flows/recommendationFlow';

type Props = {
  balance: number;
  transactions: { category: string; amount: number; type: 'Ingreso' | 'Gasto' }[];
};

export default function FinancialAssistant({ balance, transactions }: Props) {
  const [open, setOpen] = useState(false);
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGetRecommendation = async () => {
    setLoading(true);
    setRecommendation('');
    try {
        const input: RecommendationInput = { balance, transactions };
        const result = await getFinancialRecommendation(input);
        setRecommendation(result.recommendation);
    } catch (error) {
        console.error('Error fetching recommendation:', error);
        setRecommendation('No se pudo obtener una recomendación en este momento.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
       <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-72"
          >
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-md">
                        <Sparkles className="text-primary"/>
                        Asistente Financiero
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && <Loader2 className="animate-spin" />}
                    {recommendation && <p className="text-sm">{recommendation}</p>}
                    {!loading && !recommendation && (
                         <p className="text-sm text-muted-foreground">
                            Haz click en el botón para obtener una recomendación.
                        </p>
                    )}
                </CardContent>
             </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        onClick={() => {
            const newOpenState = !open;
            setOpen(newOpenState);
            if (newOpenState && !recommendation) {
                handleGetRecommendation();
            }
        }}
        className="rounded-full h-14 w-14 shadow-lg"
        size="icon"
      >
        <Sparkles />
      </Button>
    </div>
  );
}
