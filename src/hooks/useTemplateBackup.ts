/**
 * =====================================================
 * HOOK - BACKUP E RECUPERAÇÃO DE TEMPLATES
 * =====================================================
 * 
 * Hook para gerenciar backup automático, versionamento
 * e recuperação de templates excluídos.
 */

import { useState, useCallback } from 'react';
import { WhatsAppTemplate } from '@/types/whatsapp-templates';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// =====================================================
// INTERFACES
// =====================================================

interface TemplateBackup {
  id: string;
  template_id: string;
  template_data: WhatsAppTemplate;
  operacao: 'create' | 'update' | 'delete';
  usuario_id?: string;
  created_at: string;
}

interface BackupStats {
  total_backups: number;
  templates_deletados: number;
  ultima_operacao: string;
}

// =====================================================
// HOOK PRINCIPAL
// =====================================================

export function useTemplateBackup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // =====================================================
  // FUNÇÕES DE BACKUP
  // =====================================================
  
  /**
   * Criar backup de template
   */
  const criarBackup = useCallback(async (
    template: WhatsAppTemplate,
    operacao: 'create' | 'update' | 'delete'
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from('whatsapp_templates_backup')
        .insert([{
          template_id: template.id,
          template_data: template,
          operacao,
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
    } catch (err) {
      console.error('Erro ao criar backup:', err);
      // Não mostrar erro para o usuário, pois backup é transparente
    }
  }, []);
  
  /**
   * Listar backups de um template
   */
  const listarBackups = useCallback(async (templateId: string): Promise<TemplateBackup[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('whatsapp_templates_backup')
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao listar backups';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Listar templates excluídos
   */
  const listarTemplatesExcluidos = useCallback(async (): Promise<TemplateBackup[]> => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('whatsapp_templates_backup')
        .select('*')
        .eq('operacao', 'delete')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Filtrar apenas o backup mais recente de cada template
      const templatesUnicos = new Map<string, TemplateBackup>();
      
      data?.forEach(backup => {
        if (!templatesUnicos.has(backup.template_id)) {
          templatesUnicos.set(backup.template_id, backup);
        }
      });
      
      return Array.from(templatesUnicos.values());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao listar templates excluídos';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Recuperar template excluído
   */
  const recuperarTemplate = useCallback(async (backup: TemplateBackup): Promise<WhatsAppTemplate | null> => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar se template já existe
      const { data: existingTemplate } = await supabase
        .from('whatsapp_templates')
        .select('id')
        .eq('id', backup.template_id)
        .single();
      
      if (existingTemplate) {
        throw new Error('Template já existe na base de dados');
      }
      
      // Restaurar template
      const templateData = {
        ...backup.template_data,
        id: backup.template_id, // Manter o ID original
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .insert([templateData])
        .select()
        .single();
      
      if (error) throw error;
      
      // Criar backup da recuperação
      await criarBackup(data, 'create');
      
      toast.success('Template recuperado com sucesso!');
      return data;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao recuperar template';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [criarBackup]);
  
  /**
   * Obter estatísticas de backup
   */
  const obterEstatisticas = useCallback(async (): Promise<BackupStats> => {
    try {
      // Total de backups
      const { count: totalBackups } = await supabase
        .from('whatsapp_templates_backup')
        .select('*', { count: 'exact', head: true });
      
      // Templates deletados únicos
      const { data: deletedTemplates } = await supabase
        .from('whatsapp_templates_backup')
        .select('template_id')
        .eq('operacao', 'delete');
      
      const templatesExcluidosUnicos = new Set(deletedTemplates?.map(t => t.template_id) || []);
      
      // Última operação
      const { data: ultimaOperacao } = await supabase
        .from('whatsapp_templates_backup')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      return {
        total_backups: totalBackups || 0,
        templates_deletados: templatesExcluidosUnicos.size,
        ultima_operacao: ultimaOperacao?.created_at || 'Nunca'
      };
      
    } catch (err) {
      console.error('Erro ao obter estatísticas:', err);
      return {
        total_backups: 0,
        templates_deletados: 0,
        ultima_operacao: 'Erro'
      };
    }
  }, []);
  
  /**
   * Exportar todos os templates
   */
  const exportarTemplates = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Criar arquivo JSON para download
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Criar link de download
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `whatsapp-templates-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
      
      toast.success('Templates exportados com sucesso!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao exportar templates';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Importar templates de arquivo
   */
  const importarTemplates = useCallback(async (file: File): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Ler arquivo
      const text = await file.text();
      const templates = JSON.parse(text) as WhatsAppTemplate[];
      
      if (!Array.isArray(templates)) {
        throw new Error('Formato de arquivo inválido');
      }
      
      // Validar estrutura dos templates
      templates.forEach((template, index) => {
        if (!template.nome || !template.categoria || !template.mensagem) {
          throw new Error(`Template ${index + 1}: Dados obrigatórios faltando`);
        }
      });
      
      // Importar templates (sem ID para evitar conflitos)
      const templatesParaImportar = templates.map(template => ({
        nome: template.nome,
        categoria: template.categoria,
        mensagem: template.mensagem,
        variaveis: template.variaveis || [],
        ativo: template.ativo ?? true
      }));
      
      const { data, error } = await supabase
        .from('whatsapp_templates')
        .insert(templatesParaImportar)
        .select();
      
      if (error) throw error;
      
      // Criar backups dos templates importados
      if (data) {
        for (const template of data) {
          await criarBackup(template, 'create');
        }
      }
      
      toast.success(`${data?.length || 0} templates importados com sucesso!`);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao importar templates';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [criarBackup]);
  
  // =====================================================
  // RETORNO DO HOOK
  // =====================================================
  
  return {
    // Estados
    loading,
    error,
    
    // Funções de backup
    criarBackup,
    listarBackups,
    listarTemplatesExcluidos,
    recuperarTemplate,
    obterEstatisticas,
    
    // Funções de import/export
    exportarTemplates,
    importarTemplates
  };
}