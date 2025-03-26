
import React from 'react';
import Header from '@/components/KarateBeltExam/Header';
import Footer from '@/components/KarateBeltExam/Footer';
import { ExamsArchive as ExamsArchiveComponent } from '@/components/KarateBeltExam/ExamsArchive';

const ExamsArchivePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow pt-28 pb-12">
        <ExamsArchiveComponent />
      </main>
      <Footer />
    </div>
  );
};

export default ExamsArchivePage;
