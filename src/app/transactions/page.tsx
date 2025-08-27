"use client";
import Layout from '@/components/layout';

export default function TransactionsPage() {
  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold font-headline">Transacciones</h1>
        <p className="mt-4 text-muted-foreground">
          Aquí puedes ver y gestionar tus transacciones.
        </p>
      </div>
    </Layout>
  );
}
