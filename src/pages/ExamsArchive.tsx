
import React, { useRef } from 'react';
import Header from '@/components/KarateBeltExam/Header';
import Footer from '@/components/KarateBeltExam/Footer';
import { ExamsArchive as ExamsArchiveComponent } from '@/components/KarateBeltExam/ExamsArchive';
import { StudentListPrint } from '@/components/KarateBeltExam/StudentListPrint';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ExamsArchivePage = () => {
  const printRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    documentTitle: 'Exame de Faixa - Lista de Alunos',
    contentRef: printRef,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
    onAfterPrint: () => {
      console.log('Impressão concluída');
    }
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-28 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Arquivo de Exames</h1>
            <Button 
              onClick={() => handlePrint()} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir Lista de Resultados
            </Button>
          </div>
          
          <Card className="mb-6 print:hidden">
            <CardContent className="p-6">
              <ExamsArchiveComponent />
            </CardContent>
          </Card>
          
          {/* Hidden element for printing */}
          <div className="hidden">
            <div ref={printRef}>
              <StudentListPrint />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExamsArchivePage;
