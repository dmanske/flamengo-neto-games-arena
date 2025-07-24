// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface InteracaoComunicacao {
  id: string;
  data_hora: string;
  tipo: 'whatsapp' | 'email' | 'ligacao';
  conteudo: string;
  status?: 'enviado' | 'lido' | 'respondido' | 'erro';
  template_usado?: string;
  viagem_adversario?: string;
  viagem_data?: string;
}

export interface ComunicacaoCliente {
  resumo: {
    ultima_interacao: string;
    preferencia_contato: 'whatsapp' | 'email' | 'telefone';
    total_whatsapp: number;
    total_email: number;
    total_ligacoes: number;
  };
  timeline: InteracaoComunicacao[];
}

export const useClienteComunicacao = (clienteId: string) => {
  const [comunicacao, setComunicacao] = useState<ComunicacaoCliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clienteId) {
      setError('ID do cliente não fornecido');
      setLoading(false);
      return;
    }

    const fetchComunicacaoCliente = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Buscar histórico de cobrança (comunicação existente)
        const { data: viagensPassageiro, error: viagensError } = await supabase
          .from('viagem_passageiros')
          .select(`
            id,
            viagens!viagem_passageiros_viagem_id_fkey (
              adversario,
              data_jogo
            )
          `)
          .eq('cliente_id', clienteId);

        if (viagensError) {
          throw viagensError;
        }

        if (!viagensPassageiro || viagensPassageiro.length === 0) {
          // Cliente sem viagens - sem histórico de comunicação
          setComunicacao({
            resumo: {
              ultima_interacao: 'Nunca',
              preferencia_contato: 'whatsapp',
              total_whatsapp: 0,
              total_email: 0,
              total_ligacoes: 0,
            },
            timeline: [],
          });
          return;
        }

        // 2. Buscar histórico de cobrança
        const viagemPassageiroIds = viagensPassageiro.map(vp => vp.id);
        
        const { data: historicoCobranca, error: cobrancaError } = await supabase
          .from('viagem_cobranca_historico')
          .select('*')
          .in('viagem_passageiro_id', viagemPassageiroIds)
          .order('data_tentativa', { ascending: false });

        if (cobrancaError) {
          console.error('Erro ao buscar histórico de cobrança:', cobrancaError);
        }

        // 3. Processar timeline de comunicação
        const timeline: InteracaoComunicacao[] = [];
        let totalWhatsapp = 0;
        let totalEmail = 0;
        let totalLigacoes = 0;

        (historicoCobranca || []).forEach(cobranca => {
          const viagemInfo = viagensPassageiro.find(vp => vp.id === cobranca.viagem_passageiro_id);
          
          // Mapear tipo de contato
          let tipo: 'whatsapp' | 'email' | 'ligacao' = 'whatsapp';
          if (cobranca.tipo_contato === 'email') {
            tipo = 'email';
            totalEmail++;
          } else if (cobranca.tipo_contato === 'telefone' || cobranca.tipo_contato === 'ligacao') {
            tipo = 'ligacao';
            totalLigacoes++;
          } else {
            tipo = 'whatsapp';
            totalWhatsapp++;
          }

          // Gerar conteúdo baseado no template
          let conteudo = 'Mensagem de cobrança enviada';
          if (cobranca.template_usado) {
            switch (cobranca.template_usado) {
              case 'lembrete':
                conteudo = 'Lembrete de parcela próxima ao vencimento';
                break;
              case 'urgente':
                conteudo = 'Cobrança urgente - parcela em atraso';
                break;
              case 'primeira_cobranca':
                conteudo = 'Primeira cobrança de parcela vencida';
                break;
              case 'segunda_cobranca':
                conteudo = 'Segunda tentativa de cobrança';
                break;
              default:
                conteudo = `Cobrança via ${tipo} - ${cobranca.template_usado}`;
            }
          }

          timeline.push({
            id: cobranca.id,
            data_hora: cobranca.data_tentativa,
            tipo,
            conteudo,
            status: cobranca.status_envio as 'enviado' | 'lido' | 'respondido' | 'erro' || 'enviado',
            template_usado: cobranca.template_usado,
            viagem_adversario: viagemInfo?.viagens?.adversario,
            viagem_data: viagemInfo?.viagens?.data_jogo,
          });
        });

        // 4. Determinar preferência de contato
        let preferencia: 'whatsapp' | 'email' | 'telefone' = 'whatsapp';
        if (totalEmail > totalWhatsapp && totalEmail > totalLigacoes) {
          preferencia = 'email';
        } else if (totalLigacoes > totalWhatsapp && totalLigacoes > totalEmail) {
          preferencia = 'telefone';
        }

        // 5. Última interação
        const ultimaInteracao = timeline.length > 0 
          ? new Date(timeline[0].data_hora).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Nunca';

        // 6. Montar resultado
        const resultado: ComunicacaoCliente = {
          resumo: {
            ultima_interacao: ultimaInteracao,
            preferencia_contato: preferencia,
            total_whatsapp: totalWhatsapp,
            total_email: totalEmail,
            total_ligacoes: totalLigacoes,
          },
          timeline: timeline.slice(0, 50), // Limitar a 50 interações mais recentes
        };

        setComunicacao(resultado);
      } catch (err: any) {
        console.error('Erro ao buscar comunicação do cliente:', err);
        setError(err.message || 'Erro ao carregar histórico de comunicação');
      } finally {
        setLoading(false);
      }
    };

    fetchComunicacaoCliente();
  }, [clienteId]);

  const refetch = () => {
    if (clienteId) {
      setLoading(true);
      // Re-executar o useEffect
    }
  };

  return { comunicacao, loading, error, refetch };
};