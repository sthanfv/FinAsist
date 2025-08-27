'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Calendar, Target } from 'lucide-react';
import { bankingEngine, InvestmentProjection } from '@/engine/BankingEngine';
export function InvestmentCalculator() {
  const [formData, setFormData] = useState({
    initialAmount: 500000,
    monthlyContribution: 200000,
    annualReturn: 12,
    years: 10
  });
  const [result, setResult] = useState<InvestmentProjection | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const handleInputChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.initialAmount < 0) {
      newErrors.initialAmount = 'El monto inicial no puede ser negativo';
    }
    if (formData.monthlyContribution < 0) {
      newErrors.monthlyContribution = 'La contribución mensual no puede ser negativa';
    }
    if (formData.annualReturn < -50 || formData.annualReturn > 100) {
      newErrors.annualReturn = 'El retorno debe estar entre -50% y 100%';
    }
    if (formData.years <= 0 || formData.years > 50) {
      newErrors.years = 'Los años deben estar entre 1 y 50';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const calculateInvestment = () => {
    if (!validateForm()) return;
    try {
      const calculation = bankingEngine.calculateInvestment(
        formData.initialAmount,
        formData.monthlyContribution,
        formData.annualReturn,
        formData.years
      );
      setResult(calculation);
    } catch (error) {
      console.error('Error en cálculo de inversión:', error);
    }
  };
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-600 to-red-700 text-white p-6 rounded-2xl shadow-xl"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Simulador de Inversiones</h2>
            <p className="text-orange-100">Proyecta el crecimiento de tus inversiones con interés compuesto</p>
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
            <Target className="w-5 h-5 mr-2 text-orange-600" />
            Plan de Inversión
          </h3>
          <div className="space-y-4">
            {/* Inversión inicial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Inversión inicial
              </label>
              <input
                type="number"
                value={formData.initialAmount}
                onChange={(e) => handleInputChange('initialAmount', e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-xl border transition-all duration-200
                  ${errors.initialAmount 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500'
                  }
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:border-transparent
                `}
                placeholder="500,000"
              />
              {errors.initialAmount && (
                <p className="text-red-500 text-sm mt-1">{errors.initialAmount}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Puedes comenzar con $0</p>
            </div>
            {/* Aporte mensual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Aporte mensual
              </label>
              <input
                type="number"
                value={formData.monthlyContribution}
                onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-xl border transition-all duration-200
                  ${errors.monthlyContribution 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500'
                  }
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:border-transparent
                `}
                placeholder="200,000"
              />
              {errors.monthlyContribution && (
                <p className="text-red-500 text-sm mt-1">{errors.monthlyContribution}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Total anual: {formatCurrency(formData.monthlyContribution * 12)}
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
                value={formData.annualReturn}
                onChange={(e) => handleInputChange('annualReturn', e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-xl border transition-all duration-200
                  ${errors.annualReturn 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500'
                  }
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:border-transparent
                `}
                placeholder="12"
              />
              {errors.annualReturn && (
                <p className="text-red-500 text-sm mt-1">{errors.annualReturn}</p>
              )}
              <div className="text-xs text-gray-500 mt-1 space-y-1">
                <p>• Conservador: 4-8%</p>
                <p>• Moderado: 8-12%</p>
                <p>• Agresivo: 12-20%</p>
              </div>
            </div>
            {/* Años */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Período de inversión (años)
              </label>
              <input
                type="number"
                value={formData.years}
                onChange={(e) => handleInputChange('years', e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-xl border transition-all duration-200
                  ${errors.years 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500'
                  }
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:border-transparent
                `}
                placeholder="10"
              />
              {errors.years && (
                <p className="text-red-500 text-sm mt-1">{errors.years}</p>
              )}
            </div>
            {/* Botón calcular */}
            <button
              onClick={calculateInvestment}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Proyectar Inversión</span>
              </div>
            </button>
          </div>
        </motion.div>
        {/* Resultados */}
        {result && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
              Proyección de Inversión
            </h3>
            <div className="space-y-4">
              {/* Monto final */}
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  Valor Final de tu Inversión
                </p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {formatCurrency(result.finalAmount)}
                </p>
              </div>
              {/* Total contribuido */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Total Contribuido
                </p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(result.totalContributions)}
                </p>
              </div>
              {/* Ganancias */}
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                  Ganancias por Interés Compuesto
                </p>
                <p className="text-xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(result.totalReturns)}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {((result.totalReturns / result.totalContributions) * 100).toFixed(1)}% de ganancia sobre lo aportado
                </p>
              </div>
              {/* Multiplicador */}
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                  Factor de Multiplicación
                </p>
                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                  {(result.finalAmount / result.totalContributions).toFixed(1)}x
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  Cada peso se convierte en {(result.finalAmount / result.totalContributions).toFixed(1)} pesos
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      {/* Cronograma anual */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-orange-600" />
              Cronograma de Crecimiento Anual
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Ve cómo crece tu inversión año tras año
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Año
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Saldo Inicial
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Aportes
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ganancias
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Saldo Final
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {result.yearlyBreakdown.map((year, index) => (
                  <tr 
                    key={year.year}
                    className={`
                      ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}
                      hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors
                    `}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {year.year}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                      {formatCurrency(year.startBalance)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-blue-600 dark:text-blue-400">
                      {formatCurrency(year.contributions)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                      {formatCurrency(year.returns)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-orange-600 dark:text-orange-400 font-bold">
                      {formatCurrency(year.endBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}