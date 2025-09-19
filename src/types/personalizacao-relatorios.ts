/**
 * Tipos e interfaces para o sistema de personalização completa de relatórios
 * 
 * Este arquivo contém todas as interfaces TypeScript necessárias para configurar
 * cada aspecto dos relatórios de viagem de forma granular.
 */

// ============================================================================
// CONFIGURAÇÃO PRINCIPAL
// ============================================================================

/**
 * Configuração completa de personalização de relatórios
 */
export interface PersonalizationConfig {
  header: HeaderConfig;
  passageiros: PassageirosConfig;
  onibus: OnibusConfig;
  passeios: PasseiosConfig;
  secoes: SecoesConfig;
  estilo: EstiloConfig;
  metadata: ConfigMetadata;
}

/**
 * Metadados da configuração para controle de versão e identificação
 */
export interface ConfigMetadata {
  nome: string;
  descricao?: string;
  categoria: 'oficial' | 'personalizado' | 'compartilhado';
  criadoEm: string;
  atualizadoEm: string;
  versao: string;
  autor?: string;
  tags?: string[];
}

// ============================================================================
// CONFIGURAÇÃO DO HEADER
// ============================================================================

/**
 * Configuração completa do cabeçalho do relatório
 */
export interface HeaderConfig {
  dadosJogo: DadosJogoConfig;
  dadosViagem: DadosViagemConfig;
  logos: LogosConfig;
  empresa: EmpresaConfig;
  totais: TotaisConfig;
  textoPersonalizado: TextoPersonalizadoConfig;
}

/**
 * Configuração dos dados do jogo no header
 */
export interface DadosJogoConfig {
  mostrarAdversario: boolean;
  mostrarDataHora: boolean;
  mostrarLocalJogo: boolean;
  mostrarNomeEstadio: boolean;
}

/**
 * Configuração dos dados da viagem no header
 */
export interface DadosViagemConfig {
  mostrarStatus: boolean;
  mostrarValorPadrao: boolean;
  mostrarSetorPadrao: boolean;
  mostrarRota: boolean;
  mostrarTipoPagamento: boolean;
}

/**
 * Configuração dos logos no header
 */
export interface LogosConfig {
  mostrarLogoEmpresa: boolean;
  mostrarLogoAdversario: boolean;
  mostrarLogoFlamengo: boolean;
  posicionamento: 'horizontal' | 'vertical' | 'personalizado';
  tamanhoLogos: 'pequeno' | 'medio' | 'grande';
}

/**
 * Configuração das informações da empresa no header
 */
export interface EmpresaConfig {
  mostrarNome: boolean;
  mostrarTelefone: boolean;
  mostrarEmail: boolean;
  mostrarEndereco: boolean;
  mostrarSite: boolean;
  mostrarRedesSociais: boolean;
}

/**
 * Configuração dos totais no header
 */
export interface TotaisConfig {
  mostrarTotalIngressos: boolean;
  mostrarTotalPassageiros: boolean;
  mostrarTotalArrecadado: boolean;
  mostrarDataGeracao: boolean;
}

/**
 * Configuração de textos personalizados no header
 */
export interface TextoPersonalizadoConfig {
  titulo?: string;
  subtitulo?: string;
  observacoes?: string;
  instrucoes?: string;
}

// ============================================================================
// CONFIGURAÇÃO DE PASSAGEIROS
// ============================================================================

/**
 * Configuração completa da lista de passageiros
 */
export interface PassageirosConfig {
  colunas: PassageiroColumn[];
  ordenacao: OrdenacaoConfig;
  agrupamento: AgrupamentoConfig;
  filtros: FiltrosPassageirosConfig;
}

/**
 * Configuração de uma coluna da lista de passageiros
 */
export interface PassageiroColumn {
  id: keyof PassageiroDisplay;
  label: string;
  visivel: boolean;
  largura?: number;
  ordem: number;
  categoria: PassageiroColumnCategory;
  alinhamento?: 'left' | 'center' | 'right';
  formatacao?: ColumnFormatacao;
}

/**
 * Categorias das colunas de passageiros
 */
export type PassageiroColumnCategory = 
  | 'pessoais' 
  | 'localizacao' 
  | 'viagem' 
  | 'financeiro' 
  | 'passeios' 
  | 'extras';

/**
 * Configuração de formatação de colunas
 */
export interface ColumnFormatacao {
  tipo: 'texto' | 'numero' | 'moeda' | 'data' | 'telefone' | 'cpf';
  mascara?: string;
  prefixo?: string;
  sufixo?: string;
}

