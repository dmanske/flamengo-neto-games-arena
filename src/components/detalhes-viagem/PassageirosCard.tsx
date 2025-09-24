import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Pencil, Users, Plus, Search, Eye, Bus, Ticket, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { formatBirthDate, formatarNomeComPreposicoes } from "@/utils/formatters";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PasseiosCompactos } from "./PasseiosCompactos";
import { calcularValorFinalPassageiro } from "@/utils/passageiroCalculos";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StatusBadgeAvancado, BreakdownVisual } from "./StatusBadgeAvancado";
import { BotoesAcaoRapida } from "./BotoesAcaoRapida";
import { PassageiroRow } from "./PassageiroRow";
import { PassageiroComStatus } from "./PassageiroComStatus";
import { TrocarOnibusModal } from "./TrocarOnibusModal";
import { usePagamentosSeparados } from "@/hooks/usePagamentosSeparados";
import type { StatusPagamentoAvancado, CategoriaPagamento } from "@/types/pagamentos-separados";
import { obterValoresPasseiosPorNomes } from "@/utils/passeiosUtils";
import { FAIXAS_ETARIAS, contarPorFaixaEtaria, obterFaixaEtaria, calcularIdade, type FaixaEtaria } from "@/utils/faixaEtariaUtils";

interface PassageirosCardProps {
  passageirosAtuais: any[];
  passageiros: any[];
  onibusAtual: any;
  selectedOnibusId: string | null;
  totalPassageirosNaoAlocados: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setAddPassageiroOpen: (open: boolean) => void;
  onEditPassageiro: (passageiro: any) => void;
  onDeletePassageiro: (passageiro: any) => void;
  onDesvincularCredito?: (passageiro: any) => void;
  onViewDetails?: (passageiro: any) => void;
  filterStatus: string;
  passeiosPagos?: string[];
  outroPasseio?: string | null;
  viagemId: string | null;
  setPassageiros: (passageiros: any[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  capacidadeTotal?: number;
  totalPassageiros?: number;
  // Novos props para funcionalidade de grupos e troca
  onibusList?: any[];
  passageirosCount?: Record<string, number>;
  onUpdatePassageiros?: () => void;
}

export function PassageirosCard({
  passageirosAtuais,
  passageiros,
  onibusAtual,
  selectedOnibusId,
  totalPassageirosNaoAlocados,
  searchTerm,
  setSearchTerm,
  setAddPassageiroOpen,
  onEditPassageiro,
  onDeletePassageiro,
  onDesvincularCredito,
  onViewDetails,
  filterStatus,
  passeiosPagos,
  outroPasseio,
  viagemId,
  setPassageiros,
  setIsLoading,
  capacidadeTotal,
  totalPassageiros,
  onibusList = [],
  passageirosCount = {},
  onUpdatePassageiros,
}: PassageirosCardProps) {
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [activeTab, setActiveTab] = useState<string>("todos");
  const [faixaEtariaFilter, setFaixaEtariaFilter] = useState<string | null>(null);
  
  // Estados para modal de troca de ônibus
  const [passageiroParaTroca, setPassageiroParaTroca] = useState<any | null>(null);
  const [modalTrocaAberto, setModalTrocaAberto] = useState(false);
  
  // Calcular se há vagas disponíveis no ônibus atual
  const capacidadeOnibusAtual = onibusAtual ? onibusAtual.capacidade_onibus + (onibusAtual.lugares_extras || 0) : 0;
  const passageirosNoOnibus = passageirosAtuais?.length || 0;
  const vagasDisponiveis = capacidadeOnibusAtual - passageirosNoOnibus;
  const onibusLotado = onibusAtual && vagasDisponiveis <= 0;

  // Funções para troca de ônibus
  const handleTrocarOnibus = (passageiro: any) => {
    setPassageiroParaTroca(passageiro);
    setModalTrocaAberto(true);
  };

  const handleConfirmarTroca = () => {
    setModalTrocaAberto(false);
    setPassageiroParaTroca(null);
    if (onUpdatePassageiros) {
      onUpdatePassageiros();
    }
  };

  const handleFecharModal = () => {
    setModalTrocaAberto(false);
    setPassageiroParaTroca(null);
  };

  // Permitir controle externo do filtro de status
  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail === "Pago" || e.detail === "Pendente" || e.detail === "Cancelado") {
        setStatusFilter(e.detail);
      }
    };
    document.addEventListener("setPassageirosStatusFilter", handler);
    return () => document.removeEventListener("setPassageirosStatusFilter", handler);
  }, []);

  // Calcular contadores por faixa etária
  const contadoresFaixaEtaria = contarPorFaixaEtaria(passageirosAtuais || []);

  // Filtrar passageiros com busca inteligente e faixa etária
  const passageirosFiltrados = (passageirosAtuais || []).filter((passageiro) => {
    // Filtro por faixa etária
    if (faixaEtariaFilter) {
      const dataNascimento = passageiro.clientes?.data_nascimento || passageiro.data_nascimento;
      if (dataNascimento) {
        const faixa = obterFaixaEtaria(dataNascimento);
        if (!faixa || faixa.id !== faixaEtariaFilter) {
          return false;
        }
      } else {
        return false; // Se não tem data de nascimento, não passa no filtro
      }
    }

    const searchTermTrimmed = searchTerm.trim();
    
    if (!searchTermTrimmed) return true;
    
    // Suporte para múltiplos termos separados por espaço
    const searchTerms = searchTermTrimmed.toLowerCase().split(' ').filter(term => term.length > 0);
    
    // Dados básicos do passageiro
    const nome = passageiro.clientes?.nome || passageiro.nome || '';
    const telefone = passageiro.clientes?.telefone || passageiro.telefone || '';
    const email = passageiro.clientes?.email || passageiro.email || '';
    const cpf = passageiro.clientes?.cpf || passageiro.cpf || '';
    const cidade = passageiro.clientes?.cidade || passageiro.cidade || '';
    const estado = passageiro.clientes?.estado || passageiro.estado || '';
    
    // Dados da viagem
    const cidadeEmbarque = passageiro.cidade_embarque || '';
    const setorMaracana = passageiro.setor_maracana || '';
    const statusPagamento = passageiro.status_pagamento || '';
    const formaPagamento = passageiro.forma_pagamento || '';
    const observacoes = passageiro.observacoes || '';
    
    // Dados financeiros
    const valor = passageiro.valor?.toString() || '';
    const desconto = passageiro.desconto?.toString() || '';
    
    // Passeios do passageiro (corrigir estrutura)
    const passeiosNomes = passageiro.passeios?.map(p => p.passeio_nome || '').join(' ') || '';
    
    // Data de nascimento formatada para busca
    const dataNascimento = passageiro.clientes?.data_nascimento || passageiro.data_nascimento || '';
    const dataNascimentoFormatada = dataNascimento ? new Date(dataNascimento).toLocaleDateString('pt-BR') : '';
    
    // Debug temporário para ver estrutura dos passeios
    if (searchTermTrimmed.includes('pão') || searchTermTrimmed.includes('lapa')) {
      console.log(`🔍 DEBUG Busca - ${nome}:`, {
        searchTerm: searchTermTrimmed,
        passeios: passageiro.passeios,
        passeiosNomes,
        dataNascimento: dataNascimentoFormatada
      });
    }
    
    // Texto completo para busca
    const fullText = [
      nome, telefone, email, cpf, cidade, estado,
      cidadeEmbarque, setorMaracana, statusPagamento, formaPagamento,
      observacoes, valor, desconto, passeiosNomes, dataNascimentoFormatada
    ].join(' ').toLowerCase();
    
    // Todos os termos devem estar presentes (busca AND)
    const matchesSearch = searchTerms.every(term => fullText.includes(term));
    
    // Filtro de status será aplicado no render (após calcular status real)
    return matchesSearch;
  });

  // Função para verificar se passageiro passa no filtro de status
  const passaNoFiltroStatus = (statusCalculado: StatusPagamentoAvancado): boolean => {
    if (statusFilter === "todos") return true;
    
    if (statusFilter === "Pagamentos Pendentes") {
      return statusCalculado !== 'Pago Completo' && 
             statusCalculado !== 'Brinde' && 
             statusCalculado !== 'Cancelado';
    }
    
    if (statusFilter === "Pagamentos Confirmados") {
      return statusCalculado === 'Pago Completo' || 
             statusCalculado === 'Brinde';
    }
    
    return statusCalculado === statusFilter;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pago":
      case "Pago Completo":
        return "bg-green-100 text-green-800 border-green-200";
      case "Viagem Paga":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Passeios Pagos":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Pendente":
        return "bg-red-100 text-red-800 border-red-200";
      case "Brinde":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Cancelado":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Função para lidar com pagamentos
  const handlePagamento = async (
    passageiroId: string,
    categoria: string,
    valor: number,
    formaPagamento: string = 'pix',
    observacoes?: string,
    dataPagamento?: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('historico_pagamentos_categorizado')
        .insert({
          viagem_passageiro_id: passageiroId,
          categoria: categoria,
          valor_pago: valor,
          forma_pagamento: formaPagamento,
          observacoes: observacoes,
          data_pagamento: dataPagamento || new Date().toISOString()
        });

      if (error) throw error;

      // Recarregar dados
      await fetchPassageiros();
      return true;

    } catch (error: any) {
      console.error('Erro ao registrar pagamento:', error);
      toast.error('Erro ao registrar pagamento');
      return false;
    }
  };

  const fetchPassageiros = async () => {
    try {
      setIsLoading(true);

      // Verificar se o viagemId é válido
      if (!viagemId || viagemId === "undefined") {
        console.warn("ID da viagem inválido:", viagemId);
        return;
      }

      // Verificar se o ID é um UUID válido
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(viagemId)) {
        console.warn("ID da viagem não é um UUID válido:", viagemId);
        return;
      }

      console.log('🚀 DEBUG PassageirosCard: Executando query para viagemId:', viagemId);
      
      const { data, error } = await supabase
        .from('viagem_passageiros')
        .select(`
          *,
          clientes!viagem_passageiros_cliente_id_fkey (
            nome,
            telefone,
            email,
            data_nascimento,
            foto
          ),
          passageiro_passeios (
            id,
            passeio_nome,
            valor_cobrado
          ),
          historico_pagamentos_categorizado (
            categoria,
            valor_pago,
            data_pagamento
          )
        `)
        .eq('viagem_id', viagemId)
        .order('created_at', { ascending: false });
      
      console.log('🚀 DEBUG PassageirosCard: Resultado da query:', { 
        data, 
        error, 
        viagemId,
        dataLength: data?.length,
        primeiroItem: data?.[0],
        exemploPasseios: data?.[0]?.passageiro_passeios
      });

      if (error) {
        throw error;
      }
      
      // Debug temporário - verificar dados brutos
      console.log('🔍 Dados brutos da query:', {
        totalPassageiros: data?.length || 0,
        primeiroPassageiro: data?.[0],
        passeiosDosPrimeiros3: data?.slice(0, 3).map(p => ({
          nome: p.nome,
          passeios: p.passageiro_passeios
        }))
      });

      // Processar dados para calcular valores dos passeios corretamente
      const passageirosProcessados = await Promise.all((data || []).map(async (passageiro) => {
        const passeiosPassageiro = passageiro.passageiro_passeios || [];
        
        // Debug temporário
        if (passeiosPassageiro.length > 0) {
          console.log(`🔍 Passageiro ${passageiro.nome} tem ${passeiosPassageiro.length} passeios:`, passeiosPassageiro);
        }
        

        
        // Se há passeios sem valor, buscar todos de uma vez
        const passeiosSemValor = passeiosPassageiro.filter(pp => 
          !pp.valor_cobrado || pp.valor_cobrado === 0
        );
        
        if (passeiosSemValor.length > 0) {
          const nomesPasseios = passeiosSemValor.map(pp => pp.passeio_nome);
          try {
            const { data: passeiosInfo, error: passeiosError } = await supabase
              .from('passeios')
              .select('nome, valor')
              .in('nome', nomesPasseios);
            
            if (!passeiosError && passeiosInfo) {
              
              // Criar mapa de valores para usar no cálculo (sem modificar dados originais)
              const valoresPorNome = new Map();
              passeiosInfo.forEach(p => {
                valoresPorNome.set(p.nome, p.valor || 0);
              });
              
              // Adicionar valores como propriedade temporária para cálculo
              passeiosPassageiro.forEach(pp => {
                if (!pp.valor_cobrado || pp.valor_cobrado === 0) {
                  const valorTabela = valoresPorNome.get(pp.passeio_nome) || 0;
                  pp.valor_real_calculado = valorTabela;
                  console.log(`🔧 Passeio ${pp.passeio_nome}: valor_cobrado=${pp.valor_cobrado} → valor_real_calculado=${valorTabela}`);
                } else {
                  pp.valor_real_calculado = pp.valor_cobrado;
                  console.log(`✅ Passeio ${pp.passeio_nome}: usando valor_cobrado=${pp.valor_cobrado}`);
                }
              });
            }
          } catch (error) {
            console.error('❌ Erro ao buscar valores dos passeios:', error);
          }
        }
        
        const valorTotalPasseios = passeiosPassageiro.reduce((sum, pp) => sum + (pp.valor_real_calculado || pp.valor_cobrado || 0), 0);
        
        return {
          ...passageiro,
          passageiro_passeios: passeiosPassageiro
        };
      }));

      setPassageiros(passageirosProcessados);
    } catch (error: any) {
      console.error('Erro ao buscar passageiros:', error);
      toast.error("Erro ao carregar passageiros");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Passageiros
              {onibusAtual && (
                <span className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
                  <Bus className="h-4 w-4" />
                  {onibusAtual.numero_identificacao || `${onibusAtual.tipo_onibus} - ${onibusAtual.empresa}`}
                </span>
              )}
              {selectedOnibusId === null && totalPassageirosNaoAlocados > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  (Não Alocados)
                </span>
              )}
              {/* Indicador de funcionalidades de grupos */}
              {onibusList.length > 0 && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                  🔄 Troca & Grupos
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {passageirosFiltrados.length} de {(passageirosAtuais || []).length} passageiros
              {faixaEtariaFilter && (
                <span className="ml-2 text-blue-600 font-medium">
                  • Filtro: {FAIXAS_ETARIAS.find(f => f.id === faixaEtariaFilter)?.nome}
                </span>
              )}
              {onibusAtual && (
                <span className={`ml-2 ${
                  onibusLotado 
                    ? 'text-red-600 font-medium' 
                    : vagasDisponiveis <= 3 
                      ? 'text-yellow-600 font-medium' 
                      : 'text-gray-600'
                }`}>
                  • {passageirosNoOnibus}/{capacidadeOnibusAtual} lugares
                  {onibusLotado 
                    ? ' (LOTADO)' 
                    : vagasDisponiveis <= 3 
                      ? ` (${vagasDisponiveis} vagas restantes)` 
                      : ''
                  }
                </span>
              )}
            </CardDescription>
          </div>
          <Button 
            onClick={() => setAddPassageiroOpen(true)}
            disabled={onibusLotado}
            className={`${
              onibusLotado 
                ? 'bg-gray-400 cursor-not-allowed opacity-50' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            title={onibusLotado ? 'Ônibus lotado - sem vagas disponíveis' : 'Adicionar novo passageiro'}
          >
            <Plus className="h-4 w-4 mr-2" />
            {onibusLotado ? 'Ônibus Lotado' : 'Adicionar Passageiro'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-4">
          {/* Barra de busca e filtro de status */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="🔍 Busca inteligente: nome, telefone, email, CPF, cidade, setor, status, pagamento, valor, passeios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-16"
              />
              {searchTerm && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground bg-white px-1">
                  {passageirosFiltrados.length} resultado{passageirosFiltrados.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 z-50">
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="Pago Completo">🟢 Pago Completo</SelectItem>
                <SelectItem value="Viagem Paga">🟡 Viagem Paga</SelectItem>
                <SelectItem value="Passeios Pagos">🟡 Passeios Pagos</SelectItem>
                <SelectItem value="Pendente">🔴 Pendente</SelectItem>
                <SelectItem value="Brinde">🎁 Brinde</SelectItem>
                <SelectItem value="Cancelado">❌ Cancelado</SelectItem>
                <SelectItem value="Pagamentos Pendentes">⏳ Pagamentos Pendentes</SelectItem>
                <SelectItem value="Pagamentos Confirmados">✅ Pagamentos Confirmados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtros por faixa etária */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-medium text-muted-foreground mr-2">Filtrar por idade:</span>
            
            {/* Botão "Todos" */}
            <Button
              variant={faixaEtariaFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFaixaEtariaFilter(null)}
              className={`h-8 px-3 text-xs ${
                faixaEtariaFilter === null 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              👥 Todos ({(passageirosAtuais || []).length})
            </Button>

            {/* Botões das faixas etárias */}
            {FAIXAS_ETARIAS.map((faixa) => {
              const count = contadoresFaixaEtaria[faixa.id] || 0;
              const isActive = faixaEtariaFilter === faixa.id;
              
              return (
                <Button
                  key={faixa.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFaixaEtariaFilter(isActive ? null : faixa.id)}
                  className={`h-8 px-3 text-xs transition-all ${
                    isActive 
                      ? faixa.cor.replace('hover:', '').replace('bg-', 'bg-').replace('text-', 'text-').replace('border-', 'border-')
                      : `bg-white text-gray-700 border-gray-300 hover:${faixa.cor.split(' ')[0]} hover:${faixa.cor.split(' ')[1]} hover:${faixa.cor.split(' ')[2]}`
                  } ${count === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  disabled={count === 0}
                  title={count === 0 ? `Nenhum passageiro na faixa ${faixa.nome.toLowerCase()}` : `Filtrar por ${faixa.nome.toLowerCase()}`}
                >
                  {faixa.emoji} {faixa.nome} ({count})
                </Button>
              );
            })}

            {/* Indicador de filtro ativo */}
            {faixaEtariaFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFaixaEtariaFilter(null)}
                className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Limpar filtro de idade"
              >
                ✕ Limpar
              </Button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] px-2">#</TableHead>
                <TableHead className="min-w-[180px] px-2">Nome</TableHead>
                <TableHead className="w-[120px] text-center px-2">CPF</TableHead>
                <TableHead className="w-[120px] text-center px-2">Telefone</TableHead>
                <TableHead className="w-[100px] text-center px-2">Data Nasc.</TableHead>
                <TableHead className="w-[120px] text-center px-2">Cidade Embarque</TableHead>
                <TableHead className="w-[120px] text-center px-2">Setor</TableHead>
                <TableHead className="w-[100px] text-center px-2">Status</TableHead>
                <TableHead className="w-[150px] text-center px-2">Passeios</TableHead>
                <TableHead className="w-[120px] text-center px-2">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {passageirosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    {searchTerm || statusFilter !== "todos" 
                      ? "Nenhum passageiro encontrado com os filtros aplicados" 
                      : "Nenhum passageiro cadastrado"}
                  </TableCell>
                </TableRow>
              ) : (
                passageirosFiltrados.map((passageiro, index) => (
                  <PassageiroComStatus key={passageiro.id} passageiro={passageiro}>
                    {(statusCalculado) => {
                      // Aplicar filtro de status com status calculado
                      if (!passaNoFiltroStatus(statusCalculado)) {
                        return null;
                      }
                      
                      return (
                        <PassageiroRow
                          passageiro={passageiro}
                          index={index}
                          onEditPassageiro={onEditPassageiro}
                          onDeletePassageiro={onDeletePassageiro}
                          onDesvincularCredito={onDesvincularCredito}
                          onViewDetails={onViewDetails}
                          onTrocarOnibus={handleTrocarOnibus}
                          handlePagamento={handlePagamento}
                        />
                      );
                    }}
                  </PassageiroComStatus>
                )).filter(Boolean) // Remove nulls


              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    
    {/* Modal de Troca de Ônibus */}
    {passageiroParaTroca && onibusList.length > 0 && (
      <TrocarOnibusModal
        isOpen={modalTrocaAberto}
        onClose={handleFecharModal}
        passageiro={passageiroParaTroca}
        onibusList={onibusList}
        passageirosCount={passageirosCount}
        onConfirm={handleConfirmarTroca}
      />
    )}
    </TooltipProvider>
  );
}
