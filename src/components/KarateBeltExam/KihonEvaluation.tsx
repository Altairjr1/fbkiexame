
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
    <Card className="overflow-hidden border">
      <CardHeader className="flex flex-row items-center gap-4 bg-muted/50">
        <div className="w-14 flex-shrink-0">
          <BeltDisplay 
            belt={student.targetBelt} 
            danStage={student.danStage} 
            className="w-full" 
          />
        </div>
        
        <div className="flex-grow">
          <CardTitle className="text-xl">{student.name}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`w-3 h-3 rounded-full ${getBeltColorClass(student.belt)}`} />
            <span>{student.belt}</span>
            <span className="mx-1">→</span>
            <div className={`w-3 h-3 rounded-full ${getBeltColorClass(student.targetBelt)}`} />
            <span>{student.targetBelt}</span>
            <Badge className="ml-2">{student.club}</Badge>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-3xl font-bold">{score}</div>
          <div className="text-sm text-muted-foreground">Pontuação atual</div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="mb-4">
          <Label htmlFor={`examiner-${student.id}`}>Nome do Examinador</Label>
          <Input 
            id={`examiner-${student.id}`}
            value={examinerName}
            onChange={(e) => onExaminerNameChange(student.id, e.target.value)}
            placeholder="Nome do examinador de Kihon"
            className="mt-1"
          />
        </div>
        
        {criteriaGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            <h4 className="font-semibold mb-2">{group.name}</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Critério</TableHead>
                  <TableHead className="w-[80px] text-center">/ (-0.2)</TableHead>
                  <TableHead className="w-[80px] text-center">X (-0.4)</TableHead>
                  <TableHead className="w-[80px] text-center">* (-0.5)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.criteria.map((criterion, i) => {
                  const criteriaKey = `${group.name}-${criterion}`;
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{criterion}</TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => handleMarkChange(criteriaKey, '/')}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            criteriaMarks[criteriaKey] === '/' 
                              ? "bg-amber-100 text-amber-700" 
                              : "hover:bg-muted"
                          )}
                        >
                          <Slash className={cn(
                            "h-4 w-4",
                            criteriaMarks[criteriaKey] === '/' ? "opacity-100" : "opacity-40"
                          )} />
                        </button>
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => handleMarkChange(criteriaKey, 'X')}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            criteriaMarks[criteriaKey] === 'X' 
                              ? "bg-orange-100 text-orange-700" 
                              : "hover:bg-muted"
                          )}
                        >
                          <XCircle className={cn(
                            "h-4 w-4",
                            criteriaMarks[criteriaKey] === 'X' ? "opacity-100" : "opacity-40"
                          )} />
                        </button>
                      </TableCell>
                      <TableCell className="text-center">
                        <button
                          onClick={() => handleMarkChange(criteriaKey, '*')}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                            criteriaMarks[criteriaKey] === '*' 
                              ? "bg-red-100 text-red-700" 
                              : "hover:bg-muted"
                          )}
                        >
                          <span className={cn(
                            "text-lg font-bold",
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
        
        <div className="space-y-2 mt-4">
          <Label htmlFor={`notes-${student.id}`}>Observações</Label>
          <Textarea
            id={`notes-${student.id}`}
            value={notes}
            onChange={(e) => onNotesChange(student.id, e.target.value)}
            placeholder="Adicione observações sobre o desempenho..."
            className="min-h-[100px] resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
};
