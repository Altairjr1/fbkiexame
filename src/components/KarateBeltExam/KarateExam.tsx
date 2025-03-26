
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentCard, Student } from "./StudentCard";
import BeltDisplay from "./BeltDisplay";
import { Label } from "@/components/ui/label";
import { 
  PlusCircle, MinusCircle, ArrowRight, User, Award, 
  BookOpen, Swords, FileText, CalendarIcon, MapPinIcon,
  CheckCircle, Save, Download, Printer, Share2
} from "lucide-react";
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
import { SynchronizedEvaluation } from "./SynchronizedEvaluation";
import { ExamResults } from "./ExamResults";
import { useNavigate } from "react-router-dom";

export default function KarateExam() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("students");
  const belts = ["Amarela", "Vermelha", "Laranja", "Verde", "Estágio 1", "Estágio 2", "Roxa", "Marrom", "Preta", "Dans"];
  const [examDate, setExamDate] = useState<Date | undefined>(undefined);
  const [examLocation, setExamLocation] = useState("");
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);

  // Evaluation states
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
    // Check if all evaluations are complete
    const incompleteEvaluations = students.some(student => {
      return (
        !kihonScores[student.id] ||
        !kataScores[student.id] ||
        !kumiteScores[student.id] ||
        ((student.targetBelt === "Preta" || student.targetBelt === "Dans") && !knowledgeScores[student.id])
      );
    });

    if (incompleteEvaluations) {
      toast({
        title: "Avaliação incompleta",
        description: "Por favor, complete a avaliação de todos os alunos em todas as categorias aplicáveis.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Avaliação concluída",
      description: "O exame de faixa foi finalizado com sucesso!",
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
    
    // Move to results tab
    setActiveTab("results");
  };

  const handleKihonScoreChange = (studentId: number, score: number) => {
    setKihonScores(prev => ({ ...prev, [studentId]: score }));
  };

  const handleKataScoreChange = (studentId: number, score: number) => {
    setKataScores(prev => ({ ...prev, [studentId]: score }));
  };

  const handleKumiteScoreChange = (studentId: number, score: number) => {
    setKumiteScores(prev => ({ ...prev, [studentId]: score }));
  };

  const handleKnowledgeScoreChange = (studentId: number, score: number) => {
    setKnowledgeScores(prev => ({ ...prev, [studentId]: score }));
  };

  const handleNotesChange = (studentId: number, notes: string) => {
    setExaminerNotes(prev => ({ ...prev, [studentId]: notes }));
  };

  const requiresKnowledgeTest = (student: Student) => {
    return student.targetBelt === "Preta" || student.targetBelt === "Dans";
  };

  // Handle printing and sharing
  const handlePrint = () => {
    toast({
      title: "Impressão iniciada",
      description: "O documento está sendo preparado para impressão."
    });
    window.print();
  };

  const handleShare = () => {
    toast({
      title: "Compartilhamento",
      description: "Função de compartilhamento em desenvolvimento."
    });
    // In a real implementation, this would generate a shareable PDF or link
  };

  const handleSave = () => {
    const examInfo = {
      date: examDate ? format(examDate, 'dd-MM-yyyy') : 'sem-data',
      location: examLocation.replace(/\s+/g, '-').toLowerCase() || 'sem-local',
      students: students.map(s => ({
        ...s,
        kihon: kihonScores[s.id] || 0,
        kata: kataScores[s.id] || 0,
        kumite: kumiteScores[s.id] || 0,
        knowledge: knowledgeScores[s.id] || 0,
        notes: examinerNotes[s.id] || ""
      }))
    };
    
    // In a real implementation, this would save to a database or local storage
    localStorage.setItem(`exam-${examInfo.date}-${examInfo.location}`, JSON.stringify(examInfo));
    
    toast({
      title: "Exame salvo",
      description: "O registro do exame foi salvo com sucesso!"
    });
  };

  const handleReset = () => {
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
    
    toast({
      title: "Formulário resetado",
      description: "Um novo exame pode ser registrado agora."
    });
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
        <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-6 mb-8">
          <TabsTrigger value="students" disabled={activeTab === "results"}>
            <User className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Alunos</span>
          </TabsTrigger>
          <TabsTrigger value="kihon" disabled={activeTab === "students" || activeTab === "results"}>
            <Award className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Kihon</span>
          </TabsTrigger>
          <TabsTrigger value="kata" disabled={activeTab === "students" || activeTab === "results"}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Kata</span>
          </TabsTrigger>
          <TabsTrigger value="kumite" disabled={activeTab === "students" || activeTab === "results"}>
            <Swords className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Kumitê</span>
          </TabsTrigger>
          <TabsTrigger 
            value="knowledge" 
            disabled={
              activeTab === "students" || 
              activeTab === "results" || 
              !students.some(requiresKnowledgeTest)
            }
          >
            <FileText className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Conhecimento</span>
          </TabsTrigger>
          <TabsTrigger value="results" disabled={activeTab === "students"}>
            <CheckCircle className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Resultados</span>
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
          <SynchronizedEvaluation
            students={students}
            evaluationType="kihon"
            scores={kihonScores}
            notes={examinerNotes}
            onScoreChange={handleKihonScoreChange}
            onNotesChange={handleNotesChange}
            title="Avaliação de Kihon"
            description="Avalie a técnica básica, postura e execução dos movimentos fundamentais."
          />
          
          <div className="flex justify-end mt-8">
            <Button onClick={() => setActiveTab("kata")}>
              Próxima Etapa
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="kata">
          <SynchronizedEvaluation
            students={students}
            evaluationType="kata"
            scores={kataScores}
            notes={examinerNotes}
            onScoreChange={handleKataScoreChange}
            onNotesChange={handleNotesChange}
            title="Avaliação de Kata"
            description="Avalie a execução do kata, incluindo ritmo, força, equilíbrio e precisão técnica."
          />
          
          <div className="flex justify-end mt-8">
            <Button onClick={() => setActiveTab("kumite")}>
              Próxima Etapa
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="kumite">
          <SynchronizedEvaluation
            students={students}
            evaluationType="kumite"
            scores={kumiteScores}
            notes={examinerNotes}
            onScoreChange={handleKumiteScoreChange}
            onNotesChange={handleNotesChange}
            title="Avaliação de Kumitê"
            description="Avalie o combate, incluindo técnica, estratégia, controle e espírito marcial."
          />
          
          <div className="flex justify-end mt-8">
            {students.some(requiresKnowledgeTest) ? (
              <Button onClick={() => setActiveTab("knowledge")}>
                Próxima Etapa
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Finalizar Avaliação
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </TabsContent>

        <TabsContent value="knowledge">
          <SynchronizedEvaluation
            students={students.filter(requiresKnowledgeTest)}
            evaluationType="knowledge"
            scores={knowledgeScores}
            notes={examinerNotes}
            onScoreChange={handleKnowledgeScoreChange}
            onNotesChange={handleNotesChange}
            title="Avaliação de Conhecimentos"
            description="Avalie o conhecimento teórico, histórico e filosófico do Karatê, necessário para faixas pretas e dans."
          />
          
          <div className="flex justify-end mt-8">
            <Button onClick={handleSubmit}>
              Finalizar Avaliação
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="results">
          <ExamResults
            students={students}
            examDate={examDate}
            examLocation={examLocation}
            kihonScores={kihonScores}
            kataScores={kataScores}
            kumiteScores={kumiteScores}
            knowledgeScores={knowledgeScores}
            examinerNotes={examinerNotes}
            onPrint={handlePrint}
            onShare={handleShare}
            onSave={handleSave}
          />
          
          <div className="flex justify-center mt-10">
            <Button onClick={handleReset} variant="outline">
              Registrar novo exame
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
