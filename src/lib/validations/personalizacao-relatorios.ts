/**
 * Validadores e sanitizadores para configurações de personalização de relatórios
 */

import {
  PersonalizationConfig,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  PassageiroColumn,
  SecaoConfig,
  EstiloConfig,
  HeaderConfig,
  PassageirosConfig,
  OnibusConfig,
  PasseiosConfig,
  SecoesConfig
} from '@/types/personalizacao-relatorios';

// ============================================================================
// CLASSE PRINCIPAL DE VALIDAÇÃO
// ============================================================================

export class PersonalizationValidator {
  /**
   * Valida uma configuração completa de personalização
   */
  static validate(config: PersonalizationConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validar header
    const headerValidation = this.validateHeader(config.header);
    errors.push(...headerValidation.errors);
    warnings.push(...headerValidation.warnings);

    // Validar passageiros
    const passageirosValidation = this.validatePassageiros(config.passageiros);
    errors.push(...passageirosValidation.errors);
    warnings.push(...passageirosValidation.warnings);

    // Validar ônibus
    const onibusValidation = this.validateOnibus(config.onibus);
    errors.push(...onibusValidation.errors);
    warnings.push(...onibusValidation.warnings);

    // Validar passeios
    const passeiosValidation = this.validatePasseios(config.passeios);
    errors.push(...passeiosValidation.errors);
    warnings.push(...passeiosValidation.warnings);

    // Validar seções
    const secoesValidation = this.validateSecoes(config.secoes);
    errors.push(...secoesValidation.errors);
    warnings.push(...secoesValidation.warnings);

    // Validar estilo
    const estiloValidation = this.validateEstilo(config.estilo);
    errors.push(...estiloValidation.errors);
    warnings.push(...estiloValidation.warnings);

    return {
      valido: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Valida configuração do header
   */
  private static validateHeader(header: HeaderConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Verificar se pelo menos uma informação essencial está visível
    const temInformacaoEssencial = 
      header.dadosJogo.mostrarAdversario ||
      header.textoPersonalizado.titulo ||
      header.empresa.mostrarNome;

    if (!temInformacaoEssencial) {
      warnings.push({
        campo: 'header.informacoes_essenciais',
        mensagem: 'Recomendamos mostrar pelo menos o adversário, título personalizado ou nome da empresa',
        sugestao: 'Ative "Mostrar Adversário" ou defina um título personalizado'
      });
    }

    // Validar texto personalizado
    if (header.textoPersonalizado.titulo && header.textoPersonalizado.titulo.length > 100) {
      warnings.push({
        campo: 'header.textoPersonalizado.titulo',
        mensagem: 'Título muito longo pode afetar o layout',
        sugestao: 'Mantenha o título com até 100 caracteres'
      });
    }

    return { valido: errors.length === 0, errors, warnings };
  }

  /**
   * Valida configuração de passageiros
   */
  private static validatePassageiros(passageiros: PassageirosConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Verificar se pelo menos uma coluna está visível
    const colunasVisiveis = passageiros.colunas.filter(c => c.visivel);
    if (colunasVisiveis.length === 0) {
      errors.push({
        campo: 'passageiros.colunas',
        mensagem: 'Pelo menos uma coluna deve estar visível na lista de passageiros',
        codigo: 'NO_VISIBLE_COLUMNS'
      });
    }

    // Verificar larguras das colunas
    const larguraTotal = colunasVisiveis.reduce((sum, col) => sum + (col.largura || 100), 0);
    if (larguraTotal > 1200) {
      warnings.push({
        campo: 'passageiros.larguras',
        mensagem: 'A largura total das colunas pode causar problemas de layout',
        sugestao: 'Reduza a largura de algumas colunas ou oculte colunas desnecessárias'
      });
    }

    // Verificar ordens duplicadas
    const ordens = colunasVisiveis.map(c => c.ordem);
    const ordensUnicas = new Set(ordens);
    if (ordens.length !== ordensUnicas.size) {
      errors.push({
        campo: 'passageiros.colunas.ordem',
        mensagem: 'Existem colunas com a mesma ordem de exibição',
        codigo: 'DUPLICATE_COLUMN_ORDER'
      });
    }

    // Verificar se coluna de ordenação está visível
    const colunaOrdenacao = colunasVisiveis.find(c => c.id === passageiros.ordenacao.campo);
    if (!colunaOrdenacao) {
      warnings.push({
        campo: 'passageiros.ordenacao',
        mensagem: 'A coluna de ordenação não está visível na lista',
        sugestao: 'Torne a coluna de ordenação visível ou altere o campo de ordenação'
      });
    }

    return { valido: errors.length === 0, errors, warnings };
  }

  /**
   * Valida configuração de ônibus
   */
  private static validateOnibus(onibus: OnibusConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Verificar se pelo menos uma informação básica está visível
    const temInformacaoBasica = 
      onibus.dadosBasicos.mostrarNumeroIdentificacao ||
      onibus.dadosBasicos.mostrarTipoOnibus ||
      onibus.dadosBasicos.mostrarEmpresa;

    if (!temInformacaoBasica) {
      warnings.push({
        campo: 'onibus.dadosBasicos',
        mensagem: 'Recomendamos mostrar pelo menos uma informação básica do ônibus',
        sugestao: 'Ative "Número de Identificação", "Tipo" ou "Empresa"'
      });
    }

    return { valido: errors.length === 0, errors, warnings };
  }

  /**
   * Valida configuração de passeios
   */
  private static validatePasseios(passeios: PasseiosConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Verificar se pelo menos um tipo de passeio está incluído
    if (!passeios.tiposPasseios.incluirPagos && !passeios.tiposPasseios.incluirGratuitos) {
      errors.push({
        campo: 'passeios.tiposPasseios',
        mensagem: 'Pelo menos um tipo de passeio deve estar incluído',
        codigo: 'NO_PASSEIO_TYPES'
      });
    }

    return { valido: errors.length === 0, errors, warnings };
  }

  /**
   * Valida configuração de seções
   */
  private static validateSecoes(secoes: SecoesConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Verificar se pelo menos uma seção está visível
    const secoesVisiveis = secoes.secoes.filter(s => s.visivel);
    if (secoesVisiveis.length === 0) {
      warnings.push({
        campo: 'secoes.visibilidade',
        mensagem: 'Nenhuma seção está visível no relatório',
        sugestao: 'Ative pelo menos uma seção para exibir no relatório'
      });
    }

    // Verificar ordens duplicadas nas seções
    const ordens = secoesVisiveis.map(s => s.ordem);
    const ordensUnicas = new Set(ordens);
    if (ordens.length !== ordensUnicas.size) {
      errors.push({
        campo: 'secoes.ordem',
        mensagem: 'Existem seções com a mesma ordem de exibição',
        codigo: 'DUPLICATE_SECTION_ORDER'
      });
    }

    return { valido: errors.length === 0, errors, warnings };
  }

  /**
   * Valida configuração de estilo
   */
  private static validateEstilo(estilo: EstiloConfig): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validar tamanhos de fonte
    if (estilo.fontes.tamanhoHeader < 8 || estilo.fontes.tamanhoHeader > 72) {
      warnings.push({
        campo: 'estilo.fontes.tamanhoHeader',
        mensagem: 'Tamanho da fonte do header fora do intervalo recomendado (8-72px)',
        sugestao: 'Use um tamanho entre 8 e 72 pixels'
      });
    }

    if (estilo.fontes.tamanhoTexto < 6 || estilo.fontes.tamanhoTexto > 24) {
      warnings.push({
        campo: 'estilo.fontes.tamanhoTexto',
        mensagem: 'Tamanho da fonte do texto fora do intervalo recomendado (6-24px)',
        sugestao: 'Use um tamanho entre 6 e 24 pixels'
      });
    }

    // Validar cores (formato hexadecimal)
    const coresParaValidar = [
      { campo: 'headerPrincipal', valor: estilo.cores.headerPrincipal },
      { campo: 'headerSecundario', valor: estilo.cores.headerSecundario },
      { campo: 'textoNormal', valor: estilo.cores.textoNormal },
      { campo: 'destaque', valor: estilo.cores.destaque }
    ];

    coresParaValidar.forEach(({ campo, valor }) => {
      if (!this.isValidHexColor(valor)) {
        errors.push({
          campo: `estilo.cores.${campo}`,
          mensagem: 'Cor deve estar no formato hexadecimal (#RRGGBB)',
          codigo: 'INVALID_COLOR_FORMAT'
        });
      }
    });

    // Validar margens
    const margens = estilo.layout.margens;
    if (margens.superior < 0 || margens.inferior < 0 || margens.esquerda < 0 || margens.direita < 0) {
      errors.push({
        campo: 'estilo.layout.margens',
        mensagem: 'Margens não podem ser negativas',
        codigo: 'NEGATIVE_MARGINS'
      });
    }

    return { valido: errors.length === 0, errors, warnings };
  }

  /**
   * Verifica se uma string é uma cor hexadecimal válida
   */
  private static isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }
}

