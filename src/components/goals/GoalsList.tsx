"use client";
import GoalCard from './GoalCard';

export type Goal = {
  id: number;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
};

type Props = {
  goals: Goal[];
};

export default function GoalsList({ goals }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}
