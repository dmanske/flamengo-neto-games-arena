import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, CheckCircle, Clock, AlertCircle, Camera, Filter, Search, MapPin, Ticket, TrendingUp, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QRScanner } from '@/components/qr-scanner/QRScanner';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCPF, formatPhone } from '@/utils/formatters';

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  status_viagem: string;
  logo_flamengo?: string;
  logo_adversario?: string;
  nome_estadio?: string;
  local_jogo?: string;
}

interface Onibus {
  id: string;
  numero_identificacao: string;
  tipo_onibus: string;
  empresa: string;
}

interface Passageiro {
  id: string;
  viagem_passageiro_id: string;
  nome: string;
  telefone: string;
  cpf: string;
  cidade_embarque: string;
  setor_maracana: string;
  status_presenca: 'pendente' | 'presente' | 'ausente';
  status_pagamento: string;
  valor: number;
  desconto: number;
  is_responsavel_onibus: boolean;
  pago_por_credito?: boolean;
  credito_origem_id?: string | null;
  valor_credito_utilizado?: number;
  passeios: Array<{
    passeio_nome: string;
    status: string;
    valor_cobrado?: number;
  }>;
  historico_pagamentos?: Array<{
    id: string;
    categoria: 'viagem' | 'passeios' | 'ambos';
    valor_pago: number;
    forma_pagamento: string;
    data_pagamento: string;
    observacoes?: string;
  }>;
}

