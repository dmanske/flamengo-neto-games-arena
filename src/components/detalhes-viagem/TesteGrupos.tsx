import React from 'react';
import { PassageirosComGrupos } from './PassageirosComGrupos';
import type { PassageiroDisplay, Onibus } from '@/hooks/useViagemDetails';

interface TesteGruposProps {
  passageiros: PassageiroDisplay[];
  viagemId: string;
  onibusList: Onibus[];
  passageirosCount: Record<string, number>;
  onEditPassageiro: (passageiro: PassageiroDisplay) => void;
  onDeletePassageiro: (passageiro: PassageiroDisplay) => void;
  onUpdatePassageiros: () => void;
}

export function TesteGrupos({
  passageiros,
  viagemId,
  onibusList,
  passageirosCount,
  onEditPassageiro,
  onDeletePassageiro,
  onUpdatePassageiros
}: TesteGruposProps) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">🧪 Teste do Sistema de Grupos</h3>
        <p className="text-sm text-blue-700 mb-2">
          Este componente testa as funcionalidades de grupos e troca de passageiros.
        </p>
        <div className="text-xs text-blue-600 space-y-1">
          <p>✅ Passageiros carregados: {passageiros.length}</p>
          <p>✅ Ônibus disponíveis: {onibusList.length}</p>
          <p>✅ Viagem ID: {viagemId}</p>
        </div>
      </div>

      <PassageirosComGrupos
        passageiros={passageiros}
        viagemId={viagemId}
        onibusList={onibusList}
        passageirosCount={passageirosCount}
        onEditPassageiro={onEditPassageiro}
        onDeletePassageiro={onDeletePassageiro}
        onUpdatePassageiros={onUpdatePassageiros}
      />
    </div>
  );
}