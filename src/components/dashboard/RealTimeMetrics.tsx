'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign, 
  Percent, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  RefreshCw
} from 'lucide-react';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
const formatValue = (value: number, unit: 'currency' | 'percentage' | 'number'): string => {
  switch (unit) {
    case 'currency':
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'number':
      return Math.floor(value).toString();
    default:
      return value.toString();
  }
};
const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4" />;
    case 'down':
      return <TrendingDown className="h-4 w-4" />;
    default:
      return <Minus className="h-4 w-4" />;
  }
};
const getColorClass = (color: 'green' | 'red' | 'blue' | 'orange') => {
  switch (color) {
    case 'green':
      return 'text-green-600 dark:text-green-400';
    case 'red':
      return 'text-red-600 dark:text-red-400';
    case 'blue':
      return 'text-blue-600 dark:text-blue-400';
    case 'orange':
      return 'text-orange-600 dark:text-orange-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};
const getAlertIcon = (type: 'warning' | 'danger' | 'info') => {
  switch (type) {
    case 'danger':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-orange-500" />;
    case 'info':
      return <Info className="h-5 w-5 text-blue-500" />;
    default:
      return <CheckCircle className="h-5 w-5 text-green-500" />;
  }
};
export const RealTimeMetrics: React.FC = () => {
  const { metrics, alerts, isCalculating, lastUpdated, dismissAlert, refreshMetrics } = useRealTimeMetrics();
  return (
    <div className="space-y-6">
      {/* Header con botón de refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Métricas en Tiempo Real
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Última actualización: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        
        <Button
          onClick={refreshMetrics}
          disabled={isCalculating}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      {/* Grid de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      {metric.label}
                    </p>
                    <div className={`flex items-center ${getColorClass(metric.color)}`}>
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                  
                  <div className="flex items-baseline justify-between">
                    <p className={`text-2xl font-bold ${getColorClass(metric.color)}`}>
                      {formatValue(metric.value, metric.unit)}
                    </p>
                    
                    {metric.change !== 0 && (
                      <Badge
                        variant={metric.change > 0 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                  
                  {/* Indicador visual de la métrica */}
                  <motion.div
                    className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${
                      metric.color === 'green' 
                        ? 'from-green-400 to-green-600'
                        : metric.color === 'red'
                        ? 'from-red-400 to-red-600'
                        : metric.color === 'orange'
                        ? 'from-orange-400 to-orange-600'
                        : 'from-blue-400 to-blue-600'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Alertas Inteligentes
          </h4>
          
          <AnimatePresence>
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-l-4 ${
                  alert.type === 'danger' 
                    ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10'
                    : alert.type === 'warning'
                    ? 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/10'
                    : 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {getAlertIcon(alert.type)}
                        
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 dark:text-white">
                            {alert.title}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {alert.message}
                          </p>
                          
                          {alert.action && (
                            <Badge variant="outline" className="mt-2 text-xs">
                              💡 {alert.action}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => dismissAlert(alert.id)}
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      {/* Indicador de estado */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <div className={`w-2 h-2 rounded-full ${
            isCalculating 
              ? 'bg-orange-400 animate-pulse' 
              : 'bg-green-400'
          }`} />
          <span>
            {isCalculating ? 'Calculando...' : 'Sistema Activo'}
          </span>
        </div>
      </div>
    </div>
  );
};
