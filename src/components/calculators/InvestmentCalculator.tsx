'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { bankingEngine, InvestmentProjection } from '@/engine/BankingEngine';

export function InvestmentCalculator() {
  const [formData, setFormData] = useState({
    initialAmount: 5000000,
    monthlyContribution: 500000,
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
    if (formData.initialAmount < 0) newErrors.initialAmount = 'Monto no puede ser negativo';
    if (formData.monthlyContribution < 0) newErrors.monthlyContribution = 'Aporte no puede ser negativo';
    if (formData.annualReturn < -100 || formData.annualReturn > 100) newErrors.annualReturn = 'Retorno inválido';
    if (formData.years <= 0) newErrors.years = 'Años debe ser mayor a 0';
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
            <h2 className="text-2xl font-bold">Calculadora de Inversiones</h2>
            <p className="text-orange-100">Proyecta el crecimiento con interés compuesto</p>
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
            <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
            Parámetros de Inversión
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Inversión Inicial</label>
              <input type="number" value={formData.initialAmount} onChange={(e) => handleInputChange('initialAmount', e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.initialAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500`} />
              {errors.initialAmount && <p className="text-red-500 text-sm mt-1">{errors.initialAmount}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Aporte Mensual</label>
              <input type="number" value={formData.monthlyContribution} onChange={(e) => handleInputChange('monthlyContribution', e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.monthlyContribution ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500`} />
               {errors.monthlyContribution && <p className="text-red-500 text-sm mt-1">{errors.monthlyContribution}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Retorno Anual Esperado (%)</label>
              <input type="number" step="0.5" value={formData.annualReturn} onChange={(e) => handleInputChange('annualReturn', e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.annualReturn ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500`} />
              {errors.annualReturn && <p className="text-red-500 text-sm mt-1">{errors.annualReturn}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Años a Invertir</label>
              <input type="number" value={formData.years} onChange={(e) => handleInputChange('years', e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${errors.years ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500`} />
              {errors.years && <p className="text-red-500 text-sm mt-1">{errors.years}</p>}
            </div>
            <button onClick={calculateInvestment} className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
              <div className="flex items-center justify-center space-x-2">
                <RefreshCw className="w-5 h-5" />
                <span>Calcular Proyección</span>
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
              <Calendar className="w-5 h-5 mr-2 text-orange-600" />
              Resultados de la Proyección
            </h3>
            <div className="space-y-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Capital Final</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{formatCurrency(result.finalAmount)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Aportado</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(result.totalContributions)}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
                <p className="text-sm text-green-600 dark:text-green-400">Total Ganancias</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">{formatCurrency(result.totalReturns)}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6"><h3 className="text-lg font-semibold">Proyección Anual</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Año</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Aportes</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Rendimientos</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Balance Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {result.yearlyBreakdown.map((entry, index) => (
                  <tr key={entry.year} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'} hover:bg-orange-50 dark:hover:bg-orange-900/20`}>
                    <td className="px-4 py-3 font-medium">{entry.year}</td>
                    <td className="px-4 py-3 text-right text-blue-600 dark:text-blue-400">{formatCurrency(entry.contributions)}</td>
                    <td className="px-4 py-3 text-right text-green-600 dark:text-green-400">{formatCurrency(entry.returns)}</td>
                    <td className="px-4 py-3 text-right font-bold">{formatCurrency(entry.endBalance)}</td>
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
