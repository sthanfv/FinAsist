"use client";
import Layout from '@/components/layout';
import ReportCard from '@/components/reports/ReportCard';
import { useAppContext } from '@/context/AppContext';
import BackButton from '@/components/BackButton';
import { motion } from 'framer-motion';

export default function ReportsPage() {
  const { transactions, loading } = useAppContext();

  if (loading) {
    return <Layout><div className="flex h-full items-center justify-center"><p>Cargando datos...</p></div></Layout>;
  }

  // Agrupar por mes para reporte
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];
  
  const monthlyData = months.map((month, index) => {
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date);
      // getMonth() is 0-indexed, so it matches the index
      return tDate.getMonth() === index && t.type === 'Gasto';
    });
    const amount = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    return { name: month, amount };
  });

  const categoryData = Array.from(transactions.reduce((acc, t) => {
    if (t.type === 'Gasto') {
        const existing = acc.get(t.category) || { name: t.category, amount: 0 };
        existing.amount += t.amount;
        acc.set(t.category, existing);
    }
    return acc;
  }, new Map()).values());

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="container mx-auto py-10">
          <div className="flex items-center gap-4 mb-8">
              <BackButton />
              <h1 className="text-4xl font-bold font-headline">Reportes</h1>
          </div>
          
          <ReportCard title="Gastos Mensuales" data={monthlyData} />
          <ReportCard title="Gastos por Categoría" data={categoryData} />

        </div>
      </motion.div>
    </Layout>
  );
}
