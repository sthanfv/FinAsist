"use client";

import Layout from '@/components/layout';
import BalanceCard from '@/components/dashboard/BalanceCard';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { ChartComponent } from '@/components/dashboard/ChartComponent';
import { useAppContext } from '@/context/AppContext';
import FinancialAssistant from '@/components/assistant/FinancialAssistant';

export default function Dashboard() {
  const { balance, transactions, loading } = useAppContext();

  if (loading) {
    return <Layout><div className="flex h-full items-center justify-center"><p>Cargando datos...</p></div></Layout>;
  }

  const chartData = transactions
    .filter(t => t.type === 'Gasto')
    .map(t => ({ name: t.category, amount: t.amount }));

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <BalanceCard title="Saldo Principal" amount={balance} />
        <BalanceCard title="Saldo Ahorro" amount={2000} color="text-accent" />
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

      <FinancialAssistant balance={balance} transactions={transactions} />
    </Layout>
  );
}
