

"use client";

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Layout from '@/components/layout';
import { ChartComponent } from '@/components/dashboard/ChartComponent';
import UnifiedAssistant from '@/components/assistant/UnifiedAssistant';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import Link from 'next/link';
import { useFinancialAnalysis } from '@/hooks/useFinancialAnalysis';
import { AlertCard } from '@/components/dashboard/AlertCard';
import { TransactionSkeleton } from '@/components/ui/loading-spinner';

export default function Dashboard() {
  const { balance, transactions, goals, isLoading } = useAppStore();
  const analysis = useFinancialAnalysis();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const chartData = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
          const existing = acc.find(item => item.name === t.category);
          if (existing) {
              existing.amount += t.amount;
          } else {
              acc.push({ name: t.category, amount: t.amount });
          }
          return acc;
      }, [] as { name: string; amount: number }[]);
  }, [transactions]);


  const totalGoalsAmount = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalGoalsSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  
  const mainAlert = analysis?.alerts?.[0];

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {isLoading ? (
          <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
            </div>
            <TransactionSkeleton />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
              <h1 className="text-4xl font-bold font-headline">Dashboard</h1>
              <div className="flex gap-2">
                <Link href="/transactions" passHref>
                   <button className="group relative bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-500/20">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Añadir Transacción</span>
                    </div>
                    <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </Link>
                <Dialog open={isAssistantOpen} onOpenChange={setIsAssistantOpen}>
                  <DialogTrigger asChild>
                    <button className="group relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-purple-500/20">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Asistente IA</span>
                      </div>
                      <div className="absolute inset-0 bg-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="text-primary"/>
                        Asistente IA
                      </DialogTitle>
                      <DialogDescription>
                        Obtén recomendaciones simples o avanzadas basadas en tus datos.
                      </DialogDescription>
                    </DialogHeader>
                    <UnifiedAssistant 
                      balance={balance} 
                      transactions={transactions} 
                      goals={goals} 
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <div className="mb-6">
              {mainAlert && (
                 <AlertCard 
                    type={mainAlert.type}
                    title={mainAlert.title}
                    message={mainAlert.message}
                />
              )}
               <UnifiedAssistant 
                balance={balance} 
                transactions={transactions} 
                goals={goals}
                isGlobal
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 tracking-wide">
                    SALDO PRINCIPAL
                  </h3>
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 tracking-tight">
                  {balance.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Actualizado hace un momento
                </div>
              </div>
              <div className="group bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 tracking-wide">
                    TOTAL AHORRADO EN METAS
                  </h3>
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mb-1 tracking-tight">
                  {totalGoalsSaved.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                </div>
                <div className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  {totalGoalsAmount > 0 ? ((totalGoalsSaved / totalGoalsAmount) * 100).toFixed(0) : '0'}% de la meta total
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-card shadow-soft p-6 rounded-xl">
                <h2 className="text-lg font-semibold text-card-foreground mb-4">Gastos por categoría</h2>
                <ChartComponent type="bar" data={chartData} dataKey="amount" xAxisKey="name" config={{amount: {label: 'Gasto', color: 'hsl(var(--primary))'}}}/>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </Layout>
  );
}
