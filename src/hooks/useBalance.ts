"use client";

import { useState, useEffect } from 'react';

/**
 * A placeholder hook to simulate fetching a user's balance.
 * In a real application, this would make an API call.
 */
export const useBalance = (initialBalance: number = 0) => {
  const [balance, setBalance] = useState<number>(initialBalance);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate a network request
    const timer = setTimeout(() => {
      setBalance(5432.10); // Example balance
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return { balance, loading, setBalance };
};
