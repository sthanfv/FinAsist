"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
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

export default function TransactionTable({ transactions, onEdit, onDelete }: Props) {
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filtered = transactions.filter(
    (t) =>
      (filterCategory !== 'all' ? t.category === filterCategory : true) &&
      (filterType !== 'all' ? t.type === filterType : true)
  );
  
  const categories = [...new Set(transactions.map(t => t.category))];
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

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

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Nota</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((t) => (
              <motion.tr
                key={t.id}
                className="border-b hover:bg-muted/50 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                layout
              >
                <TableCell>{t.date}</TableCell>
                <TableCell>{t.category}</TableCell>
                <TableCell
                  className={t.type === 'expense' ? 'text-destructive' : 'text-accent'}
                >
                  {t.type === 'expense' ? 'Gasto' : 'Ingreso'}
                </TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell className="text-right">{formatCurrency(t.amount)}</TableCell>
                <TableCell className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(t)}>
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
