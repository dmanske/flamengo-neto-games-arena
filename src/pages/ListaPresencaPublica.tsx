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
import { LinksOnibusSection } from "@/components/lista-presenca/LinksOnibusSection";

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

const ListaPresencaPublica = () => {
  const { viagemId } = useParams<{ viagemId: string }>();
  const [viagem, setViagem] = useState<Viagem | null>(null);
  const [onibus, setOnibus] = useState<Onibus[]>([]);
  const [passageiros, setPassageiros] = useState<Passageiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCidade, setFiltroCidade] = useState<string>("todas");
  const [filtroSetor, setFiltroSetor] = useState<string>("todos");
  const [filtroPasseio, setFiltroPasseio] = useState<string>("todos");

  // Autenticação automática
  useEffect(() => {
    const loginAutomatico = async () => {
      try {
        console.log('🔐 Verificando autenticação...');

        // Verificar se já está autenticado
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          console.log('✅ Já autenticado');
          setAuthLoading(false);
          return;
        }

        console.log('🔑 Fazendo login automático com usuário padrão...');

        // Credenciais do usuário padrão para clientes
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'meulugar@netoviagens.com',
          password: 'meulugar'
        });

        if (error) {
          console.error('❌ Erro no login automático:', error);
        } else {
          console.log('✅ Login automático realizado com sucesso');
        }

      } catch (error) {
        console.error('❌ Erro na autenticação automática:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    loginAutomatico();
  }, []);

  useEffect(() => {
    if (!authLoading && viagemId) {
      fetchDados();
    }
  }, [authLoading, viagemId]);

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
    
    return { total, presentes, pendentes };
  };

  if (authLoading || loading) {
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

      {/* Links por Ônibus */}
      {onibus.length > 0 && (
        <LinksOnibusSection
          viagemId={viagemId || ""}
          onibus={onibus}
        />
      )}
    </div>
  );
};

export default ListaPresencaPublica;