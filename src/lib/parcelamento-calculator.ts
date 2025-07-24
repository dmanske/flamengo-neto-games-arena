/**
 * Sistema de Parcelamento Inteligente - Calculadora
 * 
 * Calcula opções de parcelamento baseado na data da viagem,
 * respeitando a regra de 5 dias antes da viagem para quitação.
 */

export interface ParcelamentoOpcao {
  tipo: 'avista' | 'parcelado';
  parcelas: number;
  valorParcela: number;
  valorTotal: number;
  valorOriginal: number;
  desconto: number;
  datas: Date[];
  descricao: string;
  valida: boolean;
  observacoes?: string;
}

export interface ParcelamentoConfig {
  descontoAvistaPercent: number;
  prazoLimiteDias: number;
  intervaloMinimoDias: number;
  maxParcelas: number;
}

export interface Parcela {
  numero: number;
  totalParcelas: number;
  valor: number;
  dataVencimento: Date;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  tipoParcelamento: 'avista' | 'parcelado' | 'personalizado';
  descontoAplicado: number;
  valorOriginal: number;
  descricao: string;
  observacoes?: string;
}

export class ParcelamentoError extends Error {
  constructor(
    message: string,
    public code: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ParcelamentoError';
  }
}

export const ERROR_CODES = {
  PRAZO_LIMITE_EXCEDIDO: 'PRAZO_LIMITE_EXCEDIDO',
  INTERVALO_MINIMO: 'INTERVALO_MINIMO',
  VALOR_INCONSISTENTE: 'VALOR_INCONSISTENTE',
  PARCELA_JA_PAGA: 'PARCELA_JA_PAGA',
  VIAGEM_MUITO_PROXIMA: 'VIAGEM_MUITO_PROXIMA',
  DATA_INVALIDA: 'DATA_INVALIDA',
  VALOR_INVALIDO: 'VALOR_INVALIDO'
} as const;

export class ParcelamentoCalculator {
  private config: ParcelamentoConfig;

  constructor(config?: Partial<ParcelamentoConfig>) {
    this.config = {
      descontoAvistaPercent: 0,
      prazoLimiteDias: 5,
      intervaloMinimoDias: 15,
      maxParcelas: 6,
      ...config
    };
  }

  /**
   * Calcula todas as opções de parcelamento disponíveis
   */
  calcularOpcoes(dataViagem: Date, valorTotal: number, configViagem?: Partial<ParcelamentoConfig>): ParcelamentoOpcao[] {
    // Validações básicas
    this.validarEntradas(dataViagem, valorTotal);

    // Usar configuração específica da viagem se fornecida
    const configAtual = { ...this.config, ...configViagem };
    
    const hoje = new Date();
    const prazoLimite = this.calcularPrazoLimite(dataViagem, configAtual.prazoLimiteDias);
    const diasDisponiveis = this.calcularDiasDisponiveis(hoje, prazoLimite);

    const opcoes: ParcelamentoOpcao[] = [];

    // Sempre adicionar opção à vista
    opcoes.push(this.criarOpcaoAvista(valorTotal, configAtual.descontoAvistaPercent));

    // Verificar se há tempo para parcelamento
    if (diasDisponiveis >= configAtual.intervaloMinimoDias) {
      const opcoesParcelamento = this.calcularOpcoesParcelamento(
        valorTotal, 
        hoje, 
        prazoLimite, 
        diasDisponiveis, 
        configAtual
      );
      opcoes.push(...opcoesParcelamento);
    }

    return opcoes.filter(opcao => opcao.valida);
  }

  /**
   * Valida se uma data de vencimento é válida para a viagem
   */
  validarDataVencimento(dataVencimento: Date, dataViagem: Date): boolean {
    const prazoLimite = this.calcularPrazoLimite(dataViagem, this.config.prazoLimiteDias);
    return dataVencimento <= prazoLimite;
  }

  /**
   * Valida se uma parcela pode ser editada
   */
  validarEdicaoParcela(parcela: Parcela): void {
    if (parcela.status === 'pago') {
      throw new ParcelamentoError(
        'Não é possível editar parcela já paga',
        ERROR_CODES.PARCELA_JA_PAGA,
        'status'
      );
    }
  }

  /**
   * Cria parcelas baseado em uma opção selecionada
   */
  criarParcelas(opcao: ParcelamentoOpcao, passageiroId: string): Parcela[] {
    if (!opcao.valida) {
      throw new ParcelamentoError(
        'Opção de parcelamento inválida',
        ERROR_CODES.VALOR_INCONSISTENTE
      );
    }

    const parcelas: Parcela[] = [];

    for (let i = 0; i < opcao.parcelas; i++) {
      parcelas.push({
        numero: i + 1,
        totalParcelas: opcao.parcelas,
        valor: opcao.valorParcela,
        dataVencimento: opcao.datas[i],
        status: 'pendente',
        tipoParcelamento: opcao.tipo === 'avista' ? 'avista' : 'parcelado',
        descontoAplicado: opcao.tipo === 'avista' ? opcao.desconto : 0,
        valorOriginal: opcao.valorOriginal,
        descricao: this.gerarDescricaoParcela(i + 1, opcao.parcelas, opcao.tipo),
        observacoes: opcao.observacoes
      });
    }

    return parcelas;
  }

