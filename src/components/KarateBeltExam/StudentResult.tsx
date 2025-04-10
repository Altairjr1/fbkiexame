import React from 'react';
import { Student } from './StudentCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from 'lucide-react';
import BeltDisplay from './BeltDisplay';
import { format } from 'date-fns';

interface StudentResultProps {
  student: Student;
  examDate: Date | undefined;
  examLocation: string;
  kihonScore: number;
  kataScore: number;
  kumiteScore: number;
  knowledgeScore: number;
  notes: string;
  kihonExaminer: string;
  kataExaminer: string;
  kumiteExaminer: string;
  knowledgeExaminer: string;
  kihonMarks?: {[key: string]: string};
  kumiteMarks?: {[key: string]: string};
  ref?: React.Ref<HTMLDivElement>;
}

export const StudentResult = React.forwardRef<HTMLDivElement, StudentResultProps>(({
  student,
  examDate,
  examLocation,
  kihonScore,
  kataScore,
  kumiteScore,
  knowledgeScore,
  notes,
  kihonExaminer,
  kataExaminer,
  kumiteExaminer,
  knowledgeExaminer,
  kihonMarks = {},
  kumiteMarks = {}
}, ref) => {
  const calculateResults = () => {
    const scores = [];
    
    scores.push(kihonScore || 0);
    scores.push(kataScore || 0);
    
    if (student.targetBelt !== "Amarela") {
      scores.push(kumiteScore || 0);
    }
    
    if (student.targetBelt === "Preta" || student.targetBelt === "Dans") {
      scores.push(knowledgeScore || 0);
    }
    
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = sum / scores.length;
    
    return {
      average: average.toFixed(1),
      passed: average >= 6
    };
  };

  const result = calculateResults();
  
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

  const renderMarkSymbol = (mark: string) => {
    if (mark === '/') return <Slash className="h-4 w-4 text-amber-600" />;
    if (mark === 'X') return <XCircle className="h-4 w-4 text-orange-600" />;
    if (mark === '*') return <span className="text-base font-bold text-red-600">*</span>;
    return null;
  };

  const formatMarkKey = (key: string): string => {
    const parts = key.split('-');
    if (parts.length >= 2) {
      return parts[1];
    }
    return key;
  };

  const groupKihonMarks = () => {
    const groups: {[key: string]: {criterion: string, mark: string}[]} = {};
    
    Object.entries(kihonMarks).forEach(([key, mark]) => {
      const parts = key.split('-');
      if (parts.length >= 2) {
        const group = parts[0];
        const criterion = parts[1];
        
        if (!groups[group]) {
          groups[group] = [];
        }
        
        groups[group].push({
          criterion,
          mark
        });
      } else {
        if (!groups['Geral']) {
          groups['Geral'] = [];
        }
        
        groups['Geral'].push({
          criterion: key,
          mark
        });
      }
    });
    
    return groups;
  };

  const kihonMarksByGroup = groupKihonMarks();

  const getErrorLabel = (mark: string) => {
    switch(mark) {
      case '/': return 'Pequeno ajuste';
      case 'X': return 'Ajuste necessário';
      case '*': return 'Correção crítica';
      default: return '';
    }
  };

  const getMarkColorClasses = (mark: string) => {
    switch(mark) {
      case '/': return 'bg-amber-50 text-amber-700';
      case 'X': return 'bg-orange-50 text-orange-700';
      case '*': return 'bg-red-50 text-red-700';
      default: return '';
    }
  };

  return (
    <div className="print-container w-full max-w-4xl mx-auto" ref={ref}>
      <Card className={`border-l-4 ${result.passed ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <CardHeader className="bg-muted/30 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">{student.name}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {student.club} • {student.age} anos • Exame: {examLocation}
              </div>
              <div className="text-sm mt-1">
                Data: {examDate ? format(examDate, "dd/MM/yyyy") : "Não definida"}
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-2">
                {result.passed ? (
                  <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1 px-3 py-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Aprovado
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1 px-3 py-1">
                    <XCircle className="w-4 h-4" />
                    Reprovado
                  </Badge>
                )}
              </div>
              <div className="text-4xl font-bold">{result.average}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full ${getBeltColorClass(student.belt)}`} />
              <span className="ml-1">{student.belt}</span>
            </div>
            <span className="text-xl">→</span>
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full ${getBeltColorClass(student.targetBelt)}`} />
              <span className="ml-1">{student.targetBelt} {student.danStage ? `(${student.danStage})` : ''}</span>
            </div>
            <div className="ml-auto">
              <div className="hidden md:block w-16">
                <BeltDisplay 
                  belt={student.targetBelt} 
                  danStage={student.danStage} 
                  className="w-full" 
                />
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-sm font-medium">Kihon</div>
              <div className="text-xl font-bold mt-1">{kihonScore || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Avaliado por: {kihonExaminer || "Não informado"}</div>
            </div>
            
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-sm font-medium">Kata</div>
              <div className="text-xl font-bold mt-1">{kataScore || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Avaliado por: {kataExaminer || "Não informado"}</div>
            </div>
            
            {student.targetBelt !== "Amarela" && (
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-sm font-medium">Kumitê</div>
                <div className="text-xl font-bold mt-1">{kumiteScore || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Avaliado por: {kumiteExaminer || "Não informado"}</div>
              </div>
            )}
            
            {(student.targetBelt === "Preta" || student.targetBelt === "Dans") && (
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-sm font-medium">Conhecimentos</div>
                <div className="text-xl font-bold mt-1">{knowledgeScore || 0}</div>
                <div className="text-xs text-muted-foreground mt-1">Avaliado por: {knowledgeExaminer || "Não informado"}</div>
              </div>
            )}
          </div>
          
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Avaliação de Kihon</h3>
              <div className="space-y-4">
                {Object.entries(kihonMarksByGroup).map(([group, marks], index) => (
                  <div key={index} className="border rounded-md p-3">
                    <h4 className="text-sm font-semibold mb-2">{group}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {marks.filter(item => item.mark).map((item, i) => (
                        <div 
                          key={i} 
                          className={`flex items-center gap-2 text-xs p-1.5 rounded-md ${getMarkColorClasses(item.mark)}`}
                        >
                          <span className="font-medium">{item.criterion}:</span>
                          <span className="flex items-center">
                            {renderMarkSymbol(item.mark)}
                            <span className="ml-1 text-xs">
                              {getErrorLabel(item.mark)}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          
            {student.targetBelt !== "Amarela" && Object.keys(kumiteMarks).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Avaliação de Kumitê</h3>
                <div className="border rounded-md p-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(kumiteMarks).filter(([_, mark]) => mark).map(([criterion, mark], i) => (
                      <div 
                        key={i} 
                        className={`flex items-center gap-2 text-xs p-1.5 rounded-md ${getMarkColorClasses(mark)}`}
                      >
                        <span className="font-medium">{criterion}:</span>
                        <span className="flex items-center">
                          {renderMarkSymbol(mark)}
                          <span className="ml-1 text-xs">
                            {getErrorLabel(mark)}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {notes && (
            <div className="mt-6 border-t pt-4">
              <h4 className="font-medium mb-2">Observações:</h4>
              <p className="text-muted-foreground text-sm">{notes}</p>
            </div>
          )}
          
          <div className="border-t mt-6 pt-6 text-center text-xs text-muted-foreground">
            Federação Baiana de Karatê Interestilo - Exame de Faixa
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

StudentResult.displayName = "StudentResult";

export const Slash = (props: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M22 3L2 21"/>
  </svg>
);
