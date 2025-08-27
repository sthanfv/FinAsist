import Layout from '@/components/layout';

export default function DashboardPage() {
  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold font-headline">Dashboard</h1>
        <p className="mt-4 text-muted-foreground">
          Welcome to your financial dashboard.
        </p>
      </div>
    </Layout>
  );
}
