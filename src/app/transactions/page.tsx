"use client";
import Layout from '@/components/layout';
import TransactionTable from '@/components/transactions/TransactionTable';
import AddTransactionForm from '@/components/transactions/AddTransactionForm';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ExportImport from '@/components/transactions/ExportImport';
import { useToast } from '@/hooks/use-toast';
import BackButton from '@/components/BackButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EditTransactionForm from '@/components/transactions/EditTransactionForm';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import type { Transaction } from '@/components/transactions/TransactionTable';


export default function TransactionsPage() {
    const { transactions, addTransaction, setTransactions, updateTransaction, deleteTransaction } = useAppStore();
    const [isAddFormVisible, setIsAddFormVisible] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const { toast } = useToast();

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
          id: Date.now() + index,
          date: t.date || new Date().toISOString().split('T')[0],
          category: t.category || 'Importado',
          type: t.type === 'Ingreso' ? 'Ingreso' : 'Gasto',
          amount: Number(t.amount) || 0,
          account: t.account || 'Principal',
          note: t.note || '',
        }));
    
        setTransactions(formatted, true);
        toast({ title: 'Éxito', description: 'Datos importados correctamente.' });
      };

    return (
        <Layout>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
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
                   {transactions.length === 0 ? (
                    <div className="text-center py-10 bg-card rounded-xl shadow-soft">
                        <p className="text-muted-foreground mb-4">Aún no tienes transacciones.</p>
                        <Button onClick={() => setIsAddFormVisible(true)}>Añadir tu primera transacción</Button>
                    </div>
                    ) : (
                    <TransactionTable 
                        transactions={transactions} 
                        onEdit={handleEditClick} 
                        onDelete={handleDelete} 
                    />
                  )}
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
            </motion.div>
        </Layout>
    );
}
