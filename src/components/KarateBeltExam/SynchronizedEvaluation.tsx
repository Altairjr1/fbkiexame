
import React, { useState, useEffect } from 'react';
import { Student } from './StudentCard';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import BeltDisplay from "./BeltDisplay";
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

interface SynchronizedEvaluationProps {
  students: Student[];
  evaluationType: 'kihon' | 'kata' | 'kumite' | 'knowledge';
  scores: {[key: number]: number};
  notes: {[key: number]: string};
  onScoreChange: (studentId: number, score: number) => void;
  onNotesChange: (studentId: number, notes: string) => void;
  title: string;
  description: string;
}

export const SynchronizedEvaluation: React.FC<SynchronizedEvaluationProps> = ({
  students,
  evaluationType,
  scores,
  notes,
  onScoreChange,
  onNotesChange,
  title,
  description
}) => {
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);

  // Initialize scores with 10 if not set yet
  useEffect(() => {
    students.forEach(student => {
      if (scores[student.id] === undefined) {
        onScoreChange(student.id, 10);
      }
    });
  }, [students, scores, onScoreChange]);

  const toggleExpanded = (studentId: number) => {
    setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
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
    if (score < 5) return "Insuficiente";
    if (score < 7) return "Regular";
    if (score < 9) return "Bom";
    return "Excelente";
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {students.map((student) => (
          <Card 
            key={student.id} 
            className={cn(
              "overflow-hidden border transition-all duration-300",
              expandedStudentId === student.id ? "ring-2 ring-primary" : "hover:border-primary/50"
            )}
          >
            <div className="p-3 flex flex-row items-center gap-2 cursor-pointer" onClick={() => toggleExpanded(student.id)}>
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
                <span className="text-base font-semibold">{scores[student.id] || 10}</span>
                {(scores[student.id] || 10) >= 6 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
            
            {expandedStudentId === student.id && (
              <CardContent className="border-t bg-muted/30 p-3">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <Label className="text-xs">Pontuação: {scores[student.id] || 10}</Label>
                      <span className="text-xs font-medium">
                        {renderScoreRating(scores[student.id] || 10)}
                      </span>
                    </div>
                    <Slider
                      value={[scores[student.id] || 10]}
                      min={0}
                      max={10}
                      step={0.5}
                      onValueChange={(value) => onScoreChange(student.id, value[0])}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor={`notes-${student.id}`} className="text-xs">Observações</Label>
                    <Textarea
                      id={`notes-${student.id}`}
                      placeholder="Adicione observações sobre o desempenho..."
                      value={notes[student.id] || ""}
                      onChange={(e) => onNotesChange(student.id, e.target.value)}
                      className="min-h-[60px] resize-none text-xs"
                    />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
