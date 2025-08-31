import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Ingresso, 
  IngressoFormData, 
  FiltrosIngressos, 
  OrdenacaoIngressos,
  ResumoFinanceiroIngressos,
  EstadosIngressos,
  ErrosIngressos
} from '@/types/ingressos';

export function useIngressos() {
  const [ingressos, setIngressos] = useState<Ingresso[]>([]);
  const [resumoFinanceiro, setResumoFinanceiro] = useState<ResumoFinanceiroIngressos | null>(null);
  const [estados, setEstados] = useState<EstadosIngressos>({
    carregando: false,
    salvando: false,
    deletando: false,
    carregandoPagamentos: false,
    salvandoPagamento: false,
    deletandoPagamento: false
  });
  const [erros, setErros] = useState<ErrosIngressos>({});

  // Função para buscar ingressos
  const buscarIngressos = useCallback(async (
    filtros?: FiltrosIngressos,
    ordenacao?: OrdenacaoIngressos,
    limite?: number,
    offset?: number
  ) => {
    setEstados(prev => ({ ...prev, carregando: true }));
    setErros({});

    try {
      let query = supabase
        .from('ingressos')
        .select(`
          *,
          cliente:clientes(id, nome, telefone, email, cpf, data_nascimento),
          viagem:viagens(id, adversario, data_jogo)
        `);

      // Aplicar filtros
      if (filtros) {
        if (filtros.cliente_id) {
          query = query.eq('cliente_id', filtros.cliente_id);
        }
        if (filtros.situacao_financeira) {
          query = query.eq('situacao_financeira', filtros.situacao_financeira);
        }
        if (filtros.local_jogo) {
          query = query.eq('local_jogo', filtros.local_jogo);
        }
        if (filtros.data_inicio) {
          query = query.gte('jogo_data', filtros.data_inicio);
        }
        if (filtros.data_fim) {
          query = query.lte('jogo_data', filtros.data_fim);
        }
        if (filtros.adversario) {
          query = query.ilike('adversario', `%${filtros.adversario}%`);
        }
        if (filtros.setor_estadio) {
          query = query.ilike('setor_estadio', `%${filtros.setor_estadio}%`);
        }
      }

      // Aplicar ordenação
      if (ordenacao) {
        const { campo, direcao } = ordenacao;
        if (campo === 'cliente_nome') {
          // Para ordenar por nome do cliente, precisamos fazer join
          query = query.order('cliente.nome', { ascending: direcao === 'asc' });
        } else {
          query = query.order(campo, { ascending: direcao === 'asc' });
        }
      } else {
        // Ordenação padrão: mais recentes primeiro
        query = query.order('jogo_data', { ascending: false });
      }

      // Aplicar paginação
      if (limite) {
        query = query.limit(limite);
      }
      if (offset) {
        query = query.range(offset, offset + (limite || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar ingressos:', error);
        setErros({ geral: 'Erro ao carregar ingressos' });
        toast.error('Erro ao carregar ingressos');
        return;
      }

      // Debug removido para focar na criação

      setIngressos(data || []);
    } catch (error) {
      console.error('Erro inesperado ao buscar ingressos:', error);
      setErros({ geral: 'Erro inesperado ao carregar ingressos' });
      toast.error('Erro inesperado ao carregar ingressos');
    } finally {
      setEstados(prev => ({ ...prev, carregando: false }));
    }
  }, []);

  // Função para buscar resumo financeiro
  const buscarResumoFinanceiro = useCallback(async (filtros?: FiltrosIngressos) => {
    try {
      let query = supabase.from('ingressos').select('*');

      // Aplicar os mesmos filtros da busca principal
      if (filtros) {
        if (filtros.cliente_id) query = query.eq('cliente_id', filtros.cliente_id);
        if (filtros.situacao_financeira) query = query.eq('situacao_financeira', filtros.situacao_financeira);
        if (filtros.local_jogo) query = query.eq('local_jogo', filtros.local_jogo);
        if (filtros.data_inicio) query = query.gte('jogo_data', filtros.data_inicio);
        if (filtros.data_fim) query = query.lte('jogo_data', filtros.data_fim);
        if (filtros.adversario) query = query.ilike('adversario', `%${filtros.adversario}%`);
        if (filtros.setor_estadio) query = query.ilike('setor_estadio', `%${filtros.setor_estadio}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar resumo financeiro:', error);
        return;
      }

      if (data) {
        const resumo: ResumoFinanceiroIngressos = {
          total_ingressos: data.length,
          total_receita: data.reduce((sum, ing) => sum + ing.valor_final, 0),
          total_custo: data.reduce((sum, ing) => sum + ing.preco_custo, 0),
          total_lucro: data.reduce((sum, ing) => sum + ing.lucro, 0),
          margem_media: data.length > 0 
            ? data.reduce((sum, ing) => sum + ing.margem_percentual, 0) / data.length 
            : 0,
          ingressos_pendentes: data.filter(ing => ing.situacao_financeira === 'pendente').length,
          ingressos_pagos: data.filter(ing => ing.situacao_financeira === 'pago').length,
          ingressos_cancelados: data.filter(ing => ing.situacao_financeira === 'cancelado').length,
          valor_pendente: data
            .filter(ing => ing.situacao_financeira === 'pendente')
            .reduce((sum, ing) => sum + ing.valor_final, 0),
          valor_recebido: data
            .filter(ing => ing.situacao_financeira === 'pago')
            .reduce((sum, ing) => sum + ing.valor_final, 0)
        };

        setResumoFinanceiro(resumo);
      }
    } catch (error) {
      console.error('Erro ao calcular resumo financeiro:', error);
    }
  }, []);

  // Função para criar ingresso
  const criarIngresso = useCallback(async (dados: IngressoFormData): Promise<boolean> => {
    setEstados(prev => ({ ...prev, salvando: true }));
    setErros({});

    try {
      let viagemId = dados.viagem_id;

      // Se não há viagem vinculada, criar uma automaticamente
      if (!viagemId && dados.adversario && dados.jogo_data) {
        console.log('Criando viagem automática para:', dados.adversario, dados.jogo_data);
        
        // Verificar se já existe uma viagem para o mesmo adversário e data
        const { data: viagemExistente, error: errorBusca } = await supabase
          .from('viagens')
          .select('id')
          .eq('adversario', dados.adversario)
          .eq('data_jogo', dados.jogo_data)
          .single();

        if (errorBusca && errorBusca.code !== 'PGRST116') {
          console.error('Erro ao buscar viagem existente:', errorBusca);
        }

        if (viagemExistente) {
          // Usar viagem existente
          viagemId = viagemExistente.id;
          console.log('Usando viagem existente:', viagemId);
        } else {
          // Criar nova viagem
          const { data: novaViagem, error: errorViagem } = await supabase
            .from('viagens')
            .insert([{
              adversario: dados.adversario,
              data_jogo: dados.jogo_data,
              valor_padrao: dados.valor_final || 100, // Usar valor do ingresso como padrão
              capacidade_onibus: 50, // Valor padrão
              status_viagem: 'Aberta' // Status padrão para permitir novos ingressos
            }])
            .select('id')
            .single();

          if (errorViagem) {
            console.error('Erro ao criar viagem automática:', errorViagem);
            setErros({ geral: 'Erro ao criar viagem para o ingresso' });
            toast.error('Erro ao criar viagem para o ingresso');
            return false;
          }

          viagemId = novaViagem.id;
          console.log('Nova viagem criada:', viagemId);
          toast.success(`Viagem criada automaticamente: ${dados.adversario}`);
        }
      }

      // Validação: verificar se o cliente já tem ingresso para a mesma viagem
      if (viagemId) {
        const { data: ingressoExistente, error: errorValidacao } = await supabase
          .from('ingressos')
          .select('id')
          .eq('cliente_id', dados.cliente_id)
          .eq('viagem_id', viagemId)
          .single();

        if (errorValidacao && errorValidacao.code !== 'PGRST116') {
          console.error('Erro ao validar ingresso duplicado:', errorValidacao);
          setErros({ geral: 'Erro ao validar dados do ingresso' });
          toast.error('Erro ao validar dados do ingresso');
          return false;
        }

        if (ingressoExistente) {
          setErros({ geral: 'Este cliente já possui ingresso para esta viagem' });
          toast.error('Este cliente já possui ingresso para esta viagem');
          return false;
        }
      }

      // Remover campos calculados que não podem ser inseridos (colunas geradas)
      const { valorFinalCalculado, lucro, margem_percentual, ...dadosParaInserir } = dados;
      
      // Usar a viagem criada/encontrada
      dadosParaInserir.viagem_id = viagemId;
      
      const { data, error } = await supabase
        .from('ingressos')
        .insert([dadosParaInserir])
        .select()
        .single();

      // Ingresso inserido

      if (error) {
        console.error('Erro ao criar ingresso:', error);
        setErros({ geral: 'Erro ao salvar ingresso' });
        toast.error('Erro ao salvar ingresso');
        return false;
      }

      // Se o ingresso foi criado como "pago", criar automaticamente um registro de pagamento
      if (data && dados.situacao_financeira === 'pago') {
        // Usar o valor_final calculado pelo banco ou o valor passado como fallback
        const valorPagamento = data.valor_final || valorFinalCalculado || 0;
        
        if (valorPagamento <= 0) {
          console.warn('Valor inválido para pagamento automático:', valorPagamento);
          return true; // Não falhar a criação do ingresso
        }
        
        const dadosPagamento = {
          ingresso_id: data.id,
          valor_pago: valorPagamento,
          data_pagamento: new Date().toISOString().split('T')[0], // Só a data, sem hora
          forma_pagamento: 'dinheiro', // Padrão, pode ser alterado depois
          observacoes: 'Pagamento registrado automaticamente na criação do ingresso'
        };
        
        const { data: pagamentoData, error: errorPagamento } = await supabase
          .from('historico_pagamentos_ingressos')
          .insert([dadosPagamento])
          .select()
          .single();

        if (errorPagamento) {
          console.error('Erro ao criar pagamento automático:', errorPagamento);
          toast.warning('Ingresso criado, mas houve erro ao registrar o pagamento. Registre manualmente.');
        } else {
          console.log('Pagamento automático criado com sucesso:', pagamentoData?.id);
        }
      }

      toast.success('Ingresso cadastrado com sucesso!');
      
      // Recarregar lista
      await buscarIngressos();
      await buscarResumoFinanceiro();
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao criar ingresso:', error);
      setErros({ geral: 'Erro inesperado ao salvar ingresso' });
      toast.error('Erro inesperado ao salvar ingresso');
      return false;
    } finally {
      setEstados(prev => ({ ...prev, salvando: false }));
    }
  }, [buscarIngressos, buscarResumoFinanceiro]);

  // Função para atualizar ingresso
  const atualizarIngresso = useCallback(async (id: string, dados: Partial<IngressoFormData>): Promise<boolean> => {
    setEstados(prev => ({ ...prev, salvando: true }));
    setErros({});

    try {
      // Buscar o ingresso atual para comparar o status e dados
      const { data: ingressoAtual, error: errorBusca } = await supabase
        .from('ingressos')
        .select('situacao_financeira, valor_final, cliente_id, viagem_id')
        .eq('id', id)
        .single();

      if (errorBusca) {
        console.error('Erro ao buscar ingresso atual:', errorBusca);
        setErros({ geral: 'Erro ao buscar dados do ingresso' });
        toast.error('Erro ao buscar dados do ingresso');
        return false;
      }

      // Validação: se está mudando cliente ou viagem, verificar duplicação
      const mudouCliente = dados.cliente_id && dados.cliente_id !== ingressoAtual.cliente_id;
      const mudouViagem = dados.viagem_id !== undefined && dados.viagem_id !== ingressoAtual.viagem_id;
      
      if ((mudouCliente || mudouViagem) && dados.viagem_id) {
        const clienteParaValidar = dados.cliente_id || ingressoAtual.cliente_id;
        
        const { data: ingressoExistente, error: errorValidacao } = await supabase
          .from('ingressos')
          .select('id')
          .eq('cliente_id', clienteParaValidar)
          .eq('viagem_id', dados.viagem_id)
          .neq('id', id) // Excluir o próprio ingresso da validação
          .single();

        if (errorValidacao && errorValidacao.code !== 'PGRST116') {
          console.error('Erro ao validar ingresso duplicado:', errorValidacao);
          setErros({ geral: 'Erro ao validar dados do ingresso' });
          toast.error('Erro ao validar dados do ingresso');
          return false;
        }

        if (ingressoExistente) {
          setErros({ geral: 'Este cliente já possui ingresso para esta viagem' });
          toast.error('Este cliente já possui ingresso para esta viagem');
          return false;
        }
      }

      const { error } = await supabase
        .from('ingressos')
        .update(dados)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar ingresso:', error);
        setErros({ geral: 'Erro ao atualizar ingresso' });
        toast.error('Erro ao atualizar ingresso');
        return false;
      }

      // Se o status mudou de "pendente" para "pago", criar um pagamento automático
      if (ingressoAtual.situacao_financeira === 'pendente' && dados.situacao_financeira === 'pago') {
        // Criando pagamento automático
        
        const valorPagamento = dados.valor_final || ingressoAtual.valor_final;
        
        const { error: errorPagamento } = await supabase
          .from('historico_pagamentos_ingressos')
          .insert([{
            ingresso_id: id,
            valor_pago: valorPagamento,
            data_pagamento: new Date().toISOString().split('T')[0], // Só a data, sem hora
            forma_pagamento: 'dinheiro', // Padrão, pode ser alterado depois
            observacoes: 'Pagamento registrado automaticamente ao marcar como pago'
          }]);

        if (errorPagamento) {
          console.error('Erro ao criar pagamento automático:', errorPagamento);
          toast.warning('Ingresso atualizado, mas houve erro ao registrar o pagamento. Registre manualmente.');
        } else {
          // Pagamento criado com sucesso
        }
      }

      toast.success('Ingresso atualizado com sucesso!');
      
      // Recarregar lista
      await buscarIngressos();
      await buscarResumoFinanceiro();
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar ingresso:', error);
      setErros({ geral: 'Erro inesperado ao atualizar ingresso' });
      toast.error('Erro inesperado ao atualizar ingresso');
      return false;
    } finally {
      setEstados(prev => ({ ...prev, salvando: false }));
    }
  }, [buscarIngressos, buscarResumoFinanceiro]);

  // Função para deletar ingresso
  const deletarIngresso = useCallback(async (id: string): Promise<boolean> => {
    setEstados(prev => ({ ...prev, deletando: true }));
    setErros({});

    try {
      const { error } = await supabase
        .from('ingressos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar ingresso:', error);
        setErros({ geral: 'Erro ao deletar ingresso' });
        toast.error('Erro ao deletar ingresso');
        return false;
      }

      toast.success('Ingresso deletado com sucesso!');
      
      // Recarregar lista
      await buscarIngressos();
      await buscarResumoFinanceiro();
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao deletar ingresso:', error);
      setErros({ geral: 'Erro inesperado ao deletar ingresso' });
      toast.error('Erro inesperado ao deletar ingresso');
      return false;
    } finally {
      setEstados(prev => ({ ...prev, deletando: false }));
    }
  }, [buscarIngressos, buscarResumoFinanceiro]);

  // Função para buscar ingresso por ID
  const buscarIngressoPorId = useCallback(async (id: string): Promise<Ingresso | null> => {
    try {
      const { data, error } = await supabase
        .from('ingressos')
        .select(`
          *,
          cliente:clientes(id, nome, telefone, email),
          viagem:viagens(id, destino, data_ida)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao buscar ingresso:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro inesperado ao buscar ingresso:', error);
      return null;
    }
  }, []);

  // Função para calcular valores em tempo real
  const calcularValores = useCallback((precoVenda: number, desconto: number, precoCusto: number) => {
    const valorFinal = Math.max(0, precoVenda - desconto);
    const lucro = valorFinal - precoCusto;
    const margemPercentual = valorFinal > 0 ? (lucro / valorFinal) * 100 : 0;

    return {
      valorFinal,
      lucro,
      margemPercentual: Math.round(margemPercentual * 100) / 100 // 2 casas decimais
    };
  }, []);

  // Função para agrupar ingressos por jogo
  const agruparIngressosPorJogo = useCallback(async (ingressos: Ingresso[]) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Filtrar apenas jogos futuros
    const ingressosFuturos = ingressos.filter(ingresso => {
      const dataJogo = new Date(ingresso.jogo_data);
      return dataJogo >= hoje;
    });

    // Agrupar por jogo (adversario + data + local)
    const grupos = ingressosFuturos.reduce((acc, ingresso) => {
      const chaveJogo = `${ingresso.adversario}-${ingresso.jogo_data}-${ingresso.local_jogo}`;
      
      if (!acc[chaveJogo]) {
        acc[chaveJogo] = {
          adversario: ingresso.adversario,
          jogo_data: ingresso.jogo_data,
          local_jogo: ingresso.local_jogo,
          logo_adversario: null, // TODO: Usar ingresso.logo_adversario após migration
          logo_flamengo: "https://logodetimes.com/times/flamengo/logo-flamengo-256.png",
          ingressos: [],
          total_ingressos: 0,
          receita_total: 0,
          lucro_total: 0,
          ingressos_pendentes: 0,
          ingressos_pagos: 0,
        };
      }
      
      acc[chaveJogo].ingressos.push(ingresso);
      acc[chaveJogo].total_ingressos++;
      acc[chaveJogo].receita_total += ingresso.valor_final;
      acc[chaveJogo].lucro_total += ingresso.lucro;
      
      // Se ainda não tem logo, tentar pegar do ingresso atual
      if (!acc[chaveJogo].logo_adversario && ingresso.logo_adversario) {
        acc[chaveJogo].logo_adversario = ingresso.logo_adversario;
      }
      
      switch (ingresso.situacao_financeira) {
        case 'pago':
          acc[chaveJogo].ingressos_pagos++;
          break;
        case 'pendente':
          acc[chaveJogo].ingressos_pendentes++;
          break;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Para jogos sem logo, buscar da tabela adversarios (uma única consulta)
    const gruposArray = Object.values(grupos);
    const adversariosSemLogo = gruposArray
      .filter(grupo => !grupo.logo_adversario)
      .map(grupo => grupo.adversario);

    if (adversariosSemLogo.length > 0) {
      try {
        const { data: adversarios } = await supabase
          .from('adversarios')
          .select('nome, logo_url')
          .in('nome', adversariosSemLogo);
        
        if (adversarios) {
          // Criar mapa de logos
          const logosMap = adversarios.reduce((acc, adv) => {
            acc[adv.nome] = adv.logo_url;
            return acc;
          }, {} as Record<string, string>);

          // Aplicar logos aos grupos
          gruposArray.forEach(grupo => {
            if (!grupo.logo_adversario && logosMap[grupo.adversario]) {
              grupo.logo_adversario = logosMap[grupo.adversario];
            }
          });
        }
      } catch (error) {
        console.error('Erro ao buscar logos dos adversários:', error);
        // Ignorar erro, manter sem logo
      }
    }

    // Converter para array e ordenar por data (mais próximos primeiro)
    return gruposArray.sort((a: any, b: any) => {
      return new Date(a.jogo_data).getTime() - new Date(b.jogo_data).getTime();
    });
  }, []);

  // Função para buscar logos dos adversários
  const buscarLogosAdversarios = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('adversarios')
        .select('nome, logo_url');

      if (error) {
        console.error('Erro ao buscar logos dos adversários:', error);
        return {};
      }

      // Criar mapa nome -> logo_url
      const logosMap = (data || []).reduce((acc, adversario) => {
        acc[adversario.nome] = adversario.logo_url;
        return acc;
      }, {} as Record<string, string>);

      return logosMap;
    } catch (error) {
      console.error('Erro inesperado ao buscar logos:', error);
      return {};
    }
  }, []);

  // Função para buscar adversários por termo de busca
  const buscarAdversarios = useCallback(async (termo: string) => {
    if (!termo || termo.trim().length < 2) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('adversarios')
        .select('id, nome, logo_url')
        .ilike('nome', `%${termo.trim()}%`)
        .neq('nome', 'Flamengo') // Excluir o Flamengo da lista
        .order('nome')
        .limit(10); // Limitar a 10 resultados para performance

      if (error) {
        console.error('Erro ao buscar adversários:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro inesperado ao buscar adversários:', error);
      return [];
    }
  }, []);

  // Função para buscar logo de um adversário específico
  const buscarLogoAdversario = useCallback(async (nomeAdversario: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('adversarios')
        .select('logo_url')
        .eq('nome', nomeAdversario)
        .single();

      if (error || !data) {
        return '';
      }

      return data.logo_url || '';
    } catch (error) {
      console.error('Erro ao buscar logo do adversário:', error);
      return '';
    }
  }, []);

  // Função para atualizar logo de um adversário na tabela adversarios
  const atualizarLogoJogo = useCallback(async (
    adversario: string,
    dataJogo: string,
    localJogo: string,
    novoLogo: string
  ): Promise<boolean> => {
    setEstados(prev => ({ ...prev, salvando: true }));
    setErros({});

    try {
      // Verificar se o adversário já existe na tabela adversarios
      const { data: adversarioExistente, error: buscarError } = await supabase
        .from('adversarios')
        .select('id, nome')
        .eq('nome', adversario)
        .single();

      if (buscarError && buscarError.code !== 'PGRST116') {
        console.error('Erro ao buscar adversário:', buscarError);
        setErros({ geral: 'Erro ao buscar adversário' });
        toast.error('Erro ao buscar adversário');
        return false;
      }

      if (adversarioExistente) {
        // Atualizar logo do adversário existente
        const { error: updateError } = await supabase
          .from('adversarios')
          .update({ logo_url: novoLogo })
          .eq('id', adversarioExistente.id);

        if (updateError) {
          console.error('Erro ao atualizar logo do adversário:', updateError);
          setErros({ geral: 'Erro ao atualizar logo do adversário' });
          toast.error('Erro ao atualizar logo do adversário');
          return false;
        }

        toast.success('Logo do adversário atualizado com sucesso!');
      } else {
        // Criar novo adversário com o logo
        const { error: insertError } = await supabase
          .from('adversarios')
          .insert([{
            nome: adversario,
            logo_url: novoLogo
          }]);

        if (insertError) {
          console.error('Erro ao criar adversário:', insertError);
          setErros({ geral: 'Erro ao criar adversário' });
          toast.error('Erro ao criar adversário');
          return false;
        }

        toast.success('Adversário criado com logo atualizado!');
      }
      
      // Recarregar lista para refletir as mudanças
      await buscarIngressos();
      await buscarResumoFinanceiro();
      
      return true;
    } catch (error) {
      console.error('Erro inesperado ao atualizar logo do adversário:', error);
      setErros({ geral: 'Erro inesperado ao atualizar logo do adversário' });
      toast.error('Erro inesperado ao atualizar logo do adversário');
      return false;
    } finally {
      setEstados(prev => ({ ...prev, salvando: false }));
    }
  }, [buscarIngressos, buscarResumoFinanceiro]);

  // Carregar ingressos na inicialização
  useEffect(() => {
    // Hook inicializado
    buscarIngressos();
    buscarResumoFinanceiro();
  }, [buscarIngressos, buscarResumoFinanceiro]);

  return {
    // Estados
    ingressos,
    resumoFinanceiro,
    estados,
    erros,

    // Funções principais
    buscarIngressos,
    buscarResumoFinanceiro,
    criarIngresso,
    atualizarIngresso,
    deletarIngresso,
    buscarIngressoPorId,

    // Utilitários
    calcularValores,
    agruparIngressosPorJogo,
    buscarLogosAdversarios,
    buscarLogoAdversario,
    buscarAdversarios,
    atualizarLogoJogo,

    // Funções de limpeza
    limparErros: () => setErros({}),
    limparIngressos: () => setIngressos([])
  };
}