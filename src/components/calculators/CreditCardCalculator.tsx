'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { bankingEngine, CreditCardSimulation } from '@/engine/BankingEngine';
export function CreditCardCalculator() {
  const [formData, setFormData] = useState({
    balance: 2000000,
    interestRate: 32.5,
    minimumRate: 2,
    customPayment: 150000
  });
  const [result, setResult] = useState<CreditCardSimulation | null>(null);
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
    
    if (formData.balance <= 0) {
      newErrors.balance = 'El saldo debe ser mayor a 0';
    }
    if (formData.interestRate < 0 || formData.interestRate > 100) {
      newErrors.interestRate = 'La tasa debe estar entre 0% y 100%';
    }
    if (formData.customPayment < 0) {
      newErrors.customPayment = 'El pago debe ser positivo';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const calculateCreditCard = () => {
    if (!validateForm()) return;
    try {
      const calculation = bankingEngine.simulateCreditCard(
        formData.balance,
        formData.interestRate,
        formData.minimumRate,
        formData.customPayment
      );
      setResult(calculation);
    } catch (error) {
      console.error('Error en cálculo de tarjeta:', error);
    }
  };
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };
  const getScenarioColor = (type: 'minimum' | 'custom' | 'full') => {
    switch (type) {
      case 'minimum':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-700 dark:text-red-300',
          icon: AlertTriangle,
          iconColor: 'text-red-600 dark:text-red-400'
        };
      case 'custom':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          text: 'text-yellow-700 dark:text-yellow-300',
          icon: Clock,
          iconColor: 'text-yellow-600 dark:text-yellow-400'
        };
      case 'full':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-700 dark:text-green-300',
          icon: CheckCircle,
          iconColor: 'text-green-600 dark:text-green-400'
        };
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 to-pink-700 text-white p-6 rounded-2xl shadow-xl"
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Simulador de Tarjeta de Crédito</h2>
            <p className="text-purple-100">Compara estrategias de pago y ahorra en intereses</p>
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
            <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
            Datos de tu Tarjeta
          </h3>
          <div className="space-y-4">
            {/* Saldo actual */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Saldo actual de la tarjeta
              </label>
              <input
                type="number"
                value={formData.balance}
                onChange={(e) => handleInputChange('balance', e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-xl border transition-all duration-200
                  ${errors.balance 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                  }
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:border-transparent
                `}
                placeholder="2,000,000"
              />
              {errors.balance && (
                <p className="text-red-500 text-sm mt-1">{errors.balance}</p>
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
                    : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                  }
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:border-transparent
                `}
                placeholder="32.5"
              />
              {errors.interestRate && (
                <p className="text-red-500 text-sm mt-1">{errors.interestRate}</p>
              )}
            </div>
            {/* Pago personalizado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tu pago mensual planificado
              </label>
              <input
                type="number"
                value={formData.customPayment}
                onChange={(e) => handleInputChange('customPayment', e.target.value)}
                className={`
                  w-full px-4 py-3 rounded-xl border transition-all duration-200
                  ${errors.customPayment 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500'
                  }
                  bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white
                  focus:ring-2 focus:border-transparent
                `}
                placeholder="150,000"
              />
              {errors.customPayment && (
                <p className="text-red-500 text-sm mt-1">{errors.customPayment}</p>
              )}
            </div>
            {/* Botón calcular */}
            <button
              onClick={calculateCreditCard}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Comparar Estrategias</span>
              </div>
            </button>
          </div>
        </motion.div>
        {/* Resultados */}
        {result && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Escenario pago mínimo */}
            {(() => {
              const scenario = result.scenarios.minimumPayment;
              const colors = getScenarioColor('minimum');
              const Icon = colors.icon;
              
              return (
                <div className={`${colors.bg} ${colors.border} border rounded-2xl p-6 shadow-lg`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <Icon className={`w-5 h-5 ${colors.iconColor}`} />
                    <h4 className={`font-semibold ${colors.text}`}>Pago Mínimo (2%)</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pago mensual:</span>
                      <span className={`font-medium ${colors.text}`}>{formatCurrency(scenario.monthlyPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Tiempo:</span>
                      <span className={`font-medium ${colors.text}`}>{scenario.totalMonths} meses</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total a pagar:</span>
                      <span className={`font-bold ${colors.text}`}>{formatCurrency(scenario.totalPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Intereses:</span>
                      <span className={`font-bold ${colors.text}`}>{formatCurrency(scenario.totalInterest)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
            {/* Escenario pago personalizado */}
            {(() => {
              const scenario = result.scenarios.customPayment;
              const colors = getScenarioColor('custom');
              const Icon = colors.icon;
              
              return (
                <div className={`${colors.bg} ${colors.border} border rounded-2xl p-6 shadow-lg`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <Icon className={`w-5 h-5 ${colors.iconColor}`} />
                    <h4 className={`font-semibold ${colors.text}`}>Tu Pago Planificado</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pago mensual:</span>
                      <span className={`font-medium ${colors.text}`}>{formatCurrency(scenario.monthlyPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Tiempo:</span>
                      <span className={`font-medium ${colors.text}`}>{scenario.totalMonths} meses</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total a pagar:</span>
                      <span className={`font-bold ${colors.text}`}>{formatCurrency(scenario.totalPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Intereses:</span>
                      <span className={`font-bold ${colors.text}`}>{formatCurrency(scenario.totalInterest)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
            {/* Escenario pago completo */}
            {(() => {
              const scenario = result.scenarios.fullPayment;
              const colors = getScenarioColor('full');
              const Icon = colors.icon;
              
              return (
                <div className={`${colors.bg} ${colors.border} border rounded-2xl p-6 shadow-lg`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <Icon className={`w-5 h-5 ${colors.iconColor}`} />
                    <h4 className={`font-semibold ${colors.text}`}>Pago Completo</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pago único:</span>
                      <span className={`font-medium ${colors.text}`}>{formatCurrency(scenario.monthlyPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Tiempo:</span>
                      <span className={`font-medium ${colors.text}`}>Inmediato</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Intereses:</span>
                      <span className={`font-bold ${colors.text}`}>$0</span>
                    </div>
                  </div>
                </div>
              );
            })()}
            {/* Comparación de ahorros */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 shadow-lg">
              <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Ahorro con tu estrategia
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ahorras en intereses:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(result.scenarios.minimumPayment.totalInterest - result.scenarios.customPayment.totalInterest)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Te liberas en:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {result.scenarios.minimumPayment.totalMonths - result.scenarios.customPayment.totalMonths} meses menos
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
