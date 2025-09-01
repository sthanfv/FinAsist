

"use client";
import Layout from '@/components/layout';
import TransactionTable from '@/components/transactions/TransactionTable';
import AddTransactionForm from '@/components/transactions/AddTransactionForm';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ExportImport from '@/components/transactions/ExportImport';
import BackButton from '@/components/BackButton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EditTransactionForm from '@/components/transactions/EditTransactionForm';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useTransactions } from '@/store/selectors';
import type { Transaction } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { NotificationSystem } from '@/components/ui/toast-system';

export default function TransactionsPage() {
    const transactions = useTransactions();
    const { addTransaction, setTransactions, updateTransaction, deleteTransaction } = useAppStore(
      (state) => ({
        addTransaction: state.addTransaction,
        setTransactions: state.setTransactions,
        updateTransaction: state.updateTransaction,
        deleteTransaction: state.deleteTransaction,
      })
    );

    const [isAddFormVisible, setIsAddFormVisible] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const router = useRouter();

    const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id' | 'createdAt'>) => {
        await addTransaction(newTransaction);
        setIsAddFormVisible(false);
        NotificationSystem.success('Transacción añadida correctamente.');
    };

    const handleEditClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsEditModalOpen(true);
    };

    const handleUpdateTransaction = async (id: string, updatedData: Partial<Transaction>) => {
        await updateTransaction(id, updatedData);
        setIsEditModalOpen(false);
        setSelectedTransaction(null);
        NotificationSystem.success('Transacción actualizada correctamente.');
    };
    
    const handleDelete = async (id: string) => {
      try {
        await deleteTransaction(id);
        NotificationSystem.success('Transacción eliminada correctamente.');
      } catch (error) {
        NotificationSystem.error('No se pudo eliminar la transacción.');
      }
    };

    const handleImport = (imported: any[]) => {
        const formatted: Transaction[] = imported.map((t, index) => ({
          id: `${Date.now() + index}`,
          date: t.date || new Date().toISOString().split('T')[0],
          category: t.category || 'Importado',
          type: t.type === 'income' ? 'income' : 'expense',
          amount: Number(t.amount) || 0,
          description: t.description || '',
          createdAt: new Date().toISOString(),
        }));
    
        setTransactions(formatted);
        NotificationSystem.success('Datos importados correctamente.');
      };

    return (
        <Layout>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 text-white p-6 rounded-b-2xl shadow-xl mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <BackButton />
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight">Transacciones</h1>
                      <p className="text-green-100 text-sm">Gestiona tus ingresos y gastos</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsAddFormVisible(!isAddFormVisible)}
                    className="group bg-white text-green-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:rotate-12"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="container mx-auto py-2">
                   {isAddFormVisible && (
                      <motion.div 
                        className="mb-6"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                          <AddTransactionForm onAddTransaction={handleAddTransaction} />
                      </motion.div>
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
