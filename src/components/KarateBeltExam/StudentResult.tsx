
import React from 'react';
import { Student } from './StudentCard';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from 'lucide-react';
import BeltDisplay from './BeltDisplay';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  // Calculate average score and determine if passed
  const calculateResults = () => {
    const scores = [];
    
    // Always include kihon and kata scores
    scores.push(kihonScore || 0);
    scores.push(kataScore || 0);
    
    // Only include kumite score for non-yellow belt candidates
    if (student.targetBelt !== "Amarela") {
      scores.push(kumiteScore || 0);
    }
    
    // Only include knowledge score for black belt or dan candidates
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

  // Helper to render mark symbols with more emphasis
  const renderMarkSymbol = (mark: string) => {
    if (mark === '/') return <Slash className="h-4 w-4 text-amber-600" />;
    if (mark === 'X') return <XCircle className="h-4 w-4 text-orange-600" />;
    if (mark === '*') return <span className="text-base font-bold text-red-600">*</span>;
    return null;
  };

  // Criteria groups for Kihon
  const kihonCriteriaGroups = [
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

  // Criteria for Kumite
  const kumiteCriteria = ["ATAQUE", "DEFESA", "CONTRA ATAQUE", "DISTÂNCIA", "ZANCHI", "ESPIRITO", "TEMPO"];

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
          
          {/* Evaluation Details Section - Now with more emphasis on errors */}
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Avaliação de Kihon</h3>
              <div className="space-y-4">
                {kihonCriteriaGroups.map((group, index) => (
                  <div key={index} className="border rounded-md p-3">
                    <h4 className="text-sm font-semibold mb-2">{group.name}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {group.criteria.map((criterion, i) => {
                        const key = `${group.name}-${criterion}`;
                        const mark = kihonMarks[key];
                        
                        // Return different styled items based on if they have marks
                        return (
                          <div 
                            key={i} 
                            className={`flex items-center gap-2 text-xs p-1 rounded-md ${
                              mark ? (
                                mark === '/' ? 'bg-amber-50' : 
                                mark === 'X' ? 'bg-orange-50' : 
                                mark === '*' ? 'bg-red-50' : ''
                              ) : ''
                            }`}
                          >
                            <span className="font-medium">{criterion}:</span>
                            {mark ? (
                              <span className="flex items-center">
                                {renderMarkSymbol(mark)}
                                <span className={`ml-1 text-xs ${
                                  mark === '/' ? 'text-amber-700' : 
                                  mark === 'X' ? 'text-orange-700' : 
                                  mark === '*' ? 'text-red-700' : ''
                                }`}>
                                  {mark === '/' ? 'Pequeno ajuste' : 
                                   mark === 'X' ? 'Ajuste necessário' : 
                                   mark === '*' ? 'Correção crítica' : ''}
                                </span>
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          
            {/* Kumite Evaluation Details - if applicable - also with more emphasis */}
            {student.targetBelt !== "Amarela" && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Avaliação de Kumitê</h3>
                <div className="border rounded-md p-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {kumiteCriteria.map((criterion, i) => {
                      const mark = kumiteMarks[criterion];
                      
                      return (
                        <div 
                          key={i} 
                          className={`flex items-center gap-2 text-xs p-1 rounded-md ${
                            mark ? (
                              mark === '/' ? 'bg-amber-50' : 
                              mark === 'X' ? 'bg-orange-50' : 
                              mark === '*' ? 'bg-red-50' : ''
                            ) : ''
                          }`}
                        >
                          <span className="font-medium">{criterion}:</span>
                          {mark ? (
                            <span className="flex items-center">
                              {renderMarkSymbol(mark)}
                              <span className={`ml-1 text-xs ${
                                mark === '/' ? 'text-amber-700' : 
                                mark === 'X' ? 'text-orange-700' : 
                                mark === '*' ? 'text-red-700' : ''
                              }`}>
                                {mark === '/' ? 'Pequeno ajuste' : 
                                 mark === 'X' ? 'Ajuste necessário' : 
                                 mark === '*' ? 'Correção crítica' : ''}
                              </span>
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      );
                    })}
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

// Add this component to make it available in the imports
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
