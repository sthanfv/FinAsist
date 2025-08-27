"use client";

import { EnhancedCard } from '@/components/ui/EnhancedCard';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Goal } from '@/store/useAppStore';

type Props = {
  goal: Goal;
};

export default function GoalCard({ goal }: Props) {
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <EnhancedCard animation='slide' padding='sm' className="flex flex-col">
        <CardHeader>
            <CardTitle>{goal.name}</CardTitle>
             <CardDescription>
                {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Progress value={progress} />
        </CardContent>
        <CardFooter>
            <p className="text-sm text-muted-foreground">Fecha límite: {goal.deadline}</p>
        </CardFooter>
    </EnhancedCard>
  );
}
