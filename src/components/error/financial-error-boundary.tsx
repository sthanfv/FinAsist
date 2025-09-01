'use client';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

const FinancialErrorFallback = ({ error, resetErrorBoundary }: any) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-card rounded-xl border border-destructive/20">
    <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
    <h2 className="text-xl font-semibold mb-2">Error en el Sistema Financiero</h2>
    <p className="text-muted-foreground text-center mb-4 max-w-md">
      Ocurrió un error al procesar tus datos financieros. Tus datos están seguros.
    </p>
    <Button onClick={resetErrorBoundary} className="gap-2">
      <RefreshCw className="h-4 w-4" />
      Reintentar
    </Button>
    {process.env.NODE_ENV === 'development' && (
      <details className="mt-4 text-xs w-full">
        <summary className="cursor-pointer">Detalles técnicos</summary>
        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
          {error.message}
        </pre>
      </details>
    )}
  </div>
);
export const FinancialErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary
    FallbackComponent={FinancialErrorFallback}
    onError={(error, errorInfo) => {
      console.error('Financial Error:', error, errorInfo);
      // Aquí integrarías Sentry o similar en producción
    }}
  >
    {children}
  </ErrorBoundary>
);
