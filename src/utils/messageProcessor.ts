import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Fornecedor, MessageTemplate, MensagemGerada } from '@/types/fornecedores';

// Interface para dados da viagem (usando estrutura existente)
interface ViagemData {
  id: string;
  nome: string;
  adversario?: string;
  estadio?: string;
  data_jogo?: string;
  data_ida?: string;
  data_volta?: string;
  quantidade_passageiros?: number;
}

// Função principal para processar mensagem
export const processarMensagem = (
  template: MessageTemplate,
  fornecedor: Fornecedor,
  viagem: ViagemData,
  contatoResponsavel: string = 'Flamengo Viagens'
): MensagemGerada => {
  const variaveis = criarMapaVariaveis(fornecedor, viagem, contatoResponsavel);
  
  const assuntoProcessado = substituirVariaveis(template.assunto, variaveis);
  const corpoProcessado = substituirVariaveis(template.corpo_mensagem, variaveis);

  return {
    assunto: assuntoProcessado,
    corpo: corpoProcessado,
    fornecedor,
    viagem,
    template
  };
};

// Criar mapa de variáveis para substituição
const criarMapaVariaveis = (
  fornecedor: Fornecedor,
  viagem: ViagemData,
  contatoResponsavel: string
): Record<string, string> => {
  return {
    '{viagem_nome}': viagem.nome || 'Viagem não informada',
    '{data_jogo}': viagem.data_jogo ? formatarData(viagem.data_jogo) : 'Data não informada',
    '{adversario}': viagem.adversario || 'Adversário não informado',
    '{estadio}': viagem.estadio || 'Estádio não informado',
    '{quantidade_passageiros}': viagem.quantidade_passageiros?.toString() || '0',
    '{data_ida}': viagem.data_ida ? formatarData(viagem.data_ida) : 'Data não informada',
    '{data_volta}': viagem.data_volta ? formatarData(viagem.data_volta) : 'Data não informada',
    '{contato_responsavel}': contatoResponsavel,
    '{fornecedor_nome}': fornecedor.nome,
    '{fornecedor_contato}': fornecedor.contato_principal || fornecedor.nome
  };
};

// Substituir variáveis no texto
const substituirVariaveis = (texto: string, variaveis: Record<string, string>): string => {
  let textoProcessado = texto;
  
  Object.entries(variaveis).forEach(([variavel, valor]) => {
    const regex = new RegExp(escapeRegex(variavel), 'g');
    textoProcessado = textoProcessado.replace(regex, valor);
  });
  
  return textoProcessado;
};

// Formatar data para exibição
const formatarData = (dataString: string): string => {
  try {
    const data = new Date(dataString);
    return format(data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dataString;
  }
};

// Escapar caracteres especiais para regex
const escapeRegex = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Gerar URL do WhatsApp
export const gerarUrlWhatsApp = (telefone: string, mensagem: string): string => {
  // Limpar telefone (remover formatação)
  const telefoneClean = telefone.replace(/\D/g, '');
  
  // Adicionar código do país se não tiver
  const telefoneCompleto = telefoneClean.startsWith('55') ? telefoneClean : `55${telefoneClean}`;
  
  // Codificar mensagem para URL
  const mensagemCodificada = encodeURIComponent(mensagem);
  
  return `https://web.whatsapp.com/send?phone=${telefoneCompleto}&text=${mensagemCodificada}`;
};

// Gerar URL do email
export const gerarUrlEmail = (email: string, assunto: string, corpo: string): string => {
  const assuntoCodificado = encodeURIComponent(assunto);
  const corpoCodificado = encodeURIComponent(corpo);
  
  return `mailto:${email}?subject=${assuntoCodificado}&body=${corpoCodificado}`;
};

// Validar dados de contato
export const validarDadosContato = (fornecedor: Fornecedor): {
  temWhatsApp: boolean;
  temEmail: boolean;
  telefoneValido: boolean;
  emailValido: boolean;
} => {
  const telefoneRegex = /^(\(\d{2}\)\s?)?\d{4,5}-?\d{4}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  const temWhatsApp = !!fornecedor.whatsapp;
  const temEmail = !!fornecedor.email;
  const telefoneValido = temWhatsApp && telefoneRegex.test(fornecedor.whatsapp);
  const emailValido = temEmail && emailRegex.test(fornecedor.email);
  
  return {
    temWhatsApp,
    temEmail,
    telefoneValido,
    emailValido
  };
};

// Função para abrir WhatsApp
export const abrirWhatsApp = (fornecedor: Fornecedor, mensagem: string): boolean => {
  const { temWhatsApp, telefoneValido } = validarDadosContato(fornecedor);
  
  if (!temWhatsApp || !telefoneValido) {
    console.error('Dados de WhatsApp inválidos:', fornecedor);
    return false;
  }
  
  try {
    const url = gerarUrlWhatsApp(fornecedor.whatsapp!, mensagem);
    window.open(url, '_blank');
    return true;
  } catch (error) {
    console.error('Erro ao abrir WhatsApp:', error);
    return false;
  }
};

// Função para abrir email
export const abrirEmail = (fornecedor: Fornecedor, assunto: string, corpo: string): boolean => {
  const { temEmail, emailValido } = validarDadosContato(fornecedor);
  
  if (!temEmail || !emailValido) {
    console.error('Dados de email inválidos:', fornecedor);
    return false;
  }
  
  try {
    const url = gerarUrlEmail(fornecedor.email!, assunto, corpo);
    window.open(url, '_blank');
    return true;
  } catch (error) {
    console.error('Erro ao abrir email:', error);
    return false;
  }
};

// Função para prévia de mensagem com dados de exemplo
export const gerarPreviaComExemplo = (template: MessageTemplate): MensagemGerada => {
  const fornecedorExemplo: Fornecedor = {
    id: 'exemplo',
    nome: 'Fornecedor Exemplo',
    tipo_fornecedor: template.tipo_fornecedor,
    contato_principal: 'João Silva',
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  const viagemExemplo: ViagemData = {
    id: 'exemplo',
    nome: 'Flamengo x Vasco - Maracanã',
    adversario: 'Vasco',
    estadio: 'Maracanã',
    data_jogo: new Date().toISOString(),
    data_ida: new Date().toISOString(),
    data_volta: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    quantidade_passageiros: 45
  };
  
  return processarMensagem(template, fornecedorExemplo, viagemExemplo);
};

// Função para extrair informações de contato formatadas
export const formatarInfoContato = (fornecedor: Fornecedor): {
  whatsappFormatado?: string;
  emailFormatado?: string;
  telefoneFormatado?: string;
} => {
  const resultado: any = {};
  
  if (fornecedor.whatsapp) {
    resultado.whatsappFormatado = formatarTelefone(fornecedor.whatsapp);
  }
  
  if (fornecedor.telefone) {
    resultado.telefoneFormatado = formatarTelefone(fornecedor.telefone);
  }
  
  if (fornecedor.email) {
    resultado.emailFormatado = fornecedor.email.toLowerCase();
  }
  
  return resultado;
};

// Função auxiliar para formatar telefone
const formatarTelefone = (telefone: string): string => {
  const clean = telefone.replace(/\D/g, '');
  
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return telefone;
};