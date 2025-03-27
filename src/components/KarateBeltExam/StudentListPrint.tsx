
import React, { forwardRef } from 'react';
import { Student } from './StudentCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { CheckCircle, XCircle } from 'lucide-react';

interface StudentListPrintProps {
  students: Student[];
  examDate: Date | undefined;
  examLocation: string;
  kihonScores: {[key: number]: number};
  kataScores: {[key: number]: number};
  kumiteScores: {[key: number]: number};
  knowledgeScores: {[key: number]: number};
}

export const StudentListPrint = forwardRef<HTMLDivElement, StudentListPrintProps>(({
  students,
  examDate,
  examLocation,
  kihonScores,
  kataScores,
  kumiteScores,
  knowledgeScores
}, ref) => {

  // Calculate average score and determine if passed
  const calculateResults = (student: Student) => {
    const scores = [];
    
    // Always include kihon and kata
    if (kihonScores[student.id] !== undefined) scores.push(kihonScores[student.id]);
    if (kataScores[student.id] !== undefined) scores.push(kataScores[student.id]);
    
    // Only include kumite score for non-yellow belt candidates
    if (student.targetBelt !== "Amarela" && kumiteScores[student.id] !== undefined) {
      scores.push(kumiteScores[student.id]);
    }
    
    // Only include knowledge score for black belt or dan candidates
    if ((student.targetBelt === "Preta" || student.targetBelt === "Dans") && 
        knowledgeScores[student.id] !== undefined) {
      scores.push(knowledgeScores[student.id]);
    }
    
    if (scores.length === 0) return { average: 0, passed: false };
    
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = sum / scores.length;
    
    return {
      average: average,
      passed: average >= 6
    };
  };

  return (
    <div ref={ref} className="p-4 max-w-4xl mx-auto print-container">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-1">Resultado do Exame de Faixa FBKI</h1>
        <p className="text-sm">
          Local: {examLocation} • 
          Data: {examDate ? format(examDate, 'dd/MM/yyyy') : 'Não definida'}
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Idade</TableHead>
            <TableHead>Clube</TableHead>
            <TableHead>Faixa Pretendida</TableHead>
            <TableHead className="text-right">Média</TableHead>
            <TableHead className="text-center">Resultado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            const result = calculateResults(student);
            return (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.age}</TableCell>
                <TableCell>{student.club}</TableCell>
                <TableCell>{student.targetBelt} {student.danStage ? `(${student.danStage})` : ''}</TableCell>
                <TableCell className="text-right font-bold">{result.average.toFixed(1)}</TableCell>
                <TableCell className="text-center">
                  {result.passed ? (
                    <div className="inline-flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span>Aprovado</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center text-red-600">
                      <XCircle className="w-4 h-4 mr-1" />
                      <span>Reprovado</span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="text-center text-xs text-muted-foreground mt-6 pt-4 border-t">
        Federação Baiana de Karatê Interestilo - Exame de Faixa
      </div>
    </div>
  );
});

StudentListPrint.displayName = "StudentListPrint";
