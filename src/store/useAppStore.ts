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
