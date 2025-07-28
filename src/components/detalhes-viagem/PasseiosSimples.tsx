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
    return <span className="text-muted-foreground text-xs">Nenhum</span>;
  }

  // Filtrar passeios válidos (com nome)
  const passeiosValidos = passeios.filter(p => p.nome && p.nome.trim() !== '');
  
  if (passeiosValidos.length === 0) {
    console.log('⚠️ Nenhum passeio válido encontrado:', passeios);
    return <span className="text-muted-foreground text-xs">Nenhum</span>;
  }

  // Mostrar apenas os nomes dos passeios, separados por vírgula
  const nomesPasseios = passeiosValidos.map(p => p.nome).join(', ');
  
  // Se for muito longo, truncar
  const nomesTruncados = nomesPasseios.length > 30 
    ? nomesPasseios.substring(0, 30) + '...' 
    : nomesPasseios;

  return (
    <div className="text-xs text-gray-700" title={nomesPasseios}>
      {nomesTruncados}
      {passeiosValidos.some(p => p.gratuito) && (
        <span className="ml-1">🎁</span>
      )}
    </div>
  );
}