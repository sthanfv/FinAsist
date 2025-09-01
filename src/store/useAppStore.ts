
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

// State interface
interface AppState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  transactions: Transaction[];
  goals: Goal[];
  balance: number;
  isDarkMode: boolean;

  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setGoals: (goals: Goal[]) => void;
  calculateBalance: () => void;
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
        balance: 0,
        
        // UI state
        isDarkMode: false,

        // Auth actions
        setUser: (user) => set({ user }, false, 'setUser'),
        setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
        setInitialized: (initialized) => set({ isInitialized: initialized }, false, 'setInitialized'),

        // Data actions
        setTransactions: (transactions) => set({ transactions }, false, 'setTransactions'),
        setGoals: (goals) => set({ goals }, false, 'setGoals'),
        calculateBalance: () => set((state) => {
          state.balance = state.transactions.reduce((acc, transaction) => {
            return transaction.type === 'income' 
              ? acc + transaction.amount 
              : acc - transaction.amount;
          }, 0);
        }, false, 'calculateBalance'),
        addTransaction: async (transactionData) => {
          const { user, saveGuestData, calculateBalance } = get();
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
            }, false, 'addTransaction/local');
            saveGuestData();
          }
          calculateBalance();
        },
        updateTransaction: async (id, transactionData) => {
          const { user, saveGuestData, calculateBalance } = get();
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
            }, false, 'updateTransaction/local');
            saveGuestData();
          }
          calculateBalance();
        },
        deleteTransaction: async (id) => {
          const { user, saveGuestData, calculateBalance } = get();
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
            }, false, 'deleteTransaction/local');
            saveGuestData();
          }
          calculateBalance();
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

        // UI actions
        toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode }), false, 'toggleDarkMode'),
        
        // Subscription and data handling
        subscribeToUserData: () => {
          const { user, setTransactions, setGoals, calculateBalance } = get();
          if (!user) return () => {};

          const unsubTransactions = onSnapshot(query(collection(db, 'users', user.uid, 'transactions')), (snapshot) => {
            const transactions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Transaction);
            setTransactions(transactions);
            calculateBalance();
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

          return () => {
            unsubTransactions();
            unsubGoals();
          };
        },

        loadGuestData: () => {
          if (typeof window === 'undefined') return;
          try {
            const saved = localStorage.getItem(GUEST_DATA_KEY);
            if (saved) {
              const { transactions = [], goals = [] } = JSON.parse(saved);
              get().setTransactions(transactions);
              get().setGoals(goals);
              get().calculateBalance();
            }
          } catch (error) {
            console.error('Error loading guest data:', error);
            NotificationSystem.error('Error al cargar datos locales');
          }
        },

        saveGuestData: () => {
          if (typeof window === 'undefined') return;
          try {
            const { transactions, goals } = get();
            localStorage.setItem(GUEST_DATA_KEY, JSON.stringify({ transactions, goals }));
          } catch (error) {
            console.error('Error saving guest data:', error);
            NotificationSystem.error('Error al guardar datos locales');
          }
        },
      })),
      {
        name: 'finassist-settings',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ isDarkMode: state.isDarkMode }),
      }
    )
  )
);