// ============================================================================
// CLASSE DE SANITIZAÇÃO
// ============================================================================

export class PersonalizationSanitizer {
  /**
   * Sanitiza uma configuração completa, corrigindo valores inválidos
   */
  static sanitize(config: PersonalizationConfig): PersonalizationConfig {
    const sanitized = { ...config };

    // Sanitizar header
    sanitized.header = this.sanitizeHeader(sanitized.header);

    // Sanitizar passageiros
    sanitized.passageiros = this.sanitizePassageiros(sanitized.passageiros);

    // Sanitizar ônibus
    sanitized.onibus = this.sanitizeOnibus(sanitized.onibus);

    // Sanitizar passeios
    sanitized.passeios = this.sanitizePasseios(sanitized.passeios);

    // Sanitizar seções
    sanitized.secoes = this.sanitizeSecoes(sanitized.secoes);

    // Sanitizar estilo
    sanitized.estilo = this.sanitizeEstilo(sanitized.estilo);

    return sanitized;
  }

  /**
   * Sanitiza configuração do header
   */
  private static sanitizeHeader(header: HeaderConfig): HeaderConfig {
    const sanitized = { ...header };

    // Limitar tamanho do título personalizado
    if (sanitized.textoPersonalizado.titulo && sanitized.textoPersonalizado.titulo.length > 200) {
      sanitized.textoPersonalizado.titulo = sanitized.textoPersonalizado.titulo.substring(0, 200);
    }

    // Limitar tamanho das observações
    if (sanitized.textoPersonalizado.observacoes && sanitized.textoPersonalizado.observacoes.length > 500) {
      sanitized.textoPersonalizado.observacoes = sanitized.textoPersonalizado.observacoes.substring(0, 500);
    }

    return sanitized;
  }

