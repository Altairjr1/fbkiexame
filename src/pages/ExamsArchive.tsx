
import React from 'react';
import { ExamsArchive } from '@/components/KarateBeltExam/ExamsArchive';
import Header from '@/components/KarateBeltExam/Header';
import Footer from '@/components/KarateBeltExam/Footer';

const ExamsArchivePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-24 pb-12">
        <ExamsArchive />
      </main>
      <Footer />
    </div>
  );
};

export default ExamsArchivePage;
