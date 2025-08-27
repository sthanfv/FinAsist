"use client";

import { utils, writeFile, read } from 'xlsx';
import { ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { Transaction } from './TransactionTable';


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
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-wrap gap-4">
      <Button
        onClick={handleExport}
        disabled={transactions.length === 0}
        variant="outline"
      >
        <Download className="mr-2 h-4 w-4" />
        Exportar a Excel
      </Button>
      <Button asChild variant="outline">
        <label>
            <Upload className="mr-2 h-4 w-4" />
            Importar desde Excel
            <input type="file" accept=".xlsx, .csv" onChange={handleImport} className="hidden" />
        </label>
      </Button>
    </div>
  );
}
