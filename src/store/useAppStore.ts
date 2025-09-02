
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
import { AICategorizer, type CategorySuggestion } from '@/services/aiCategorizer';

// Interfaces
export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
  date: string;
  createdAt: string;
  // NUEVOS CAMPOS PARA IA
  aiSuggestion?: {
    category: string;
    confidence: number;
    reasoning: string;
    isAccepted: boolean;
  };
  isAiCategorized?: boolean;
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
  setGoals: (goals) => void;
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
  getBudgetUsage: (category: string) => Budget | undefined;

  // Acciones de IA
  categorizeTransactionWithAI: (transactionId: string) => Promise<void>;
  acceptAISuggestion: (transactionId: string) => void;
  rejectAISuggestion: (transactionId: string) => void;
}


const GUEST_DATA_KEY = 'finassist_guest_data';

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
          get().calculateBudgetStatus();
        },
        setGoals: (goals) => set({ goals }, false, 'setGoals'),
        
        addTransaction: async (transactionData) => {
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
            });
            saveGuestData();
          }
          get().calculateBudgetStatus();
        },

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
            });
            saveGuestData();
          }
          get().calculateBudgetStatus();
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
            });
            saveGuestData();
          }
          get().calculateBudgetStatus();
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
        categorizeTransactionWithAI: async (transactionId: string) => {
          const { transactions, updateTransaction } = get();
          const transaction = transactions.find(t => t.id === transactionId);
          
          if (!transaction) return;
          try {
            const suggestion = await AICategorizer.categorizeTransaction(
              transaction.description, 
              transaction.amount
            );
            
            const updatedFields = { 
              aiSuggestion: {
                ...suggestion,
                isAccepted: false
              },
              isAiCategorized: true
            };

            await updateTransaction(transactionId, updatedFields);
            
          } catch (error) {
            console.error('Error categorizing transaction:', error);
          }
        },
        acceptAISuggestion: (transactionId: string) => {
          const { transactions, updateTransaction } = get();
          const transaction = transactions.find(t => t.id === transactionId);

          if(transaction && transaction.aiSuggestion){
              const updatedFields = { 
                category: transaction.aiSuggestion.category,
                aiSuggestion: {
                  ...transaction.aiSuggestion,
                  isAccepted: true
                }
              };
              updateTransaction(transactionId, updatedFields);
          }
        },
        rejectAISuggestion: (transactionId: string) => {
          const { transactions, updateTransaction } = get();
          const transaction = transactions.find(t => t.id === transactionId);

          if(transaction && transaction.aiSuggestion){
            const updatedFields = {
                aiSuggestion: undefined,
                isAiCategorized: false
            };
            // Firestore no permite 'undefined', así que necesitaríamos eliminar el campo.
            // Para simplicidad en el estado local, lo ponemos como undefined.
            // La lógica de persistencia debe manejar la eliminación del campo.
             set((state) => {
              const index = state.transactions.findIndex(t => t.id === transactionId);
              if (index !== -1) {
                delete state.transactions[index].aiSuggestion;
                state.transactions[index].isAiCategorized = false;
              }
            });
            const { user } = get();
            if (user) {
              // Aquí iría la lógica para eliminar el campo en Firebase.
              // updateDoc(doc(db, 'users', user.uid, 'transactions', transactionId), {
              //   aiSuggestion: deleteField()
              // });
            }
          }
        },
        // Budget actions
        addBudget: async (budgetData) => {
          const { user, saveGuestData } = get();
          const newBudget: Omit<Budget, 'id'> = {
            ...budgetData,
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
              state.budgets.push({ ...newBudget, id: `budget_${Date.now()}` });
            });
            saveGuestData();
          }
          get().calculateBudgetStatus();
        },
        updateBudget: async (budgetId, updates) => {
          const { user, saveGuestData } = get();
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
          get().calculateBudgetStatus();
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
              // Lógica de fecha simple (mensual por ahora)
              const budgetStartDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

              return (
                t.type === 'expense' &&
                t.category === budget.category &&
                transactionDate >= budgetStartDate
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

        getBudgetUsage: (category) => {
          const { budgets } = get();
          return budgets.find(b => b.category === category && b.isActive);
        },

        // UI actions
        toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode }), false, 'toggleDarkMode'),
        
        // Subscription and data handling
        subscribeToUserData: () => {
          const { user } = get();
          if (!user) return () => {};

          const unsubTransactions = onSnapshot(query(collection(db, 'users', user.uid, 'transactions')), (snapshot) => {
            const transactions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Transaction);
            get().setTransactions(transactions);
          }, (error) => {
            console.error("Error en snapshot de transacciones: ", error);
            NotificationSystem.error("Error al cargar transacciones");
          });

          const unsubGoals = onSnapshot(query(collection(db, 'users', user.uid, 'goals')), (snapshot) => {
            const goals = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Goal);
            set({ goals });
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
              set({ goals, budgets });
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

    