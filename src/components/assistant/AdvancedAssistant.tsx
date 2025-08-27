'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { getAdvancedRecommendation, AdvancedRecommendationInput } from '@/ai/flows/advancedRecommendationFlow';
import type { Goal } from '@/components/goals/GoalsList';
import type { Transaction } from '@/components/transactions/TransactionTable';

type Props = {
  balance: number;
  transactions: Transaction[];
  goals: Goal[];
};

export default function AdvancedAssistant({ balance, transactions, goals }: Props) {
  const [open, setOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGetRecommendation = async () => {
    setLoading(true);
    setRecommendations([]);
    try {
        const input: AdvancedRecommendationInput = { balance, transactions, goals };
        const result = await getAdvancedRecommendation(input);
        setRecommendations(result.recommendations);
    } catch (error) {
        console.error('Error fetching advanced recommendation:', error);
        setRecommendations(['No se pudo obtener una recomendación avanzada en este momento.']);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
       <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80"
          >
             <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-md">
                        <Wand2 className="text-primary"/>
                        Asistente Avanzado
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && <div className="flex justify-center"><Loader2 className="animate-spin" /></div>}
                    {recommendations.length > 0 && (
                        <ul className="list-disc list-inside text-sm space-y-2">
                           {recommendations.map((rec, index) => <li key={index}>{rec}</li>)}
                        </ul>
                    )}
                    {!loading && recommendations.length === 0 && (
                         <p className="text-sm text-muted-foreground">
                            Haz click en el botón para obtener recomendaciones avanzadas.
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
            if (newOpenState && recommendations.length === 0) {
                handleGetRecommendation();
            }
        }}
        className="rounded-full h-14 w-14 shadow-lg"
        size="icon"
        variant="secondary"
      >
        <Wand2 />
      </Button>
    </div>
  );
}
