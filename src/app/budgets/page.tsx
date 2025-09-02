
"use client";
import Layout from '@/components/layout';
import BackButton from '@/components/BackButton';
import { motion } from 'framer-motion';
import { BudgetManager } from '@/components/budgets/BudgetManager';

export default function BudgetsPage() {
    return (
        <Layout>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="container mx-auto py-10">
                  <div className="flex items-center gap-4 mb-8">
                      <BackButton />
                      <h1 className="text-4xl font-bold font-headline">Gestión de Presupuestos</h1>
                  </div>
                  
                  <BudgetManager />

              </div>
            </motion.div>
        </Layout>
    );
}
