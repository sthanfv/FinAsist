"use client";
import GoalCard from './GoalCard';
import type { Goal } from '@/store/useAppStore';

type Props = {
  goals: Goal[];
  onAddFunds: (goalId: string, amount: number) => void;
  onUpdate: (goalId: string, data: Partial<Goal>) => void;
  onDelete: (goalId: string) => void;
};

export default function GoalsList({ goals, onAddFunds, onUpdate, onDelete }: Props) {
  if (goals.length === 0) {
    return (
      <div className="text-center py-10 bg-card rounded-xl shadow-soft">
        <p className="text-muted-foreground mb-4">Aún no tienes metas financieras.</p>
        <p className="text-sm text-muted-foreground">¡Crea tu primera meta para empezar a ahorrar!</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map((goal) => (
        <GoalCard 
            key={goal.id} 
            goal={goal} 
            onAddFunds={onAddFunds} 
            onUpdate={onUpdate}
            onDelete={onDelete}
        />
      ))}
    </div>
  );
}
