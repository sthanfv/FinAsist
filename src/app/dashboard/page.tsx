
'use client';
import React from 'react';
import { useFinancialAnalysis } from '@/hooks/useFinancialAnalysis';
import { RealTimeMetrics } from '@/components/dashboard/RealTimeMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, TrendingUp } from 'lucide-react';
import { ModernLayout } from '@/components/layout/modern-layout';

export default function DashboardPage() {
  const { 
    analysis, 
    trendAnalysis, 
    riskMetrics, 
    projections,
    isLoading, 
    error,
    performance,
    lastUpdated,
    getAnalysisScore,
    forceRecalculate,
    invalidateCache
  } = useFinancialAnalysis();
  
  const analysisScore = getAnalysisScore();

  return (
    <ModernLayout>
      <div className="container mx-auto p-0 sm:p-6 space-y-8">
        {/* Header con Score Financiero */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Financiero
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Análisis inteligente de tus finanzas
            </p>
          </div>
          
          <Card className="min-w-[150px] sm:min-w-[200px]">
            <CardContent className="p-3 sm:p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                {analysisScore}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">Score Financiero</div>
              <Badge 
                variant={analysisScore > 70 ? "default" : analysisScore > 40 ? "secondary" : "destructive"}
                className="mt-2"
              >
                {analysisScore > 70 ? "Excelente" : analysisScore > 40 ? "Bueno" : "Mejorable"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Métricas en Tiempo Real */}
        <RealTimeMetrics />

        {/* Performance Stats */}
        {performance && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Performance del Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {performance.calculationTime.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-gray-500">Tiempo de Cálculo</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {performance.cacheHitRate.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-500">Cache Hit Rate</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {performance.workerUsage ? 'Worker' : 'Main'}
                  </div>
                  <div className="text-sm text-gray-500">Modo de Cálculo</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Análisis Avanzado */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Análisis Principal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  <span>Análisis Inteligente</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Balance Total:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP'
                      }).format(analysis.balance || 0)}
                    </span>
                  </div>
                  
                  {analysis.totalIncome && (
                    <div className="flex justify-between">
                      <span>Ingresos Totales:</span>
                      <span className="font-semibold text-green-600">
                        {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP'
                        }).format(analysis.totalIncome)}
                      </span>
                    </div>
                  )}
                  
                  {analysis.totalExpenses && (
                    <div className="flex justify-between">
                      <span>Gastos Totales:</span>
                      <span className="font-semibold text-red-600">
                        {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP'
                        }).format(analysis.totalExpenses)}
                      </span>
                    </div>
                  )}
                  
                  {analysis.savingsRate && (
                    <div className="flex justify-between">
                      <span>Tasa de Ahorro:</span>
                      <span className="font-semibold">
                        {analysis.savingsRate.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Análisis de Riesgo */}
            {riskMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    <span>Análisis de Riesgo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Score de Riesgo:</span>
                      <Badge variant={riskMetrics.riskScore > 70 ? "destructive" : riskMetrics.riskScore > 40 ? "secondary" : "default"}>
                        {riskMetrics.riskScore?.toFixed(0) || 'N/A'}
                      </Badge>
                    </div>
                    
                    {riskMetrics.emergencyFundRatio && (
                      <div className="flex justify-between">
                        <span>Fondo de Emergencia:</span>
                        <span className="font-semibold">
                          {riskMetrics.emergencyFundRatio.toFixed(1)} meses
                        </span>
                      </div>
                    )}
                    
                    {riskMetrics.burnRate && (
                      <div className="flex justify-between">
                        <span>Tasa de Quema:</span>
                        <span className="font-semibold">
                          {riskMetrics.burnRate.toFixed(0)} días
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Controles de Debug */}
        <Card>
          <CardHeader>
            <CardTitle>Controles del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              <Button 
                onClick={forceRecalculate}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? 'Calculando...' : 'Forzar Recálculo'}
              </Button>
              
              <Button 
                onClick={invalidateCache}
                variant="outline"
              >
                Limpiar Cache
              </Button>
              
              {lastUpdated && (
                <div className="flex items-center text-sm text-gray-500">
                  Última actualización: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
            
            {error && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  );
}
