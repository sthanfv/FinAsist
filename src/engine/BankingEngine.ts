// Interfaces para productos bancarios
export interface CDTCalculation {
  principal: number;
  interestRate: number; // Anual en porcentaje
  termMonths: number;
  finalAmount: number;
  totalInterest: number;
  monthlyInterest: number;
  effectiveRate: number;
}
export interface LoanCalculation {
  principal: number;
  interestRate: number; // Anual en porcentaje
  termMonths: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  amortizationTable: AmortizationEntry[];
}
export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}
export interface CreditCardSimulation {
  balance: number;
  interestRate: number; // Anual en porcentaje
  minimumPaymentRate: number; // Porcentaje del saldo
  scenarios: {
    minimumPayment: PaymentScenario;
    customPayment: PaymentScenario;
    fullPayment: PaymentScenario;
  };
}
export interface PaymentScenario {
  monthlyPayment: number;
  totalMonths: number;
  totalPayment: number;
  totalInterest: number;
  breakdown: CreditCardEntry[];
}
export interface CreditCardEntry {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}
export interface InvestmentProjection {
  initialAmount: number;
  monthlyContribution: number;
  annualReturn: number;
  years: number;
  finalAmount: number;
  totalContributions: number;
  totalReturns: number;
  yearlyBreakdown: InvestmentYear[];
}
export interface InvestmentYear {
  year: number;
  startBalance: number;
  contributions: number;
  returns: number;
  endBalance: number;
}
class BankingEngine {
  
