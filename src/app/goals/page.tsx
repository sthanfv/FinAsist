"use client";
import Layout from '@/components/layout';

export default function GoalsPage() {
  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold font-headline">Metas Financieras</h1>
        <p className="mt-4 text-muted-foreground">
          Define y sigue el progreso de tus metas financieras.
        </p>
      </div>
    </Layout>
  );
}
