"use client";

import { utils, writeFile, read } from 'xlsx';
import { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';

type Transaction = {
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
  onImport: (data: any[]) => void;
};

export default function ExportImport({ transactions, onImport }: Props) {
  const handleExport = () => {
    const ws = utils.json_to_sheet(transactions);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Transacciones');
    writeFile(wb, 'transacciones.xlsx');
  };

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = utils.sheet_to_json(sheet);
        onImport(json);
      } catch (error) {
        console.error("Error al importar el archivo:", error);
        // Podrías mostrar una notificación al usuario aquí
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset file input to allow re-uploading the same file
    e.target.value = '';
  };

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Button
        onClick={handleExport}
        disabled={transactions.length === 0}
      >
        Exportar a Excel
      </Button>
      <Button asChild variant="secondary">
        <label>
            Importar desde Excel
            <input type="file" accept=".xlsx, .csv" onChange={handleImport} className="hidden" />
        </label>
      </Button>
    </div>
  );
}
