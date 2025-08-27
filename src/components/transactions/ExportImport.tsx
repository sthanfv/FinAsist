"use client";

import { utils, writeFile, read } from 'xlsx';
import { ChangeEvent } from 'react';
import { Transaction } from '@/store/useAppStore';

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
    <div className="flex flex-wrap gap-3">
      <button 
        onClick={handleExport}
        disabled={transactions.length === 0}
        className="group flex items-center space-x-2 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <span className="font-medium text-gray-700 dark:text-gray-300">Exportar a Excel</span>
      </button>

      <label className="group flex items-center space-x-2 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] cursor-pointer">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        </div>
        <span className="font-medium text-gray-700 dark:text-gray-300">Importar desde Excel</span>
        <input type="file" accept=".xlsx, .csv" onChange={handleImport} className="hidden" />
      </label>
    </div>
  );
}