  /**
   * Recalcula parcelas quando datas são editadas manualmente
   */
  recalcularParcelas(parcelas: Parcela[], novasDatas: Date[], dataViagem: Date): Parcela[] {
    // Validar todas as datas
    for (const data of novasDatas) {
      if (!this.validarDataVencimento(data, dataViagem)) {
        throw new ParcelamentoError(
          `Data ${data.toLocaleDateString()} ultrapassa o prazo limite de ${this.config.prazoLimiteDias} dias antes da viagem`,
          ERROR_CODES.PRAZO_LIMITE_EXCEDIDO,
          'dataVencimento'
        );
      }
    }

    // Validar intervalo mínimo entre parcelas
    this.validarIntervalos(novasDatas);

    // Atualizar parcelas com novas datas
    return parcelas.map((parcela, index) => ({
      ...parcela,
      dataVencimento: novasDatas[index],
      tipoParcelamento: 'personalizado'
    }));
  }

  // =====================================================
  // MÉTODOS PRIVADOS
  // =====================================================

  private validarEntradas(dataViagem: Date, valorTotal: number): void {
    if (!(dataViagem instanceof Date) || isNaN(dataViagem.getTime())) {
      throw new ParcelamentoError(
        'Data da viagem inválida',
        ERROR_CODES.DATA_INVALIDA,
        'dataViagem'
      );
    }

    if (typeof valorTotal !== 'number' || valorTotal <= 0) {
      throw new ParcelamentoError(
        'Valor total deve ser maior que zero',
        ERROR_CODES.VALOR_INVALIDO,
        'valorTotal'
      );
    }

    const hoje = new Date();
    if (dataViagem <= hoje) {
      throw new ParcelamentoError(
        'Data da viagem deve ser futura',
        ERROR_CODES.DATA_INVALIDA,
        'dataViagem'
      );
    }
  }

  private calcularPrazoLimite(dataViagem: Date, prazoLimiteDias: number): Date {
    const prazoLimite = new Date(dataViagem);
    prazoLimite.setDate(prazoLimite.getDate() - prazoLimiteDias);
    return prazoLimite;
  }

