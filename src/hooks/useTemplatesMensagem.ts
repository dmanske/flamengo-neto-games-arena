import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface TemplateMensagem {
  id: string;
  nome: string;
  emoji: string;
  categoria: 'confirmacao' | 'pagamento' | 'embarque' | 'pos-jogo' | 'geral';
  texto: string;
  preview: string;
  variaveis: string[];
}

// Templates padrão do sistema
const TEMPLATES_PADRAO: TemplateMensagem[] = [
  {
    id: 'confirmacao-viagem',
    nome: 'Confirmação de Viagem',
    emoji: '🏆',
    categoria: 'confirmacao',
    texto: `Olá {nome}! 👋

Confirmamos sua participação na viagem para o jogo:
🔥 FLAMENGO x {adversario}
📅 Data do jogo: {dataJogo}
🚌 Saída: {dataViagem} às {horario}
📍 Local de saída: {localSaida}

Valor: R$ {valor}
Ônibus: {onibus}

Nos vemos lá! Vamos Flamengo! 🔴⚫`,
    preview: 'Olá João! Confirmamos sua participação na viagem...',
    variaveis: ['nome', 'adversario', 'dataJogo', 'dataViagem', 'horario', 'localSaida', 'valor', 'onibus']
  },
  {
    id: 'lembrete-pagamento',
    nome: 'Lembrete de Pagamento',
    emoji: '💰',
    categoria: 'pagamento',
    texto: `Oi {nome}! 

Lembrando que o prazo para pagamento da viagem do Flamengo está chegando:

🎯 Jogo: FLAMENGO x {adversario} 
📅 {dataJogo}
💰 Valor: R$ {valor}

Por favor, confirme seu pagamento até {prazo}.

Qualquer dúvida, me chama! 📱`,
    preview: 'Oi João! Lembrando que o prazo para pagamento...',
    variaveis: ['nome', 'adversario', 'dataJogo', 'valor', 'prazo']
  },
  {
    id: 'info-embarque',
    nome: 'Informações de Embarque',
    emoji: '🚌',
    categoria: 'embarque',
    texto: `{nome}, bom dia! ☀️

Informações importantes para hoje:
🚌 Ônibus: {onibus}
⏰ Saída: {horario} em ponto
📍 Local: {localSaida}

⚠️ Chegue 15 min antes!
🎒 Leve documento com foto

Vamos juntos torcer pelo Mengão! 🔴⚫`,
    preview: 'João, bom dia! Informações importantes para hoje...',
    variaveis: ['nome', 'onibus', 'horario', 'localSaida']
  },
  {
    id: 'pos-jogo',
    nome: 'Pós-Jogo',
    emoji: '🎉',
    categoria: 'pos-jogo',
    texto: `E aí {nome}! 

Que jogo foi esse! 🔥
Obrigado por estar conosco na torcida pelo Flamengo!

Já estamos organizando a próxima viagem.
Quer garantir sua vaga? Me chama! 📱

#SempreFlamengo 🔴⚫`,
    preview: 'E aí João! Que jogo foi esse! Obrigado por estar...',
    variaveis: ['nome']
  },
  {
    id: 'bom-dia',
    nome: 'Bom Dia Geral',
    emoji: '☀️',
    categoria: 'geral',
    texto: `Bom dia, {nome}! ☀️

Esperamos que esteja tudo bem com você!

Em breve teremos novidades sobre as próximas viagens do Flamengo.

Fique ligado! 🔴⚫`,
    preview: 'Bom dia, João! Esperamos que esteja tudo bem...',
    variaveis: ['nome']
  },
  {
    id: 'convite-grupo',
    nome: 'Convite para Grupo',
    emoji: '👥',
    categoria: 'geral',
    texto: `Oi {nome}! 👋

Você foi adicionado ao nosso grupo de viagens do Flamengo!

Aqui você vai receber:
📢 Informações das viagens
🎯 Jogos disponíveis
💬 Conversar com outros torcedores

Seja bem-vindo(a)! 🔴⚫`,
    preview: 'Oi João! Você foi adicionado ao nosso grupo...',
    variaveis: ['nome']
  }
];

export const useTemplatesMensagem = () => {
  const [templates] = useState<TemplateMensagem[]>(TEMPLATES_PADRAO);

  // Função para substituir variáveis no template
  const substituirVariaveis = useCallback((texto: string, dados: Record<string, string>) => {
    let textoFinal = texto;
    
    // Substituir variáveis no formato {variavel}
    Object.entries(dados).forEach(([chave, valor]) => {
      const regex = new RegExp(`\\{${chave}\\}`, 'g');
      textoFinal = textoFinal.replace(regex, valor || `{${chave}}`);
    });

    return textoFinal;
  }, []);

  // Função para copiar texto para clipboard
  const copiarTexto = useCallback(async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      toast.success('📋 Texto copiado para a área de transferência!');
      return true;
    } catch (error) {
      console.error('Erro ao copiar texto:', error);
      toast.error('❌ Erro ao copiar texto');
      return false;
    }
  }, []);

  // Função para colar texto do clipboard
  const colarTexto = useCallback(async (): Promise<string | null> => {
    try {
      const texto = await navigator.clipboard.readText();
      if (texto) {
        toast.success('📥 Texto colado da área de transferência!');
        return texto;
      }
      toast.warning('📋 Área de transferência vazia');
      return null;
    } catch (error) {
      console.error('Erro ao colar texto:', error);
      toast.error('❌ Erro ao acessar área de transferência');
      return null;
    }
  }, []);

  // Obter templates por categoria
  const getTemplatesPorCategoria = useCallback((categoria?: string) => {
    if (!categoria) return templates;
    return templates.filter(t => t.categoria === categoria);
  }, [templates]);

  // Obter template por ID
  const getTemplatePorId = useCallback((id: string) => {
    return templates.find(t => t.id === id);
  }, [templates]);

  return {
    templates,
    substituirVariaveis,
    copiarTexto,
    colarTexto,
    getTemplatesPorCategoria,
    getTemplatePorId
  };
};