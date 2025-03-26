
import React from 'react';
import KarateExam from '@/components/KarateBeltExam/KarateExam';
import Header from '@/components/KarateBeltExam/Header';
import Footer from '@/components/KarateBeltExam/Footer';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-28 pb-12">
        <KarateExam />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
