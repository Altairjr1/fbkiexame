
import React, { useRef, useState, useEffect } from 'react';
import Header from '@/components/KarateBeltExam/Header';
import Footer from '@/components/KarateBeltExam/Footer';
import { ExamsArchive as ExamsArchiveComponent } from '@/components/KarateBeltExam/ExamsArchive';
import { StudentListPrint } from '@/components/KarateBeltExam/StudentListPrint';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Printer, FileDown, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';

const ExamsArchivePage = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [examData, setExamData] = useState(null);
  
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('exams')
          .select('*')
          .order('date', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        setExamData(data);
      } catch (error) {
        console.error('Error fetching exam data:', error);
        setError(handleSupabaseError(error));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExamData();
  }, []);
  
  const handlePrint = useReactToPrint({
    documentTitle: 'Exame de Faixa - Lista de Alunos',
    // Fix: Change content function to contentRef property
    contentRef: () => printRef.current,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          font-family: 'Arial', sans-serif;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 8px;
          border: 1px solid #ddd;
          font-size: 11pt;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        h1, h2 {
          text-align: center;
          margin: 10mm 0 5mm 0;
        }
        .print-header {
          text-align: center;
          margin-bottom: 10mm;
        }
        .print-footer {
          position: fixed;
          bottom: 5mm;
          width: 100%;
          text-align: center;
          font-size: 9pt;
          color: #666;
        }
        .summary {
          margin: 5mm 0;
          display: flex;
          justify-content: space-around;
        }
      }
    `,
    onAfterPrint: () => {
      console.log('Impressão concluída');
      toast({
        title: "Impressão concluída",
        description: "A lista de resultados foi enviada para impressão."
      });
    },
    onPrintError: (error) => {
      console.error('Erro na impressão:', error);
      toast({
        variant: "destructive",
        title: "Erro na impressão",
        description: "Ocorreu um erro ao tentar imprimir. Tente novamente."
      });
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-28 pb-12">
        <div className="container mx-auto px-4">
          <motion.div 
            className="mb-6 flex justify-between items-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.h1 className="text-2xl font-bold" variants={itemVariants}>
              Arquivo de Exames
            </motion.h1>
            <motion.div variants={itemVariants}>
              <Button 
                onClick={() => handlePrint()} 
                variant="outline" 
                className="flex items-center gap-2"
                disabled={isLoading || !!error}
              >
                <Printer className="h-4 w-4" />
                Imprimir Lista de Resultados
              </Button>
            </motion.div>
          </motion.div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 border border-red-300 bg-red-50 rounded-md text-red-600 flex items-center"
            >
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </motion.div>
          )}
          
          {isLoading ? (
            <motion.div 
              className="mb-6 p-10 border rounded-md flex justify-center items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-muted-foreground">Carregando dados do exame...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <Card className="mb-6 print:hidden">
                  <CardContent className="p-6">
                    <ExamsArchiveComponent />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
          
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
