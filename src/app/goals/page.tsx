"use client";
import { useState } from 'react';
import Layout from '@/components/layout';
import AddGoalForm from '@/components/goals/AddGoalForm';
import GoalsList, { Goal } from '@/components/goals/GoalsList';
import { Button } from '@/components/ui/button';

const initialGoals: Goal[] = [
    { id: 1, title: 'Ahorro Emergencia', targetAmount: 5000, savedAmount: 2000, deadline: '2025-12-31' },
    { id: 2, title: 'Viaje Vacaciones', targetAmount: 3000, savedAmount: 1000, deadline: '2025-10-15' },
    { id: 3, title: 'Nuevo Laptop', targetAmount: 4000, savedAmount: 1500, deadline: '2025-11-30' },
  ];

export default function GoalsPage() {
    const [goals, setGoals] = useState<Goal[]>(initialGoals);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const handleAddGoal = (newGoal: Omit<Goal, 'id'>) => {
        const newId = goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1;
        setGoals(prev => [{ ...newGoal, id: newId }, ...prev]);
        setIsFormVisible(false);
    };

    return (
        <Layout>
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold font-headline">Metas Financieras</h1>
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
        </Layout>
    );
}