  private calcularDiasDisponiveis(dataInicio: Date, dataLimite: Date): number {
    const diffTime = dataLimite.getTime() - dataInicio.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  private criarOpcaoAvista(valorTotal: number, descontoPercent: number): ParcelamentoOpcao {
    const desconto = (valorTotal * descontoPercent) / 100;
    const valorFinal = valorTotal - desconto;
    const hoje = new Date();

    return {
      tipo: 'avista',
      parcelas: 1,
      valorParcela: valorFinal,
      valorTotal: valorFinal,
      valorOriginal: valorTotal,
      desconto: desconto,
      datas: [hoje],
      descricao: descontoPercent > 0 
        ? `À vista - R$ ${valorFinal.toFixed(2)} (${descontoPercent}% desconto)`
        : `À vista - R$ ${valorFinal.toFixed(2)}`,
      valida: true,
      observacoes: descontoPercent > 0 ? `Desconto de ${descontoPercent}% aplicado` : undefined
    };
  }

  private calcularOpcoesParcelamento(
    valorTotal: number, 
    dataInicio: Date, 
    prazoLimite: Date, 
    diasDisponiveis: number,
    config: ParcelamentoConfig
  ): ParcelamentoOpcao[] {
    const opcoes: ParcelamentoOpcao[] = [];
    
    // Calcular quantas parcelas cabem no período
    const maxParcelasPossivel = Math.floor(diasDisponiveis / config.intervaloMinimoDias) + 1;
    const maxParcelas = Math.min(maxParcelasPossivel, config.maxParcelas);

    // Gerar opções de 2x até o máximo possível
    for (let numParcelas = 2; numParcelas <= maxParcelas; numParcelas++) {
      const opcao = this.criarOpcaoParcelamento(
        valorTotal, 
        numParcelas, 
        dataInicio, 
        prazoLimite, 
        config.intervaloMinimoDias
      );
      
      if (opcao.valida) {
        opcoes.push(opcao);
      }
    }

    return opcoes;
  }

  private criarOpcaoParcelamento(
    valorTotal: number, 
    numParcelas: number, 
    dataInicio: Date, 
    prazoLimite: Date,
    intervaloMinimo: number
  ): ParcelamentoOpcao {
    const valorParcela = Math.round((valorTotal / numParcelas) * 100) / 100;
    const datas: Date[] = [];
    
    // Gerar datas das parcelas
    for (let i = 0; i < numParcelas; i++) {
      const dataVencimento = new Date(dataInicio);
      dataVencimento.setDate(dataInicio.getDate() + (i * intervaloMinimo));
      datas.push(dataVencimento);
    }

    // Verificar se a última parcela não ultrapassa o prazo limite
    const ultimaData = datas[datas.length - 1];
    const valida = ultimaData <= prazoLimite;

    // Ajustar última parcela para compensar arredondamentos
    const valorUltimaParcela = valorTotal - (valorParcela * (numParcelas - 1));
    const valorTotalCalculado = (valorParcela * (numParcelas - 1)) + valorUltimaParcela;

    return {
      tipo: 'parcelado',
      parcelas: numParcelas,
      valorParcela: valorParcela,
      valorTotal: valorTotalCalculado,
      valorOriginal: valorTotal,
      desconto: 0,
      datas: datas,
      descricao: `${numParcelas}x de R$ ${valorParcela.toFixed(2)} sem juros`,
      valida: valida,
      observacoes: !valida ? 'Última parcela ultrapassa prazo limite' : undefined
    };
  }

  private validarIntervalos(datas: Date[]): void {
    for (let i = 1; i < datas.length; i++) {
      const dataAnterior = datas[i - 1];
      const dataAtual = datas[i];
      const diffDias = this.calcularDiasDisponiveis(dataAnterior, dataAtual);
      
      if (diffDias < this.config.intervaloMinimoDias) {
        throw new ParcelamentoError(
          `Intervalo mínimo entre parcelas é de ${this.config.intervaloMinimoDias} dias`,
          ERROR_CODES.INTERVALO_MINIMO,
          'dataVencimento'
        );
      }
    }
  }

  private gerarDescricaoParcela(numero: number, total: number, tipo: 'avista' | 'parcelado'): string {
    if (tipo === 'avista') {
      return 'Pagamento à vista';
    }
    return `Parcela ${numero} de ${total}`;
  }
}

// =====================================================
// FUNÇÕES UTILITÁRIAS
// =====================================================

/**
 * Cria uma instância da calculadora com configuração padrão
 */
export function criarCalculadoraPadrao(): ParcelamentoCalculator {
  return new ParcelamentoCalculator();
}

/**
 * Calcula rapidamente se uma viagem permite parcelamento
 */
export function viagemPermiteParcelamento(dataViagem: Date, prazoLimiteDias: number = 5, intervaloMinimo: number = 15): boolean {
  try {
    const hoje = new Date();
    const prazoLimite = new Date(dataViagem);
    prazoLimite.setDate(prazoLimite.getDate() - prazoLimiteDias);
    
    const diasDisponiveis = Math.floor((prazoLimite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diasDisponiveis >= intervaloMinimo;
  } catch {
    return false;
  }
}

/**
 * Formata uma opção de parcelamento para exibição
 */
export function formatarOpcaoParcelamento(opcao: ParcelamentoOpcao): string {
  if (opcao.tipo === 'avista') {
    return opcao.desconto > 0 
      ? `À vista: R$ ${opcao.valorTotal.toFixed(2)} (desconto de R$ ${opcao.desconto.toFixed(2)})`
      : `À vista: R$ ${opcao.valorTotal.toFixed(2)}`;
  }
  
  return `${opcao.parcelas}x: R$ ${opcao.valorParcela.toFixed(2)} (total: R$ ${opcao.valorTotal.toFixed(2)})`;
}

/**
 * Calcula o status de urgência de uma parcela
 */
export function calcularUrgenciaParcela(parcela: Parcela): 'normal' | 'vence_em_breve' | 'vence_hoje' | 'atrasado' {
  if (parcela.status === 'pago') return 'normal';
  
  const hoje = new Date();
  const diffDias = Math.floor((parcela.dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDias < 0) return 'atrasado';
  if (diffDias === 0) return 'vence_hoje';
  if (diffDias <= 5) return 'vence_em_breve';
  return 'normal';
}

/**
 * Agrupa parcelas por urgência
 */
export function agruparParcelasPorUrgencia(parcelas: Parcela[]): {
  normal: Parcela[];
  vence_em_breve: Parcela[];
  vence_hoje: Parcela[];
  atrasado: Parcela[];
} {
  return parcelas.reduce((grupos, parcela) => {
    const urgencia = calcularUrgenciaParcela(parcela);
    grupos[urgencia].push(parcela);
    return grupos;
  }, {
    normal: [] as Parcela[],
    vence_em_breve: [] as Parcela[],
    vence_hoje: [] as Parcela[],
    atrasado: [] as Parcela[]
  });
}