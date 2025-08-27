"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, onSnapshot, query, where, deleteDoc, getDocs, writeBatch } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';
import type { Transaction } from '@/components/transactions/TransactionTable';
import type { Goal } from '@/components/goals/GoalsList';

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
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (transactionId: number) => Promise<void>;
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

  const saveDataToFirestore = useCallback(async (userId: string, data: { balance: number; goals: Goal[] }) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { balance: data.balance, goals: data.goals });
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
    if (user) saveDataToFirestore(user.uid, { balance: newBalance, goals });
    else saveGuestData({ balance: newBalance, transactions, goals });
  }, [user, transactions, goals, saveDataToFirestore]);

  const setTransactions = useCallback((newTransactions: Transaction[]) => {
    setTransactionsState(newTransactions);
    if (!user) saveGuestData({ balance, transactions: newTransactions, goals });
  }, [user, balance, goals ]);

  const setGoals = useCallback((newGoals: Goal[]) => {
    setGoalsState(newGoals);
    if (user) saveDataToFirestore(user.uid, { balance, transactions, goals: newGoals });
    else saveGuestData({ balance, transactions, goals: newGoals });
  }, [user, balance, transactions, saveDataToFirestore]);

  const checkForAlerts = (newBalance: number, allTransactions: Transaction[]) => {
    const totalGastoOcio = allTransactions
      .filter((t) => t.category === 'Ocio' && t.type === 'Gasto')
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalGastoOcio / (newBalance || 1) > 0.4) {
      toast({
        title: 'Advertencia de Gasto',
        description: 'Has gastado más del 40% de tu saldo en ocio.',
        variant: 'destructive',
      });
    }

    if (newBalance < 1000) {
        toast({
            title: 'Alerta de Saldo Bajo',
            description: 'Tu saldo es inferior a 1000. Considera revisar tus gastos.',
            variant: 'destructive',
        });
    }
  };


  const addTransaction = useCallback(async (newTransaction: Omit<Transaction, 'id'>) => {
    let newBalance;
    if (newTransaction.type === 'Ingreso') {
      newBalance = balance + newTransaction.amount;
    } else {
      newBalance = balance - newTransaction.amount;
    }
    
    if (user) {
        await addDoc(collection(db, 'users', user.uid, 'transactions'), {
            ...newTransaction,
            createdAt: new Date(),
        });
        // Note: Real-time listener will update the state, no need to call setTransactions here.
        await updateDoc(doc(db, 'users', user.uid), { balance: newBalance });
        setBalanceState(newBalance); // Optimistic update
    } else {
        const newId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
        const transactionWithId = { ...newTransaction, id: newId };
        const updatedTransactions = [transactionWithId, ...transactions];
        setTransactions(updatedTransactions);
        setBalance(newBalance);
    }
    
    checkForAlerts(newBalance, transactions);

  }, [transactions, balance, setTransactions, setBalance, user, toast]);

  const deleteTransaction = useCallback(async (transactionId: number) => {
    if (user) {
        const transRef = collection(db, 'users', user.uid, 'transactions');
        const q = query(transRef, where("id", "==", transactionId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docToDelete = querySnapshot.docs[0];
            const deletedAmount = docToDelete.data().amount;
            const deletedType = docToDelete.data().type;
            
            await deleteDoc(docToDelete.ref);

            const newBalance = deletedType === 'Ingreso' ? balance - deletedAmount : balance + deletedAmount;
            await updateDoc(doc(db, 'users', user.uid), { balance: newBalance });
            setBalanceState(newBalance); // Optimistic update
        }
    } else {
        const transactionToDelete = transactions.find(t => t.id === transactionId);
        if (!transactionToDelete) return;
        
        const updatedTransactions = transactions.filter(t => t.id !== transactionId);
        const newBalance = transactionToDelete.type === 'Ingreso' ? balance - transactionToDelete.amount : balance + transactionToDelete.amount;
        
        setTransactions(updatedTransactions);
        setBalance(newBalance);
    }
  }, [user, balance, transactions, setTransactions, setBalance]);


  const addGoal = useCallback((newGoal: Omit<Goal, 'id'>) => {
    const newId = goals.length > 0 ? Math.max(...goals.map(g => g.id)) + 1 : 1;
    const goalWithId = { ...newGoal, id: newId };
    const updatedGoals = [goalWithId, ...goals];
    setGoals(updatedGoals);
  }, [goals, setGoals]);


  useEffect(() => {
    let unsubscribeFromTransactions: (() => void) | undefined;

    const unsubscribeFromAuth = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (unsubscribeFromTransactions) {
        unsubscribeFromTransactions();
      }

      if (user) {
        setUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setBalanceState(data.balance || 0);
          setGoalsState(data.goals || []);

          const transRef = collection(db, 'users', user.uid, 'transactions');
          const q = query(transRef);
          unsubscribeFromTransactions = onSnapshot(q, (snapshot) => {
              const fetchedTransactions = snapshot.docs.map(doc => ({...doc.data(), id: doc.data().id || doc.id }) as Transaction);
              setTransactionsState(fetchedTransactions);
          });

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

    return () => {
      unsubscribeFromAuth();
      if (unsubscribeFromTransactions) {
        unsubscribeFromTransactions();
      }
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const guestData = loadGuestData();
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists() && guestData.transactions.length > 0) {
        const batch = writeBatch(db);
        guestData.transactions.forEach((t: Transaction) => {
            const newTransRef = doc(collection(db, 'users', userCredential.user.uid, 'transactions'));
            batch.set(newTransRef, t);
        });
        await batch.commit();

        const firestoreData = userDoc.data();
        const finalBalance = firestoreData.balance + guestData.balance;

        const mergedGoals = [...firestoreData.goals, ...guestData.goals.filter((gg: Goal) => !firestoreData.goals.some((fg: Goal) => fg.id === gg.id))];
        
        await updateDoc(userDocRef, {
            balance: finalBalance,
            goals: mergedGoals,
        });

        toast({ title: "Datos locales sincronizados", description: "Tus datos de invitado se han añadido a tu cuenta." });
    }
     localStorage.removeItem(GUEST_DATA_KEY);
  };

  const register = async (email: string, pass: string) => {
    const guestData = loadGuestData();
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    
    // Set user document
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      createdAt: new Date(),
      balance: guestData.balance,
      goals: guestData.goals
    });

    // Batch write transactions
    const batch = writeBatch(db);
    const transRef = collection(db, 'users', userCredential.user.uid, 'transactions');
    guestData.transactions.forEach((t: Transaction) => {
        const newTransRef = doc(transRef); // Auto-generate ID
        batch.set(newTransRef, t);
    });
    await batch.commit();

    localStorage.removeItem(GUEST_DATA_KEY);
  };


  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setTransactionsState([]);
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
    deleteTransaction,
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