/**
 * Interface para exibição de dados do passageiro
 */
export interface PassageiroDisplay {
  // Dados pessoais
  numeroSequencial: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  idade: number;
  telefone: string;
  email: string;
  
  // Dados de localização
  cidade: string;
  estado: string;
  endereco: string;
  numero: string;
  bairro: string;
  cep: string;
  complemento?: string;
  cidadeEmbarque: string;
  
  // Dados de viagem
  setorMaracana: string;
  onibusAlocado?: string;
  assento?: string;
  fotoPassageiro?: string;
  
  // Dados financeiros
  statusPagamento: string;
  formaPagamento: string;
  valorPago: number;
  desconto: number;
  valorBruto: number;
  parcelas?: string;
  
  // Dados de crédito
  pagoPorCredito: boolean;
  valorCreditoUtilizado: number;
  origemCredito?: string;
  
  // Dados de passeios
  passeiosSelecionados: string[];
  statusPasseios: string;
  valoresCobradosPasseio: number[];
  
  // Dados adicionais
  responsavelOnibus?: boolean;
  observacoes?: string;
  comoConheceu: string;
}

/**
 * Configuração de ordenação da lista
 */
export interface OrdenacaoConfig {
  campo: keyof PassageiroDisplay;
  direcao: 'asc' | 'desc';
  secundario?: {
    campo: keyof PassageiroDisplay;
    direcao: 'asc' | 'desc';
  };
}

/**
 * Configuração de agrupamento da lista
 */
export interface AgrupamentoConfig {
  ativo: boolean;
  campo?: 'onibus' | 'setor' | 'cidade' | 'status' | 'passeios';
  mostrarTotaisPorGrupo: boolean;
}

/**
 * Configuração de filtros específicos para passageiros
 */
export interface FiltrosPassageirosConfig {
  statusPagamento: string[];
  setoresMaracana: string[];
  onibusIds: string[];
  cidades: string[];
  passeios: string[];
  valorMinimo?: number;
  valorMaximo?: number;
}

// ============================================================================
// CONFIGURAÇÃO DE ÔNIBUS
// ============================================================================

/**
 * Configuração completa da lista de ônibus
 */
export interface OnibusConfig {
  dadosBasicos: DadosBasicosOnibusConfig;
  dadosTransfer: DadosTransferConfig;
  dadosOcupacao: DadosOcupacaoConfig;
  dadosTecnicos: DadosTecnicosConfig;
  exibicao: ExibicaoOnibusConfig;
}

/**
 * Configuração dos dados básicos dos ônibus
 */
export interface DadosBasicosOnibusConfig {
  mostrarNumeroIdentificacao: boolean;
  mostrarTipoOnibus: boolean;
  mostrarEmpresa: boolean;
  mostrarCapacidade: boolean;
  mostrarLugaresExtras: boolean;
}

/**
 * Configuração dos dados de transfer
 */
export interface DadosTransferConfig {
  mostrarNomeTour: boolean;
  mostrarRota: boolean;
  mostrarPlaca: boolean;
  mostrarMotorista: boolean;
}

/**
 * Configuração dos dados de ocupação
 */
export interface DadosOcupacaoConfig {
  mostrarTotalPassageiros: boolean;
  mostrarPassageirosConfirmados: boolean;
  mostrarVagasDisponiveis: boolean;
  mostrarTaxaOcupacao: boolean;
}

/**
 * Configuração dos dados técnicos
 */
export interface DadosTecnicosConfig {
  mostrarWifi: boolean;
  mostrarFoto: boolean;
  mostrarObservacoes: boolean;
}

/**
 * Configuração de exibição dos ônibus
 */
export interface ExibicaoOnibusConfig {
  mostrarListaPassageiros: boolean;
  paginaSeparadaPorOnibus: boolean;
  ordenarPor: 'numero' | 'empresa' | 'capacidade' | 'ocupacao';
}

// ============================================================================
// CONFIGURAÇÃO DE PASSEIOS
// ============================================================================

/**
 * Configuração completa dos dados de passeios
 */
export interface PasseiosConfig {
  tiposPasseios: TiposPasseiosConfig;
  dadosPorPasseio: DadosPorPasseioConfig;
  estatisticas: EstatisticasPasseiosConfig;
  agrupamentos: AgrupamentosPasseiosConfig;
  exibicaoNaLista: ExibicaoPasseiosConfig;
}

