import React from 'react';
import { UserCheck, Users, Loader2 } from 'lucide-react';

interface ConfirmacaoPresencaProps {
  statusAtual: 'pendente' | 'presente' | 'ausente';
  onTogglePresenca: () => void;
  isAtualizando: boolean;
  viagemEmAndamento: boolean;
}

export const ConfirmacaoPresenca: React.FC<ConfirmacaoPresencaProps> = ({
  statusAtual,
  onTogglePresenca,
  isAtualizando,
  viagemEmAndamento
}) => {
  if (!viagemEmAndamento) {
    // Só mostrar status quando viagem não está em andamento
    return (
      <div className="flex justify-center">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          statusAtual === 'presente' 
            ? 'bg-green-100 text-green-700' 
            : statusAtual === 'ausente'
            ? 'bg-red-100 text-red-700'
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {statusAtual === 'presente' ? '✅ Presente' : 
           statusAtual === 'ausente' ? '❌ Ausente' : 
           '⏳ Pendente'}
        </div>
      </div>
    );
  }

  // Clique direto no card igual à lista original - alterna entre presente/pendente
  return (
    <div 
      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 text-center ${
        statusAtual === 'presente'
          ? "bg-green-50 border-green-200 hover:bg-green-100"
          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
      } ${
        isAtualizando ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={!isAtualizando ? onTogglePresenca : undefined}
    >
      <div className="flex items-center justify-center gap-2">
        {isAtualizando ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">Atualizando...</span>
          </>
        ) : statusAtual === 'presente' ? (
          <>
            <UserCheck className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Presente</span>
          </>
        ) : (
          <>
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Pendente</span>
          </>
        )}
      </div>
    </div>
  );
};