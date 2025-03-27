import React from 'react';
import { Student } from './StudentCard';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Download, Share2, Printer, ListFilter } from 'lucide-react';
import BeltDisplay from './BeltDisplay';
import { motion } from "framer-motion";

interface ExamResultsProps {
  students: Student[];
  examDate: Date | undefined;
  examLocation: string;
  kihonScores: {[key: number]: number};
  kataScores: {[key: number]: number};
  kumiteScores: {[key: number]: number};
  knowledgeScores: {[key: number]: number};
  examinerNotes: {[key: number]: string};
  onPrint: (studentId: number) => void;
  onShare: (studentId: number) => void;
  onDownload: (studentId: number) => void;
  onPrintList: () => void;
}

export const ExamResults: React.FC<ExamResultsProps> = ({
  students,
  examDate,
  examLocation,
  kihonScores,
  kataScores,
  kumiteScores,
  knowledgeScores,
  examinerNotes,
  onPrint,
  onShare,
  onDownload,
  onPrintList
}) => {
  const calculateResults = (student: Student) => {
    const scores = [];
    
    if (kihonScores[student.id] !== undefined) scores.push(kihonScores[student.id]);
    if (kataScores[student.id] !== undefined) scores.push(kataScores[student.id]);
    
    if (student.targetBelt !== "Amarela" && kumiteScores[student.id] !== undefined) {
      scores.push(kumiteScores[student.id]);
    }
    
    if ((student.targetBelt === "Preta" || student.targetBelt === "Dans") && 
        knowledgeScores[student.id] !== undefined) {
      scores.push(knowledgeScores[student.id]);
    }
    
    if (scores.length === 0) return { average: "0.0", passed: false };
    
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = sum / scores.length;
    
    return {
      average: average.toFixed(1),
      passed: average >= 6
    };
  };

  const passedCount = students.filter(student => calculateResults(student).passed).length;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Resultados do Exame</h2>
        <p className="text-muted-foreground">
          Local: {examLocation} • Data: {examDate ? examDate.toLocaleDateString('pt-BR') : 'Não definida'}
        </p>
        <div className="flex justify-center gap-3 mt-4">
          <Badge variant="outline" className="bg-primary/10 text-primary">
            Total: {students.length} aluno(s)
          </Badge>
          <Badge variant="outline" className="bg-green-500/10 text-green-600">
            Aprovados: {passedCount}
          </Badge>
          <Badge variant="outline" className="bg-red-500/10 text-red-600">
            Reprovados: {students.length - passedCount}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-2 h-6"
            onClick={onPrintList}
          >
            <ListFilter className="h-3 w-3 mr-1" />
            Imprimir Lista
          </Button>
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {students.map((student, index) => {
          const result = calculateResults(student);
          
          return (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`border-l-4 ${result.passed ? 'border-l-green-500' : 'border-l-red-500'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex-shrink-0">
                        <BeltDisplay 
                          belt={student.targetBelt} 
                          danStage={student.danStage} 
                          className="w-full" 
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{student.name}</h3>
                        <p className="text-xs text-muted-foreground">{student.club}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="flex items-center">
                        {result.passed ? (
                          <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1 text-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            Aprovado
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="flex items-center gap-1 text-xs">
                            <XCircle className="w-3 h-3" />
                            Reprovado
                          </Badge>
                        )}
                      </div>
                      <span className="text-xl font-bold mt-1">{result.average}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    <div className="text-center p-1 bg-muted rounded-md">
                      <div className="text-xs font-medium">Kihon</div>
                      <div className="text-sm">{kihonScores[student.id] || 0}</div>
                    </div>
                    <div className="text-center p-1 bg-muted rounded-md">
                      <div className="text-xs font-medium">Kata</div>
                      <div className="text-sm">{kataScores[student.id] || 0}</div>
                    </div>
                    {student.targetBelt !== "Amarela" && (
                      <div className="text-center p-1 bg-muted rounded-md">
                        <div className="text-xs font-medium">Kumitê</div>
                        <div className="text-sm">{kumiteScores[student.id] || 0}</div>
                      </div>
                    )}
                    {(student.targetBelt === "Preta" || student.targetBelt === "Dans") && (
                      <div className="text-center p-1 bg-muted rounded-md">
                        <div className="text-xs font-medium">Conhecimentos</div>
                        <div className="text-sm">{knowledgeScores[student.id] || 0}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-row gap-1 mt-3 pt-2 border-t">
                    <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7" onClick={() => onPrint(student.id)}>
                      <Printer className="h-3 w-3 mr-1" />
                      Imprimir
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs px-2 py-1 h-7" onClick={() => onShare(student.id)}>
                      <Share2 className="h-3 w-3 mr-1" />
                      Compartilhar
                    </Button>
                    <Button size="sm" className="text-xs px-2 py-1 h-7" onClick={() => onDownload(student.id)}>
                      <Download className="h-3 w-3 mr-1" />
                      Baixar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
