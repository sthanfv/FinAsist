'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FinancialEngine, FinancialScenario, ScenarioResult } from '@/engine/FinancialEngine';
import { useTransactions } from '@/store/selectors';
import { PlusCircle } from 'lucide-react';

export const ScenarioSimulator = () => {
  const transactions = useTransactions();
  const [scenarios, setScenarios] = useState<FinancialScenario[]>([]);
  const [results, setResults] = useState<ScenarioResult[]>([]);
  const [newScenario, setNewScenario] = useState<Omit<FinancialScenario, 'id'>>({
    name: '',
    type: 'reduce_spending',
    category: '',
    percentageChange: 0,
    duration: 6
  });

  const predefinedScenarios: FinancialScenario[] = [
    {
      name: 'Reducir entretenimiento 30%',
      type: 'reduce_spending',
      category: 'Entretenimiento',
      percentageChange: -30,
      duration: 6
    },
    {
      name: 'Aumentar ingresos 15%',
      type: 'increase_income',
      category: 'all',
      percentageChange: 15,
      duration: 12
    },
    {
      name: 'Optimizar gastos variables',
      type: 'optimize_spending',
      category: 'all',
      percentageChange: -10,
      duration: 3
    }
  ];

  const runSimulation = () => {
    if (transactions.length === 0) return;
    const allScenarios = [...predefinedScenarios, ...scenarios];
    const simulationResults = FinancialEngine.simulateFinancialScenarios(
      transactions,
      allScenarios
    );
    setResults(simulationResults);
  };

  const addCustomScenario = () => {
    if (!newScenario.name) return;
    
    setScenarios(prev => [...prev, {
      ...newScenario,
      id: Date.now().toString()
    }]);
    
    setNewScenario({
      name: '',
      type: 'reduce_spending',
      category: '',
      percentageChange: 0,
      duration: 6
    });
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Simulador de Escenarios Financieros</CardTitle>
          <p className="text-sm text-muted-foreground">
            Explora cómo diferentes cambios afectarían tu situación financiera
          </p>
        </CardHeader>
        <CardContent>
          {/* Form para crear escenario personalizado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4 items-end">
            <div>
              <Label htmlFor="scenarioName">Nombre del Escenario</Label>
              <Input
                id="scenarioName"
                value={newScenario.name}
                onChange={(e) => setNewScenario(prev => ({...prev, name: e.target.value}))}
                placeholder="Ej: Nuevo trabajo"
              />
            </div>
            
            <div>
              <Label htmlFor="scenarioType">Tipo</Label>
              <Select 
                value={newScenario.type}
                onValueChange={(value: any) => setNewScenario(prev => ({...prev, type: value}))}
              >
                <SelectTrigger id="scenarioType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reduce_spending">Reducir Gastos</SelectItem>
                  <SelectItem value="increase_income">Aumentar Ingresos</SelectItem>
                  <SelectItem value="optimize_spending">Optimizar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="scenarioChange">Cambio %</Label>
              <Input
                id="scenarioChange"
                type="number"
                value={newScenario.percentageChange}
                onChange={(e) => setNewScenario(prev => ({
                  ...prev, 
                  percentageChange: parseFloat(e.target.value) || 0
                }))}
                placeholder="15"
              />
            </div>
            <div>
              <Label htmlFor="scenarioDuration">Duración (meses)</Label>
              <Input
                id="scenarioDuration"
                type="number"
                value={newScenario.duration}
                onChange={(e) => setNewScenario(prev => ({
                  ...prev, 
                  duration: parseInt(e.target.value) || 6
                }))}
                placeholder="6"
              />
            </div>
            
            <Button onClick={addCustomScenario} className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar
            </Button>
            
          </div>
          <Button onClick={runSimulation} className="w-full mb-6">
            Ejecutar Simulación
          </Button>
          {/* Resultados */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resultados de la Simulación</h3>
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{result.scenario}</h4>
                    <Badge variant={result.riskAssessment === 'low' ? 'default' : 
                                  result.riskAssessment === 'medium' ? 'secondary' : 'destructive'}>
                      {result.riskAssessment} riesgo
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Cambio en Ahorro</p>
                      <p className={`font-bold ${result.impact.savingsRateChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.impact.savingsRateChange > 0 ? '+' : ''}
                        {(result.impact.savingsRateChange * 100).toFixed(1)}%
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Impacto en Balance</p>
                      <p className={`font-bold ${result.impact.balanceChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.impact.balanceChange > 0 ? '+' : ''}
                        {formatCurrency(result.impact.balanceChange)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-muted-foreground">Factibilidad</p>
                      <Badge variant="outline">
                        {result.feasibility}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
