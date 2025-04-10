
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/KarateBeltExam/Header';
import Footer from '@/components/KarateBeltExam/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, Award, Calendar, BarChart, ArrowRight, Plus, Clock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExams: 0,
    totalStudents: 0,
    lastExamDate: '',
    examsThisYear: 0,
    passRate: 0,
    recentExams: [] as any[]
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get total exams
        const { count: totalExams, error: examsError } = await supabase
          .from('exams')
          .select('*', { count: 'exact', head: true });
        
        if (examsError) throw examsError;
        
        // Get total students
        const { count: totalStudents, error: studentsError } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });
        
        if (studentsError) throw studentsError;
        
        // Get most recent exams
        const { data: recentExams, error: recentError } = await supabase
          .from('exams')
          .select('*')
          .order('date', { ascending: false })
          .limit(5);
        
        if (recentError) throw recentError;
        
        // Get exams this year
        const currentYear = new Date().getFullYear();
        const startOfYear = `${currentYear}-01-01`;
        const { count: examsThisYear, error: yearError } = await supabase
          .from('exams')
          .select('*', { count: 'exact', head: true })
          .gte('date', startOfYear);
        
        if (yearError) throw yearError;
        
        // Calculate pass rate
        const { data: scores, error: scoresError } = await supabase
          .from('scores')
          .select('kihon, kata, kumite, knowledge');
        
        if (scoresError) throw scoresError;
        
        let passCount = 0;
        if (scores && scores.length > 0) {
          passCount = scores.filter(score => {
            const values = [score.kihon, score.kata, score.kumite, score.knowledge]
              .filter(val => val !== null && val !== undefined);
            
            if (values.length === 0) return false;
            
            const average = values.reduce((sum, val) => sum + val, 0) / values.length;
            return average >= 6;
          }).length;
        }
        
        const passRate = scores && scores.length > 0 
          ? Math.round((passCount / scores.length) * 100) 
          : 0;
        
        setStats({
          totalExams: totalExams || 0,
          totalStudents: totalStudents || 0,
          lastExamDate: recentExams?.length > 0 ? recentExams[0].date : '',
          examsThisYear: examsThisYear || 0,
          passRate: passRate,
          recentExams: recentExams || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Erro ao carregar dados",
          description: handleSupabaseError(error),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [toast]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Sem data";
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-28 pb-12">
        <div className="container mx-auto px-4">
          <motion.div 
            className="mb-6"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl font-bold mb-2">Bem-vindo ao FBKI Exames</h1>
              <p className="text-muted-foreground max-w-3xl">
                Gerencie exames de faixa, avalie alunos e acesse o histórico de todos os exames realizados pela federação.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" /> 
                      Total de Exames
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {loading ? (
                        <div className="h-8 w-20 bg-muted animate-pulse rounded-md"></div>
                      ) : (
                        stats.totalExams
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.examsThisYear} exames este ano
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" /> 
                      Total de Alunos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {loading ? (
                        <div className="h-8 w-20 bg-muted animate-pulse rounded-md"></div>
                      ) : (
                        stats.totalStudents
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Avaliados em todos os exames
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" /> 
                      Taxa de Aprovação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {loading ? (
                        <div className="h-8 w-20 bg-muted animate-pulse rounded-md"></div>
                      ) : (
                        `${stats.passRate}%`
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Média de todos os exames
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" /> 
                      Último Exame
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {loading ? (
                        <div className="h-8 w-20 bg-muted animate-pulse rounded-md"></div>
                      ) : (
                        stats.lastExamDate ? formatDate(stats.lastExamDate) : 'N/A'
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Data do exame mais recente
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8"
              variants={containerVariants}
            >
              <motion.div 
                className="lg:col-span-2"
                variants={itemVariants}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Exames Recentes
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => navigate('/archive')}
                      >
                        Ver todos
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Os últimos exames realizados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div 
                          key={i}
                          className="mb-4 p-3 border rounded-md flex justify-between animate-pulse"
                        >
                          <div className="w-1/3 h-5 bg-muted rounded"></div>
                          <div className="w-1/4 h-5 bg-muted rounded"></div>
                        </div>
                      ))
                    ) : stats.recentExams.length > 0 ? (
                      <div className="space-y-4">
                        {stats.recentExams.map((exam) => (
                          <div 
                            key={exam.id}
                            className="p-3 border rounded-md flex justify-between items-center hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{formatDate(exam.date)}</div>
                                <div className="text-xs text-muted-foreground">{exam.location}</div>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate('/archive')}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum exame encontrado
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-primary" />
                      Ações Rápidas
                    </CardTitle>
                    <CardDescription>
                      Acesse as principais funcionalidades
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      className="w-full justify-start" 
                      size="lg"
                      onClick={() => navigate('/')}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Novo Exame
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start" 
                      size="lg"
                      onClick={() => navigate('/archive')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Arquivo de Exames
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
