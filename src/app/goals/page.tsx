"use client";
import { useState } from 'react';
import { ModernLayout } from '@/components/layout/modern-layout';
import AddGoalForm from '@/components/goals/AddGoalForm';
import GoalsList from '@/components/goals/GoalsList';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/BackButton';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useGoals } from '@/store/selectors';
import type { Goal } from '@/store/useAppStore';
import { NotificationSystem } from '@/components/ui/toast-system';

export default function GoalsPage() {
    const goals = useGoals();
    const { addGoal, addTransaction, updateGoal, deleteGoal } = useAppStore();
    const [isFormVisible, setIsFormVisible] = useState(false);

    const handleAddGoal = (newGoal: Omit<Goal, 'id' | 'createdAt'>) => {
        addGoal({...newGoal});
        setIsFormVisible(false);
    };

    const handleAddFunds = async (goalId: string, amount: number) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        const newCurrentAmount = goal.currentAmount + amount;
        
        // No permitir sobrepasar la meta
        if (newCurrentAmount > goal.targetAmount) {
            NotificationSystem.error('No se puede exceder el monto de la meta');
            return;
        }

        try {
            // 1. Actualizar el monto de la meta
            await updateGoal(goalId, { currentAmount: newCurrentAmount });

            // 2. Crear una transacción de gasto para registrar el ahorro
            await addTransaction({
                description: `Ahorro para meta: ${goal.name}`,
                amount,
                type: 'expense',
                category: 'Ahorro a Meta',
                date: new Date().toISOString().split('T')[0]
            });

            NotificationSystem.success(`Se añadieron ${amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })} a tu meta`);
        } catch (error) {
            console.error(error);
            NotificationSystem.error('Hubo un error al añadir fondos');
        }
    };
    
    const handleUpdateGoal = async (goalId: string, data: Partial<Goal>) => {
        await updateGoal(goalId, data);
        NotificationSystem.success('Meta actualizada correctamente');
    };
    
    const handleDeleteGoal = async (goalId: string) => {
        await deleteGoal(goalId);
        NotificationSystem.success('Meta eliminada correctamente');
    };

    return (
        <ModernLayout>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="container mx-auto py-10">
                  <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-4">
                          <BackButton />
                          <h1 className="text-4xl font-bold font-headline">Metas Financieras</h1>
                      </div>
                      <Button onClick={() => setIsFormVisible(!isFormVisible)}>
                          {isFormVisible ? 'Cerrar Formulario' : 'Añadir Meta'}
                      </Button>
                  </div>
                  {isFormVisible && (
                      <motion.div 
                        className="mb-6"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                      >
                          <AddGoalForm onAddGoal={handleAddGoal} />
                      </motion.div>
                  )}
                  <GoalsList 
                    goals={goals} 
                    onAddFunds={handleAddFunds}
                    onUpdate={handleUpdateGoal}
                    onDelete={handleDeleteGoal}
                  />
              </div>
            </motion.div>
        </ModernLayout>
    );
}
