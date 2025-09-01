
'use client';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useFinancialOptimization } from '@/hooks/useFinancialOptimization';
import { Skeleton } from '../ui/skeleton';

const PredictorLoader = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </CardContent>
    </Card>
);


export const SpendingPredictor = () => {
  const { spendingPrediction } = useFinancialOptimization();
  
  if (!spendingPrediction) return <PredictorLoader />;

  const confidenceColor = spendingPrediction.confidence > 0.8 ? 'text-green-600 border-green-600/50 bg-green-500/10' :
                         spendingPrediction.confidence > 0.6 ? 'text-yellow-600 border-yellow-600/50 bg-yellow-500/10' : 'text-red-600 border-red-600/50 bg-red-500/10';

  const getTrendIcon = (trend: number) => {
    if (trend > 0.05) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < -0.05) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between flex-wrap gap-2">
          <span>Predicción de Gastos del Próximo Mes</span>
          <Badge variant="outline" className={confidenceColor}>
            {(spendingPrediction.confidence * 100).toFixed(0)}% confianza
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Predicción principal */}
          <div className="text-center p-6 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Gasto Predicho</p>
            <p className="text-3xl font-bold">
              {formatCurrency(spendingPrediction.predictedAmount)}
            </p>
            <p className="text-sm mt-2 text-muted-foreground">
              {spendingPrediction.recommendation}
            </p>
          </div>
          {/* Factores que influyen */}
          <div>
            <h4 className="font-medium mb-3">Factores Influyentes</h4>
            <div className="space-y-2">
              {spendingPrediction.factors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(factor.trend)}
                    <span>{factor.name}</span>
                  </div>
                  <Badge variant="outline">
                    {(factor.impact * 100).toFixed(0)}% impacto
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
