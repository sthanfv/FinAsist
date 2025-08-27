import Layout from '@/components/layout';

export default function TransactionsPage() {
  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold font-headline">Transactions</h1>
        <p className="mt-4 text-muted-foreground">
          Here you can see and manage your transactions.
        </p>
      </div>
    </Layout>
  );
}
