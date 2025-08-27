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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export type Transaction = {
  id: number;
  date: string;
  category: string;
  type: 'Ingreso' | 'Gasto';
  amount: number;
  account: string;
  note: string;
};

type Props = {
  transactions: Transaction[];
  onUpdate?: (updated: Transaction) => void;
};

export default function TransactionTable({ transactions, onUpdate }: Props) {
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');

  const filtered = transactions.filter(
    (t) =>
      (filterCategory ? t.category === filterCategory : true) &&
      (filterType ? t.type === filterType : true)
  );
  
  const categories = [...new Set(transactions.map(t => t.category))];

  return (
    <div className="bg-card shadow-soft rounded-xl p-4">
      <div className="flex flex-wrap gap-4 mb-4">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las categorías</SelectItem>
            {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los tipos</SelectItem>
            <SelectItem value="Ingreso">Ingreso</SelectItem>
            <SelectItem value="Gasto">Gasto</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Nota</TableHead>
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
                  className={t.type === 'Gasto' ? 'text-destructive' : 'text-accent'}
                >
                  {t.type}
                </TableCell>
                <TableCell className="text-right">{t.amount.toLocaleString('es-ES')} pts</TableCell>
                <TableCell>{t.account}</TableCell>
                <TableCell>{t.note}</TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