/**
 * Configuração dos tipos de passeios a incluir
 */
export interface TiposPasseiosConfig {
  incluirPagos: boolean;
  incluirGratuitos: boolean;
  passeiosEspecificos: string[];
  excluirPasseios: string[];
}

/**
 * Configuração dos dados por passeio
 */
export interface DadosPorPasseioConfig {
  mostrarNome: boolean;
  mostrarCategoria: boolean;
  mostrarValorCobrado: boolean;
  mostrarCustoOperacional: boolean;
  mostrarDescricao: boolean;
}

/**
 * Configuração das estatísticas de passeios
 */
export interface EstatisticasPasseiosConfig {
  mostrarTotalParticipantes: boolean;
  mostrarReceitaPorPasseio: boolean;
  mostrarMargemLucro: boolean;
  mostrarFaixasEtarias: boolean;
}

/**
 * Configuração dos agrupamentos de passeios
 */
export interface AgrupamentosPasseiosConfig {
  tipo: 'categoria' | 'valor' | 'popularidade' | 'nenhum';
  ordenacao: 'alfabetica' | 'valor' | 'participantes';
}

/**
 * Configuração da exibição de passeios na lista
 */
export interface ExibicaoPasseiosConfig {
  formato: 'coluna_separada' | 'texto_concatenado' | 'com_icones';
  mostrarStatus: boolean;
  mostrarValoresIndividuais: boolean;
  mostrarObservacoes: boolean;
}

// ============================================================================
// CONFIGURAÇÃO DE SEÇÕES
// ============================================================================

/**
 * Configuração completa das seções do relatório
 */
export interface SecoesConfig {
  secoes: SecaoConfig[];
  ordenacao: string[];
  quebrasAutomaticas: boolean;
}

/**
 * Configuração de uma seção específica
 */
export interface SecaoConfig {
  id: string;
  titulo: string;
  visivel: boolean;
  ordem: number;
  tipo: SecaoTipo;
  configuracao: SecaoConfiguracao;
  estilo?: SecaoEstilo;
}

/**
 * Tipos de seções disponíveis
 */
export type SecaoTipo = 
  | 'resumo_financeiro'
  | 'receita_categoria'
  | 'pagos_pendentes'
  | 'descontos'
  | 'distribuicao_setor'
  | 'distribuicao_onibus'
  | 'distribuicao_cidade'
  | 'estatisticas_passeios'
  | 'totais_passeios'
  | 'faixas_etarias_passeios'
  | 'custos_passeios'
  | 'faixas_etarias'
  | 'distribuicao_genero'
  | 'estatisticas_contato'
  | 'formas_pagamento'
  | 'status_pagamento'
  | 'parcelamentos'
  | 'creditos_utilizados'
  | 'total_ingressos'
  | 'ingressos_setor'
  | 'ingressos_faixa_etaria';

/**
 * Configuração específica de cada seção
 */
export interface SecaoConfiguracao {
  [key: string]: any; // Configurações específicas para cada tipo de seção
}

/**
 * Estilo específico de uma seção
 */
export interface SecaoEstilo {
  corFundo?: string;
  corTexto?: string;
  tamanhoFonte?: number;
  negrito?: boolean;
  italico?: boolean;
}

// ============================================================================
// CONFIGURAÇÃO DE ESTILO
// ============================================================================

/**
 * Configuração completa de formatação e estilo
 */
export interface EstiloConfig {
  fontes: FontesConfig;
  cores: CoresConfig;
  layout: LayoutConfig;
  elementos: ElementosConfig;
}

/**
 * Configuração de fontes
 */
export interface FontesConfig {
  tamanhoHeader: number;
  tamanhoTexto: number;
  tamanhoTabela: number;
  familia: string;
  pesoHeader: 'normal' | 'bold' | 'bolder';
  pesoTexto: 'normal' | 'bold';
}

/**
 * Configuração de cores
 */
export interface CoresConfig {
  headerPrincipal: string;
  headerSecundario: string;
  textoNormal: string;
  destaque: string;
  linhasAlternadas: boolean;
  corLinhasAlternadas: string;
  bordas: string;
  fundo: string;
}

/**
 * Configuração de layout
 */
export interface LayoutConfig {
  orientacao: 'retrato' | 'paisagem';
  margens: MargensConfig;
  espacamento: EspacamentoConfig;
  quebrasAutomaticas: boolean;
  colunasDuplas: boolean;
}

