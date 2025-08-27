"use client";
import Layout from '@/components/layout';
import TransactionTable, { Transaction } from '@/components/transactions/TransactionTable';
import AddTransactionForm from '@/components/transactions/AddTransactionForm';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ExportImport from '@/components/transactions/ExportImport';
import { useToast } from '@/hooks/use-toast';

export default function TransactionsPage() {
    const { transactions, addTransaction, setTransactions, loading, balance, setBalance, deleteTransaction } = useAppContext();
    const [isFormVisible, setIsFormVisible] = useState(false);
    const { toast } = useToast();

    if (loading) {
      return <Layout><div className="flex h-full items-center justify-center"><p>Cargando datos...</p></div></Layout>;
    }
    
    const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
        addTransaction(newTransaction);
        setIsFormVisible(false);
    };

    const handleUpdate = (updated: Transaction) => {
      const updatedTransactions = transactions.map((t) => (t.id === updated.id ? updated : t));
      setTransactions(updatedTransactions);
    };
    
    const handleDelete = async (id: number) => {
      try {
        await deleteTransaction(id);
        toast({ title: 'Éxito', description: 'Transacción eliminada correctamente.' });
      } catch (error) {
        toast({ title: 'Error', description: 'No se pudo eliminar la transacción.', variant: 'destructive' });
      }
    };


    const handleImport = (imported: any[]) => {
        const formatted = imported.map((t, index) => ({
          id: transactions.length + index + 1,
          date: t.date || new Date().toISOString().split('T')[0],
          category: t.category || 'Importado',
          type: t.type === 'Ingreso' ? 'Ingreso' : 'Gasto',
          amount: Number(t.amount) || 0,
          account: t.account || 'Principal',
          note: t.note || '',
        }));
    
        let newBalance = 0;
        formatted.forEach(t => {
            if (t.type === 'Ingreso') {
                newBalance += t.amount;
            } else {
                newBalance -= t.amount;
            }
        });
    
        setTransactions(formatted);
        setBalance(newBalance);
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
                <ExportImport transactions={transactions} onImport={handleImport} />
                <TransactionTable transactions={transactions} onUpdate={handleUpdate} onDelete={handleDelete} />
            </div>
        </Layout>
    );
}
