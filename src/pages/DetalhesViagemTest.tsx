import React from "react";
import { useParams } from "react-router-dom";

const DetalhesViagemTest = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="p-4">
      <h1>Teste - Detalhes da Viagem</h1>
      <p>ID da viagem: {id}</p>
      <p>Se você está vendo esta mensagem, o roteamento está funcionando.</p>
    </div>
  );
};

export default DetalhesViagemTest;