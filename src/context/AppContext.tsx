"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, onSnapshot, query, where, deleteDoc, getDocs, writeBatch, serverTimestamp } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';
import type { Transaction } from '@/components/transactions/TransactionTable';
import type { Goal } from '@/components/goals/GoalsList';

const GUEST_DATA_KEY = 'finassist_guest_data_v2';

interface AppContextType {
  user: User | null;
  loading: boolean;
  balance: number;
  transactions: Transaction[];
  goals: Goal[];
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (transactionId: number) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  logout: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultGuestData = {
    balance: 0,
    transactions: [],
    goals: []
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalanceState] = useState<number>(0);
  const [transactions, setTransactionsState] = useState<Transaction[]>([]);
  const [goals, setGoalsState] = useState<Goal[]>([]);
  const { toast } = useToast();

  const calculateBalance = (transactions: Transaction[]) => {
      return transactions.reduce((acc, t) => {
          return t.type === 'Ingreso' ? acc + t.amount : acc - t.amount;
      }, 0);
  }

  const saveDataToGuestStorage = (data: { transactions: Transaction[]; goals: Goal[] }) => {
    try {
        const balance = calculateBalance(data.transactions);
        localStorage.setItem(GUEST_DATA_KEY, JSON.stringify({ ...data, balance }));
    } catch (error) {
        console.error("Error saving guest data to localStorage:", error);
    }
  };

  const syncFirestoreData = useCallback(async (userId: string, data: { transactions?: Transaction[], goals?: Goal[] }) => {
    try {
        const userDocRef = doc(db, 'users', userId);
        const updateData: { [key: string]: any } = {};

        if (data.transactions) {
            updateData.balance = calculateBalance(data.transactions);
        }
        if (data.goals) {
            updateData.goals = data.goals;
        }

        if (Object.keys(updateData).length > 0) {
            await updateDoc(userDocRef, updateData);
        }

    } catch (error) {
      console.error("Error saving data to Firestore:", error);
    }
  }, []);

  const setTransactions = useCallback((newTransactions: Transaction[]) => {
    setTransactionsState(newTransactions);
    setBalanceState(calculateBalance(newTransactions));
    if (!user) {
        saveDataToGuestStorage({ transactions: newTransactions, goals });
    } else {
        // For logged-in users, transactions are managed via individual actions
    }
  }, [user, goals]);

  const addTransaction = useCallback(async (newTransaction: Omit<Transaction, 'id'>) => {
      const newId = Date.now();
      const transactionWithId = { ...newTransaction, id: newId };
      const updatedTransactions = [transactionWithId, ...transactions];
      setTransactionsState(updatedTransactions);
      setBalanceState(calculateBalance(updatedTransactions));
      
      if (user) {
          await addDoc(collection(db, 'users', user.uid, 'transactions'), transactionWithId);
          await syncFirestoreData(user.uid, { transactions: updatedTransactions });
      } else {
          saveDataToGuestStorage({ transactions: updatedTransactions, goals });
      }
  }, [transactions, goals, user, syncFirestoreData]);

  const updateTransaction = useCallback(async (updatedTransaction: Transaction) => {
    const updatedTransactions = transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
    setTransactionsState(updatedTransactions);
    setBalanceState(calculateBalance(updatedTransactions));

    if(user) {
        const transQuery = query(collection(db, 'users', user.uid, 'transactions'), where("id", "==", updatedTransaction.id));
        const querySnapshot = await getDocs(transQuery);
        if(!querySnapshot.empty) {
            const docRef = querySnapshot.docs[0].ref;
            await updateDoc(docRef, updatedTransaction);
        }
        await syncFirestoreData(user.uid, { transactions: updatedTransactions });
    } else {
        saveDataToGuestStorage({ transactions: updatedTransactions, goals });
    }
  }, [transactions, goals, user, syncFirestoreData]);

  const deleteTransaction = useCallback(async (transactionId: number) => {
      const updatedTransactions = transactions.filter(t => t.id !== transactionId);
      setTransactionsState(updatedTransactions);
      setBalanceState(calculateBalance(updatedTransactions));

      if (user) {
        const transQuery = query(collection(db, 'users', user.uid, 'transactions'), where("id", "==", transactionId));
        const querySnapshot = await getDocs(transQuery);

        if (!querySnapshot.empty) {
            await deleteDoc(querySnapshot.docs[0].ref);
        }
        await syncFirestoreData(user.uid, { transactions: updatedTransactions });
      } else {
          saveDataToGuestStorage({ transactions: updatedTransactions, goals });
      }
  }, [transactions, goals, user, syncFirestoreData]);

  const addGoal = useCallback(async (newGoal: Omit<Goal, 'id'>) => {
      const newId = Date.now();
      const goalWithId = { ...newGoal, id: newId };
      const updatedGoals = [goalWithId, ...goals];
      setGoalsState(updatedGoals);

      if (user) {
          await syncFirestoreData(user.uid, { goals: updatedGoals });
      } else {
          saveDataToGuestStorage({ transactions, goals: updatedGoals });
      }
  }, [goals, transactions, user, syncFirestoreData]);
  

  useEffect(() => {
    let unsubscribeFromTransactions: (() => void) | undefined;

    const unsubscribeFromAuth = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (unsubscribeFromTransactions) unsubscribeFromTransactions();

      if (user) {
        setUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          setGoalsState(data.goals || []);

          const transRef = collection(db, 'users', user.uid, 'transactions');
          const q = query(transRef);
          unsubscribeFromTransactions = onSnapshot(q, (snapshot) => {
              const fetchedTransactions = snapshot.docs.map(doc => doc.data() as Transaction);
              setTransactionsState(fetchedTransactions);
              setBalanceState(calculateBalance(fetchedTransactions));
          });
        }
      } else {
        setUser(null);
        try {
            const localData = localStorage.getItem(GUEST_DATA_KEY);
            const guestData = localData ? JSON.parse(localData) : defaultGuestData;
            setTransactionsState(guestData.transactions || []);
            setGoalsState(guestData.goals || []);
            setBalanceState(guestData.balance || 0);
        } catch (error) {
            console.error("Error loading guest data:", error)
            setTransactionsState(defaultGuestData.transactions);
            setGoalsState(defaultGuestData.goals);
            setBalanceState(defaultGuestData.balance);
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribeFromAuth();
      if (unsubscribeFromTransactions) unsubscribeFromTransactions();
    };
  }, []);

  const login = async (email: string, pass: string) => {
    const localData = localStorage.getItem(GUEST_DATA_KEY);
    const guestData = localData ? JSON.parse(localData) : defaultGuestData;

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
        const mergedTransactions = [...firestoreData.transactions, ...guestData.transactions];
        const finalBalance = calculateBalance(mergedTransactions);

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
    const localData = localStorage.getItem(GUEST_DATA_KEY);
    const guestData = localData ? JSON.parse(localData) : defaultGuestData;
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: userCredential.user.email,
      createdAt: serverTimestamp(),
      balance: calculateBalance(guestData.transactions),
      goals: guestData.goals
    });

    const batch = writeBatch(db);
    const transRef = collection(db, 'users', userCredential.user.uid, 'transactions');
    guestData.transactions.forEach((t: Transaction) => {
        const newTransRef = doc(transRef);
        batch.set(newTransRef, t);
    });
    await batch.commit();

    localStorage.removeItem(GUEST_DATA_KEY);
  };


  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    balance,
    transactions,
    goals,
    setTransactions,
    addTransaction,
    updateTransaction,
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