/**
 * Configuração de margens
 */
export interface MargensConfig {
  superior: number;
  inferior: number;
  esquerda: number;
  direita: number;
}

/**
 * Configuração de espaçamento
 */
export interface EspacamentoConfig {
  entreSecoes: number;
  entreTabelas: number;
  entreParagrafos: number;
  entreLinhas: number;
}

/**
 * Configuração de elementos visuais
 */
export interface ElementosConfig {
  bordas: boolean;
  separadores: boolean;
  marcaDagua?: string;
  logoFundo?: string;
  numeracaoPaginas: boolean;
  rodape?: string;
  cabecalho?: string;
}

// ============================================================================
// TEMPLATES E PRESETS
// ============================================================================

/**
 * Interface para templates salvos
 */
export interface Template {
  id: string;
  nome: string;
  descricao?: string;
  categoria: 'oficial' | 'personalizado' | 'compartilhado';
  configuracao: PersonalizationConfig;
  metadata: ConfigMetadata;
  preview?: string; // Base64 da imagem de preview
}

/**
 * Configuração de preset rápido
 */
export interface PresetConfig {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  configuracao: Partial<PersonalizationConfig>;
}

// ============================================================================
// VALIDAÇÃO E SANITIZAÇÃO
// ============================================================================

/**
 * Resultado da validação de configuração
 */
export interface ValidationResult {
  valido: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Erro de validação
 */
export interface ValidationError {
  campo: string;
  mensagem: string;
  codigo?: string;
}

/**
 * Aviso de validação
 */
export interface ValidationWarning {
  campo: string;
  mensagem: string;
  sugestao?: string;
}

// ============================================================================
// EXPORTAÇÃO E COMPARTILHAMENTO
// ============================================================================

/**
 * Dados para exportação de configuração
 */
export interface ExportData {
  configuracao: PersonalizationConfig;
  metadata: ExportMetadata;
  versaoSistema: string;
}

/**
 * Metadados de exportação
 */
export interface ExportMetadata {
  dataExportacao: string;
  usuario?: string;
  versaoConfig: string;
  compatibilidade: string[];
}

/**
 * Configuração de URL compartilhável
 */
export interface ShareableConfig {
  config: string; // Base64 da configuração comprimida
  expires?: string;
  readonly?: boolean;
}

// ============================================================================
// PREVIEW E RENDERIZAÇÃO
// ============================================================================

/**
 * Dados para preview do relatório
 */
export interface PreviewData {
  passageiros: PassageiroDisplay[];
  onibus: OnibusData[];
  passeios: PasseioData[];
  viagem: ViagemData;
  estatisticas: EstatisticasPreview;
}

/**
 * Dados de ônibus para preview
 */
export interface OnibusData {
  id: string;
  numeroIdentificacao: string;
  tipoOnibus: string;
  empresa: string;
  capacidade: number;
  ocupacao: number;
  passageiros: PassageiroDisplay[];
}

/**
 * Dados de passeio para preview
 */
export interface PasseioData {
  id: string;
  nome: string;
  categoria: 'pago' | 'gratuito';
  valor: number;
  participantes: number;
  custoOperacional?: number;
}

/**
 * Dados de viagem para preview
 */
export interface ViagemData {
  id: string;
  adversario: string;
  dataJogo: string;
  localJogo: string;
  estadio: string;
  status: string;
  valorPadrao: number;
  setorPadrao: string;
}

/**
 * Estatísticas para preview
 */
export interface EstatisticasPreview {
  totalPassageiros: number;
  totalArrecadado: number;
  totalIngressos: number;
  passageirosPagos: number;
  passageirosPendentes: number;
  ocupacaoMedia: number;
}

// ============================================================================
// CONFIGURAÇÕES PADRÃO
// ============================================================================

/**
 * Enum para cenários de configuração padrão
 */
export enum ConfigScenario {
  COMPLETO = 'completo',
  RESPONSAVEL = 'responsavel',
  PASSAGEIROS = 'passageiros',
  EMPRESA_ONIBUS = 'empresa_onibus',
  COMPRAR_INGRESSOS = 'comprar_ingressos',
  COMPRAR_PASSEIOS = 'comprar_passeios',
  TRANSFER = 'transfer',
  FINANCEIRO = 'financeiro',
  OPERACIONAL = 'operacional'
}

/**
 * Mapeamento de cenários para configurações
 */
export type DefaultConfigMap = {
  [K in ConfigScenario]: () => PersonalizationConfig;
};