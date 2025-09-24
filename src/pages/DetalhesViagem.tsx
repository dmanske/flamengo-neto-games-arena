
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Users, DollarSign, UserCheck, UserX, TrendingUp, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

import { PassageiroDialog } from "@/components/detalhes-viagem/PassageiroDialog";
import { PassageiroEditDialog } from "@/components/detalhes-viagem/PassageiroEditDialog";
import PassageiroDeleteDialog from "@/components/detalhes-viagem/PassageiroDeleteDialog";
import { PassageiroDetailsDialog } from "@/components/detalhes-viagem/PassageiroDetailsDialog";

import { FinanceiroViagem } from "@/components/detalhes-viagem/financeiro/FinanceiroViagem";
import { OnibusCards } from "@/components/detalhes-viagem/OnibusCards";
import { PassageirosCard } from "@/components/detalhes-viagem/PassageirosCard";
import { ViagemReport } from "@/components/relatorios/ViagemReport";
import { IngressosViagemReport } from "@/components/relatorios/IngressosViagemReport";
import { ReportFiltersDialog } from "@/components/relatorios/ReportFiltersDialog";
import { ModernViagemDetailsLayout } from "@/components/detalhes-viagem/ModernViagemDetailsLayout";
import { useViagemDetails, PassageiroDisplay } from "@/hooks/useViagemDetails";
import { useViagemReport } from "@/hooks/useViagemReport";
import { useIngressosViagemReport } from "@/hooks/useIngressosViagemReport";
import { usePasseios } from "@/hooks/usePasseios";
import { ResumoCards } from "@/components/detalhes-viagem/ResumoCards";
import { PasseiosExibicaoHibrida } from "@/components/viagem/PasseiosExibicaoHibrida";
import { useViagemCompatibility } from "@/hooks/useViagemCompatibility";
import { useViagemFinanceiro } from "@/hooks/financeiro/useViagemFinanceiro";
import { VincularCreditoModal } from "@/components/creditos/VincularCreditoModal";
import { useCreditos } from "@/hooks/useCreditos";

import { toast } from "sonner";

import { PasseiosTotaisCard } from "@/components/detalhes-viagem/PasseiosTotaisCard";
import { LinksOnibusSection } from "@/components/lista-presenca/LinksOnibusSection";

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
  
  // Estados para vinculação de crédito
  const [modalVincularAberto, setModalVincularAberto] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<any>(null);

  const {
    viagem,
    passageiros: originalPassageiros,
    isLoading,
    totalArrecadado,
    totalPago,
    totalPendente,
    valorPotencialTotal,
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
  // Função de refresh completo para ações financeiras
  const refreshAllFinancialData = async () => {
    await Promise.all([
      fetchPassageiros(id),
      refreshFinanceiro()
    ]);
  };

  // Hook para dados financeiros corretos (ESTADO UNIFICADO - única instância)
  const {
    viagem: viagemFinanceiro,
    resumoFinanceiro,
    receitas,
    despesas,
    passageirosPendentes,
    todosPassageiros,
    fetchAllData: refreshFinanceiro,
    isLoading: loadingFinanceiro,
    // Funções de ação
    adicionarReceita,
    editarReceita,
    excluirReceita,
    adicionarDespesa,
    editarDespesa,
    excluirDespesa,
    registrarCobranca
  } = useViagemFinanceiro(id || "", refreshAllFinancialData);

  const {
    reportRef,
    handlePrint,
    handleExportPDF,
    filters,
    setFilters,
    filterPassageiros,
    calculatePreviewData
  } = useViagemReport();

  // Hook para relatório de ingressos
  const {
    reportRef: ingressosReportRef,
    handlePrint: handleIngressosPrint,
    handleExportPDF: handleIngressosExportPDF
  } = useIngressosViagemReport();

  // Hook para carregar passeios (para filtros de viagens novas)
  const { passeios } = usePasseios();

  // Hook para operações com créditos
  const { desvincularPassageiroViagem } = useCreditos();

  // Expor função para recarregar passageiros globalmente
  React.useEffect(() => {
    if (fetchPassageiros && id) {
      (window as any).reloadViagemPassageiros = () => {
        console.log('🔄 [DetalhesViagem] Função global chamada - recarregando passageiros da viagem:', id);
        console.log('🔄 [DetalhesViagem] fetchPassageiros disponível:', !!fetchPassageiros);
        fetchPassageiros(id);
        console.log('✅ [DetalhesViagem] fetchPassageiros executado para viagem:', id);
      };
      console.log('✅ [DetalhesViagem] Função global reloadViagemPassageiros registrada para viagem:', id);
      console.log('✅ [DetalhesViagem] Função registrada no window:', !!(window as any).reloadViagemPassageiros);
    }
    return () => {
      console.log('🧹 [DetalhesViagem] Removendo função global reloadViagemPassageiros');
      delete (window as any).reloadViagemPassageiros;
    };
  }, [fetchPassageiros, id]);

  // Estados para o modal de filtros
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);

  // Calcular passageiros filtrados e dados de preview
  const passageirosFiltrados = filterPassageiros(originalPassageiros, filters);
  const previewData = calculatePreviewData(originalPassageiros, filters);

  const passageirosListRef = React.useRef<HTMLDivElement>(null);

  // Função para atualizar todos os dados quando há mudanças nos pagamentos
  const refreshAllData = async () => {
    console.log('🔄 refreshAllData chamado - Atualizando dados financeiros e passageiros...');
    if (id) {
      console.log('📊 Executando Promise.all para atualizar dados...');
      await Promise.all([
        fetchPassageiros(id),
        refreshFinanceiro()
      ]);
      console.log('✅ refreshAllData concluído - Dados atualizados com sucesso!');
    } else {
      console.warn('⚠️ refreshAllData: ID não disponível');
    }
  };

  // Valores financeiros corretos - usar APENAS dados do resumoFinanceiro
  const valoresFinanceiros = {
    totalArrecadado: resumoFinanceiro?.total_receitas ?? 0,
    totalPago: (resumoFinanceiro?.total_receitas ?? 0) - (resumoFinanceiro?.total_pendencias ?? 0),
    totalPendente: resumoFinanceiro?.total_pendencias ?? 0,
    percentualPagamento: resumoFinanceiro?.total_receitas > 0 ? Math.round(((resumoFinanceiro.total_receitas - resumoFinanceiro.total_pendencias) / resumoFinanceiro.total_receitas) * 100) : 0,
    receitaViagem: resumoFinanceiro?.receitas_viagem ?? 0,
    receitaPasseios: resumoFinanceiro?.receitas_passeios ?? 0,
    pagoViagem: (resumoFinanceiro?.receitas_viagem ?? 0) - (resumoFinanceiro?.pendencias_viagem ?? 0),
    pagoPasseios: (resumoFinanceiro?.receitas_passeios ?? 0) - (resumoFinanceiro?.pendencias_passeios ?? 0),
    pendenteViagem: resumoFinanceiro?.pendencias_viagem ?? 0,
    pendentePasseios: resumoFinanceiro?.pendencias_passeios ?? 0
  };

  // Debug dos valores financeiros
  console.log('💰 RESUMO FINANCEIRO:', resumoFinanceiro?.pendencias_viagem, resumoFinanceiro?.pendencias_passeios);
  console.log('💰 VALORES CALCULADOS:', valoresFinanceiros.pendenteViagem, valoresFinanceiros.pendentePasseios);
  console.log('💰 DEBUG - Valores Financeiros DETALHADO:', {
    resumoFinanceiro: resumoFinanceiro ? {
      total_receitas: resumoFinanceiro.total_receitas,
      total_pendencias: resumoFinanceiro.total_pendencias,
      pendencias_viagem: resumoFinanceiro.pendencias_viagem,
      pendencias_passeios: resumoFinanceiro.pendencias_passeios,
      receitas_viagem: resumoFinanceiro.receitas_viagem,
      receitas_passeios: resumoFinanceiro.receitas_passeios
    } : null,
    valoresFinanceiros: {
      totalPendente: valoresFinanceiros.totalPendente,
      pendenteViagem: valoresFinanceiros.pendenteViagem,
      pendentePasseios: valoresFinanceiros.pendentePasseios,
      pagoViagem: valoresFinanceiros.pagoViagem,
      pagoPasseios: valoresFinanceiros.pagoPasseios
    },
    loadingFinanceiro
  });



  useEffect(() => {
    const totalNaoAlocados = originalPassageiros.filter(p => !p.onibus_id).length;
    if (totalNaoAlocados === 0 && selectedOnibusId === null && onibusList.length > 0) {
      handleSelectOnibus(onibusList[0].id);
    }
  }, [originalPassageiros, selectedOnibusId, onibusList]);

  const openEditPassageiroDialog = (passageiro: any) => {
    console.log("Abrindo dialog de edição para:", passageiro);
    console.log("viagem_passageiro_id:", passageiro?.viagem_passageiro_id);
    
    // ✅ CORREÇÃO: Verificação de segurança mais rigorosa antes de abrir o modal
    if (!passageiro) {
      console.error('❌ Tentativa de abrir modal de edição com passageiro null/undefined');
      toast.error('Erro: Dados do passageiro não encontrados');
      return;
    }
    
    const viagemPassageiroId = passageiro.viagem_passageiro_id || passageiro.id;
    
    if (!viagemPassageiroId || typeof viagemPassageiroId !== 'string') {
      console.error('❌ Tentativa de abrir modal de edição sem ID válido', {
        passageiro,
        viagemPassageiroId,
        tipo: typeof viagemPassageiroId
      });
      toast.error('Erro: ID do passageiro não encontrado ou inválido');
      return;
    }
    
    if (viagemPassageiroId === 'undefined' || viagemPassageiroId === 'null' || viagemPassageiroId.length < 10) {
      console.error('❌ Tentativa de abrir modal com ID suspeito', {
        viagemPassageiroId,
        length: viagemPassageiroId.length
      });
      toast.error('Erro: ID do passageiro inválido');
      return;
    }
    
    // ✅ CORREÇÃO: Garantir que o passageiro tenha o ID correto
    const passageiroComId = {
      ...passageiro,
      viagem_passageiro_id: viagemPassageiroId
    };
    
    setSelectedPassageiro(passageiroComId);
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

  // Handler para desvincular passageiro da viagem (manter crédito)
  const handleDesvincularCredito = async (passageiro: any) => {
    const confirmar = window.confirm(
      `Tem certeza que deseja desvincular ${passageiro.nome || passageiro.clientes?.nome} desta viagem?\n\n` +
      `O passageiro será removido da viagem e o valor do crédito (R$ ${(passageiro.valor_credito_utilizado || 0).toFixed(2)}) será restaurado para uso futuro.`
    );

    if (!confirmar) return;

    const viagemPassageiroId = passageiro.viagem_passageiro_id || passageiro.id;
    console.log('🔄 [DEBUG] Desvinculando passageiro:', {
      nome: passageiro.nome || passageiro.clientes?.nome,
      viagemPassageiroId,
      creditoId: passageiro.credito_origem_id,
      valorUtilizado: passageiro.valor_credito_utilizado
    });

    const sucesso = await desvincularPassageiroViagem(viagemPassageiroId);
    
    if (sucesso) {
      // Recarregar dados da viagem
      await refreshAllData();
      console.log('✅ [DEBUG] Passageiro desvinculado e dados recarregados');
    }
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
        {(filters.modoComprarIngressos || filters.modoComprarPasseios || filters.modoTransfer) ? (
           <IngressosViagemReport
             ref={ingressosReportRef}
             passageiros={passageirosFiltrados.length > 0 ? passageirosFiltrados : originalPassageiros}
             jogoInfo={{
               adversario: viagem?.adversario || 'Adversário',
               jogo_data: viagem?.data_jogo || new Date().toISOString(),
               local_jogo: 'casa',
               total_ingressos: passageirosFiltrados.length > 0 ? passageirosFiltrados.length : originalPassageiros.length,
               logo_flamengo: viagem?.logo_flamengo || '/logos/flamengo.png',
               logo_adversario: viagem?.logo_adversario || '/logos/adversario.png'
             }}
             filters={filters}
             onibusList={onibusList}
           />
        ) : (
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
        )}
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
        viagemId={id}
        viagem={viagem}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="passageiros" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Passageiros
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="presenca" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Presença
          </TabsTrigger>
        </TabsList>

        <TabsContent value="passageiros" className="space-y-6">
          {/* Cards de resumo financeiro removidos - usando apenas os cards do FinanceiroViagem */}





          {originalPassageiros.length > 0 && (
            <ResumoCards passageiros={originalPassageiros} />
          )}

          {/* Novo componente de totais de passeios */}
          {originalPassageiros.length > 0 && (
            <PasseiosTotaisCard passageiros={originalPassageiros} className="mb-6" />
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
              onDesvincularCredito={handleDesvincularCredito}
              onViewDetails={openDetailsPassageiroDialog}
              filterStatus={filterStatus}
              passeiosPagos={viagem?.passeios_pagos}
              viagemId={id || ""}
              setPassageiros={() => fetchPassageiros(id || '')}
              setIsLoading={() => {}}
              capacidadeTotal={viagem?.capacidade_onibus}
              totalPassageiros={originalPassageiros.length}
              // Novos props para funcionalidade de grupos e troca
              onibusList={onibusList}
              passageirosCount={contadorPassageiros}
              onUpdatePassageiros={() => {
                fetchPassageiros(id || '');
                fetchOnibus(id || '');
              }}
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
                setPassageiros={() => fetchPassageiros(id || '')}
                 setIsLoading={() => {}}
                toast={toast}
                onUpdatePassageiros={refreshAllData}
              />
            </div>
          )}

        </TabsContent>

        <TabsContent value="financeiro">
          {/* Cards de resumo financeiro removidos - usando apenas os cards do FinanceiroViagem */}

          {/* Sistema Financeiro Completo da Viagem */}
          <FinanceiroViagem
            viagemId={id || ""}
            onDataUpdate={refreshAllFinancialData}
          />
        </TabsContent>

        {/* Nova Aba Presença */}
        <TabsContent value="presenca" className="space-y-6">
            {/* Resumo de Presença */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="flex items-center p-4">
                  <Users className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">{originalPassageiros.length}</p>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-4">
                  <UserCheck className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">
                      {originalPassageiros.filter(p => p.status_presenca === 'presente').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Presentes</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-4">
                  <UserX className="h-8 w-8 text-orange-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">
                      {originalPassageiros.filter(p => p.status_presenca === 'pendente').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-4">
                  <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-2xl font-bold">
                      {originalPassageiros.length > 0 ? 
                        Math.round((originalPassageiros.filter(p => p.status_presenca === 'presente').length / originalPassageiros.length) * 100) : 0
                      }%
                    </p>
                    <p className="text-sm text-muted-foreground">Taxa Presença</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Aviso se viagem não está em andamento */}
            {viagem?.status_viagem !== 'Em andamento' && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Atenção:</span>
                  </div>
                  <p className="text-yellow-700 mt-1">
                    A lista de presença está disponível apenas para consulta. 
                    Para marcar presença, a viagem precisa estar com status "Em andamento".
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Links por Ônibus */}
            {onibusList.length > 0 && (
              <LinksOnibusSection
                viagemId={id || ""}
                onibus={onibusList}
              />
            )}

            {/* Botão para Lista Completa */}
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Lista de Presença Completa</h3>
                <p className="text-muted-foreground mb-4">
                  Acesse a lista de presença completa com todos os passageiros de todos os ônibus
                </p>
                <Button asChild size="lg">
                  <Link to={`/lista-presenca/${id}`} target="_blank" rel="noopener noreferrer">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Abrir Lista Completa
                  </Link>
                </Button>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      <PassageiroDialog
        open={addPassageiroOpen}
        onOpenChange={setAddPassageiroOpen}
        viagemId={id || ""}
        onSuccess={refreshAllData}
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
        onSuccess={refreshAllData}
      />

      <PassageiroDetailsDialog
        open={detailsPassageiroOpen}
        onOpenChange={setDetailsPassageiroOpen}
        passageiro={selectedPassageiro}
        onSuccess={refreshAllData}
      />

      {selectedPassageiro && (
        <PassageiroDeleteDialog
          open={deletePassageiroOpen}
          onOpenChange={setDeletePassageiroOpen}
          passageiroId={selectedPassageiro.viagem_passageiro_id}
          passageiroNome={selectedPassageiro.nome}
          onSuccess={refreshAllData}
        />
      )}

      {/* Modal de Vinculação de Crédito */}
      <VincularCreditoModal
        open={modalVincularAberto}
        onOpenChange={setModalVincularAberto}
        grupoCliente={clienteSelecionado}
        onSuccess={() => {
          setModalVincularAberto(false);
          setClienteSelecionado(null);
          toast.success('Crédito vinculado com sucesso!');
        }}
        onViagemUpdated={() => {
          // Recarregar dados da viagem
          fetchPassageiros(id);
        }}
      />
    </>
  );

  return (
    <ModernViagemDetailsLayout
      viagem={viagem}
      onDelete={() => handleDelete()}
      onPrint={(filters.modoComprarIngressos || filters.modoComprarPasseios || filters.modoTransfer) ? handleIngressosPrint : handlePrint}
      onExportPDF={(filters.modoComprarIngressos || filters.modoComprarPasseios || filters.modoTransfer) ? handleIngressosExportPDF : handleExportPDF}
      onOpenFilters={() => setFiltersDialogOpen(true)}
      onVincularCredito={() => setModalVincularAberto(true)}
      onibusList={onibusList}
      passageiros={originalPassageiros}
    >
      {mainContent}
    </ModernViagemDetailsLayout>
  );
};

export default DetalhesViagem;
