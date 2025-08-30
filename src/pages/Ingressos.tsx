import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Download, Eye, Edit, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIngressos } from '@/hooks/useIngressos';
import { Ingresso, FiltrosIngressos, SituacaoFinanceiraIngresso } from '@/types/ingressos';
import { formatCurrency } from '@/utils/formatters';
import { FiltrosIngressosModal } from '@/components/ingressos/FiltrosIngressosModal';
import { IngressoDetailsModal } from '@/components/ingressos/IngressoDetailsModal';
import { IngressoFormModal } from '@/components/ingressos/IngressoFormModal';
import { CleanJogoCard } from '@/components/ingressos/CleanJogoCard';
import { IngressosJogoModal } from '@/components/ingressos/IngressosJogoModal';
import { IngressosReport } from '@/components/ingressos/IngressosReport';
import { useIngressosReport } from '@/hooks/useIngressosReport';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export default function Ingressos() {
  const { 
    ingressos, 
    resumoFinanceiro, 
    estados, 
    buscarIngressos,
    buscarResumoFinanceiro,
    deletarIngresso,
    agruparIngressosPorJogo
  } = useIngressos();

  const [filtros, setFiltros] = useState<FiltrosIngressos>({});
  const [busca, setBusca] = useState('');
  const [ingressoSelecionado, setIngressoSelecionado] = useState<Ingresso | null>(null);
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modalFiltrosAberto, setModalFiltrosAberto] = useState(false);
  const [modalJogoAberto, setModalJogoAberto] = useState(false);
  const [jogoSelecionado, setJogoSelecionado] = useState<any>(null);
  const [logosAdversarios, setLogosAdversarios] = useState<Record<string, string>>({});
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [jogoParaDeletar, setJogoParaDeletar] = useState<any>(null);
  
  // Hook para relatório PDF
  const { reportRef, handleExportPDF } = useIngressosReport();

  // Filtrar ingressos baseado na busca (memoizado para evitar re-renders)
  const ingressosFiltrados = useMemo(() => {
    return ingressos.filter(ingresso => {
      if (!busca) return true;
      
      const termoBusca = busca.toLowerCase();
      return (
        ingresso.adversario.toLowerCase().includes(termoBusca) ||
        ingresso.cliente?.nome.toLowerCase().includes(termoBusca) ||
        ingresso.setor_estadio.toLowerCase().includes(termoBusca)
      );
    });
  }, [ingressos, busca]);

  // Os jogos agrupados agora são calculados via useMemo

  // Agrupar ingressos por jogo (versão otimizada)
  const jogosComIngressos = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Filtrar apenas jogos futuros
    const ingressosFuturos = ingressosFiltrados.filter(ingresso => {
      // Usar data da viagem se disponível, senão usar data do ingresso
      const dataJogoString = ingresso.viagem?.data_jogo || ingresso.jogo_data;
      const dataJogo = new Date(dataJogoString);
      return dataJogo >= hoje;
    });

    // Agrupar por jogo (adversario + data + local)
    const grupos = ingressosFuturos.reduce((acc, ingresso) => {
      // Usar data da viagem se disponível, senão usar data do ingresso
      const dataJogo = ingresso.viagem?.data_jogo || ingresso.jogo_data;
      const chaveJogo = `${ingresso.adversario}-${dataJogo}-${ingresso.local_jogo}`;
      
      if (!acc[chaveJogo]) {
        acc[chaveJogo] = {
          adversario: ingresso.adversario,
          jogo_data: dataJogo, // Usar a data correta (da viagem se disponível)
          local_jogo: ingresso.local_jogo,
          logo_adversario: ingresso.logo_adversario || logosAdversarios[ingresso.adversario] || null,
          logo_flamengo: "https://logodetimes.com/times/flamengo/logo-flamengo-256.png",
          ingressos: [],
          total_ingressos: 0,
          receita_total: 0,
          lucro_total: 0,
          ingressos_pendentes: 0,
          ingressos_pagos: 0,
        };
      }
      
      acc[chaveJogo].ingressos.push(ingresso);
      acc[chaveJogo].total_ingressos++;
      acc[chaveJogo].receita_total += ingresso.valor_final;
      acc[chaveJogo].lucro_total += ingresso.lucro;
      
      switch (ingresso.situacao_financeira) {
        case 'pago':
          acc[chaveJogo].ingressos_pagos++;
          break;
        case 'pendente':
          acc[chaveJogo].ingressos_pendentes++;
          break;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Converter para array e ordenar por data
    return Object.values(grupos).sort((a: any, b: any) => {
      return new Date(a.jogo_data).getTime() - new Date(b.jogo_data).getTime();
    });
  }, [ingressosFiltrados, logosAdversarios]);

  // Função para deletar ingresso (sem confirmação - já tratada no modal)
  const handleDeletar = async (ingresso: Ingresso) => {
    await deletarIngresso(ingresso.id);
  };

  // Função para abrir modal de detalhes
  const handleVerDetalhes = (ingresso: Ingresso) => {
    setIngressoSelecionado(ingresso);
    setModalDetalhesAberto(true);
  };

  // Função para abrir modal de edição
  const handleEditar = (ingresso: Ingresso) => {
    setIngressoSelecionado(ingresso);
    setModalFormAberto(true);
  };

  // Função para abrir modal de ingressos do jogo
  const handleVerIngressosJogo = (jogo: any) => {
    setJogoSelecionado(jogo);
    setModalJogoAberto(true);
  };

  // Função para obter ingressos de um jogo específico
  const getIngressosDoJogo = (jogo: any) => {
    return ingressos.filter(ingresso => {
      // Usar data da viagem se disponível, senão usar data do ingresso
      const dataJogoIngresso = ingresso.viagem?.data_jogo || ingresso.jogo_data;
      return (
        ingresso.adversario === jogo.adversario &&
        dataJogoIngresso === jogo.jogo_data &&
        ingresso.local_jogo === jogo.local_jogo
      );
    });
  };

  // Função para exportar PDF de um jogo específico
  const handleExportarPDFJogo = (jogo: any) => {
    const ingressosDoJogo = getIngressosDoJogo(jogo);
    
    if (ingressosDoJogo.length === 0) {
      toast.warning('Não há ingressos para exportar neste jogo.');
      return;
    }

    // Definir o jogo selecionado para o relatório
    setJogoSelecionado({
      ...jogo,
      ingressos: ingressosDoJogo
    });

    // Aguardar um momento para o estado ser atualizado e então exportar
    setTimeout(() => {
      handleExportPDF();
    }, 100);
  };

  // Função para abrir modal de confirmação de exclusão
  const handleDeletarJogo = (jogo: any) => {
    const ingressosDoJogo = getIngressosDoJogo(jogo);
    
    if (ingressosDoJogo.length === 0) {
      toast.warning('Não há ingressos para deletar neste jogo.');
      return;
    }

    setJogoParaDeletar(jogo);
    setConfirmDeleteOpen(true);
  };

  // Função para confirmar exclusão do jogo
  const confirmarDeletarJogo = async () => {
    if (!jogoParaDeletar) return;

    const ingressosDoJogo = getIngressosDoJogo(jogoParaDeletar);
    setConfirmDeleteOpen(false);

    try {
      // Usar toast.promise para melhor UX
      await toast.promise(
        (async () => {
          // Deletar todos os ingressos do jogo em lote
          const { error } = await supabase
            .from('ingressos')
            .delete()
            .in('id', ingressosDoJogo.map(ing => ing.id));

          if (error) {
            throw new Error('Erro ao deletar ingressos');
          }

          // Recarregar dados após deletar
          await buscarIngressos(filtros);
          await buscarResumoFinanceiro(filtros);
        })(),
        {
          loading: `Deletando ${ingressosDoJogo.length} ingressos...`,
          success: `✅ ${ingressosDoJogo.length} ingressos deletados com sucesso!`,
          error: '❌ Erro ao deletar ingressos. Tente novamente.'
        }
      );
    } catch (error) {
      console.error('Erro ao deletar ingressos do jogo:', error);
    }
  };

  // Aplicar filtros quando mudarem
  useEffect(() => {
    buscarIngressos(filtros);
    buscarResumoFinanceiro(filtros);
  }, [filtros, buscarIngressos, buscarResumoFinanceiro]);

  // Buscar logos dos adversários
  useEffect(() => {
    const buscarLogos = async () => {
      try {
        const { data, error } = await supabase
          .from('adversarios')
          .select('nome, logo_url');

        if (error) {
          console.error('Erro ao buscar logos dos adversários:', error);
          return;
        }

        // Criar mapa nome -> logo_url
        const logosMap = (data || []).reduce((acc, adversario) => {
          acc[adversario.nome] = adversario.logo_url;
          return acc;
        }, {} as Record<string, string>);

        setLogosAdversarios(logosMap);
      } catch (error) {
        console.error('Erro inesperado ao buscar logos:', error);
      }
    };

    buscarLogos();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sistema de Ingressos</h1>
          <p className="text-muted-foreground">
            Controle de vendas de ingressos separados das viagens
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => {
            setIngressoSelecionado(null); // Limpar seleção para modo criação
            setModalFormAberto(true);
          }} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Ingresso
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      {resumoFinanceiro && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Ingressos</CardTitle>
              <span className="text-2xl">🎫</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumoFinanceiro.total_ingressos}</div>
              <p className="text-xs text-muted-foreground">
                {resumoFinanceiro.ingressos_pagos} pagos • {resumoFinanceiro.ingressos_pendentes} pendentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <span className="text-2xl">💰</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(resumoFinanceiro.total_receita)}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(resumoFinanceiro.valor_recebido)} recebido
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Total</CardTitle>
              <span className="text-2xl">📈</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(resumoFinanceiro.total_lucro)}</div>
              <p className="text-xs text-muted-foreground">
                Margem: {resumoFinanceiro.margem_media.toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendências</CardTitle>
              <span className="text-2xl">⏳</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(resumoFinanceiro.valor_pendente)}</div>
              <p className="text-xs text-muted-foreground">
                {resumoFinanceiro.ingressos_pendentes} ingressos pendentes
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por adversário, cliente ou setor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select
            value={filtros.situacao_financeira || 'todos'}
            onValueChange={(value) => 
              setFiltros(prev => ({ 
                ...prev, 
                situacao_financeira: value === 'todos' ? undefined : value as any
              }))
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pago">✅ Pago</SelectItem>
              <SelectItem value="pendente">⏳ Pendente</SelectItem>
              <SelectItem value="cancelado">❌ Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={() => setModalFiltrosAberto(true)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>

          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>



      {/* Cards de Jogos Futuros */}
      <Card>
        <CardHeader>
          <CardTitle>
            Jogos Futuros ({jogosComIngressos.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {estados.carregando ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : jogosComIngressos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-4xl mb-4 block">🎫</span>
              <p>Nenhum jogo futuro com ingressos encontrado</p>
              <p className="text-sm">Cadastre ingressos para jogos futuros clicando em "Novo Ingresso"</p>
              
              {ingressos.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-700 font-medium">
                    Há {ingressos.length} ingressos cadastrados, mas nenhum para jogos futuros.
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    Verifique se as datas dos jogos estão corretas.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jogosComIngressos.map((jogo: any, index: number) => (
                <CleanJogoCard
                  key={`${jogo.adversario}-${jogo.jogo_data}-${jogo.local_jogo}`}
                  jogo={jogo}
                  onVerIngressos={handleVerIngressosJogo}
                  onDeletarJogo={handleDeletarJogo}
                  onExportarPDF={handleExportarPDFJogo}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      <IngressoFormModal
        open={modalFormAberto}
        onOpenChange={setModalFormAberto}
        ingresso={ingressoSelecionado}
        onSuccess={() => {
          setModalFormAberto(false);
          setIngressoSelecionado(null);
        }}
      />

      <IngressoDetailsModal
        open={modalDetalhesAberto}
        onOpenChange={setModalDetalhesAberto}
        ingresso={ingressoSelecionado}
      />

      <IngressosJogoModal
        open={modalJogoAberto}
        onOpenChange={setModalJogoAberto}
        jogo={jogoSelecionado}
        ingressos={jogoSelecionado ? getIngressosDoJogo(jogoSelecionado) : []}
        onVerDetalhes={handleVerDetalhes}
        onEditar={handleEditar}
        onDeletar={handleDeletar}
      />

      <FiltrosIngressosModal
        open={modalFiltrosAberto}
        onOpenChange={setModalFiltrosAberto}
        filtros={filtros}
        onFiltrosChange={setFiltros}
      />

      {/* Modal de confirmação de exclusão */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="🗑️ Deletar Jogo Completo"
        description={jogoParaDeletar ? 
          `Você está prestes a deletar TODOS os ingressos do jogo:\n\n` +
          `🏆 Jogo: ${jogoParaDeletar.local_jogo === 'fora' ? 
            `${jogoParaDeletar.adversario} × Flamengo` : 
            `Flamengo × ${jogoParaDeletar.adversario}`}\n` +
          `🎫 Total de ingressos: ${getIngressosDoJogo(jogoParaDeletar).length}\n` +
          `💰 Receita total: ${formatCurrency(jogoParaDeletar.receita_total)}\n\n` +
          `⚠️ Esta ação não pode ser desfeita!\n\n` +
          `Tem certeza que deseja continuar?`
          : ''
        }
        confirmText="🗑️ Sim, Deletar Tudo"
        cancelText="❌ Cancelar"
        onConfirm={confirmarDeletarJogo}
        variant="destructive"
      />

      {/* Componente de relatório oculto para impressão */}
      {jogoSelecionado && jogoSelecionado.ingressos && (
        <div style={{ display: 'none' }}>
          <IngressosReport
            ref={reportRef}
            ingressos={jogoSelecionado.ingressos}
            jogoInfo={{
              adversario: jogoSelecionado.adversario,
              jogo_data: jogoSelecionado.jogo_data,
              local_jogo: jogoSelecionado.local_jogo,
              total_ingressos: jogoSelecionado.total_ingressos,
              logo_adversario: jogoSelecionado.logo_adversario,
              logo_flamengo: jogoSelecionado.logo_flamengo || "https://logodetimes.com/times/flamengo/logo-flamengo-256.png"
            }}
          />
        </div>
      )}

    </div>
  );
}