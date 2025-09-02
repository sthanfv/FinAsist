

"use client";

import { ModernLayout } from '@/components/layout/modern-layout';
import { FinancialErrorBoundary } from '@/components/error/financial-error-boundary';
import { useAppStore } from '@/store/useAppStore';
import { TransactionLoader } from '@/components/ui/professional-loading';
import { ModernDashboard } from '@/components/dashboard/modern-dashboard';

export default function Dashboard() {
  const isLoading = useAppStore(state => state.isLoading);

  return (
    <ModernLayout>
      <FinancialErrorBoundary>
        {isLoading ? (
           <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
            </div>
            <TransactionLoader />
          </div>
        ) : (
          <ModernDashboard />
        )}
      </FinancialErrorBoundary>
    </ModernLayout>
  );
}
