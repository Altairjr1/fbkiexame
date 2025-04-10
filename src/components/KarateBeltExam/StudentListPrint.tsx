import React, { forwardRef, useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface Student {
  id: number | string;
  name: string;
  age: string;
  club: string;
  targetBelt: string;
  danStage?: string;
}

export interface StudentListPrintProps {
  examId?: string;
  students?: Student[];
  examDate?: Date;
  examLocation?: string;
  kihonScores?: {[key: number]: number};
  kataScores?: {[key: number]: number};
  kumiteScores?: {[key: number]: number};
  knowledgeScores?: {[key: number]: number};
  includeAllExamStudents?: boolean;
}

export const StudentListPrint = forwardRef<HTMLDivElement, StudentListPrintProps>(({
  examId,
  students: propStudents,
  examDate: propExamDate,
  examLocation: propExamLocation,
  kihonScores: propKihonScores,
  kataScores: propKataScores,
  kumiteScores: propKumiteScores,
  knowledgeScores: propKnowledgeScores,
  includeAllExamStudents = true
}, ref) => {
  const [students, setStudents] = useState<Student[]>(propStudents || []);
  const [examDate, setExamDate] = useState<Date | undefined>(propExamDate);
  const [examLocation, setExamLocation] = useState(propExamLocation || '');
  const [scores, setScores] = useState<{[key: string]: {
    kihon?: number;
    kata?: number;
    kumite?: number;
    knowledge?: number;
  }}>({});
  const [loading, setLoading] = useState(!propStudents);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (propStudents && propStudents.length > 0) {
        setStudents(propStudents);
        setExamDate(propExamDate);
        setExamLocation(propExamLocation || '');
        
        if (propKihonScores || propKataScores || propKumiteScores || propKnowledgeScores) {
          const newScores: {[key: string]: any} = {};
          
          propStudents.forEach(student => {
            const studentId = student.id.toString();
            newScores[studentId] = {
              kihon: propKihonScores?.[Number(student.id)],
              kata: propKataScores?.[Number(student.id)],
              kumite: propKumiteScores?.[Number(student.id)],
              knowledge: propKnowledgeScores?.[Number(student.id)]
            };
          });
          
          setScores(newScores);
          setLoading(false);
          
          if (!includeAllExamStudents) {
            return;
          }
        }
      }

      try {
        setLoading(true);
        setError(null);
        
        let examToUse;
        if (examId) {
          const { data, error } = await supabase
            .from('exams')
            .select('*')
            .eq('id', examId)
            .maybeSingle();
            
          if (error) throw error;
          examToUse = data;
        } else if (propExamDate && propExamLocation) {
          examToUse = {
            date: propExamDate,
            location: propExamLocation
          };
        } else {
          const { data, error } = await supabase
            .from('exams')
            .select('*')
            .order('date', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (error) throw error;
          examToUse = data;
        }
        
        if (!examToUse) {
          setError('Nenhum exame encontrado.');
          setLoading(false);
          return;
        }
        
        setExamDate(new Date(examToUse.date));
        setExamLocation(examToUse.location);
        
        if (propStudents && propStudents.length > 0 && !includeAllExamStudents) {
          setLoading(false);
          return;
        }
        
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('exam_id', examToUse.id);
        
        if (studentsError) throw studentsError;
        
        const formattedStudents = studentsData.map(student => ({
          id: student.id,
          name: student.name,
          age: student.age,
          club: student.club,
          targetBelt: student.target_belt,
          danStage: student.dan_stage,
          belt: student.current_belt
        }));
        
        if (propStudents && propStudents.length > 0) {
          const existingIds = new Set(formattedStudents.map(s => s.id.toString()));
          
          propStudents.forEach(student => {
            if (!existingIds.has(student.id.toString())) {
              formattedStudents.push(student);
            }
          });
        }
        
        setStudents(formattedStudents);
        
        if (formattedStudents.length > 0) {
          const { data: scoresData, error: scoresError } = await supabase
            .from('scores')
            .select('*')
            .in('student_id', formattedStudents.map(s => s.id));
            
          if (scoresError) throw scoresError;
          
          const newScores: {[key: string]: any} = {};
          
          if (scoresData && scoresData.length > 0) {
            scoresData.forEach(score => {
              newScores[score.student_id] = {
                kihon: score.kihon,
                kata: score.kata,
                kumite: score.kumite,
                knowledge: score.knowledge
              };
            });
          }
          
          if (propStudents && (propKihonScores || propKataScores || propKumiteScores || propKnowledgeScores)) {
            propStudents.forEach(student => {
              const studentId = student.id.toString();
              
              if (!newScores[studentId]) {
                newScores[studentId] = {
                  kihon: propKihonScores?.[Number(student.id)],
                  kata: propKataScores?.[Number(student.id)],
                  kumite: propKumiteScores?.[Number(student.id)],
                  knowledge: propKnowledgeScores?.[Number(student.id)]
                };
              }
            });
          }
          
          setScores(newScores);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do exame:', error);
        setError(handleSupabaseError(error));
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [
    examId, 
    propStudents, 
    propExamDate, 
    propExamLocation, 
    propKihonScores, 
    propKataScores, 
    propKumiteScores, 
    propKnowledgeScores,
    includeAllExamStudents
  ]);

  const calculateResults = (student: Student) => {
    const scoreData = scores[student.id.toString()] || {};
    const scoreValues = [];
    
    if (scoreData.kihon !== undefined) scoreValues.push(scoreData.kihon);
    if (scoreData.kata !== undefined) scoreValues.push(scoreData.kata);
    
    if (student.targetBelt !== "Amarela" && scoreData.kumite !== undefined) {
      scoreValues.push(scoreData.kumite);
    }
    
    if ((student.targetBelt === "Preta" || student.targetBelt === "Dans") && 
        scoreData.knowledge !== undefined) {
      scoreValues.push(scoreData.knowledge);
    }
    
    if (scoreValues.length === 0) return { average: 0, passed: false };
    
    const sum = scoreValues.reduce((acc, score) => acc + score, 0);
    const average = sum / scoreValues.length;
    
    return {
      average: average,
      passed: average >= 6
    };
  };

  const getResultsSummary = () => {
    if (!students.length) return { approved: 0, failed: 0 };
    
    return students.reduce((acc, student) => {
      const result = calculateResults(student);
      if (result.passed) {
        acc.approved += 1;
      } else {
        acc.failed += 1;
      }
      return acc;
    }, { approved: 0, failed: 0 });
  };

  const summary = getResultsSummary();

  const sortedStudents = [...students].sort((a, b) => {
    const aResult = calculateResults(a);
    const bResult = calculateResults(b);
    
    if (aResult.passed && !bResult.passed) return -1;
    if (!aResult.passed && bResult.passed) return 1;
    
    return a.name.localeCompare(b.name);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2 text-primary" />
        <p className="ml-3">Carregando resultados do exame...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-600 flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div ref={ref} className="p-4 max-w-4xl mx-auto print-container">
      <div className="print-header">
        <h1 className="text-2xl font-bold mb-1">Resultado do Exame de Faixa FBKI</h1>
        <p className="text-sm">
          Local: {examLocation} • 
          Data: {examDate ? format(examDate, 'dd/MM/yyyy') : 'Não definida'}
        </p>
        
        <div className="summary mt-3 flex justify-center items-center gap-8">
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span>Aprovados: {summary.approved}</span>
          </div>
          <div className="flex items-center text-red-600">
            <XCircle className="w-4 h-4 mr-1" />
            <span>Reprovados: {summary.failed}</span>
          </div>
          <div>
            <span>Total: {students.length}</span>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Nome</TableHead>
            <TableHead className="w-[10%]">Idade</TableHead>
            <TableHead className="w-[20%]">Clube</TableHead>
            <TableHead className="w-[15%]">Faixa Pretendida</TableHead>
            <TableHead className="w-[10%] text-right">Média</TableHead>
            <TableHead className="w-[15%] text-center">Resultado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStudents.map((student) => {
            const result = calculateResults(student);
            return (
              <TableRow key={student.id} className={result.passed ? "bg-green-50" : "bg-red-50"}>
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

      <div className="print-footer text-center text-xs text-muted-foreground mt-6 pt-4 border-t">
        Federação Baiana de Karatê Interestilo - Exame de Faixa • Impresso em {format(new Date(), 'dd/MM/yyyy')}
      </div>
    </div>
  );
});

StudentListPrint.displayName = "StudentListPrint";
