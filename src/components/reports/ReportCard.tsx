
"use client";
import { utils, writeFile } from 'xlsx';
import { ChartComponent } from '@/components/dashboard/ChartComponent';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, FileText } from 'lucide-react';
import dynamic from 'next/dynamic';

const jsPDF = dynamic(() => import('jspdf').then(mod => mod.jsPDF), { ssr: false });
import 'jspdf-autotable'; // Import jspdf-autotable

// Extend jsPDF interface
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

type ReportData = { [key: string]: any };

type Props = {
  title: string;
  data: ReportData[];
  dataKey: string;
  xAxisKey: string;
  type: 'bar' | 'line';
  config?: any;
};

export default function ReportCard({ title, data, dataKey, xAxisKey, type, config }: Props) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  };
  
  const handleExportExcel = () => {
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, title);
    writeFile(wb, `${title.replace(/ /g, '_')}.xlsx`);
  };

  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    
    if (data.length > 0) {
      const head = [Object.keys(data[0])];
      const body = data.map(row => Object.values(row));
      
      doc.autoTable({
        startY: 30,
        head: head,
        body: body,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }, // Tailwind's blue-600
      });
    }

    doc.save(`${title.replace(/ /g, '_')}.pdf`);
  };

  const chartConfig = config || { [dataKey]: { label: dataKey, color: 'hsl(var(--primary))'}};

  return (
    <Card className="shadow-soft rounded-xl mb-8">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartComponent data={data} dataKey={dataKey} xAxisKey={xAxisKey} type={type} config={chartConfig} />
        ) : (
          <p className="text-muted-foreground text-center py-10">No hay datos para mostrar en este reporte.</p>
        )}
      </CardContent>
       <CardFooter className="flex flex-wrap gap-4">
        <Button onClick={handleExportExcel} disabled={data.length === 0}>
          <FileDown className="mr-2 h-4 w-4" />
          Exportar a Excel
        </Button>
        <Button onClick={handleExportPDF} variant="secondary" disabled={data.length === 0}>
           <FileText className="mr-2 h-4 w-4" />
          Exportar a PDF
        </Button>
      </CardFooter>
    </Card>
  );
}
