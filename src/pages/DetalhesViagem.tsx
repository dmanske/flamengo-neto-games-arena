
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
import { ViagemHeader } from "@/components/detalhes-viagem/ViagemHeader";
import { ViagemInfo } from "@/components/detalhes-viagem/ViagemInfo";
import { PassageirosCard } from "@/components/detalhes-viagem/PassageirosCard";
import { ViagemReport } from "@/components/relatorios/ViagemReport";
import { LayoutSelector } from "@/components/detalhes-viagem/LayoutSelector";
import { ModernViagemDetailsLayout } from "@/components/detalhes-viagem/ModernViagemDetailsLayout";
import { GlassViagemDetailsLayout } from "@/components/detalhes-viagem/GlassViagemDetailsLayout";
import { useViagemDetails } from "@/hooks/useViagemDetails";
import { useViagemReport } from "@/hooks/useViagemReport";

// Cores no estilo do Flamengo
const statusColors = {
  "Aberta": "bg-green-600 text-white",
  "Em Andamento": "bg-red-600 text-white",
  "Finalizada": "bg-black text-white",
};

const DetalhesViagem = () => {
  const { id } = useParams<{ id: string }>();
  const [addPassageiroOpen, setAddPassageiroOpen] = useState(false);
  const [editPassageiroOpen, setEditPassageiroOpen] = useState(false);
  const [deletePassageiroOpen, setDeletePassageiroOpen] = useState(false);
  const [detailsPassageiroOpen, setDetailsPassageiroOpen] = useState(false);
  const [selectedPassageiro, setSelectedPassageiro] = useState<any>(null);
  const [selectedLayout, setSelectedLayout] = useState<'original' | 'modern' | 'glass'>('original');
  
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
  const totalPassageirosNaoAlocados = passageiros.filter(p => !p.onibus_id).length;

  // Conteúdo principal que será passado para os layouts
  const mainContent = (
    <>
      {/* Componente de Relatório (oculto) */}
      <div style={{ display: 'none' }}>
        <ViagemReport
          ref={reportRef}
          viagem={viagem}
          passageiros={passageiros}
          onibusList={onibusList}
          totalArrecadado={totalArrecadado}
          totalPago={totalPago}
          totalPendente={totalPendente}
          passageiroPorOnibus={passageiroPorOnibus}
        />
      </div>

      {/* Seletor de Layout - apenas para layouts alternativos */}
      {selectedLayout === 'original' && (
        <LayoutSelector 
          selectedLayout={selectedLayout}
          onLayoutChange={setSelectedLayout}
        />
      )}

      {/* Cards de informações da viagem - apenas para layout original */}
      {selectedLayout === 'original' && (
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
      )}

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
            passageiros={passageiros}
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
        onViewDetails={openDetailsPassageiroDialog}
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
        defaultOnibusId={selectedOnibusId || ''}
      />
      
      <PassageiroEditDialog
        open={editPassageiroOpen}
        onOpenChange={setEditPassageiroOpen}
        passageiro={selectedPassageiro}
        onSuccess={() => id && fetchPassageiros(id)}
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

  // Renderizar com base no layout selecionado
  if (selectedLayout === 'modern') {
    return (
      <ModernViagemDetailsLayout
        viagem={viagem}
        onDelete={handleDelete}
        onPrint={handlePrint}
        onExportPDF={handleExportPDF}
        onibusList={onibusList}
      >
        {/* Botão para voltar ao seletor */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedLayout('original')}
            className="bg-white border-gray-300"
          >
            ← Voltar às opções de visualização
          </Button>
        </div>
        {mainContent}
      </ModernViagemDetailsLayout>
    );
  }

  if (selectedLayout === 'glass') {
    return (
      <GlassViagemDetailsLayout
        viagem={viagem}
        onDelete={handleDelete}
        onPrint={handlePrint}
        onExportPDF={handleExportPDF}
        onibusList={onibusList}
      >
        {/* Botão para voltar ao seletor */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedLayout('original')}
            className="bg-white/10 border border-white/30 text-white backdrop-blur-md hover:bg-white/20"
          >
            ← Voltar às opções de visualização
          </Button>
        </div>
        {mainContent}
      </GlassViagemDetailsLayout>
    );
  }

  // Layout original
  return (
    <div className="container py-6">
      <ViagemHeader 
        viagem={viagem} 
        onDelete={handleDelete} 
        statusColors={statusColors}
        onPrint={handlePrint}
        onExportPDF={handleExportPDF}
      />

      {mainContent}
    </div>
  );
};

export default DetalhesViagem;
