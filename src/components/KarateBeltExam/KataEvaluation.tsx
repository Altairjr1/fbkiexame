
import React from 'react';
import { Student } from './StudentCard';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import BeltDisplay from "./BeltDisplay";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Badge } from '@/components/ui/badge';

interface KataEvaluationProps {
  student: Student;
  onScoreChange: (studentId: number, score: number) => void;
  onNotesChange: (studentId: number, notes: string) => void;
  score: number;
  notes: string;
  examinerName: string;
  onExaminerNameChange: (studentId: number, name: string) => void;
}

export const KataEvaluation: React.FC<KataEvaluationProps> = ({
  student,
  onScoreChange,
  onNotesChange,
  score,
  notes,
  examinerName,
  onExaminerNameChange
}) => {
  const [kataName, setKataName] = React.useState("");

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

  const getScoreRating = (score: number) => {
    if (score < 5) return "Péssimo";
    if (score < 6) return "Ruim";
    if (score < 7) return "Regular";
    if (score < 8) return "Médio";
    if (score < 9) return "Bom";
    if (score < 10) return "Ótimo";
    return "Excelente";
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
          <div className="text-xs text-muted-foreground">{getScoreRating(score)}</div>
        </div>
      </CardHeader>
      
      <CardContent className="p-3">
        <div className="space-y-3">
          <div>
            <Label htmlFor={`examiner-${student.id}`} className="text-sm">Nome do Examinador*</Label>
            <Input 
              id={`examiner-${student.id}`}
              value={examinerName}
              onChange={(e) => onExaminerNameChange(student.id, e.target.value)}
              placeholder="Nome do examinador de Kata"
              className="mt-1 text-sm"
              required
            />
          </div>

          <div>
            <Label htmlFor={`kata-name-${student.id}`} className="text-sm">Nome do Kata Executado</Label>
            <Input 
              id={`kata-name-${student.id}`}
              value={kataName}
              onChange={(e) => setKataName(e.target.value)}
              placeholder="Nome do kata executado"
              className="mt-1 text-sm"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <Label className="text-sm">Pontuação: {score}</Label>
              <span className="text-xs font-medium">
                {getScoreRating(score)}
              </span>
            </div>
            <div className="py-2">
              <Slider
                value={[score]}
                min={0}
                max={10}
                step={0.1}
                onValueChange={(value) => onScoreChange(student.id, Number(value[0].toFixed(1)))}
              />
            </div>
            <div className="grid grid-cols-7 text-[9px] text-center mt-1">
              <div>Péssimo<br/>(0-4.9)</div>
              <div>Ruim<br/>(5.0-5.9)</div>
              <div>Regular<br/>(6.0-6.9)</div>
              <div>Médio<br/>(7.0-7.9)</div>
              <div>Bom<br/>(8.0-8.9)</div>
              <div>Ótimo<br/>(9.0-9.9)</div>
              <div>Excelente<br/>(10)</div>
            </div>
          </div>
          
          <div className="space-y-1 mt-2">
            <Label htmlFor={`notes-${student.id}`} className="text-sm">Observações</Label>
            <Textarea
              id={`notes-${student.id}`}
              value={notes}
              onChange={(e) => onNotesChange(student.id, e.target.value)}
              placeholder="Adicione observações sobre o desempenho..."
              className="min-h-[80px] resize-none text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
