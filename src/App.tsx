
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NotFound from './components/NotFound';
import KarateExam from './components/KarateBeltExam/KarateExam';
import { Toaster } from "@/components/ui/toaster";
import Dashboard from './pages/Dashboard';
import ExamsArchivePage from './pages/ExamsArchive';
import Header from './components/KarateBeltExam/Header';
import Auth from './pages/Auth';
import { supabase } from './integrations/supabase/client';
import { Loading } from './components/ui/loading';

// Define a protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthenticated(!!session);
      setLoading(false);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <Loading message="Verificando autenticação..." />;
  }

  return authenticated ? <>{children}</> : <Navigate to="/auth" />;
};

function App() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/exame" element={
              <ProtectedRoute>
                <KarateExam />
              </ProtectedRoute>
            } />
            <Route path="/archive" element={
              <ProtectedRoute>
                <ExamsArchivePage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </>
  );
}

export default App;
