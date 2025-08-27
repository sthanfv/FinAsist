
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
  activeToasts: string[];
  
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
  addToast: (message: string) => string;
  removeToast: (id: string) => void;
  
  // Inicialización
  initializeApp: () => void;
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
        activeToasts: [],
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
          const { user, addToast, saveGuestData, calculateBalance } = get();
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
              // get().addToast('Error al agregar transacción'); // Toast needs to be implemented
            }
          } else {
            // Usuario invitado: guardar en localStorage
            set((state) => {
              state.transactions.push(newTransaction);
            });
            // get().saveGuestData(); // saveGuestData needs to be implemented
          }
          // get().calculateBalance(); // calculateBalance needs to be implemented
        },
        updateTransaction: async (id, transactionData) => {
          const { user, addToast, saveGuestData, calculateBalance } = get();
          
          if (user) {
            try {
              await updateDoc(
                doc(db, 'users', user.uid, 'transactions', id),
                transactionData
              );
            } catch (error) {
              console.error('Error updating transaction:', error);
              // get().addToast('Error al actualizar transacción');
            }
          } else {
            set((state) => {
              const index = state.transactions.findIndex(t => t.id === id);
              if (index !== -1) {
                Object.assign(state.transactions[index], transactionData);
              }
            });
            // get().saveGuestData();
          }
          // get().calculateBalance();
        },
        deleteTransaction: async (id) => {
          const { user, addToast, saveGuestData, calculateBalance } = get();
          
          if (user) {
            try {
              await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
            } catch (error) {
              console.error('Error deleting transaction:', error);
              // get().addToast('Error al eliminar transacción');
            }
          } else {
            set((state) => {
              state.transactions = state.transactions.filter(t => t.id !== id);
            });
            // get().saveGuestData();
          }
          // get().calculateBalance();
        },
        setGoals: (goals) => set((state) => {
          state.goals = goals;
        }),
        addGoal: async (goalData) => {
          const { user, addToast, saveGuestData } = get();
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
              // get().addToast('Error al agregar meta');
            }
          }
          set((state) => {
            state.goals.push(newGoal);
          });
          
          if (!user) {
            // get().saveGuestData();
          }
        },
        updateGoal: async (id, goalData) => {
          const { user, addToast, saveGuestData } = get();
          
          if (user) {
            try {
              await updateDoc(doc(db, 'users', user.uid, 'goals', id), goalData);
            } catch (error) {
              console.error('Error updating goal:', error);
              // get().addToast('Error al actualizar meta');
            }
          } else {
            set((state) => {
              const index = state.goals.findIndex(g => g.id === id);
              if (index !== -1) {
                Object.assign(state.goals[index], goalData);
              }
            });
            // get().saveGuestData();
          }
        },
        deleteGoal: async (id) => {
          const { user, addToast, saveGuestData } = get();
          
          if (user) {
            try {
              await deleteDoc(doc(db, 'users', user.uid, 'goals', id));
            } catch (error) {
              console.error('Error deleting goal:', error);
              // get().addToast('Error al eliminar meta');
            }
          } else {
            set((state) => {
              state.goals = state.goals.filter(g => g.id !== id);
            });
            // get().saveGuestData();
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
      })),
      {
        name: 'finassist-storage', 
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ 
          // Aquí puedes elegir qué partes del estado persistir
          isDarkMode: state.isDarkMode,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    )
  )
);
