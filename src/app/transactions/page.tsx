"use client";
import Layout from '@/components/layout';
import TransactionTable, { Transaction } from '@/components/transactions/TransactionTable';
import AddTransactionForm from '@/components/transactions/AddTransactionForm';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useBalance } from '@/hooks/useBalance';

const initialTransactions: Transaction[] = [
    { id: 1, date: '2025-08-01', category: 'Universidad', type: 'Gasto', amount: 4000, account: 'Principal', note: 'Pago semestre' },
    { id: 2, date: '2025-08-03', category: 'Ocio', type: 'Gasto', amount: 1500, account: 'Principal', note: 'Cine' },
    { id: 3, date: '2025-08-05', category: 'Transporte', type: 'Gasto', amount: 1200, account: 'Principal', note: 'Gasolina' },
    { id: 4, date: '2025-08-10', category: 'Ahorro', type: 'Gasto', amount: 2000, account: 'Ahorro', note: 'Meta mensual' },
];

export default function TransactionsPage() {
    const { balance, setBalance } = useBalance(10000);
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
        const newId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
        const transactionWithId = { ...newTransaction, id: newId };
        
        setTransactions(prev => [transactionWithId, ...prev]);

        if (newTransaction.type === 'Ingreso') {
            setBalance(prev => prev + newTransaction.amount);
        } else {
            setBalance(prev => prev - newTransaction.amount);
        }

        setIsFormVisible(false);
    };

    const handleUpdate = (updated: Transaction) => {
        setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    };

    return (
        <Layout>
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-4xl font-bold font-headline">Transacciones</h1>
                    <Button onClick={() => setIsFormVisible(!isFormVisible)}>
                        {isFormVisible ? 'Cerrar Formulario' : 'Añadir Transacción'}
                    </Button>
                </div>
                {isFormVisible && (
                    <div className="mb-6">
                        <AddTransactionForm onAddTransaction={handleAddTransaction} />
                    </div>
                )}
                <TransactionTable transactions={transactions} onUpdate={handleUpdate} />
            </div>
        </Layout>
    );
}
