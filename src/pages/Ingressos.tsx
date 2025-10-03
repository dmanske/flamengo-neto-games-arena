import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Download, Trash2, Loader2, Calendar, Archive, List, LayoutGrid, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  
  // Novos estados para sistema de abas
  const [activeTab, setActiveTab] = useState<'futuros' | 'passados'>('futuros');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("todos");
  
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

  // JOGOS FUTUROS - incluir viagens com e sem ingressos
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
      const dataJogoNormalizada = new Date(dataJogo).toISOString().split('T')[0];
      const chaveJogo = `${ingresso.adversario.toLowerCase()}-${dataJogoNormalizada}-${ingresso.local_jogo}`;
      
      if (!gruposUnificados[chaveJogo]) {
        let dataJogoCorreta = ingresso.viagem?.data_jogo;
        
        if (!dataJogoCorreta && ingresso.viagem_ingressos_id) {
          const viagemIngressos = viagensIngressos.find(v => v.id === ingresso.viagem_ingressos_id);
          dataJogoCorreta = viagemIngressos?.data_jogo;
        }
        
        if (!dataJogoCorreta) {
          dataJogoCorreta = ingresso.jogo_data;
        }
        
        gruposUnificados[chaveJogo] = {
          adversario: ingresso.adversario,
          jogo_data: dataJogoCorreta,
          local_jogo: ingresso.local_jogo,
          logo_adversario: logosAdversarios[ingresso.adversario] || null,
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
      const dataJogoNormalizada = new Date(viagem.data_jogo).toISOString().split('T')[0];
      const chaveJogo = `${viagem.adversario.toLowerCase()}-${dataJogoNormalizada}-${viagem.local_jogo}`;
      
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
        gruposUnificados[chaveJogo].viagem_ingressos_id = viagem.id;
      }
    });

    // 3. Converter para array e ordenar por data
    return Object.values(gruposUnificados).sort((a: any, b: any) => {
      return new Date(a.jogo_data).getTime() - new Date(b.jogo_data).getTime();
    });
  }, [ingressosFiltrados, logosAdversarios, viagensIngressos]);

  // JOGOS PASSADOS - mesma lógica mas com filtro invertido
  const jogosPassados = useMemo(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const gruposUnificados: Record<string, any> = {};

    // 1. Processar ingressos passados
    const ingressosPassados = ingressosFiltrados.filter(ingresso => {
      const dataJogoString = ingresso.viagem?.data_jogo || ingresso.jogo_data;
      const dataJogo = new Date(dataJogoString);
      return dataJogo < hoje; // Filtro invertido para jogos passados
    });

    ingressosPassados.forEach(ingresso => {
      const dataJogo = ingresso.viagem?.data_jogo || ingresso.jogo_data;
      const dataJogoNormalizada = new Date(dataJogo).toISOString().split('T')[0];
      const chaveJogo = `${ingresso.adversario.toLowerCase()}-${dataJogoNormalizada}-${ingresso.local_jogo}`;
      
      if (!gruposUnificados[chaveJogo]) {
        let dataJogoCorreta = ingresso.viagem?.data_jogo;
        
        if (!dataJogoCorreta && ingresso.viagem_ingressos_id) {
          const viagemIngressos = viagensIngressos.find(v => v.id === ingresso.viagem_ingressos_id);
          dataJogoCorreta = viagemIngressos?.data_jogo;
        }
        
        if (!dataJogoCorreta) {
          dataJogoCorreta = ingresso.jogo_data;
        }
        
        gruposUnificados[chaveJogo] = {
          adversario: ingresso.adversario,
          jogo_data: dataJogoCorreta,
          local_jogo: ingresso.local_jogo,
          logo_adversario: logosAdversarios[ingresso.adversario] || null,
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

    // Converter para array e ordenar por data (mais recentes primeiro)
    return Object.values(gruposUnificados).sort((a: any, b: any) => {
      return new Date(b.jogo_data).getTime() - new Date(a.jogo_data).getTime();
    });
  }, [ingressosFiltrados, logosAdversarios, viagensIngressos]);

  // Função para filtrar jogos por período (baseada na página Viagens)
  const getJogosPorPeriodo = (jogos: any[]) => {
    if (periodoFiltro === "todos") return jogos;

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();

    return jogos.filter(jogo => {
      const dataJogo = new Date(jogo.jogo_data);
      const anoJogo = dataJogo.getFullYear();
      const mesJogo = dataJogo.getMonth();

      switch (periodoFiltro) {
        case "mes_atual":
          return anoJogo === anoAtual && mesJogo === mesAtual;
        case "mes_anterior":
          const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
          const anoMesAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
          return anoJogo === anoMesAnterior && mesJogo === mesAnterior;
        case "ultimos_3_meses":
          const tresMesesAtras = new Date(hoje);
          tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
          return dataJogo >= tresMesesAtras;
        case "ultimos_6_meses":
          const seisMesesAtras = new Date(hoje);
          seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
          return dataJogo >= seisMesesAtras;
        case "ano_atual":
          return anoJogo === anoAtual;
        case "ano_anterior":
          return anoJogo === anoAtual - 1;
        default:
          return true;
      }
    });
  };

  // Função para agrupar jogos por mês (baseada na página Viagens)
  const agruparJogosPorMes = (jogos: any[]) => {
    const grupos: { [key: string]: any[] } = {};
    
    jogos.forEach(jogo => {
      const data = new Date(jogo.jogo_data);
      const chave = format(data, 'yyyy-MM', { locale: ptBR });
      
      if (!grupos[chave]) {
        grupos[chave] = [];
      }
      grupos[chave].push(jogo);
    });

    // Ordenar por data (mais recente primeiro)
    const chavesOrdenadas = Object.keys(grupos).sort((a, b) => b.localeCompare(a));
    
    return chavesOrdenadas.map(chave => ({
      chave,
      mesAno: format(new Date(chave + '-01'), 'MMMM yyyy', { locale: ptBR }),
      jogos: grupos[chave].sort((a, b) => new Date(b.jogo_data).getTime() - new Date(a.jogo_data).getTime())
    }));
  };

  // Aplicar filtros de período aos jogos passados
  const jogosPassadosFiltrados = useMemo(() => {
    return getJogosPorPeriodo(jogosPassados);
  }, [jogosPassados, periodoFiltro]);

  // Função para obter ingressos de um jogo específico
  const getIngressosDoJogo = (jogo: any) => {
    // Se o jogo já tem os ingressos (vem do agrupamento), usar eles
    if (jogo.ingressos && Array.isArray(jogo.ingressos)) {
      return jogo.ingressos;
    }

    // Senão, buscar pelos critérios (mesma lógica do agrupamento)
    return ingressosFiltrados.filter(ingresso => {
      const dataJogoIngresso = ingresso.viagem?.data_jogo || ingresso.jogo_data;
      const dataIngressoNormalizada = new Date(dataJogoIngresso).toISOString().split('T')[0];
      const dataJogoNormalizada = new Date(jogo.jogo_data).toISOString().split('T')[0];
      
      return (
        ingresso.adversario.toLowerCase() === jogo.adversario.toLowerCase() &&
        dataIngressoNormalizada === dataJogoNormalizada &&
        ingresso.local_jogo === jogo.local_jogo
      );
    });
  };

  // Função para deletar ingresso
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
    setIngressoSelecionado(null);
    setJogoSelecionadoParaIngresso(jogo);
    setModalFormAberto(true);
  };

  // Função para exportar PDF de um jogo específico
  const handleExportarPDFJogo = (jogo: any) => {
    const ingressosDoJogo = getIngressosDoJogo(jogo);
    
    if (ingressosDoJogo.length === 0) {
      toast.warning('Não há ingressos para exportar neste jogo.');
      return;
    }

    // Definir o jogo selecionado para o relatório
    setJogoSelecionado(jogo);

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
        await toast.promise(
          (async () => {
            const { error: errorIngressos } = await supabase
              .from('ingressos')
              .delete()
              .in('id', ingressosDoJogo.map(ing => ing.id));

            if (errorIngressos) {
              throw new Error('Erro ao deletar ingressos');
            }

            if (jogoParaDeletar.viagem_ingressos_id) {
              const { error: errorViagem } = await supabase
                .from('viagens_ingressos')
                .delete()
                .eq('id', jogoParaDeletar.viagem_ingressos_id);

              if (errorViagem) {
                console.warn('Erro ao deletar viagem de ingressos:', errorViagem);
              }
            }

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
        await toast.promise(
          (async () => {
            const { error } = await supabase
              .from('viagens_ingressos')
              .delete()
              .eq('id', jogoParaDeletar.viagem_ingressos_id);

            if (error) {
              throw new Error('Erro ao deletar viagem');
            }

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

  // Função para formatar data (otimizada com useCallback)
  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  }, []);

  // Função para renderizar jogos (grid ou tabela) - otimizada com useCallback
  const renderJogos = useCallback((jogos: any[], isAgrupado = false) => {
    if (viewMode === 'table') {
      return (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Adversário</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Total Ingressos</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jogos.map((jogo: any) => (
                <TableRow key={`table-${jogo.adversario}-${jogo.jogo_data}-${jogo.local_jogo}`}>
                  <TableCell className="font-medium">{formatDate(jogo.jogo_data)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {jogo.logo_adversario && (
                        <div className="w-6 h-6 flex items-center justify-center">
                          <img
                            src={jogo.logo_adversario}
                            alt={jogo.adversario}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      {jogo.adversario}
                    </div>
                  </TableCell>
                  <TableCell>{jogo.local_jogo === 'casa' ? 'Casa' : 'Fora'}</TableCell>
                  <TableCell>{jogo.total_ingressos}</TableCell>
                  <TableCell>{formatCurrency(jogo.receita_total)}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {jogo.total_ingressos > 0 ? 'Com Ingressos' : 'Sem Ingressos'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerIngressosJogo(jogo)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ver ingressos</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleNovoIngressoJogo(jogo)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Novo ingresso</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExportarPDFJogo(jogo)}
                            className="h-8 w-8 p-0"
                            disabled={jogo.total_ingressos === 0}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Exportar PDF</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletarJogo(jogo)}
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Deletar jogo</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    // Grid view
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jogos.map((jogo: any) => (
          <CleanJogoCard
            key={`grid-${jogo.adversario}-${jogo.jogo_data}-${jogo.local_jogo}`}
            jogo={jogo}
            onVerIngressos={handleVerIngressosJogo}
            onDeletarJogo={handleDeletarJogo}
            onExportarPDF={handleExportarPDFJogo}
            onNovoIngresso={handleNovoIngressoJogo}
          />
        ))}
      </div>
    );
  }, [viewMode, formatDate]);

  return (
    <TooltipProvider>
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
              setIngressoSelecionado(null);
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

        {/* Sistema de Abas */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'futuros' | 'passados')} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="futuros" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Jogos Futuros
            </TabsTrigger>
            <TabsTrigger value="passados" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Jogos Passados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="futuros">
            {/* Cards de Resumo - apenas na aba futuros */}
            {resumoFinanceiro && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

                <div className="flex border rounded-md shadow-sm">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        className="rounded-r-none"
                        onClick={() => setViewMode('table')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Visualização em tabela</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        className="rounded-l-none"
                        onClick={() => setViewMode('grid')}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Visualização em cards</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
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
                  </div>
                ) : (
                  renderJogos(jogosComIngressos)
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="passados">
            {/* Filtros e Busca para Jogos Passados */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
                  value={periodoFiltro}
                  onValueChange={setPeriodoFiltro}
                >
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 z-50">
                    <SelectItem value="todos" className="bg-white text-gray-900 hover:bg-gray-50">Todos os períodos</SelectItem>
                    <SelectItem value="mes_atual" className="bg-white text-gray-900 hover:bg-gray-50">Mês atual</SelectItem>
                    <SelectItem value="mes_anterior" className="bg-white text-gray-900 hover:bg-gray-50">Mês anterior</SelectItem>
                    <SelectItem value="ultimos_3_meses" className="bg-white text-gray-900 hover:bg-gray-50">Últimos 3 meses</SelectItem>
                    <SelectItem value="ultimos_6_meses" className="bg-white text-gray-900 hover:bg-gray-50">Últimos 6 meses</SelectItem>
                    <SelectItem value="ano_atual" className="bg-white text-gray-900 hover:bg-gray-50">Ano atual</SelectItem>
                    <SelectItem value="ano_anterior" className="bg-white text-gray-900 hover:bg-gray-50">Ano anterior</SelectItem>
                  </SelectContent>
                </Select>

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

                <div className="flex border rounded-md shadow-sm">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        className="rounded-r-none"
                        onClick={() => setViewMode('table')}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Visualização em tabela</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        className="rounded-l-none"
                        onClick={() => setViewMode('grid')}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Visualização em cards</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>

            {/* Cards de Jogos Passados */}
            {jogosPassadosFiltrados.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Jogos Passados ({jogosPassadosFiltrados.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!busca ? (
                    // Agrupado por mês quando não há busca
                    <div className="space-y-6">
                      {agruparJogosPorMes(jogosPassadosFiltrados).map(grupo => (
                        <div key={grupo.chave}>
                          <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
                            {grupo.mesAno} ({grupo.jogos.length} jogos)
                          </h3>
                          {renderJogos(grupo.jogos, true)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Lista simples quando há busca
                    renderJogos(jogosPassadosFiltrados)
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8 text-muted-foreground">
                  <span className="text-4xl mb-4 block">📊</span>
                  <p>Nenhum jogo passado encontrado</p>
                  <p className="text-sm">
                    {busca ? 'Tente ajustar os filtros de busca' : 'Não há jogos passados no período selecionado'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Modais - mantidos no final */}
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

        {/* Componente de relatório PDF (invisível) */}
        <div style={{ display: 'none' }}>
          <IngressosReport
            ref={reportRef}
            jogoInfo={jogoSelecionado || {
              adversario: '',
              jogo_data: '',
              local_jogo: 'casa',
              total_ingressos: 0
            }}
            ingressos={jogoSelecionado ? getIngressosDoJogo(jogoSelecionado) : []}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}