
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
  cidade: string;
  cpf: string;
  setor_maracana: string;
  status_pagamento: string;
  forma_pagamento: string;
  cliente_id: string;
  viagem_passageiro_id: string;
  valor: number | null;
  desconto: number | null;
  onibus_id?: string | null;
  viagem_id: string;
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

  useEffect(() => {
    if (!viagemId) return;
    fetchViagemData(viagemId);
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

  const fetchViagemData = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Carregar dados da viagem
      const { data: viagemData, error: viagemError } = await supabase
        .from("viagens")
        .select("*")
        .eq("id", id)
        .single();
      
      if (viagemError) throw viagemError;
      setViagem(viagemData);
      
      // Calcular valor potencial total (valor padrão * capacidade)
      if (viagemData.valor_padrao && viagemData.capacidade_onibus) {
        const valorTotal = viagemData.valor_padrao * viagemData.capacidade_onibus;
        setValorPotencialTotal(valorTotal);
      }
      
      // Carregar ônibus da viagem
      await fetchOnibus(id);

      // Carregar passageiros da viagem
      await fetchPassageiros(id);
      
    } catch (err) {
      console.error("Erro ao buscar detalhes da viagem:", err);
      toast({
        description: "Erro ao carregar detalhes da viagem",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOnibus = async (viagemId: string) => {
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
      toast({
        description: "Erro ao carregar dados dos ônibus",
        variant: "destructive"
      });
    }
  };

  const fetchPassageiros = async (viagemId: string) => {
    try {
      // Buscar passageiros da viagem com dados do cliente usando a relação específica
      // Adicionamos '!viagem_passageiros_cliente_id_fkey' para especificar exatamente qual relação usar
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
          clientes!viagem_passageiros_cliente_id_fkey (id, nome, telefone, cidade, cpf)
        `)
        .eq("viagem_id", viagemId);
      
      if (error) throw error;
      
      // Formatar os dados para exibição
      const formattedPassageiros: PassageiroDisplay[] = (data || []).map((item: any) => ({
        id: item.clientes.id,
        nome: item.clientes.nome,
        telefone: item.clientes.telefone,
        cidade: item.clientes.cidade,
        cpf: item.clientes.cpf,
        setor_maracana: item.setor_maracana,
        status_pagamento: item.status_pagamento,
        forma_pagamento: item.forma_pagamento || "Pix",
        cliente_id: item.cliente_id,
        viagem_passageiro_id: item.id,
        valor: item.valor || 0,
        desconto: item.desconto || 0,
        onibus_id: item.onibus_id,
        viagem_id: item.viagem_id
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
      toast({
        description: "Erro ao carregar passageiros",
        variant: "destructive"
      });
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
      
      toast({
        description: "Viagem excluída com sucesso!"
      });
      navigate("/dashboard/viagens");
    } catch (err) {
      console.error("Erro ao excluir viagem:", err);
      toast({
        description: "Erro ao excluir viagem",
        variant: "destructive"
      });
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
    if (!searchTerm) return passageiros;
    
    const termLower = searchTerm.toLowerCase();
    return passageiros.filter(p => 
      p.nome.toLowerCase().includes(termLower) ||
      p.cpf.includes(termLower) ||
      p.telefone.includes(termLower) ||
      p.cidade.toLowerCase().includes(termLower) ||
      p.setor_maracana.toLowerCase().includes(termLower) ||
      p.status_pagamento.toLowerCase().includes(termLower) ||
      p.forma_pagamento.toLowerCase().includes(termLower) ||
      (p.valor !== null && p.valor.toString().includes(termLower)) ||
      (p.desconto !== null && p.desconto.toString().includes(termLower))
    );
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
