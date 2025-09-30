import React from 'react';

interface StatusCadastroFacialProps {
  clienteId: string;
  cadastroFacialData: { [key: string]: boolean };
  loading?: boolean;
  onClick?: (clienteId: string, novoStatus: boolean) => void; // 🆕 NOVO: Função de clique
}

export const StatusCadastroFacial: React.FC<StatusCadastroFacialProps> = ({
  clienteId,
  cadastroFacialData,
  loading = false,
  onClick
}) => {
  if (loading) {
    return (
      <div className="text-xs text-gray-500">
        <span>...</span>
      </div>
    );
  }

  const temCadastro = cadastroFacialData[clienteId] ?? false;

  const handleClick = () => {
    if (onClick) {
      onClick(clienteId, !temCadastro);
    }
  };

  const className = onClick 
    ? "text-xs text-gray-600 flex items-center gap-1 cursor-pointer hover:bg-gray-100 rounded px-1 py-0.5 transition-colors"
    : "text-xs text-gray-600 flex items-center gap-1";

  return (
    <div 
      className={className}
      onClick={handleClick}
      title={onClick ? "Clique para alterar status do cadastramento facial" : undefined}
    >
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