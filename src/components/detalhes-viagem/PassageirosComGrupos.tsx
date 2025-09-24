import React, { useState } from 'react';
import { PassageirosList } from './PassageirosList';
import { TrocarOnibusModal } from './TrocarOnibusModal';
import type { PassageiroDisplay, Onibus } from '@/hooks/useViagemDetails';

interface PassageirosComGruposProps {
  passageiros: PassageiroDisplay[];
  viagemId: string;
  onibusList: Onibus[];
  passageirosCount: Record<string, number>;
  onEditPassageiro: (passageiro: PassageiroDisplay) => void;
  onDeletePassageiro: (passageiro: PassageiroDisplay) => void;
  onUpdatePassageiros: () => void;
}

export function PassageirosComGrupos({
  passageiros,
  viagemId,
  onibusList,
  passageirosCount,
  onEditPassageiro,
  onDeletePassageiro,
  onUpdatePassageiros
}: PassageirosComGruposProps) {
  const [passageiroParaTroca, setPassageiroParaTroca] = useState<PassageiroDisplay | null>(null);
  const [modalTrocaAberto, setModalTrocaAberto] = useState(false);

  const handleTrocarOnibus = (passageiro: PassageiroDisplay) => {
    setPassageiroParaTroca(passageiro);
    setModalTrocaAberto(true);
  };

  const handleConfirmarTroca = () => {
    setModalTrocaAberto(false);
    setPassageiroParaTroca(null);
    onUpdatePassageiros();
  };

  const handleFecharModal = () => {
    setModalTrocaAberto(false);
    setPassageiroParaTroca(null);
  };

  return (
    <>
      <PassageirosList
        passageiros={passageiros}
        viagemId={viagemId}
        onEdit={onEditPassageiro}
        onDelete={onDeletePassageiro}
        onTrocarOnibus={handleTrocarOnibus}
      />

      {passageiroParaTroca && (
        <TrocarOnibusModal
          isOpen={modalTrocaAberto}
          onClose={handleFecharModal}
          passageiro={passageiroParaTroca}
          onibusList={onibusList}
          passageirosCount={passageirosCount}
          onConfirm={handleConfirmarTroca}
        />
      )}
    </>
  );
}