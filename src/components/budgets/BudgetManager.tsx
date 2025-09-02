
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, AlertTriangle, Landmark } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Budget, BudgetAlert } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export function BudgetManager() {
  const { budgets, budgetAlerts, addBudget, updateBudget, deleteBudget } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    limitAmount: 0,
    period: 'monthly' as const,
    alertThreshold: 80
  });
  
  const categories = [
    'Alimentación', 'Transporte', 'Entretenimiento', 'Salud',
    'Educación', 'Servicios', 'Compras', 'Otros'
  ];

  const handleEditClick = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      limitAmount: budget.limitAmount,
      period: budget.period,
      alertThreshold: budget.alertThreshold
    });
    setShowForm(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const budgetData = {
      ...formData,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
      isActive: true
    };

    if (editingBudget) {
      await updateBudget(editingBudget.id, budgetData);
      setEditingBudget(null);
    } else {
      await addBudget(budgetData);
    }

    setFormData({ category: '', limitAmount: 0, period: 'monthly', alertThreshold: 80 });
    setShowForm(false);
  };

  const getBudgetStatus = (budget: Budget) => {
    if (budget.limitAmount === 0) return { status: 'good', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100 dark:bg-gray-800' };
    const percentage = (budget.spentAmount / budget.limitAmount) * 100;
    if (percentage >= 100) return { status: 'exceeded', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/20' };
    if (percentage >= budget.alertThreshold) return { status: 'warning', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' };
    return { status: 'good', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/20' };
  };

  return (
    <div className="space-y-6">
      {/* Alertas de presupuesto */}
      {budgetAlerts.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Presupuesto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {budgetAlerts.map(alert => (
                <div key={alert.budgetId} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{alert.category}</p>
                    <p className="text-sm text-muted-foreground">
                      ${alert.currentSpent.toLocaleString()} de ${alert.limitAmount.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={alert.type === 'exceeded' ? 'destructive' : 'secondary'}>
                    {alert.percentage.toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header con botón de agregar */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Mis Presupuestos</h2>
        <Button onClick={() => { setShowForm(true); setEditingBudget(null); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Presupuesto
        </Button>
      </div>

      {/* Formulario de presupuesto */}
      {(showForm) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingBudget ? 'Editar Presupuesto' : 'Crear Nuevo Presupuesto'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Categoría</Label>
                  <Select 
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Límite Mensual</Label>
                  <Input
                    type="number"
                    value={formData.limitAmount}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      limitAmount: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="500000"
                    required
                  />
                </div>
                <div>
                  <Label>Período</Label>
                  <Select 
                    value={formData.period}
                    onValueChange={(value: 'monthly' | 'weekly' | 'yearly') => 
                      setFormData(prev => ({...prev, period: value}))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Alerta en % ({formData.alertThreshold}%)</Label>
                  <Input
                    type="range"
                    min="50"
                    max="95"
                    step="5"
                    value={formData.alertThreshold}
                    onChange={(e) => setFormData(prev => ({
                      ...prev, 
                      alertThreshold: parseInt(e.target.value)
                    }))}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingBudget ? 'Actualizar' : 'Crear'} Presupuesto
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingBudget(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de presupuestos activos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.filter(b => b.isActive).map(budget => {
          const status = getBudgetStatus(budget);
          const percentage = budget.limitAmount > 0 ? (budget.spentAmount / budget.limitAmount) * 100 : 0;
          
          return (
            <Card key={budget.id} className={cn("relative transition-all", status.bgColor)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{budget.category}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(budget)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteBudget(budget.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Gastado</span>
                    <span className={cn("font-medium", status.color)}>
                      ${budget.spentAmount.toLocaleString()}
                    </span>
                  </div>
                  
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2"
                  />
                  
                  <div className="flex justify-between text-sm">
                    <span>Límite: ${budget.limitAmount.toLocaleString()}</span>
                    <span className={cn("font-medium", status.color)}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Restante: ${(budget.limitAmount - budget.spentAmount).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
