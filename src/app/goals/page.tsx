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

export default function GoalsPage() {
    const goals = useGoals();
    const addGoal = useAppStore(state => state.addGoal);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const handleAddGoal = (newGoal: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => {
        addGoal({...newGoal, currentAmount: 0});
        setIsFormVisible(false);
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
                      <div className="mb-6">
                          <AddGoalForm onAddGoal={handleAddGoal} />
                      </div>
                  )}
                  <GoalsList goals={goals} />
              </div>
            </motion.div>
        </ModernLayout>
    );
}
