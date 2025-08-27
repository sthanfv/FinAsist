"use client";

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Goal } from './GoalsList';

type Props = {
  goal: Goal;
};

export default function GoalCard({ goal }: Props) {
  const progress = Math.min((goal.savedAmount / goal.targetAmount) * 100, 100);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <Card className="shadow-soft rounded-xl flex flex-col">
        <CardHeader>
            <CardTitle>{goal.title}</CardTitle>
             <CardDescription>
                {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Progress value={progress} />
        </CardContent>
        <CardFooter>
            <p className="text-sm text-muted-foreground">Fecha límite: {goal.deadline}</p>
        </CardFooter>
    </Card>
  );
}
