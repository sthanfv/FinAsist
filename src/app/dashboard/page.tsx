'use client';
import { ModernDashboard } from '@/components/dashboard/modern-dashboard';
import { ModernLayout } from '@/components/layout/modern-layout';
import { FinancialErrorBoundary } from '@/components/error/financial-error-boundary';

export default function DashboardPage() {
  return (
    <ModernLayout>
      <FinancialErrorBoundary>
        <ModernDashboard />
      </FinancialErrorBoundary>
    </ModernLayout>
  );
}
