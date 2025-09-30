import React from 'react';

interface CadastroFacialIndicatorProps {
  temCadastro: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const CadastroFacialIndicator: React.FC<CadastroFacialIndicatorProps> = ({
  temCadastro,
  size = 'sm',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm'
  };

  return (
    <div className={`text-gray-600 flex items-center gap-1 ${sizeClasses[size]} ${className}`}>
      {temCadastro ? (
        <>
          <span className="text-green-600">✓</span>
          <span>Facial OK</span>
        </>
      ) : (
        <>
          <span className="text-amber-600">⚠</span>
          <span>Facial pendente</span>
        </>
      )}
    </div>
  );
};

export default CadastroFacialIndicator;