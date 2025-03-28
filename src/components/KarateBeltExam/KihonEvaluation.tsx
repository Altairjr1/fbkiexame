
import React, { useState, useEffect } from 'react';
import { Student } from './StudentCard';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import BeltDisplay from "./BeltDisplay";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Slash, Maximize2, Minimize2, RefreshCw, X, Plus, ExternalLink } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { motion } from "framer-motion";

interface KihonEvaluationProps {
  student: Student;
  onScoreChange: (studentId: number, score: number) => void;
  onNotesChange: (studentId: number, notes: string) => void;
  score: number;
  notes: string;
  examinerName: string;
  onExaminerNameChange: (studentId: number, name: string) => void;
}

interface CriteriaGroup {
  name: string;
  criteria: string[];
}

// Criteria based on belt level
const getCriteriaForBelt = (targetBelt: string): CriteriaGroup[] => {
  const baseCriteria: CriteriaGroup[] = [
    {
      name: "Bases",
      criteria: [
        "ZENKUTSO DACHI", "KOKUTSU DACHI", "KIBA DACHI", "HEIKO DACHI", 
        "HEISOKU DACHI", "FUDO DACHI", "NEKO ASHI DACHI", "SANCHIN DACHI",
        "HANGETSU DACHI", "SOCHIN DACHI", "MUSUBI DACHI", "HACHIJI DACHI",
        "SHIKO DACHI", "KOSA DACHI", "TSURU ASHI DACHI"
      ]
    },
    {
      name: "Movimentos",
      criteria: [
        "OI ZUKI", "GYAKU ZUKI", "URAKEN", "TETSUI", "EMPI", "NUKITE", 
        "AGE UKE", "GEDAN BARAI", "SOTO UKE", "UCHI UKE", "SHUTO UKE", 
        "MAI GUERI KEAGUE", "MAI GUERI KEKOMI", "YOKO GUERI KEAGUE", "YOKO GUERI KEKOMI",
        "MAWASHI GUERI", "USHIRO GUERI", "KAKE UKE", "MOROTE UKE", "JUJI UKE",
        "NAGASHI UKE", "HAITO UCHI", "HAISHU UCHI", "TEISHO UCHI", "SHUTO UCHI",
        "URAKEN UCHI", "FUMIKOMI", "MIKAZUKI GERI", "SOKUTO", "TOBI GERI"
      ]
    },
    {
      name: "Gerais",
      criteria: [
        "CINTURA", "CONHECIMENTO", "COORDENAÇÃO", "EMBUZEN", "ESCUDO", 
        "ESPIRITO", "FORMA", "KIAI", "KIMÊ", "POSTURA", "RIKIASHI", 
        "RIKITE", "UNIFORME", "VISTA", "EQUILÍBRIO", "RITMO", "FORÇA",
        "FLEXIBILIDADE", "VELOCIDADE", "DISTÂNCIA", "CONTROLE", "RESPIRAÇÃO",
        "ZANSHIN", "KIME", "EXPRESSÃO FACIAL", "HIKITE", "ESTABILIDADE",
        "SINCRONIZAÇÃO", "EIXO DE ROTAÇÃO", "LINHA DE ATAQUE"
      ]
    }
  ];

  // Add more specific criteria based on belt level
  if (targetBelt === "Preta" || targetBelt === "Dans") {
    baseCriteria[1].criteria.push("URAKEN UCHI", "HAITO UCHI", "HAISHU UCHI");
    baseCriteria[2].criteria.push("ESTRATÉGIA", "RESPIRAÇÃO", "ZANSHIN");
  }

  return baseCriteria;
};

