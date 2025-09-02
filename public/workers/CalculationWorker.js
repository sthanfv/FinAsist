// Web Worker para cálculos financieros pesados
class FinancialCalculationWorker {
  constructor() {
    self.onmessage = this.handleMessage.bind(this);
  }
  handleMessage(event) {
    const { type, data, id } = event.data;
    
    try {
      let result;
      
      switch (type) {
        case 'COMPLEX_ANALYSIS':
          result = this.performComplexAnalysis(data);
          break;
        case 'TREND_ANALYSIS':
          result = this.performTrendAnalysis(data);
          break;
        case 'RISK_CALCULATION':
          result = this.calculateRiskMetrics(data);
          break;
        case 'PROJECTION_ANALYSIS':
          result = this.performProjectionAnalysis(data);
          break;
        default:
          throw new Error(`Unknown calculation type: ${type}`);
      }
      
      self.postMessage({
        id,
        type: 'SUCCESS',
        result
      });
      
    } catch (error) {
      self.postMessage({
        id,
        type: 'ERROR',
        error: error.message
      });
    }
  }
  performComplexAnalysis({ transactions, goals, balance }) {
    // Análisis complejo que puede tomar tiempo
    const analysis = {
      cashFlow: this.calculateCashFlow(transactions),
      expenseBreakdown: this.analyzeExpenseBreakdown(transactions),
      savingsRate: this.calculateSavingsRate(transactions, balance),
      goalProgress: this.analyzeGoalProgress(goals),
      financialHealth: this.calculateFinancialHealth(transactions, goals, balance)
    };
    
    return analysis;
  }
  performTrendAnalysis({ transactions }) {
    const monthlyData = this.groupTransactionsByMonth(transactions);
    const trends = {};
    
    // Análisis de tendencia por categoría
    const categories = [...new Set(transactions.map(t => t.category))];
    
    categories.forEach(category => {
      const categoryTransactions = transactions.filter(t => t.category === category);
      const monthlyAmounts = this.getMonthlyAmounts(categoryTransactions);
      
      trends[category] = {
        trend: this.calculateLinearRegression(monthlyAmounts),
        volatility: this.calculateVolatility(monthlyAmounts),
        seasonality: this.detectSeasonality(monthlyAmounts)
      };
    });
    
    return trends;
  }
  calculateRiskMetrics({ transactions, balance }) {
    const incomes = transactions.filter(t => t.type === 'income').map(t => t.amount);
    const expenses = transactions.filter(t => t.type === 'expense').map(t => t.amount);
    
    return {
      incomeStability: this.calculateStability(incomes),
      expenseVolatility: this.calculateVolatility(expenses),
      burnRate: this.calculateBurnRate(expenses, balance),
      riskScore: this.calculateOverallRisk(transactions, balance),
      emergencyFundRatio: this.calculateEmergencyFundRatio(transactions, balance)
    };
  }
  performProjectionAnalysis({ transactions, goals }) {
    const projections = {
      next3Months: this.projectCashFlow(transactions, 3),
      next6Months: this.projectCashFlow(transactions, 6),
      next12Months: this.projectCashFlow(transactions, 12),
      goalAchievementDates: this.projectGoalCompletion(transactions, goals)
    };
    
    return projections;
  }
  // Funciones auxiliares optimizadas
  calculateCashFlow(transactions) {
    const monthlyData = this.groupTransactionsByMonth(transactions);
    
    return Object.entries(monthlyData).map(([month, trans]) => {
      const income = trans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = trans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      return {
        month,
        income,
        expense,
        netFlow: income - expense
      };
    });
  }
  analyzeExpenseBreakdown(transactions) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryTotals = {};
    
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    const total = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0
    })).sort((a, b) => b.amount - a.amount);
  }
  calculateSavingsRate(transactions, balance) {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    if (totalIncome === 0) return 0;
    
    const netSavings = totalIncome - totalExpense;
    return (netSavings / totalIncome) * 100;
  }
  calculateLinearRegression(values) {
    if (values.length < 2) return { slope: 0, trend: 'stable' };
    
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const xMean = x.reduce((sum, val) => sum + val, 0) / n;
    const yMean = values.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - xMean) * (values[i] - yMean);
      denominator += Math.pow(x[i] - xMean, 2);
    }
    
    const slope = denominator !== 0 ? numerator / denominator : 0;
    
    let trend = 'stable';
    if (slope > 0.1) trend = 'increasing';
    else if (slope < -0.1) trend = 'decreasing';
    
    return { slope, trend };
  }
  calculateVolatility(values) {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    
    return Math.sqrt(variance);
  }
  groupTransactionsByMonth(transactions) {
    const grouped = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      
      grouped[monthKey].push(transaction);
    });
    
    return grouped;
  }
  getMonthlyAmounts(transactions) {
    const monthly = this.groupTransactionsByMonth(transactions);
    
    return Object.values(monthly).map(monthTransactions => 
      monthTransactions.reduce((sum, t) => sum + t.amount, 0)
    );
  }
  detectSeasonality(values) {
    if (values.length < 12) return 'insufficient_data';
    
    // Simple seasonality detection
    const quarters = [];
    for (let i = 0; i < values.length; i += 3) {
      const quarter = values.slice(i, i + 3);
      if (quarter.length === 3) {
        quarters.push(quarter.reduce((sum, val) => sum + val, 0) / quarter.length);
      }
    }
    
    if (quarters.length < 4) return 'insufficient_data';
    
    const maxQuarter = Math.max(...quarters);
    const minQuarter = Math.min(...quarters);
    const variation = (maxQuarter - minQuarter) / maxQuarter;
    
    if (variation > 0.3) return 'high_seasonality';
    if (variation > 0.15) return 'moderate_seasonality';
    return 'low_seasonality';
  }
  calculateStability(values) {
    if (values.length < 3) return 0;
    
    const volatility = this.calculateVolatility(values);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    if (mean === 0) return 0;
    
    // Stability score (0-100, higher is more stable)
    const coefficientOfVariation = volatility / mean;
    return Math.max(0, 100 - (coefficientOfVariation * 100));
  }
  calculateBurnRate(expenses, balance) {
    if (expenses.length === 0) return 0;
    
    const avgMonthlyExpense = expenses.reduce((sum, amount) => sum + amount, 0) / Math.max(1, expenses.length / 30);
    
    if (avgMonthlyExpense === 0) return Infinity;
    
    return balance / avgMonthlyExpense; // Months until balance is depleted
  }
  calculateOverallRisk(transactions, balance) {
    const incomes = transactions.filter(t => t.type === 'income').map(t => t.amount);
    const expenses = transactions.filter(t => t.type === 'expense').map(t => t.amount);
    
    const incomeStability = this.calculateStability(incomes);
    const expenseVolatility = this.calculateVolatility(expenses);
    const burnRate = this.calculateBurnRate(expenses, balance);
    
    // Risk score from 0-100 (higher is riskier)
    let riskScore = 0;
    
    // Income instability increases risk
    riskScore += (100 - incomeStability) * 0.4;
    
    // High expense volatility increases risk
    const avgExpense = expenses.reduce((sum, val) => sum + val, 0) / Math.max(1, expenses.length);
    if (avgExpense > 0) {
      const expenseVolatilityRatio = (expenseVolatility / avgExpense) * 100;
      riskScore += Math.min(40, expenseVolatilityRatio * 0.3);
    }
    
    // Low burn rate (quick money depletion) increases risk
    if (burnRate < 3) riskScore += 30;
    else if (burnRate < 6) riskScore += 15;
    
    return Math.min(100, Math.max(0, riskScore));
  }
  calculateEmergencyFundRatio(transactions, balance) {
    const expenses = transactions.filter(t => t.type === 'expense').map(t => t.amount);
    const avgMonthlyExpense = expenses.length > 0 
      ? expenses.reduce((sum, amount) => sum + amount, 0) / Math.max(1, expenses.length / 30)
      : 0;
    
    if (avgMonthlyExpense === 0) return 0;
    
    return balance / avgMonthlyExpense;
  }
  projectCashFlow(transactions, monthsAhead) {
    const monthlyData = this.calculateCashFlow(transactions);
    if (monthlyData.length < 2) return [];
    
    const recentFlows = monthlyData.slice(-6).map(m => m.netFlow); // Last 6 months
    const avgFlow = recentFlows.reduce((sum, flow) => sum + flow, 0) / recentFlows.length;
    const trend = this.calculateLinearRegression(recentFlows);
    
    const projections = [];
    for (let i = 1; i <= monthsAhead; i++) {
      const projectedFlow = avgFlow + (trend.slope * i);
      projections.push({
        month: i,
        projectedCashFlow: projectedFlow,
        confidence: Math.max(0.3, 1 - (i * 0.1)) // Confidence decreases over time
      });
    }
    
    return projections;
  }
  analyzeGoalProgress(goals) {
    return goals.map(goal => {
      const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
      
      const deadline = new Date(goal.deadline);
      const now = new Date();
      const monthsLeft = Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30));
      
      const monthlyNeeded = monthsLeft > 0 ? remaining / monthsLeft : remaining;
      
      return {
        id: goal.id,
        name: goal.name,
        progress,
        remaining,
        monthsLeft,
        monthlyNeeded,
        onTrack: monthlyNeeded <= 0 || (goal.currentAmount > 0 && monthsLeft > 0)
      };
    });
  }
  projectGoalCompletion(transactions, goals) {
    const recentIncome = transactions
      .filter(t => t.type === 'income')
      .slice(-6)
      .reduce((sum, t) => sum + t.amount, 0) / 6; // Average monthly income
    
    const recentExpenses = transactions
      .filter(t => t.type === 'expense')
      .slice(-6)
      .reduce((sum, t) => sum + t.amount, 0) / 6; // Average monthly expense
    
    const monthlySavingsPotential = Math.max(0, recentIncome - recentExpenses);
    
    return goals.map(goal => {
      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
      
      if (monthlySavingsPotential <= 0 || remaining <= 0) {
        return {
          goalId: goal.id,
          projectedCompletionMonths: remaining <= 0 ? 0 : Infinity,
          projectedDate: remaining <= 0 ? new Date() : null
        };
      }
      
      const monthsToComplete = Math.ceil(remaining / monthlySavingsPotential);
      const projectedDate = new Date();
      projectedDate.setMonth(projectedDate.getMonth() + monthsToComplete);
      
      return {
        goalId: goal.id,
        projectedCompletionMonths: monthsToComplete,
        projectedDate
      };
    });
  }
  calculateFinancialHealth(transactions, goals, balance) {
    let healthScore = 50; // Base score
    
    // Balance factor (0-30 points)
    if (balance > 0) {
      const avgMonthlyExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) / Math.max(1, 
          transactions.filter(t => t.type === 'expense').length / 30
        );
      
      const emergencyMonths = avgMonthlyExpense > 0 ? balance / avgMonthlyExpense : 0;
      
      if (emergencyMonths >= 6) healthScore += 30;
      else if (emergencyMonths >= 3) healthScore += 20;
      else if (emergencyMonths >= 1) healthScore += 10;
    } else {
      healthScore -= 20; // Negative balance penalty
    }
    
    // Savings rate factor (0-25 points)
    const savingsRate = this.calculateSavingsRate(transactions, balance);
    if (savingsRate >= 20) healthScore += 25;
    else if (savingsRate >= 10) healthScore += 15;
    else if (savingsRate >= 5) healthScore += 10;
    else if (savingsRate < 0) healthScore -= 15;
    
    // Goal progress factor (0-25 points)
    if (goals.length > 0) {
      const avgProgress = goals.reduce((sum, goal) => {
        return sum + Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
      }, 0) / goals.length;
      
      healthScore += (avgProgress / 100) * 25;
    }
    
    // Income stability factor (-20 to +20 points)
    const incomes = transactions.filter(t => t.type === 'income').map(t => t.amount);
    const incomeStability = this.calculateStability(incomes);
    healthScore += ((incomeStability - 50) / 50) * 20;
    
    return Math.min(100, Math.max(0, healthScore));
  }
}
// Inicializar el worker
new FinancialCalculationWorker();