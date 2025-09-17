import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Fornecedor, FornecedorFormData, TipoFornecedor } from '@/types/fornecedores';

export const useFornecedores = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para tratar erros do Supabase
  const handleError = (error: any, operacao: string) => {
    console.error(`Erro ao ${operacao}:`, error);
    
    if (error.code === '23505') { // Unique constraint violation
      toast.error('Já existe um fornecedor com este nome e tipo');
    } else if (error.code === '23503') { // Foreign key violation
      toast.error('Não é possível excluir fornecedor com dados relacionados');
    } else if (error.code === '42501') { // Insufficient privilege
      toast.error('Você não tem permissão para realizar esta operação');
    } else {
      toast.error(`Erro ao ${operacao}. Tente novamente.`);
    }
    
    setError(error.message || `Erro ao ${operacao}`);
  };

  // Buscar todos os fornecedores
  const fetchFornecedores = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true });

      if (error) throw error;

      setFornecedores(data || []);
    } catch (err: any) {
      handleError(err, 'carregar fornecedores');
    } finally {
      setLoading(false);
    }
  };



  // Criar novo fornecedor
  const createFornecedor = async (fornecedorData: FornecedorFormData): Promise<Fornecedor | null> => {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .insert([{
          ...fornecedorData,
          ativo: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista local
      setFornecedores(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)));
      
      toast.success(`Fornecedor ${data.nome} cadastrado com sucesso`);
      return data;
    } catch (err: any) {
      handleError(err, 'cadastrar fornecedor');
      return null;
    }
  };

  // Atualizar fornecedor
  const updateFornecedor = async (id: string, fornecedorData: Partial<FornecedorFormData>): Promise<Fornecedor | null> => {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .update(fornecedorData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista local
      setFornecedores(prev => 
        prev.map(f => f.id === id ? data : f).sort((a, b) => a.nome.localeCompare(b.nome))
      );
      
      toast.success(`Fornecedor ${data.nome} atualizado com sucesso`);
      return data;
    } catch (err: any) {
      handleError(err, 'atualizar fornecedor');
      return null;
    }
  };

  // Excluir fornecedor (soft delete)
  const deleteFornecedor = async (id: string): Promise<boolean> => {
    try {
      const fornecedor = fornecedores.find(f => f.id === id);
      
      const { error } = await supabase
        .from('fornecedores')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      // Remover da lista local
      setFornecedores(prev => prev.filter(f => f.id !== id));
      
      toast.success(`Fornecedor ${fornecedor?.nome} removido com sucesso`);
      return true;
    } catch (err: any) {
      handleError(err, 'excluir fornecedor');
      return false;
    }
  };

  // Filtrar fornecedores
  const filterFornecedores = (
    searchTerm: string = '',
    tipoFiltro: TipoFornecedor | 'todos' = 'todos'
  ): Fornecedor[] => {
    return fornecedores.filter(fornecedor => {
      // Filtro por tipo
      if (tipoFiltro !== 'todos' && fornecedor.tipo_fornecedor !== tipoFiltro) {
        return false;
      }

      // Filtro por termo de busca
      if (searchTerm.trim()) {
        const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);
        
        const fullText = [
          fornecedor.nome,
          fornecedor.email || '',
          fornecedor.telefone || '',
          fornecedor.whatsapp || '',
          fornecedor.contato_principal || '',
          fornecedor.endereco || ''
        ].join(' ').toLowerCase();

        return searchTerms.every(term => fullText.includes(term));
      }

      return true;
    });
  };

  // Buscar fornecedores por tipo
  const getFornecedoresByTipo = (tipo: TipoFornecedor): Fornecedor[] => {
    return fornecedores.filter(f => f.tipo_fornecedor === tipo);
  };

  // Contar fornecedores por tipo
  const getCountByTipo = (): Record<TipoFornecedor | 'total', number> => {
    const counts = fornecedores.reduce((acc, fornecedor) => {
      acc[fornecedor.tipo_fornecedor] = (acc[fornecedor.tipo_fornecedor] || 0) + 1;
      acc.total = (acc.total || 0) + 1;
      return acc;
    }, {} as Record<TipoFornecedor | 'total', number>);

    return counts;
  };

  // Carregar fornecedores na inicialização
  useEffect(() => {
    fetchFornecedores();
  }, []);

  return {
    // Estado
    fornecedores,
    loading,
    error,
    
    // Operações CRUD
    fetchFornecedores,
    createFornecedor,
    updateFornecedor,
    deleteFornecedor,
    
    // Utilitários
    filterFornecedores,
    getFornecedoresByTipo,
    getCountByTipo
  };
};