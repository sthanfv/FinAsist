
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from 'firebase/auth';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { NotificationSystem } from '@/components/ui/toast-system';

// Interfaces
export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
  date: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  limitAmount: number;
  spentAmount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  startDate: string;
  endDate: string;
  alertThreshold: number; // Porcentaje para alertas (ej: 80%)
  isActive: boolean;
  createdAt: string;
}

export interface BudgetAlert {
  budgetId: string;
  category: string;
  currentSpent: number;
  limitAmount: number;
  percentage: number;
  type: 'warning' | 'exceeded';
}


// State interface
interface AppState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  budgetAlerts: BudgetAlert[];
  balance: number;
  isDarkMode: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setGoals: (goals: Goal[]) => void;
  addTransaction: (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, transactionData: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addGoal: (goalData: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, goalData: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  toggleDarkMode: () => void;
  subscribeToUserData: () => () => void;
  loadGuestData: () => void;
  saveGuestData: () => void;
  
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'spentAmount'>) => Promise<void>;
  updateBudget: (budgetId: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (budgetId: string) => Promise<void>;
  calculateBudgetStatus: () => void;
  getBudgetUsage: (category: string) => number;
}


const GUEST_DATA_KEY = 'finassist_guest_data';

// Utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  }) as T;
}


export const useAppStore = create<AppState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // Auth state
        user: null,
        isLoading: true,
        isInitialized: false,
        
        // Data state
        transactions: [],
        goals: [],
        budgets: [],
        budgetAlerts: [],
        balance: 0,
        
        // UI state
        isDarkMode: false,

        // Auth actions
        setUser: (user) => set({ user }, false, 'setUser'),
        setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
        setInitialized: (initialized) => set({ isInitialized: initialized }, false, 'setInitialized'),

        // Data actions
        setTransactions: (transactions) => {
          const newBalance = transactions.reduce((sum, t) => 
            sum + (t.type === 'income' ? t.amount : -t.amount), 0
          );
          set({ transactions, balance: newBalance });
        },
        setGoals: (goals) => set({ goals }, false, 'setGoals'),
        
        addTransaction: debounce(async (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
          const { user, saveGuestData } = get();
          const newTransaction = { ...transactionData, createdAt: new Date().toISOString() };
          if (user) {
            try {
              await addDoc(collection(db, 'users', user.uid, 'transactions'), newTransaction);
            } catch (error) {
              console.error('Error adding transaction:', error);
              NotificationSystem.error('Error al agregar transacción');
            }
          } else {
            set((state) => {
              state.transactions.push({ ...newTransaction, id: `${Date.now()}` });
              state.balance = state.transactions.reduce((sum, t) => 
                sum + (t.type === 'income' ? t.amount : -t.amount), 0
              );
            }, false, 'addTransaction/local');
            saveGuestData();
          }
        }, 300),

        updateTransaction: async (id, transactionData) => {
          const { user, saveGuestData } = get();
          if (user) {
            try {
              await updateDoc(doc(db, 'users', user.uid, 'transactions', id), transactionData);
            } catch (error) {
              console.error('Error updating transaction:', error);
              NotificationSystem.error('Error al actualizar transacción');
            }
          } else {
            set((state) => {
              const index = state.transactions.findIndex(t => t.id === id);
              if (index !== -1) Object.assign(state.transactions[index], transactionData);
               state.balance = state.transactions.reduce((sum, t) => 
                sum + (t.type === 'income' ? t.amount : -t.amount), 0
              );
            }, false, 'updateTransaction/local');
            saveGuestData();
          }
        },
        deleteTransaction: async (id) => {
          const { user, saveGuestData } = get();
          if (user) {
            try {
              await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
            } catch (error) {
              console.error('Error deleting transaction:', error);
              NotificationSystem.error('Error al eliminar transacción');
            }
          } else {
            set((state) => {
              state.transactions = state.transactions.filter(t => t.id !== id);
              state.balance = state.transactions.reduce((sum, t) => 
                sum + (t.type === 'income' ? t.amount : -t.amount), 0
              );
            }, false, 'deleteTransaction/local');
            saveGuestData();
          }
        },
        addGoal: async (goalData) => {
          const { user, saveGuestData } = get();
          const newGoal = { ...goalData, id: `${Date.now()}`, createdAt: new Date().toISOString() };
          if (user) {
            try {
              await setDoc(doc(db, 'users', user.uid, 'goals', newGoal.id), newGoal);
            } catch (error) {
              console.error('Error adding goal:', error);
              NotificationSystem.error('Error al agregar meta');
            }
          } else {
            set((state) => {
              state.goals.push(newGoal);
            }, false, 'addGoal/local');
            saveGuestData();
          }
        },
        updateGoal: async (id, goalData) => {
          const { user, saveGuestData } = get();
          if (user) {
            try {
              await updateDoc(doc(db, 'users', user.uid, 'goals', id), goalData);
            } catch (error) {
              console.error('Error updating goal:', error);
              NotificationSystem.error('Error al actualizar meta');
            }
          } else {
            set((state) => {
              const index = state.goals.findIndex(g => g.id === id);
              if (index !== -1) Object.assign(state.goals[index], goalData);
            }, false, 'updateGoal/local');
            saveGuestData();
          }
        },
        deleteGoal: async (id) => {
          const { user, saveGuestData } = get();
          if (user) {
            try {
              await deleteDoc(doc(db, 'users', user.uid, 'goals', id));
            } catch (error) {
              console.error('Error deleting goal:', error);
              NotificationSystem.error('Error al eliminar meta');
            }
          } else {
            set((state) => {
              state.goals = state.goals.filter(g => g.id !== id);
            }, false, 'deleteGoal/local');
            saveGuestData();
          }
        },

        // Budget actions
        addBudget: async (budgetData) => {
          const { user, saveGuestData, calculateBudgetStatus } = get();
          const newBudget: Budget = {
            ...budgetData,
            id: `budget_${Date.now()}`,
            spentAmount: 0,
            createdAt: new Date().toISOString()
          };
          if (user) {
            try {
              await addDoc(collection(db, 'users', user.uid, 'budgets'), newBudget);
            } catch (error) {
              console.error('Error adding budget:', error);
            }
          } else {
            set((state) => {
              state.budgets.push(newBudget);
            });
            saveGuestData();
          }
          calculateBudgetStatus();
        },
        updateBudget: async (budgetId, updates) => {
          const { user, saveGuestData, calculateBudgetStatus } = get();
          if (user) {
            try {
              const budgetRef = doc(db, 'users', user.uid, 'budgets', budgetId);
              await updateDoc(budgetRef, updates);
            } catch (error) {
              console.error('Error updating budget:', error);
            }
          } else {
            set((state) => {
              const index = state.budgets.findIndex(b => b.id === budgetId);
              if (index !== -1) {
                Object.assign(state.budgets[index], updates);
              }
            });
            saveGuestData();
          }
          calculateBudgetStatus();
        },
        deleteBudget: async (budgetId) => {
            const { user, saveGuestData } = get();
            if (user) {
              try {
                await deleteDoc(doc(db, 'users', user.uid, 'budgets', budgetId));
              } catch (error) {
                console.error('Error deleting budget:', error);
                NotificationSystem.error('Error al eliminar presupuesto');
              }
            } else {
              set((state) => {
                state.budgets = state.budgets.filter(b => b.id !== budgetId);
              });
              saveGuestData();
            }
          },
        calculateBudgetStatus: () => {
          const { budgets, transactions } = get();
          const alerts: BudgetAlert[] = [];
          
          const updatedBudgets = budgets.map(budget => {
            if (!budget.isActive) return { ...budget, spentAmount: 0 };
            
            const periodTransactions = transactions.filter(t => {
              const transactionDate = new Date(t.date);
              return (
                t.type === 'expense' &&
                t.category === budget.category &&
                transactionDate >= new Date(budget.startDate) &&
                transactionDate <= new Date(budget.endDate)
              );
            });
            
            const spentAmount = periodTransactions.reduce((sum, t) => sum + t.amount, 0);
            const percentage = budget.limitAmount > 0 ? (spentAmount / budget.limitAmount) * 100 : 0;
            
            if (percentage >= 100) {
              alerts.push({
                budgetId: budget.id,
                category: budget.category,
                currentSpent: spentAmount,
                limitAmount: budget.limitAmount,
                percentage,
                type: 'exceeded'
              });
            } else if (percentage >= budget.alertThreshold) {
              alerts.push({
                budgetId: budget.id,
                category: budget.category,
                currentSpent: spentAmount,
                limitAmount: budget.limitAmount,
                percentage,
                type: 'warning'
              });
            }
            
            return { ...budget, spentAmount };
          });
          
          set({ budgets: updatedBudgets, budgetAlerts: alerts }, false, 'calculateBudgetStatus');
        },
        getBudgetUsage: (category: string) => {
          const { budgets } = get();
          const budget = budgets.find(b => b.category === category && b.isActive);
          if (!budget || budget.limitAmount === 0) return 0;
          return (budget.spentAmount / budget.limitAmount) * 100;
        },


        // UI actions
        toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode }), false, 'toggleDarkMode'),
        
        // Subscription and data handling
        subscribeToUserData: () => {
          const { user, setTransactions, setGoals } = get();
          if (!user) return () => {};

          const unsubTransactions = onSnapshot(query(collection(db, 'users', user.uid, 'transactions')), (snapshot) => {
            const transactions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Transaction);
            setTransactions(transactions);
            get().calculateBudgetStatus(); 
          }, (error) => {
            console.error("Error en snapshot de transacciones: ", error);
            NotificationSystem.error("Error al cargar transacciones");
          });

          const unsubGoals = onSnapshot(query(collection(db, 'users', user.uid, 'goals')), (snapshot) => {
            const goals = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Goal);
            setGoals(goals);
          }, (error) => {
            console.error("Error en snapshot de metas: ", error);
            NotificationSystem.error("Error al cargar metas");
          });

          const unsubBudgets = onSnapshot(query(collection(db, 'users', user.uid, 'budgets')), (snapshot) => {
            const budgets = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Budget);
            set({ budgets });
            get().calculateBudgetStatus();
          }, (error) => {
            console.error("Error en snapshot de presupuestos: ", error);
            NotificationSystem.error("Error al cargar presupuestos");
          });

          return () => {
            unsubTransactions();
            unsubGoals();
            unsubBudgets();
          };
        },

        loadGuestData: () => {
          if (typeof window === 'undefined') return;
          try {
            const saved = localStorage.getItem(GUEST_DATA_KEY);
            if (saved) {
              const { transactions = [], goals = [], budgets = [] } = JSON.parse(saved);
              get().setTransactions(transactions);
              get().setGoals(goals);
              set({ budgets });
              get().calculateBudgetStatus();
            }
          } catch (error) {
            console.error('Error loading guest data:', error);
            NotificationSystem.error('Error al cargar datos locales');
          }
        },

        saveGuestData: () => {
          if (typeof window === 'undefined') return;
          try {
            const { transactions, goals, budgets } = get();
            localStorage.setItem(GUEST_DATA_KEY, JSON.stringify({ transactions, goals, budgets }));
          } catch (error) {
            console.error('Error saving guest data:', error);
            NotificationSystem.error('Error al guardar datos locales');
          }
        },
      })),
      {
        name: 'finassist-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          transactions: state.transactions,
          goals: state.goals,
          budgets: state.budgets,
          user: state.user,
          isDarkMode: state.isDarkMode
        }),
      }
    )
  )
);
