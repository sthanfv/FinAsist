'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, TrendingUp, AlertCircle, CheckCircle2, Crown } from 'lucide-react';
import { bankingEngine } from '@/engine/BankingEngine';

interface FinancialFreedomResult {
  targetAmount: number;
  remainingAmount: number;
  monthsToFreedom: number;
  yearsToFreedom: number;
  monthlyExpenses: number;
  monthlySavings: number;
  expectedReturn: number;
  message?: string;
}

export function FinancialFreedomCalculator() {
  const [formData, setFormData] = useState({
    currentSavings: 5000000,
    monthlyExpenses: 2500000,
    monthlySavings: 800000,
    expectedReturn: 4
  });
  const [result, setResult] = useState<FinancialFreedomResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  const handleInputChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.currentSavings < 0) {
      newErrors.currentSavings = 'Los ahorros actuales no pueden ser negativos';
    }
    if (formData.monthlyExpenses <= 0) {
      newErrors.monthlyExpenses = 'Los gastos mensuales deben ser mayores a 0';
    }
    if (formData.monthlySavings < 0) {
      newErrors.monthlySavings = 'El ahorro mensual no puede ser negativo';
    }
    if (formData.expectedReturn < 0 || formData.expectedReturn > 20) {
      newErrors.expectedReturn = 'El retorno esperado debe estar entre 0% y 20%';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateFreedom = () => {
    if (!validateForm()) return;
    try {
      const calculation = bankingEngine.calculateFinancialFreedom(
        formData.currentSavings,
        formData.monthlyExpenses,
        formData.monthlySavings,
        formData.expectedReturn
      );
      setResult(calculation);
    } catch (error) {
      console.error('Error en cálculo de libertad financiera:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getFreedomLevel = () => {
    if (!result) return null;
    const years = result.yearsToFreedom;
    if (years === Infinity) {
      return {
        level: 'Crítico',
        color: 'red',
        icon: AlertCircle,
        message: 'Necesitas empezar a ahorrar para lograr la libertad financiera'
      };
    } else if (years <= 5) {
      return {
        level: 'Excelente',
        color: 'green',
        icon: Crown,
        message: '¡Estás muy cerca de la libertad financiera!'
      };
    } else if (years <= 15) {
      return {
        level: 'Bueno',
        color: 'blue',
        icon: CheckCircle2,
        message: 'Vas por buen camino hacia la libertad financiera'
      };
    } else if (years <= 30) {
      return {
        level: 'Regular',
        color: 'yellow',
        icon: Calendar,
        message: 'Podrías acelerar tu plan aumentando el ahorro'
      };
    } else {
      return {
        level: 'Lento',
        color: 'orange',
        icon: TrendingUp,
        message: 'Considera aumentar significativamente tu ahorro mensual'
      };
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      red: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-700 dark:text-red-300',
        iconColor: 'text-red-600 dark:text-red-400'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-700 dark:text-green-300',
        iconColor: 'text-green-600 dark:text-green-400'
      },
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-700 dark:text-blue-300',
        iconColor: 'text-blue-600 dark:text-blue-400'
      },
      yellow: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-700 dark:text-yellow-300',
        iconColor: 'text-yellow-600 dark:text-yellow-400'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-700 dark:text-orange-300',
        iconColor: 'text-orange-600 dark:text-orange-400'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-violet-600 to-purple-700 text-white p-6 rounded-2xl shadow-xl"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Calculadora de Libertad Financiera</h2>
            <p className="text-violet-100">Descubre cuándo podrás vivir de tus inversiones</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Crown className="w-5 h-5 mr-2 text-violet-600" />
            Tu Situación Financiera
          </h3>
          <div className="space-y-4">
            {/* Ahorros actuales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ahorros actuales
              </label>
              <input
                type="number"
                value={formData.currentSavings}
                onChange={(e) => handleInputChange('currentSavings', e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-xl border transition-all duration-200
                  ${errors.currentSavings 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-violet-500'
                  }
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:border-transparent
                `}
                placeholder="5,000,000"
              />
              {errors.currentSavings && (
                <p className="text-red-500 text-sm mt-1">{errors.currentSavings}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Dinero que tienes ahorrado para invertir</p>
            </div>

            {/* Gastos mensuales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gastos mensuales totales
              </label>
              <input
                type="number"
                value={formData.monthlyExpenses}
                onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-xl border transition-all duration-200
                  ${errors.monthlyExpenses 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-violet-500'
                  }
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:border-transparent
                `}
                placeholder="2,500,000"
              />
              {errors.monthlyExpenses && (
                <p className="text-red-500 text-sm mt-1">{errors.monthlyExpenses}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Gastos anuales: {formatCurrency(formData.monthlyExpenses * 12)}
              </p>
            </div>

            {/* Ahorro mensual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ahorro mensual
              </label>
              <input
                type="number"
                value={formData.monthlySavings}
                onChange={(e) => handleInputChange('monthlySavings', e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-xl border transition-all duration-200
                  ${errors.monthlySavings 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-violet-500'
                  }
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:border-transparent
                `}
                placeholder="800,000"
              />
              {errors.monthlySavings && (
                <p className="text-red-500 text-sm mt-1">{errors.monthlySavings}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Porcentaje de ahorro: {formData.monthlyExpenses > 0 ? ((formData.monthlySavings / (formData.monthlyExpenses + formData.monthlySavings)) * 100).toFixed(1) : 0}%
              </p>
            </div>

            {/* Retorno esperado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Retorno anual esperado (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.expectedReturn}
                onChange={(e) => handleInputChange('expectedReturn', e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-xl border transition-all duration-200
                  ${errors.expectedReturn 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-violet-500'
                  }
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:border-transparent
                `}
                placeholder="4"
              />
              {errors.expectedReturn && (
                <p className="text-red-500 text-sm mt-1">{errors.expectedReturn}</p>
              )}
              <div className="text-xs text-gray-500 mt-1 space-y-1">
                <p>• 4% - Muy conservador (CDT, bonos)</p>
                <p>• 7% - Conservador (fondos indexados)</p>
                <p>• 10% - Moderado (acciones diversificadas)</p>
              </div>
            </div>

            {/* Botón calcular */}
            <button
              onClick={calculateFreedom}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Calcular Libertad Financiera</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Resultados */}
        <div ref={resultsRef} className="lg:col-span-1">
            {result && (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
            >
                {/* Meta objetivo */}
                <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl p-6 shadow-lg">
                <h4 className="font-semibold text-violet-700 dark:text-violet-300 mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Tu Meta de Libertad Financiera
                </h4>
                <div className="space-y-2">
                    <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Meta total (25x gastos anuales):</span>
                    <span className="font-bold text-violet-700 dark:text-violet-300">
                        {formatCurrency(result.targetAmount)}
                    </span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Te falta:</span>
                    <span className="font-bold text-violet-700 dark:text-violet-300">
                        {formatCurrency(result.remainingAmount)}
                    </span>
                    </div>
                    <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Progreso actual:</span>
                    <span className="font-bold text-violet-700 dark:text-violet-300">
                        {((formData.currentSavings / result.targetAmount) * 100).toFixed(1)}%
                    </span>
                    </div>
                </div>
                </div>

                {/* Tiempo para libertad */}
                {(() => {
                const freedom = getFreedomLevel();
                if (!freedom) return null;
                
                const colors = getColorClasses(freedom.color);
                const Icon = freedom.icon;
                
                return (
                    <div className={`${colors.bg} ${colors.border} border rounded-2xl p-6 shadow-lg`}>
                    <div className="flex items-center space-x-3 mb-4">
                        <Icon className={`w-6 h-6 ${colors.iconColor}`} />
                        <h4 className={`font-semibold ${colors.text}`}>
                        Nivel: {freedom.level}
                        </h4>
                    </div>
                    
                    {result.monthsToFreedom !== Infinity ? (
                        <div className="space-y-3">
                        <div className="text-center">
                            <p className={`text-3xl font-bold ${colors.text}`}>
                            {result.yearsToFreedom} años
                            </p>
                            <p className={`text-sm ${colors.text} opacity-75`}>
                            ({result.monthsToFreedom} meses)
                            </p>
                        </div>
                        
                        <div className={`text-center text-sm ${colors.text}`}>
                            <p className="font-medium">Fecha estimada de libertad financiera:</p>
                            <p className="text-lg font-bold">
                            {new Date(Date.now() + result.monthsToFreedom * 30.44 * 24 * 60 * 60 * 1000).getFullYear()}
                            </p>
                        </div>
                        </div>
                    ) : (
                        <div className="text-center">
                        <p className={`text-xl font-bold ${colors.text}`}>
                            ⚠️ Plan Insostenible
                        </p>
                        <p className={`text-sm ${colors.text} mt-2`}>
                            Necesitas ahorrar al menos algo mensualmente
                        </p>
                        </div>
                    )}
                    
                    <p className={`text-sm ${colors.text} mt-4 text-center italic`}>
                        {freedom.message}
                    </p>
                    </div>
                );
                })()}
                
                {/* Recomendaciones */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-lg">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Estrategias para Acelerar tu Plan
                </h4>
                
                <div className="space-y-3 text-sm">
                    {result.monthsToFreedom > 180 && (
                    <div className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-blue-700 dark:text-blue-300">
                        <strong>Aumenta tu ahorro:</strong> Si ahorraras {formatCurrency(formData.monthlySavings * 1.5)} 
                        mensuales, te liberarías {Math.round((result.monthsToFreedom - result.monthsToFreedom * 0.67) / 12)} años antes
                        </p>
                    </div>
                    )}
                    
                    <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-blue-700 dark:text-blue-300">
                        <strong>Reduce gastos:</strong> Cada {formatCurrency(100000)} menos de gastos mensuales 
                        reduce tu meta en {formatCurrency(100000 * 12 * 25)}
                    </p>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-blue-700 dark:text-blue-300">
                        <strong>Mejora tu retorno:</strong> Aumentar el retorno a {formData.expectedReturn + 2}% 
                        podría acelerar tu plan significativamente
                    </p>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-blue-700 dark:text-blue-300">
                        <strong>Ingresos pasivos:</strong> Busca fuentes de ingresos adicionales 
                        (alquileres, dividendos, negocios)
                    </p>
                    </div>
                </div>
                </div>
            </motion.div>
            )}
        </div>
      </div>

      {/* Información de la regla del 4% */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-gray-600" />
          ¿Qué es la Regla del 4%?
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>
            La <strong>Regla del 4%</strong> es un principio financiero que establece que puedes retirar 
            el 4% de tu portafolio anualmente sin agotar el capital principal.
          </p>
          <p>
            <strong>Ejemplo:</strong> Si gastas {formatCurrency(formData.monthlyExpenses)} mensuales 
            ({formatCurrency(formData.monthlyExpenses * 12)} anuales), necesitas {formatCurrency(formData.monthlyExpenses * 12 * 25)} 
            invertidos para generar ese ingreso indefinidamente.
          </p>
          <p className="text-xs italic">
            * Esta calculadora asume retornos constantes. Los mercados reales son volátiles. 
            Considera consultar con un asesor financiero para un plan personalizado.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
