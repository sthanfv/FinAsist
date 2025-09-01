
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

// Slices
const createAuthSlice = (set, get) => ({
  user: null,
  isLoading: true,
  isInitialized: false,
  setUser: (user) => set({ user }, false, 'setUser'),
  setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
  setInitialized: (initialized) => set({ isInitialized: initialized }, false, 'setInitialized'),
});

const createDataSlice = (set, get) => ({
  transactions: [],
  goals: [],
  balance: 0,
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
    const { user, addToast, saveGuestData, calculateBalance } = get();
    const newTransaction = { ...transactionData, createdAt: new Date().toISOString() };
    if (user) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'transactions'), newTransaction);
      } catch (error) {
        console.error('Error adding transaction:', error);
        addToast('Error al agregar transacción', 'error');
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
    const { user, addToast, saveGuestData, calculateBalance } = get();
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'transactions', id), transactionData);
      } catch (error) {
        console.error('Error updating transaction:', error);
        addToast('Error al actualizar transacción', 'error');
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
    const { user, addToast, saveGuestData, calculateBalance } = get();
    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
      } catch (error) {
        console.error('Error deleting transaction:', error);
        addToast('Error al eliminar transacción', 'error');
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
    const { user, addToast, saveGuestData } = get();
    const newGoal = { ...goalData, id: `${Date.now()}`, createdAt: new Date().toISOString() };
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'goals', newGoal.id), newGoal);
      } catch (error) {
        console.error('Error adding goal:', error);
        addToast('Error al agregar meta', 'error');
      }
    } else {
      set((state) => {
        state.goals.push(newGoal);
      }, false, 'addGoal/local');
      saveGuestData();
    }
  },
  updateGoal: async (id, goalData) => {
    const { user, addToast, saveGuestData } = get();
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid, 'goals', id), goalData);
      } catch (error) {
        console.error('Error updating goal:', error);
        addToast('Error al actualizar meta', 'error');
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
    const { user, addToast, saveGuestData } = get();
    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'goals', id));
      } catch (error) {
        console.error('Error deleting goal:', error);
        addToast('Error al eliminar meta', 'error');
      }
    } else {
      set((state) => {
        state.goals = state.goals.filter(g => g.id !== id);
      }, false, 'deleteGoal/local');
      saveGuestData();
    }
  },
});

const createUISlice = (set, get) => ({
  isDarkMode: false,
  toasts: [],
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode }), false, 'toggleDarkMode'),
  addToast: (message, type = 'info', duration = 5000) => {
    const id = `toast-${Date.now()}`;
    set((state) => ({ toasts: [...state.toasts, { id, message, type, duration }] }), false, 'addToast');
    return id;
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }), false, 'removeToast'),
  clearAllToasts: () => set({ toasts: [] }, false, 'clearAllToasts'),
});

const GUEST_DATA_KEY = 'finassist_guest_data';

export const useAppStore = create(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        ...createAuthSlice(set, get),
        ...createDataSlice(set, get),
        ...createUISlice(set, get),

        initializeApp: () => {
          const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (!get().isInitialized) get().setLoading(true);
            get().setUser(user);
            if (user) {
              const unsubscribeData = get().subscribeToUserData();
              get().setLoading(false);
              get().setInitialized(true);
              return unsubscribeData;
            } else {
              get().loadGuestData();
              get().setLoading(false);
              get().setInitialized(true);
            }
          });
          return unsubscribeAuth;
        },

        subscribeToUserData: () => {
          const { user, setTransactions, setGoals, calculateBalance, addToast } = get();
          if (!user) return () => {};

          const unsubTransactions = onSnapshot(query(collection(db, 'users', user.uid, 'transactions')), (snapshot) => {
            const transactions = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Transaction);
            setTransactions(transactions);
            calculateBalance();
          }, (error) => {
            console.error("Error en snapshot de transacciones: ", error);
            addToast("Error al cargar transacciones", "error");
          });

          const unsubGoals = onSnapshot(query(collection(db, 'users', user.uid, 'goals')), (snapshot) => {
            const goals = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Goal);
            setGoals(goals);
          }, (error) => {
            console.error("Error en snapshot de metas: ", error);
            addToast("Error al cargar metas", "error");
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
            get().addToast('Error al cargar datos locales', 'error');
          }
        },

        saveGuestData: () => {
          if (typeof window === 'undefined') return;
          try {
            const { transactions, goals } = get();
            localStorage.setItem(GUEST_DATA_KEY, JSON.stringify({ transactions, goals }));
          } catch (error) {
            console.error('Error saving guest data:', error);
            get().addToast('Error al guardar datos locales', 'error');
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
