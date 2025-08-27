'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, DollarSign, PiggyBank, BarChart2 } from 'lucide-react';
import { bankingEngine } from '@/engine/BankingEngine';

export function FinancialFreedomCalculator() {
  const [formData, setFormData] = useState({
    currentSavings: 25000000,
    monthlyExpenses: 4000000,
    monthlySavings: 1000000,
    expectedReturn: 7
  });
  const [result, setResult] = useState<any | null>(null);
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
    if (formData.currentSavings < 0) newErrors.currentSavings = 'No puede ser negativo';
    if (formData.monthlyExpenses <= 0) newErrors.monthlyExpenses = 'Debe ser mayor a 0';
    if (formData.monthlySavings <= 0) newErrors.monthlySavings = 'Debe ser mayor a 0';
    if (formData.expectedReturn < 0 || formData.expectedReturn > 50) newErrors.expectedReturn = 'Retorno inválido';
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
  
  return (
    <div className="space-y-6">
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
            <p className="text-violet-100">Descubre cuándo podrás alcanzar tu independencia</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-violet-600" />
            Tu Situación Actual
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ahorros Actuales</label>
              <input type="number" value={formData.currentSavings} onChange={(e) => handleInputChange('currentSavings', e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.currentSavings ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-violet-500`} />
              {errors.currentSavings && <p className="text-red-500 text-sm mt-1">{errors.currentSavings}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gastos Mensuales</label>
              <input type="number" value={formData.monthlyExpenses} onChange={(e) => handleInputChange('monthlyExpenses', e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.monthlyExpenses ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-violet-500`} />
              {errors.monthlyExpenses && <p className="text-red-500 text-sm mt-1">{errors.monthlyExpenses}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ahorro / Inversión Mensual</label>
              <input type="number" value={formData.monthlySavings} onChange={(e) => handleInputChange('monthlySavings', e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.monthlySavings ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-violet-500`} />
              {errors.monthlySavings && <p className="text-red-500 text-sm mt-1">{errors.monthlySavings}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Retorno Anual Esperado (%)</label>
              <input type="number" value={formData.expectedReturn} onChange={(e) => handleInputChange('expectedReturn', e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.expectedReturn ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-violet-500`} />
              {errors.expectedReturn && <p className="text-red-500 text-sm mt-1">{errors.expectedReturn}</p>}
            </div>

            <button onClick={calculateFreedom} className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-center space-x-2">
                <BarChart2 className="w-5 h-5" />
                <span>Calcular Mi Retiro</span>
              </div>
            </button>
          </div>
        </motion.div>

        {result && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Target className="w-5 h-5 mr-2 text-violet-600" />
              Tu Camino a la Libertad
            </h3>
            {result.yearsToFreedom === Infinity ? (
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                <p className="font-bold text-red-600 dark:text-red-400">
                  {result.message}
                </p>
                <p className="text-sm text-red-500 dark:text-red-500">
                  ¡Aumenta tu ahorro mensual para empezar el camino!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-xl border border-violet-200 dark:border-violet-800 text-center">
                  <p className="text-sm text-violet-600 dark:text-violet-400 font-medium">
                    Alcanzarás la libertad financiera en
                  </p>
                  <p className="text-3xl font-bold text-violet-700 dark:text-violet-300">
                    {result.yearsToFreedom} años
                  </p>
                  <p className="text-sm text-violet-500 dark:text-violet-400">
                    ({result.monthsToFreedom} meses)
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tu número mágico (meta)</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(result.targetAmount)}</p>
                </div>
                 <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Te falta por ahorrar</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(result.remainingAmount)}</p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
