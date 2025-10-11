import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/utils/formatters';
import { 
  ViagemSetorPreco, 
  ViagemSetorPrecoFormData, 
  ResumoIngressosViagem,
  EstadosSetoresPrecos,
  ErrosSetoresPrecos
} from '@/types/viagem-setores-precos';

export function useViagemSetoresPrecos(viagemId: string) {
  const [setoresPrecos, setSetoresPrecos] = useState<ViagemSetorPreco[]>([]);
  const [resumoIngressos, setResumoIngressos] = useState<ResumoIngressosViagem | null>(null);
  const [estados, setEstados] = useState<EstadosSetoresPrecos>({
    carregando: true,
    salvando: false,
    deletando: false
  });
  const [erros, setErros] = useState<ErrosSetoresPrecos>({});

  // Carregar preços dos setores da viagem
  const carregarSetoresPrecos = async () => {
    if (!viagemId) return;

    try {
      setEstados(prev => ({ ...prev, carregando: true }));
      setErros({});

      const { data, error } = await supabase
        .from('viagem_setores_precos')
        .select('*')
        .eq('viagem_id', viagemId)
        .order('setor_nome');

      if (error) {
        console.error('❌ Erro ao carregar preços dos setores:', error);
        setErros({ geral: 'Erro ao carregar preços dos setores' });
        return;
      }

      setSetoresPrecos(data || []);
      await calcularResumoIngressos(data || []);

    } catch (error) {
      console.error('❌ Erro inesperado ao carregar preços:', error);
      setErros({ geral: 'Erro inesperado ao carregar dados' });
    } finally {
      setEstados(prev => ({ ...prev, carregando: false }));
    }
  };

  // 🚀 NOVA FUNCIONALIDADE: Integrar com sistema financeiro
  const integrarComSistemaFinanceiro = async () => {
    if (!viagemId) return;

    // Buscar preços atuais do banco (não depender do estado)
    const { data: precosAtuais, error: errorPrecos } = await supabase
      .from('viagem_setores_precos')
      .select('*')
      .eq('viagem_id', viagemId);

    if (errorPrecos || !precosAtuais || precosAtuais.length === 0) {
      return;
    }

    try {

      // Buscar passageiros da viagem com setores definidos
      const { data: passageiros, error } = await supabase
        .from('viagem_passageiros')
        .select('setor_maracana')
        .eq('viagem_id', viagemId)
        .not('setor_maracana', 'is', null);

      if (error) return;

      // Contar passageiros por setor
      const passageirosPorSetor = (passageiros || []).reduce((acc, p) => {
        const setor = p.setor_maracana || 'Sem setor';
        acc[setor] = (acc[setor] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calcular totais
      let totalCusto = 0;
      let totalVenda = 0;
      let totalIngressos = 0;

      precosAtuais.forEach(preco => {
        const quantidade = passageirosPorSetor[preco.setor_nome] || 0;
        const custoTotal = quantidade * preco.preco_custo;
        const vendaTotal = quantidade * preco.preco_venda;

        totalCusto += custoTotal;
        totalVenda += vendaTotal;
        totalIngressos += quantidade;
      });

      if (totalCusto === 0 && totalVenda === 0) {
        return;
      }

      // 1. DESPESA: Custo dos ingressos (valor a pagar ao fornecedor)
      if (totalCusto > 0) {
        // Verificar se já existe despesa de ingressos para esta viagem
        const { data: despesaExistente, error: errorDespesa } = await supabase
          .from('viagem_despesas')
          .select('id, valor')
          .eq('viagem_id', viagemId)
          .eq('categoria', 'ingressos')
          .eq('fornecedor', 'Fornecedor de Ingressos - Automático')
          .single();

        if (errorDespesa && errorDespesa.code !== 'PGRST116') {
          return;
        }

        if (despesaExistente) {
          // Atualizar despesa existente
          await supabase
            .from('viagem_despesas')
            .update({
              valor: totalCusto,
              observacoes: `Custo automático dos ingressos - ${totalIngressos} ingressos - Atualizado em ${new Date().toLocaleString('pt-BR')}`
            })
            .eq('id', despesaExistente.id);
        } else {
          // Criar nova despesa
          await supabase
            .from('viagem_despesas')
            .insert({
              viagem_id: viagemId,
              fornecedor: 'Fornecedor de Ingressos - Automático',
              categoria: 'ingressos',
              subcategoria: `${totalIngressos} ingressos`,
              valor: totalCusto,
              forma_pagamento: 'A pagar',
              status: 'pendente',
              data_despesa: new Date().toISOString(),
              observacoes: `Custo automático dos ingressos - ${totalIngressos} ingressos - Criado em ${new Date().toLocaleString('pt-BR')}`
            });
        }
      }

      // 2. RECEITA: Valor de venda dos ingressos
      if (totalVenda > 0) {
        // Verificar se já existe receita de ingressos para esta viagem
        const { data: receitaExistente, error: errorReceita } = await supabase
          .from('viagem_receitas')
          .select('id, valor')
          .eq('viagem_id', viagemId)
          .eq('categoria', 'vendas')
          .eq('descricao', 'Venda de Ingressos - Automático')
          .single();

        if (errorReceita && errorReceita.code !== 'PGRST116') {
          return;
        }

        if (receitaExistente) {
          // Atualizar receita existente
          await supabase
            .from('viagem_receitas')
            .update({
              valor: totalVenda,
              observacoes: `Receita automática dos ingressos - ${totalIngressos} ingressos - Atualizado em ${new Date().toLocaleString('pt-BR')}`
            })
            .eq('id', receitaExistente.id);
        } else {
          // Criar nova receita
          await supabase
            .from('viagem_receitas')
            .insert({
              viagem_id: viagemId,
              descricao: 'Venda de Ingressos - Automático',
              categoria: 'vendas',
              valor: totalVenda,
              forma_pagamento: 'Vendas de ingressos',
              status: 'recebido',
              data_recebimento: new Date().toISOString(),
              observacoes: `Receita automática dos ingressos - ${totalIngressos} ingressos - Criado em ${new Date().toLocaleString('pt-BR')}`
            });
        }
      }

    } catch (error) {
      // Silenciar erros em produção
    }
  };

  // Calcular resumo financeiro dos ingressos
  const calcularResumoIngressos = async (precos: ViagemSetorPreco[]) => {
    if (!viagemId || precos.length === 0) {
      setResumoIngressos(null);
      return;
    }

    try {
      // Buscar passageiros da viagem com setores definidos
      const { data: passageiros, error } = await supabase
        .from('viagem_passageiros')
        .select('setor_maracana')
        .eq('viagem_id', viagemId)
        .not('setor_maracana', 'is', null);

      if (error) {
        console.error('❌ Erro ao buscar passageiros:', error);
        return;
      }

      // Contar passageiros por setor
      const passageirosPorSetor = (passageiros || []).reduce((acc, p) => {
        const setor = p.setor_maracana || 'Sem setor';
        acc[setor] = (acc[setor] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calcular custos e vendas por setor
      const custosPorSetor: Record<string, any> = {};
      let totalIngressos = 0;
      let totalCusto = 0;
      let totalVenda = 0;

      precos.forEach(preco => {
        const quantidade = passageirosPorSetor[preco.setor_nome] || 0;
        const custoTotal = quantidade * preco.preco_custo;
        const vendaTotal = quantidade * preco.preco_venda;
        const lucroTotal = vendaTotal - custoTotal;

        custosPorSetor[preco.setor_nome] = {
          quantidade,
          custo_unitario: preco.preco_custo,
          custo_total: custoTotal,
          venda_unitaria: preco.preco_venda,
          venda_total: vendaTotal,
          lucro_total: lucroTotal
        };

        totalIngressos += quantidade;
        totalCusto += custoTotal;
        totalVenda += vendaTotal;
      });

      const totalLucro = totalVenda - totalCusto;
      const margemPercentual = totalVenda > 0 ? (totalLucro / totalVenda) * 100 : 0;

      const novoResumo = {
        total_ingressos: totalIngressos,
        total_custo: totalCusto,
        total_venda: totalVenda,
        total_lucro: totalLucro,
        margem_percentual: margemPercentual,
        custos_por_setor: custosPorSetor
      };

      setResumoIngressos(novoResumo);

    } catch (error) {
      console.error('❌ Erro ao calcular resumo de ingressos:', error);
    }
  };

  // Salvar preços dos setores
  const salvarSetoresPrecos = async (setores: ViagemSetorPrecoFormData[]) => {
    if (!viagemId) {
      console.error('❌ ViagemId não fornecido para salvar preços');
      return false;
    }

    try {
      setEstados(prev => ({ ...prev, salvando: true }));
      setErros({});

      // Validar dados
      const errosValidacao: ErrosSetoresPrecos = {};
      let temErros = false;

      setores.forEach((setor, index) => {
        if (!setor.setor_nome.trim()) {
          errosValidacao[`setor_nome_${index}`] = 'Nome do setor é obrigatório';
          temErros = true;
        }
        if (setor.preco_custo < 0) {
          errosValidacao[`preco_custo_${index}`] = 'Preço de custo não pode ser negativo';
          temErros = true;
        }
        if (setor.preco_venda < 0) {
          errosValidacao[`preco_venda_${index}`] = 'Preço de venda não pode ser negativo';
          temErros = true;
        }
      });

      if (temErros) {
        console.error('❌ Erros de validação:', errosValidacao);
        setErros(errosValidacao);
        return false;
      }

      // Usar UPSERT para atualizar ou inserir
      const novosPrecos = setores.map(setor => ({
        viagem_id: viagemId,
        setor_nome: setor.setor_nome.trim(),
        preco_custo: setor.preco_custo,
        preco_venda: setor.preco_venda
      }));

      const { data, error: upsertError } = await supabase
        .from('viagem_setores_precos')
        .upsert(novosPrecos, {
          onConflict: 'viagem_id,setor_nome',
          ignoreDuplicates: false
        })
        .select();

      if (upsertError) {
        console.error('❌ Erro ao salvar preços:', upsertError);
        setErros({ geral: 'Erro ao salvar preços' });
        return false;
      }


      
      // 🚀 NOVA FUNCIONALIDADE: Integração automática com sistema financeiro
      await integrarComSistemaFinanceiro();
      
      await carregarSetoresPrecos();
      return true;

    } catch (error) {
      console.error('❌ Erro inesperado ao salvar preços:', error);
      setErros({ geral: 'Erro inesperado ao salvar dados' });
      return false;
    } finally {
      setEstados(prev => ({ ...prev, salvando: false }));
    }
  };

  // Deletar todos os preços da viagem
  const deletarSetoresPrecos = async () => {
    if (!viagemId) return false;

    try {
      setEstados(prev => ({ ...prev, deletando: true }));
      setErros({});

      // 1. Deletar lançamentos financeiros automáticos
      
      // Deletar despesa automática
      await supabase
        .from('viagem_despesas')
        .delete()
        .eq('viagem_id', viagemId)
        .eq('categoria', 'ingressos')
        .eq('fornecedor', 'Fornecedor de Ingressos - Automático');

      // Deletar receita automática
      await supabase
        .from('viagem_receitas')
        .delete()
        .eq('viagem_id', viagemId)
        .eq('categoria', 'vendas')
        .eq('descricao', 'Venda de Ingressos - Automático');

      // 2. Deletar preços dos setores
      const { error } = await supabase
        .from('viagem_setores_precos')
        .delete()
        .eq('viagem_id', viagemId);

      if (error) {
        console.error('❌ Erro ao deletar preços:', error);
        setErros({ geral: 'Erro ao deletar preços' });
        return false;
      }


      setSetoresPrecos([]);
      setResumoIngressos(null);
      return true;

    } catch (error) {
      console.error('❌ Erro inesperado ao deletar preços:', error);
      setErros({ geral: 'Erro inesperado ao deletar dados' });
      return false;
    } finally {
      setEstados(prev => ({ ...prev, deletando: false }));
    }
  };

  // Verificar se tem preços cadastrados
  const temPrecosCadastrados = setoresPrecos.length > 0;

  // Buscar preço de um setor específico
  const buscarPrecoSetor = (nomeSetor: string) => {
    return setoresPrecos.find(p => p.setor_nome === nomeSetor);
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    if (viagemId) {
      carregarSetoresPrecos();
    }
  }, [viagemId]);

  // Limpar apenas lançamentos financeiros automáticos (manter preços)
  const limparLancamentosFinanceiros = async () => {
    if (!viagemId) return false;

    try {


      // Deletar despesa automática
      const { error: errorDespesa } = await supabase
        .from('viagem_despesas')
        .delete()
        .eq('viagem_id', viagemId)
        .eq('categoria', 'ingressos')
        .eq('fornecedor', 'Fornecedor de Ingressos - Automático');

      // Deletar receita automática
      const { error: errorReceita } = await supabase
        .from('viagem_receitas')
        .delete()
        .eq('viagem_id', viagemId)
        .eq('categoria', 'vendas')
        .eq('descricao', 'Venda de Ingressos - Automático');

      if (errorDespesa || errorReceita) {
        console.error('❌ Erro ao limpar lançamentos:', { errorDespesa, errorReceita });
        return false;
      }


      return true;

    } catch (error) {
      console.error('❌ Erro inesperado ao limpar lançamentos:', error);
      return false;
    }
  };

  return {
    setoresPrecos,
    resumoIngressos,
    estados,
    erros,
    temPrecosCadastrados,
    carregarSetoresPrecos,
    salvarSetoresPrecos,
    deletarSetoresPrecos,
    limparLancamentosFinanceiros,
    buscarPrecoSetor
  };
}