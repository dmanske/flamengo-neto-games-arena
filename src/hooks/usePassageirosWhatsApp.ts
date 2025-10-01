import { useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Passageiro {
  id: string;
  nome?: string;
  telefone?: string;
  onibus_id?: string;
  clientes?: {
    nome?: string;
    telefone?: string;
  };
}

interface UsePassageirosWhatsAppReturn {
  passageirosFiltrados: Passageiro[];
  gerarListaNumeros: () => string;
  gerarArquivoVCF: () => void;
  registrarHistorico: (tipo: string, quantidade: number) => Promise<void>;
}

export const usePassageirosWhatsApp = (
  passageiros: Passageiro[],
  filtroOnibus: string,
  viagemId: string
): UsePassageirosWhatsAppReturn => {
  
  // Filtrar passageiros baseado no filtro de ônibus e telefone válido
  const passageirosFiltrados = useMemo(() => {
    return passageiros.filter(passageiro => {
      // Obter telefone do passageiro ou cliente
      const telefone = passageiro.telefone || passageiro.clientes?.telefone;
      
      // Filtrar apenas passageiros com telefone válido
      if (!telefone || telefone.trim() === '') return false;
      
      // Validar se telefone tem pelo menos 10 dígitos
      const telefoneNumeros = telefone.replace(/\D/g, '');
      if (telefoneNumeros.length < 10) return false;
      
      // Aplicar filtro de ônibus se não for "todos"
      if (filtroOnibus !== 'todos' && passageiro.onibus_id !== filtroOnibus) {
        return false;
      }
      
      return true;
    });
  }, [passageiros, filtroOnibus]);
  
  // Gerar lista de números no formato internacional
  const gerarListaNumeros = useCallback(() => {
    return passageirosFiltrados
      .map(passageiro => {
        const telefone = passageiro.telefone || passageiro.clientes?.telefone || '';
        const telefoneNumeros = telefone.replace(/\D/g, '');
        
        // Adicionar código do país se não tiver
        const telefoneCompleto = telefoneNumeros.startsWith('55') 
          ? `+${telefoneNumeros}` 
          : `+55${telefoneNumeros}`;
          
        return telefoneCompleto;
      })
      .join('\n');
  }, [passageirosFiltrados]);
  
  // Gerar e baixar arquivo VCF
  const gerarArquivoVCF = useCallback(() => {
    try {
      const vcfContent = passageirosFiltrados
        .map((passageiro, index) => {
          const telefone = passageiro.telefone || passageiro.clientes?.telefone || '';
          const telefoneNumeros = telefone.replace(/\D/g, '');
          const telefoneCompleto = telefoneNumeros.startsWith('55') 
            ? `+${telefoneNumeros}` 
            : `+55${telefoneNumeros}`;
          
          const nome = passageiro.nome || passageiro.clientes?.nome || `Passageiro ${index + 1}`;
          
          // Limpar nome para evitar caracteres especiais
          const nomeFormatado = nome.replace(/[^\w\s]/gi, '').trim();
          
          return `BEGIN:VCARD
VERSION:3.0
FN:${nomeFormatado}
N:${nomeFormatado};;;;
TEL;TYPE=CELL;VALUE=uri:tel:${telefoneCompleto}
TEL;TYPE=VOICE:${telefoneCompleto}
ORG:Flamengo Viagens
NOTE:Passageiro da viagem
END:VCARD`;
        })
        .join('\n');
      
      const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `passageiros-viagem-${new Date().toISOString().split('T')[0]}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast.success('Arquivo de contatos baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar arquivo VCF:', error);
      toast.error('Erro ao gerar arquivo de contatos');
    }
  }, [passageirosFiltrados]);
  
  // Registrar histórico de ações
  const registrarHistorico = useCallback(async (tipo: string, quantidade: number) => {
    try {
      const { error } = await supabase
        .from('historico_whatsapp_massa')
        .insert({
          viagem_id: viagemId,
          tipo_acao: tipo,
          quantidade_destinatarios: quantidade,
          filtro_aplicado: filtroOnibus,
          data_acao: new Date().toISOString()
        });
      
      if (error) {
        console.error('Erro ao registrar histórico:', error);
      }
    } catch (error) {
      console.error('Erro ao registrar histórico:', error);
    }
  }, [viagemId, filtroOnibus]);
  
  return {
    passageirosFiltrados,
    gerarListaNumeros,
    gerarArquivoVCF,
    registrarHistorico
  };
};