  /**
   * Sanitiza configuração de passageiros
   */
  private static sanitizePassageiros(passageiros: PassageirosConfig): PassageirosConfig {
    const sanitized = { ...passageiros };

    // Garantir que pelo menos uma coluna esteja visível
    if (sanitized.colunas.every(c => !c.visivel)) {
      sanitized.colunas[0].visivel = true;
    }

    // Corrigir ordens duplicadas
    sanitized.colunas.forEach((col, index) => {
      col.ordem = index;
    });

    // Limitar larguras das colunas
    sanitized.colunas.forEach(col => {
      if (col.largura && col.largura < 50) {
        col.largura = 50;
      }
      if (col.largura && col.largura > 500) {
        col.largura = 500;
      }
    });

    return sanitized;
  }

  /**
   * Sanitiza configuração de ônibus
   */
  private static sanitizeOnibus(onibus: OnibusConfig): OnibusConfig {
    // Por enquanto, apenas retorna a configuração original
    // Pode ser expandido conforme necessário
    return { ...onibus };
  }

  /**
   * Sanitiza configuração de passeios
   */
  private static sanitizePasseios(passeios: PasseiosConfig): PasseiosConfig {
    const sanitized = { ...passeios };

    // Garantir que pelo menos um tipo de passeio esteja incluído
    if (!sanitized.tiposPasseios.incluirPagos && !sanitized.tiposPasseios.incluirGratuitos) {
      sanitized.tiposPasseios.incluirPagos = true;
    }

    return sanitized;
  }

