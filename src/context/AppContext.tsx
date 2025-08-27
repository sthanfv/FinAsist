"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/components/transactions/TransactionTable';
import { Goal } from '@/components/goals/GoalsList';

const GUEST_DATA_KEY = 'finassist_guest_data';

interface AppContextType {
  user: User | null;
  loading: boolean;
  balance: number;
  transactions: Transaction[];
  goals: Goal[];
  setBalance: (balance: number) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setGoals: (goals: Goal[]) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  logout: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultGuestData = {
    balance: 5432.10,
    transactions: [
        { id: 1, date: '2025-08-01', category: 'Universidad', type: 'Gasto', amount: 4000, account: 'Principal', note: 'Pago semestre' },
        { id: 2, date: '2025-08-03', category: 'Ocio', type: 'Gasto', amount: 1500, account: 'Principal', note: 'Cine' },
        { id: 3, date: '2025-08-05', category: 'Transporte', type: 'Gasto', amount: 1200, account: 'Principal', note: 'Gasolina' },
        { id: 4, date: '2025-08-10', category: 'Ahorro', type: 'Gasto', amount: 2000, account: 'Ahorro', note: 'Meta mensual' },
    ],
    goals: [
        { id: 1, title: 'Ahorro Emergencia', targetAmount: 5000, savedAmount: 2000, deadline: '2025-12-31' },
        { id: 2, title: 'Viaje Vacaciones', targetAmount: 3000, savedAmount: 1000, deadline: '2025-10-15' },
    ]
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalanceState] = useState<number>(0);
  const [transactions, setTransactionsState] = useState<Transaction[]>([]);
  const [goals, setGoalsState] = useState<Goal[]>([]);
  const { toast } = useToast();

  const saveDataToFirestore = useCallback(async (userId: string, data: { balance: number; transactions: Transaction[]; goals: Goal[] }) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, data);
    } catch (error) {
      console.error("Error saving data to Firestore:", error);
    }
  }, []);

  const loadGuestData = () => {
    try {
        const localData = localStorage.getItem(GUEST_DATA_KEY);
        if (localData) {
            return JSON.parse(localData);
        }
    } catch (error) {
        console.error("Error loading guest data from localStorage:", error);
    }
    return defaultGuestData;
  };
  
  const saveGuestData = (data: { balance: number; transactions: Transaction[]; goals: Goal[] }) => {
    try {
        localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));
    } catch (error) {
        console.error("Error saving guest data to localStorage:", error);
    }
  };

  const setBalance = useCallback((newBalance: number) => {
    setBalanceState(newBalance);
    if (user) saveDataToFirestore(user.uid, { balance: newBalance, transactions, goals });
    else saveGuestData({ balance: newBalance, transactions, goals });
  }, [user, transactions, goals, saveDataToFirestore]);

  const setTransactions = useCallback((newTransactions: Transaction[]) => {
    setTransactionsState(newTransactions);
    if (user) saveDataToFirestore(user.uid, { balance, transactions: newTransactions, goals });
    else saveGuestData({ balance, transactions: newTransactions, goals });
  }, [user, balance, goals, saveDataToFirestore]);

  const setGoals = useCallback((newGoals: Goal[]) => {
    setGoalsState(newGoals);
    if (user) saveDataToFirestore(user.uid, { balance, transactions, goals: newGoals });
    else saveGuestData({ balance, transactions, goals: newGoals });
  }, [user, balance, transactions, saveDataToFirestore]);

  const addTransaction = useCallback((newTransaction: Omit<Transaction, 'id'>) => {
    const newId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
    const transactionWithId = { ...newTransaction, id: newId };
    
    const updatedTransactions = [transactionWithId, ...transactions];
    setTransactions(updatedTransactions);
  
    if (newTransaction.type === 'Ingreso') {
      setBalance(balance + newTransaction.amount);
    } else {
      setBalance(balance - newTransaction.amount);
    }
  }, [transactions, balance, setTransactions, setBalance]);

  const addGoal = useCallback((newGoal: Omit<Goal, 'id'>) => {
    const newId = goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1;
    const goalWithId = { ...newGoal, id: newId };
    const updatedGoals = [goalWithId, ...goals];
    setGoals(updatedGoals);
  }, [goals, setGoals]);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setBalanceState(data.balance || 0);
          setTransactionsState(data.transactions || []);
          setGoalsState(data.goals || []);
        }
      } else {
        setUser(null);
        const guestData = loadGuestData();
        setBalanceState(guestData.balance);
        setTransactionsState(guestData.transactions);
        setGoalsState(guestData.goals);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const guestData = loadGuestData();
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        const firestoreData = userDoc.data();
        // Merge guest data with Firestore data (Firestore has priority)
        const mergedTransactions = [...firestoreData.transactions, ...guestData.transactions.filter(gt => !firestoreData.transactions.some(ft => ft.id === gt.id))];
        const mergedGoals = [...firestoreData.goals, ...guestData.goals.filter(gg => !firestoreData.goals.some(fg => fg.id === gg.id))];
        
        await updateDoc(userDocRef, {
            transactions: mergedTransactions,
            goals: mergedGoals,
            // We keep the Firestore balance
        });

        toast({ title: "Datos locales sincronizados", description: "Tus datos de invitado se han añadido a tu cuenta." });
        localStorage.removeItem(GUEST_DATA_KEY);
    }
  };

  const register = async (email: string, pass: string) => {
    const guestData = loadGuestData();
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      createdAt: new Date(),
      ...guestData
    });
    localStorage.removeItem(GUEST_DATA_KEY);
  };


  const logout = async () => {
    await signOut(auth);
    setUser(null);
    const guestData = loadGuestData();
    setBalanceState(guestData.balance);
    setTransactionsState(guestData.transactions);
    setGoalsState(guestData.goals);
  };

  const value = {
    user,
    loading,
    balance,
    transactions,
    goals,
    setBalance,
    setTransactions,
    setGoals,
    addTransaction,
    addGoal,
    logout,
    login,
    register,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AppProvider');
  }
  return context;
};

export const useAppContext = useAuth;
