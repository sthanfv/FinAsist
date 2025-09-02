
"use client";
import { ModernLayout } from '@/components/layout/modern-layout';
import ReportCard from '@/components/reports/ReportCard';
import BackButton from '@/components/BackButton';
import { motion } from 'framer-motion';
import { useTransactions } from '@/store/selectors';
import { useFinancialAnalysis } from '@/hooks/useFinancialAnalysis';
import { ChartComponent } from '@/components/dashboard/ChartComponent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


export default function ReportsPage() {
  const transactions = useTransactions();
  const analysis = useFinancialAnalysis();

  const monthlyData = Array.from(transactions.reduce((acc, t) => {
    const month = t.date.slice(0, 7); // YYYY-MM
    const existing = acc.get(month) || { name: month, Gasto: 0, Ingreso: 0 };
    if (t.type === 'expense') {
        existing.Gasto += t.amount;
    } else {
        existing.Ingreso += t.amount;
    }
    acc.set(month, existing);
    return acc;
  }, new Map()).values());

  const categoryData = Array.from(transactions.reduce((acc, t) => {
    if (t.type === 'expense') {
        const existing = acc.get(t.category) || { name: t.category, amount: 0 };
        existing.amount += t.amount;
        acc.set(t.category, existing);
    }
    return acc;
  }, new Map()).values());

  return (
    <ModernLayout>
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
          
          <ReportCard title="Gastos Mensuales" data={monthlyData} dataKey='Gasto' xAxisKey='name' type='bar' />
          <ReportCard title="Ingresos Mensuales" data={monthlyData} dataKey='Ingreso' xAxisKey='name' type='bar' />
          <ReportCard title="Gastos por Categoría" data={categoryData} dataKey='amount' xAxisKey='name' type='bar' />

          {analysis?.cashFlowProjection && analysis.cashFlowProjection.length > 0 && (
             <Card className="shadow-soft rounded-xl mb-8">
              <CardHeader>
                <CardTitle>Proyección de Flujo de Caja (Próximos 12 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartComponent 
                  type="line"
                  data={analysis.cashFlowProjection}
                  dataKey="projectedBalance"
                  xAxisKey="month"
                  config={{ projectedBalance: { label: 'Balance', color: 'hsl(var(--accent))'}}}
                />
              </CardContent>
            </Card>
          )}

        </div>
      </motion.div>
    </ModernLayout>
  );
}
