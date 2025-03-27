import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/KarateBeltExam/Header';
import Footer from './components/Footer';
import NotFound from './components/NotFound';
import KarateExam from './components/KarateBeltExam/KarateExam';
import { Toaster } from "@/components/ui/toaster"
import { ExamsArchive } from './components/KarateBeltExam/ExamsArchive';

function App() {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 pt-16">
          <Routes>
            <Route path="/" element={<KarateExam />} />
            <Route path="/archive" element={<ExamsArchive />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster />
    </>
  );
}

export default App;
