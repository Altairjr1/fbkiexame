
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentCard, Student } from "./StudentCard";
import BeltDisplay from "./BeltDisplay";
import { Label } from "@/components/ui/label"; // Adding the missing import
import { PlusCircle, MinusCircle, ArrowRight, User, Award, BookOpen, Swords, FileText, CalendarIcon, MapPinIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

export default function KarateExam() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("students");
  const belts = ["Amarela", "Vermelha", "Laranja", "Verde", "Estágio 1", "Estágio 2", "Estágio 3", "Roxa", "Marrom", "Preta", "Dans"];
  const [examDate, setExamDate] = useState<Date | undefined>(undefined);
  const [examLocation, setExamLocation] = useState("");
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);

  // Expanded evaluation states
  const [kihonScores, setKihonScores] = useState<{[key: number]: number}>({});
  const [kataScores, setKataScores] = useState<{[key: number]: number}>({});
  const [kumiteScores, setKumiteScores] = useState<{[key: number]: number}>({});
  const [knowledgeScores, setKnowledgeScores] = useState<{[key: number]: number}>({});
  const [examinerNotes, setExaminerNotes] = useState<{[key: number]: string}>({});

  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "", age: "", club: "", specialCondition: "", belt: "", targetBelt: "", danStage: "" },
    { id: 2, name: "", age: "", club: "", specialCondition: "", belt: "", targetBelt: "", danStage: "" },
    { id: 3, name: "", age: "", club: "", specialCondition: "", belt: "", targetBelt: "", danStage: "" },
    { id: 4, name: "", age: "", club: "", specialCondition: "", belt: "", targetBelt: "", danStage: "" }
  ]);

  const handleStudentChange = (id: number, field: keyof Student, value: string) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === id ? { ...student, [field]: value } : student
      )
    );
  };

  const addStudent = () => {
    const newId = Math.max(0, ...students.map(s => s.id)) + 1;
    setStudents([...students, { 
      id: newId, 
      name: "", 
      age: "", 
      club: "", 
      specialCondition: "", 
      belt: "", 
      targetBelt: "",
      danStage: "" 
    }]);
    
    toast({
      title: "Aluno adicionado",
      description: "Um novo aluno foi adicionado à lista de exames.",
    });
  };

  const removeStudent = (id: number) => {
    if (students.length <= 1) {
      toast({
        title: "Ação não permitida",
        description: "É necessário ter pelo menos um aluno para o exame.",
        variant: "destructive"
      });
      return;
    }
    
    setStudents(students.filter(student => student.id !== id));
    toast({
      title: "Aluno removido",
      description: "O aluno foi removido da lista de exames.",
    });
  };

  const handleNextStep = () => {
    // Validate required fields
    const incompleteStudents = students.filter(
      student => !student.name || !student.age || !student.club || !student.belt || !student.targetBelt
    );
    
    if (incompleteStudents.length > 0) {
      toast({
        title: "Informações incompletas",
        description: "Por favor, preencha todos os campos obrigatórios para cada aluno.",
        variant: "destructive"
      });
      return;
    }

    if (!examDate) {
      toast({
        title: "Data não informada",
        description: "Por favor, informe a data do exame.",
        variant: "destructive"
      });
      return;
    }

    if (!examLocation) {
      toast({
        title: "Local não informado",
        description: "Por favor, informe o local do exame.",
        variant: "destructive"
      });
      return;
    }
    
    setActiveTab("kihon");
    toast({
      title: "Prosseguindo para avaliação",
      description: "Você pode agora avaliar os alunos em diferentes categorias.",
    });
  };

  const handleSubmit = () => {
    toast({
      title: "Exame agendado",
      description: "O exame de faixa foi registrado com sucesso!",
    });
    
    // Here you would typically send data to a server
    console.log("Submitted exam data:", {
      students,
      examDate,
      examLocation,
      kihonScores,
      kataScores,
      kumiteScores,
      knowledgeScores,
      examinerNotes
    });
    
    // Reset form or redirect
    setTimeout(() => {
      setActiveTab("confirmation");
    }, 500);
  };

  const handleEvaluationScoreChange = (
    scoreType: 'kihon' | 'kata' | 'kumite' | 'knowledge',
    studentId: number, 
    score: number
  ) => {
    switch (scoreType) {
      case 'kihon':
        setKihonScores(prev => ({ ...prev, [studentId]: score }));
        break;
      case 'kata':
        setKataScores(prev => ({ ...prev, [studentId]: score }));
        break;
      case 'kumite':
        setKumiteScores(prev => ({ ...prev, [studentId]: score }));
        break;
      case 'knowledge':
        setKnowledgeScores(prev => ({ ...prev, [studentId]: score }));
        break;
    }
  };

  const handleExaminerNotesChange = (studentId: number, notes: string) => {
    setExaminerNotes(prev => ({ ...prev, [studentId]: notes }));
  };

  const requiresKnowledgeTest = (student: Student) => {
    return student.targetBelt === "Preta" || student.targetBelt === "Dans";
  };

  const getCurrentStudent = () => {
    return students[currentStudentIndex] || null;
  };

  const goToNextStudent = () => {
    if (currentStudentIndex < students.length - 1) {
      setCurrentStudentIndex(prev => prev + 1);
    } else {
      // If we're on the last student, go to next tab
      const tabs = ["kihon", "kata", "kumite"];
      const currentTabIndex = tabs.indexOf(activeTab);
      
      if (currentTabIndex < tabs.length - 1) {
        setActiveTab(tabs[currentTabIndex + 1]);
        setCurrentStudentIndex(0);
      } else {
        // If on last tab, check if any student needs knowledge test
        const anyRequiresKnowledge = students.some(requiresKnowledgeTest);
        if (anyRequiresKnowledge) {
          setActiveTab("knowledge");
          setCurrentStudentIndex(0);
        } else {
          handleSubmit(); // Submit if no knowledge test needed
        }
      }
    }
  };

  const goToPreviousStudent = () => {
    if (currentStudentIndex > 0) {
      setCurrentStudentIndex(prev => prev - 1);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const renderStudentInfo = (student: Student) => {
    return (
      <div className="bg-card rounded-lg p-4 shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full max-w-[200px]">
            <BeltDisplay 
              belt={student.belt} 
              danStage={student.danStage} 
              className="w-full mb-2"
            />
            <p className="text-center text-sm font-medium">
              {student.belt}
              {(student.belt === "Preta" || student.belt === "Dans") && student.danStage && 
                ` ${student.danStage}º Dan`}
              {(student.belt === "Estágio 1" || student.belt === "Estágio 2" || student.belt === "Estágio 3") && 
                ` ${student.belt}`}
            </p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <ArrowRight className="w-3 h-3" />
              <div className={`w-3 h-3 rounded-full ${getBeltColorClass(student.targetBelt)}`} />
              <p className="text-xs font-medium">{student.targetBelt}</p>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-center md:text-left">{student.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Idade:</span> {student.age} anos
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Clube:</span> {student.club}
              </p>
              {student.specialCondition && (
                <p className="text-sm text-muted-foreground col-span-2">
                  <span className="font-medium">Condição Especial:</span> {student.specialCondition}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getBeltColorClass = (belt: string) => {
    switch(belt) {
      case "Amarela": return "belt-yellow";
      case "Vermelha": return "belt-red";
      case "Laranja": return "belt-orange";
      case "Verde": return "belt-green";
      case "Roxa": return "belt-purple";
      case "Marrom": return "belt-brown";
      case "Preta": 
      case "Dans": return "belt-black";
      case "Estágio 1": 
      case "Estágio 2": 
      case "Estágio 3": return "belt-green";
      default: return "belt-white";
    }
  };

  const renderEvaluationSection = (
    title: string, 
    description: string, 
    scoreType: 'kihon' | 'kata' | 'kumite' | 'knowledge',
    icon: React.ReactNode
  ) => {
    const currentStudent = getCurrentStudent();
    if (!currentStudent) return null;

    const scores = {
      'kihon': kihonScores,
      'kata': kataScores,
      'kumite': kumiteScores,
      'knowledge': knowledgeScores
    };

    const currentScore = scores[scoreType][currentStudent.id] || 0;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          {icon}
          <h2 className="text-xl font-semibold">{title} - Avaliação</h2>
        </div>
        
        <p className="text-muted-foreground">{description}</p>
        
        {renderStudentInfo(currentStudent)}
        
        <div className="space-y-6 bg-card/50 rounded-lg p-6 border">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Label>Pontuação: {currentScore}</Label>
              <span className="text-sm font-medium">
                {currentScore < 5 ? "Insuficiente" : 
                 currentScore < 7 ? "Regular" : 
                 currentScore < 9 ? "Bom" : "Excelente"}
              </span>
            </div>
            <Slider
              value={[currentScore]}
              min={0}
              max={10}
              step={0.5}
              onValueChange={(value) => handleEvaluationScoreChange(scoreType, currentStudent.id, value[0])}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="examiner-notes">Observações do Examinador</Label>
            <Textarea
              id="examiner-notes"
              placeholder="Descreva observações sobre o desempenho do aluno..."
              value={examinerNotes[currentStudent.id] || ""}
              onChange={(e) => handleExaminerNotesChange(currentStudent.id, e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={goToPreviousStudent}
            disabled={currentStudentIndex === 0}
          >
            Aluno Anterior
          </Button>
          
          <Button onClick={goToNextStudent}>
            {currentStudentIndex < students.length - 1 ? "Próximo Aluno" : "Próxima Etapa"}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 sm:p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <Badge className="mb-3 py-1 px-3 bg-primary/10 text-primary border-none font-medium">
          Federação Baiana de Karatê Interestilo
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">Exame de Faixa FBKI</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Preencha os dados dos alunos participantes do exame de faixa para registro na federação.
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5 mb-8">
          <TabsTrigger value="students" disabled={activeTab === "confirmation"}>
            <User className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Alunos</span>
          </TabsTrigger>
          <TabsTrigger value="kihon" disabled={activeTab === "students" || activeTab === "confirmation"}>
            <Award className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Kihon</span>
          </TabsTrigger>
          <TabsTrigger value="kata" disabled={activeTab === "students" || activeTab === "confirmation"}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Kata</span>
          </TabsTrigger>
          <TabsTrigger value="kumite" disabled={activeTab === "students" || activeTab === "confirmation"}>
            <Swords className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Kumitê</span>
          </TabsTrigger>
          <TabsTrigger 
            value="knowledge" 
            disabled={
              activeTab === "students" || 
              activeTab === "confirmation" || 
              !students.some(requiresKnowledgeTest)
            }
          >
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Conhecimento</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-6">
          {/* Exam Information Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-card rounded-lg p-6 border shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-4">Informações do Exame</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Data do Exame</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !examDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {examDate ? format(examDate, "dd/MM/yyyy") : <span>Selecione a data...</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={examDate}
                      onSelect={setExamDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Local do Exame</label>
                <div className="flex">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input 
                      value={examLocation}
                      onChange={(e) => setExamLocation(e.target.value)}
                      placeholder="Informe o local do exame..." 
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {students.map((student, index) => (
              <motion.div key={student.id} variants={item} className="relative group">
                <StudentCard 
                  student={student}
                  index={index}
                  onChange={handleStudentChange}
                  belts={belts}
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="absolute -top-3 -right-3 bg-white shadow-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeStudent(student.id)}
                >
                  <MinusCircle className="h-4 w-4 text-destructive" />
                </Button>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
            <Button 
              onClick={addStudent} 
              variant="outline" 
              className="group border-dashed transition-all duration-300 hover:border-primary"
            >
              <PlusCircle className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              Adicionar aluno
            </Button>
            
            <Button onClick={handleNextStep} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Próxima etapa
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="kihon">
          {renderEvaluationSection(
            "Kihon", 
            "Avalie a técnica básica, postura e execução dos movimentos fundamentais.",
            'kihon',
            <Award className="h-5 w-5" />
          )}
        </TabsContent>

        <TabsContent value="kata">
          {renderEvaluationSection(
            "Kata", 
            "Avalie a execução do kata, incluindo ritmo, força, equilíbrio e precisão técnica.",
            'kata',
            <BookOpen className="h-5 w-5" />
          )}
        </TabsContent>

        <TabsContent value="kumite">
          {renderEvaluationSection(
            "Kumitê", 
            "Avalie o combate, incluindo técnica, estratégia, controle e espírito marcial.",
            'kumite',
            <Swords className="h-5 w-5" />
          )}
        </TabsContent>

        <TabsContent value="knowledge">
          {renderEvaluationSection(
            "Conhecimentos", 
            "Avalie o conhecimento teórico, histórico e filosófico do Karatê, necessário para faixas pretas e dans.",
            'knowledge',
            <FileText className="h-5 w-5" />
          )}
        </TabsContent>

        <TabsContent value="confirmation">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-md mx-auto space-y-6 py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
              className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto"
            >
              <svg className="h-12 w-12 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            
            <h2 className="text-2xl font-bold">Exame Registrado com Sucesso!</h2>
            <p className="text-muted-foreground">
              O registro do exame de faixa foi concluído. Os alunos serão notificados e o instrutor receberá a confirmação por email.
            </p>
            
            <div className="pt-6">
              <Button onClick={() => {
                setActiveTab("students");
                setExamDate(undefined);
                setExamLocation("");
                setCurrentStudentIndex(0);
                setKihonScores({});
                setKataScores({});
                setKumiteScores({});
                setKnowledgeScores({});
                setExaminerNotes({});
                setStudents([
                  { id: 1, name: "", age: "", club: "", specialCondition: "", belt: "", targetBelt: "", danStage: "" },
                  { id: 2, name: "", age: "", club: "", specialCondition: "", belt: "", targetBelt: "", danStage: "" },
                  { id: 3, name: "", age: "", club: "", specialCondition: "", belt: "", targetBelt: "", danStage: "" },
                  { id: 4, name: "", age: "", club: "", specialCondition: "", belt: "", targetBelt: "", danStage: "" }
                ]);
              }}>
                Registrar novo exame
              </Button>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