  // CALCULADORA DE CDT (Certificado de Depósito a Término)
  calculateCDT(principal: number, annualRate: number, months: number): CDTCalculation {
    // Validaciones
    if (principal <= 0 || annualRate < 0 || months <= 0) {
      throw new Error('Valores inválidos para el CDT');
    }
    const monthlyRate = annualRate / 100 / 12;
    const finalAmount = principal * Math.pow(1 + monthlyRate, months);
    const totalInterest = finalAmount - principal;
    const monthlyInterest = totalInterest / months;
    
    // Tasa efectiva anual
    const effectiveRate = (Math.pow(1 + monthlyRate, 12) - 1) * 100;
    return {
      principal,
      interestRate: annualRate,
      termMonths: months,
      finalAmount,
      totalInterest,
      monthlyInterest,
      effectiveRate,
    };
  }
  // CALCULADORA DE PRÉSTAMOS CON TABLA DE AMORTIZACIÓN
  calculateLoan(principal: number, annualRate: number, months: number): LoanCalculation {
    if (principal <= 0 || annualRate < 0 || months <= 0) {
      throw new Error('Valores inválidos para el préstamo');
    }
    const monthlyRate = annualRate / 100 / 12;
    
    // Fórmula de cuota fija (sistema francés)
    const monthlyPayment = monthlyRate === 0 
      ? principal / months 
      : principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
        (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = monthlyPayment * months;
    const totalInterest = totalPayment - principal;
    // Generar tabla de amortización
    const amortizationTable: AmortizationEntry[] = [];
    let balance = principal;
    for (let month = 1; month <= months; month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      amortizationTable.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance), // Evitar negativos por redondeo
      });
    }
    return {
      principal,
      interestRate: annualRate,
      termMonths: months,
      monthlyPayment,
      totalPayment,
      totalInterest,
      amortizationTable,
    };
  }
  // SIMULADOR DE TARJETA DE CRÉDITO
  simulateCreditCard(
    balance: number, 
    annualRate: number, 
    minimumRate: number = 2,
    customPayment?: number
  ): CreditCardSimulation {
    if (balance <= 0 || annualRate < 0) {
      throw new Error('Valores inválidos para tarjeta de crédito');
    }
    const monthlyRate = annualRate / 100 / 12;
    const minimumPayment = Math.max(balance * (minimumRate / 100), 25); // Mínimo $25
    // Escenario 1: Pago mínimo
    const minimumScenario = this.calculateCreditCardScenario(
      balance, monthlyRate, minimumPayment, minimumRate
    );
    // Escenario 2: Pago personalizado
    const customAmount = customPayment || balance * 0.05; // 5% por defecto
    const customScenario = this.calculateCreditCardScenario(
      balance, monthlyRate, Math.max(customAmount, minimumPayment)
    );
    // Escenario 3: Pago total (1 cuota)
    const fullScenario: PaymentScenario = {
      monthlyPayment: balance,
      totalMonths: 1,
      totalPayment: balance,
      totalInterest: 0,
      breakdown: [{
        month: 1,
        payment: balance,
        interest: 0,
        principal: balance,
        balance: 0,
      }],
    };
    return {
      balance,
      interestRate: annualRate,
      minimumPaymentRate: minimumRate,
      scenarios: {
        minimumPayment: minimumScenario,
        customPayment: customScenario,
        fullPayment: fullScenario,
      },
    };
  }
  private calculateCreditCardScenario(
    initialBalance: number, 
    monthlyRate: number, 
    payment: number, 
    minimumRate?: number
  ): PaymentScenario {
    const breakdown: CreditCardEntry[] = [];
    let balance = initialBalance;
    let month = 0;
    const maxMonths = 600; // Límite de seguridad (50 años)
    while (balance > 0.01 && month < maxMonths) {
      month++;
      const interestCharge = balance * monthlyRate;
      
      // Ajustar pago si es menor al mínimo dinámico
      let currentPayment = payment;
      if (minimumRate) {
        const dynamicMinimum = Math.max(balance * (minimumRate / 100), 25);
        currentPayment = Math.max(payment, dynamicMinimum);
      }
      // El pago no puede ser mayor al saldo + intereses
      currentPayment = Math.min(currentPayment, balance + interestCharge);
      
      const principalPayment = currentPayment - interestCharge;
      balance -= principalPayment;
      breakdown.push({
        month,
        payment: currentPayment,
        interest: interestCharge,
        principal: principalPayment,
        balance: Math.max(0, balance),
      });
      // Si el saldo es muy pequeño, liquidar
      if (balance < 1) break;
    }
    const totalPayment = breakdown.reduce((sum, entry) => sum + entry.payment, 0);
    const totalInterest = breakdown.reduce((sum, entry) => sum + entry.interest, 0);
    return {
      monthlyPayment: payment,
      totalMonths: month,
      totalPayment,
      totalInterest,
      breakdown,
    };
  }
  // SIMULADOR DE INVERSIONES CON INTERÉS COMPUESTO
  calculateInvestment(
    initialAmount: number,
    monthlyContribution: number,
    annualReturn: number,
    years: number
  ): InvestmentProjection {
    if (initialAmount < 0 || monthlyContribution < 0 || years <= 0) {
      throw new Error('Valores inválidos para inversión');
    }
    const monthlyReturn = annualReturn / 100 / 12;
    const totalMonths = years * 12;
    let balance = initialAmount;
    const yearlyBreakdown: InvestmentYear[] = [];
    for (let year = 1; year <= years; year++) {
      const startBalance = balance;
      const yearContributions = monthlyContribution * 12;
      let yearReturns = 0;
      // Calcular mes a mes para este año
      for (let month = 1; month <= 12; month++) {
        const monthReturns = balance * monthlyReturn;
        yearReturns += monthReturns;
        balance += monthReturns + monthlyContribution;
      }
      yearlyBreakdown.push({
        year,
        startBalance,
        contributions: yearContributions,
        returns: yearReturns,
        endBalance: balance,
      });
    }
    const totalContributions = initialAmount + (monthlyContribution * totalMonths);
    const totalReturns = balance - totalContributions;
    return {
      initialAmount,
      monthlyContribution,
      annualReturn,
      years,
      finalAmount: balance,
      totalContributions,
      totalReturns,
      yearlyBreakdown,
    };
  }
  // CALCULADORA DE LIBERTAD FINANCIERA
  calculateFinancialFreedom(
    currentSavings: number,
    monthlyExpenses: number,
    monthlySavings: number,
    expectedReturn: number = 4 // Retorno conservador 4%
  ) {
    // Regla del 4%: necesitas 25 veces tus gastos anuales
    const targetAmount = monthlyExpenses * 12 * 25;
    const remainingAmount = Math.max(0, targetAmount - currentSavings);
    
    if (monthlySavings <= 0) {
      return {
        targetAmount,
        remainingAmount,
        monthsToFreedom: Infinity,
        yearsToFreedom: Infinity,
        message: 'Necesitas ahorrar mensualmente para alcanzar la libertad financiera'
      };
    }
    // Calcular tiempo con interés compuesto
    const monthlyReturn = expectedReturn / 100 / 12;
    
    // Fórmula para anualidades con valor presente
    const months = Math.log(1 + (remainingAmount * monthlyReturn) / monthlySavings) / 
                   Math.log(1 + monthlyReturn);
    return {
      targetAmount,
      remainingAmount,
      monthsToFreedom: Math.ceil(months),
      yearsToFreedom: Math.ceil(months / 12),
      monthlyExpenses,
      monthlySavings,
      expectedReturn,
    };
  }
}
// Singleton del motor bancario
export const bankingEngine = new BankingEngine();
