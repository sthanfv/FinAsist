"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Layout from '@/components/layout';
import BalanceCard from '@/components/dashboard/BalanceCard';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { ChartComponent } from '@/components/dashboard/ChartComponent';
import UnifiedAssistant from '@/components/assistant/UnifiedAssistant';
import { Button } from '@/components/ui/button';
import { Sparkles, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';

export default function Dashboard() {
  const { balance, transactions, goals } = useAppStore();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const chartData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
        const existing = acc.find(item => item.name === t.category);
        if (existing) {
            existing.amount += t.amount;
        } else {
            acc.push({ name: t.category, amount: t.amount });
        }
        return acc;
    }, [] as { name: string; amount: number }[]);

  const totalGoalsAmount = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-4xl font-bold font-headline">Dashboard</h1>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/transactions">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Transacción
              </Link>
            </Button>
            <Dialog open={isAssistantOpen} onOpenChange={setIsAssistantOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Asistente IA
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary"/>
                    Asistente IA
                  </DialogTitle>
                  <DialogDescription>
                    Obtén recomendaciones simples o avanzadas basadas en tus datos.
                  </DialogDescription>
                </DialogHeader>
                <UnifiedAssistant 
                  balance={balance} 
                  transactions={transactions} 
                  goals={goals} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="mb-6">
          <UnifiedAssistant 
            balance={balance} 
            transactions={transactions} 
            goals={goals}
            isGlobal
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <BalanceCard title="Saldo Principal" amount={balance} />
          <BalanceCard title="Total Ahorrado" amount={totalGoalsAmount} color="text-accent" />
          <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-card shadow-soft p-6 rounded-xl">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">Gastos por categoría</h2>
            <ChartComponent data={chartData} />
          </div>
        </div>

      </motion.div>
    </Layout>
  );
}
