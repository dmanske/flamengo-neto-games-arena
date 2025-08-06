import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { PassageiroDisplay } from '@/hooks/useViagemDetails';

interface ControlePasseiosProps {
  passageiros: PassageiroDisplay[];
  temPasseios: boolean;
  shouldUseNewSystem: boolean;
}

export const ControlePasseios: React.FC<ControlePasseiosProps> = ({
  passageiros,
  temPasseios,
  shouldUseNewSystem
}) => {
  if (!temPasseios || !shouldUseNewSystem) {
    return null;
  }

  // Calcular resumo dos passeios contratados
  const passeiosContratados: Record<string, {
    quantidade: number;
    valorUnitario: number;
    total: number;
  }> = {};
  
  let totalReceitaPasseios = 0;
  
  passageiros.forEach(passageiro => {
    if (passageiro.passeios && passageiro.passeios.length > 0) {
      passageiro.passeios.forEach(passeio => {
        const nome = passeio.passeio_nome || passeio.passeio?.nome;
        const valor = passeio.valor_cobrado || 0;
        
        if (!passeiosContratados[nome]) {
          passeiosContratados[nome] = {
            quantidade: 0,
            valorUnitario: valor,
            total: 0
          };
        }
        
        passeiosContratados[nome].quantidade += 1;
        passeiosContratados[nome].total += valor;
        totalReceitaPasseios += valor;
      });
    }
  });

  const totalIngressos = Object.values(passeiosContratados).reduce(
    (sum, dados) => sum + dados.quantidade, 
    0
  );

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        🎯 Controle de Passeios Contratados
      </h3>
      
      <div className="space-y-4">
        {Object.keys(passeiosContratados).length > 0 ? (
          <>
            <div className="grid gap-3">
              {Object.entries(passeiosContratados).map(([nome, dados]) => (
                <div key={nome} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">{dados.quantidade}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{nome}</p>
                      <p className="text-sm text-gray-500">
                        {dados.quantidade} ingresso{dados.quantidade > 1 ? 's' : ''} × {formatCurrency(dados.valorUnitario)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(dados.total)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">Total de Ingressos:</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                    {totalIngressos}
                  </span>
                </div>
                <div className="font-semibold text-lg text-green-600">
                  {formatCurrency(totalReceitaPasseios)}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum passeio contratado ainda</p>
          </div>
        )}
      </div>
    </div>
  );
};