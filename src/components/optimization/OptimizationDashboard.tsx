
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Zap, AlertCircle } from 'lucide-react';
import { useFinancialOptimization } from '@/hooks/useFinancialOptimization';
import { Skeleton } from '../ui/skeleton';

const OptimizationLoader = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
        <Card><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
        <Card><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
      </div>
      <Card>
        <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    </div>
  );

export const OptimizationDashboard = () => {
  const { optimization } = useFinancialOptimization();
  
  if (!optimization) return <OptimizationLoader />;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };
  
  return (
    <div className="space-y-6">
      {/* Header con métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tasa Actual</p>
                <p className="text-2xl font-bold">
                  {(optimization.currentSavingsRate * 100).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potencial</p>
                <p className="text-2xl font-bold text-green-600">
                  {(optimization.potentialSavingsRate * 100).toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mejora</p>
                <p className="text-2xl font-bold text-purple-600">
                  +{((optimization.potentialSavingsRate - optimization.currentSavingsRate) * 100).toFixed(1)}%
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Lista de optimizaciones prioritarias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Acciones Prioritarias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimization.priorityActions.slice(0, 3).map((action, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={action.difficulty === 'EASY' ? 'default' : 
                                  action.difficulty === 'MEDIUM' ? 'secondary' : 'destructive'}>
                      {action.difficulty}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {action.timeline}
                    </span>
                  </div>
                  <h4 className="font-medium">{action.category}</h4>
                  <p className="text-sm text-muted-foreground">
                    Reducir de {formatCurrency(action.currentAmount)} a {formatCurrency(action.targetAmount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    +{formatCurrency(action.potentialSaving)}
                  </p>
                  <p className="text-xs text-muted-foreground">ahorro mensual</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
