'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, FileText, TrendingDown, AlertCircle } from 'lucide-react';
import { bankingEngine, LoanCalculation } from '@/engine/BankingEngine';
export function LoanCalculator() {
  const [formData, setFormData] = useState({
    principal: 10000000,
    interestRate: 18.5,
    termMonths: 36
  });
  const [result, setResult] = useState<LoanCalculation | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAmortization, setShowAmortization] = useState(false);
  const handleInputChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, [field]: numValue }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.principal <= 0) {
      newErrors.principal = 'El monto debe ser mayor a 0';
    }
    if (formData.interestRate < 0 || formData.interestRate > 100) {
      newErrors.interestRate = 'La tasa debe estar entre 0% y 100%';
    }
    if (formData.termMonths <= 0 || formData.termMonths > 600) {
      newErrors.termMonths = 'El plazo debe estar entre 1 y 600 meses';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const calculateLoan = () => {
    if (!validateForm()) return;
    try {
      const calculation = bankingEngine.calculateLoan(
        formData.principal,
        formData.interestRate,
        formData.termMonths
      );
      setResult(calculation);
      setShowAmortization(false);
    } catch (error) {
      console.error('Error en cálculo de préstamo:', error);
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
        className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-xl"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Calculadora de Préstamos</h2>
            <p className="text-blue-100">Simula préstamos con tabla de amortización completa</p>
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
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Datos del Préstamo
          </h3>
          <div className="space-y-4">
            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monto del préstamo
              </label>
              <input
                type="number"
                value={formData.principal}
                onChange={(e) => handleInputChange('principal', e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-xl border transition-all duration-200
                  ${errors.principal 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:border-transparent
                `}
                placeholder="10,000,000"
              />
              {errors.principal && (
                <p className="text-red-500 text-sm mt-1">{errors.principal}</p>
              )}
            </div>
            {/* Tasa de interés */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tasa de interés anual (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={formData.interestRate}
                  onChange={(e) => handleInputChange('interestRate', e.target.value)}
                  className={`
                    w-full px-4 py-3 rounded-xl border transition-all duration-200
                    ${errors.interestRate 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                    }
                    bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                    focus:ring-2 focus:border-transparent
                  `}
                  placeholder="18.5"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-gray-400 text-sm">% EA</span>
                </div>
              </div>
              {errors.interestRate && (
                <p className="text-red-500 text-sm mt-1">{errors.interestRate}</p>
              )}
            </div>
            {/* Plazo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Plazo (meses)
              </label>
              <input
                type="number"
                value={formData.termMonths}
                onChange={(e) => handleInputChange('termMonths', e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-xl border transition-all duration-200
                  ${errors.termMonths 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:border-transparent
                `}
                placeholder="36"
              />
              {errors.termMonths && (
                <p className="text-red-500 text-sm mt-1">{errors.termMonths}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.termMonths > 12 ? `${(formData.termMonths / 12).toFixed(1)} años` : `${formData.termMonths} meses`}
              </p>
            </div>
            {/* Botón calcular */}
            <button
              onClick={calculateLoan}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>Calcular Préstamo</span>
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
              <TrendingDown className="w-5 h-5 mr-2 text-blue-600" />
              Resumen del Préstamo
            </h3>
            <div className="space-y-4">
              {/* Cuota mensual */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Cuota Mensual Fija
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(result.monthlyPayment)}
                </p>
              </div>
              {/* Total a pagar */}
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  Total a Pagar
                </p>
                <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
                  {formatCurrency(result.totalPayment)}
                </p>
              </div>
              {/* Total intereses */}
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Total Intereses
                </p>
                <p className="text-xl font-bold text-red-700 dark:text-red-300">
                  {formatCurrency(result.totalInterest)}
                </p>
              </div>
              {/* Alerta de costo */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Costo del préstamo
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Pagarás {((result.totalInterest / result.principal) * 100).toFixed(1)}% más del monto solicitado
                  </p>
                </div>
              </div>
              {/* Botón tabla amortización */}
              <button
                onClick={() => setShowAmortization(!showAmortization)}
                className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-xl font-medium transition-all duration-200"
              >
                {showAmortization ? 'Ocultar' : 'Ver'} Tabla de Amortización
              </button>
            </div>
          </motion.div>
        )}
      </div>
      {/* Tabla de Amortización */}
      {result && showAmortization && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Tabla de Amortización
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Detalle mes a mes del pago del préstamo
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Mes
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cuota
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Capital
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Interés
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {result.amortizationTable.map((entry, index) => (
                  <tr 
                    key={entry.month}
                    className={`
                      ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}
                      hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors
                    `}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {entry.month}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                      {formatCurrency(entry.payment)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">
                      {formatCurrency(entry.principal)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-600 dark:text-red-400">
                      {formatCurrency(entry.interest)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-medium">
                      {formatCurrency(entry.balance)}
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
