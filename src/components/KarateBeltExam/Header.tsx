
import React from 'react';
import { motion } from 'framer-motion';

const Header = () => {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <motion.div 
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.7, type: "spring" }}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-3"
            >
              <span className="text-white font-bold">KB</span>
            </motion.div>
            <div>
              <h1 className="text-lg font-semibold">Karate Belt Examiner</h1>
              <p className="text-xs text-muted-foreground">Sistema de Gestão de Exames</p>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Início</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Exames</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Alunos</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Relatórios</a>
          </nav>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
