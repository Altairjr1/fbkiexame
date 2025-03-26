
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Download, Printer, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

interface ExamRecord {
  id: string;
  date: string;
  location: string;
  studentCount: number;
  passedCount: number;
}

export const ExamsArchive = () => {
  const [exams, setExams] = useState<ExamRecord[]>([]);
  
  useEffect(() => {
    // Load saved exams from localStorage
    const savedExams: ExamRecord[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('exam-')) {
        try {
          const examData = JSON.parse(localStorage.getItem(key) || '{}');
          const examId = key.replace('exam-', '');
          
          // Format the data for display
          savedExams.push({
            id: examId,
            date: examData.date || 'Data desconhecida',
            location: examData.location || 'Local desconhecido',
            studentCount: examData.students?.length || 0,
            passedCount: examData.students?.filter((s: any) => {
              const scores = [
                s.kihon || 0,
                s.kata || 0,
                s.kumite || 0
              ];
              
              if (s.targetBelt === "Preta" || s.targetBelt === "Dans") {
                scores.push(s.knowledge || 0);
              }
              
              const average = scores.reduce((acc: number, score: number) => acc + score, 0) / scores.length;
              return average >= 6;
            }).length || 0
          });
        } catch (e) {
          console.error("Error parsing exam data", e);
        }
      }
    }
    
    // Sort by date, newest first
    savedExams.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    setExams(savedExams);
  }, []);

  if (exams.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-medium mb-2">Nenhum exame registrado</h2>
        <p className="text-muted-foreground">
          Quando você salvar os resultados de um exame, ele aparecerá aqui.
        </p>
        <Button className="mt-4" asChild>
          <Link to="/">Realizar um exame</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Histórico de Exames</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <Card key={exam.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{exam.location}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Calendar className="w-4 h-4 mr-1" /> 
                    {exam.date}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    {exam.studentCount} alunos
                  </Badge>
                  <Badge className="bg-green-500">
                    {exam.passedCount} aprovados
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1 gap-1">
                  <Printer className="w-4 h-4" />
                  <span>Imprimir</span>
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1">
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar</span>
                </Button>
                <Button size="sm" className="flex-1 gap-1">
                  <Download className="w-4 h-4" />
                  <span>Baixar</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
