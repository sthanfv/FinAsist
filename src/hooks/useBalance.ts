"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';

/**
 * A hook to get the balance from the AppContext.
 * This is just a wrapper for convenience.
 */
export const useBalance = () => {
    const { balance, setBalance, loading } = useAppContext();
    return { balance, loading, setBalance };
};
