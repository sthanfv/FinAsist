"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, PiggyBank, Plus } from 'lucide-react';
import type { Goal } from '@/store/useAppStore';
import AddFundsForm from './AddFundsForm';
import EditGoalForm from './EditGoalForm';

type Props = {
  goal: Goal;
  onAddFunds: (goalId: string, amount: number) => void;
  onUpdate: (goalId: string, data: Partial<Goal>) => void;
  onDelete: (goalId: string) => void;
};

export default function GoalCard({ goal, onAddFunds, onUpdate, onDelete }: Props) {
  const [isAddFundsOpen, setAddFundsOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);

  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
  
  const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };
  
  const handleFundsAdded = (amount: number) => {
    onAddFunds(goal.id, amount);
    setAddFundsOpen(false);
  }
  
  const handleGoalUpdated = (data: Partial<Goal>) => {
    onUpdate(goal.id, data);
    setEditOpen(false);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col h-full bg-card rounded-2xl shadow-soft border border-border"
      >
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>{goal.name}</CardTitle>
            <CardDescription>
              Meta: {formatCurrency(goal.targetAmount)}
            </CardDescription>
          </div>
          <div className="flex gap-1">
             <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
                <Edit className="h-4 w-4" />
             </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente tu meta.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(goal.id)} className="bg-destructive hover:bg-destructive/90">
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(goal.currentAmount)}
            </p>
            <p className="text-sm text-muted-foreground">
              de {formatCurrency(goal.targetAmount)}
            </p>
          </div>
          
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Faltan {formatCurrency(remainingAmount)}</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <div className="text-sm text-muted-foreground w-full">
            {daysLeft > 0 ? (
              <p>🗓️ Faltan {daysLeft} días</p>
            ) : (
              <p className="text-destructive">⚠️ Plazo vencido</p>
            )}
            <p>Fecha límite: {new Date(goal.deadline).toLocaleDateString('es-CO')}</p>
          </div>
          <Button onClick={() => setAddFundsOpen(true)} className="w-full gap-2">
            <Plus className="h-4 w-4" />
            Añadir Fondos
          </Button>
        </CardFooter>
      </motion.div>
      
      <Dialog open={isAddFundsOpen} onOpenChange={setAddFundsOpen}>
        <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Fondos a "{goal.name}"</DialogTitle>
            </DialogHeader>
            <AddFundsForm onAddFunds={handleFundsAdded} />
        </DialogContent>
      </Dialog>
      
       <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
        <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Meta</DialogTitle>
            </DialogHeader>
            <EditGoalForm goal={goal} onUpdate={handleGoalUpdated} />
        </DialogContent>
      </Dialog>
    </>
  );
}
