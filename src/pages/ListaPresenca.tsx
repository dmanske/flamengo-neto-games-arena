// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, UserCheck, UserX, Search, Bus, Filter, TrendingUp, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCPF, formatPhone } from "@/utils/formatters";

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
  onibus_id: string;
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

interface Onibus {
  id: string;
  numero_identificacao: string;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
}

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  status_viagem: string;
  logo_flamengo: string | null;
  logo_adversario: string | null;
}

const ListaPresenca = () => {
  const { viagemId } = useParams<{ viagemId: string }>();
  const [viagem, setViagem] = useState<Viagem | null>(null);
  const [onibus, setOnibus] = useState<Onibus[]>([]);
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCidade, setFiltroCidade] = useState<string>("todas");
  const [filtroSetor, setFiltroSetor] = useState<string>("todos");
  const [filtroPasseio, setFiltroPasseio] = useState<string>("todos");

  useEffect(() => {
    if (viagemId) {
      fetchDados();
    }
  }, [viagemId]);

  const fetchDados = async () => {
    try {
      setLoading(true);

      // Buscar dados da viagem
      const { data: viagemData, error: viagemError } = await supabase
        .from("viagens")
        .select("id, adversario, data_jogo, status_viagem, logo_flamengo, logo_adversario")
        .eq("id", viagemId)
        .single();

      if (viagemError) throw viagemError;

      // Verificar se a viagem está em andamento
      if (viagemData.status_viagem !== "Em andamento") {
        toast.error("Lista de presença só está disponível para viagens em andamento");
        return;
      }

      setViagem(viagemData);

      // Buscar ônibus da viagem
      const { data: onibusData, error: onibusError } = await supabase
        .from("viagem_onibus")
        .select("*")
        .eq("viagem_id", viagemId)
        .order("numero_identificacao");

      if (onibusError) throw onibusError;
      setOnibus(onibusData || []);

      // Buscar passageiros com dados do cliente e informações financeiras
      const { data: passageirosData, error: passageirosError } = await supabase
        .from("viagem_passageiros")
        .select(`
          id,
          status_presenca,
          status_pagamento,
          valor,
          desconto,
          onibus_id,
          cidade_embarque,
          setor_maracana,
          is_responsavel_onibus,
          pago_por_credito,
          credito_origem_id,
          valor_credito_utilizado,
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
        .eq("viagem_id", viagemId);

      if (passageirosError) throw passageirosError;

      // Formatar dados dos passageiros
      const passageirosFormatados: Passageiro[] = (passageirosData || []).map((item: any) => ({
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
        onibus_id: item.onibus_id,
        is_responsavel_onibus: item.is_responsavel_onibus || false,
        pago_por_credito: item.pago_por_credito || false,
        credito_origem_id: item.credito_origem_id,
        valor_credito_utilizado: item.valor_credito_utilizado || 0,
        passeios: item.passageiro_passeios || [],
        historico_pagamentos: item.historico_pagamentos_categorizado || []
      }));

      setPassageiros(passageirosFormatados);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Erro ao carregar dados da lista de presença");
    } finally {
      setLoading(false);
    }
  };

  const togglePresenca = async (viagemPassageiroId: string, statusAtual: string) => {
    const novoStatus = statusAtual === 'presente' ? 'pendente' : 'presente';
    
    try {
      const { error } = await supabase
        .from("viagem_passageiros")
        .update({ status_presenca: novoStatus })
        .eq("id", viagemPassageiroId);

      if (error) throw error;

      // Atualizar estado local
      setPassageiros(prev => 
        prev.map(p => 
          p.viagem_passageiro_id === viagemPassageiroId 
            ? { ...p, status_presenca: novoStatus as 'pendente' | 'presente' | 'ausente' }
            : p
        )
      );

      toast.success(`Presença ${novoStatus === 'presente' ? 'confirmada' : 'removida'}`);
    } catch (error) {
      console.error("Erro ao atualizar presença:", error);
      toast.error("Erro ao atualizar presença");
    }
  };

  // Função removida: toggleResponsavel
  // Os responsáveis agora só podem ser definidos na tela de detalhes da viagem

  // Filtrar passageiros por busca e filtros
  const passageirosFiltrados = passageiros.filter(p => {
    const matchSearch = !searchTerm || 
      p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.telefone.includes(searchTerm) ||
      p.cpf.includes(searchTerm) ||
      p.cidade_embarque.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = filtroStatus === "todos" || p.status_presenca === filtroStatus;
    const matchCidade = filtroCidade === "todas" || p.cidade_embarque === filtroCidade;
    const matchSetor = filtroSetor === "todos" || p.setor_maracana === filtroSetor;
    const matchPasseio = filtroPasseio === "todos" || 
      (filtroPasseio === "com_passeios" && p.passeios && p.passeios.length > 0) ||
      (filtroPasseio === "sem_passeios" && (!p.passeios || p.passeios.length === 0)) ||
      (p.passeios && p.passeios.some(passeio => passeio.passeio_nome === filtroPasseio));
    
    return matchSearch && matchStatus && matchCidade && matchSetor && matchPasseio;
  });

  // Obter listas únicas para os filtros
  const cidadesUnicas = [...new Set(passageiros.map(p => p.cidade_embarque))].sort();
  const setoresUnicos = [...new Set(passageiros.map(p => p.setor_maracana))].sort();
  
  // Obter lista de passeios únicos
  const passeiosUnicos = [...new Set(
    passageiros
      .flatMap(p => p.passeios || [])
      .map(passeio => passeio.passeio_nome)
  )].sort();

  // Agrupar passageiros por ônibus e depois por cidade de embarque
  const passageirosPorOnibus = passageirosFiltrados.reduce((acc, passageiro) => {
    const onibusId = passageiro.onibus_id || 'sem_onibus';
    if (!acc[onibusId]) {
      acc[onibusId] = {};
    }
    
    const cidade = passageiro.cidade_embarque || 'Não especificada';
    if (!acc[onibusId][cidade]) {
      acc[onibusId][cidade] = [];
    }
    
    acc[onibusId][cidade].push(passageiro);
    return acc;
  }, {} as Record<string, Record<string, Passageiro[]>>);

  // Calcular estatísticas por ônibus
  const getEstatisticas = (passageirosOnibus: Record<string, Passageiro[]>) => {
    const todosPassageiros = Object.values(passageirosOnibus).flat();
    const total = todosPassageiros.length;
    const presentes = todosPassageiros.filter(p => p.status_presenca === 'presente').length;
    const pendentes = todosPassageiros.filter(p => p.status_presenca === 'pendente').length;
    
    // Estatísticas financeiras
    let pagosCompletos = 0;
    let pendentesFinanceiro = 0;
    let valorTotalPendente = 0;
    
    todosPassageiros.forEach(p => {
      const valorViagem = (p.valor || 0) - (p.desconto || 0);
      const valorPasseios = (p.passeios || []).reduce((sum, passeio) => sum + (passeio.valor_cobrado || 0), 0);
      const valorTotal = valorViagem + valorPasseios;
      
      if (valorTotal === 0) return; // Pular brindes
      
      // Calcular valores pagos usando historico_pagamentos_categorizado
      const historico = p.historico_pagamentos || [];
      
      const pagoViagem = historico
        .filter(h => h.categoria === 'viagem' || h.categoria === 'ambos')
        .reduce((sum, h) => sum + h.valor_pago, 0);
      
      const pagoPasseios = historico
        .filter(h => h.categoria === 'passeios' || h.categoria === 'ambos')
        .reduce((sum, h) => sum + h.valor_pago, 0);

      // Calcular pendências reais
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
      pagosCompletos, 
      pendentesFinanceiro, 
      valorTotalPendente 
    };
  };

  // Calcular informações financeiras do passageiro (usando mesma lógica do sistema real)
  const getInfoFinanceira = (passageiro: Passageiro) => {
    const valorViagem = (passageiro.valor || 0) - (passageiro.desconto || 0);
    const valorPasseios = (passageiro.passeios || []).reduce((sum, passeio) => {
      return sum + (passeio.valor_cobrado || 0);
    }, 0);
    const valorTotal = valorViagem + valorPasseios;

    // Calcular valores pagos por categoria usando historico_pagamentos_categorizado
    const historico = passageiro.historico_pagamentos || [];
    
    let pagoViagem = historico
      .filter(h => h.categoria === 'viagem' || h.categoria === 'ambos')
      .reduce((sum, h) => sum + h.valor_pago, 0);
    
    let pagoPasseios = historico
      .filter(h => h.categoria === 'passeios' || h.categoria === 'ambos')
      .reduce((sum, h) => sum + h.valor_pago, 0);

    // ✨ CONSIDERAR PAGAMENTO VIA CRÉDITO
    if (passageiro.pago_por_credito && passageiro.valor_credito_utilizado) {
      const valorCredito = passageiro.valor_credito_utilizado;
      
      // Se o crédito cobriu a viagem completa
      if (valorCredito >= valorViagem) {
        pagoViagem = valorViagem;
        // Se sobrou crédito, aplicar aos passeios
        const creditoSobrando = valorCredito - valorViagem;
        if (creditoSobrando > 0) {
          pagoPasseios += Math.min(creditoSobrando, valorPasseios);
        }
      } else {
        // Crédito parcial, aplicar apenas à viagem
        pagoViagem += valorCredito;
      }
    }

    const totalPago = pagoViagem + pagoPasseios;

    // Calcular pendências
    const pendenteViagem = Math.max(0, valorViagem - pagoViagem);
    const pendentePasseios = Math.max(0, valorPasseios - pagoPasseios);
    const totalPendente = pendenteViagem + pendentePasseios;

    // Verificar se é brinde (valor total = 0)
    const ehBrinde = valorTotal === 0;

    if (ehBrinde) {
      return {
        status: 'brinde',
        texto: '🎁 Cortesia',
        cor: 'text-purple-600 bg-purple-50 border-purple-200'
      };
    }

    // Determinar status baseado nos valores reais pagos
    const foiPagoViaCredito = passageiro.pago_por_credito && passageiro.valor_credito_utilizado > 0;
    const sufixoCredito = foiPagoViaCredito ? ' (via Crédito)' : '';
    
    if (totalPendente <= 0.01) {
      // Pago completo
      return {
        status: 'pago',
        texto: `✅ Pago Completo${sufixoCredito}`,
        cor: foiPagoViaCredito ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-green-600 bg-green-50 border-green-200'
      };
    } else if (pendenteViagem <= 0.01 && pendentePasseios > 0.01) {
      // Só viagem paga
      return {
        status: 'parcial',
        texto: `🎫 Viagem Paga${sufixoCredito} - Passeios: R$ ${pendentePasseios.toFixed(2)}`,
        cor: 'text-blue-600 bg-blue-50 border-blue-200'
      };
    } else if (pendentePasseios <= 0.01 && pendenteViagem > 0.01) {
      // Só passeios pagos
      return {
        status: 'parcial',
        texto: `🎢 Passeios Pagos${sufixoCredito} - Viagem: R$ ${pendenteViagem.toFixed(2)}`,
        cor: 'text-blue-600 bg-blue-50 border-blue-200'
      };
    } else if (totalPago > 0.01) {
      // Pagamento parcial
      const textoCredito = foiPagoViaCredito ? ` (R$ ${passageiro.valor_credito_utilizado.toFixed(2)} via Crédito)` : '';
      return {
        status: 'parcial',
        texto: `💳 Pago: R$ ${totalPago.toFixed(2)}${textoCredito} - Pendente: R$ ${totalPendente.toFixed(2)}`,
        cor: 'text-orange-600 bg-orange-50 border-orange-200'
      };
    } else {
      // Nada pago (mas pode ter crédito aplicado)
      if (foiPagoViaCredito) {
        return {
          status: 'parcial',
          texto: `💳 Crédito: R$ ${passageiro.valor_credito_utilizado.toFixed(2)} - Pendente: R$ ${totalPendente.toFixed(2)}`,
          cor: 'text-blue-600 bg-blue-50 border-blue-200'
        };
      } else {
        return {
          status: 'pendente',
          texto: `⚠️ Pendente: R$ ${totalPendente.toFixed(2)}`,
          cor: 'text-red-600 bg-red-50 border-red-200'
        };
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!viagem) {
    return (
      <div className="container py-6">
        <h1 className="text-3xl font-bold mb-6">Viagem não encontrada</h1>
        <Button asChild>
          <Link to="/dashboard/viagens">Voltar para Viagens</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Botão Voltar */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/dashboard/viagens">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      {/* Informações do Jogo */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="flex items-center gap-2">
                {viagem.logo_flamengo ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img 
                      src={viagem.logo_flamengo} 
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
                {viagem.logo_adversario ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img 
                      src={viagem.logo_adversario} 
                      alt={viagem.adversario} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-200 w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="font-bold">{viagem.adversario.substring(0, 3).toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-bold text-lg">{viagem.adversario}</h2>
                <p className="text-muted-foreground">
                  {format(new Date(viagem.data_jogo), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <Badge className="mb-1">Maracanã</Badge>
              <span className="text-sm text-muted-foreground">Rio de Janeiro, RJ</span>
            </div>
          </div>
          
          {/* Título da Lista de Presença */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h1 className="text-3xl font-bold">Lista de Presença</h1>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center p-4">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{passageiros.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <UserCheck className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{passageiros.filter(p => p.status_presenca === 'presente').length}</p>
              <p className="text-sm text-muted-foreground">Presentes</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <UserX className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">{passageiros.filter(p => p.status_presenca === 'pendente').length}</p>
              <p className="text-sm text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-2xl font-bold">
                {passageiros.length > 0 ? Math.round((passageiros.filter(p => p.status_presenca === 'presente').length / passageiros.length) * 100) : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Taxa Presença</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo Financeiro */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💰 Resumo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(() => {
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

                // Calcular valores pagos usando historico_pagamentos_categorizado
                const historico = p.historico_pagamentos || [];
                
                const pagoViagem = historico
                  .filter(h => h.categoria === 'viagem' || h.categoria === 'ambos')
                  .reduce((sum, h) => sum + h.valor_pago, 0);
                
                const pagoPasseios = historico
                  .filter(h => h.categoria === 'passeios' || h.categoria === 'ambos')
                  .reduce((sum, h) => sum + h.valor_pago, 0);

                // Calcular pendências reais
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

              return (
                <>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-2xl font-bold text-green-600">{pagosCompletos}</p>
                    <p className="text-sm text-green-700">Pagamentos Completos</p>
                  </div>
                  
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-2xl font-bold text-red-600">{pendentesFinanceiro}</p>
                    <p className="text-sm text-red-700">Pendências Financeiras</p>
                    <p className="text-xs text-red-600 mt-1">R$ {valorTotalPendente.toFixed(2)}</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-2xl font-bold text-purple-600">{brindes}</p>
                    <p className="text-sm text-purple-700">Cortesias</p>
                  </div>
                </>
              );
            })()}
          </div>
        </CardContent>
      </Card>
      
      {/* Responsáveis por Ônibus */}
      {passageiros.filter(p => p.is_responsavel_onibus).length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bus className="h-5 w-5" />
              Responsáveis por Ônibus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {passageiros
                .filter(p => p.is_responsavel_onibus)
                .sort((a, b) => a.nome.localeCompare(b.nome))
                .map((responsavel) => (
                  <div
                    key={responsavel.viagem_passageiro_id}
                    className="p-3 rounded-lg border border-blue-200 bg-blue-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-sm font-semibold">
                        {responsavel.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{responsavel.nome}</p>
                        <p className="text-xs text-muted-foreground">{responsavel.cidade_embarque}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Responsável
                    </Badge>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Resumo por Cidade e Setor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Resumo por Cidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cidadesUnicas.map(cidade => {
                const passageirosCidade = passageiros.filter(p => p.cidade_embarque === cidade);
                const presentesCidade = passageirosCidade.filter(p => p.status_presenca === 'presente').length;
                const percentualCidade = passageirosCidade.length > 0 ? Math.round((presentesCidade / passageirosCidade.length) * 100) : 0;
                
                return (
                  <div key={cidade} className="flex justify-between items-center p-2 rounded bg-gray-50">
                    <span className="font-medium">{cidade}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {presentesCidade}/{passageirosCidade.length}
                      </span>
                      <Badge 
                        variant={percentualCidade >= 80 ? "default" : percentualCidade >= 60 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {percentualCidade}%
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Resumo por Setor
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
      </div>

      {/* Lista por ônibus */}
      <div className="space-y-6">
        {onibus.map((onibusItem) => {
          const passageirosOnibus = passageirosPorOnibus[onibusItem.id] || {};
          const stats = getEstatisticas(passageirosOnibus);
          
          return (
            <Card key={onibusItem.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bus className="h-5 w-5" />
                    <span>{onibusItem.numero_identificacao || `${onibusItem.tipo_onibus} - ${onibusItem.empresa}`}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      Total: {stats.total}
                    </Badge>
                    <Badge className="bg-green-100 text-green-700">
                      Presentes: {stats.presentes}
                    </Badge>
                    <Badge className="bg-orange-100 text-orange-700">
                      Pendentes: {stats.pendentes}
                    </Badge>
                    <Badge className="bg-green-100 text-green-700">
                      💰 Pagos: {stats.pagosCompletos}
                    </Badge>
                    {stats.pendentesFinanceiro > 0 && (
                      <Badge className="bg-red-100 text-red-700">
                        💳 Pendentes: {stats.pendentesFinanceiro} (R$ {stats.valorTotalPendente.toFixed(2)})
                      </Badge>
                    )}
                  </div>
                </CardTitle>
                
                {/* Responsáveis do ônibus */}
                {passageiros.filter(p => p.is_responsavel_onibus && p.onibus_id === onibusItem.id).length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Responsáveis:</span>
                    {passageiros
                      .filter(p => p.is_responsavel_onibus && p.onibus_id === onibusItem.id)
                      .map(responsavel => (
                        <Badge 
                          key={responsavel.viagem_passageiro_id} 
                          className="bg-blue-100 text-blue-800"
                        >
                          {responsavel.nome.split(' ')[0]}
                        </Badge>
                      ))
                    }
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {/* Organizar por cidade de embarque */}
                <div className="space-y-6">
                  {Object.entries(passageirosOnibus)
                    .sort(([cidadeA], [cidadeB]) => cidadeA.localeCompare(cidadeB))
                    .map(([cidade, passageirosCidade]) => (
                    <div key={cidade} className="space-y-3">
                      <div className="flex items-center gap-2 border-b pb-2">
                        <h4 className="font-semibold text-lg">{cidade}</h4>
                        <Badge variant="outline">
                          {passageirosCidade.length} passageiro{passageirosCidade.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {passageirosCidade
                          .sort((a, b) => a.nome.localeCompare(b.nome))
                          .map((passageiro) => (
                          <div
                            key={passageiro.viagem_passageiro_id}
                            className={`p-4 rounded-lg border transition-all duration-200 ${
                              passageiro.status_presenca === 'presente'
                                ? "bg-green-50 border-green-200"
                                : "bg-gray-50 border-gray-200"
                            } ${passageiro.is_responsavel_onibus ? "ring-2 ring-blue-500" : ""}`}
                          >
                            <div className="flex items-start justify-between w-full">
                              <div 
                                className="flex items-center gap-3 w-full cursor-pointer hover:opacity-80"
                                onClick={() => togglePresenca(passageiro.viagem_passageiro_id, passageiro.status_presenca)}
                              >
                                {passageiro.status_presenca === 'presente' ? (
                                  <UserCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
                                ) : (
                                  <Users className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                )}
                                <div className="w-full">
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm">{passageiro.nome}</p>
                                    {passageiro.is_responsavel_onibus && (
                                      <Badge className="text-xs bg-blue-100 text-blue-800">
                                        Responsável do ônibus
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground space-y-1">
                                    <p>CPF: {formatCPF(passageiro.cpf)}</p>
                                    <p>Telefone: {formatPhone(passageiro.telefone)}</p>
                                    <p>Setor: {passageiro.setor_maracana}</p>
                                    {/* Informações de Crédito */}
                                    {passageiro.pago_por_credito && (
                                      <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1">
                                        <span>💳</span>
                                        <span className="font-medium">
                                          Pago via Crédito: R$ {(passageiro.valor_credito_utilizado || 0).toFixed(2)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Informações Financeiras */}
                                  <div className="mt-2">
                                    {(() => {
                                      const infoFinanceira = getInfoFinanceira(passageiro);
                                      return (
                                        <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${infoFinanceira.cor}`}>
                                          {infoFinanceira.texto}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  {passageiro.passeios && passageiro.passeios.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {passageiro.passeios.map((passeio) => (
                                        <span 
                                          key={passeio.passeio_nome} 
                                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                        >
                                          {passeio.passeio_nome}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {/* Botão de responsável removido */}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {Object.keys(passageirosOnibus).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "Nenhum passageiro encontrado" : "Nenhum passageiro neste ônibus"}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Passageiros sem ônibus */}
        {passageirosPorOnibus.sem_onibus && Object.keys(passageirosPorOnibus.sem_onibus).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Passageiros não alocados</span>
                </div>
                <Badge variant="secondary">
                  {Object.values(passageirosPorOnibus.sem_onibus).flat().length} passageiros
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(passageirosPorOnibus.sem_onibus)
                  .sort(([cidadeA], [cidadeB]) => cidadeA.localeCompare(cidadeB))
                  .map(([cidade, passageirosCidade]) => (
                  <div key={cidade} className="space-y-3">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <h4 className="font-semibold text-lg">{cidade}</h4>
                      <Badge variant="outline">
                        {passageirosCidade.length} passageiro{passageirosCidade.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {passageirosCidade
                        .sort((a, b) => a.nome.localeCompare(b.nome))
                        .map((passageiro) => (
                        <div
                          key={passageiro.viagem_passageiro_id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                            passageiro.status_presenca === 'presente'
                              ? "bg-green-50 border-green-200 hover:bg-green-100"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                          onClick={() => togglePresenca(passageiro.viagem_passageiro_id, passageiro.status_presenca)}
                        >
                          <div className="flex items-center gap-3 w-full">
                            {passageiro.status_presenca === 'presente' ? (
                              <UserCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <Users className="h-5 w-5 text-gray-400 flex-shrink-0" />
                            )}
                            <div className="w-full">
                              <p className="font-medium text-sm">{passageiro.nome}</p>
                              <div className="text-xs text-muted-foreground space-y-1">
                                <p>CPF: {formatCPF(passageiro.cpf)}</p>
                                <p>Telefone: {formatPhone(passageiro.telefone)}</p>
                                <p>Setor: {passageiro.setor_maracana}</p>
                                {/* Informações de Crédito */}
                                {passageiro.pago_por_credito && (
                                  <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1">
                                    <span>💳</span>
                                    <span className="font-medium">
                                      Pago via Crédito: R$ {(passageiro.valor_credito_utilizado || 0).toFixed(2)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {passageiro.passeios && passageiro.passeios.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {passageiro.passeios.map((passeio) => (
                                    <span 
                                      key={passeio.passeio_nome} 
                                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {passeio.passeio_nome}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {passageirosFiltrados.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum passageiro encontrado</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm ? "Tente ajustar sua busca" : "Não há passageiros cadastrados para esta viagem"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ListaPresenca;