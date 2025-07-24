import React from 'react';
import { useEmpresa } from '@/hooks/useEmpresa';

interface LogoEmpresaProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'sidebar';
  showName?: boolean;
  theme?: 'light' | 'dark';
}

export default function LogoEmpresa({ 
  className = '', 
  size = 'md', 
  showName = false,
  theme = 'light'
}: LogoEmpresaProps) {
  const { empresa, loading } = useEmpresa();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
    '2xl': 'h-48 w-48',
    '3xl': 'h-72 w-72',
    sidebar: 'h-24 w-24' // 2x o tamanho md (12 -> 24)
  };

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 animate-pulse rounded ${className}`} />
    );
  }

  if (!empresa) {
    return null;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {empresa.logo_url ? (
        <img
          src={empresa.logo_url}
          alt={`Logo ${empresa.nome_fantasia || empresa.nome}`}
          className={`${sizeClasses[size]} object-contain`}
        />
      ) : (
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
          {(empresa.nome_fantasia || empresa.nome).charAt(0).toUpperCase()}
        </div>
      )}
      
      {showName && (
        <div className="flex flex-col">
          <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {empresa.nome_fantasia || empresa.nome}
          </span>
          {empresa.nome_fantasia && empresa.nome !== empresa.nome_fantasia && (
            <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {empresa.nome}
            </span>
          )}
        </div>
      )}
    </div>
  );
}