import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface DadosPresenca {
  total_passageiros: number;
  presentes: number;
  ausentes: number;
  taxa_presenca: number;
  status_viagem: 'planejada' | 'em_andamento' | 'realizada';
  passageiros_detalhados?: any[]; // Dados detalhados para os cards de resumo
}

export const useListaPresenca = (viagemId: string | undefined) => {
  const [dadosPresenca, setDadosPresenca] = useState<DadosPresenca>({
    total_passageiros: 0,
    presentes: 0,
    ausentes: 0,
    taxa_presenca: 0,
    status_viagem: 'planejada',
    passageiros_detalhados: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDadosPresenca = async () => {
      if (!viagemId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Buscar dados da viagem para verificar status
        const { data: viagem, error: viagemError } = await supabase
          .from('viagens')
          .select('data_jogo, status_viagem')
          .eq('id', viagemId)
          .single();

        if (viagemError) throw viagemError;

        // Buscar todos os passageiros da viagem com dados detalhados
        const { data: passageiros, error: passageirosError } = await supabase
          .from('viagem_passageiros')
          .select(`
            id, 
            status_presenca,
            cidade_embarque,
            setor_maracana,
            onibus_id,
            is_responsavel_onibus,
            clientes!viagem_passageiros_cliente_id_fkey (
              nome
            ),
            viagem_onibus!viagem_passageiros_onibus_id_fkey (
              numero_identificacao,
              empresa
            )
          `)
          .eq('viagem_id', viagemId);

        if (passageirosError) throw passageirosError;

        const totalPassageiros = passageiros?.length || 0;
        
        // Contar presenças (campo 'status_presenca' pode ser 'presente', 'pendente', 'ausente')
        const presentes = passageiros?.filter(p => p.status_presenca === 'presente').length || 0;
        const ausentes = passageiros?.filter(p => p.status_presenca === 'ausente').length || 0;
        
        // Calcular taxa de presença
        const taxaPresenca = totalPassageiros > 0 ? (presentes / totalPassageiros) * 100 : 0;

        // Determinar status da viagem baseado na data
        const dataJogo = new Date(viagem.data_jogo);
        const hoje = new Date();
        let statusViagem: 'planejada' | 'em_andamento' | 'realizada' = 'planejada';

        if (hoje > dataJogo) {
          // Se já passou da data do jogo
          if (presentes > 0 || ausentes > 0) {
            statusViagem = 'realizada'; // Tem dados de presença
          } else {
            statusViagem = 'realizada'; // Passou da data mas sem dados
          }
        } else if (hoje.toDateString() === dataJogo.toDateString()) {
          statusViagem = 'em_andamento'; // Dia do jogo
        }

        // Formatar dados detalhados dos passageiros
        const passageirosDetalhados = (passageiros || []).map((p: any) => ({
          id: p.id,
          nome: p.clientes?.nome || 'Nome não encontrado',
          status_presenca: p.status_presenca || 'pendente',
          presente: p.status_presenca === 'presente', // Converter para boolean para compatibilidade
          cidade_embarque: p.cidade_embarque || 'Não especificada',
          setor_maracana: p.setor_maracana || 'Não especificado',
          onibus_id: p.onibus_id,
          onibus_numero: p.viagem_onibus?.numero_identificacao || 'S/N',
          onibus_empresa: p.viagem_onibus?.empresa || 'N/A',
          is_responsavel_onibus: p.is_responsavel_onibus || false
        }));

        setDadosPresenca({
          total_passageiros: totalPassageiros,
          presentes,
          ausentes,
          taxa_presenca: taxaPresenca,
          status_viagem: statusViagem,
          passageiros_detalhados: passageirosDetalhados
        });

      } catch (error) {
        console.error('Erro ao buscar dados de presença:', error);
        // Em caso de erro, manter valores padrão
      } finally {
        setLoading(false);
      }
    };

    fetchDadosPresenca();
  }, [viagemId]);

  return {
    dadosPresenca,
    loading
  };
};