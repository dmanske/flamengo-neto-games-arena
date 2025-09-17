import { TipoFornecedor } from '@/types/fornecedores';

// Constantes para tipos de fornecedores
export const TIPOS_FORNECEDOR: { value: TipoFornecedor; label: string; color: string }[] = [
  { value: 'ingressos', label: 'Ingressos', color: 'bg-blue-500' },
  { value: 'transporte', label: 'Transporte', color: 'bg-green-500' },
  { value: 'hospedagem', label: 'Hospedagem', color: 'bg-purple-500' },
  { value: 'alimentacao', label: 'Alimentação', color: 'bg-orange-500' },
  { value: 'eventos', label: 'Eventos/Entretenimento', color: 'bg-pink-500' }
];

// Variáveis disponíveis para templates de mensagens
export const VARIAVEIS_SISTEMA = {
  '{viagem_nome}': 'Nome da viagem',
  '{data_jogo}': 'Data do jogo',
  '{adversario}': 'Time adversário',
  '{estadio}': 'Local do jogo',
  '{quantidade_passageiros}': 'Número de passageiros',
  '{data_ida}': 'Data de ida',
  '{data_volta}': 'Data de volta',
  '{contato_responsavel}': 'Contato do responsável',
  '{fornecedor_nome}': 'Nome do fornecedor',
  '{fornecedor_contato}': 'Contato principal do fornecedor'
};

// Templates padrão por tipo de fornecedor
export const TEMPLATES_PADRAO = {
  ingressos: {
    nome: 'Solicitação de Ingressos',
    assunto: 'Solicitação de Ingressos - {viagem_nome}',
    corpo: `Olá {fornecedor_nome},

Espero que esteja bem!

Gostaria de solicitar um orçamento para ingressos da seguinte viagem:

🏆 Jogo: {adversario}
📅 Data: {data_jogo}
🏟️ Estádio: {estadio}
👥 Quantidade de passageiros: {quantidade_passageiros}
🗓️ Data de ida: {data_ida}
🗓️ Data de volta: {data_volta}

Por favor, me envie as opções disponíveis e valores.

Aguardo seu retorno.

Atenciosamente,
{contato_responsavel}
Flamengo Viagens`
  },
  transporte: {
    nome: 'Solicitação de Transporte',
    assunto: 'Solicitação de Transporte - {viagem_nome}',
    corpo: `Olá {fornecedor_nome},

Preciso de um orçamento para transporte da seguinte viagem:

🏆 Destino: {estadio}
📅 Data do jogo: {data_jogo}
👥 Quantidade de passageiros: {quantidade_passageiros}
🗓️ Data de ida: {data_ida}
🗓️ Data de volta: {data_volta}

Aguardo suas opções e valores.

Atenciosamente,
{contato_responsavel}
Flamengo Viagens`
  }
};

// Função para obter cor do tipo de fornecedor
export const getCorTipoFornecedor = (tipo: TipoFornecedor): string => {
  const tipoConfig = TIPOS_FORNECEDOR.find(t => t.value === tipo);
  return tipoConfig?.color || 'bg-gray-500';
};

// Função para obter label do tipo de fornecedor
export const getLabelTipoFornecedor = (tipo: TipoFornecedor): string => {
  const tipoConfig = TIPOS_FORNECEDOR.find(t => t.value === tipo);
  return tipoConfig?.label || tipo;
};