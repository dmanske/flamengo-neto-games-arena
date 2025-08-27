import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { matchesAllTerms, createSearchableText, normalizeText } from "@/lib/search-utils";

export interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  tipo_onibus: string;
  empresa: string;
  rota: string;
  capacidade_onibus: number;
  status_viagem: string;
  created_at: string;
  logo_adversario: string | null;
  logo_flamengo: string | null;
  valor_padrao: number | null;
  setor_padrao: string | null;
  local_jogo?: string;
  nome_estadio?: string | null;
  passeios_pagos?: string[];
  outro_passeio?: string | null;
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
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  cpf: string;
  email: string;
}

export interface PassageiroDisplay {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  cpf: string;
  cidade: string;
  estado: string;
  endereco: string;
  numero: string;
  bairro: string;
  cep: string;
  complemento?: string;
  data_nascimento?: string;
  setor_maracana: string;
  status_pagamento: string;
  forma_pagamento: string;
  cliente_id: string;
  is_responsavel_onibus?: boolean;
  viagem_passageiro_id: string;
  valor: number | null;
  desconto: number | null;
  onibus_id?: string | null;
  viagem_id: string;
  passeio_cristo?: string;
  foto?: string | null;
  cidade_embarque: string;
  observacoes?: string | null;
  pago_por_credito?: boolean;
  credito_origem_id?: string | null;
  valor_credito_utilizado?: number;
  credito_origem?: {
    id: string;
    valor_credito: number;
    data_pagamento: string;
    cliente: {
      nome: string;
    };
  } | null;
  viagem_passageiros_parcelas?: Array<{
    id: string;
    valor_parcela: number;
    forma_pagamento: string;
    data_pagamento: string;
    observacoes?: string;
  }>;
  passeios?: Array<{
    passeio_nome: string;
    status: string;
    valor_cobrado?: number;
    passeio?: {
      nome: string;
      valor: number;
    };
  }>;
  // Campos para busca otimizada
  searchableText?: string;
  normalizedSearchText?: string;
  passeioNames?: string[];
  hasPasseios?: boolean;
}

export interface Onibus {
  id: string;
  viagem_id: string;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
  numero_identificacao: string | null;
  lugares_extras?: number | null;
  passageiros_count?: number;
}

