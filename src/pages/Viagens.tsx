import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Search, Trash2, Pencil, Eye, PlusCircle, List, LayoutGrid, CalendarCheck, Archive } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { CleanViagemCard } from "@/components/viagens/CleanViagemCard";
import { useMultiplePassageirosCount } from "@/hooks/usePassageirosCount";

interface Viagem {
  id: string;
  data_jogo: string;
  adversario: string;
  rota: string;
  // Novos campos do sistema avançado de pagamento
  tipo_pagamento?: 'livre' | 'parcelado_flexivel' | 'parcelado_obrigatorio';
  exige_pagamento_completo?: boolean;
  dias_antecedencia?: number;
  permite_viagem_com_pendencia?: boolean;
  // Passeios relacionados
  viagem_passeios?: Array<{
    passeio_id: string;
    passeios: {
      nome: string;
      valor: number;
      categoria: string;
    };
  }>;
  valor_padrao: number | null;
  empresa: string;
  tipo_onibus: string;
  status_viagem: string;
  logo_flamengo: string | null;
  logo_adversario: string | null;
  capacidade_onibus: number;
}

const Viagens = () => {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viagemToDelete, setViagemToDelete] = useState<Viagem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activeTab, setActiveTab] = useState<'ativas' | 'em_andamento' | 'historico'>('ativas');
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("todos");
  const navigate = useNavigate();

  // Fetch viagens
  useEffect(() => {
    fetchViagens();
  }, []);

  const fetchViagens = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('viagens')
        .select(`
          *,
          viagem_passeios (
            passeio_id,
            passeios (
              nome,
              valor,
              categoria
            )
          )
        `)
        .order('data_jogo', { ascending: true });

      if (error) {
        throw error;
      }

      console.log(`Viagens carregadas do servidor: ${data?.length || 0}`);
      console.log('IDs das viagens:', data?.map(v => `${v.id} - ${v.adversario}`) || []);

      setViagens(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar viagens:', error);
      toast.error("Erro ao carregar dados das viagens");
    } finally {
      setLoading(false);
    }
  };

  // Função de teste para debug (você pode chamar no console do navegador)
  (window as any).testDeleteViagem = async (viagemId: string) => {
    console.log(`Testando exclusão da viagem: ${viagemId}`);

    const { error } = await supabase.rpc('delete_viagem', { viagem_id: viagemId });

    if (error) {
      console.error('Erro na exclusão:', error);
      return false;
    }

    console.log('Exclusão executada, verificando...');

    const { data } = await supabase
      .from('viagens')
      .select('id, adversario')
      .eq('id', viagemId);

    console.log(`Viagem ainda existe no banco: ${data && data.length > 0}`);

    return data && data.length === 0;
  };

  // Buscar contagem de passageiros para cada viagem
  const { passageirosCount } = useMultiplePassageirosCount(
    viagens.map(viagem => viagem.id)
  );

  // Separar viagens por status
  const viagensAtivas = viagens.filter(viagem =>
    viagem.status_viagem === 'Aberta' || viagem.status_viagem === 'Fechada'
  );

  const viagensEmAndamento = viagens.filter(viagem =>
    viagem.status_viagem === 'Em andamento'
  );

  const viagensHistoricas = viagens.filter(viagem =>
    viagem.status_viagem === 'Concluída' || viagem.status_viagem === 'Cancelada' || viagem.status_viagem === 'Finalizada'
  );

  // Filtrar viagens históricas por período
  const getViagensPorPeriodo = (viagens: Viagem[]) => {
    if (periodoFiltro === "todos") return viagens;

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth();

    return viagens.filter(viagem => {
      const dataJogo = new Date(viagem.data_jogo);
      const anoViagem = dataJogo.getFullYear();
      const mesViagem = dataJogo.getMonth();

      switch (periodoFiltro) {
        case "mes_atual":
          return anoViagem === anoAtual && mesViagem === mesAtual;
        case "mes_anterior":
          const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
          const anoMesAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;
          return anoViagem === anoMesAnterior && mesViagem === mesAnterior;
        case "ultimos_3_meses":
          const tresMesesAtras = new Date(hoje);
          tresMesesAtras.setMonth(tresMesesAtras.getMonth() - 3);
          return dataJogo >= tresMesesAtras;
        case "ultimos_6_meses":
          const seisMesesAtras = new Date(hoje);
          seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
          return dataJogo >= seisMesesAtras;
        case "ano_atual":
          return anoViagem === anoAtual;
        case "ano_anterior":
          return anoViagem === anoAtual - 1;
        default:
          return true;
      }
    });
  };

  // Apply filters - busca global em todos os campos
  const filterViagens = (viagensList: Viagem[]) => {
    if (!searchTerm) return viagensList;

    const term = searchTerm.toLowerCase();

    return viagensList.filter((viagem) => {
      // Busca por adversário/time
      const adversarioMatch = viagem.adversario?.toLowerCase().includes(term) || false;
      
      // Busca por rota/cidade
      const rotaMatch = viagem.rota?.toLowerCase().includes(term) || false;
      
      // Busca por empresa
      const empresaMatch = viagem.empresa?.toLowerCase().includes(term) || false;
      
      // Busca por tipo de ônibus
      const tipoOnibusMatch = viagem.tipo_onibus?.toLowerCase().includes(term) || false;
      
      // Busca por status
      const statusMatch = viagem.status_viagem?.toLowerCase().includes(term) || false;
      
      // Busca por data (múltiplos formatos)
      let dataMatch = false;
      try {
        const dataJogo = new Date(viagem.data_jogo);
        const formattedDate = format(dataJogo, 'dd/MM/yyyy', { locale: ptBR });
        const formattedDateShort = format(dataJogo, 'dd/MM', { locale: ptBR });
        const monthYear = format(dataJogo, 'MM/yyyy', { locale: ptBR });
        const year = format(dataJogo, 'yyyy', { locale: ptBR });
        const monthName = format(dataJogo, 'MMMM', { locale: ptBR });
        
        dataMatch = formattedDate.includes(term) || 
                   formattedDateShort.includes(term) ||
                   monthYear.includes(term) ||
                   year.includes(term) ||
                   monthName.toLowerCase().includes(term);
      } catch (dateError) {
        dataMatch = false;
      }
      
      // Busca por valor (se o termo for numérico)
      let valorMatch = false;
      if (viagem.valor_padrao && !isNaN(Number(term))) {
        const valorString = viagem.valor_padrao.toString();
        valorMatch = valorString.includes(term);
      }

      return adversarioMatch || rotaMatch || empresaMatch || tipoOnibusMatch || 
             statusMatch || dataMatch || valorMatch;
    });
  };

  // Se há busca ativa, buscar em todas as viagens
  const todasViagensFiltradas = searchTerm ? filterViagens(viagens) : [];
  
  const viagensAtivasFiltradas = filterViagens(viagensAtivas);
  const viagensEmAndamentoFiltradas = filterViagens(viagensEmAndamento);
  const viagensHistoricasFiltradas = filterViagens(getViagensPorPeriodo(viagensHistoricas));

  // Delete viagem
  const handleDeleteViagem = async () => {
    if (!viagemToDelete) return;

    const viagemId = viagemToDelete.id;
    const viagemNome = viagemToDelete.adversario;

    try {
      setIsDeleting(true);

      console.log(`Iniciando exclusão da viagem: ${viagemId} - ${viagemNome}`);

      // Usar a função RPC delete_viagem para garantir exclusão em cascata
      const { error } = await supabase
        .rpc('delete_viagem', { viagem_id: viagemId });

      if (error) {
        throw error;
      }

      console.log(`Viagem excluída com sucesso no banco: ${viagemId}`);

      // Verificar se a viagem ainda existe no banco
      const { data: verificacao, error: errorVerificacao } = await supabase
        .from('viagens')
        .select('id')
        .eq('id', viagemId);

      if (errorVerificacao) {
        console.error('Erro ao verificar exclusão:', errorVerificacao);
      } else {
        console.log(`Verificação pós-exclusão - viagens encontradas:`, verificacao?.length || 0);
      }

      // Aguardar um pouco antes de recarregar para garantir que a transação foi commitada
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Recarregar a lista de viagens do servidor para garantir sincronização
      console.log('Recarregando lista de viagens...');
      await fetchViagens();

      // Verificar se a viagem ainda aparece na lista local
      const viagemAindaExiste = viagens.some(v => v.id === viagemId);
      console.log(`Viagem ainda existe na lista local após reload: ${viagemAindaExiste}`);

      toast.success(`Viagem contra ${viagemNome} removida com sucesso`);
      setViagemToDelete(null);
    } catch (err: any) {
      console.error('Erro ao excluir viagem:', err);
      toast.error(`Erro ao excluir viagem: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Format value
  const formatValue = (value: number | null) => {
    if (value === null) return 'N/A';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aberta':
        return 'text-green-700 bg-green-100';
      case 'fechada':
        return 'text-red-700 bg-red-100';
      case 'concluída':
      case 'finalizada':
        return 'text-blue-700 bg-blue-100';
      case 'cancelada':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'em andamento':
        return 'text-amber-700 bg-amber-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  // Agrupar viagens por mês para o histórico
  const agruparViagensPorMes = (viagens: Viagem[]) => {
    const grupos: { [key: string]: Viagem[] } = {};
    
    viagens.forEach(viagem => {
      const data = new Date(viagem.data_jogo);
      const chave = format(data, 'yyyy-MM', { locale: ptBR });
      const mesAno = format(data, 'MMMM yyyy', { locale: ptBR });
      
      if (!grupos[chave]) {
        grupos[chave] = [];
      }
      grupos[chave].push(viagem);
    });

    // Ordenar por data (mais recente primeiro)
    const chavesOrdenadas = Object.keys(grupos).sort((a, b) => b.localeCompare(a));
    
    return chavesOrdenadas.map(chave => ({
      chave,
      mesAno: format(new Date(chave + '-01'), 'MMMM yyyy', { locale: ptBR }),
      viagens: grupos[chave].sort((a, b) => new Date(b.data_jogo).getTime() - new Date(a.data_jogo).getTime())
    }));
  };

  const renderViagensContent = (viagensList: Viagem[], isHistorico = false) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando viagens...</span>
        </div>
      );
    }

    if (viagensList.length === 0) {
      return (
        <div className="py-8 text-center">
          {searchTerm ? (
            <p className="text-gray-500">Nenhuma viagem encontrada com esses critérios de busca.</p>
          ) : (
            <p className="text-gray-500">Nenhuma viagem encontrada.</p>
          )}
        </div>
      );
    }

    // Para histórico, agrupar por mês se não houver busca ativa
    if (isHistorico && !searchTerm) {
      const gruposPorMes = agruparViagensPorMes(viagensList);
      
      if (viewMode === 'table') {
        return (
          <div className="space-y-6">
            {gruposPorMes.map(grupo => (
              <div key={grupo.chave}>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
                  {grupo.mesAno} ({grupo.viagens.length} viagens)
                </h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Adversário</TableHead>
                        <TableHead>Rota</TableHead>
                        <TableHead>Valor Padrão</TableHead>
                        <TableHead>Ocupação</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grupo.viagens.map((viagem) => (
                        <TableRow key={viagem.id}>
                          <TableCell className="font-medium">{formatDate(viagem.data_jogo)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {viagem.logo_adversario && (
                                <div className="w-6 h-6 flex items-center justify-center">
                                  <img
                                    src={viagem.logo_adversario}
                                    alt={viagem.adversario}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              )}
                              {viagem.adversario}
                            </div>
                          </TableCell>
                          <TableCell>{viagem.rota}</TableCell>
                          <TableCell>{formatValue(viagem.valor_padrao)}</TableCell>
                          <TableCell>
                            {passageirosCount[viagem.id] || 0}/{viagem.capacidade_onibus}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viagem.status_viagem)}`}>
                              {viagem.status_viagem}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" variant="outline" asChild>
                                    <Link to={`/dashboard/viagem/${viagem.id}`}>
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ver detalhes da viagem</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button size="sm" variant="outline" asChild>
                                    <Link to={`/dashboard/viagem/${viagem.id}/editar`}>
                                      <Pencil className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Editar viagem</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setViagemToDelete(viagem)}
                                    className="text-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Excluir viagem</p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        );
      }

      // Grid view agrupado por mês
      return (
        <div className="space-y-6">
          {gruposPorMes.map(grupo => (
            <div key={grupo.chave}>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 capitalize">
                {grupo.mesAno} ({grupo.viagens.length} viagens)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {grupo.viagens.map((viagem) => (
                  <CleanViagemCard
                    key={viagem.id}
                    viagem={viagem}
                    passageirosCount={passageirosCount[viagem.id] || 0}
                    onDeleteClick={(v) => setViagemToDelete(v)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Visualização normal (não agrupada)
    if (viewMode === 'table') {
      return (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Adversário</TableHead>
                <TableHead>Rota</TableHead>
                <TableHead>Valor Padrão</TableHead>
                <TableHead>Ocupação</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {viagensList.map((viagem) => (
                <TableRow key={viagem.id}>
                  <TableCell className="font-medium">{formatDate(viagem.data_jogo)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {viagem.logo_adversario && (
                        <div className="w-6 h-6 flex items-center justify-center">
                          <img
                            src={viagem.logo_adversario}
                            alt={viagem.adversario}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      {viagem.adversario}
                    </div>
                  </TableCell>
                  <TableCell>{viagem.rota}</TableCell>
                  <TableCell>{formatValue(viagem.valor_padrao)}</TableCell>
                  <TableCell>
                    {passageirosCount[viagem.id] || 0}/{viagem.capacidade_onibus}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(viagem.status_viagem)}`}>
                      {viagem.status_viagem}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/dashboard/viagem/${viagem.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ver detalhes da viagem</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/dashboard/viagem/${viagem.id}/editar`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar viagem</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViagemToDelete(viagem)}
                            className="text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Excluir viagem</p>
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

    // Grid view normal
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {viagensList.map((viagem) => (
          <CleanViagemCard
            key={viagem.id}
            viagem={viagem}
            passageirosCount={passageirosCount[viagem.id] || 0}
            onDeleteClick={(v) => setViagemToDelete(v)}
          />
        ))}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
        <div className="container py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Viagens</h1>
            <Button
              onClick={() => navigate("/dashboard/cadastrar-viagem")}
              className="bg-primary hover:bg-primary/90"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Viagem
            </Button>
          </div>

          <Tabs defaultValue="ativas" className="w-full" onValueChange={(value) => setActiveTab(value as 'ativas' | 'em_andamento' | 'historico')}>
            <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
              <TabsTrigger value="ativas" className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4" />
                Ativas
              </TabsTrigger>
              <TabsTrigger value="em_andamento" className="flex items-center gap-2">
                <Loader2 className="h-4 w-4" />
                Em Andamento
              </TabsTrigger>
              <TabsTrigger value="historico" className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-start">
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por time, cidade, data, empresa, status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>

                {activeTab === 'historico' && (
                  <Select
                    value={periodoFiltro}
                    onValueChange={setPeriodoFiltro}
                  >
                    <SelectTrigger className="w-full md:w-[180px] bg-white">
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
                )}

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

            <TabsContent value="ativas">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarCheck className="h-5 w-5" />
                    {searchTerm ? `Resultados da Busca (${todasViagensFiltradas.length})` : `Viagens Ativas (${viagensAtivasFiltradas.length})`}
                  </CardTitle>
                  {searchTerm && (
                    <p className="text-sm text-gray-600">
                      Buscando por "{searchTerm}" em todas as viagens
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {renderViagensContent(searchTerm ? todasViagensFiltradas : viagensAtivasFiltradas, false)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="em_andamento">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 text-amber-600" />
                    {searchTerm ? `Resultados da Busca (${todasViagensFiltradas.length})` : `Viagens Em Andamento (${viagensEmAndamentoFiltradas.length})`}
                  </CardTitle>
                  {searchTerm && (
                    <p className="text-sm text-gray-600">
                      Buscando por "{searchTerm}" em todas as viagens
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {renderViagensContent(searchTerm ? todasViagensFiltradas : viagensEmAndamentoFiltradas, false)}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historico">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="h-5 w-5" />
                    {searchTerm ? `Resultados da Busca (${todasViagensFiltradas.length})` : `Histórico de Viagens (${viagensHistoricasFiltradas.length})`}
                  </CardTitle>
                  {searchTerm && (
                    <p className="text-sm text-gray-600">
                      Buscando por "{searchTerm}" em todas as viagens
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  {renderViagensContent(searchTerm ? todasViagensFiltradas : viagensHistoricasFiltradas, true)}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* AlertDialog para confirmação de exclusão */}
          <AlertDialog open={!!viagemToDelete} onOpenChange={(open) => {
            if (!open) setViagemToDelete(null);
          }}>
            <AlertDialogContent className="bg-white">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir a viagem contra {viagemToDelete?.adversario}? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="hover:text-gray-700">Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteViagem}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    'Excluir'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Viagens;