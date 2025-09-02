'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PiggyBank, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { bankingEngine, CDTCalculation } from '@/engine/BankingEngine';

export function CDTCalculator() {
  const [formData, setFormData] = useState({
    principal: 1000000,
    interestRate: 8.5,
    termMonths: 12
  });
  const [result, setResult] = useState<CDTCalculation | null>(null);
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
    
    // Limpiar error del campo
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

  const calculateCDT = () => {
    if (!validateForm()) return;
    try {
      const calculation = bankingEngine.calculateCDT(
        formData.principal,
        formData.interestRate,
        formData.termMonths
      );
      setResult(calculation);
    } catch (error) {
      console.error('Error en cálculo CDT:', error);
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
        className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-xl"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <PiggyBank className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Calculadora CDT</h2>
            <p className="text-emerald-100">Simula tu certificado de depósito a término</p>
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
            <DollarSign className="w-5 h-5 mr-2 text-emerald-600" />
            Datos del CDT
          </h3>
          <div className="space-y-4">
            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Monto a invertir
              </label>
              <input
                type="number"
                value={formData.principal}
                onChange={(e) => handleInputChange('principal', e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-xl border transition-all duration-200
                  ${errors.principal 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500'
                  }
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:border-transparent
                `}
                placeholder="1,000,000"
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
              <input
                type="number"
                step="0.1"
                value={formData.interestRate}
                onChange={(e) => handleInputChange('interestRate', e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-xl border transition-all duration-200
                  ${errors.interestRate 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500'
                  }
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:border-transparent
                `}
                placeholder="8.5"
              />
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
                    : 'border-gray-300 dark:border-gray-600 focus:ring-emerald-500'
                  }
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:border-transparent
                `}
                placeholder="12"
              />
              {errors.termMonths && (
                <p className="text-red-500 text-sm mt-1">{errors.termMonths}</p>
              )}
            </div>
            
            {/* Botón calcular */}
            <button
              onClick={calculateCDT}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Calcular CDT</span>
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
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-emerald-600" />
                Resultados del CDT
                </h3>
                <div className="space-y-4">
                {/* Monto final */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                    Monto Final
                    </p>
                    <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(result.finalAmount)}
                    </p>
                </div>

                {/* Ganancia total */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Ganancia Total
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(result.totalInterest)}
                    </p>
                </div>

                {/* Ganancia mensual */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                    Ganancia Mensual Promedio
                    </p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(result.monthlyInterest)}
                    </p>
                </div>

                {/* Tasa efectiva */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Tasa Efectiva Anual
                    </p>
                    <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                    {result.effectiveRate.toFixed(2)}%
                    </p>
                </div>
                </div>
            </motion.div>
            )}
        </div>
      </div>
    </div>
  );
}
