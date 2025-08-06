import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Users, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PassageiroDialog } from "@/components/detalhes-viagem/PassageiroDialog";
import { PassageiroEditDialog } from "@/components/detalhes-viagem/PassageiroEditDialog";
import PassageiroDeleteDialog from "@/components/detalhes-viagem/PassageiroDeleteDialog";
import { PassageiroDetailsDialog } from "@/components/detalhes-viagem/PassageiroDetailsDialog";
import { FinancialSummary } from "@/components/detalhes-viagem/FinancialSummary";
import { FinanceiroViagem } from "@/components/detalhes-viagem/financeiro/FinanceiroViagem";
import { OnibusCards } from "@/components/detalhes-viagem/OnibusCards";
import { PassageirosCard } from "@/components/detalhes-viagem/PassageirosCard";
import { ViagemReport } from "@/components/relatorios/ViagemReport";
import { ReportFiltersDialog } from "@/components/relatorios/ReportFiltersDialog";
import { ModernViagemDetailsLayout } from "@/components/detalhes-viagem/ModernViagemDetailsLayout";
import { useViagemDetails, PassageiroDisplay } from "@/hooks/useViagemDetails";
import { useViagemReport } from "@/hooks/useViagemReport";
import { usePasseios } from "@/hooks/usePasseios";
import { ResumoCards } from "@/components/detalhes-viagem/ResumoCards";
import { PasseiosExibicaoHibrida } from "@/components/viagem/PasseiosExibicaoHibrida";
import { useViagemCompatibility } from "@/hooks/useViagemCompatibility";
import { useViagemFinanceiro } from "@/hooks/financeiro/useViagemFinanceiro";

import { toast } from "sonner";

