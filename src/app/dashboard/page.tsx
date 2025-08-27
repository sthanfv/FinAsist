"use client";

import Layout from '@/components/layout';
import { useBalance } from '@/hooks/useBalance';

export default function DashboardPage() {
  const { balance } = useBalance(10000); // saldo inicial de ejemplo

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card shadow-soft p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-card-foreground">Saldo Principal</h2>
          <p className="mt-2 text-3xl font-bold text-primary">{balance.toLocaleString('es-ES')} pts</p>
        </div>
        <div className="bg-card shadow-soft p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-card-foreground">Gasto recomendado</h2>
          <p className="mt-2 text-2xl text-muted-foreground">-</p>
        </div>
        <div className="bg-card shadow-soft p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-card-foreground">Alertas</h2>
          <p className="mt-2 text-2xl text-muted-foreground">No hay alertas</p>
        </div>
      </div>
    </Layout>
  );
}
