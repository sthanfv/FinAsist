
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
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { Toast } from '@/components/ui/toast-system';

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

interface AppState {
  // Estado de autenticación
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  
  // Datos financieros
  transactions: Transaction[];
  goals: Goal[];
  balance: number;
  
  // UI State
  isDarkMode: boolean;
  sidebarOpen: boolean;
  toasts: Toast[];
  
  // Acciones de autenticación
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  
  // Acciones de datos
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  calculateBalance: () => void;
  
  // Acciones de UI
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  
  // Inicialización
  initializeApp: () => () => void;
  subscribeToUserData: () => () => void;
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
        balance: 0,
        isDarkMode: false,
        sidebarOpen: false,
        toasts: [],
        // Acciones de autenticación
        setUser: (user) => set((state) => {
          state.user = user;
        }),
        setLoading: (loading) => set((state) => {
          state.isLoading = loading;
        }),
        setInitialized: (initialized) => set((state) => {
          state.isInitialized = initialized;
        }),
        // Acciones de datos
        setTransactions: (transactions) => set((state) => {
          state.transactions = transactions;
        }),
        addTransaction: async (transactionData) => {
          const { user } = get();
          const newTransaction: Transaction = {
            ...transactionData,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
          };
          if (user) {
            // Usuario autenticado: guardar en Firestore
            try {
              const docRef = await addDoc(
                collection(db, 'users', user.uid, 'transactions'),
                newTransaction
              );
              set((state) => {
                state.transactions.push({ ...newTransaction, id: docRef.id });
              });
            } catch (error) {
              console.error('Error adding transaction:', error);
              get().addToast('Error al agregar transacción', 'error');
            }
          } else {
            // Usuario invitado: guardar en localStorage
            set((state) => {
              state.transactions.push(newTransaction);
            });
            get().saveGuestData();
          }
          get().calculateBalance();
        },
        updateTransaction: async (id, transactionData) => {
          const { user } = get();
          
          if (user) {
            try {
              await updateDoc(
                doc(db, 'users', user.uid, 'transactions', id),
                transactionData
              );
            } catch (error) {
              console.error('Error updating transaction:', error);
              get().addToast('Error al actualizar transacción', 'error');
            }
          } else {
            set((state) => {
              const index = state.transactions.findIndex(t => t.id === id);
              if (index !== -1) {
                Object.assign(state.transactions[index], transactionData);
              }
            });
            get().saveGuestData();
          }
          get().calculateBalance();
        },
        deleteTransaction: async (id) => {
          const { user } = get();
          
          if (user) {
            try {
              await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
            } catch (error) {
              console.error('Error deleting transaction:', error);
              get().addToast('Error al eliminar transacción', 'error');
            }
          } else {
            set((state) => {
              state.transactions = state.transactions.filter(t => t.id !== id);
            });
            get().saveGuestData();
          }
          get().calculateBalance();
        },
        setGoals: (goals) => set((state) => {
          state.goals = goals;
        }),
        addGoal: async (goalData) => {
          const { user } = get();
          const newGoal: Goal = {
            ...goalData,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
          };
          if (user) {
            try {
              await setDoc(
                doc(db, 'users', user.uid, 'goals', newGoal.id),
                newGoal
              );
            } catch (error) {
              console.error('Error adding goal:', error);
              get().addToast('Error al agregar meta', 'error');
            }
          }
          set((state) => {
            state.goals.push(newGoal);
          });
          
          if (!user) {
            get().saveGuestData();
          }
        },
        updateGoal: async (id, goalData) => {
          const { user } = get();
          
          if (user) {
            try {
              await updateDoc(doc(db, 'users', user.uid, 'goals', id), goalData);
            } catch (error) {
              console.error('Error updating goal:', error);
              get().addToast('Error al actualizar meta', 'error');
            }
          } else {
            set((state) => {
              const index = state.goals.findIndex(g => g.id === id);
              if (index !== -1) {
                Object.assign(state.goals[index], goalData);
              }
            });
            get().saveGuestData();
          }
        },
        deleteGoal: async (id) => {
          const { user } = get();
          
          if (user) {
            try {
              await deleteDoc(doc(db, 'users', user.uid, 'goals', id));
            } catch (error) {
              console.error('Error deleting goal:', error);
              get().addToast('Error al eliminar meta', 'error');
            }
          } else {
            set((state) => {
              state.goals = state.goals.filter(g => g.id !== id);
            });
            get().saveGuestData();
          }
        },
        calculateBalance: () => set((state) => {
          state.balance = state.transactions.reduce((acc, transaction) => {
            return transaction.type === 'income' 
              ? acc + transaction.amount 
              : acc - transaction.amount;
          }, 0);
        }),
        // Acciones de UI
        toggleDarkMode: () => set((state) => {
          state.isDarkMode = !state.isDarkMode;
          if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', state.isDarkMode);
          }
        }),
        toggleSidebar: () => set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        }),
        toasts: [],
        addToast: (message, type = 'info', duration = 5000) => {
          const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newToast: Toast = {
            id,
            message,
            type,
            duration,
          };
          
          set((state) => {
            state.toasts.push(newToast);
          });
          
          return id;
        },
        removeToast: (id) => set((state) => {
          state.toasts = state.toasts.filter(toast => toast.id !== id);
        }),
        clearAllToasts: () => set((state) => {
          state.toasts = [];
        }),
        
        // Inicialización
        initializeApp: () => {
          const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            get().setUser(user);
            get().setLoading(false);
            
            if (user) {
              // Suscribirse a datos del usuario
              const unsubscribeData = get().subscribeToUserData();
              // Guardar función de desuscripción para limpieza posterior
              return unsubscribeData;
            } else {
              // Cargar datos de invitado
              get().loadGuestData();
            }
            
            get().setInitialized(true);
          });
          return unsubscribeAuth;
        },
        subscribeToUserData: () => {
          const { user } = get();
          if (!user) return () => {};
          // Suscribirse a transacciones
          const transactionsRef = collection(db, 'users', user.uid, 'transactions');
          const transactionsQuery = query(transactionsRef);
          const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
            const transactions = snapshot.docs.map(doc => ({
              ...doc.data(),
              id: doc.id
            } as Transaction));
            
            get().setTransactions(transactions);
            get().calculateBalance();
          });
          // Suscribirse a metas
          const goalsRef = collection(db, 'users', user.uid, 'goals');
          const goalsQuery = query(goalsRef);
          const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
            const goals = snapshot.docs.map(doc => ({
              ...doc.data(),
              id: doc.id
            } as Goal));
            
            get().setGoals(goals);
          });
          return () => {
            unsubscribeTransactions();
            unsubscribeGoals();
          };
        },
        loadGuestData: () => {
          if (typeof window === 'undefined') return;
          
          try {
            const saved = localStorage.getItem(GUEST_DATA_KEY);
            if (saved) {
              const guestData = JSON.parse(saved);
              set((state) => {
                state.transactions = guestData.transactions || [];
                state.goals = guestData.goals || [];
              });
              get().calculateBalance();
            }
          } catch (error) {
            console.error('Error loading guest data:', error);
          }
        },
        saveGuestData: () => {
          if (typeof window === 'undefined') return;
          
          const { transactions, goals } = get();
          try {
            localStorage.setItem(GUEST_DATA_KEY, JSON.stringify({
              transactions,
              goals,
              lastSaved: new Date().toISOString()
            }));
          } catch (error) {
            console.error('Error saving guest data:', error);
          }
        },
      })),
      {
        name: 'finassist-settings',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          isDarkMode: state.isDarkMode,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    )
  )
);
