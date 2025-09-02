'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Brain,
  Zap,
  RefreshCw
} from 'lucide-react';
import { usePredictiveAnalysis } from '@/hooks/usePredictiveAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};
const getScoreColor = (score: number): string => {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 60) return 'text-blue-600 dark:text-blue-400';
  if (score >= 40) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
};
const getScoreBadge = (score: number): { variant: any; label: string } => {
  if (score >= 80) return { variant: 'default', label: 'Excelente' };
  if (score >= 60) return { variant: 'secondary', label: 'Bueno' };
  if (score >= 40) return { variant: 'outline', label: 'Regular' };
  return { variant: 'destructive', label: 'Crítico' };
};
export const PredictiveDashboard: React.FC = () => {
  const {
    cashFlowPrediction,
    stabilityScore,
    recommendations,
    anomalies,
    isLoading,
    error,
    lastUpdated,
    refresh
  } = usePredictiveAnalysis();
  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">Error en análisis predictivo: {error}</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Análisis Predictivo IA
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Predicciones inteligentes basadas en tus patrones financieros
          </p>
        </div>
        
        <Button
          onClick={refresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>
      {/* Score de Estabilidad Financiera */}
      {stabilityScore && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Score de Estabilidad Financiera
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(stabilityScore.score)}`}>
                  {stabilityScore.score}
                </div>
                <div className="text-sm text-gray-500">de 100</div>
                <Badge {...getScoreBadge(stabilityScore.score)} className="mt-2">
                  {getScoreBadge(stabilityScore.score).label}
                </Badge>
              </div>
              
              <div className="flex-1 ml-6">
                <Progress 
                  value={stabilityScore.score} 
                  className="h-3" 
                />
              </div>
            </div>
            
            {/* Factores principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stabilityScore.factors.slice(0, 4).map((factor: any, index: number) => (
                <motion.div
                  key={factor.factor}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{factor.factor}</p>
                    <p className="text-xs text-gray-500">{factor.description}</p>
                  </div>
                  <Badge variant={factor.impact > 15 ? "default" : factor.impact > 5 ? "secondary" : "outline"}>
                    +{factor.impact.toFixed(1)}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Predicción de Cash Flow */}
      {cashFlowPrediction.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Predicción de Cash Flow (6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cashFlowPrediction.slice(0, 6).map((prediction: any, index: number) => (
                <motion.div
                  key={prediction.month}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    prediction.predictedBalance > 0
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10'
                      : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="font-semibold">Mes {prediction.month}</div>
                      <div className="text-xs text-gray-500">
                        Confianza: {(prediction.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Ingresos</p>
                        <p className="font-semibold text-green-600">
                          {formatCurrency(prediction.predictedIncome)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Gastos</p>
                        <p className="font-semibold text-red-600">
                          {formatCurrency(prediction.predictedExpenses)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Balance</p>
                        <p className={`font-semibold ${
                          prediction.predictedBalance > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(prediction.predictedBalance)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {prediction.predictedBalance > 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Recomendaciones Inteligentes */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Recomendaciones Inteligentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.slice(0, 5).map((rec: any, index: number) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <Badge 
                        variant={
                          rec.priority === 'high' ? 'destructive' :
                          rec.priority === 'medium' ? 'default' : 'secondary'
                        }
                      >
                        {rec.priority}
                      </Badge>
                      <Badge variant="outline">
                        {(rec.confidence * 100).toFixed(0)}% confianza
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {rec.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>💰 Impacto: {formatCurrency(rec.impact.potential)}</span>
                      <span>⏱️ {rec.impact.timeframe}</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm">
                    {rec.action.text}
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Anomalías Detectadas */}
      {anomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Anomalías Detectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anomalies.slice(0, 3).map((anomaly: any, index: number) => (
                <motion.div
                  key={`${anomaly.transaction.id}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border-l-4 ${
                    anomaly.severity === 'high' 
                      ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
                      : anomaly.severity === 'medium'
                      ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10'
                      : 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">
                        {anomaly.transaction.description} - {anomaly.transaction.category}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(anomaly.transaction.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs mt-1">{anomaly.reason}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-red-600">
                        {formatCurrency(anomaly.transaction.amount)}
                      </p>
                      <Badge 
                        variant={
                          anomaly.severity === 'high' ? 'destructive' :
                          anomaly.severity === 'medium' ? 'default' : 'secondary'
                        }
                      >
                        {anomaly.severity}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Indicador de estado */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <div className={`w-2 h-2 rounded-full ${
            isLoading 
              ? 'bg-purple-400 animate-pulse' 
              : 'bg-green-400'
          }`} />
          <span>
            {isLoading ? 'Analizando patrones...' : 'IA Activa'}
          </span>
          {lastUpdated && (
            <span>• Última actualización: {lastUpdated.toLocaleTimeString()}</span>
          )}
        </div>
      </div>
    </div>
  );
};