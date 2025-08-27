"use client";

import Layout from '@/components/layout';
import BalanceCard from '@/components/dashboard/BalanceCard';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { ChartComponent } from '@/components/dashboard/ChartComponent';
import { useBalance } from '@/hooks/useBalance';
import { useState } from 'react';

export default function Dashboard() {
  const { balance } = useBalance(10000);
  const [transactions] = useState([
    { name: 'Universidad', amount: 4000 },
    { name: 'Ocio', amount: 1500 },
    { name: 'Transporte', amount: 1200 },
    { name: 'Ahorro', amount: 2000 },
  ]);

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <BalanceCard title="Saldo Principal" amount={balance} />
        <BalanceCard title="Saldo Ahorro" amount={2000} color="text-accent" />
        <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-card shadow-soft p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Gastos por categoría</h2>
          <ChartComponent data={transactions} />
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
