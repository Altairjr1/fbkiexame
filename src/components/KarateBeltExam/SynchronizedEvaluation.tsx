
import React, { useState } from 'react';
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {students.map((student) => (
          <Card 
            key={student.id} 
            className={cn(
              "overflow-hidden border transition-all duration-300",
              expandedStudentId === student.id ? "ring-2 ring-primary" : "hover:border-primary/50"
            )}
          >
            <div className="p-4 flex flex-col sm:flex-row items-center gap-4 cursor-pointer" onClick={() => toggleExpanded(student.id)}>
              <div className="w-16 flex-shrink-0">
                <BeltDisplay 
                  belt={student.belt} 
                  danStage={student.danStage} 
                  className="w-full mb-2"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate text-center sm:text-left">{student.name}</h3>
                <div className="flex items-center justify-center sm:justify-start gap-1 text-xs text-muted-foreground">
                  <div className={`w-2 h-2 rounded-full ${getBeltColorClass(student.belt)}`} />
                  <span>{student.belt}</span>
                  <ArrowRight className="w-3 h-3 mx-0.5" />
                  <div className={`w-2 h-2 rounded-full ${getBeltColorClass(student.targetBelt)}`} />
                  <span>{student.targetBelt}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">{scores[student.id] || 0}</span>
                <span className="text-xs text-muted-foreground">{renderScoreRating(scores[student.id] || 0)}</span>
                {scores[student.id] >= 6 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
            
            {expandedStudentId === student.id && (
              <CardContent className="border-t bg-muted/30 p-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <Label>Pontuação: {scores[student.id] || 0}</Label>
                      <span className="text-sm font-medium">
                        {renderScoreRating(scores[student.id] || 0)}
                      </span>
                    </div>
                    <Slider
                      value={[scores[student.id] || 0]}
                      min={0}
                      max={10}
                      step={0.5}
                      onValueChange={(value) => onScoreChange(student.id, value[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`notes-${student.id}`}>Observações</Label>
                    <Textarea
                      id={`notes-${student.id}`}
                      placeholder="Adicione observações sobre o desempenho..."
                      value={notes[student.id] || ""}
                      onChange={(e) => onNotesChange(student.id, e.target.value)}
                      className="min-h-[80px] resize-none"
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
