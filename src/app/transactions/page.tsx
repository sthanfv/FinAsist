"use client";
import Layout from '@/components/layout';
import TransactionTable, { Transaction } from '@/components/transactions/TransactionTable';
import AddTransactionForm from '@/components/transactions/AddTransactionForm';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import ExportImport from '@/components/transactions/ExportImport';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EditTransactionForm from '@/components/transactions/EditTransactionForm';

export default function TransactionsPage() {
    const { transactions, addTransaction, setTransactions, loading, balance, updateTransaction, deleteTransaction } = useAppContext();
    const [isAddFormVisible, setIsAddFormVisible] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const { toast } = useToast();

    if (loading) {
      return <Layout><div className="flex h-full items-center justify-center"><p>Cargando datos...</p></div></Layout>;
    }
    
    const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
        addTransaction(newTransaction);
        setIsAddFormVisible(false);
        toast({ title: 'Éxito', description: 'Transacción añadida correctamente.' });
    };

    const handleEditClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsEditModalOpen(true);
    };

    const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
        await updateTransaction(updatedTransaction);
        setIsEditModalOpen(false);
        setSelectedTransaction(null);
        toast({ title: 'Éxito', description: 'Transacción actualizada correctamente.' });
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
          id: Date.now() + index, // More robust ID generation
          date: t.date || new Date().toISOString().split('T')[0],
          category: t.category || 'Importado',
          type: t.type === 'Ingreso' ? 'Ingreso' : 'Gasto',
          amount: Number(t.amount) || 0,
          account: t.account || 'Principal',
          note: t.note || '',
        }));
    
        // Recalculate balance from scratch based on imported data
        const newBalance = formatted.reduce((acc, t) => {
            return t.type === 'Ingreso' ? acc + t.amount : acc - t.amount;
        }, 0);
    
        setTransactions(formatted);
        toast({ title: 'Éxito', description: 'Datos importados correctamente.' });
      };

    return (
        <Layout>
            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <BackButton />
                        <h1 className="text-4xl font-bold font-headline">Transacciones</h1>
                    </div>
                    <Button onClick={() => setIsAddFormVisible(!isAddFormVisible)}>
                        {isAddFormVisible ? 'Cerrar Formulario' : 'Añadir Transacción'}
                    </Button>
                </div>
                 {isAddFormVisible && (
                    <div className="mb-6">
                        <AddTransactionForm onAddTransaction={handleAddTransaction} />
                    </div>
                )}
                <div className="mb-6">
                    <ExportImport transactions={transactions} onImport={handleImport} />
                </div>
                <TransactionTable 
                    transactions={transactions} 
                    onEdit={handleEditClick} 
                    onDelete={handleDelete} 
                />
            </div>
            {selectedTransaction && (
               <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar Transacción</DialogTitle>
                        </DialogHeader>
                        <EditTransactionForm 
                            transaction={selectedTransaction} 
                            onUpdateTransaction={handleUpdateTransaction}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </Layout>
    );
}
