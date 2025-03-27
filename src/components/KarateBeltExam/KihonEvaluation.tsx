
import React, { useState } from 'react';
import { Student } from './StudentCard';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import BeltDisplay from "./BeltDisplay";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Slash } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';

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
      criteria: ["ZENKUTSO DACHI", "KOKUTSU DACHI", "KIBA DACHI", "HEIKO DACHI", "HEISOKU DACHI"]
    },
    {
      name: "Movimentos",
      criteria: ["OI ZUKI", "TETSUI", "AGE UKE", "GEDAN BARAI", "SOTO UKE", "UCHI UKE", "SHUTO UKE", "MAI GUERI KEAGUE", "YOKO GUERI KEAGUE"]
    },
    {
      name: "Gerais",
      criteria: ["CINTURA", "CONHECIMENTO", "COORDENAÇÃO", "EMBUZEN", "ESCUDO", "ESPIRITO", "FORMA", "KIAI", "KIMÊ", "POSTURA", "RIKIASHI", "RIKITE", "UNIFORME", "VISTA"]
    }
  ];

  // In a real application, you might add more specific criteria based on belt level
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
  
  // Calculate score based on marks
  const calculateScore = (marks: {[key: string]: string}) => {
    let totalScore = 10;
    
    Object.values(marks).forEach(mark => {
      if (mark === '/') totalScore -= 0.2;
      else if (mark === 'X') totalScore -= 0.4;
      else if (mark === '*') totalScore -= 0.5;
    });
    
    // Ensure score is not negative
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

  return (
    <Card className="overflow-hidden border shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2 bg-muted/50 py-3 px-4">
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
          <div className="text-xs text-muted-foreground">Pontuação</div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3">
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
        
        {criteriaGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-4">
            <h4 className="font-semibold text-sm mb-1">{group.name}</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] py-2 text-xs">Critério</TableHead>
                  <TableHead className="w-[60px] text-center py-2 text-xs">/ (-0.2)</TableHead>
                  <TableHead className="w-[60px] text-center py-2 text-xs">X (-0.4)</TableHead>
                  <TableHead className="w-[60px] text-center py-2 text-xs">* (-0.5)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.criteria.map((criterion, i) => {
                  const criteriaKey = `${group.name}-${criterion}`;
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
          </div>
        ))}
        
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
