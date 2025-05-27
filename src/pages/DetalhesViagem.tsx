import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { PassageiroDialog } from "@/components/detalhes-viagem/PassageiroDialog";
import { PassageiroEditDialog } from "@/components/detalhes-viagem/PassageiroEditDialog";
import PassageiroDeleteDialog from "@/components/detalhes-viagem/PassageiroDeleteDialog";
import { PassageiroDetailsDialog } from "@/components/detalhes-viagem/PassageiroDetailsDialog";
import { FinancialSummary } from "@/components/detalhes-viagem/FinancialSummary";
import { PendingPaymentsCard } from "@/components/detalhes-viagem/PendingPaymentsCard";
import { OnibusCards } from "@/components/detalhes-viagem/OnibusCards";
import { PassageirosCard } from "@/components/detalhes-viagem/PassageirosCard";
import { ViagemReport } from "@/components/relatorios/ViagemReport";
import { ModernViagemDetailsLayout } from "@/components/detalhes-viagem/ModernViagemDetailsLayout";
import { useViagemDetails } from "@/hooks/useViagemDetails";
import { useViagemReport } from "@/hooks/useViagemReport";
import { PaidPaymentsCard } from "@/components/detalhes-viagem/PaidPaymentsCard";

const DetalhesViagem = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Verificar se o id é válido
  useEffect(() => {
    if (!id || id === "undefined") {
      console.warn("ID da viagem inválido:", id);
      navigate("/dashboard/viagens");
      return;
    }

    // Verificar se o ID é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.warn("ID da viagem não é um UUID válido:", id);
      navigate("/dashboard/viagens");
      return;
    }
  }, [id, navigate]);

  // Não renderizar nada se o id for inválido
  if (!id || id === "undefined") {
    return null;
  }

  const [addPassageiroOpen, setAddPassageiroOpen] = useState(false);
  const [editPassageiroOpen, setEditPassageiroOpen] = useState(false);
  const [deletePassageiroOpen, setDeletePassageiroOpen] = useState(false);
  const [detailsPassageiroOpen, setDetailsPassageiroOpen] = useState(false);
  const [selectedPassageiro, setSelectedPassageiro] = useState<any>(null);
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [isLoadingPassageiros, setIsLoadingPassageiros] = useState(false);
  
  const {
    viagem,
    passageiros: originalPassageiros,
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
    passageiroPorOnibus,
    handleSelectOnibus,
    handleDelete,
    getPassageirosDoOnibusAtual,
    getOnibusAtual,
    fetchPassageiros,
    togglePendingPayments,
    filterStatus
  } = useViagemDetails(id);

  const { reportRef, handlePrint, handleExportPDF } = useViagemReport();

  const passageirosListRef = React.useRef<HTMLDivElement>(null);

  // Funções para filtrar e rolar até a lista
  const handleShowPaidOnly = () => {
    setSearchTerm("");
    if (typeof window !== "undefined") {
      setTimeout(() => {
        if (passageirosListRef.current) {
          passageirosListRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
    // Forçar filtro de pagos
    document.dispatchEvent(new CustomEvent("setPassageirosStatusFilter", { detail: "Pago" }));
  };
  const handleShowPendingOnly = () => {
    setSearchTerm("");
    if (typeof window !== "undefined") {
      setTimeout(() => {
        if (passageirosListRef.current) {
          passageirosListRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
    // Forçar filtro de pendentes
    document.dispatchEvent(new CustomEvent("setPassageirosStatusFilter", { detail: "Pendente" }));
  };

  // Efeito que verifica se não há passageiros não alocados e seleciona um ônibus
  useEffect(() => {
    const totalNaoAlocados = originalPassageiros.filter(p => !p.onibus_id).length;
    // Se não temos passageiros não alocados e a seleção atual é "não alocados"
    if (totalNaoAlocados === 0 && selectedOnibusId === null && onibusList.length > 0) {
      // Seleciona automaticamente o primeiro ônibus
      handleSelectOnibus(onibusList[0].id);
    }
  }, [originalPassageiros, selectedOnibusId, onibusList]);

  const openEditPassageiroDialog = (passageiro: any) => {
    setSelectedPassageiro(passageiro);
    setEditPassageiroOpen(true);
  };

  const openDeletePassageiroDialog = (passageiro: any) => {
    setSelectedPassageiro(passageiro);
    setDeletePassageiroOpen(true);
  };

  const openDetailsPassageiroDialog = (passageiro: any) => {
    setSelectedPassageiro(passageiro);
    setDetailsPassageiroOpen(true);
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
        <Button asChild className="mt-4 bg-red-600 hover:bg-red-700">
          <Link to="/dashboard/viagens">Voltar para Viagens</Link>
        </Button>
      </div>
    );
  }

  // Passageiros do ônibus atual
  const passageirosAtuais = getPassageirosDoOnibusAtual();
  const onibusAtual = getOnibusAtual();
  const totalPassageirosNaoAlocados = originalPassageiros.filter(p => !p.onibus_id).length;

  // Conteúdo principal
  const mainContent = (
    <>
      {/* Componente de Relatório (oculto) */}
      <div style={{ display: 'none' }}>
        <ViagemReport
          ref={reportRef}
          viagem={viagem}
          passageiros={originalPassageiros}
          onibusList={onibusList}
          totalArrecadado={totalArrecadado}
          totalPago={totalPago}
          totalPendente={totalPendente}
          passageiroPorOnibus={passageiroPorOnibus}
        />
      </div>

      {/* Resumo financeiro */}
      {originalPassageiros.length > 0 && (
        <div className="mb-6">
          <FinancialSummary
            totalArrecadado={totalArrecadado}
            totalPago={totalPago}
            totalPendente={totalPendente}
            percentualPagamento={Math.round((totalPago / totalArrecadado) * 100) || 0}
            totalPassageiros={originalPassageiros.length}
            valorPotencialTotal={(viagem.valor_padrao || 0) * viagem.capacidade_onibus}
            capacidadeTotalOnibus={viagem.capacidade_onibus}
          />
        </div>
      )}

      {/* Card de pagamentos pagos */}
      <PaidPaymentsCard
        totalPago={totalPago}
        countPago={originalPassageiros.filter(p => p.status_pagamento === "Pago").length}
        onShowPaidOnly={handleShowPaidOnly}
      />
      {/* Card de pagamentos pendentes */}
      {countPendentePayment > 0 && (
        <PendingPaymentsCard 
          totalPendente={totalPendente}
          countPendente={countPendentePayment}
          onShowPendingOnly={handleShowPendingOnly}
        />
      )}

      {/* Lista de Passageiros */}
      <div ref={passageirosListRef}>
        <PassageirosCard
          passageirosAtuais={getPassageirosDoOnibusAtual()}
          passageiros={originalPassageiros}
          onibusAtual={getOnibusAtual()}
          selectedOnibusId={selectedOnibusId}
          totalPassageirosNaoAlocados={totalPassageirosNaoAlocados}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setAddPassageiroOpen={setAddPassageiroOpen}
          onEditPassageiro={openEditPassageiroDialog}
          onDeletePassageiro={openDeletePassageiroDialog}
          onViewDetails={openDetailsPassageiroDialog}
          filterStatus={filterStatus}
          passeiosPagos={viagem?.passeios_pagos}
          outroPasseio={viagem?.outro_passeio}
          viagemId={id || ""}
          setPassageiros={setPassageiros}
          setIsLoading={setIsLoadingPassageiros}
        />
      </div>

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
            passageiros={originalPassageiros}
          />
        </div>
      )}

      {/* Modais para gerenciar passageiros */}
      <PassageiroDialog 
        open={addPassageiroOpen} 
        onOpenChange={setAddPassageiroOpen} 
        viagemId={id || ""} 
        onSuccess={() => id && fetchPassageiros(id)}
        valorPadrao={viagem.valor_padrao}
        setorPadrao={viagem.setor_padrao}
        defaultOnibusId={selectedOnibusId || ''}
      />
      
      <PassageiroEditDialog
        open={editPassageiroOpen}
        onOpenChange={setEditPassageiroOpen}
        passageiro={selectedPassageiro}
        onSuccess={fetchPassageiros}
        passeiosPagos={viagem?.passeios_pagos}
        outroPasseio={viagem?.outro_passeio}
      />

      <PassageiroDetailsDialog
        open={detailsPassageiroOpen}
        onOpenChange={setDetailsPassageiroOpen}
        passageiro={selectedPassageiro}
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
    </>
  );

  // Sempre renderizar com o layout moderno
  return (
    <ModernViagemDetailsLayout
      viagem={viagem}
      onDelete={handleDelete}
      onPrint={handlePrint}
      onExportPDF={handleExportPDF}
      onibusList={onibusList}
    >
      {mainContent}
    </ModernViagemDetailsLayout>
  );
};

export default DetalhesViagem;
