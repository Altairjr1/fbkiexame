
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentCard, Student } from "./StudentCard";
import BeltDisplay from "./BeltDisplay";
import { PlusCircle, MinusCircle, ArrowRight, User, Medal, CalendarIcon, MapPinIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function KarateExam() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("students");
  const belts = ["Amarela", "Vermelha", "Laranja", "Verde", "Estágio", "Roxa", "Marrom", "Preta", "Dans"];
  const [examDate, setExamDate] = useState<Date | undefined>(undefined);
  const [examLocation, setExamLocation] = useState("");

  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "", age: "", club: "", specialCondition: "", belt: "", danStage: "" },
    { id: 2, name: "", age: "", club: "", specialCondition: "", belt: "", danStage: "" },
    { id: 3, name: "", age: "", club: "", specialCondition: "", belt: "", danStage: "" },
    { id: 4, name: "", age: "", club: "", specialCondition: "", belt: "", danStage: "" }
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
      student => !student.name || !student.age || !student.club || !student.belt
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
    
    setActiveTab("review");
    toast({
      title: "Prosseguindo para revisão",
      description: "Verifique os dados dos alunos antes de confirmar.",
    });
  };

  const handleSubmit = () => {
    toast({
      title: "Exame agendado",
      description: "O exame de faixa foi registrado com sucesso!",
    });
    
    // Here you would typically send data to a server
    console.log("Submitted exam data:", students);
    
    // Reset form or redirect
    setTimeout(() => {
      setActiveTab("confirmation");
    }, 500);
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
          Federação Brasileira de Karatê Interestilos
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight">Exame de Faixa FBKI</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Preencha os dados dos alunos participantes do exame de faixa para registro na federação.
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
          <TabsTrigger value="students" disabled={activeTab === "confirmation"}>
            <User className="mr-2 h-4 w-4" />
            Alunos
          </TabsTrigger>
          <TabsTrigger value="review" disabled={activeTab === "students" || activeTab === "confirmation"}>
            <Medal className="mr-2 h-4 w-4" />
            Revisão
          </TabsTrigger>
          <TabsTrigger value="confirmation" disabled={activeTab !== "confirmation"}>
            <div className="flex items-center">
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Confirmação
            </div>
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

        <TabsContent value="review">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-secondary/50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Revisão dos dados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Data do Exame:</p>
                  <p className="font-semibold">{examDate ? format(examDate, "dd/MM/yyyy") : "Não informada"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Local do Exame:</p>
                  <p className="font-semibold">{examLocation || "Não informado"}</p>
                </div>
              </div>
              <p className="text-muted-foreground">
                Verifique os dados dos alunos antes de confirmar o registro do exame de faixa.
                Certifique-se de que todas as informações estão corretas.
              </p>
            </div>

            <div className="space-y-4">
              {students.map((student) => (
                <motion.div 
                  key={student.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card rounded-lg p-4 shadow-sm border flex flex-col sm:flex-row gap-4 sm:items-center"
                >
                  <div className="w-full max-w-[240px]">
                    <BeltDisplay 
                      belt={student.belt} 
                      danStage={student.danStage} 
                      className="w-full mb-2"
                    />
                    <p className="text-center text-sm font-medium">
                      {student.belt}
                      {(student.belt === "Preta" || student.belt === "Dans") && student.danStage && 
                        ` ${student.danStage}º Dan`}
                      {student.belt === "Estágio" && student.danStage && 
                        ` ${student.danStage}º Estágio`}
                    </p>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{student.name}</h3>
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
                </motion.div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-8">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("students")} 
                className="border-dashed"
              >
                Voltar para edição
              </Button>
              <Button onClick={handleSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Confirmar Exame
              </Button>
            </div>
          </motion.div>
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
                setStudents([
                  { id: 1, name: "", age: "", club: "", specialCondition: "", belt: "", danStage: "" },
                  { id: 2, name: "", age: "", club: "", specialCondition: "", belt: "", danStage: "" },
                  { id: 3, name: "", age: "", club: "", specialCondition: "", belt: "", danStage: "" },
                  { id: 4, name: "", age: "", club: "", specialCondition: "", belt: "", danStage: "" }
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
