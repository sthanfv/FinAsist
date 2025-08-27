"use client";
import Layout from '@/components/layout';

export default function Home() {
  return (
    <Layout>
      <div className="text-center mt-20">
        <h2 className="text-3xl font-semibold text-primary font-headline">
          Bienvenido a FinAssist
        </h2>
        <p className="mt-4 text-muted-foreground">
          Tu amigo inteligente para manejar gastos y metas financieras.
        </p>
      </div>
    </Layout>
  );
}