export const KihonEvaluation: React.FC<KihonEvaluationProps> = ({
  student,
  onScoreChange,
  onNotesChange,
  score,
  notes,
  examinerName,
  onExaminerNameChange
}) => {
  const [criteriaMarks, setCriteriaMarks] = useState<{[key: string]: string}>({});
  const criteriaGroups = getCriteriaForBelt(student.targetBelt);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("bases");
  
  // Calculate score based on marks
  const calculateScore = (marks: {[key: string]: string}) => {
    let totalScore = 10;
    
    Object.values(marks).forEach(mark => {
      if (mark === '/') totalScore -= 0.2;
      else if (mark === 'X') totalScore -= 0.4;
      else if (mark === '*') totalScore -= 0.5;
    });
    
    // Ensure score is not negative and round to 1 decimal place
    return Math.max(0, Number(totalScore.toFixed(1)));
  };
  
  // Make sure we initialize with score 10 if not set yet
  React.useEffect(() => {
    if (score === 0 && Object.keys(criteriaMarks).length === 0) {
      onScoreChange(student.id, 10);
    }
  }, [score, criteriaMarks, student.id, onScoreChange]);
  
  // Handle mark updates
  const handleMarkChange = (criteriaKey: string, mark: string) => {
    const updatedMarks = { 
      ...criteriaMarks,
      [criteriaKey]: criteriaMarks[criteriaKey] === mark ? '' : mark 
    };
    
    setCriteriaMarks(updatedMarks);
    const newScore = calculateScore(updatedMarks);
    onScoreChange(student.id, newScore);
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

  const findCriteriaGroup = (name: string) => {
    return criteriaGroups.find(group => group.name === name);
  };

  const renderScoreRating = (score: number) => {
    if (score < 5) return { text: "Insuficiente", color: "text-red-600" };
    if (score < 7) return { text: "Regular", color: "text-amber-600" };
    if (score < 9) return { text: "Bom", color: "text-blue-600" };
    return { text: "Excelente", color: "text-green-600" };
  };

  const scoreRating = renderScoreRating(score);

  return (
    <Card className={cn("overflow-hidden border shadow-sm transition-all duration-300", 
      expanded ? "fixed inset-4 z-50 m-4 max-w-none overflow-auto" : "")}>
      <CardHeader className="flex flex-row items-center gap-2 bg-muted/50 py-3 px-4 sticky top-0 z-10">
        <div className="w-10 flex-shrink-0">
          <BeltDisplay 
            belt={student.targetBelt} 
            danStage={student.danStage} 
            className="w-full" 
          />
        </div>
        
        <div className="flex-grow">
          <CardTitle className="text-base">{student.name}</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${getBeltColorClass(student.belt)}`} />
            <span>{student.belt}</span>
            <span className="mx-1">→</span>
            <div className={`w-2 h-2 rounded-full ${getBeltColorClass(student.targetBelt)}`} />
            <span>{student.targetBelt}</span>
            <Badge className="ml-1 text-[10px] py-0 px-1 h-4">{student.club}</Badge>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-xl font-bold">{score}</div>
          <div className={`text-xs ${scoreRating.color}`}>{scoreRating.text}</div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-2" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </CardHeader>
      
      <CardContent className={cn("p-3", expanded ? "pb-20" : "")}>
        <div className="mb-3">
          <Label htmlFor={`examiner-${student.id}`} className="text-sm">Nome do Examinador*</Label>
          <Input 
            id={`examiner-${student.id}`}
            value={examinerName}
            onChange={(e) => onExaminerNameChange(student.id, e.target.value)}
            placeholder="Nome do examinador de Kihon"
            className="mt-1 text-sm"
            required
          />
        </div>
        
        <div className="mb-4 overflow-hidden rounded-md border shadow-sm">
          {/* Chrome-style browser window */}
          <div className="flex items-center justify-between p-2 bg-[#f1f3f4] border-b">
            <div className="flex space-x-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-grow mx-4">
              <div className="bg-white rounded-full flex items-center px-3 py-1 text-xs text-gray-600 border shadow-sm">
                <span className="truncate">karate-avaliacao.com.br/exame/kihon/{student.name.toLowerCase().replace(/\s/g, '-')}</span>
                <RefreshCw className="ml-2 h-3 w-3 text-gray-400" />
              </div>
            </div>
            <div className="flex space-x-1">
              <Plus className="h-3.5 w-3.5 text-gray-500" />
              <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
              <TabsContent value="bases" className="mt-0">
                <div className="text-sm mb-2">
                  <p className="text-muted-foreground">Avalie as bases do estudante. Cada marca reduz a pontuação:</p>
                  <div className="flex space-x-4 text-xs mt-1">
                    <span className="flex items-center"><Slash className="h-3 w-3 mr-1 text-amber-600" /> -0.2 pontos (pequeno ajuste)</span>
                    <span className="flex items-center"><XCircle className="h-3 w-3 mr-1 text-orange-600" /> -0.4 pontos (ajuste necessário)</span>
                    <span className="flex items-center"><span className="text-base font-bold mr-1 text-red-600">*</span> -0.5 pontos (correção crítica)</span>
                  </div>
                </div>
                
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
                    {findCriteriaGroup("Bases")?.criteria.map((criterion, i) => {
                      const criteriaKey = `Bases-${criterion}`;
                      return (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-xs py-1">{criterion}</TableCell>
                          <TableCell className="text-center py-1">
                            <button
                              onClick={() => handleMarkChange(criteriaKey, '/')}
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                criteriaMarks[criteriaKey] === '/' 
                                  ? "bg-amber-100 text-amber-700" 
                                  : "hover:bg-muted"
                              )}
                            >
                              <Slash className={cn(
                                "h-3.5 w-3.5",
                                criteriaMarks[criteriaKey] === '/' ? "opacity-100" : "opacity-40"
                              )} />
                            </button>
                          </TableCell>
                          <TableCell className="text-center py-1">
                            <button
                              onClick={() => handleMarkChange(criteriaKey, 'X')}
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                criteriaMarks[criteriaKey] === 'X' 
                                  ? "bg-orange-100 text-orange-700" 
                                  : "hover:bg-muted"
                              )}
                            >
                              <XCircle className={cn(
                                "h-3.5 w-3.5",
                                criteriaMarks[criteriaKey] === 'X' ? "opacity-100" : "opacity-40"
                              )} />
                            </button>
                          </TableCell>
                          <TableCell className="text-center py-1">
                            <button
                              onClick={() => handleMarkChange(criteriaKey, '*')}
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                criteriaMarks[criteriaKey] === '*' 
                                  ? "bg-red-100 text-red-700" 
                                  : "hover:bg-muted"
                              )}
                            >
                              <span className={cn(
                                "text-base font-bold",
                                criteriaMarks[criteriaKey] === '*' ? "opacity-100" : "opacity-40"
                              )}>*</span>
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="movimentos" className="mt-0">
                <div className="text-sm mb-2">
                  <p className="text-muted-foreground">Avalie os movimentos do estudante. Cada marca reduz a pontuação:</p>
                  <div className="flex space-x-4 text-xs mt-1">
                    <span className="flex items-center"><Slash className="h-3 w-3 mr-1 text-amber-600" /> -0.2 pontos (pequeno ajuste)</span>
                    <span className="flex items-center"><XCircle className="h-3 w-3 mr-1 text-orange-600" /> -0.4 pontos (ajuste necessário)</span>
                    <span className="flex items-center"><span className="text-base font-bold mr-1 text-red-600">*</span> -0.5 pontos (correção crítica)</span>
                  </div>
                </div>
                
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
                    {findCriteriaGroup("Movimentos")?.criteria.map((criterion, i) => {
                      const criteriaKey = `Movimentos-${criterion}`;
                      return (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-xs py-1">{criterion}</TableCell>
                          <TableCell className="text-center py-1">
                            <button
                              onClick={() => handleMarkChange(criteriaKey, '/')}
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                criteriaMarks[criteriaKey] === '/' 
                                  ? "bg-amber-100 text-amber-700" 
                                  : "hover:bg-muted"
                              )}
                            >
                              <Slash className={cn(
                                "h-3.5 w-3.5",
                                criteriaMarks[criteriaKey] === '/' ? "opacity-100" : "opacity-40"
                              )} />
                            </button>
                          </TableCell>
                          <TableCell className="text-center py-1">
                            <button
                              onClick={() => handleMarkChange(criteriaKey, 'X')}
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                criteriaMarks[criteriaKey] === 'X' 
                                  ? "bg-orange-100 text-orange-700" 
                                  : "hover:bg-muted"
                              )}
                            >
                              <XCircle className={cn(
                                "h-3.5 w-3.5",
                                criteriaMarks[criteriaKey] === 'X' ? "opacity-100" : "opacity-40"
                              )} />
                            </button>
                          </TableCell>
                          <TableCell className="text-center py-1">
                            <button
                              onClick={() => handleMarkChange(criteriaKey, '*')}
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                criteriaMarks[criteriaKey] === '*' 
                                  ? "bg-red-100 text-red-700" 
                                  : "hover:bg-muted"
                              )}
                            >
                              <span className={cn(
                                "text-base font-bold",
                                criteriaMarks[criteriaKey] === '*' ? "opacity-100" : "opacity-40"
                              )}>*</span>
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="gerais" className="mt-0">
                <div className="text-sm mb-2">
                  <p className="text-muted-foreground">Avalie os aspectos gerais do estudante. Cada marca reduz a pontuação:</p>
                  <div className="flex space-x-4 text-xs mt-1">
                    <span className="flex items-center"><Slash className="h-3 w-3 mr-1 text-amber-600" /> -0.2 pontos (pequeno ajuste)</span>
                    <span className="flex items-center"><XCircle className="h-3 w-3 mr-1 text-orange-600" /> -0.4 pontos (ajuste necessário)</span>
                    <span className="flex items-center"><span className="text-base font-bold mr-1 text-red-600">*</span> -0.5 pontos (correção crítica)</span>
                  </div>
                </div>
                
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
                    {findCriteriaGroup("Gerais")?.criteria.map((criterion, i) => {
                      const criteriaKey = `Gerais-${criterion}`;
                      return (
                        <TableRow key={i}>
                          <TableCell className="font-medium text-xs py-1">{criterion}</TableCell>
                          <TableCell className="text-center py-1">
                            <button
                              onClick={() => handleMarkChange(criteriaKey, '/')}
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                criteriaMarks[criteriaKey] === '/' 
                                  ? "bg-amber-100 text-amber-700" 
                                  : "hover:bg-muted"
                              )}
                            >
                              <Slash className={cn(
                                "h-3.5 w-3.5",
                                criteriaMarks[criteriaKey] === '/' ? "opacity-100" : "opacity-40"
                              )} />
                            </button>
                          </TableCell>
                          <TableCell className="text-center py-1">
                            <button
                              onClick={() => handleMarkChange(criteriaKey, 'X')}
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                criteriaMarks[criteriaKey] === 'X' 
                                  ? "bg-orange-100 text-orange-700" 
                                  : "hover:bg-muted"
                              )}
                            >
                              <XCircle className={cn(
                                "h-3.5 w-3.5",
                                criteriaMarks[criteriaKey] === 'X' ? "opacity-100" : "opacity-40"
                              )} />
                            </button>
                          </TableCell>
                          <TableCell className="text-center py-1">
                            <button
                              onClick={() => handleMarkChange(criteriaKey, '*')}
                              className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                criteriaMarks[criteriaKey] === '*' 
                                  ? "bg-red-100 text-red-700" 
                                  : "hover:bg-muted"
                              )}
                            >
                              <span className={cn(
                                "text-base font-bold",
                                criteriaMarks[criteriaKey] === '*' ? "opacity-100" : "opacity-40"
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
        
        <div className="space-y-1 mt-3">
          <Label htmlFor={`notes-${student.id}`} className="text-sm">Observações</Label>
          <Textarea
            id={`notes-${student.id}`}
            value={notes}
            onChange={(e) => onNotesChange(student.id, e.target.value)}
            placeholder="Adicione observações sobre o desempenho..."
            className="min-h-[80px] resize-none text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
};
