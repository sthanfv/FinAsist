"use client";
import { utils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import { ChartComponent } from '@/components/dashboard/ChartComponent';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, FileText } from 'lucide-react';

type ReportData = { name: string; amount: number };

type Props = {
  title: string;
  data: ReportData[];
};

export default function ReportCard({ title, data }: Props) {
  const handleExportExcel = () => {
    const ws = utils.json_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, title);
    writeFile(wb, `${title.replace(/ /g, '_')}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    
    let y = 30;
    data.forEach((d) => {
      // Basic check to avoid page overflow
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${d.name}: ${d.amount.toLocaleString('es-ES')} pts`, 14, y);
      y += 7;
    });

    doc.save(`${title.replace(/ /g, '_')}.pdf`);
  };

  return (
    <Card className="shadow-soft rounded-xl mb-8">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartComponent data={data} />
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