  /**
   * Sanitiza configuração de seções
   */
  private static sanitizeSecoes(secoes: SecoesConfig): SecoesConfig {
    const sanitized = { ...secoes };

    // Corrigir ordens duplicadas nas seções
    sanitized.secoes.forEach((secao, index) => {
      secao.ordem = index;
    });

    return sanitized;
  }

  /**
   * Sanitiza configuração de estilo
   */
  private static sanitizeEstilo(estilo: EstiloConfig): EstiloConfig {
    const sanitized = { ...estilo };

    // Corrigir tamanhos de fonte
    sanitized.fontes.tamanhoHeader = Math.max(8, Math.min(72, sanitized.fontes.tamanhoHeader));
    sanitized.fontes.tamanhoTexto = Math.max(6, Math.min(24, sanitized.fontes.tamanhoTexto));
    sanitized.fontes.tamanhoTabela = Math.max(6, Math.min(20, sanitized.fontes.tamanhoTabela));

    // Corrigir cores inválidas
    if (!this.isValidHexColor(sanitized.cores.headerPrincipal)) {
      sanitized.cores.headerPrincipal = '#1f2937';
    }
    if (!this.isValidHexColor(sanitized.cores.headerSecundario)) {
      sanitized.cores.headerSecundario = '#374151';
    }
    if (!this.isValidHexColor(sanitized.cores.textoNormal)) {
      sanitized.cores.textoNormal = '#111827';
    }
    if (!this.isValidHexColor(sanitized.cores.destaque)) {
      sanitized.cores.destaque = '#dc2626';
    }

    // Corrigir margens negativas
    sanitized.layout.margens.superior = Math.max(0, sanitized.layout.margens.superior);
    sanitized.layout.margens.inferior = Math.max(0, sanitized.layout.margens.inferior);
    sanitized.layout.margens.esquerda = Math.max(0, sanitized.layout.margens.esquerda);
    sanitized.layout.margens.direita = Math.max(0, sanitized.layout.margens.direita);

    return sanitized;
  }

  /**
   * Verifica se uma string é uma cor hexadecimal válida
   */
  private static isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }
}

// ============================================================================
// UTILITÁRIOS DE VALIDAÇÃO
// ============================================================================

/**
 * Valida se uma configuração é compatível com uma versão específica
 */
export function validateCompatibility(config: PersonalizationConfig, targetVersion: string): boolean {
  // Implementar lógica de compatibilidade entre versões
  // Por enquanto, sempre retorna true
  return true;
}

/**
 * Verifica se uma configuração está completa (todos os campos obrigatórios preenchidos)
 */
export function isConfigComplete(config: Partial<PersonalizationConfig>): boolean {
  return !!(
    config.header &&
    config.passageiros &&
    config.onibus &&
    config.passeios &&
    config.secoes &&
    config.estilo &&
    config.metadata
  );
}

/**
 * Calcula um score de qualidade para uma configuração (0-100)
 */
export function calculateConfigQuality(config: PersonalizationConfig): number {
  const validation = PersonalizationValidator.validate(config);
  
  let score = 100;
  
  // Reduzir score por erros
  score -= validation.errors.length * 20;
  
  // Reduzir score por avisos
  score -= validation.warnings.length * 5;
  
  // Bonus por configurações avançadas
  const colunasVisiveis = config.passageiros.colunas.filter(c => c.visivel).length;
  if (colunasVisiveis > 5) score += 5;
  
  const secoesVisiveis = config.secoes.secoes.filter(s => s.visivel).length;
  if (secoesVisiveis > 3) score += 5;
  
  return Math.max(0, Math.min(100, score));
}