const ScannerPresencaPublico = () => {
  const { viagemId, onibusId } = useParams<{ viagemId: string; onibusId: string }>();
  const [viagem, setViagem] = useState<Viagem | null>(null);
  const [onibus, setOnibus] = useState<Onibus | null>(null);
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmacoes, setConfirmacoes] = useState<any[]>([]);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCidade, setFiltroCidade] = useState<string>("todas");
  const [filtroSetor, setFiltroSetor] = useState<string>("todos");
  const [filtroPasseio, setFiltroPasseio] = useState<string>("todos");
  
  // Debounce para busca
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // Configuração do time (hardcoded para Flamengo)
  const time = "Flamengo";
  const logoUrl = viagem?.logo_flamengo;

  useEffect(() => {
    if (viagemId && onibusId) {
      loadData();
    }
  }, [viagemId, onibusId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Buscar dados da viagem
      const { data: viagemData, error: viagemError } = await supabase
        .from('viagens')
        .select('*')
        .eq('id', viagemId)
        .single();

      if (viagemError) throw viagemError;
      setViagem(viagemData);

      // Buscar dados do ônibus
      const { data: onibusData, error: onibusError } = await supabase
        .from('viagem_onibus')
        .select('*')
        .eq('id', onibusId)
        .single();

      if (onibusError) throw onibusError;
      setOnibus(onibusData);

      // Buscar estatísticas de confirmação
      await loadStats();

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados da viagem');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Buscar passageiros completos do ônibus específico
      const { data, error } = await supabase
        .from('viagem_passageiros')
        .select(`
          id,
          status_presenca,
          status_pagamento,
          valor,
          desconto,
          cidade_embarque,
          setor_maracana,
          is_responsavel_onibus,
          pago_por_credito,
          credito_origem_id,
          valor_credito_utilizado,
          confirmation_method,
          confirmed_at,
          clientes!viagem_passageiros_cliente_id_fkey (
            id,
            nome,
            telefone,
            cpf
          ),
          passageiro_passeios (
            passeio_nome,
            status,
            valor_cobrado
          ),
          historico_pagamentos_categorizado (
            id,
            categoria,
            valor_pago,
            forma_pagamento,
            data_pagamento,
            observacoes
          )
        `)
        .eq('viagem_id', viagemId)
        .eq('onibus_id', onibusId);

      if (error) throw error;

      // Formatar dados dos passageiros
      const passageirosFormatados: Passageiro[] = (data || []).map((item: any) => ({
        id: item.clientes.id,
        viagem_passageiro_id: item.id,
        nome: item.clientes.nome,
        telefone: item.clientes.telefone,
        cpf: item.clientes.cpf,
        cidade_embarque: item.cidade_embarque,
        setor_maracana: item.setor_maracana,
        status_presenca: item.status_presenca || 'pendente',
        status_pagamento: item.status_pagamento || 'Pendente',
        valor: item.valor || 0,
        desconto: item.desconto || 0,
        is_responsavel_onibus: item.is_responsavel_onibus || false,
        pago_por_credito: item.pago_por_credito || false,
        credito_origem_id: item.credito_origem_id,
        valor_credito_utilizado: item.valor_credito_utilizado || 0,
        passeios: item.passageiro_passeios || [],
        historico_pagamentos: item.historico_pagamentos_categorizado || []
      }));

      setPassageiros(passageirosFormatados);

      // Buscar confirmações recentes
      const confirmacaoesRecentes = data
        ?.filter(p => p.status_presenca === 'presente' && p.confirmed_at)
        .sort((a, b) => new Date(b.confirmed_at).getTime() - new Date(a.confirmed_at).getTime())
        .slice(0, 5) || [];

      setConfirmacoes(confirmacaoesRecentes);

    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    }
  };

  const handleScanSuccess = async (result: any) => {
    console.log('✅ Confirmação via scanner público:', result);
    
    // Adicionar à lista de confirmações recentes
    if (result.data) {
      const novaConfirmacao = {
        clientes: { nome: result.data.passageiro.nome },
        confirmed_at: new Date().toISOString(),
        confirmation_method: 'qr_code_responsavel'
      };
      
      setConfirmacoes(prev => [novaConfirmacao, ...prev.slice(0, 4)]);
      
      // Atualizar apenas o passageiro específico no estado local
      setPassageiros(prev => prev.map(p => 
        p.viagem_passageiro_id === result.data.viagem_passageiro_id
          ? { ...p, status_presenca: 'presente' }
          : p
      ));
    }
  };

  const handleScanError = (error: string) => {
    console.error('❌ Erro no scanner público:', error);
  };

  // Função para marcar presença manualmente ao clicar no passageiro
  const handleMarcarPresenca = async (passageiro: Passageiro) => {
    try {
      const novoStatus = passageiro.status_presenca === 'presente' ? 'pendente' : 'presente';
      
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('viagem_passageiros')
        .update({ 
          status_presenca: novoStatus,
          confirmed_at: novoStatus === 'presente' ? new Date().toISOString() : null,
          confirmation_method: novoStatus === 'presente' ? 'manual_responsavel' : null
        })
        .eq('id', passageiro.viagem_passageiro_id);

      if (error) {
        console.error('Erro ao atualizar presença:', error);
        toast.error('Erro ao atualizar presença');
        return;
      }

      // Atualizar estado local
      setPassageiros(prev => prev.map(p => 
        p.viagem_passageiro_id === passageiro.viagem_passageiro_id 
          ? { ...p, status_presenca: novoStatus }
          : p
      ));

      // Mostrar toast de sucesso
      const acao = novoStatus === 'presente' ? 'confirmada' : 'removida';
      toast.success(`Presença ${acao}!`, {
        description: `${passageiro.nome} - presença ${acao} manualmente`
      });

      // Adicionar à lista de confirmações recentes se foi marcado como presente
      if (novoStatus === 'presente') {
        const novaConfirmacao = {
          clientes: { nome: passageiro.nome },
          confirmed_at: new Date().toISOString(),
          confirmation_method: 'manual_responsavel'
        };
        
        setConfirmacoes(prev => [novaConfirmacao, ...prev.slice(0, 4)]);
      }

    } catch (error) {
      console.error('Erro ao marcar presença:', error);
      toast.error('Erro ao marcar presença');
    }
  };

  // Filtrar passageiros
  const passageirosFiltrados = useMemo(() => {
    return passageiros.filter(p => {
      const matchSearch = !debouncedSearchTerm || 
        p.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        p.telefone.includes(debouncedSearchTerm) ||
        p.cpf.includes(debouncedSearchTerm) ||
        p.cidade_embarque.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      
      const matchStatus = filtroStatus === "todos" || p.status_presenca === filtroStatus;
      const matchCidade = filtroCidade === "todas" || p.cidade_embarque === filtroCidade;
      const matchSetor = filtroSetor === "todos" || p.setor_maracana === filtroSetor;
      const matchPasseio = filtroPasseio === "todos" || 
        (filtroPasseio === "com_passeios" && p.passeios && p.passeios.length > 0) ||
        (filtroPasseio === "sem_passeios" && (!p.passeios || p.passeios.length === 0)) ||
        (p.passeios && p.passeios.some(passeio => passeio.passeio_nome === filtroPasseio));
      
      return matchSearch && matchStatus && matchCidade && matchSetor && matchPasseio;
    });
  }, [passageiros, debouncedSearchTerm, filtroStatus, filtroCidade, filtroSetor, filtroPasseio]);

  // Obter listas únicas para os filtros
  const cidadesUnicas = [...new Set(passageiros.map(p => p.cidade_embarque))].sort();
  const setoresUnicos = [...new Set(passageiros.map(p => p.setor_maracana))].sort();
  const passeiosUnicos = [...new Set(
    passageiros
      .flatMap(p => p.passeios || [])
      .map(passeio => passeio.passeio_nome)
  )].sort();

  // Calcular estatísticas detalhadas
  const calcularEstatisticas = () => {
    const total = passageiros.length;
    const presentes = passageiros.filter(p => p.status_presenca === 'presente').length;
    const pendentes = passageiros.filter(p => p.status_presenca === 'pendente').length;
    const ausentes = passageiros.filter(p => p.status_presenca === 'ausente').length;
    
    let pagosCompletos = 0;
    let pendentesFinanceiro = 0;
    let valorTotalPendente = 0;
    let brindes = 0;

    passageiros.forEach(p => {
      const valorViagem = (p.valor || 0) - (p.desconto || 0);
      const valorPasseios = (p.passeios || []).reduce((sum, passeio) => sum + (passeio.valor_cobrado || 0), 0);
      const valorTotal = valorViagem + valorPasseios;

      if (valorTotal === 0) {
        brindes++;
        return;
      }

      const historico = p.historico_pagamentos || [];
      
      let pagoViagem = historico
        .filter(h => h.categoria === 'viagem' || h.categoria === 'ambos')
        .reduce((sum, h) => sum + h.valor_pago, 0);
      
      let pagoPasseios = historico
        .filter(h => h.categoria === 'passeios' || h.categoria === 'ambos')
        .reduce((sum, h) => sum + h.valor_pago, 0);

      // Considerar pagamento via crédito
      if (p.pago_por_credito && p.valor_credito_utilizado) {
        const valorCredito = p.valor_credito_utilizado;
        
        if (valorCredito >= valorViagem) {
          pagoViagem = valorViagem;
          const creditoSobrando = valorCredito - valorViagem;
          if (creditoSobrando > 0) {
            pagoPasseios += Math.min(creditoSobrando, valorPasseios);
          }
        } else {
          pagoViagem += valorCredito;
        }
      }

      const pendenteViagem = Math.max(0, valorViagem - pagoViagem);
      const pendentePasseios = Math.max(0, valorPasseios - pagoPasseios);
      const totalPendente = pendenteViagem + pendentePasseios;
      
      if (totalPendente <= 0.01) {
        pagosCompletos++;
      } else {
        pendentesFinanceiro++;
        valorTotalPendente += totalPendente;
      }
    });

    return {
      total,
      presentes,
      pendentes,
      ausentes,
      pagosCompletos,
      pendentesFinanceiro,
      valorTotalPendente,
      brindes,
      taxa_presenca: total > 0 ? Math.round((presentes / total) * 100) : 0
    };
  };

  const stats = calcularEstatisticas();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!viagem || !onibus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Dados não encontrados</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              A viagem ou ônibus solicitado não foi encontrado.
            </p>
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Melhorado - Informações da Viagem */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="flex items-center gap-2">
                  {/* Logo Flamengo */}
                  {(logoUrl || viagem.logo_flamengo) ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img 
                        src={logoUrl || viagem.logo_flamengo} 
                        alt="Flamengo" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">FLA</span>
                    </div>
                  )}
                  
                  <span className="text-xl font-bold">vs</span>
                  
                  {/* Logo Adversário */}
                  {viagem.logo_adversario ? (
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img 
                        src={viagem.logo_adversario} 
                        alt={viagem.adversario} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-600 w-12 h-12 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">{viagem.adversario.substring(0, 3).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-lg">
                    Flamengo × {viagem.adversario}
                  </h2>
                  <p className="text-muted-foreground">
                    {format(new Date(viagem.data_jogo), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <Badge className="mb-1">
                  {viagem.nome_estadio || "Maracanã"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {viagem.local_jogo || "Rio de Janeiro"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header do Ônibus */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center gap-4 mb-4 md:mb-0">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-blue-900">
                    Ônibus {onibus.numero_identificacao || 'S/N'}
                  </h1>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      {onibus.numero_identificacao || 'S/N'}
                    </Badge>
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      {onibus.empresa}
                    </Badge>
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      {onibus.tipo_onibus}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stats.taxa_presenca}%</div>
                  <div className="text-sm text-blue-700">Taxa de Presença</div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => loadData()}
                  disabled={loading}
                  className="text-xs"
                >
                  {loading ? (
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3 mr-1" />
                  )}
                  Atualizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Estatísticas Detalhadas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center p-4">
              <Users className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.presentes}</p>
                <p className="text-sm text-muted-foreground">Presentes</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <Clock className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.pendentes}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.taxa_presenca}%</p>
                <p className="text-sm text-muted-foreground">Taxa Presença</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💰 Resumo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-2xl font-bold text-green-600">{stats.pagosCompletos}</p>
                <p className="text-sm text-green-700">Pagamentos Completos</p>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-2xl font-bold text-red-600">{stats.pendentesFinanceiro}</p>
                <p className="text-sm text-red-700">Pendências Financeiras</p>
                <p className="text-xs text-red-600 mt-1">R$ {stats.valorTotalPendente.toFixed(2)}</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-2xl font-bold text-purple-600">{stats.brindes}</p>
                <p className="text-sm text-purple-700">Cortesias</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo por Setor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Resumo por Setor do Maracanã
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {setoresUnicos.map(setor => {
                const passageirosSetor = passageiros.filter(p => p.setor_maracana === setor);
                const presentesSetor = passageirosSetor.filter(p => p.status_presenca === 'presente').length;
                const percentualSetor = passageirosSetor.length > 0 ? Math.round((presentesSetor / passageirosSetor.length) * 100) : 0;
                
                return (
                  <div key={setor} className="flex justify-between items-center p-2 rounded bg-gray-50">
                    <span className="font-medium">{setor}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {presentesSetor}/{passageirosSetor.length}
                      </span>
                      <Badge 
                        variant={percentualSetor >= 80 ? "default" : percentualSetor >= 60 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {percentualSetor}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filtros Avançados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros Avançados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Busca */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro por Status */}
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="presente">Presente</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="ausente">Ausente</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro por Cidade */}
              <Select value={filtroCidade} onValueChange={setFiltroCidade}>
                <SelectTrigger>
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as cidades</SelectItem>
                  {cidadesUnicas.map(cidade => (
                    <SelectItem key={cidade} value={cidade}>{cidade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Filtro por Setor */}
              <Select value={filtroSetor} onValueChange={setFiltroSetor}>
                <SelectTrigger>
                  <SelectValue placeholder="Setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os setores</SelectItem>
                  {setoresUnicos.map(setor => (
                    <SelectItem key={setor} value={setor}>{setor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Filtro por Passeio */}
              <Select value={filtroPasseio} onValueChange={setFiltroPasseio}>
                <SelectTrigger>
                  <SelectValue placeholder="Passeios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os passeios</SelectItem>
                  <SelectItem value="com_passeios">Com passeios</SelectItem>
                  <SelectItem value="sem_passeios">Sem passeios</SelectItem>
                  {passeiosUnicos.map(passeio => (
                    <SelectItem key={passeio} value={passeio}>{passeio}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Resumo dos filtros aplicados */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="outline" className="text-xs">
                {passageirosFiltrados.length} de {passageiros.length} passageiros
              </Badge>
              {filtroStatus !== "todos" && (
                <Badge variant="secondary" className="text-xs">
                  Status: {filtroStatus}
                </Badge>
              )}
              {filtroCidade !== "todas" && (
                <Badge variant="secondary" className="text-xs">
                  Cidade: {filtroCidade}
                </Badge>
              )}
              {filtroSetor !== "todos" && (
                <Badge variant="secondary" className="text-xs">
                  Setor: {filtroSetor}
                </Badge>
              )}
              {filtroPasseio !== "todos" && (
                <Badge variant="secondary" className="text-xs">
                  Passeio: {filtroPasseio === "com_passeios" ? "Com passeios" : 
                           filtroPasseio === "sem_passeios" ? "Sem passeios" : filtroPasseio}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grid de Passageiros por Cidade */}
        {Object.entries(
          passageirosFiltrados.reduce((acc, passageiro) => {
            const cidade = passageiro.cidade_embarque || 'Não especificada';
            if (!acc[cidade]) {
              acc[cidade] = [];
            }
            acc[cidade].push(passageiro);
            return acc;
          }, {} as Record<string, Passageiro[]>)
        )
        .sort(([cidadeA], [cidadeB]) => cidadeA.localeCompare(cidadeB))
        .map(([cidade, passageirosCidade], index) => (
          <Card key={cidade}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                {cidade}
                <Badge variant="outline" className="ml-2">
                  {passageirosCidade.length} passageiro{passageirosCidade.length !== 1 ? 's' : ''}
                </Badge>
              </CardTitle>
              {index === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                  <p className="text-sm text-blue-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <strong>💡 Dica:</strong> Clique em qualquer passageiro para marcar/desmarcar presença manualmente
                  </p>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {passageirosCidade
                  .sort((a, b) => a.nome.localeCompare(b.nome))
                  .map((passageiro) => {
                    const isConfirmed = passageiro.status_presenca === 'presente';
                    
                    // Calcular informações financeiras
                    const valorViagem = (passageiro.valor || 0) - (passageiro.desconto || 0);
                    const valorPasseios = (passageiro.passeios || []).reduce((sum, passeio) => sum + (passeio.valor_cobrado || 0), 0);
                    const valorTotal = valorViagem + valorPasseios;

                    const historico = passageiro.historico_pagamentos || [];
                    
                    let pagoViagem = historico
                      .filter(h => h.categoria === 'viagem' || h.categoria === 'ambos')
                      .reduce((sum, h) => sum + h.valor_pago, 0);
                    
                    let pagoPasseios = historico
                      .filter(h => h.categoria === 'passeios' || h.categoria === 'ambos')
                      .reduce((sum, h) => sum + h.valor_pago, 0);

                    // Considerar pagamento via crédito
                    if (passageiro.pago_por_credito && passageiro.valor_credito_utilizado) {
                      const valorCredito = passageiro.valor_credito_utilizado;
                      
                      if (valorCredito >= valorViagem) {
                        pagoViagem = valorViagem;
                        const creditoSobrando = valorCredito - valorViagem;
                        if (creditoSobrando > 0) {
                          pagoPasseios += Math.min(creditoSobrando, valorPasseios);
                        }
                      } else {
                        pagoViagem += valorCredito;
                      }
                    }

                    const pendenteViagem = Math.max(0, valorViagem - pagoViagem);
                    const pendentePasseios = Math.max(0, valorPasseios - pagoPasseios);
                    const totalPendente = pendenteViagem + pendentePasseios;
                    
                    const ehBrinde = valorTotal === 0;
                    const foiPagoViaCredito = passageiro.pago_por_credito && passageiro.valor_credito_utilizado > 0;

                    let statusFinanceiro = '';
                    let corFinanceira = '';
                    
                    if (ehBrinde) {
                      statusFinanceiro = '🎁 Cortesia';
                      corFinanceira = 'text-purple-600 bg-purple-50 border-purple-200';
                    } else if (totalPendente <= 0.01) {
                      statusFinanceiro = `✅ Pago Completo${foiPagoViaCredito ? ' (via Crédito)' : ''}`;
                      corFinanceira = foiPagoViaCredito ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-green-600 bg-green-50 border-green-200';
                    } else {
                      statusFinanceiro = `⚠️ Pendente: R$ ${totalPendente.toFixed(2)}`;
                      corFinanceira = 'text-red-600 bg-red-50 border-red-200';
                    }

                    return (
                      <Card 
                        key={passageiro.viagem_passageiro_id}
                        className={`transition-all duration-200 ${
                          isConfirmed 
                            ? 'border-green-300 bg-green-50 cursor-pointer hover:shadow-md hover:border-green-400' 
                            : 'border-gray-200 bg-white cursor-pointer hover:shadow-md hover:border-blue-300'
                        }`}
                        onClick={() => handleMarcarPresenca(passageiro)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">
                              {passageiro.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-sm truncate">{passageiro.nome}</h3>
                                {passageiro.is_responsavel_onibus && (
                                  <Badge className="text-xs bg-blue-100 text-blue-800">
                                    Responsável
                                  </Badge>
                                )}
                              </div>
                              <div className="space-y-1 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <span>📞</span>
                                  <span>{formatPhone(passageiro.telefone)}</span>
                                </div>
                                <div>CPF: {formatCPF(passageiro.cpf)}</div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Ticket className="h-3 w-3" />
                              <span>{passageiro.setor_maracana}</span>
                            </div>
                          </div>

                          <div className="mb-3">
                            <Badge className={`text-xs w-full justify-center py-1 ${corFinanceira}`}>
                              {statusFinanceiro}
                            </Badge>
                          </div>

                          {passageiro.passeios && passageiro.passeios.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs text-muted-foreground mb-1">Passeios:</div>
                              <div className="flex flex-wrap gap-1">
                                {passageiro.passeios.map((passeio) => (
                                  <Badge 
                                    key={passeio.passeio_nome}
                                    variant="outline"
                                    className="text-xs bg-green-100 text-green-700 border-green-300"
                                  >
                                    {passeio.passeio_nome}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className={`p-2 rounded text-center text-sm font-medium ${
                            isConfirmed 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            <div className="flex items-center justify-center gap-2">
                              {isConfirmed ? (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  Presente
                                </>
                              ) : (
                                <>
                                  <Clock className="h-4 w-4" />
                                  Pendente
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Scanner */}
          <div>
            <QRScanner
              viagemId={viagemId}
              onibusId={onibusId}
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
            />
          </div>

          {/* Confirmações Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Confirmações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {confirmacoes.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma confirmação ainda
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    As confirmações aparecerão aqui em tempo real
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {confirmacoes.map((confirmacao, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">{confirmacao.clientes.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(confirmacao.confirmed_at), "HH:mm:ss", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      
                      <Badge className="bg-green-100 text-green-800">
                        Scanner
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status da Viagem */}
        {viagem.status_viagem !== 'Em andamento' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Atenção:</span>
              </div>
              <p className="text-yellow-700 mt-1">
                Esta viagem não está com status "Em andamento". 
                Algumas funcionalidades podem estar limitadas.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Instruções */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Como usar o scanner:
            </h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Clique em "Iniciar Scanner" para ativar a câmera</li>
              <li>Peça para o passageiro mostrar o QR code na tela do celular</li>
              <li>Aponte a câmera para o QR code até ele ser lido</li>
              <li>A presença será confirmada automaticamente</li>
            </ol>
            
            <div className="mt-3 p-3 bg-white rounded border border-blue-300">
              <p className="text-xs text-blue-700 font-medium">
                💡 Este scanner é específico para o ônibus {onibus.numero_identificacao}. 
                Apenas passageiros deste ônibus podem ter presença confirmada aqui.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScannerPresencaPublico;