import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Edit, Trash2, Plus } from 'lucide-react';
import { useJogoDetails } from '@/hooks/useJogoDetails';
import { ModernJogoDetailsLayout } from '@/components/detalhes-jogo/ModernJogoDetailsLayout';
import { IngressosCard } from '@/components/detalhes-jogo/IngressosCard';
import { FinanceiroJogo } from '@/components/detalhes-jogo/FinanceiroJogo';
import { IngressoFormModal } from '@/components/ingressos/IngressoFormModal';
import { IngressoDetailsModal } from '@/components/ingressos/IngressoDetailsModal';
import { IngressosReport } from '@/components/ingressos/IngressosReport';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Ingresso, FiltrosIngressos } from '@/types/ingressos';
import { useIngressos } from '@/hooks/useIngressos';
import { useIngressosReport } from '@/hooks/useIngressosReport';

export default function DetalhesJogoIngressos() {
  const { 
    jogo, 
    ingressos, 
    loading, 
    error, 
    recarregarDados, 
    voltarParaIngressos 
  } = useJogoDetails();

  const { deletarIngresso } = useIngressos();

  // Hook para relatório PDF
  const { reportRef, handleExportPDF } = useIngressosReport();

  // Estados da página
  const [activeTab, setActiveTab] = useState<'ingressos' | 'financeiro'>('ingressos');
  const [busca, setBusca] = useState('');
  const [filtros, setFiltros] = useState<FiltrosIngressos>({});
  
  // Estados dos modais
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [ingressoSelecionado, setIngressoSelecionado] = useState<Ingresso | null>(null);
  
  // Estados de confirmação
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [jogoParaDeletar, setJogoParaDeletar] = useState(false);
  const [ingressoParaDeletar, setIngressoParaDeletar] = useState<Ingresso | null>(null);

  // Função para abrir modal de novo ingresso
  const handleNovoIngresso = () => {
    setIngressoSelecionado(null);
    setModalFormAberto(true);
  };

  // Função para ver detalhes do ingresso
  const handleVerDetalhes = (ingresso: Ingresso) => {
    setIngressoSelecionado(ingresso);
    setModalDetalhesAberto(true);
  };

  // Função para editar ingresso
  const handleEditar = (ingresso: Ingresso) => {
    setIngressoSelecionado(ingresso);
    setModalFormAberto(true);
  };

  // Função para deletar ingresso
  const handleDeletar = (ingresso: Ingresso) => {
    setIngressoParaDeletar(ingresso);
    setConfirmDeleteOpen(true);
  };

  // Confirmar deleção de ingresso
  const confirmarDeletarIngresso = async () => {
    if (!ingressoParaDeletar) return;

    setConfirmDeleteOpen(false);
    
    try {
      await toast.promise(
        deletarIngresso(ingressoParaDeletar.id),
        {
          loading: 'Deletando ingresso...',
          success: 'Ingresso deletado com sucesso!',
          error: 'Erro ao deletar ingresso'
        }
      );
      
      // Recarregar dados da página
      recarregarDados();
    } catch (error) {
      console.error('Erro ao deletar ingresso:', error);
    }
    
    setIngressoParaDeletar(null);
  };

  // Função para deletar jogo completo
  const handleDeletarJogo = () => {
    setJogoParaDeletar(true);
    setConfirmDeleteOpen(true);
  };

  // Confirmar deleção do jogo completo
  const confirmarDeletarJogo = async () => {
    if (!jogo) return;

    setConfirmDeleteOpen(false);
    setJogoParaDeletar(false);

    try {
      await toast.promise(
        (async () => {
          // Deletar todos os ingressos do jogo
          if (ingressos.length > 0) {
            const { error: errorIngressos } = await supabase
              .from('ingressos')
              .delete()
              .in('id', ingressos.map(ing => ing.id));

            if (errorIngressos) {
              throw new Error('Erro ao deletar ingressos');
            }
          }

          // Deletar viagem de ingressos se existir
          if (jogo.viagem_ingressos_id) {
            const { error: errorViagem } = await supabase
              .from('viagens_ingressos')
              .delete()
              .eq('id', jogo.viagem_ingressos_id);

            if (errorViagem) {
              console.warn('Erro ao deletar viagem de ingressos:', errorViagem);
            }
          }
        })(),
        {
          loading: 'Deletando jogo completo...',
          success: 'Jogo deletado com sucesso!',
          error: 'Erro ao deletar jogo'
        }
      );

      // Voltar para página de ingressos
      voltarParaIngressos();
    } catch (error) {
      console.error('Erro ao deletar jogo:', error);
    }
  };

  // Função para exportar PDF
  const handleExportarPDFJogo = () => {
    if (!jogo || ingressos.length === 0) {
      toast.warning('Não há ingressos para exportar neste jogo.');
      return;
    }

    // Usar a mesma lógica da página de Ingressos
    handleExportPDF();
  };



  // Função chamada quando modal de formulário é fechado com sucesso
  const handleFormSuccess = () => {
    setModalFormAberto(false);
    setIngressoSelecionado(null);
    recarregarDados();
  };

  // Função para fechar modal de detalhes e recarregar se necessário
  const handleDetalhesClose = (shouldReload = false) => {
    setModalDetalhesAberto(false);
    setIngressoSelecionado(null);
    if (shouldReload) {
      recarregarDados();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-20 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !jogo) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error || 'Jogo não encontrado'}
            </h2>
            <p className="text-gray-600 mb-4">
              Não foi possível carregar os dados do jogo solicitado.
            </p>
          </div>
          <Button onClick={voltarParaIngressos} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Ingressos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Layout principal com header e cards */}
      <ModernJogoDetailsLayout
        jogo={jogo}
        onVoltar={voltarParaIngressos}
        onDeletar={handleDeletarJogo}
        onExportarPDF={handleExportarPDFJogo}
      >
        {/* Sistema de abas */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ingressos' | 'financeiro')} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="ingressos" className="flex items-center gap-2">
              🎫 Ingressos
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="flex items-center gap-2">
              💰 Financeiro
            </TabsTrigger>
          </TabsList>

          {/* Aba Ingressos */}
          <TabsContent value="ingressos">
            <IngressosCard
              ingressos={ingressos}
              busca={busca}
              filtros={filtros}
              onBuscaChange={setBusca}
              onFiltrosChange={setFiltros}
              onVerDetalhes={handleVerDetalhes}
              onEditar={handleEditar}
              onDeletar={handleDeletar}
              onNovoIngresso={handleNovoIngresso}
            />
          </TabsContent>

          {/* Aba Financeiro */}
          <TabsContent value="financeiro">
            <FinanceiroJogo
              jogo={jogo}
              ingressos={ingressos}
            />
          </TabsContent>
        </Tabs>
      </ModernJogoDetailsLayout>

      {/* Modal de formulário de ingresso */}
      <IngressoFormModal
        open={modalFormAberto}
        onOpenChange={setModalFormAberto}
        ingresso={ingressoSelecionado}
        jogoPreSelecionado={jogo}
        onSuccess={handleFormSuccess}
      />

      {/* Modal de detalhes do ingresso */}
      <IngressoDetailsModal
        open={modalDetalhesAberto}
        onOpenChange={(open) => {
          if (!open) {
            handleDetalhesClose();
          }
        }}
        ingresso={ingressoSelecionado}
      />

      {/* Dialog de confirmação */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title={jogoParaDeletar ? "Deletar Jogo Completo" : "Deletar Ingresso"}
        description={
          jogoParaDeletar 
            ? `Tem certeza que deseja deletar este jogo completo? Esta ação irá remover todos os ${ingressos.length} ingressos e não pode ser desfeita.`
            : `Tem certeza que deseja deletar o ingresso de ${ingressoParaDeletar?.cliente?.nome}? Esta ação não pode ser desfeita.`
        }
        onConfirm={jogoParaDeletar ? confirmarDeletarJogo : confirmarDeletarIngresso}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="destructive"
      />

      {/* Componente de relatório PDF (invisível) */}
      <div style={{ display: 'none' }}>
        <IngressosReport
          ref={reportRef}
          jogoInfo={jogo || {
            adversario: '',
            jogo_data: '',
            local_jogo: 'casa',
            total_ingressos: 0
          }}
          ingressos={ingressos}
        />
      </div>
    </div>
  );
}