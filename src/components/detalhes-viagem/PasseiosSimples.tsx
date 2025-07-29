// Componente simples para mostrar passeios na lista
import React from 'react';

interface PasseioSimples {
  nome: string;
  valor?: number;
  gratuito?: boolean;
}

interface PasseiosSimples {
  passeios?: PasseioSimples[];
}

export function PasseiosSimples({ passeios = [] }: PasseiosSimples) {
  // Debug temporário para investigar
  console.log('🔍 PasseiosSimples recebeu:', {
    passeios,
    length: passeios?.length || 0,
    primeiroPasseio: passeios?.[0]
  });

  if (!passeios || passeios.length === 0) {
    return <span className="text-gray-400 text-xs">-</span>;
  }

  // Filtrar passeios válidos (com nome)
  const passeiosValidos = passeios.filter(p => p.nome && p.nome.trim() !== '');
  
  if (passeiosValidos.length === 0) {
    console.log('⚠️ Nenhum passeio válido encontrado:', passeios);
    return <span className="text-gray-400 text-xs">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {passeiosValidos.map((passeio, idx) => (
        <span 
          key={idx} 
          className={`text-xs px-1 py-0.5 rounded ${
            passeio.gratuito || (passeio.valor || 0) === 0 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-green-100 text-green-700'
          }`}
        >
          {passeio.nome}
        </span>
      ))}
    </div>
  );
}