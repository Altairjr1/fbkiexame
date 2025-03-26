
import React from 'react';
import { Student } from './StudentCard';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Download, Share2, Printer } from 'lucide-react';
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
  onDownload
}) => {
  // Calculate average score and determine if passed
  const calculateResults = (student: Student) => {
    const scores = [
      kihonScores[student.id] || 0,
      kataScores[student.id] || 0,
      kumiteScores[student.id] || 0
    ];
    
    // Only include knowledge score for black belt or dan candidates
    if (student.targetBelt === "Preta" || student.targetBelt === "Dans") {
      scores.push(knowledgeScores[student.id] || 0);
    }
    
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = sum / scores.length;
    
    return {
      average: average.toFixed(1),
      passed: average >= 6
    };
  };

  // Count passed and failed students
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
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex-shrink-0">
                        <BeltDisplay 
                          belt={student.targetBelt} 
                          danStage={student.danStage} 
                          className="w-full" 
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">{student.club}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="flex items-center">
                        {result.passed ? (
                          <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aprovado
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            Reprovado
                          </Badge>
                        )}
                      </div>
                      <span className="text-2xl font-bold mt-1">{result.average}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="text-center p-2 bg-muted rounded-md">
                      <div className="text-sm font-medium">Kihon</div>
                      <div className="text-lg">{kihonScores[student.id] || 0}</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-md">
                      <div className="text-sm font-medium">Kata</div>
                      <div className="text-lg">{kataScores[student.id] || 0}</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-md">
                      <div className="text-sm font-medium">Kumitê</div>
                      <div className="text-lg">{kumiteScores[student.id] || 0}</div>
                    </div>
                    {(student.targetBelt === "Preta" || student.targetBelt === "Dans") && (
                      <div className="text-center p-2 bg-muted rounded-md">
                        <div className="text-sm font-medium">Conhecimentos</div>
                        <div className="text-lg">{knowledgeScores[student.id] || 0}</div>
                      </div>
                    )}
                  </div>
                  
                  {examinerNotes[student.id] && (
                    <div className="mt-3 text-sm">
                      <p className="font-medium">Observações:</p>
                      <p className="text-muted-foreground italic mt-1">"{examinerNotes[student.id]}"</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => onPrint(student.id)}>
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => onShare(student.id)}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartilhar
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => onDownload(student.id)}>
                      <Download className="h-4 w-4 mr-2" />
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
