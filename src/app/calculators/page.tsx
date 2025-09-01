'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, CreditCard, PiggyBank, Target, DollarSign } from 'lucide-react';
import { CDTCalculator } from '@/components/calculators/CDTCalculator';
import { LoanCalculator } from '@/components/calculators/LoanCalculator';
import { CreditCardCalculator } from '@/components/calculators/CreditCardCalculator';
import { InvestmentCalculator } from '@/components/calculators/InvestmentCalculator';
import { FinancialFreedomCalculator } from '@/components/calculators/FinancialFreedomCalculator';
import BackButton from '@/components/BackButton';

type CalculatorType = 'cdt' | 'loan' | 'credit-card' | 'investment' | 'freedom' | null;
const calculatorOptions = [
  {
    id: 'cdt' as CalculatorType,
    title: 'CDT / Plazo Fijo',
    description: 'Calcula rendimientos de certificados de depósito',
    icon: PiggyBank,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800'
  },
  {
    id: 'loan' as CalculatorType,
    title: 'Préstamos',
    description: 'Simula préstamos con tabla de amortización',
    icon: Calculator,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  {
    id: 'credit-card' as CalculatorType,
    title: 'Tarjeta de Crédito',
    description: 'Compara estrategias de pago de tarjetas',
    icon: CreditCard,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800'
  },
  {
    id: 'investment' as CalculatorType,
    title: 'Inversiones',
    description: 'Proyecta crecimiento con interés compuesto',
    icon: TrendingUp,
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800'
  },
  {
    id: 'freedom' as CalculatorType,
    title: 'Libertad Financiera',
    description: 'Calcula cuándo podrás retirarte',
    icon: Target,
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50 dark:bg-violet-900/20',
    borderColor: 'border-violet-200 dark:border-violet-800'
  }
];
export default function CalculatorsPage() {
  const [selectedCalculator, setSelectedCalculator] = useState<CalculatorType>(null);
  const renderCalculator = () => {
    switch (selectedCalculator) {
      case 'cdt':
        return <CDTCalculator />;
      case 'loan':
        return <LoanCalculator />;
      case 'credit-card':
        return <CreditCardCalculator />;
      case 'investment':
        return <InvestmentCalculator />;
      case 'freedom':
        return <FinancialFreedomCalculator />;
      default:
        return null;
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
              <BackButton />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                🏦 Simulador Bancario
              </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Herramientas financieras profesionales para simular productos bancarios reales
          </p>
        </motion.div>
        {!selectedCalculator ? (
          /* Grid de calculadoras */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {calculatorOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.div
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedCalculator(option.id)}
                  className={`
                    group cursor-pointer ${option.bgColor} ${option.borderColor}
                    border rounded-2xl p-6 shadow-lg hover:shadow-xl 
                    transition-all duration-300 transform hover:scale-[1.02]
                  `}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`
                      w-12 h-12 rounded-xl bg-gradient-to-r ${option.color} 
                      flex items-center justify-center group-hover:scale-110 
                      transition-transform duration-300
                    `}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="opacity-60 group-hover:opacity-100 transition-opacity">
                      <DollarSign className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {option.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    Comenzar simulación
                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* Calculadora seleccionada */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Botón de regreso */}
            <button
              onClick={() => setSelectedCalculator(null)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Volver a calculadoras</span>
            </button>
            {/* Calculadora */}
            {renderCalculator()}
          </motion.div>
        )}
      </div>
    </div>
  );
}