export function useViagemDetails(viagemId: string | undefined) {
  const navigate = useNavigate();
  const [viagem, setViagem] = useState<Viagem | null>(null);
  const [passageiros, setPassageiros] = useState<PassageiroDisplay[]>([]);
  const [filteredPassageiros, setFilteredPassageiros] = useState<PassageiroDisplay[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Financeiro
  const [totalArrecadado, setTotalArrecadado] = useState<number>(0);
  const [totalPago, setTotalPago] = useState<number>(0);
  const [totalPendente, setTotalPendente] = useState<number>(0);
  const [valorPasseiosReal, setValorPasseiosReal] = useState<number>(0);

  // Breakdown por categoria
  const [receitaViagem, setReceitaViagem] = useState<number>(0);
  const [receitaPasseios, setReceitaPasseios] = useState<number>(0);
  const [pagoViagem, setPagoViagem] = useState<number>(0);
  const [pagoPasseios, setPagoPasseios] = useState<number>(0);
  const [pendenteViagem, setPendenteViagem] = useState<number>(0);
  const [pendentePasseios, setPendentePasseios] = useState<number>(0);
  const [valorPotencialTotal, setValorPotencialTotal] = useState<number>(0);
  const [countPendentePayment, setCountPendentePayment] = useState<number>(0);
  const [totalReceitas, setTotalReceitas] = useState<number>(0);
  const [totalDespesas, setTotalDespesas] = useState<number>(0);
  const [totalDescontos, setTotalDescontos] = useState<number>(0);
  const [valorBrutoTotal, setValorBrutoTotal] = useState<number>(0);
  const [quantidadeComDesconto, setQuantidadeComDesconto] = useState<number>(0);

  // Ônibus
  const [onibusList, setOnibusList] = useState<Onibus[]>([]);
  const [selectedOnibusId, setSelectedOnibusId] = useState<string | null>(null);
  const [passageiroPorOnibus, setPassageiroPorOnibus] = useState<Record<string, PassageiroDisplay[]>>({
    semOnibus: []
  });
  const [contadorPassageiros, setContadorPassageiros] = useState<Record<string, number>>({});

  // Verificar se o viagemId é válido
  useEffect(() => {
    if (!viagemId || viagemId === "undefined") {
      console.warn("ID da viagem inválido:", viagemId);
      navigate("/dashboard/viagens");
      return;
    }

    // Verificar se o ID é um UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(viagemId)) {
      console.warn("ID da viagem não é um UUID válido:", viagemId);
      navigate("/dashboard/viagens");
      return;
    }

    fetchViagemData(viagemId);
  }, [viagemId, navigate]);

  // Listener para evento customizado de reload de passageiros
  useEffect(() => {
    const handleViagemPassageiroRemovido = (event: CustomEvent) => {
      const { viagemId: eventViagemId } = event.detail;
      console.log('🔔 [useViagemDetails] Evento de passageiro removido recebido:', event.detail);
      console.log('🔔 [useViagemDetails] Viagem atual:', viagemId, 'Evento para viagem:', eventViagemId);
      
      if (eventViagemId === viagemId) {
        console.log('✅ [useViagemDetails] Evento é para esta viagem, recarregando dados...');
        console.log('🔄 [useViagemDetails] Chamando fetchPassageiros para viagem:', viagemId);
        fetchPassageiros(viagemId);
        console.log('✅ [useViagemDetails] fetchPassageiros executado');
      } else {
        console.log('⚠️ [useViagemDetails] Evento é para outra viagem:', eventViagemId, 'atual:', viagemId);
      }
    };

    console.log('🎧 [useViagemDetails] Registrando listener para viagemPassageiroRemovido, viagem:', viagemId);
    window.addEventListener('viagemPassageiroRemovido', handleViagemPassageiroRemovido as EventListener);
    
    return () => {
      console.log('🧹 [useViagemDetails] Removendo listener para viagemPassageiroRemovido');
      window.removeEventListener('viagemPassageiroRemovido', handleViagemPassageiroRemovido as EventListener);
    };
  }, [viagemId]);

  // Verificar localStorage para atualizações pendentes
  useEffect(() => {
    const checkForPendingReloads = () => {
      const reloadFlag = localStorage.getItem('viagemNeedsReload');
      if (reloadFlag) {
        try {
          const { viagemId: flagViagemId, timestamp, action } = JSON.parse(reloadFlag);
          console.log('🔍 [useViagemDetails] Flag de reload encontrada:', { flagViagemId, timestamp, action });
          
          // Verificar se é para esta viagem e se não é muito antiga (5 minutos)
          const isForThisViagem = flagViagemId === viagemId;
          const isRecent = Date.now() - timestamp < 5 * 60 * 1000; // 5 minutos
          
          if (isForThisViagem && isRecent) {
            console.log('✅ [useViagemDetails] Flag é para esta viagem e recente, recarregando...');
            fetchPassageiros(viagemId);
            localStorage.removeItem('viagemNeedsReload');
          } else if (!isRecent) {
            console.log('⚠️ [useViagemDetails] Flag muito antiga, removendo...');
            localStorage.removeItem('viagemNeedsReload');
          }
        } catch (error) {
          console.error('❌ [useViagemDetails] Erro ao processar flag de reload:', error);
          localStorage.removeItem('viagemNeedsReload');
        }
      }
    };

    // Verificar imediatamente
    checkForPendingReloads();
    
    // Verificar periodicamente
    const interval = setInterval(checkForPendingReloads, 2000);
    
    return () => clearInterval(interval);
  }, [viagemId]);

  // Efeito para filtrar passageiros quando o termo de busca muda
  useEffect(() => {
    if (passageiros.length > 0) {
      // Filtrar todos os passageiros primeiro
      const passageirosFiltrados = filterPassageiros(passageiros, searchTerm);

      // Apply status filter if active
      let resultFiltered = passageirosFiltrados;
      if (filterStatus === "pendente") {
        resultFiltered = passageirosFiltrados.filter(p => p.status_pagamento !== "Pago");
      }

      setFilteredPassageiros(resultFiltered);

      // Agrupar os passageiros filtrados por ônibus
      agruparPassageirosPorOnibus(resultFiltered);
    }
  }, [searchTerm, passageiros, filterStatus]);

  // Efeito para calcular valor potencial quando viagem, ônibus e passageiros estiverem carregados
  useEffect(() => {
    if (viagem && onibusList.length > 0 && passageiros.length >= 0) {
      const capacidadeTotal = onibusList.reduce(
        (total, onibus) => total + onibus.capacidade_onibus + (onibus.lugares_extras || 0),
        0
      );

      // Contar brindes (passageiros com valor total = 0)
      const quantidadeBrindes = passageiros.filter(p => {
        const valorViagem = (p.valor || 0) - (p.desconto || 0);
        const valorPasseios = (p.passeios || []).reduce((sum, passeio) => {
          return sum + (passeio.valor_cobrado || 0);
        }, 0);
        return (valorViagem + valorPasseios) === 0;
      }).length;

      // Calcular descontos totais (excluindo brindes)
      const totalDescontosCalculado = passageiros.reduce((total, p) => {
        const valorViagem = (p.valor || 0) - (p.desconto || 0);
        const valorPasseios = (p.passeios || []).reduce((sum, passeio) => {
          return sum + (passeio.valor_cobrado || 0);
        }, 0);
        const ehBrinde = (valorViagem + valorPasseios) === 0;

        if (!ehBrinde && (p.desconto || 0) > 0) {
          return total + (p.desconto || 0);
        }
        return total;
      }, 0);

      // Potencial base = (capacidade - brindes) × valor padrão
      const vagasPagantes = capacidadeTotal - quantidadeBrindes;
      const potencialBase = vagasPagantes * (viagem.valor_padrao || 0);

      // Potencial ajustado = potencial base - descontos aplicados
      const valorPotencial = potencialBase - totalDescontosCalculado;

      setValorPotencialTotal(valorPotencial);
    }
  }, [viagem, onibusList, passageiros]);

  const fetchViagemData = async (id: string) => {
    try {
      setIsLoading(true);
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
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        console.warn("Viagem não encontrada:", id);
        navigate("/dashboard/viagens");
        return;
      }

      setViagem(data);
      await fetchOnibus(id);
      await fetchPassageiros(id);
      await fetchFinancialData(id);
    } catch (error: any) {
      console.error('Erro ao buscar dados da viagem:', error);
      toast.error("Erro ao carregar dados da viagem");
      navigate("/dashboard/viagens");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOnibus = async (viagemId: string) => {
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

    try {
      const { data, error } = await supabase
        .from("viagem_onibus")
        .select("*")
        .eq("viagem_id", viagemId);

      if (error) throw error;

      if (data && data.length > 0) {
        setOnibusList(data as Onibus[]);
        // Seleciona o primeiro ônibus por padrão
        setSelectedOnibusId(data[0].id);
      }
    } catch (err) {
      console.error("Erro ao buscar ônibus:", err);
      toast.error("Erro ao carregar dados dos ônibus");
    }
  };

  const fetchPassageiros = async (viagemId: string) => {

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
    console.log('🚀 DEBUG: UUID válido, prosseguindo...');

    try {
      // Buscar passageiros da viagem com dados do cliente usando a relação específica
      console.log('🚀 DEBUG: Executando query para viagemId:', viagemId);
      console.log('🚀 DEBUG: Iniciando query Supabase...');

      const { data, error } = await supabase
        .from("viagem_passageiros")
        .select(`
          id,
          viagem_id,
          cliente_id,
          setor_maracana,
          status_pagamento,
          forma_pagamento,
          valor,
          desconto,
          created_at,
          onibus_id,
          cidade_embarque,
          observacoes,
          is_responsavel_onibus,
          pago_por_credito,
          credito_origem_id,
          valor_credito_utilizado,
          clientes!viagem_passageiros_cliente_id_fkey (
            id,
            nome,
            telefone,
            email,
            cpf,
            cidade,
            estado,
            endereco,
            numero,
            bairro,
            cep,
            complemento,
            data_nascimento,
            passeio_cristo,
            foto
          ),
          viagem_passageiros_parcelas (
            id,
            valor_parcela,
            forma_pagamento,
            data_pagamento,
            observacoes
          ),
          passageiro_passeios (
            passeio_nome,
            status,
            valor_cobrado
          ),
          credito_origem:cliente_creditos!credito_origem_id (
            id,
            valor_credito,
            data_pagamento,
            cliente:clientes!cliente_id (
              nome
            )
          )
        `)
        .eq("viagem_id", viagemId);

      console.log('🚀 DEBUG: Resultado da query:', {
        data,
        error,
        viagemId,
        dataLength: data?.length,
        primeiroItem: data?.[0],
        primeiroItemPasseios: data?.[0]?.passageiro_passeios
      });

      if (error) throw error;

      // Debug: verificar dados brutos da query
      console.log('🔍 DEBUG useViagemDetails - Dados brutos da query:', {
        viagemId,
        totalPassageiros: data?.length || 0,
        primeiroPassageiro: data?.[0],
        passageirosComPasseios: data?.filter(p => p.passageiro_passeios?.length > 0).length || 0,
        exemploPasseios: data?.[0]?.passageiro_passeios,
        todosPasseios: data?.map(p => ({
          nome: p.clientes?.nome,
          passeios: p.passageiro_passeios?.length || 0
        }))
      });

      // Formatar os dados para exibição com pré-processamento para busca
      const formattedPassageiros: PassageiroDisplay[] = (data || []).map((item: any) => {
        const passeios = item.passageiro_passeios || [];
        const passeioNames = passeios.map((p: any) => p.passeio_nome).filter(Boolean);

        // Campos básicos para busca
        const searchFields = [
          item.clientes.nome,
          item.clientes.telefone,
          item.clientes.email,
          item.clientes.cpf,
          item.clientes.cidade,
          item.setor_maracana,
          item.cidade_embarque,
          item.observacoes,
          item.status_pagamento,
          item.forma_pagamento,
          ...passeioNames
        ];

        const searchableText = createSearchableText(searchFields);

        return {
          id: item.clientes.id,
          nome: item.clientes.nome,
          telefone: item.clientes.telefone,
          email: item.clientes.email,
          cpf: item.clientes.cpf,
          cidade: item.clientes.cidade,
          estado: item.clientes.estado,
          endereco: item.clientes.endereco,
          numero: item.clientes.numero,
          bairro: item.clientes.bairro,
          cep: item.clientes.cep,
          complemento: item.clientes.complemento,
          data_nascimento: item.clientes.data_nascimento,
          setor_maracana: item.setor_maracana,
          status_pagamento: item.status_pagamento,
          forma_pagamento: item.forma_pagamento || "Pix",
          cliente_id: item.cliente_id,
          viagem_passageiro_id: item.id,
          valor: item.valor || 0,
          desconto: item.desconto || 0,
          onibus_id: item.onibus_id,
          viagem_id: item.viagem_id,
          passeio_cristo: item.clientes.passeio_cristo,
          foto: item.clientes.foto || null,
          cidade_embarque: item.cidade_embarque,
          observacoes: item.observacoes,
          is_responsavel_onibus: item.is_responsavel_onibus || false,
          pago_por_credito: item.pago_por_credito || false,
          credito_origem_id: item.credito_origem_id,
          valor_credito_utilizado: item.valor_credito_utilizado || 0,
          credito_origem: item.credito_origem,
          passeios: passeios,
          // Campos para busca otimizada
          searchableText,
          normalizedSearchText: normalizeText(searchableText),
          passeioNames,
          hasPasseios: passeios.length > 0
        };
      });

      // Sort passengers alphabetically by name
      const sortedPassageiros = formattedPassageiros.sort((a, b) =>
        a.nome.localeCompare(b.nome, 'pt-BR')
      );

      setPassageiros(sortedPassageiros);
      setFilteredPassageiros(sortedPassageiros);

      // Agrupar passageiros por ônibus
      agruparPassageirosPorOnibus(sortedPassageiros);

      // Calcular resumo financeiro
      let arrecadado = 0;
      let pago = 0;
      let pendente = 0;
      let countPendente = 0;
      let descontos = 0;
      let valorBruto = 0;
      let valorPasseiosArrecadado = 0; // Valor real dos passeios arrecadados dos passageiros
      let countComDesconto = 0; // Contador de passageiros com desconto

      // Breakdown separado por categoria
      let receitaViagem = 0;
      let receitaPasseios = 0;
      let pagoViagem = 0;
      let pagoPasseios = 0;
      let pendenteViagem = 0;
      let pendentePasseios = 0;

      formattedPassageiros.forEach((passageiro) => {
        const valorOriginal = passageiro.valor || 0;
        const desconto = passageiro.desconto || 0;
        const valorLiquidoViagem = valorOriginal - desconto;

        // Calcular valor dos passeios do passageiro
        const valorPasseiosPassageiro = (passageiro.passeios || []).reduce((sum, passeio) => {
          return sum + (passeio.valor_cobrado || 0);
        }, 0);

        // Valor total = viagem + passeios
        const valorTotalPassageiro = valorLiquidoViagem + valorPasseiosPassageiro;

        // Pular brindes dos cálculos financeiros (passageiros com valor total = 0)
        const ehBrinde = (valorTotalPassageiro === 0);

        // Debug básico para todos os passageiros - VERSÃO NOVA
        console.log(`[DEBUG NOVO] ${passageiro.nome}: ehBrinde=${ehBrinde}, valorTotal=${valorTotalPassageiro}, status=${passageiro.status_pagamento}`);

        if (!ehBrinde) {
          // Contar passageiros com desconto (apenas não-brindes)
          if (desconto > 0) {
            countComDesconto++;
          }

          // Calcular pagamentos baseado no status (incluindo pagamentos parciais e créditos)
          let valorPagoViagem = 0;
          let valorPagoPasseios = 0;

          // Se foi pago por crédito, considerar como pago
          if (passageiro.pago_por_credito && passageiro.valor_credito_utilizado) {
            // Determinar quanto do crédito foi usado para viagem vs passeios
            const valorCreditoUtilizado = passageiro.valor_credito_utilizado;
            
            if (valorCreditoUtilizado >= valorLiquidoViagem) {
              // Crédito cobriu a viagem toda e possivelmente passeios
              valorPagoViagem = valorLiquidoViagem;
              const sobra = valorCreditoUtilizado - valorLiquidoViagem;
              valorPagoPasseios = Math.min(sobra, valorPasseiosPassageiro);
            } else {
              // Crédito cobriu apenas parte da viagem
              valorPagoViagem = valorCreditoUtilizado;
              valorPagoPasseios = 0;
            }
          } else {
            // Pagamento tradicional baseado no status
            if (passageiro.status_pagamento === 'Pago Completo' || passageiro.status_pagamento === 'Pago') {
              // Pago completo
              valorPagoViagem = valorLiquidoViagem;
              valorPagoPasseios = valorPasseiosPassageiro;
            } else if (passageiro.status_pagamento === 'Viagem Paga') {
              // Só viagem paga
              valorPagoViagem = valorLiquidoViagem;
              valorPagoPasseios = 0;
            } else if (passageiro.status_pagamento === 'Passeios Pagos') {
              // Só passeios pagos
              valorPagoViagem = 0;
              valorPagoPasseios = valorPasseiosPassageiro;
            }
          }

          const valorPagoParcelas = valorPagoViagem + valorPagoPasseios;

          // Debug do total pago por passageiro
          console.log(`[DEBUG] ${passageiro.nome}: Status=${passageiro.status_pagamento}, PagoCredito=${passageiro.pago_por_credito}, ValorCredito=R$ ${passageiro.valor_credito_utilizado || 0}, PagoViagem=R$ ${valorPagoViagem}, PagoPasseios=R$ ${valorPagoPasseios}, Total=R$ ${valorPagoParcelas}`);

          // Breakdown por categoria
          receitaViagem += valorLiquidoViagem;
          receitaPasseios += valorPasseiosPassageiro;

          // Usar valores calculados diretamente (não proporcionalmente)
          pagoViagem += valorPagoViagem;
          pagoPasseios += valorPagoPasseios;

          // Calcular pendências
          const pendenteViagemPassageiro = valorLiquidoViagem - valorPagoViagem;
          const pendentePasseiosPassageiro = valorPasseiosPassageiro - valorPagoPasseios;

          if (pendenteViagemPassageiro > 0.01) pendenteViagem += pendenteViagemPassageiro;
          if (pendentePasseiosPassageiro > 0.01) pendentePasseios += pendentePasseiosPassageiro;

          // Totais gerais
          valorBruto += valorOriginal + valorPasseiosPassageiro;
          descontos += desconto;
          arrecadado += valorTotalPassageiro;
          valorPasseiosArrecadado += valorPasseiosPassageiro;
          pago += valorPagoParcelas;

          // Pendente total
          const valorPendente = valorTotalPassageiro - valorPagoParcelas;
          if (valorPendente > 0.01) {
            pendente += valorPendente;
            countPendente++;
          }
        }
      });

      setTotalArrecadado(arrecadado);
      setTotalPago(pago);
      setTotalPendente(pendente);
      setCountPendentePayment(countPendente);
      setTotalDescontos(descontos);
      setValorBrutoTotal(valorBruto);
      setValorPasseiosReal(valorPasseiosArrecadado);
      setQuantidadeComDesconto(countComDesconto);

      // Breakdown por categoria
      setReceitaViagem(receitaViagem);
      setReceitaPasseios(receitaPasseios);
      setPagoViagem(pagoViagem);
      setPagoPasseios(pagoPasseios);
      setPendenteViagem(pendenteViagem);
      setPendentePasseios(pendentePasseios);

      // Calcular valor potencial total (capacidade total * valor padrão)
      // Será atualizado quando os dados da viagem estiverem disponíveis

    } catch (err) {
      console.error("Erro ao buscar passageiros:", err);
      toast.error("Erro ao carregar passageiros");
    }
  };

  // Função para agrupar passageiros por ônibus
  const agruparPassageirosPorOnibus = (passageiros: PassageiroDisplay[]) => {
    const agrupados: Record<string, PassageiroDisplay[]> = {
      sem_onibus: []
    };

    const contador: Record<string, number> = {};

    passageiros.forEach(passageiro => {
      const onibusId = passageiro.onibus_id;

      if (onibusId) {
        if (!agrupados[onibusId]) {
          agrupados[onibusId] = [];
        }
        agrupados[onibusId].push(passageiro);

        // Incrementar contador
        contador[onibusId] = (contador[onibusId] || 0) + 1;
      } else {
        agrupados.sem_onibus.push(passageiro);
      }
    });

    setPassageiroPorOnibus(agrupados);
    setContadorPassageiros(contador);
  };

  // Quando o usuário seleciona um ônibus
  const handleSelectOnibus = (onibusId: string | null) => {
    setSelectedOnibusId(onibusId);
  };

  const handleDelete = async () => {
    if (!viagemId) return;

    try {
      setIsLoading(true);

      // Chamar a função delete_viagem que criamos
      const { error } = await supabase
        .rpc('delete_viagem', { viagem_id: viagemId });

      if (error) {
        throw error;
      }

      toast.success("Viagem excluída com sucesso!");
      navigate("/dashboard/viagens");
    } catch (err) {
      console.error("Erro ao excluir viagem:", err);
      toast.error("Erro ao excluir viagem");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle to show only pending payments
  const togglePendingPayments = () => {
    setFilterStatus(filterStatus === "pendente" ? null : "pendente");
  };

  // Funções auxiliares
  const getPassageirosDoOnibusAtual = () => {
    if (selectedOnibusId === null) {
      return passageiroPorOnibus.sem_onibus || [];
    }
    return passageiroPorOnibus[selectedOnibusId] || [];
  };

  const getOnibusAtual = () => {
    if (selectedOnibusId === null) return null;
    return onibusList.find(o => o.id === selectedOnibusId);
  };

  // Filtro de passageiros
  const filterPassageiros = (passageiros: PassageiroDisplay[], searchTerm: string): PassageiroDisplay[] => {
    if (!searchTerm.trim()) return passageiros.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    return passageiros.filter(passageiro => {
      // Usar texto pré-processado para busca mais rápida
      if (passageiro.normalizedSearchText) {
        const normalizedSearchTerm = normalizeText(searchTerm);
        return passageiro.normalizedSearchText.includes(normalizedSearchTerm);
      }

      // Fallback para busca tradicional se não houver pré-processamento
      const searchFields = [
        passageiro.nome,
        passageiro.telefone,
        passageiro.email,
        passageiro.cpf,
        passageiro.cidade,
        passageiro.setor_maracana,
        passageiro.cidade_embarque,
        passageiro.observacoes,
        passageiro.status_pagamento,
        passageiro.forma_pagamento,
        ...(passageiro.passeioNames || [])
      ];

      return matchesAllTerms(searchFields, searchTerm);
    }).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  };

  // Buscar dados financeiros da viagem (receitas e despesas)
  const fetchFinancialData = async (viagemId: string) => {
    try {
      // Buscar receitas da viagem
      const { data: receitasData, error: receitasError } = await supabase
        .from('receitas')
        .select('valor')
        .eq('viagem_id', viagemId);

      if (receitasError) throw receitasError;

      // Buscar despesas da viagem
      const { data: despesasData, error: despesasError } = await supabase
        .from('viagem_despesas')
        .select('valor')
        .eq('viagem_id', viagemId);

      if (despesasError) throw despesasError;

      // Calcular totais
      const totalReceitasValue = receitasData?.reduce((sum, r) => sum + Number(r.valor), 0) || 0;
      const totalDespesasValue = despesasData?.reduce((sum, d) => sum + Number(d.valor), 0) || 0;

      setTotalReceitas(totalReceitasValue);
      setTotalDespesas(totalDespesasValue);

    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    }
  };

  return {
    viagem,
    passageiros,
    filteredPassageiros,
    searchTerm,
    setSearchTerm,
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
    passageiroPorOnibus,
    contadorPassageiros,
    countPendentePayment,
    filterStatus,
    handleSelectOnibus,
    handleDelete,
    getPassageirosDoOnibusAtual,
    getOnibusAtual,
    fetchPassageiros,
    fetchFinancialData,
    togglePendingPayments
  };
}
