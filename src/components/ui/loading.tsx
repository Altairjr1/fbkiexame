
import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function Loading({ size = 'md', message = 'Carregando...' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin mb-2`}></div>
      {message && <p className="text-muted-foreground">{message}</p>}
    </div>
  );
}
