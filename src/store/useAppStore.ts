
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  setDoc,
  deleteField,
  type Unsubscribe
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { toast } from 'sonner';

// Interfaces corregidas
export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
  date: string;
  createdAt: string;
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
  alertThreshold: number;
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

// State interface corregida
interface AppState {
  // Auth
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Data
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  budgetAlerts: BudgetAlert[];
  balance: number;
  
  // UI
  isDarkMode: boolean;

  // Auth actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => Promise<void>;
  initializeAuthListener: () => Unsubscribe;
  
  // Data actions
  setTransactions: (transactions: Transaction[]) => void;
  setGoals: (goals: Goal[]) => void;
  setBudgets: (budgets: Budget[]) => void;
  
  // Transaction actions
  addTransaction: (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, transactionData: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  // Goal actions
  addGoal: (goalData: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, goalData: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  // Budget actions
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'spentAmount'>) => Promise<void>;
  updateBudget: (budgetId: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (budgetId: string) => Promise<void>;
  calculateBudgetStatus: () => void;
  getBudgetUsage: (category: string) => Budget | undefined;
  
  // AI actions
  categorizeTransactionWithAI: (transactionId: string) => Promise<void>;
  acceptAISuggestion: (transactionId: string) => void;
  rejectAISuggestion: (transactionId: string) => void;
  
  // System actions
  toggleDarkMode: () => void;
  subscribeToUserData: () => Unsubscribe;
  loadGuestData: () => void;
  saveGuestData: () => void;
}


const GUEST_DATA_KEY = 'finassist_guest_data';

export const useAppStore = create<AppState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // Estado inicial
        user: null,
        isLoading: true,
        isInitialized: false,
        transactions: [],
        goals: [],
        budgets: [],
        budgetAlerts: [],
        balance: 0,
        isDarkMode: false,

        // Auth actions
        setUser: (user) => set((state) => { 
          state.user = user; 
        }),
        setLoading: (loading) => set((state) => { state.isLoading = loading; }),
        setInitialized: (initialized) => set((state) => { state.isInitialized = initialized; }),
        logout: async () => {
          try {
            await signOut(auth);
            set(state => {
              state.user = null;
              state.transactions = [];
              state.goals = [];
              state.budgets = [];
              state.balance = 0;
              state.isInitialized = false; // Force re-initialization for next user
            });
            localStorage.removeItem(GUEST_DATA_KEY);
            toast.success('Has cerrado sesión correctamente');
          } catch(error) {
            console.error("Error al cerrar sesión", error);
            toast.error('Hubo un problema al cerrar sesión');
          }
        },
        initializeAuthListener: () => {
          const { setUser, setLoading, subscribeToUserData, loadGuestData, setInitialized } = get();
          
          setLoading(true);
          
          return onAuthStateChanged(auth, async (user) => {
            console.log('🔥 Auth state changed:', user ? 'User logged in' : 'No user');
            
            try {
              // MEJORA: Si hay un usuario, refrescar su información
              if (user) {
                console.log('🔄 Refreshing user data...');
                await user.reload(); // Esto actualiza emailVerified
                
                // Actualizar el usuario en el estado después del reload
                const refreshedUser = auth.currentUser;
                setUser(refreshedUser);
                
                console.log('📧 Email verified:', refreshedUser?.emailVerified);
                
                if (refreshedUser) {
                  subscribeToUserData();
                }
              } else {
                setUser(null);
                loadGuestData();
              }
              
              setInitialized(true);
              setLoading(false);
              
              console.log('✅ Auth initialization completed');
              
            } catch (error) {
              console.error('❌ Auth initialization error:', error);
              setLoading(false);
              setInitialized(true);
            }
          });
        },

        // Data setters
        setTransactions: (transactions) => set((state) => {
          state.transactions = transactions;
          state.balance = transactions.reduce((sum, t) => 
            sum + (t.type === 'income' ? t.amount : -t.amount), 0
          );
        }),
        setGoals: (goals) => set((state) => { state.goals = goals; }),
        setBudgets: (budgets) => set((state) => { state.budgets = budgets; }),

        // Transaction actions
        addTransaction: async (transactionData) => {
          const { user, saveGuestData, calculateBudgetStatus } = get();
          const newTransaction = { 
            ...transactionData, 
            createdAt: new Date().toISOString() 
          };
          
          if (user) {
            try {
              if(!user.emailVerified) {
                 toast.error('Debes verificar tu email para añadir transacciones.');
                 return;
              }
              await addDoc(collection(db, 'users', user.uid, 'transactions'), newTransaction);
              toast.success('Transacción agregada correctamente');
            } catch (error) {
              console.error('Error adding transaction:', error);
              toast.error('Error al agregar transacción');
            }
          } else {
            set((state) => {
              state.transactions.push({ 
                ...newTransaction, 
                id: `local_${Date.now()}` 
              });
              state.balance = state.transactions.reduce((sum, t) => 
                sum + (t.type === 'income' ? t.amount : -t.amount), 0
              );
            });
            saveGuestData();
            toast.success('Transacción agregada');
          }
          calculateBudgetStatus();
        },
        updateTransaction: async (id, transactionData) => {
          const { user, saveGuestData, calculateBudgetStatus } = get();
          
          if (user) {
            try {
              if(!user.emailVerified) {
                 toast.error('Debes verificar tu email para editar.');
                 return;
              }
              await updateDoc(doc(db, 'users', user.uid, 'transactions', id), transactionData);
              toast.success('Transacción actualizada');
            } catch (error) {
              console.error('Error updating transaction:', error);
              toast.error('Error al actualizar transacción');
            }
          } else {
            set((state) => {
              const index = state.transactions.findIndex(t => t.id === id);
              if (index !== -1) {
                Object.assign(state.transactions[index], transactionData);
                state.balance = state.transactions.reduce((sum, t) => 
                  sum + (t.type === 'income' ? t.amount : -t.amount), 0
                );
              }
            });
            saveGuestData();
            toast.success('Transacción actualizada');
          }
          calculateBudgetStatus();
        },
        deleteTransaction: async (id) => {
          const { user, saveGuestData, calculateBudgetStatus } = get();
          
          if (user) {
            try {
               if(!user.emailVerified) {
                 toast.error('Debes verificar tu email para eliminar.');
                 return;
              }
              await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
              toast.success('Transacción eliminada');
            } catch (error) {
              console.error('Error deleting transaction:', error);
              toast.error('Error al eliminar transacción');
            }
          } else {
            set((state) => {
              state.transactions = state.transactions.filter(t => t.id !== id);
              state.balance = state.transactions.reduce((sum, t) => 
                sum + (t.type === 'income' ? t.amount : -t.amount), 0
              );
            });
            saveGuestData();
            toast.success('Transacción eliminada');
          }
          calculateBudgetStatus();
        },

        // Goal actions
        addGoal: async (goalData) => {
          const { user, saveGuestData } = get();
          const newGoal = { 
            ...goalData, 
            id: `goal_${Date.now()}`, 
            createdAt: new Date().toISOString() 
          };
          
          if (user) {
            try {
              if(!user.emailVerified) {
                 toast.error('Debes verificar tu email para añadir metas.');
                 return;
              }
              await setDoc(doc(db, 'users', user.uid, 'goals', newGoal.id), newGoal);
              toast.success('Meta creada correctamente');
            } catch (error) {
              console.error('Error adding goal:', error);
              toast.error('Error al crear meta');
            }
          } else {
            set((state) => {
              state.goals.push(newGoal);
            });
            saveGuestData();
            toast.success('Meta creada');
          }
        },
        updateGoal: async (id, goalData) => {
          const { user, saveGuestData } = get();
          
          if (user) {
            try {
               if(!user.emailVerified) {
                 toast.error('Debes verificar tu email para editar metas.');
                 return;
              }
              await updateDoc(doc(db, 'users', user.uid, 'goals', id), goalData);
              toast.success('Meta actualizada');
            } catch (error) {
              console.error('Error updating goal:', error);
              toast.error('Error al actualizar meta');
            }
          } else {
            set((state) => {
              const index = state.goals.findIndex(g => g.id === id);
              if (index !== -1) {
                Object.assign(state.goals[index], goalData);
              }
            });
            saveGuestData();
            toast.success('Meta actualizada');
          }
        },
        deleteGoal: async (id) => {
          const { user, saveGuestData } = get();
          
          if (user) {
            try {
               if(!user.emailVerified) {
                 toast.error('Debes verificar tu email para eliminar metas.');
                 return;
              }
              await deleteDoc(doc(db, 'users', user.uid, 'goals', id));
              toast.success('Meta eliminada');
            } catch (error) {
              console.error('Error deleting goal:', error);
              toast.error('Error al eliminar meta');
            }
          } else {
            set((state) => {
              state.goals = state.goals.filter(g => g.id !== id);
            });
            saveGuestData();
            toast.success('Meta eliminada');
          }
        },

        // Budget actions
        addBudget: async (budgetData) => {
          const { user, saveGuestData, calculateBudgetStatus } = get();
          const newBudget = {
            ...budgetData,
            id: `budget_${Date.now()}`,
            spentAmount: 0,
            createdAt: new Date().toISOString()
          };
          
          if (user) {
            try {
              if(!user.emailVerified) {
                 toast.error('Debes verificar tu email para crear presupuestos.');
                 return;
              }
              await setDoc(doc(db, 'users', user.uid, 'budgets', newBudget.id), newBudget);
              toast.success('Presupuesto creado');
            } catch (error) {
              console.error('Error adding budget:', error);
              toast.error('Error al crear presupuesto');
            }
          } else {
            set((state) => {
              state.budgets.push(newBudget);
            });
            saveGuestData();
            toast.success('Presupuesto creado');
          }
          calculateBudgetStatus();
        },
        updateBudget: async (budgetId, updates) => {
          const { user, saveGuestData, calculateBudgetStatus } = get();
          
          if (user) {
            try {
              if(!user.emailVerified) {
                 toast.error('Debes verificar tu email para editar presupuestos.');
                 return;
              }
              await updateDoc(doc(db, 'users', user.uid, 'budgets', budgetId), updates);
              toast.success('Presupuesto actualizado');
            } catch (error) {
              console.error('Error updating budget:', error);
              toast.error('Error al actualizar presupuesto');
            }
          } else {
            set((state) => {
              const index = state.budgets.findIndex(b => b.id === budgetId);
              if (index !== -1) {
                Object.assign(state.budgets[index], updates);
              }
            });
            saveGuestData();
            toast.success('Presupuesto actualizado');
          }
          calculateBudgetStatus();
        },
        deleteBudget: async (budgetId) => {
          const { user, saveGuestData } = get();
          
          if (user) {
            try {
              if(!user.emailVerified) {
                 toast.error('Debes verificar tu email para eliminar presupuestos.');
                 return;
              }
              await deleteDoc(doc(db, 'users', user.uid, 'budgets', budgetId));
              toast.success('Presupuesto eliminado');
            } catch (error) {
              console.error('Error deleting budget:', error);
              toast.error('Error al eliminar presupuesto');
            }
          } else {
            set((state) => {
              state.budgets = state.budgets.filter(b => b.id !== budgetId);
            });
            saveGuestData();
            toast.success('Presupuesto eliminado');
          }
        },

        // Budget calculations
        calculateBudgetStatus: () => {
          set((state) => {
            const alerts: BudgetAlert[] = [];
            
            state.budgets.forEach(budget => {
              if (!budget.isActive) return;
              
              const spent = state.transactions
                .filter(t => 
                  t.type === 'expense' && 
                  t.category === budget.category &&
                  new Date(t.date) >= new Date(budget.startDate) &&
                  new Date(t.date) <= new Date(budget.endDate)
                )
                .reduce((sum, t) => sum + t.amount, 0);
              
              budget.spentAmount = spent;
              const percentage = (spent / budget.limitAmount) * 100;
              
              if (percentage >= budget.alertThreshold) {
                alerts.push({
                  budgetId: budget.id,
                  category: budget.category,
                  currentSpent: spent,
                  limitAmount: budget.limitAmount,
                  percentage,
                  type: percentage >= 100 ? 'exceeded' : 'exceeded'
                });
              }
            });
            
            state.budgetAlerts = alerts;
          });
        },
        getBudgetUsage: (category: string) => {
          const { budgets } = get();
          return budgets.find(b => b.category === category && b.isActive);
        },

        // AI actions
        categorizeTransactionWithAI: async (transactionId: string) => {
          // Implementar después con Genkit
          toast.info('Función de IA pendiente de implementar');
        },
        acceptAISuggestion: (transactionId: string) => {
          const { updateTransaction } = get();
          set((state) => {
            const transaction = state.transactions.find(t => t.id === transactionId);
            if (transaction?.aiSuggestion) {
              transaction.category = transaction.aiSuggestion.category;
              transaction.aiSuggestion.isAccepted = true;
              transaction.isAiCategorized = true;
            }
          });
          toast.success('Sugerencia de IA aceptada');
        },
        rejectAISuggestion: (transactionId: string) => {
          const { user } = get();
          set((state) => {
            const transaction = state.transactions.find(t => t.id === transactionId);
            if (transaction) {
              delete transaction.aiSuggestion;
              transaction.isAiCategorized = false;
            }
          });
          
          if (user) {
            updateDoc(doc(db, 'users', user.uid, 'transactions', transactionId), {
              aiSuggestion: deleteField(),
              isAiCategorized: false
            }).catch(console.error);
          }
          
          toast.info('Sugerencia de IA rechazada');
        },

        // System actions
        toggleDarkMode: () => set((state) => { 
          state.isDarkMode = !state.isDarkMode; 
        }),
        subscribeToUserData: () => {
          const { user, setTransactions, setGoals, setBudgets } = get();
          console.log('🔄 subscribeToUserData called for user:', user?.email);
          
          if (!user) {
            console.log('❌ No user found in subscribeToUserData');
            return () => {};
          }
          if (!user.emailVerified) {
              setTransactions([]);
              setGoals([]);
              setBudgets([]);
              return () => {};
          }

          const unsubscribers: Unsubscribe[] = [];

          // Suscripción a transacciones
          const transactionsQuery = query(collection(db, 'users', user.uid, 'transactions'));
          const transactionsUnsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
              const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
              setTransactions(transactions);
            }, (error) => {
              console.error('Error in transactions subscription:', error);
              toast.error('Error al cargar transacciones');
            }
          );
          unsubscribers.push(transactionsUnsubscribe);

