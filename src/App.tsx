
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NotFound from './components/NotFound';
import KarateExam from './components/KarateBeltExam/KarateExam';
import { Toaster } from "@/components/ui/toaster";
import Dashboard from './pages/Dashboard';
import ExamsArchivePage from './pages/ExamsArchive';

function App() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/exame" element={<KarateExam />} />
            <Route path="/archive" element={<ExamsArchivePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </>
  );
}

export default App;
