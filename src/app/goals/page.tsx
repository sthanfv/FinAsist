"use client";
import { useState } from 'react';
import Layout from '@/components/layout';
import AddGoalForm from '@/components/goals/AddGoalForm';
import GoalsList, { Goal } from '@/components/goals/GoalsList';
import { Button } from '@/components/ui/button';
import { useAppContext } from '@/context/AppContext';
import BackButton from '@/components/BackButton';

export default function GoalsPage() {
    const { goals, addGoal, loading } = useAppContext();
    const [isFormVisible, setIsFormVisible] = useState(false);

    if (loading) {
      return <Layout><div className="flex h-full items-center justify-center"><p>Cargando datos...</p></div></Layout>;
    }

    const handleAddGoal = (newGoal: Omit<Goal, 'id'>) => {
        addGoal(newGoal);
        setIsFormVisible(false);
    };

    return (
        <Layout>
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
        </Layout>
    );
}
