import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

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
  passeios_pagos?: string[];
  outro_passeio?: string | null;
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
  viagem_passageiro_id: string;
  valor: number | null;
  desconto: number | null;
  onibus_id?: string | null;
  viagem_id: string;
  passeio_cristo?: string;
  foto?: string | null;
  cidade_embarque: string;
  observacoes?: string | null;
  parcelas?: Array<{
    id: string;
    valor_parcela: number;
    forma_pagamento: string;
    data_pagamento: string;
    observacoes?: string;
  }>;
  passeios?: Array<{
    passeio_nome: string;
    status: string;
  }>;
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
  const [valorPotencialTotal, setValorPotencialTotal] = useState<number>(0);
  const [countPendentePayment, setCountPendentePayment] = useState<number>(0);

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

  const fetchViagemData = async (id: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('viagens')
        .select('*')
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

    try {
      // Buscar passageiros da viagem com dados do cliente usando a relação específica
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
            status
          )
        `)
        .eq("viagem_id", viagemId);
      
      if (error) throw error;
      
      // Formatar os dados para exibição
      const formattedPassageiros: PassageiroDisplay[] = (data || []).map((item: any) => ({
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
        parcelas: item.viagem_passageiros_parcelas,
        passeios: item.passageiro_passeios || []
      }));
      
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
      
      formattedPassageiros.forEach(passageiro => {
        const valor = (passageiro.valor || 0) - (passageiro.desconto || 0);
        arrecadado += valor;
        
        if (passageiro.status_pagamento === "Pago") {
          pago += valor;
        } else {
          pendente += valor;
          countPendente++;
        }
      });
      
      setTotalArrecadado(arrecadado);
      setTotalPago(pago);
      setTotalPendente(pendente);
      setCountPendentePayment(countPendente);
      
    } catch (err) {
      console.error("Erro ao buscar passageiros:", err);
      toast.error("Erro ao carregar passageiros");
    }
  };

  // Função para agrupar passageiros por ônibus
  const agruparPassageirosPorOnibus = (passageiros: PassageiroDisplay[]) => {
    const agrupados: Record<string, PassageiroDisplay[]> = {
      semOnibus: []
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
        agrupados.semOnibus.push(passageiro);
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
      return passageiroPorOnibus.semOnibus || [];
    }
    return passageiroPorOnibus[selectedOnibusId] || [];
  };

  const getOnibusAtual = () => {
    if (selectedOnibusId === null) return null;
    return onibusList.find(o => o.id === selectedOnibusId);
  };

  // Filtro de passageiros
  const filterPassageiros = (passageiros: PassageiroDisplay[], searchTerm: string): PassageiroDisplay[] => {
    if (!searchTerm) return passageiros.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const termLower = searchTerm.toLowerCase();
    return passageiros.filter(p => 
      p.nome.toLowerCase().includes(termLower) ||
      p.cpf.includes(termLower) ||
      p.telefone.includes(termLower) ||
      p.cidade.toLowerCase().includes(termLower) ||
      p.setor_maracana.toLowerCase().includes(termLower) ||
      p.status_pagamento.toLowerCase().includes(termLower) ||
      p.forma_pagamento.toLowerCase().includes(termLower) ||
      p.cidade_embarque.toLowerCase().includes(termLower) ||
      (p.valor !== null && p.valor.toString().includes(termLower)) ||
      (p.desconto !== null && p.desconto.toString().includes(termLower)) ||
      (p.passeio_cristo && (
        (termLower === 'sim' && p.passeio_cristo === 'sim') ||
        (termLower === 'nao' && p.passeio_cristo === 'nao') ||
        (termLower === 'passeio' && (p.passeio_cristo === 'sim' || p.passeio_cristo === 'nao'))
      ))
    ).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
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
    togglePendingPayments
  };
}