const DetalhesViagem = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id || id === "undefined") {
      console.warn("ID da viagem inválido:", id);
      navigate("/dashboard/viagens");
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.warn("ID da viagem não é um UUID válido:", id);
      navigate("/dashboard/viagens");
      return;
    }
  }, [id, navigate]);

  if (!id || id === "undefined") {
    return null;
  }

  const [addPassageiroOpen, setAddPassageiroOpen] = useState(false);
  const [editPassageiroOpen, setEditPassageiroOpen] = useState(false);
  const [deletePassageiroOpen, setDeletePassageiroOpen] = useState(false);
  const [detailsPassageiroOpen, setDetailsPassageiroOpen] = useState(false);
  const [selectedPassageiro, setSelectedPassageiro] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("passageiros");
  
  const {
    viagem,
    passageiros: originalPassageiros,
    isLoading,
    totalArrecadado,
    totalPago,
    totalPendente,
    totalReceitas,
    totalDespesas,
    totalDescontos,
    valorBrutoTotal,
    valorPasseiosReal,
    quantidadeComDesconto,
    
    // Breakdown por categoria
    receitaViagem,
    receitaPasseios,
    pagoViagem,
    pagoPasseios,
    pendenteViagem,
    pendentePasseios,
    onibusList,
    selectedOnibusId,
    contadorPassageiros,
    searchTerm,
    setSearchTerm,
    passageiroPorOnibus,
    handleSelectOnibus,
    handleDelete,
    getPassageirosDoOnibusAtual,
    getOnibusAtual,
    fetchPassageiros,
    filterStatus
  } = useViagemDetails(id);

  // Hook para compatibilidade entre sistemas antigo e novo
  const { 
    sistema, 
    valorPasseios, 
    temPasseios, 
    shouldUseNewSystem 
  } = useViagemCompatibility(viagem);

  // Hook para dados financeiros corretos (mesmo da aba financeiro)
  const { resumoFinanceiro } = useViagemFinanceiro(id || "");

  const { 
    reportRef, 
    handlePrint, 
    handleExportPDF, 
    filters, 
    setFilters, 
    filterPassageiros, 
    calculatePreviewData 
  } = useViagemReport();

  // Hook para carregar passeios (para filtros de viagens novas)
  const { passeios } = usePasseios();

  // Estados para o modal de filtros
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);

  // Calcular passageiros filtrados e dados de preview
  const passageirosFiltrados = filterPassageiros(originalPassageiros, filters);
  const previewData = calculatePreviewData(originalPassageiros, filters);

  const passageirosListRef = React.useRef<HTMLDivElement>(null);



  useEffect(() => {
    const totalNaoAlocados = originalPassageiros.filter(p => !p.onibus_id).length;
    if (totalNaoAlocados === 0 && selectedOnibusId === null && onibusList.length > 0) {
      handleSelectOnibus(onibusList[0].id);
    }
  }, [originalPassageiros, selectedOnibusId, onibusList]);

  const openEditPassageiroDialog = (passageiro: any) => {
    console.log("Abrindo dialog de edição para:", passageiro);
    console.log("viagem_passageiro_id:", passageiro?.viagem_passageiro_id);
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

  const totalPassageirosNaoAlocados = originalPassageiros.filter(p => !p.onibus_id).length;
  
  // Calcular quantidade de brindes (passageiros com valor 0)
  const quantidadeBrindes = originalPassageiros.filter(p => (p.valor || 0) === 0).length;

  const mainContent = (
    <>
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
          filters={filters}
          passageirosFiltrados={passageirosFiltrados}
        />
      </div>

      {/* Modal de Filtros do Relatório */}
      <ReportFiltersDialog
        open={filtersDialogOpen}
        onOpenChange={setFiltersDialogOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onApplyFilters={(newFilters) => {
          setFilters(newFilters);
          // Aqui poderia adicionar lógica adicional se necessário
        }}
        passageiros={originalPassageiros}
        onibusList={onibusList}
        passeios={temPasseios ? passeios : []}
        previewData={previewData}
      />

      <Tabs defaultValue="passageiros" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="passageiros" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Passageiros
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="passageiros" className="space-y-6">
          {originalPassageiros.length > 0 && (
            <div className="mb-6">
              <FinancialSummary
                totalArrecadado={resumoFinanceiro?.total_receitas || totalArrecadado}
                totalPago={(resumoFinanceiro?.total_receitas || 0) - (resumoFinanceiro?.total_pendencias || 0)}
                totalPendente={resumoFinanceiro?.total_pendencias || totalPendente}
                percentualPagamento={resumoFinanceiro?.total_receitas > 0 ? Math.round(((resumoFinanceiro.total_receitas - resumoFinanceiro.total_pendencias) / resumoFinanceiro.total_receitas) * 100) : 0}
                totalPassageiros={originalPassageiros.length}
                valorPotencialTotal={valorPotencialTotal}
                capacidadeTotalOnibus={viagem?.capacidade_onibus || 0}
                totalReceitas={totalReceitas}
                totalDespesas={totalDespesas}
                totalDescontos={totalDescontos}
                valorBrutoTotal={valorBrutoTotal}
                valorPasseios={resumoFinanceiro?.receitas_passeios || valorPasseiosReal}
                sistemaPasseios={sistema}
                valorPadraoViagem={viagem?.valor_padrao || 0}
                quantidadeBrindes={quantidadeBrindes}
                receitaViagem={resumoFinanceiro?.receitas_viagem || receitaViagem}
                receitaPasseios={resumoFinanceiro?.receitas_passeios || receitaPasseios}
                pagoViagem={(resumoFinanceiro?.receitas_viagem || 0) - (resumoFinanceiro?.pendencias_viagem || 0)}
                pagoPasseios={(resumoFinanceiro?.receitas_passeios || 0) - (resumoFinanceiro?.pendencias_passeios || 0)}
                pendenteViagem={resumoFinanceiro?.pendencias_viagem || pendenteViagem}
                pendentePasseios={resumoFinanceiro?.pendencias_passeios || pendentePasseios}
                totalDescontosPassageiros={resumoFinanceiro?.total_descontos || 0}
                quantidadeComDesconto={quantidadeComDesconto}
              />
            </div>
          )}



          {/* Seção de Passeios da Viagem */}
          {temPasseios && (
            <div className="mb-6">
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-medium mb-4">
                  Passeios da Viagem {shouldUseNewSystem && '(com Valores)'}
                </h3>
                <PasseiosExibicaoHibrida 
                  viagem={viagem} 
                  formato="detalhado"
                  className="max-w-2xl"
                />
              </div>
            </div>
          )}

          {originalPassageiros.length > 0 && (
            <ResumoCards passageiros={originalPassageiros} />
          )}

          {/* Cards de pagamentos removidos para simplificar interface */}

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
              capacidadeTotal={viagem?.capacidade_onibus}
              totalPassageiros={originalPassageiros.length}
            />
          </div>

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
                viagemId={id || ""}
                toast={toast}
                onUpdatePassageiros={() => id && fetchPassageiros(id)}
              />
            </div>
          )}

        </TabsContent>

        <TabsContent value="financeiro">
          {/* Resumo Financeiro dos Passageiros */}
          {originalPassageiros.length > 0 && (
            <div className="mb-6">
              <FinancialSummary
                totalArrecadado={totalArrecadado}
                totalPago={totalPago}
                totalPendente={totalPendente}
                percentualPagamento={totalArrecadado > 0 ? Math.round((totalPago / totalArrecadado) * 100) : 0}
                totalPassageiros={originalPassageiros.length}
                valorPotencialTotal={valorPotencialTotal}
                capacidadeTotalOnibus={viagem?.capacidade_onibus || 0}
                totalReceitas={totalReceitas}
                totalDespesas={totalDespesas}
                totalDescontos={totalDescontos}
                valorBrutoTotal={valorBrutoTotal}
                valorPasseios={valorPasseiosReal}
                sistemaPasseios={sistema}
                valorPadraoViagem={viagem?.valor_padrao || 0}
                quantidadeBrindes={quantidadeBrindes}
                receitaViagem={receitaViagem}
                receitaPasseios={receitaPasseios}
                pagoViagem={pagoViagem}
                pagoPasseios={pagoPasseios}
                pendenteViagem={pendenteViagem}
                pendentePasseios={pendentePasseios}
                totalDescontosPassageiros={totalDescontos}
                quantidadeComDesconto={quantidadeComDesconto}
              />
            </div>
          )}
          
          {/* Sistema Financeiro Completo da Viagem */}
          <FinanceiroViagem
            viagemId={id || ""}
          />
        </TabsContent>
      </Tabs>

      <PassageiroDialog 
        open={addPassageiroOpen} 
        onOpenChange={setAddPassageiroOpen} 
        viagemId={id || ""} 
        onSuccess={() => id && fetchPassageiros(id)}
        valorPadrao={viagem.valor_padrao}
        setorPadrao={viagem.setor_padrao}
        defaultOnibusId={selectedOnibusId || ''}
        viagem={viagem}
      />
      
      <PassageiroEditDialog
        open={editPassageiroOpen}
        onOpenChange={setEditPassageiroOpen}
        passageiro={selectedPassageiro}
        viagem={viagem}
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

  return (
    <ModernViagemDetailsLayout
      viagem={viagem}
      onDelete={() => handleDelete()}
      onPrint={handlePrint}
      onExportPDF={handleExportPDF}
      onOpenFilters={() => setFiltersDialogOpen(true)}
      onibusList={onibusList}
      passageiros={originalPassageiros}
    >
      {mainContent}
    </ModernViagemDetailsLayout>
  );
};

export default DetalhesViagem;