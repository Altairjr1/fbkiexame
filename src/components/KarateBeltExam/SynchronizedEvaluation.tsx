
import React, { useState, useEffect } from 'react';
import { Student } from './StudentCard';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import BeltDisplay from "./BeltDisplay";
import { ArrowRight, CheckCircle2, XCircle, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';

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
  const [fullscreenStudent, setFullscreenStudent] = useState<number | null>(null);

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
                  <div className="space-y-3">
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
          );
        })}
      </div>
    </div>
  );
};
