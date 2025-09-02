'use client';
import React from 'react';
import { useFinancialAnalysis } from '@/hooks/useFinancialAnalysis';
import { RealTimeMetrics } from '@/components/dashboard/RealTimeMetrics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, TrendingUp, HelpCircle, Activity, ShieldCheck, Target, RefreshCw } from 'lucide-react';
import { ModernLayout } from '@/components/layout/modern-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

export default function DashboardAnalysisPage() {
  const { 
    analysis, 
    riskMetrics,
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
        
        <div className="space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Análisis Avanzado
            </h1>
            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <Activity className="h-5 w-5 text-blue-600" />
              <AlertTitle className="text-blue-800 dark:text-blue-200 font-semibold">
                Bienvenido al Motor de FinAssist
              </AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Esta sección es una vista técnica "bajo el capó" de tu salud financiera. Todos los cálculos se basan en 
                tus transacciones y metas registradas, procesadas por nuestro motor de rendimiento para darte una 
                visión profunda y precisa.
              </AlertDescription>
            </Alert>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda: Métricas */}
          <div className="lg:col-span-2 space-y-8">
             <RealTimeMetrics />

            {/* Análisis Principal */}
            {analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <span>Análisis Inteligente</span>
                     <InfoTooltip 
                        content="Un resumen de tu actividad financiera general. Muestra tus ingresos, gastos y la eficiencia con la que gestionas tu dinero." 
                     />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Balance Total</span>
                      <span className="font-semibold text-lg">
                        {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP'
                        }).format(analysis.balance || 0)}
                      </span>
                    </div>
                    {analysis.totalIncome && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Ingresos Totales (periodo)</span>
                        <span className="font-semibold text-green-600">
                          {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP'
                          }).format(analysis.totalIncome)}
                        </span>
                      </div>
                    )}
                    {analysis.totalExpenses && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Gastos Totales (periodo)</span>
                        <span className="font-semibold text-red-600">
                          {new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP'
                          }).format(analysis.totalExpenses)}
                        </span>
                      </div>
                    )}
                    {analysis.savingsRate !== undefined && (
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Tasa de Ahorro</span>
                            <InfoTooltip content="El porcentaje de tus ingresos que estás ahorrando. Una tasa superior al 15% es considerada saludable." />
                          </div>
                          <span className="font-semibold text-lg">
                            {analysis.savingsRate.toFixed(1)}%
                          </span>
                       </div>
                    )}
                </CardContent>
              </Card>
            )}

            {/* Análisis de Riesgo */}
            {riskMetrics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-orange-500" />
                    <span>Análisis de Riesgo</span>
                     <InfoTooltip 
                        content="Evalúa qué tan preparado estás para imprevistos financieros. Mide tu fondo de emergencia y la rapidez con la que se agotarían tus ahorros si tus ingresos se detuvieran." 
                     />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Score de Riesgo</span>
                         <InfoTooltip content="Una puntuación de 0 a 100 donde un valor más ALTO indica MAYOR riesgo. Se basa en la estabilidad de tus ingresos y gastos." />
                      </div>
                      <Badge variant={riskMetrics.riskScore > 70 ? "destructive" : riskMetrics.riskScore > 40 ? "secondary" : "default"}>
                        {riskMetrics.riskScore?.toFixed(0) || 'N/A'}
                      </Badge>
                    </div>
                    {riskMetrics.emergencyFundRatio !== undefined && (
                      <div className="flex justify-between items-center">
                         <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Fondo de Emergencia</span>
                             <InfoTooltip content="Calcula cuántos meses podrías cubrir tus gastos actuales usando solo tus ahorros. Se recomienda tener entre 3 y 6 meses." />
                          </div>
                        <span className="font-semibold">
                          {riskMetrics.emergencyFundRatio.toFixed(1)} meses
                        </span>
                      </div>
                    )}
                    {riskMetrics.burnRate !== undefined && (
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Tasa de Quema</span>
                             <InfoTooltip content="Indica cuántos días duraría tu balance actual si mantienes tu ritmo de gasto promedio sin nuevos ingresos." />
                        </div>
                        <span className="font-semibold">
                          {riskMetrics.burnRate.toFixed(0)} días
                        </span>
                      </div>
                    )}
                </CardContent>
              </Card>
            )}

          </div>

          {/* Columna Derecha: Performance y Controles */}
          <div className="lg:col-span-1 space-y-8">
            {/* Score Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Score Financiero</span>
                        <InfoTooltip content="Un resumen de 0 a 100 de tu salud financiera general, combinando tu balance, tasa de ahorro y nivel de riesgo." />
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <div className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                        {analysisScore}
                    </div>
                    <Badge 
                        variant={analysisScore > 70 ? "default" : analysisScore > 40 ? "secondary" : "destructive"}
                        className="mt-2 text-sm"
                    >
                        {analysisScore > 70 ? "Saludable" : analysisScore > 40 ? "Aceptable" : "En Riesgo"}
                    </Badge>
                </CardContent>
            </Card>
            
            {/* Performance Stats */}
            {performance && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span>Rendimiento del Sistema</span>
                  </CardTitle>
                  <CardDescription>
                      Cómo nuestro motor procesa tus datos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-center">
                        <div className="flex-1">
                            <div className="text-xl font-bold text-green-600">
                                {performance.calculationTime.toFixed(0)}ms
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Tiempo de Cálculo</div>
                        </div>
                        <InfoTooltip side="left" content="Mide la velocidad del último análisis completo. ¡Valores bajos indican un sistema muy rápido!" />
                    </div>

                    <div className="flex justify-between items-center text-center">
                        <div className="flex-1">
                            <div className="text-xl font-bold text-blue-600">
                                {performance.cacheHitRate.toFixed(0)}%
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Aciertos de Caché</div>
                        </div>
                         <InfoTooltip side="left" content="El porcentaje de veces que se encontró un resultado en el caché, evitando un recálculo. ¡Un valor alto significa que el sistema está siendo extremadamente eficiente!" />
                    </div>

                    <div className="flex justify-between items-center text-center">
                        <div className="flex-1">
                            <div className="text-xl font-bold text-purple-600">
                                {performance.workerUsage ? 'Worker' : 'Principal'}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">Modo de Cálculo</div>
                        </div>
                         <InfoTooltip side="left" content="Indica si el último cálculo pesado se hizo en un hilo secundario (Worker) para no afectar la fluidez de la UI, o en el hilo principal." />
                    </div>
                </CardContent>
              </Card>
            )}

            {/* Controles de Debug */}
            <Card>
              <CardHeader>
                <CardTitle>Controles del Sistema</CardTitle>
                <CardDescription>Para pruebas y depuración.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={forceRecalculate}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin': ''}`} />
                  {isLoading ? 'Calculando...' : 'Forzar Recálculo'}
                </Button>
                
                <Button 
                  onClick={invalidateCache}
                  variant="destructive"
                  className="w-full"
                >
                  Limpiar Caché
                </Button>
                
                {lastUpdated && (
                  <div className="text-center pt-2 text-xs text-muted-foreground">
                    Última actualización: {lastUpdated.toLocaleTimeString()}
                  </div>
                )}
                
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
        </div>
      </div>
    </ModernLayout>
  );
}
