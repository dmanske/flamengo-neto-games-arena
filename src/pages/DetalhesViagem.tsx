
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { PassageiroDialog } from "@/components/detalhes-viagem/PassageiroDialog";
import { PassageiroEditDialog } from "@/components/detalhes-viagem/PassageiroEditDialog";
import PassageiroDeleteDialog from "@/components/detalhes-viagem/PassageiroDeleteDialog";
import { FinancialSummary } from "@/components/detalhes-viagem/FinancialSummary";
import { PendingPaymentsCard } from "@/components/detalhes-viagem/PendingPaymentsCard";
import { OnibusCards } from "@/components/detalhes-viagem/OnibusCards";
import { ViagemHeader } from "@/components/detalhes-viagem/ViagemHeader";
import { ViagemInfo } from "@/components/detalhes-viagem/ViagemInfo";
import { PassageirosCard } from "@/components/detalhes-viagem/PassageirosCard";
import { useViagemDetails } from "@/hooks/useViagemDetails";

const statusColors = {
  "Aberta": "bg-green-100 text-green-800",
  "Em Andamento": "bg-blue-100 text-blue-800",
  "Finalizada": "bg-gray-100 text-gray-800",
};

const DetalhesViagem = () => {
  const { id } = useParams<{ id: string }>();
  const [addPassageiroOpen, setAddPassageiroOpen] = useState(false);
  const [editPassageiroOpen, setEditPassageiroOpen] = useState(false);
  const [deletePassageiroOpen, setDeletePassageiroOpen] = useState(false);
  const [selectedPassageiro, setSelectedPassageiro] = useState<any>(null);
  
  const {
    viagem,
    passageiros,
    isLoading,
    totalArrecadado,
    totalPago,
    totalPendente,
    valorPotencialTotal,
    onibusList,
    selectedOnibusId,
    contadorPassageiros,
    countPendentePayment,
    searchTerm,
    setSearchTerm,
    handleSelectOnibus,
    handleDelete,
    getPassageirosDoOnibusAtual,
    getOnibusAtual,
    fetchPassageiros,
    togglePendingPayments,
    filterStatus
  } = useViagemDetails(id);

  // Efeito que verifica se não há passageiros não alocados e seleciona um ônibus
  useEffect(() => {
    const totalNaoAlocados = passageiros.filter(p => !p.onibus_id).length;
    // Se não temos passageiros não alocados e a seleção atual é "não alocados"
    if (totalNaoAlocados === 0 && selectedOnibusId === null && onibusList.length > 0) {
      // Seleciona automaticamente o primeiro ônibus
      handleSelectOnibus(onibusList[0].id);
    }
  }, [passageiros, selectedOnibusId, onibusList]);

  const openEditPassageiroDialog = (passageiro: any) => {
    setSelectedPassageiro(passageiro);
    setEditPassageiroOpen(true);
  };

  const openDeletePassageiroDialog = (passageiro: any) => {
    setSelectedPassageiro(passageiro);
    setDeletePassageiroOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="mb-6">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (!viagem) {
    return (
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Viagem não encontrada</h1>
        <p>A viagem que você está procurando não existe ou foi removida.</p>
        <Button asChild className="mt-4">
          <Link to="/dashboard/viagens">Voltar para Viagens</Link>
        </Button>
      </div>
    );
  }

  // Passageiros do ônibus atual
  const passageirosAtuais = getPassageirosDoOnibusAtual();
  const onibusAtual = getOnibusAtual();
  const totalPassageirosNaoAlocados = passageiros.filter(p => !p.onibus_id).length;

  return (
    <div className="container py-6">
      <ViagemHeader 
        viagem={viagem} 
        onDelete={handleDelete} 
        statusColors={statusColors} 
      />

      {/* Cards de informações da viagem */}
      <ViagemInfo 
        data_jogo={viagem.data_jogo}
        rota={viagem.rota}
        setor_padrao={viagem.setor_padrao}
        valor_padrao={viagem.valor_padrao}
        tipo_onibus={viagem.tipo_onibus}
        empresa={viagem.empresa}
        capacidade_onibus={viagem.capacidade_onibus}
        onibusList={onibusList}
      />

      {/* Resumo financeiro */}
      {passageiros.length > 0 && (
        <div className="mb-6">
          <FinancialSummary
            totalArrecadado={totalArrecadado}
            totalPago={totalPago}
            totalPendente={totalPendente}
            percentualPagamento={Math.round((totalPago / totalArrecadado) * 100) || 0}
            totalPassageiros={passageiros.length}
            valorPotencialTotal={(viagem.valor_padrao || 0) * viagem.capacidade_onibus}
            capacidadeTotalOnibus={viagem.capacidade_onibus}
          />
        </div>
      )}

      {/* Card de pagamentos pendentes */}
      {countPendentePayment > 0 && (
        <PendingPaymentsCard 
          totalPendente={totalPendente}
          countPendente={countPendentePayment}
          onShowPendingOnly={togglePendingPayments}
        />
      )}

      {/* Cards dos ônibus */}
      {onibusList.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-3">Ônibus da Viagem</h2>
          <OnibusCards
            onibusList={onibusList}
            selectedOnibusId={selectedOnibusId}
            onSelectOnibus={handleSelectOnibus}
            passageirosCount={contadorPassageiros}
            passageirosNaoAlocados={totalPassageirosNaoAlocados}
          />
        </div>
      )}

      {/* Lista de Passageiros */}
      <PassageirosCard 
        passageirosAtuais={passageirosAtuais}
        passageiros={passageiros}
        onibusAtual={onibusAtual}
        selectedOnibusId={selectedOnibusId}
        totalPassageirosNaoAlocados={totalPassageirosNaoAlocados}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setAddPassageiroOpen={setAddPassageiroOpen}
        onEditPassageiro={openEditPassageiroDialog}
        onDeletePassageiro={openDeletePassageiroDialog}
        filterStatus={filterStatus}
      />

      {/* Modais para gerenciar passageiros */}
      <PassageiroDialog 
        open={addPassageiroOpen} 
        onOpenChange={setAddPassageiroOpen} 
        viagemId={id || ""} 
        onSuccess={() => id && fetchPassageiros(id)}
        valorPadrao={viagem.valor_padrao}
        setorPadrao={viagem.setor_padrao}
      />
      
      <PassageiroEditDialog
        open={editPassageiroOpen}
        onOpenChange={setEditPassageiroOpen}
        passageiro={selectedPassageiro}
        onSuccess={() => id && fetchPassageiros(id)}
      />

      {selectedPassageiro && (
        <PassageiroDeleteDialog
          open={deletePassageiroOpen}
          onOpenChange={setDeletePassageiroOpen}
          passageiroId={selectedPassageiro.viagem_passageiro_id}
          passageiroNome={selectedPassageiro.nome}
          onSuccess={() => id && fetchPassageiros(id)}
        />
      )}
    </div>
  );
};

export default DetalhesViagem;
