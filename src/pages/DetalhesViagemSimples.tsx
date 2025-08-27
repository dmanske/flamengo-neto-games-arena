import React from "react";
import { useParams } from "react-router-dom";
import { useViagemDetails } from "@/hooks/useViagemDetails";

const DetalhesViagemSimples = () => {
  const { id } = useParams<{ id: string }>();

  console.log("🔍 DetalhesViagemSimples - ID recebido:", id);

  if (!id) {
    return <div>ID da viagem não encontrado</div>;
  }

  try {
    const { viagem, isLoading, passageiros, fetchPassageiros } = useViagemDetails(id);

    // Expor função para recarregar passageiros globalmente
    React.useEffect(() => {
      if (fetchPassageiros) {
        (window as any).reloadViagemPassageiros = () => {
          console.log('🔄 [DetalhesViagemSimples] Função global chamada - recarregando passageiros da viagem:', id);
          console.log('🔄 [DetalhesViagemSimples] fetchPassageiros disponível:', !!fetchPassageiros);
          fetchPassageiros(id);
          console.log('✅ [DetalhesViagemSimples] fetchPassageiros executado para viagem:', id);
        };
        console.log('✅ [DetalhesViagemSimples] Função global reloadViagemPassageiros registrada para viagem:', id);
        console.log('✅ [DetalhesViagemSimples] Função registrada no window:', !!(window as any).reloadViagemPassageiros);
      }
      return () => {
        console.log('🧹 [DetalhesViagemSimples] Removendo função global reloadViagemPassageiros');
        delete (window as any).reloadViagemPassageiros;
      };
    }, [fetchPassageiros, id]);

    console.log("🔍 Hook useViagemDetails - Dados:", { viagem, isLoading, passageiros: passageiros?.length });

    if (isLoading) {
      return <div>Carregando...</div>;
    }

    if (!viagem) {
      return <div>Viagem não encontrada</div>;
    }

    return (
      <div className="p-4">
        <h1>Detalhes da Viagem - {viagem.adversario}</h1>
        <p>Data: {viagem.data_jogo}</p>
        <p>Passageiros: {passageiros?.length || 0}</p>
        <p>Status: {viagem.status_viagem}</p>
      </div>
    );
  } catch (error) {
    console.error("🚨 Erro no componente DetalhesViagemSimples:", error);
    return (
      <div className="p-4">
        <h1>Erro ao carregar viagem</h1>
        <p>Erro: {error instanceof Error ? error.message : 'Erro desconhecido'}</p>
      </div>
    );
  }
};

export default DetalhesViagemSimples;