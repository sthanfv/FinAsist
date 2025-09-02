'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { useSmartCategorization } from '@/hooks/useSmartCategorization';
import { useAppStore } from '@/store/useAppStore';

type Props = {
  onTransactionAdded: () => void;
};

export const EnhancedTransactionForm = ({ onTransactionAdded }: Props) => {
  const { addTransaction, getBudgetUsage } = useAppStore();
  const { suggestCategory, isLoading } = useSmartCategorization();
  
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category: '',
    type: 'expense' as const,
    date: new Date().toISOString().split('T')[0]
  });
  
  const [suggestion, setSuggestion] = useState<any>(null);
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);
  
  // Sugerir categoría automáticamente cuando cambia la descripción
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.description.length > 3 && formData.amount > 0) {
        const result = await suggestCategory(formData.description, formData.amount);
        if(result && result.confidence > 0.7) {
          setSuggestion(result);
        }
      }
    }, 1000); // Debounce de 1 segundo
    return () => clearTimeout(timer);
  }, [formData.description, formData.amount, suggestCategory]);

  // Verificar impacto en presupuesto
  useEffect(() => {
    if (formData.category && formData.type === 'expense' && formData.amount > 0) {
      const budgetInfo = getBudgetUsage(formData.category);
      if(budgetInfo) {
        const newSpent = budgetInfo.spentAmount + formData.amount;
        const newPercentage = (newSpent / budgetInfo.limitAmount) * 100;
        setShowBudgetWarning(newPercentage > budgetInfo.alertThreshold);
      } else {
        setShowBudgetWarning(false);
      }
    } else {
        setShowBudgetWarning(false);
    }
  }, [formData.category, formData.amount, formData.type, getBudgetUsage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTransaction(formData);
    
    // Reset form
    setFormData({
      description: '',
      amount: 0,
      category: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    });
    setSuggestion(null);
    setShowBudgetWarning(false);
    onTransactionAdded(); // Cerrar modal
  };
  const applySuggestion = () => {
    if(suggestion) {
      setFormData(prev => ({ ...prev, category: suggestion.category }));
      setSuggestion(null);
    }
  };
  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>Agregar Transacción</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Descripción</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                placeholder="Ej: Almuerzo en restaurante"
              />
            </div>
            <div>
              <Label>Monto</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({
                  ...prev, 
                  amount: parseFloat(e.target.value) || 0
                }))}
                placeholder="25000"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Categoría</Label>
              <div className="space-y-2">
                <Select 
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({...prev, category: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Alimentación', 'Transporte', 'Entretenimiento', 'Salud',
                      'Educación', 'Servicios', 'Compras', 'Otros'].map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Sugerencia de IA */}
                {suggestion && suggestion.category !== formData.category && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Sugerencia: <strong>{suggestion.category}</strong>
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={applySuggestion}
                      disabled={isLoading}
                      className="ml-auto"
                    >
                      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Aplicar'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select 
                value={formData.type}
                onValueChange={(value: 'income' | 'expense') => 
                  setFormData(prev => ({...prev, type: value}))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Ingreso</SelectItem>
                  <SelectItem value="expense">Gasto</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label>Fecha</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
              />
            </div>
          </div>
          {/* Advertencia de presupuesto */}
          {showBudgetWarning && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  Esta transacción podría exceder tu presupuesto para {formData.category}
                </span>
              </div>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={!formData.description || formData.amount <= 0 || !formData.category}>
            Agregar Transacción
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