          // Suscripción a metas
          const goalsQuery = query(collection(db, 'users', user.uid, 'goals'));
          const goalsUnsubscribe = onSnapshot(goalsQuery, (snapshot) => {
              const goals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
              setGoals(goals);
            }, (error) => {
              console.error('Error in goals subscription:', error);
              toast.error('Error al cargar metas');
            }
          );
          unsubscribers.push(goalsUnsubscribe);

          // Suscripción a presupuestos
          const budgetsQuery = query(collection(db, 'users', user.uid, 'budgets'));
          const budgetsUnsubscribe = onSnapshot(budgetsQuery, (snapshot) => {
              const budgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
              setBudgets(budgets);
              get().calculateBudgetStatus();
            }, (error) => {
              console.error('Error in budgets subscription:', error);
              toast.error('Error al cargar presupuestos');
            }
          );
          unsubscribers.push(budgetsUnsubscribe);

          return () => {
            unsubscribers.forEach(unsubscribe => unsubscribe());
          };
        },
        loadGuestData: () => {
          console.log('📦 Loading guest data...');
          try {
            const data = localStorage.getItem(GUEST_DATA_KEY);
            console.log('📦 Guest data found:', !!data);
            if (data) {
              const parsedData = JSON.parse(data);
              set((state) => {
                state.transactions = parsedData.transactions || [];
                state.goals = parsedData.goals || [];
                state.budgets = parsedData.budgets || [];
                state.balance = state.transactions.reduce((sum, t) => 
                  sum + (t.type === 'income' ? t.amount : -t.amount), 0
                );
              });
              get().calculateBudgetStatus();
            }
          } catch (error) {
            console.error('Error loading guest data:', error);
          }
        },
        saveGuestData: () => {
          try {
            const { transactions, goals, budgets } = get();
            const dataToSave = { transactions, goals, budgets };
            localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(dataToSave));
          } catch (error) {
            console.error('Error saving guest data:', error);
          }
        },
      })),
      {
        name: 'finassist-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ isDarkMode: state.isDarkMode }),
      }
    )
  )
);
