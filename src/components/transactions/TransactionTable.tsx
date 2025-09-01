"use client";
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { Transaction } from '@/store/useAppStore';

type Props = {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
};

const TransactionRow = ({ transaction, onEdit, onDelete, style }: { transaction: Transaction; onEdit: (transaction: Transaction) => void; onDelete: (id: string) => void, style: React.CSSProperties }) => {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };
  
  return (
    <TableRow style={style} className="flex items-center">
      <TableCell className="w-1/6">{transaction.date}</TableCell>
      <TableCell className="w-1/6">{transaction.category}</TableCell>
      <TableCell className={`w-1/6 ${transaction.type === 'expense' ? 'text-destructive' : 'text-accent'}`}>
        {transaction.type === 'expense' ? 'Gasto' : 'Ingreso'}
      </TableCell>
      <TableCell className="w-2/6 truncate">{transaction.description}</TableCell>
      <TableCell className="w-1/6 text-right">{formatCurrency(transaction.amount)}</TableCell>
      <TableCell className="w-1/6 flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(transaction)}>
          <Edit className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(transaction.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default function TransactionTable({ transactions, onEdit, onDelete }: Props) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filtered = transactions.filter(
    (t) =>
      (filterCategory !== 'all' ? t.category === filterCategory : true) &&
      (filterType !== 'all' ? t.type === filterType : true)
  );
  
  const categories = [...new Set(transactions.map(t => t.category))];
  
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 57, // Ajusta este valor a la altura de tus filas
    overscan: 5,
  });


  return (
    <div className="bg-card shadow-soft rounded-xl p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 min-w-[140px] bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 min-w-[120px] bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          >
            <option value="all">Todos los tipos</option>
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
          </select>
        </div>
      </div>

      <div ref={parentRef} className="h-[600px] overflow-auto relative">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow className="flex items-center">
              <TableHead className="w-1/6">Fecha</TableHead>
              <TableHead className="w-1/6">Categoría</TableHead>
              <TableHead className="w-1/6">Tipo</TableHead>
              <TableHead className="w-2/6">Nota</TableHead>
              <TableHead className="w-1/6 text-right">Monto</TableHead>
              <TableHead className="w-1/6 text-right pr-8">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody style={{ height: `${rowVirtualizer.getTotalSize()}px` }} className="relative">
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const transaction = filtered[virtualItem.index];
              return (
                <motion.div
                  key={virtualItem.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: virtualItem.index * 0.02 }}
                >
                  <TransactionRow
                    transaction={transaction}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    style={{
                      height: '100%',
                      width: '100%',
                    }}
                  />
                </motion.div>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
