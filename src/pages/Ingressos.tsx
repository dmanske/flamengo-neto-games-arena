import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download, Trash2, Loader2 } from 'lucide-react';
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
import { Ingresso, FiltrosIngressos } from '@/types/ingressos';
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
  const navigate = useNavigate();
  const { 
    ingressos, 
    resumoFinanceiro, 
    estados, 
    buscarIngressos,
    buscarResumoFinanceiro,
    deletarIngresso
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
  const [viagensIngressos, setViagensIngressos] = useState<any[]>([]);
  const [viagemToDelete, setViagemToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [jogoSelecionadoParaIngresso, setJogoSelecionadoParaIngresso] = useState<any>(null);
  
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

  // Buscar viagens de ingressos
  const buscarViagensIngressos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('viagens_ingressos')
        .select('*')
        .eq('status', 'Ativa')
        .order('data_jogo', { ascending: true });

      if (error) {
        console.error('Erro ao buscar viagens de ingressos:', error);
        return;
      }

      setViagensIngressos(data || []);
    } catch (error) {
      console.error('Erro inesperado ao buscar viagens de ingressos:', error);
    }
  }, []);

  // Carregar viagens de ingressos quando o componente montar
  useEffect(() => {
    buscarViagensIngressos();
  }, [buscarViagensIngressos]);

  // Função para deletar viagem de ingressos
  const handleDeleteViagemIngressos = async (viagemId: string, viagemNome: string) => {
    try {
      setIsDeleting(true);

      console.log(`Iniciando exclusão da viagem de ingressos: ${viagemId} - ${viagemNome}`);

      const { error } = await supabase
        .from('viagens_ingressos')
        .delete()
        .eq('id', viagemId);

      if (error) {
        throw error;
      }

      console.log(`Viagem de ingressos excluída com sucesso: ${viagemId}`);

      toast.success(`Viagem de ingressos "${viagemNome}" removida com sucesso`);
      setViagemToDelete(null);
      
      // Recarregar a lista
      await buscarViagensIngressos();
    } catch (err: any) {
      console.error('Erro ao excluir viagem de ingressos:', err);
      toast.error(`Erro ao excluir viagem de ingressos: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };






  // UNIFICAR TUDO EM JOGOS FUTUROS - incluir viagens com e sem ingressos
  const jogosComIngressos = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const gruposUnificados: Record<string, any> = {};

    // 1. Processar ingressos existentes
    const ingressosFuturos = ingressosFiltrados.filter(ingresso => {
      const dataJogoString = ingresso.viagem?.data_jogo || ingresso.jogo_data;
      const dataJogo = new Date(dataJogoString);
      return dataJogo >= hoje;
    });

    ingressosFuturos.forEach(ingresso => {
      const dataJogo = ingresso.viagem?.data_jogo || ingresso.jogo_data;
      // Usar toISOString().split('T')[0] para chave mais consistente
      const dataJogoNormalizada = new Date(dataJogo).toISOString().split('T')[0];
      const chaveJogo = `${ingresso.adversario.toLowerCase()}-${dataJogoNormalizada}-${ingresso.local_jogo}`;
      
      if (!gruposUnificados[chaveJogo]) {
        // BUSCAR data da viagem de ingressos se não tem viagem do sistema
        let dataJogoCorreta = ingresso.viagem?.data_jogo;
        
        // Se não tem viagem do sistema, buscar na viagem de ingressos
        if (!dataJogoCorreta && ingresso.viagem_ingressos_id) {
          const viagemIngressos = viagensIngressos.find(v => v.id === ingresso.viagem_ingressos_id);
          dataJogoCorreta = viagemIngressos?.data_jogo;
        }
        
        // Fallback para data do ingresso
        if (!dataJogoCorreta) {
          dataJogoCorreta = ingresso.jogo_data;
        }
        
        console.log('🎯 Agrupamento - Criando grupo:', {
          adversario: ingresso.adversario,
          dataViagem: ingresso.viagem?.data_jogo,
          dataViagemIngressos: viagensIngressos.find(v => v.id === ingresso.viagem_ingressos_id)?.data_jogo,
          dataIngresso: ingresso.jogo_data,
          dataEscolhida: dataJogoCorreta,
          chaveJogo
        });
        
        gruposUnificados[chaveJogo] = {
          adversario: ingresso.adversario,
          jogo_data: dataJogoCorreta, // ✅ Usar data correta
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
      
      gruposUnificados[chaveJogo].ingressos.push(ingresso);
      gruposUnificados[chaveJogo].total_ingressos++;
      gruposUnificados[chaveJogo].receita_total += ingresso.valor_final || 0;
      gruposUnificados[chaveJogo].lucro_total += ingresso.lucro || 0;
      
      if (ingresso.situacao_financeira === 'pago') {
        gruposUnificados[chaveJogo].ingressos_pagos++;
      } else if (ingresso.situacao_financeira === 'pendente') {
        gruposUnificados[chaveJogo].ingressos_pendentes++;
      }
    });

    // 2. Processar viagens de ingressos sem ingressos ainda
    const viagensFuturas = viagensIngressos.filter(viagem => {
      const dataJogo = new Date(viagem.data_jogo);
      return dataJogo >= hoje;
    });

    viagensFuturas.forEach(viagem => {
      // Usar toISOString().split('T')[0] para chave mais consistente
      const dataJogoNormalizada = new Date(viagem.data_jogo).toISOString().split('T')[0];
      const chaveJogo = `${viagem.adversario.toLowerCase()}-${dataJogoNormalizada}-${viagem.local_jogo}`;
      
      // Só adicionar se não existe (não tem ingressos)
      if (!gruposUnificados[chaveJogo]) {
        gruposUnificados[chaveJogo] = {
          adversario: viagem.adversario,
          jogo_data: viagem.data_jogo,
          local_jogo: viagem.local_jogo,
          logo_adversario: viagem.logo_adversario || logosAdversarios[viagem.adversario] || null,
          logo_flamengo: viagem.logo_flamengo || "https://logodetimes.com/times/flamengo/logo-flamengo-256.png",
          ingressos: [],
          total_ingressos: 0,
          receita_total: 0,
          lucro_total: 0,
          ingressos_pendentes: 0,
          ingressos_pagos: 0,
          viagem_ingressos_id: viagem.id,
        };
      } else {
        // Se já existe (tem ingressos), apenas adicionar o ID da viagem para referência
        gruposUnificados[chaveJogo].viagem_ingressos_id = viagem.id;
      }
    });

    // 3. Converter para array e ordenar por data
    return Object.values(gruposUnificados).sort((a: any, b: any) => {
      return new Date(a.jogo_data).getTime() - new Date(b.jogo_data).getTime();
    });
  }, [ingressosFiltrados, logosAdversarios, viagensIngressos]);

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

  // Função para abrir modal de novo ingresso com jogo pré-selecionado
  const handleNovoIngressoJogo = (jogo: any) => {
    setIngressoSelecionado(null); // Limpar seleção para modo criação
    setJogoSelecionadoParaIngresso(jogo); // Armazenar jogo selecionado
    setModalFormAberto(true);
  };

  // Função para obter ingressos de um jogo específico
  const getIngressosDoJogo = (jogo: any) => {
    return ingressos.filter(ingresso => {
      // Usar data da viagem se disponível, senão usar data do ingresso
      const dataJogoIngresso = ingresso.viagem?.data_jogo || ingresso.jogo_data;
      // Usar toISOString().split('T')[0] para comparação consistente (mesmo método usado no agrupamento)
      const dataIngressoNormalizada = new Date(dataJogoIngresso).toISOString().split('T')[0];
      const dataJogoNormalizada = new Date(jogo.jogo_data).toISOString().split('T')[0];
      
      return (
        ingresso.adversario.toLowerCase() === jogo.adversario.toLowerCase() &&
        dataIngressoNormalizada === dataJogoNormalizada &&
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
    setJogoParaDeletar(jogo);
    setConfirmDeleteOpen(true);
  };

  // Função para confirmar exclusão do jogo
  const confirmarDeletarJogo = async () => {
    if (!jogoParaDeletar) return;

    const ingressosDoJogo = getIngressosDoJogo(jogoParaDeletar);
    setConfirmDeleteOpen(false);

    try {
      if (ingressosDoJogo.length > 0) {
        // Se há ingressos, deletar os ingressos E a viagem se for viagem de ingressos
        await toast.promise(
          (async () => {
            // 1. Deletar ingressos
            const { error: errorIngressos } = await supabase
              .from('ingressos')
              .delete()
              .in('id', ingressosDoJogo.map(ing => ing.id));

            if (errorIngressos) {
              throw new Error('Erro ao deletar ingressos');
            }

            // 2. Se é viagem de ingressos, deletar a viagem também
            if (jogoParaDeletar.viagem_ingressos_id) {
              const { error: errorViagem } = await supabase
                .from('viagens_ingressos')
                .delete()
                .eq('id', jogoParaDeletar.viagem_ingressos_id);

              if (errorViagem) {
                console.warn('Erro ao deletar viagem de ingressos:', errorViagem);
                // Não falhar por causa disso
              }
            }

            // Recarregar dados após deletar
            await buscarIngressos(filtros);
            await buscarResumoFinanceiro(filtros);
            await buscarViagensIngressos();
          })(),
          {
            loading: `Deletando jogo completo...`,
            success: `✅ Jogo deletado completamente!`,
            error: '❌ Erro ao deletar jogo. Tente novamente.'
          }
        );
      } else if (jogoParaDeletar.viagem_ingressos_id) {
        // Se não há ingressos mas é uma viagem de ingressos, deletar a viagem
        await toast.promise(
          (async () => {
            const { error } = await supabase
              .from('viagens_ingressos')
              .delete()
              .eq('id', jogoParaDeletar.viagem_ingressos_id);

            if (error) {
              throw new Error('Erro ao deletar viagem');
            }

            // Recarregar dados após deletar
            await buscarViagensIngressos();
            await buscarIngressos(filtros);
            await buscarResumoFinanceiro(filtros);
          })(),
          {
            loading: 'Deletando viagem...',
            success: '✅ Viagem deletada com sucesso!',
            error: '❌ Erro ao deletar viagem. Tente novamente.'
          }
        );
      } else {
        toast.warning('Não há nada para deletar neste jogo.');
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
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
          <Button 
            onClick={() => navigate('/dashboard/cadastrar-viagem-ingressos')} 
            variant="outline" 
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Viagem para Ingressos
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



      {/* Cards de Jogos Futuros - TODOS os jogos */}
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
              <p>Nenhum jogo futuro encontrado</p>
              <p className="text-sm">Crie viagens para ingressos ou cadastre ingressos para jogos futuros</p>
              
              <div className="flex gap-2 justify-center mt-4">
                <Button 
                  onClick={() => navigate('/dashboard/cadastrar-viagem-ingressos')}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Viagem
                </Button>
                <Button onClick={() => {
                  setIngressoSelecionado(null);
                  setModalFormAberto(true);
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Ingresso
                </Button>
              </div>
              
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jogosComIngressos.map((jogo: any) => (
                <CleanJogoCard
                  key={`${jogo.adversario}-${jogo.jogo_data}-${jogo.local_jogo}`}
                  jogo={jogo}
                  onVerIngressos={handleVerIngressosJogo}
                  onDeletarJogo={handleDeletarJogo}
                  onExportarPDF={handleExportarPDFJogo}
                  onNovoIngresso={handleNovoIngressoJogo}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>



      {/* Modais */}
      <IngressoFormModal
        open={modalFormAberto}
        onOpenChange={(open) => {
          setModalFormAberto(open);
          if (!open) {
            setJogoSelecionadoParaIngresso(null);
          }
        }}
        ingresso={ingressoSelecionado}
        jogoPreSelecionado={jogoSelecionadoParaIngresso}
        onSuccess={() => {
          setModalFormAberto(false);
          setIngressoSelecionado(null);
          setJogoSelecionadoParaIngresso(null);
          // Recarregar dados para atualizar cards em tempo real
          buscarIngressos(filtros);
          buscarResumoFinanceiro(filtros);
          buscarViagensIngressos();
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
          `Você está prestes a deletar COMPLETAMENTE este jogo:\n\n` +
          `🏆 Jogo: ${jogoParaDeletar.local_jogo === 'fora' ? 
            `${jogoParaDeletar.adversario} × Flamengo` : 
            `Flamengo × ${jogoParaDeletar.adversario}`}\n` +
          `🎫 Total de ingressos: ${getIngressosDoJogo(jogoParaDeletar).length}\n` +
          `💰 Receita total: ${formatCurrency(jogoParaDeletar.receita_total)}\n\n` +
          `${jogoParaDeletar.viagem_ingressos_id ? 
            '🗑️ Isso irá deletar TODOS os ingressos E a viagem para ingressos!\n' : 
            '🗑️ Isso irá deletar TODOS os ingressos deste jogo!\n'
          }\n` +
          `⚠️ Esta ação não pode ser desfeita!\n\n` +
          `Tem certeza que deseja continuar?`
          : ''
        }
        confirmText="🗑️ Sim, Deletar Tudo"
        cancelText="❌ Cancelar"
        onConfirm={confirmarDeletarJogo}
        variant="destructive"
      />

      {/* Modal de confirmação de exclusão de viagem de ingressos */}
      {viagemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Exclusão</h3>
                <p className="text-sm text-gray-600">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir a viagem de ingressos <strong>"{viagemToDelete.adversario}"</strong>?
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setViagemToDelete(null)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteViagemIngressos(viagemToDelete.id, viagemToDelete.adversario)}
                disabled={isDeleting}
                className="gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Excluindo...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

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