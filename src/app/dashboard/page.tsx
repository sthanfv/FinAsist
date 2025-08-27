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
import { useAppContext } from '@/context/AppContext';
import UnifiedAssistant from '@/components/assistant/UnifiedAssistant';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';


export default function Dashboard() {
  const { balance, transactions, goals, loading } = useAppContext();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  if (loading) {
    return <Layout><div className="flex h-full items-center justify-center"><p>Cargando datos...</p></div></Layout>;
  }

  const chartData = transactions
    .filter(t => t.type === 'Gasto')
    .map(t => ({ name: t.category, amount: t.amount }));

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold font-headline">Dashboard</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <BalanceCard title="Saldo Principal" amount={balance} />
        <BalanceCard title="Saldo Ahorro" amount={goals.find(g => g.title.toLowerCase().includes('ahorro'))?.savedAmount || 0} color="text-accent" />
        <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-card shadow-soft p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Gastos por categoría</h2>
          <ChartComponent data={chartData} />
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Alertas recientes</h2>
        <AlertCard type="success" message="Has cumplido tu meta de ahorro del mes." />
        <AlertCard type="warning" message="Gasto en ocio supera el 40% de tu balance." />
        <AlertCard type="error" message="Balance restante insuficiente para cubrir próximos gastos." />
      </div>
    </Layout>
  );
}
