import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentCard, Student } from "./StudentCard";
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
import { KihonEvaluation } from "./KihonEvaluation";
import { KataEvaluation } from "./KataEvaluation";
import { KumiteEvaluation } from "./KumiteEvaluation";
import { KnowledgeEvaluation } from "./KnowledgeEvaluation";
import { ExamResults } from "./ExamResults";
import { StudentResult } from "./StudentResult";
import { StudentListPrint } from "./StudentListPrint";
import { useNavigate } from "react-router-dom";
import { SynchronizedEvaluation } from "./SynchronizedEvaluation";
import { supabase } from '@/integrations/supabase/client';
import { Loading } from "@/components/ui/loading";

export default function KarateExam() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("students");
  const belts = ["Amarela", "Vermelha", "Laranja", "Verde", "Estágio 1", "Estágio 2", "Roxa", "Marrom", "Preta", "Dans"];
  const [examDate, setExamDate] = useState<Date | undefined>(undefined);
  const [examLocation, setExamLocation] = useState("");
  const [selectedStudentIndex, setSelectedStudentIndex] = useState<number | null>(null);
  const studentResultRef = useRef<HTMLDivElement>(null);
  const studentListRef = useRef<HTMLDivElement>(null);
  const [kihonMarks, setKihonMarks] = useState<{[key: number]: {[key: string]: string}}>({});
  const [kumiteMarks, setKumiteMarks] = useState<{[key: number]: {[key: string]: string}}>({});

  const [kihonScores, setKihonScores] = useState<{[key: number]: number}>({});
  const [kataScores, setKataScores] = useState<{[key: number]: number}>({});
  const [kumiteScores, setKumiteScores] = useState<{[key: number]: number}>({});
  const [knowledgeScores, setKnowledgeScores] = useState<{[key: number]: number}>({});
  
  const [kihonExaminers, setKihonExaminers] = useState<{[key: number]: string}>({});
  const [kataExaminers, setKataExaminers] = useState<{[key: number]: string}>({});
  const [kumiteExaminers, setKumiteExaminers] = useState<{[key: number]: string}>({});
  const [knowledgeExaminers, setKnowledgeExaminers] = useState<{[key: number]: string}>({});
  
  const [examinerNotes, setExaminerNotes] = useState<{[key: number]: string}>({});

  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "", age: "", club: "", specialCondition: "", belt: "", targetBelt: "", danStage: "" },
    { id: 2, name: "", age: "", club: "", specialCondition: "", belt: "", targetBelt: "", danStage: "" },
    { id: 3, name: "", age: "", club: "", specialCondition: "", belt: "", targetBelt: "", danStage: "" },
    { id: 4, name: "", age: "", club: "", specialCondition: "", belt: "", targetBelt: "", danStage: "" }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleStudentChange = (id: number, field: keyof Student, value: string) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === id ? { ...student, [field]: value } : student
      )
    );
    
    if (field === 'belt' && value === 'Verde') {
      const student = students.find(s => s.id === id);
      if (student && !['Estágio 1', 'Estágio 2', 'Roxa'].includes(student.targetBelt)) {
        handleStudentChange(id, 'targetBelt', 'Estágio 1');
      }
    }
  };

  const getTargetBeltOptions = (currentBelt: string) => {
    if (currentBelt === "Verde") {
      return ["Estágio 1", "Estágio 2", "Roxa"];
    }
    
    const currentIndex = belts.indexOf(currentBelt);
    if (currentIndex >= 0 && currentIndex < belts.length - 1) {
      return [belts[currentIndex + 1]];
    }
    return belts;
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

  const validateExaminers = (stage: string) => {
    const validator = {
      'kihon': () => {
        const missingExaminers = students.some(student => !kihonExaminers[student.id]);
        if (missingExaminers) {
          toast({
            title: "Nome do examinador ausente",
            description: "Por favor, informe o nome do examinador para todos os alunos.",
            variant: "destructive"
          });
          return false;
        }
        return true;
      },
      'kata': () => {
        const missingExaminers = students.some(student => !kataExaminers[student.id]);
        if (missingExaminers) {
          toast({
            title: "Nome do examinador ausente",
            description: "Por favor, informe o nome do examinador para todos os alunos.",
            variant: "destructive"
          });
          return false;
        }
        return true;
      },
      'kumite': () => {
        const studentsRequiringKumite = students.filter(s => s.targetBelt !== "Amarela");
        const missingExaminers = studentsRequiringKumite.some(student => !kumiteExaminers[student.id]);
        if (studentsRequiringKumite.length > 0 && missingExaminers) {
          toast({
            title: "Nome do examinador ausente",
            description: "Por favor, informe o nome do examinador para todos os alunos.",
            variant: "destructive"
          });
          return false;
        }
        return true;
      },
      'knowledge': () => {
        const studentsRequiringKnowledge = students.filter(requiresKnowledgeTest);
        const missingExaminers = studentsRequiringKnowledge.some(student => !knowledgeExaminers[student.id]);
        if (studentsRequiringKnowledge.length > 0 && missingExaminers) {
          toast({
            title: "Nome do examinador ausente",
            description: "Por favor, informe o nome do examinador para todos os alunos.",
            variant: "destructive"
          });
          return false;
        }
        return true;
      }
    };
    
    return validator[stage as keyof typeof validator]?.() ?? true;
  };

  const handleNextStep = () => {
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

  const navigateToNextTab = (currentTab: string) => {
    if (!validateExaminers(currentTab)) {
      return;
    }
    
    const tabOrder = ["students", "kihon", "kata", "kumite", "knowledge", "results"];
    
    const currentIndex = tabOrder.indexOf(currentTab);
    if (currentIndex >= 0 && currentIndex < tabOrder.length - 1) {
      let nextTab = tabOrder[currentIndex + 1];
      
      if (nextTab === "kumite" && students.every(s => s.targetBelt === "Amarela")) {
        nextTab = "knowledge";
      }
      
      if (nextTab === "knowledge" && !students.some(requiresKnowledgeTest)) {
        nextTab = "results";
      }
      
      setActiveTab(nextTab);
    }
  };

  const handleSubmit = () => {
    if (!validateExaminers('kumite') || (students.some(requiresKnowledgeTest) && !validateExaminers('knowledge'))) {
      return;
    }
    
    const incompleteEvaluations = students.some(student => {
      return (
        kihonScores[student.id] === undefined ||
        kataScores[student.id] === undefined ||
        (student.targetBelt !== "Amarela" && kumiteScores[student.id] === undefined) ||
        ((student.targetBelt === "Preta" || student.targetBelt === "Dans") && knowledgeScores[student.id] === undefined)
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
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Avaliação concluída",
        description: "O exame de faixa foi finalizado com sucesso!",
      });
      
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
      
      setActiveTab("results");
    }, 1000);
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
  
  const handleKihonExaminerChange = (studentId: number, name: string) => {
    setKihonExaminers(prev => ({ ...prev, [studentId]: name }));
  };
  
  const handleKataExaminerChange = (studentId: number, name: string) => {
    setKataExaminers(prev => ({ ...prev, [studentId]: name }));
  };
  
  const handleKumiteExaminerChange = (studentId: number, name: string) => {
    setKumiteExaminers(prev => ({ ...prev, [studentId]: name }));
  };
  
  const handleKnowledgeExaminerChange = (studentId: number, name: string) => {
    setKnowledgeExaminers(prev => ({ ...prev, [studentId]: name }));
  };

  const requiresKnowledgeTest = (student: Student) => {
    return student.targetBelt === "Preta" || student.targetBelt === "Dans";
  };

  const handlePrintStudent = (studentId: number) => {
    setSelectedStudentIndex(students.findIndex(s => s.id === studentId));
    setTimeout(() => {
      if (studentResultRef.current) {
        const printContent = studentResultRef.current.innerHTML;
        const originalContent = document.body.innerHTML;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Resultado do Exame - ${students.find(s => s.id === studentId)?.name}</title>
                <style>
                  body { font-family: Arial, sans-serif; }
                  .print-container { padding: 20px; }
                </style>
              </head>
              <body>
                <div class="print-container">${printContent}</div>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        } else {
          toast({
            title: "Erro ao imprimir",
            description: "Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desativado.",
            variant: "destructive"
          });
        }
      }
    }, 100);
  };

  const handlePrintList = () => {
    setTimeout(() => {
      if (studentListRef.current) {
        const printContent = studentListRef.current.innerHTML;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Lista de Exame - ${examLocation} - ${examDate ? format(examDate, 'dd/MM/yyyy') : ''}</title>
                <style>
                  body { font-family: Arial, sans-serif; }
                  .print-container { padding: 20px; }
                  table { width: 100%; border-collapse: collapse; }
                  th, td { padding: 8px; border-bottom: 1px solid #ddd; text-align: left; }
                  th { font-weight: bold; background-color: #f3f4f6; }
                </style>
              </head>
              <body>
                <div class="print-container">${printContent}</div>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.print();
        } else {
          toast({
            title: "Erro ao imprimir",
            description: "Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desativado.",
            variant: "destructive"
          });
        }
      }
    }, 100);
  };

  const handleShare = (studentId: number) => {
    toast({
      title: "Compartilhamento",
      description: "Função de compartilhamento em desenvolvimento."
    });
  };

  const handleDownload = (studentId: number) => {
    toast({
      title: "Download iniciado",
      description: "O documento do aluno está sendo preparado para download."
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const examData = {
        date: examDate ? format(examDate, 'yyyy-MM-dd') : null,
        location: examLocation
      };
      
      const { data: examResult, error: examError } = await supabase
        .from('exams')
        .insert(examData)
        .select('id')
        .single();
      
      if (examError) throw examError;
      console.log('Exam saved:', examResult);
      
      const examId = examResult.id;
      
      for (const student of students) {
        if (!student.name) continue;
        
        const studentData = {
          name: student.name,
          age: student.age,
          club: student.club,
          special_condition: student.specialCondition,
          current_belt: student.belt,
          target_belt: student.targetBelt,
          dan_stage: student.danStage || null,
          exam_id: examId
        };
        
        const { data: studentResult, error: studentError } = await supabase
          .from('students')
          .insert(studentData)
          .select('id')
          .single();
        
        if (studentError) {
          console.error('Error saving student:', studentError);
          continue;
        }
        
        const studentId = studentResult.id;
        
        const scoreData = {
          student_id: studentId,
          kihon: kihonScores[student.id] || null,
          kata: kataScores[student.id] || null,
          kumite: kumiteScores[student.id] || null,
          knowledge: knowledgeScores[student.id] || null,
          kihon_examiner: kihonExaminers[student.id] || null,
          kata_examiner: kataExaminers[student.id] || null,
          kumite_examiner: kumiteExaminers[student.id] || null,
          knowledge_examiner: knowledgeExaminers[student.id] || null,
          notes: examinerNotes[student.id] || null
        };
        
        const notesData = {
          kihonMarks: kihonMarks[student.id] || {},
          kumiteMarks: kumiteMarks[student.id] || {}
        };
        
        scoreData.notes = JSON.stringify(notesData);
        
        const { error: scoreError } = await supabase
          .from('scores')
          .insert(scoreData);
        
        if (scoreError) {
          console.error('Error saving scores:', scoreError);
        }
      }
      
      toast({
        title: "Exame salvo",
        description: "O registro do exame foi salvo com sucesso!"
      });
      
      navigate("/archive");
    } catch (error) {
      console.error('Error saving exam:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o exame. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setActiveTab("students");
    setExamDate(undefined);
    setExamLocation("");
    setKihonScores({});
    setKataScores({});
    setKumiteScores({});
    setKnowledgeScores({});
    setExaminerNotes({});
    setKihonExaminers({});
    setKataExaminers({});
    setKumiteExaminers({});
    setKnowledgeExaminers({});
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

  const addNewStudentsFromResults = () => {
    const examInfo = {
      date: examDate ? format(examDate, 'dd-MM-yyyy') : 'sem-data',
      location: examLocation,
      students: students.map(s => ({
        ...s,
        kihon: kihonScores[s.id] || 0,
        kata: kataScores[s.id] || 0,
        kumite: kumiteScores[s.id] || 0,
        knowledge: knowledgeScores[s.id] || 0,
        notes: examinerNotes[s.id] || "",
        kihonExaminer: kihonExaminers[s.id] || "",
        kataExaminer: kataExaminers[s.id] || "",
        kumiteExaminer: kumiteExaminers[s.id] || "",
        knowledgeExaminer: knowledgeExaminers[s.id] || ""
      }))
    };
    
    const tempKey = `exam-temp-${Date.now()}`;
    localStorage.setItem(tempKey, JSON.stringify(examInfo));
    
    const newId = Math.max(0, ...students.map(s => s.id)) + 1;
    setStudents([{ 
      id: newId, 
      name: "", 
      age: "", 
      club: "", 
      specialCondition: "", 
      belt: "", 
      targetBelt: "",
      danStage: "" 
    }]);
    
    setKihonScores({});
    setKataScores({});
    setKumiteScores({});
    setKnowledgeScores({});
    setExaminerNotes({});
    setKihonExaminers({});
    setKataExaminers({});
    setKumiteExaminers({});
    setKnowledgeExaminers({});
    
    setActiveTab("students");
    
    toast({
      title: "Adicionar novos alunos",
      description: "Cadastre os dados do novo aluno para o exame."
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

  const shouldShowKumite = !students.every(s => s.targetBelt === "Amarela");

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
          <TabsTrigger 
            value="kumite" 
            disabled={
              activeTab === "students" || 
              activeTab === "results" || 
              !shouldShowKumite
            }
          >
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {students.map((student, index) => (
              <motion.div key={student.id} variants={item} className="relative group">
                <StudentCard 
                  student={student}
                  index={index}
                  onChange={handleStudentChange}
                  belts={belts}
                  targetBeltOptions={getTargetBeltOptions(student.belt)}
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
          
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setActiveTab("students")}>
              Voltar
            </Button>
            <Button onClick={() => navigateToNextTab("kihon")}>
              Próxima Etapa
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="kata">
          <div className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Avaliação de Kata</h2>
              <p className="text-muted-foreground">
                Avalie a execução do kata, incluindo ritmo, força, equilíbrio e precisão técnica.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {students.map(student => (
                <KataEvaluation
                  key={student.id}
                  student={student}
                  score={kataScores[student.id] || 10}
                  notes={examinerNotes[student.id] || ""}
                  onScoreChange={handleKataScoreChange}
                  onNotesChange={handleNotesChange}
                  examinerName={kataExaminers[student.id] || ""}
                  onExaminerNameChange={handleKataExaminerChange}
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setActiveTab("kihon")}>
              Voltar
            </Button>
            <Button onClick={() => navigateToNextTab("kata")}>
              Próxima Etapa
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="kumite">
          <div className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Avaliação de Kumitê</h2>
              <p className="text-muted-foreground">
                Avalie a execução do kumitê, incluindo ritmo, força, equilíbrio e precisão técnica.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {students.map(student => (
                <KumiteEvaluation
                  key={student.id}
                  student={student}
                  score={kumiteScores[student.id] || 10}
                  notes={examinerNotes[student.id] || ""}
                  onScoreChange={handleKumiteScoreChange}
                  onNotesChange={handleNotesChange}
                  examinerName={kumiteExaminers[student.id] || ""}
                  onExaminerNameChange={handleKumiteExaminerChange}
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setActiveTab("kihon")}>
              Voltar
            </Button>
            <Button onClick={() => navigateToNextTab("kumite")}>
              Próxima Etapa
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="knowledge">
          <div className="space-y-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Avaliação de Conhecimento</h2>
              <p className="text-muted-foreground">
                Avalie o conhecimento dos alunos em diferentes temas.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {students.map(student => (
                <KnowledgeEvaluation
                  key={student.id}
                  student={student}
                  score={knowledgeScores[student.id] || 10}
                  notes={examinerNotes[student.id] || ""}
                  onScoreChange={handleKnowledgeScoreChange}
                  onNotesChange={handleNotesChange}
                  examinerName={knowledgeExaminers[student.id] || ""}
                  onExaminerNameChange={handleKnowledgeExaminerChange}
                />
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => setActiveTab("kihon")}>
              Voltar
            </Button>
            <Button onClick={() => navigateToNextTab("knowledge")}>
              Próxima Etapa
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="results">
          <ExamResults
            students={students}
            kihonScores={kihonScores}
            kataScores={kataScores}
            kumiteScores={kumiteScores}
            knowledgeScores={knowledgeScores}
            examinerNotes={examinerNotes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
