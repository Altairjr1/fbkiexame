
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container flex flex-col items-center justify-center py-16">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-6">Página não encontrada</p>
      <p className="text-center text-muted-foreground max-w-md mb-8">
        A página que você está procurando não existe ou foi movida.
      </p>
      <Link 
        to="/" 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        Voltar para Início
      </Link>
    </div>
  );
};

export default NotFound;
