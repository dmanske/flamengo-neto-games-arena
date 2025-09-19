import React, { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { useDebounce } from '@/hooks/useDebounce';
import { useListaPresencaOnibus } from '@/hooks/useListaPresencaOnibus';
import { OnibusHeader } from '@/components/lista-presenca/OnibusHeader';
import { EstatisticasOnibus } from '@/components/lista-presenca/EstatisticasOnibus';
import { ResumoSetor } from '@/components/lista-presenca/ResumoSetor';
import { FiltrosOnibus } from '@/components/lista-presenca/FiltrosOnibus';
import { PassageirosOnibusGrid } from '@/components/lista-presenca/PassageirosOnibusGrid';

const ListaPresencaOnibusPublica = () => {
  const { viagemId, onibusId } = useParams<{ viagemId: string; onibusId: string }>();
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroCidade, setFiltroCidade] = useState<string>("todas");
  const [filtroSetor, setFiltroSetor] = useState<string>("todos");
  const [filtroPasseio, setFiltroPasseio] = useState<string>("todos");
  
  // Estado para autenticação
  const [authChecked, setAuthChecked] = useState(false);
  
  // Debounce para busca
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Verificar autenticação automática
  useEffect(() => {
    const loginAutomatico = async () => {
      try {
        console.log('🔐 Verificando autenticação...');

        // Verificar se já está autenticado
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          console.log('✅ Já autenticado');
          setAuthChecked(true);
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
        setAuthChecked(true);
      }
    };

    loginAutomatico();
  }, []);

  // Hook principal (só executa após autenticação)
  const {
    viagem,
    onibus,
    passageiros,
    estatisticas,
    loading,
    error,
    atualizandoPresenca,
    togglePresenca
  } = useListaPresencaOnibus(authChecked ? viagemId : undefined, authChecked ? onibusId : undefined);

  // Filtrar passageiros com debounce
  const passageirosFiltrados = useMemo(() => {
    return passageiros.filter(p => {
      // Filtro de busca com debounce
      const matchSearch = !debouncedSearchTerm || 
        p.nome.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        p.telefone.includes(debouncedSearchTerm) ||
        p.cpf.includes(debouncedSearchTerm);
      
      // Filtro de status
      const matchStatus = filtroStatus === "todos" || p.status_presenca === filtroStatus;
      
      // Filtro de cidade
      const matchCidade = filtroCidade === "todas" || p.cidade_embarque === filtroCidade;
      
      // Filtro de setor
      const matchSetor = filtroSetor === "todos" || p.setor_maracana === filtroSetor;
      
      // Filtro de passeio
      const matchPasseio = filtroPasseio === "todos" || 
        (filtroPasseio === "com_passeios" && p.passeios && p.passeios.length > 0) ||
        (filtroPasseio === "sem_passeios" && (!p.passeios || p.passeios.length === 0)) ||
        (p.passeios && p.passeios.some(passeio => passeio.passeio_nome === filtroPasseio));
      
      return matchSearch && matchStatus && matchCidade && matchSetor && matchPasseio;
    });
  }, [passageiros, debouncedSearchTerm, filtroStatus, filtroCidade, filtroSetor, filtroPasseio]);

  // Loading state - incluir verificação de auth
  if (!authChecked || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Erro ao Carregar</h1>
        </div>
        
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Possíveis causas:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Ônibus não encontrado nesta viagem</li>
            <li>Viagem não encontrada</li>
            <li>Link inválido ou expirado</li>
            <li>Viagem não está em andamento</li>
          </ul>
        </div>
      </div>
    );
  }

  // Verificar se dados foram carregados
  if (!viagem || !onibus) {
    return (
      <div className="container py-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Dados não encontrados</h1>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Não foi possível carregar os dados da viagem ou do ônibus.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      {/* Cabeçalho da Página */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">Lista de Presença - Ônibus Específico</h1>
        <p className="text-muted-foreground mt-2">
          Controle de presença para o ônibus {onibus.numero_identificacao || 'S/N'}
        </p>
      </div>

      {/* Cabeçalho com informações do ônibus */}
      <OnibusHeader 
        onibus={onibus}
        viagem={viagem}
        estatisticas={estatisticas}
      />

      {/* Estatísticas detalhadas */}
      <EstatisticasOnibus 
        estatisticas={estatisticas}
        passageiros={passageiros}
      />

      {/* Resumo por Setor */}
      <ResumoSetor passageiros={passageiros} />

      {/* Filtros */}
      <FiltrosOnibus
        passageiros={passageiros}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filtroStatus={filtroStatus}
        setFiltroStatus={setFiltroStatus}
        filtroCidade={filtroCidade}
        setFiltroCidade={setFiltroCidade}
        filtroSetor={filtroSetor}
        setFiltroSetor={setFiltroSetor}
        filtroPasseio={filtroPasseio}
        setFiltroPasseio={setFiltroPasseio}
        passageirosFiltrados={passageirosFiltrados}
      />

      {/* Grid de Passageiros */}
      <PassageirosOnibusGrid
        passageiros={passageirosFiltrados}
        onTogglePresenca={togglePresenca}
        atualizandoPresenca={atualizandoPresenca}
        viagemEmAndamento={viagem?.status_viagem === 'Em andamento'}
      />


    </div>
  );
};

export default ListaPresencaOnibusPublica;