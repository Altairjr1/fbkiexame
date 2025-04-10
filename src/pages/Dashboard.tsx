import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/KarateBeltExam/Header';
import Footer from '@/components/KarateBeltExam/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Users, Award, Calendar, BarChart, ArrowRight, Plus, Clock, Search } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Define user profile types
interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'affiliate' | 'evaluator';
  dojo: string | null;
}

// Define stat types to avoid deep instantiation issues
interface DashboardStats {
  totalExams: number;
  totalStudents: number;
  lastExamDate: string;
  examsThisYear: number;
  passRate: number;
  recentExams: any[];
  examsPerMonth: {name: string, exams: number}[];
  beltDistribution: {name: string, value: number, color: string}[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalExams: 0,
    totalStudents: 0,
    lastExamDate: '',
    examsThisYear: 0,
    passRate: 0,
    recentExams: [],
    examsPerMonth: [],
    beltDistribution: []
  });

  // Check for authenticated user
  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        toast({
          title: "Erro de autenticação",
          description: "Por favor, faça login para acessar o painel.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }
      
      if (!session) {
        navigate('/auth');
        return;
      }
      
      // Get user profile from the profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileError) {
        console.error('Error getting profile:', profileError);
        
        // If profile doesn't exist, create one with defaults
        if (profileError.code === 'PGRST116') {
          const userData = session.user;
          const defaultProfile: UserProfile = {
            id: userData.id,
            email: userData.email || '',
            full_name: userData.user_metadata?.full_name || null,
            role: 'affiliate',
            dojo: userData.user_metadata?.dojo || null
          };
          
          // Create the profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(defaultProfile);
            
          if (insertError) {
            console.error('Error creating profile:', insertError);
            toast({
              title: "Erro ao criar perfil",
              description: handleSupabaseError(insertError),
              variant: "destructive"
            });
            return;
          }
          
          setProfile(defaultProfile);
          fetchDashboardData(defaultProfile);
          return;
        }
        
        toast({
          title: "Erro ao carregar perfil",
          description: handleSupabaseError(profileError),
          variant: "destructive"
        });
        return;
      }
      
      setProfile(profileData as UserProfile);
      fetchDashboardData(profileData as UserProfile);
    };
    
    getSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const fetchDashboardData = async (userProfile: UserProfile) => {
    try {
      setLoading(true);
      
      // Fetch total exam count with filter by dojo if affiliate
      let examQuery = supabase.from('exams').select('*', { count: 'exact' });
      let studentsQuery = supabase.from('students').select('*', { count: 'exact' });
      let recentExamsQuery = supabase.from('exams').select('*').order('date', { ascending: false }).limit(5);
      
      // Filter based on user role
      if (userProfile.role === 'affiliate' && userProfile.dojo) {
        examQuery = examQuery.eq('dojo', userProfile.dojo);
        studentsQuery = studentsQuery.eq('club', userProfile.dojo);
        recentExamsQuery = recentExamsQuery.eq('dojo', userProfile.dojo);
      }
      
      // Get total exams
      const { count: totalExams, error: examsError } = await examQuery;
      
      if (examsError) throw examsError;
      
      // Get total students
      const { count: totalStudents, error: studentsError } = await studentsQuery;
      
      if (studentsError) throw studentsError;
      
      // Get most recent exams
      const { data: recentExams, error: recentError } = await recentExamsQuery;
      
      if (recentError) throw recentError;
      
      // Get exams this year
      const currentYear = new Date().getFullYear();
      const startOfYear = `${currentYear}-01-01`;
      
      let yearExamQuery = supabase
        .from('exams')
        .select('*', { count: 'exact' })
        .gte('date', startOfYear);
        
      if (userProfile.role === 'affiliate' && userProfile.dojo) {
        yearExamQuery = yearExamQuery.eq('dojo', userProfile.dojo);
      }
      
      const { count: examsThisYear, error: yearError } = await yearExamQuery;
      
      if (yearError) throw yearError;
      
      // Calculate pass rate
      let scoresQuery = supabase
        .from('scores')
        .select('kihon, kata, kumite, knowledge');
        
      if (userProfile.role === 'affiliate' && userProfile.dojo) {
        const { data: dojoStudents, error: dojoStudentsError } = await supabase
          .from('students')
          .select('id')
          .eq('club', userProfile.dojo);
          
        if (dojoStudentsError) throw dojoStudentsError;
        
        if (dojoStudents && dojoStudents.length > 0) {
          scoresQuery = scoresQuery.in('student_id', dojoStudents.map(s => s.id));
        }
      }
      
      const { data: scores, error: scoresError } = await scoresQuery;
      
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
      
      // Get exams per month for chart
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const monthsData = Array(12).fill(0);
      
      let monthExamQuery = supabase
        .from('exams')
        .select('*')
        .gte('date', `${currentYear}-01-01`);
        
      if (userProfile.role === 'affiliate' && userProfile.dojo) {
        monthExamQuery = monthExamQuery.eq('dojo', userProfile.dojo);
      }
      
      const { data: yearExams, error: yearExamsError } = await monthExamQuery;
      
      if (yearExamsError) throw yearExamsError;
      
      if (yearExams) {
        yearExams.forEach(exam => {
          const date = new Date(exam.date);
          const month = date.getMonth();
          monthsData[month]++;
        });
      }
      
      const examsPerMonth = monthNames.map((name, index) => ({
        name,
        exams: monthsData[index]
      }));
      
      // Get belt distribution
      let beltQuery = supabase
        .from('students')
        .select('target_belt');
        
      if (userProfile.role === 'affiliate' && userProfile.dojo) {
        beltQuery = beltQuery.eq('club', userProfile.dojo);
      }
      
      const { data: belts, error: beltsError } = await beltQuery;
      
      if (beltsError) throw beltsError;
      
      const beltCounts: {[key: string]: number} = {};
      
      if (belts) {
        belts.forEach(student => {
          const belt = student.target_belt;
          beltCounts[belt] = (beltCounts[belt] || 0) + 1;
        });
      }
      
      const beltColors: {[key: string]: string} = {
        'Branca': '#FFFFFF',
        'Amarela': '#FFFF00',
        'Vermelha': '#FF0000',
        'Laranja': '#FFA500',
        'Verde': '#008000',
        'Roxa': '#800080',
        'Marrom': '#8B4513',
        'Preta': '#000000',
        'Dans': '#000055'
      };
      
      const beltDistribution = Object.entries(beltCounts).map(([belt, count]) => ({
        name: belt,
        value: count,
        color: beltColors[belt] || '#CCCCCC'
      }));
      
      setStats({
        totalExams: totalExams || 0,
        totalStudents: totalStudents || 0,
        lastExamDate: recentExams?.length > 0 ? recentExams[0].date : '',
        examsThisYear: examsThisYear || 0,
        passRate: passRate,
        recentExams: recentExams || [],
        examsPerMonth,
        beltDistribution
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Sem data";
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Erro ao sair",
        description: "Não foi possível encerrar a sessão.",
        variant: "destructive"
      });
    }
  };

  const handleCreateExam = () => {
    navigate('/exame');
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

  if (loading) {
    return <Loading size="lg" message="Carregando dashboard..." />;
  }

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
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {profile?.role === 'admin' ? 'Painel Administrativo' : 
                   profile?.role === 'affiliate' ? `Painel do Dojo: ${profile.dojo}` :
                   'Painel de Avaliação'}
                </h1>
                <p className="text-muted-foreground max-w-3xl">
                  {profile?.role === 'admin' ? 'Gerencie exames de faixa, avalie alunos e acesse o histórico de todos os exames realizados pela federação.' : 
                   profile?.role === 'affiliate' ? 'Gerencie os exames de faixa e alunos do seu dojo.' :
                   'Acesse os exames disponíveis para avaliação.'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSignOut}>Sair</Button>
                {profile?.role !== 'evaluator' && (
                  <Button onClick={handleCreateExam}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Exame
                  </Button>
                )}
              </div>
            </motion.div>
            
            {profile?.role !== 'evaluator' && (
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
                        {stats.totalExams}
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
                        {stats.totalStudents}
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
                        {`${stats.passRate}%`}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Média de todos os exames
                      </p>
                      <div className="mt-2">
                        <Progress value={stats.passRate} className="h-2" />
                      </div>
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
                        {stats.lastExamDate ? formatDate(stats.lastExamDate) : 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Data do exame mais recente
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}
            
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8"
              variants={containerVariants}
            >
              <motion.div 
                className={profile?.role !== 'evaluator' ? "lg:col-span-2" : "lg:col-span-3"}
                variants={itemVariants}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        {profile?.role === 'evaluator' ? 'Exames Disponíveis' : 'Exames Recentes'}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs hidden sm:flex"
                          onClick={() => navigate('/archive')}
                        >
                          Ver todos
                        </Button>
                        <div className="relative">
                          <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                          <Input 
                            placeholder="Buscar exames..." 
                            className="pl-8 h-9 w-[150px] sm:w-[200px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <CardDescription>
                      {profile?.role === 'evaluator' 
                        ? 'Exames disponíveis para avaliação' 
                        : 'Os últimos exames realizados'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats.recentExams.length > 0 ? (
                      <div className="space-y-4">
                        {stats.recentExams
                          .filter(exam => 
                            exam.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            formatDate(exam.date).toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((exam) => (
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
                              {profile?.role === 'evaluator' && exam.access_code && (
                                <Badge className="ml-2">Código: {exam.access_code}</Badge>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/exame?id=${exam.id}`)}
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        {profile?.role === 'evaluator' 
                          ? 'Nenhum exame disponível para avaliação' 
                          : 'Nenhum exame encontrado'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
              
              {profile?.role !== 'evaluator' && (
                <motion.div variants={itemVariants}>
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5 text-primary" />
                        Distribuição de Faixas
                      </CardTitle>
                      <CardDescription>
                        Visualização por nível de faixa
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {stats.beltDistribution.length > 0 ? (
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={stats.beltDistribution}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {stats.beltDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => [`${value} alunos`, 'Quantidade']} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          Nenhum dado disponível
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
