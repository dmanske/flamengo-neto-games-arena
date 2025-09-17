import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { MessageTemplate, MessageTemplateFormData, TipoFornecedor } from '@/types/fornecedores';

export const useMessageTemplates = () => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para tratar erros do Supabase
  const handleError = (error: any, operacao: string) => {
    console.error(`Erro ao ${operacao}:`, error);
    
    if (error.code === '23505') { // Unique constraint violation
      toast.error('Já existe um template com este nome para este tipo de fornecedor');
    } else if (error.code === '23503') { // Foreign key violation
      toast.error('Não é possível excluir template com dados relacionados');
    } else if (error.code === '42501') { // Insufficient privilege
      toast.error('Você não tem permissão para realizar esta operação');
    } else {
      toast.error(`Erro ao ${operacao}. Tente novamente.`);
    }
    
    setError(error.message || `Erro ao ${operacao}`);
  };

  // Buscar todos os templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('ativo', true)
        .order('tipo_fornecedor', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;

      setTemplates(data || []);
    } catch (err: any) {
      handleError(err, 'carregar templates');
    } finally {
      setLoading(false);
    }
  };

  // Buscar template por ID
  const getTemplateById = async (id: string): Promise<MessageTemplate | null> => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return data;
    } catch (err: any) {
      handleError(err, 'buscar template');
      return null;
    }
  };

  // Criar novo template
  const createTemplate = async (templateData: MessageTemplateFormData): Promise<MessageTemplate | null> => {
    try {
      // Extrair variáveis do corpo da mensagem
      const variaveis = extrairVariaveis(templateData.corpo_mensagem);

      const { data, error } = await supabase
        .from('message_templates')
        .insert([{
          ...templateData,
          variaveis_disponiveis: variaveis,
          ativo: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista local
      setTemplates(prev => [...prev, data].sort((a, b) => {
        if (a.tipo_fornecedor !== b.tipo_fornecedor) {
          return a.tipo_fornecedor.localeCompare(b.tipo_fornecedor);
        }
        return a.nome.localeCompare(b.nome);
      }));
      
      toast.success(`Template ${data.nome} criado com sucesso`);
      return data;
    } catch (err: any) {
      handleError(err, 'criar template');
      return null;
    }
  };

  // Atualizar template
  const updateTemplate = async (id: string, templateData: Partial<MessageTemplateFormData>): Promise<MessageTemplate | null> => {
    try {
      // Se o corpo da mensagem foi alterado, extrair novas variáveis
      const updateData = { ...templateData };
      if (templateData.corpo_mensagem) {
        updateData.variaveis_disponiveis = extrairVariaveis(templateData.corpo_mensagem);
      }

      const { data, error } = await supabase
        .from('message_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista local
      setTemplates(prev => 
        prev.map(t => t.id === id ? data : t).sort((a, b) => {
          if (a.tipo_fornecedor !== b.tipo_fornecedor) {
            return a.tipo_fornecedor.localeCompare(b.tipo_fornecedor);
          }
          return a.nome.localeCompare(b.nome);
        })
      );
      
      toast.success(`Template ${data.nome} atualizado com sucesso`);
      return data;
    } catch (err: any) {
      handleError(err, 'atualizar template');
      return null;
    }
  };

  // Excluir template (soft delete)
  const deleteTemplate = async (id: string): Promise<boolean> => {
    try {
      const template = templates.find(t => t.id === id);
      
      const { error } = await supabase
        .from('message_templates')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      // Remover da lista local
      setTemplates(prev => prev.filter(t => t.id !== id));
      
      toast.success(`Template ${template?.nome} removido com sucesso`);
      return true;
    } catch (err: any) {
      handleError(err, 'excluir template');
      return false;
    }
  };

  // Buscar templates por tipo de fornecedor
  const getTemplatesByTipo = (tipo: TipoFornecedor): MessageTemplate[] => {
    return templates.filter(t => t.tipo_fornecedor === tipo);
  };

  // Filtrar templates
  const filterTemplates = (
    searchTerm: string = '',
    tipoFiltro: TipoFornecedor | 'todos' = 'todos'
  ): MessageTemplate[] => {
    return templates.filter(template => {
      // Filtro por tipo
      if (tipoFiltro !== 'todos' && template.tipo_fornecedor !== tipoFiltro) {
        return false;
      }

      // Filtro por termo de busca
      if (searchTerm.trim()) {
        const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);
        
        const fullText = [
          template.nome,
          template.assunto,
          template.corpo_mensagem
        ].join(' ').toLowerCase();

        return searchTerms.every(term => fullText.includes(term));
      }

      return true;
    });
  };

  // Contar templates por tipo
  const getCountByTipo = (): Record<TipoFornecedor | 'total', number> => {
    const counts = templates.reduce((acc, template) => {
      acc[template.tipo_fornecedor] = (acc[template.tipo_fornecedor] || 0) + 1;
      acc.total = (acc.total || 0) + 1;
      return acc;
    }, {} as Record<TipoFornecedor | 'total', number>);

    return counts;
  };

  // Função auxiliar para extrair variáveis do texto
  const extrairVariaveis = (texto: string): string[] => {
    const regex = /\{([^}]+)\}/g;
    const variaveis: string[] = [];
    let match;

    while ((match = regex.exec(texto)) !== null) {
      const variavel = `{${match[1]}}`;
      if (!variaveis.includes(variavel)) {
        variaveis.push(variavel);
      }
    }

    return variaveis;
  };

  // Validar se template tem todas as variáveis necessárias
  const validarTemplate = (template: MessageTemplate): { valido: boolean; variaveisInvalidas: string[] } => {
    const variaveisValidas = [
      '{viagem_nome}', '{data_jogo}', '{adversario}', '{estadio}',
      '{quantidade_passageiros}', '{data_ida}', '{data_volta}',
      '{contato_responsavel}', '{fornecedor_nome}', '{fornecedor_contato}'
    ];

    const variaveisInvalidas = template.variaveis_disponiveis.filter(
      variavel => !variaveisValidas.includes(variavel)
    );

    return {
      valido: variaveisInvalidas.length === 0,
      variaveisInvalidas
    };
  };

  // Carregar templates na inicialização
  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    // Estado
    templates,
    loading,
    error,
    
    // Operações CRUD
    fetchTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    
    // Utilitários
    getTemplatesByTipo,
    filterTemplates,
    getCountByTipo,
    extrairVariaveis,
    validarTemplate
  };
};