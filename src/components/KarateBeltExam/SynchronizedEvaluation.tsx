import React, { useState, useEffect } from 'react';
import { Student } from './StudentCard';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import BeltDisplay from "./BeltDisplay";
import { ArrowRight, CheckCircle2, XCircle, Maximize2, Minimize2, Slash, UserCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

interface SynchronizedEvaluationProps {
  students: Student[];
  evaluationType: 'kihon' | 'kata' | 'kumite' | 'knowledge';
  scores: {[key: number]: number};
  notes: {[key: number]: string};
  onScoreChange: (studentId: number, score: number) => void;
  onNotesChange: (studentId: number, notes: string) => void;
  title: string;
  description: string;
  examinerNames?: {[key: number]: string};
  onExaminerNameChange?: (studentId: number, name: string) => void;
}

export const SynchronizedEvaluation: React.FC<SynchronizedEvaluationProps> = ({
  students,
  evaluationType,
  scores,
  notes,
  onScoreChange,
  onNotesChange,
  title,
  description,
  examinerNames = {},
  onExaminerNameChange
}) => {
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);
  const [fullscreenStudent, setFullscreenStudent] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>("criterios");
  const [criteriaMarks, setCriteriaMarks] = useState<{[key: string]: {[key: string]: string}}>({});

  useEffect(() => {
    students.forEach(student => {
      if (scores[student.id] === undefined) {
        onScoreChange(student.id, 10);
      }
      
      if (!criteriaMarks[student.id]) {
        setCriteriaMarks(prev => ({
          ...prev,
          [student.id]: {}
        }));
      }
    });
  }, [students, scores, onScoreChange, criteriaMarks]);

  const toggleExpanded = (studentId: number) => {
    setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
  };

  const toggleFullscreen = (studentId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFullscreenStudent(fullscreenStudent === studentId ? null : studentId);
  };

  const getBeltColorClass = (belt: string) => {
    switch(belt) {
      case "Amarela": return "bg-yellow-400";
      case "Vermelha": return "bg-red-600";
      case "Laranja": return "bg-orange-500";
      case "Verde": return "bg-green-600";
      case "Estágio 1": 
      case "Estágio 2": return "bg-emerald-500";
      case "Roxa": return "bg-purple-600";
      case "Marrom": return "bg-amber-800";
      case "Preta": 
      case "Dans": return "bg-black";
      default: return "bg-white border border-gray-300";
    }
  };

  const renderScoreRating = (score: number) => {
    if (score < 5) return { text: "Insuficiente", color: "text-red-600" };
    if (score < 7) return { text: "Regular", color: "text-amber-600" };
    if (score < 9) return { text: "Bom", color: "text-blue-600" };
    return { text: "Excelente", color: "text-green-600" };
  };

  const handleMarkChange = (studentId: number, criteriaGroup: string, criterion: string, mark: string) => {
    const criteriaKey = `${criteriaGroup}-${criterion}`;
    const currentMarks = criteriaMarks[studentId] || {};
    
    const updatedMarks = { 
      ...currentMarks,
      [criteriaKey]: currentMarks[criteriaKey] === mark ? '' : mark 
    };
    
    setCriteriaMarks(prev => ({
      ...prev,
      [studentId]: updatedMarks
    }));
    
    const newScore = calculateScore(updatedMarks);
    onScoreChange(studentId, newScore);
  };

  const calculateScore = (marks: {[key: string]: string}) => {
    let totalScore = 10;
    
    Object.values(marks).forEach(mark => {
      if (mark === '/') totalScore -= 0.2;
      else if (mark === 'X') totalScore -= 0.4;
      else if (mark === '*') totalScore -= 0.5;
    });
    
    return Math.max(0, Number(totalScore.toFixed(1)));
  };

  const criteriaGroups = {
    bases: [
      "ZENKUTSO DACHI", "KOKUTSU DACHI", "KIBA DACHI", "HEIKO DACHI", 
      "HEISOKU DACHI", "FUDO DACHI", "NEKO ASHI DACHI", "SANCHIN DACHI"
    ],
    movimentos: [
      "OI ZUKI", "GYAKU ZUKI", "URAKEN", "TETSUI", "EMPI", "NUKITE", 
      "AGE UKE", "GEDAN BARAI", "SOTO UKE", "UCHI UKE", "SHUTO UKE", 
      "MAI GUERI KEAGUE", "MAI GUERI KEKOMI", "YOKO GUERI KEAGUE", "YOKO GUERI KEKOMI"
    ],
    gerais: [
      "CINTURA", "CONHECIMENTO", "COORDENAÇÃO", "EMBUZEN", "ESCUDO", 
      "ESPIRITO", "FORMA", "KIAI", "KIMÊ", "POSTURA", "RIKIASHI", 
      "RIKITE", "UNIFORME", "VISTA", "EQUILÍBRIO"
    ]
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {students.map((student) => {
          const currentScore = scores[student.id] || 10;
          const scoreRating = renderScoreRating(currentScore);
          const studentMarks = criteriaMarks[student.id] || {};
          const examinerName = examinerNames[student.id] || '';
          
          return (
            <Card 
              key={student.id} 
              className={cn(
                "overflow-hidden border transition-all duration-300",
                fullscreenStudent === student.id 
                  ? "fixed inset-4 z-50 m-4 max-w-none overflow-auto" 
                  : expandedStudentId === student.id 
                    ? "ring-2 ring-primary" 
                    : "hover:border-primary/50",
                fullscreenStudent !== null && fullscreenStudent !== student.id ? "hidden" : ""
              )}
            >
              <div className="p-3 flex flex-row items-center gap-2 cursor-pointer bg-muted/30" onClick={() => toggleExpanded(student.id)}>
                <div className="w-8 flex-shrink-0">
                  <BeltDisplay 
                    belt={student.belt} 
                    danStage={student.danStage} 
                    className="w-full"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{student.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{student.belt}</span>
                    <ArrowRight className="w-3 h-3 mx-0.5" />
                    <span>{student.targetBelt}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-base font-semibold">{currentScore}</span>
                  {currentScore >= 6 ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="ml-1 h-6 w-6"
                    onClick={(e) => toggleFullscreen(student.id, e)}
                  >
                    {fullscreenStudent === student.id ? 
                      <Minimize2 className="h-3.5 w-3.5" /> : 
                      <Maximize2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>
              
              {(expandedStudentId === student.id || fullscreenStudent === student.id) && (
                <CardContent className="border-t bg-muted/30 p-3">
                  <Tabs 
                    value={activeTab} 
                    onValueChange={setActiveTab} 
                    className="w-full"
                  >
                    <TabsList className="w-full justify-start mb-3">
                      <TabsTrigger value="criterios">Critérios de Avaliação</TabsTrigger>
                      <TabsTrigger value="pontuacao">Pontuação</TabsTrigger>
                      {evaluationType === 'kihon' && (
                        <TabsTrigger value="examinador">Examinador</TabsTrigger>
                      )}
                      <TabsTrigger value="observacoes">Observações</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="criterios" className="space-y-4 mt-0">
                      <div className="overflow-hidden rounded-md border shadow-sm">
                        <div className="flex items-center justify-between p-2 bg-[#f1f3f4] border-b">
                          <div className="flex space-x-1.5">
                            <div className="h-3 w-3 rounded-full bg-red-500"></div>
                            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          </div>
                          <div className="flex-grow mx-4">
                            <div className="bg-white rounded-full flex items-center px-3 py-1 text-xs text-gray-600 border shadow-sm">
                              <span className="truncate">karate-avaliacao.com.br/kihon/{student.name.toLowerCase().replace(/\s/g, '-')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <Tabs defaultValue="bases" className="w-full">
                          <TabsList className="w-full justify-start rounded-none border-b bg-white px-2">
                            <TabsTrigger value="bases" className="data-[state=active]:bg-gray-100 data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
                              Bases
                            </TabsTrigger>
                            <TabsTrigger value="movimentos" className="data-[state=active]:bg-gray-100 data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
                              Movimentos
                            </TabsTrigger>
                            <TabsTrigger value="gerais" className="data-[state=active]:bg-gray-100 data-[state=active]:border-b-2 data-[state=active]:border-blue-500">
                              Gerais
                            </TabsTrigger>
                          </TabsList>
                          
                          <div className="p-3 bg-white">
                            <div className="text-sm mb-2">
                              <p className="text-muted-foreground">Avalie o estudante. Cada marca reduz a pontuação:</p>
                              <div className="flex space-x-4 text-xs mt-1">
                                <span className="flex items-center"><Slash className="h-3 w-3 mr-1 text-amber-600" /> -0.2 pontos (pequeno ajuste)</span>
                                <span className="flex items-center"><XCircle className="h-3 w-3 mr-1 text-orange-600" /> -0.4 pontos (ajuste necessário)</span>
                                <span className="flex items-center"><span className="text-base font-bold mr-1 text-red-600">*</span> -0.5 pontos (correção crítica)</span>
                              </div>
                            </div>
                            
                            <TabsContent value="bases" className="mt-2">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[200px] py-2 text-xs">Base</TableHead>
                                    <TableHead className="w-[60px] text-center py-2 text-xs">/ (-0.2)</TableHead>
                                    <TableHead className="w-[60px] text-center py-2 text-xs">X (-0.4)</TableHead>
                                    <TableHead className="w-[60px] text-center py-2 text-xs">* (-0.5)</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {criteriaGroups.bases.map((criterion, i) => {
                                    const criteriaKey = `bases-${criterion}`;
                                    return (
                                      <TableRow key={i}>
                                        <TableCell className="font-medium text-xs py-1">{criterion}</TableCell>
                                        <TableCell className="text-center py-1">
                                          <button
                                            onClick={() => handleMarkChange(student.id, 'bases', criterion, '/')}
                                            className={cn(
                                              "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                              studentMarks[criteriaKey] === '/' 
                                                ? "bg-amber-100 text-amber-700" 
                                                : "hover:bg-muted"
                                            )}
                                          >
                                            <Slash className={cn(
                                              "h-3.5 w-3.5",
                                              studentMarks[criteriaKey] === '/' ? "opacity-100" : "opacity-40"
                                            )} />
                                          </button>
                                        </TableCell>
                                        <TableCell className="text-center py-1">
                                          <button
                                            onClick={() => handleMarkChange(student.id, 'bases', criterion, 'X')}
                                            className={cn(
                                              "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                              studentMarks[criteriaKey] === 'X' 
                                                ? "bg-orange-100 text-orange-700" 
                                                : "hover:bg-muted"
                                            )}
                                          >
                                            <XCircle className={cn(
                                              "h-3.5 w-3.5",
                                              studentMarks[criteriaKey] === 'X' ? "opacity-100" : "opacity-40"
                                            )} />
                                          </button>
                                        </TableCell>
                                        <TableCell className="text-center py-1">
                                          <button
                                            onClick={() => handleMarkChange(student.id, 'bases', criterion, '*')}
                                            className={cn(
                                              "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                              studentMarks[criteriaKey] === '*' 
                                                ? "bg-red-100 text-red-700" 
                                                : "hover:bg-muted"
                                            )}
                                          >
                                            <span className={cn(
                                              "text-base font-bold",
                                              studentMarks[criteriaKey] === '*' ? "opacity-100" : "opacity-40"
                                            )}>*</span>
                                          </button>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TabsContent>
                            
                            <TabsContent value="movimentos" className="mt-2">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[200px] py-2 text-xs">Movimento</TableHead>
                                    <TableHead className="w-[60px] text-center py-2 text-xs">/ (-0.2)</TableHead>
                                    <TableHead className="w-[60px] text-center py-2 text-xs">X (-0.4)</TableHead>
                                    <TableHead className="w-[60px] text-center py-2 text-xs">* (-0.5)</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {criteriaGroups.movimentos.map((criterion, i) => {
                                    const criteriaKey = `movimentos-${criterion}`;
                                    return (
                                      <TableRow key={i}>
                                        <TableCell className="font-medium text-xs py-1">{criterion}</TableCell>
                                        <TableCell className="text-center py-1">
                                          <button
                                            onClick={() => handleMarkChange(student.id, 'movimentos', criterion, '/')}
                                            className={cn(
                                              "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                              studentMarks[criteriaKey] === '/' 
                                                ? "bg-amber-100 text-amber-700" 
                                                : "hover:bg-muted"
                                            )}
                                          >
                                            <Slash className={cn(
                                              "h-3.5 w-3.5",
                                              studentMarks[criteriaKey] === '/' ? "opacity-100" : "opacity-40"
                                            )} />
                                          </button>
                                        </TableCell>
                                        <TableCell className="text-center py-1">
                                          <button
                                            onClick={() => handleMarkChange(student.id, 'movimentos', criterion, 'X')}
                                            className={cn(
                                              "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                              studentMarks[criteriaKey] === 'X' 
                                                ? "bg-orange-100 text-orange-700" 
                                                : "hover:bg-muted"
                                            )}
                                          >
                                            <XCircle className={cn(
                                              "h-3.5 w-3.5",
                                              studentMarks[criteriaKey] === 'X' ? "opacity-100" : "opacity-40"
                                            )} />
                                          </button>
                                        </TableCell>
                                        <TableCell className="text-center py-1">
                                          <button
                                            onClick={() => handleMarkChange(student.id, 'movimentos', criterion, '*')}
                                            className={cn(
                                              "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                              studentMarks[criteriaKey] === '*' 
                                                ? "bg-red-100 text-red-700" 
                                                : "hover:bg-muted"
                                            )}
                                          >
                                            <span className={cn(
                                              "text-base font-bold",
                                              studentMarks[criteriaKey] === '*' ? "opacity-100" : "opacity-40"
                                            )}>*</span>
                                          </button>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TabsContent>
                            
                            <TabsContent value="gerais" className="mt-2">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[200px] py-2 text-xs">Aspecto</TableHead>
                                    <TableHead className="w-[60px] text-center py-2 text-xs">/ (-0.2)</TableHead>
                                    <TableHead className="w-[60px] text-center py-2 text-xs">X (-0.4)</TableHead>
                                    <TableHead className="w-[60px] text-center py-2 text-xs">* (-0.5)</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {criteriaGroups.gerais.map((criterion, i) => {
                                    const criteriaKey = `gerais-${criterion}`;
                                    return (
                                      <TableRow key={i}>
                                        <TableCell className="font-medium text-xs py-1">{criterion}</TableCell>
                                        <TableCell className="text-center py-1">
                                          <button
                                            onClick={() => handleMarkChange(student.id, 'gerais', criterion, '/')}
                                            className={cn(
                                              "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                              studentMarks[criteriaKey] === '/' 
                                                ? "bg-amber-100 text-amber-700" 
                                                : "hover:bg-muted"
                                            )}
                                          >
                                            <Slash className={cn(
                                              "h-3.5 w-3.5",
                                              studentMarks[criteriaKey] === '/' ? "opacity-100" : "opacity-40"
                                            )} />
                                          </button>
                                        </TableCell>
                                        <TableCell className="text-center py-1">
                                          <button
                                            onClick={() => handleMarkChange(student.id, 'gerais', criterion, 'X')}
                                            className={cn(
                                              "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                              studentMarks[criteriaKey] === 'X' 
                                                ? "bg-orange-100 text-orange-700" 
                                                : "hover:bg-muted"
                                            )}
                                          >
                                            <XCircle className={cn(
                                              "h-3.5 w-3.5",
                                              studentMarks[criteriaKey] === 'X' ? "opacity-100" : "opacity-40"
                                            )} />
                                          </button>
                                        </TableCell>
                                        <TableCell className="text-center py-1">
                                          <button
                                            onClick={() => handleMarkChange(student.id, 'gerais', criterion, '*')}
                                            className={cn(
                                              "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                              studentMarks[criteriaKey] === '*' 
                                                ? "bg-red-100 text-red-700" 
                                                : "hover:bg-muted"
                                            )}
                                          >
                                            <span className={cn(
                                              "text-base font-bold",
                                              studentMarks[criteriaKey] === '*' ? "opacity-100" : "opacity-40"
                                            )}>*</span>
                                          </button>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TabsContent>
                          </div>
                        </Tabs>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="pontuacao" className="mt-0">
                      <div>
                        <div className="flex justify-between mb-1">
                          <Label className="text-xs">Pontuação: {currentScore}</Label>
                          <span className={`text-xs font-medium ${scoreRating.color}`}>
                            {scoreRating.text}
                          </span>
                        </div>
                        <Slider
                          value={[currentScore]}
                          min={0}
                          max={10}
                          step={0.5}
                          onValueChange={(value) => onScoreChange(student.id, value[0])}
                          className="mt-1"
                        />
                        
                        <div className="mt-2 p-3 bg-muted/50 rounded-md text-xs">
                          <div className="font-medium mb-1">Sistema de Pontuação</div>
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Slash className="h-3 w-3 mr-2 text-amber-600" />
                              <span>Pequenos ajustes (-0.2 pontos cada)</span>
                            </div>
                            <div className="flex items-center">
                              <XCircle className="h-3 w-3 mr-2 text-orange-600" />
                              <span>Ajustes necessários (-0.4 pontos cada)</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-base font-bold mr-2 text-red-600 leading-none">*</span>
                              <span>Correções críticas (-0.5 pontos cada)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    {evaluationType === 'kihon' && (
                      <TabsContent value="examinador" className="mt-0">
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <div className="flex items-center gap-2 mb-2">
                            <UserCircle className="h-5 w-5 text-yellow-600" />
                            <Label htmlFor={`examiner-${student.id}`} className="text-sm font-medium text-yellow-800">
                              Nome do Examinador de Kihon*
                            </Label>
                          </div>
                          <Input 
                            id={`examiner-${student.id}`}
                            value={examinerName}
                            onChange={(e) => onExaminerNameChange && onExaminerNameChange(student.id, e.target.value)}
                            placeholder="Digite o nome do examinador de Kihon"
                            className="mt-1 text-sm border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                            required
                          />
                          <p className="text-xs text-yellow-600 mt-1">
                            Este campo é obrigatório para a avaliação de Kihon
                          </p>
                        </div>
                      </TabsContent>
                    )}
                    
                    <TabsContent value="observacoes" className="mt-0">
                      <div className="space-y-1">
                        <Label htmlFor={`notes-${student.id}`} className="text-xs">Observações</Label>
                        <Textarea
                          id={`notes-${student.id}`}
                          placeholder="Adicione observações sobre o desempenho..."
                          value={notes[student.id] || ""}
                          onChange={(e) => onNotesChange(student.id, e.target.value)}
                          className="min-h-[120px] resize-none text-xs"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};
