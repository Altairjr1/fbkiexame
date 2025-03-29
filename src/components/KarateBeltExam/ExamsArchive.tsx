import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Printer, Download, FolderOpen, Calendar, MapPin, User, Trash2, FileText } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import BeltDisplay from './BeltDisplay';
import { format } from 'date-fns';
import { StudentResult } from './StudentResult';
import { supabase } from '@/integrations/supabase/client';
import { useReactToPrint } from 'react-to-print';

interface ExamStudent {
  id: string;
  name: string;
  age: string;
  club: string;
  specialCondition?: string;
  belt: string;
  targetBelt: string;
  danStage?: string;
  kihon?: number;
  kata?: number;
  kumite?: number;
  knowledge?: number;
  notes?: string;
  kihonExaminer?: string;
  kataExaminer?: string;
  kumiteExaminer?: string;
  knowledgeExaminer?: string;
  kihonMarks?: {[key: string]: string};
  kumiteMarks?: {[key: string]: string};
}

interface ExamData {
  id: string;
  date: string;
  location: string;
  students: ExamStudent[];
}

export const ExamsArchive = () => {
  const [exams, setExams] = useState<{[key: string]: ExamData}>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmExam, setDeleteConfirmExam] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<ExamStudent | null>(null);
  const { toast } = useToast();
  const studentResultRef = useRef<HTMLDivElement>(null);
  const examListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        
        const { data: examsData, error: examsError } = await supabase
          .from('exams')
          .select('*');
        
        if (examsError) throw examsError;
        
        const loadedExams: {[key: string]: ExamData} = {};
        
        await Promise.all(examsData.map(async (exam) => {
          const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('*')
            .eq('exam_id', exam.id);
          
          if (studentsError) throw studentsError;
          
          const studentsWithScores = await Promise.all(studentsData.map(async (student) => {
            const { data: scoreData, error: scoreError } = await supabase
              .from('scores')
              .select('*')
              .eq('student_id', student.id)
              .single();
            
            if (scoreError && scoreError.code !== 'PGRST116') {
              console.error('Erro ao buscar pontuação:', scoreError);
            }
            
            return {
              id: student.id,
              name: student.name,
              age: student.age,
              club: student.club,
              specialCondition: student.special_condition,
              belt: student.current_belt,
              targetBelt: student.target_belt,
              danStage: student.dan_stage,
              kihon: scoreData?.kihon,
              kata: scoreData?.kata,
              kumite: scoreData?.kumite,
              knowledge: scoreData?.knowledge,
              notes: scoreData?.notes,
              kihonExaminer: scoreData?.kihon_examiner,
              kataExaminer: scoreData?.kata_examiner,
              kumiteExaminer: scoreData?.kumite_examiner,
              knowledgeExaminer: scoreData?.knowledge_examiner,
              kihonMarks: scoreData?.notes ? JSON.parse(scoreData.notes).kihonMarks || {} : {},
              kumiteMarks: scoreData?.notes ? JSON.parse(scoreData.notes).kumiteMarks || {} : {}
            };
          }));
          
          loadedExams[exam.id] = {
            id: exam.id,
            date: exam.date,
            location: exam.location,
            students: studentsWithScores
          };
        }));
        
        setExams(loadedExams);
      } catch (error) {
        console.error('Erro ao carregar exames:', error);
        toast({
          title: "Erro ao carregar exames",
          description: "Não foi possível carregar os dados dos exames.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchExams();
  }, [toast]);

  const handleDeleteExam = async (examId: string) => {
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);
      
      if (error) throw error;
      
      setExams(prev => {
        const updated = { ...prev };
        delete updated[examId];
        return updated;
      });
      
      setDeleteConfirmExam(null);
      toast({
        title: "Exame excluído",
        description: "O registro do exame foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir exame:', error);
      toast({
        title: "Erro ao excluir exame",
        description: "Não foi possível excluir o exame.",
        variant: "destructive"
      });
    }
  };

  const handlePrintList = useReactToPrint({
    documentTitle: 'Lista de Alunos - Exame de Faixa',
    contentRef: examListRef,
    onAfterPrint: () => {
      toast({
        title: "Impressão concluída",
        description: "A lista de alunos foi enviada para impressão."
      });
    }
  });

  const handlePrintStudentResult = useReactToPrint({
    documentTitle: 'Resultado Individual - Exame de Faixa',
    contentRef: studentResultRef,
    onAfterPrint: () => {
      toast({
        title: "Impressão concluída",
        description: "A ficha do aluno foi enviada para impressão."
      });
    }
  });

  const examsByLocation = Object.entries(exams).reduce((acc: {[key: string]: {[key: string]: ExamData}}, [key, exam]) => {
    const location = exam.location || 'Sem local';
    if (!acc[location]) {
      acc[location] = {};
    }
    acc[location][key] = exam;
    return acc;
  }, {});

  const calculateResults = (student: ExamStudent) => {
    const scores = [];
    
    if (student.kihon !== undefined) scores.push(student.kihon);
    if (student.kata !== undefined) scores.push(student.kata);
    
    if (student.targetBelt !== "Amarela" && student.kumite !== undefined) {
      scores.push(student.kumite);
    }
    
    if ((student.targetBelt === "Preta" || student.targetBelt === "Dans") && 
        student.knowledge !== undefined) {
      scores.push(student.knowledge);
    }
    
    if (scores.length === 0) return { average: "0.0", passed: false };
    
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = sum / scores.length;
    
    return {
      average: average.toFixed(1),
      passed: average >= 6
    };
  };

  const filterExams = () => {
    if (!searchQuery.trim()) return examsByLocation;
    
    const filtered: {[key: string]: {[key: string]: ExamData}} = {};
    
    Object.entries(examsByLocation).forEach(([location, locationExams]) => {
      const filteredLocationExams: {[key: string]: ExamData} = {};
      
      Object.entries(locationExams).forEach(([key, exam]) => {
        const dateMatches = exam.date.toLowerCase().includes(searchQuery.toLowerCase());
        const locationMatches = exam.location.toLowerCase().includes(searchQuery.toLowerCase());
        
        const studentMatches = exam.students.some(student => 
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.club.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        if (dateMatches || locationMatches || studentMatches) {
          filteredLocationExams[key] = exam;
        }
      });
      
      if (Object.keys(filteredLocationExams).length > 0) {
        filtered[location] = filteredLocationExams;
      }
    });
    
    return filtered;
  };

  const filteredExams = filterExams();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Sem data";
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="container px-4 py-8 mx-auto max-w-7xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Arquivo de Exames de Faixa</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Consulte todos os exames de faixa registrados na federação, organizados por local e data.
        </p>
      </header>

      <div className="mb-6">
        <div className="relative max-w-xl mx-auto">
          <Input
            type="search"
            placeholder="Buscar por local, data, nome de aluno ou clube..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Carregando exames...</p>
        </div>
      ) : Object.keys(filteredExams).length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhum exame encontrado</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {searchQuery 
              ? "Não foi encontrado nenhum exame com os critérios de busca informados. Tente usar termos diferentes."
              : "Não existem exames registrados no sistema. Realize um exame de faixa para começar a construir seu arquivo."}
          </p>
          <Button
            className="mt-4"
            onClick={() => window.location.href = "/"}
          >
            Voltar para página inicial
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(filteredExams).map(([location, locationExams]) => (
            <Collapsible key={location} className="border rounded-lg overflow-hidden">
              <CollapsibleTrigger asChild>
                <div className="p-4 bg-muted/30 flex items-center justify-between cursor-pointer hover:bg-muted/50">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    <h2 className="text-xl font-semibold">{location}</h2>
                    <Badge className="ml-3 bg-primary/10 text-primary border-none">
                      {Object.keys(locationExams).length} exame(s)
                    </Badge>
                  </div>
                  <svg
                    className="h-5 w-5 text-muted-foreground transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 space-y-4">
                  {Object.entries(locationExams).map(([examId, exam]) => (
                    <Card key={examId} className="overflow-hidden">
                      <CardHeader className="p-4 bg-muted/20 flex flex-row justify-between items-center space-y-0">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 p-2 bg-primary/10 rounded-full">
                            <Calendar className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{formatDate(exam.date)}</CardTitle>
                            <p className="text-sm text-muted-foreground">{exam.location}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedExam(examId)}>
                                <User className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Ver Alunos</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>Exame - {exam.location} ({formatDate(exam.date)})</DialogTitle>
                                <DialogDescription>
                                  Lista de todos os alunos que participaram deste exame.
                                </DialogDescription>
                              </DialogHeader>

                              <Tabs defaultValue="all">
                                <TabsList className="mb-4">
                                  <TabsTrigger value="all">Todos ({exam.students.length})</TabsTrigger>
                                  <TabsTrigger value="passed">
                                    Aprovados ({exam.students.filter(s => calculateResults(s).passed).length})
                                  </TabsTrigger>
                                  <TabsTrigger value="failed">
                                    Reprovados ({exam.students.filter(s => !calculateResults(s).passed).length})
                                  </TabsTrigger>
                                </TabsList>

                                <TabsContent value="all">
                                  <div className="overflow-x-auto" ref={examListRef}>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Nome</TableHead>
                                          <TableHead className="hidden sm:table-cell">Idade</TableHead>
                                          <TableHead className="hidden md:table-cell">Clube</TableHead>
                                          <TableHead>Faixa</TableHead>
                                          <TableHead className="text-center">Média</TableHead>
                                          <TableHead className="text-center">Resultado</TableHead>
                                          <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {exam.students.map((student) => {
                                          const result = calculateResults(student);
                                          return (
                                            <TableRow key={student.id}>
                                              <TableCell className="font-medium">{student.name}</TableCell>
                                              <TableCell className="hidden sm:table-cell">{student.age}</TableCell>
                                              <TableCell className="hidden md:table-cell">{student.club}</TableCell>
                                              <TableCell>
                                                <div className="flex items-center gap-1">
                                                  <div className="w-6">
                                                    <BeltDisplay belt={student.targetBelt} danStage={student.danStage} />
                                                  </div>
                                                  <span className="text-xs">{student.targetBelt}</span>
                                                </div>
                                              </TableCell>
                                              <TableCell className="text-center font-semibold">{result.average}</TableCell>
                                              <TableCell className="text-center">
                                                {result.passed ? (
                                                  <Badge className="bg-green-500">
                                                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                                    Aprovado
                                                  </Badge>
                                                ) : (
                                                  <Badge variant="destructive">
                                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                                    Reprovado
                                                  </Badge>
                                                )}
                                              </TableCell>
                                              <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                  <Button 
                                                    size="icon" 
                                                    variant="outline" 
                                                    onClick={() => {
                                                      setSelectedStudent(student);
                                                      setTimeout(() => handlePrintStudentResult(), 100);
                                                    }}
                                                  >
                                                    <FileText className="h-4 w-4" />
                                                  </Button>
                                                  <Button 
                                                    size="icon" 
                                                    variant="outline" 
                                                    onClick={() => handlePrintList()}
                                                  >
                                                    <Printer className="h-4 w-4" />
                                                  </Button>
                                                </div>
                                              </TableCell>
                                            </TableRow>
                                          );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </TabsContent>

                                <TabsContent value="passed">
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Nome</TableHead>
                                          <TableHead className="hidden sm:table-cell">Idade</TableHead>
                                          <TableHead className="hidden md:table-cell">Clube</TableHead>
                                          <TableHead>Faixa</TableHead>
                                          <TableHead className="text-center">Média</TableHead>
                                          <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {exam.students
                                          .filter(student => calculateResults(student).passed)
                                          .map((student) => {
                                            const result = calculateResults(student);
                                            return (
                                              <TableRow key={student.id}>
                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                <TableCell className="hidden sm:table-cell">{student.age}</TableCell>
                                                <TableCell className="hidden md:table-cell">{student.club}</TableCell>
                                                <TableCell>
                                                  <div className="flex items-center gap-1">
                                                    <div className="w-6">
                                                      <BeltDisplay belt={student.targetBelt} danStage={student.danStage} />
                                                    </div>
                                                    <span className="text-xs">{student.targetBelt}</span>
                                                  </div>
                                                </TableCell>
                                                <TableCell className="text-center font-semibold">{result.average}</TableCell>
                                                <TableCell className="text-right">
                                                  <div className="flex justify-end gap-2">
                                                    <Button 
                                                      size="icon" 
                                                      variant="outline" 
                                                      onClick={() => {
                                                        setSelectedStudent(student);
                                                        setTimeout(() => handlePrintStudentResult(), 100);
                                                      }}
                                                    >
                                                      <FileText className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                      size="icon" 
                                                      variant="outline"
                                                      onClick={() => handlePrintList()}
                                                    >
                                                      <Printer className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                </TableCell>
                                              </TableRow>
                                            );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </TabsContent>

                                <TabsContent value="failed">
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Nome</TableHead>
                                          <TableHead className="hidden sm:table-cell">Idade</TableHead>
                                          <TableHead className="hidden md:table-cell">Clube</TableHead>
                                          <TableHead>Faixa</TableHead>
                                          <TableHead className="text-center">Média</TableHead>
                                          <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {exam.students
                                          .filter(student => !calculateResults(student).passed)
                                          .map((student) => {
                                            const result = calculateResults(student);
                                            return (
                                              <TableRow key={student.id}>
                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                <TableCell className="hidden sm:table-cell">{student.age}</TableCell>
                                                <TableCell className="hidden md:table-cell">{student.club}</TableCell>
                                                <TableCell>
                                                  <div className="flex items-center gap-1">
                                                    <div className="w-6">
                                                      <BeltDisplay belt={student.targetBelt} danStage={student.danStage} />
                                                    </div>
                                                    <span className="text-xs">{student.targetBelt}</span>
                                                  </div>
                                                </TableCell>
                                                <TableCell className="text-center font-semibold">{result.average}</TableCell>
                                                <TableCell className="text-right">
                                                  <div className="flex justify-end gap-2">
                                                    <Button 
                                                      size="icon" 
                                                      variant="outline" 
                                                      onClick={() => {
                                                        setSelectedStudent(student);
                                                        setTimeout(() => handlePrintStudentResult(), 100);
                                                      }}
                                                    >
                                                      <FileText className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                      size="icon" 
                                                      variant="outline"
                                                      onClick={() => handlePrintList()}
                                                    >
                                                      <Printer className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                </TableCell>
                                              </TableRow>
                                            );
                                        })}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </TabsContent>
                              </Tabs>

                              <DialogFooter>
                                <Button onClick={() => handlePrintList()}>
                                  <Printer className="h-4 w-4 mr-2" />
                                  Imprimir Lista
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Confirmar exclusão</DialogTitle>
                                <DialogDescription>
                                  Tem certeza que deseja excluir este exame? Esta ação não pode ser desfeita.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteConfirmExam(null)}>Cancelar</Button>
                                <Button variant="destructive" onClick={() => handleDeleteExam(examId)}>
                                  Excluir Exame
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex flex-wrap items-center gap-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Total de Alunos</Label>
                            <p className="font-semibold">{exam.students.length}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Aprovados</Label>
                            <p className="font-semibold text-green-600">
                              {exam.students.filter(s => calculateResults(s).passed).length}
                            </p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Reprovados</Label>
                            <p className="font-semibold text-red-600">
                              {exam.students.filter(s => !calculateResults(s).passed).length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}

      {selectedStudent && (
        <div className="hidden">
          <div ref={studentResultRef}>
            <StudentResult
              student={{
                id: Number(selectedStudent.id),
                name: selectedStudent.name,
                age: selectedStudent.age,
                club: selectedStudent.club,
                specialCondition: selectedStudent.specialCondition,
                belt: selectedStudent.belt,
                targetBelt: selectedStudent.targetBelt,
                danStage: selectedStudent.danStage
              }}
              examDate={selectedExam ? new Date(exams[selectedExam].date) : undefined}
              examLocation={selectedExam ? exams[selectedExam].location : ''}
              kihonScore={selectedStudent.kihon || 0}
              kataScore={selectedStudent.kata || 0}
              kumiteScore={selectedStudent.kumite || 0}
              knowledgeScore={selectedStudent.knowledge || 0}
              notes={selectedStudent.notes || ''}
              kihonExaminer={selectedStudent.kihonExaminer || ''}
              kataExaminer={selectedStudent.kataExaminer || ''}
              kumiteExaminer={selectedStudent.kumiteExaminer || ''}
              knowledgeExaminer={selectedStudent.knowledgeExaminer || ''}
              kihonMarks={selectedStudent.kihonMarks}
              kumiteMarks={selectedStudent.kumiteMarks}
            />
          </div>
        </div>
      )}
    </div>
  );
};
