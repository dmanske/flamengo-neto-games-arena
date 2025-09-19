/**
 * Integração com o sistema atual de filtros de relatórios
 */

import { ReportFilters } from '@/types/report-filters';
import { PersonalizationConfig, ConfigScenario } from '@/types/personalizacao-relatorios';
import { getDefaultConfig } from '@/lib/personalizacao-defaults';

// ============================================================================
// MIGRAÇÃO DE FILTROS PARA PERSONALIZAÇÃO
// ============================================================================

/**
 * Converte filtros rápidos para configuração de personalização
 */
export function migrateFiltersToPersonalization(filters: ReportFilters): PersonalizationConfig {
  // Determinar cenário baseado nos filtros
  let scenario: ConfigScenario = ConfigScenario.COMPLETO;
  
  if (filters.modoResponsavel) {
    scenario = ConfigScenario.RESPONSAVEL;
  } else if (filters.modoPassageiro) {
    scenario = ConfigScenario.PASSAGEIROS;
  } else if (filters.modoEmpresaOnibus) {
    scenario = ConfigScenario.EMPRESA_ONIBUS;
  } else if (filters.modoComprarIngressos) {
    scenario = ConfigScenario.COMPRAR_INGRESSOS;
  } else if (filters.modoComprarPasseios) {
    scenario = ConfigScenario.COMPRAR_PASSEIOS;
  } else if (filters.modoTransfer) {
    scenario = ConfigScenario.TRANSFER;
  }
  
  // Obter configuração base
  const config = getDefaultConfig(scenario);
  
  // Aplicar personalizações específicas dos filtros
  return {
    ...config,
    header: {
      ...config.header,
      dadosViagem: {
        ...config.header.dadosViagem,
        mostrarValorPadrao: filters.mostrarValorPadrao,
      },
      totais: {
        ...config.header.totais,
        mostrarTotalArrecadado: !filters.modoResponsavel && !filters.modoPassageiro,
      }
    },
    passageiros: {
      ...config.passageiros,
      colunas: config.passageiros.colunas.map(col => {
        // Ajustar visibilidade baseada nos filtros
        let visivel = col.visivel;
        
        if (filters.modoResponsavel || filters.modoPassageiro) {
          // Ocultar colunas financeiras
          if (col.categoria === 'financeiro') {
            visivel = false;
          }
        }
        
        if (filters.modoEmpresaOnibus) {
          // Mostrar apenas colunas essenciais para empresa de ônibus
          visivel = ['numeroSequencial', 'nome', 'cpf', 'dataNascimento', 'cidade', 'onibusAlocado'].includes(col.id);
        }
        
        if (filters.modoComprarIngressos) {
          // Focar em dados de ingressos
          visivel = ['numeroSequencial', 'nome', 'cpf', 'setorMaracana'].includes(col.id);
        }
        
        if (filters.modoComprarPasseios) {
          // Focar em passeios e faixas etárias
          visivel = ['numeroSequencial', 'nome', 'idade', 'passeiosSelecionados'].includes(col.id);
        }
        
        if (filters.modoTransfer) {
          // Dados para transfer
          visivel = ['numeroSequencial', 'nome', 'telefone', 'cidade', 'onibusAlocado', 'passeiosSelecionados'].includes(col.id);
        }
        
        // Aplicar configurações específicas
        if (col.id === 'telefone') {
          visivel = visivel && filters.mostrarTelefone;
        }
        
        if (col.id === 'numeroSequencial') {
          visivel = visivel && filters.mostrarNumeroPassageiro;
        }
        
        return { ...col, visivel };
      }),
      agrupamento: {
        ...config.passageiros.agrupamento,
        ativo: filters.agruparPorOnibus,
        campo: filters.agruparPorOnibus ? 'onibus' : undefined
      },
      filtros: {
        statusPagamento: filters.statusPagamento === 'todos' ? [] : [filters.statusPagamento],
        setoresMaracana: filters.setorMaracana,
        onibusIds: filters.onibusIds,
        cidades: [],
        passeios: filters.passeiosSelecionados,
        valorMinimo: filters.valorMinimo,
        valorMaximo: filters.valorMaximo
      }
    },
    onibus: {
      ...config.onibus,
      dadosTecnicos: {
        ...config.onibus.dadosTecnicos,
        mostrarFoto: filters.mostrarFotoOnibus
      },
      dadosTransfer: {
        ...config.onibus.dadosTransfer,
        mostrarRota: filters.modoTransfer,
        mostrarPlaca: filters.modoTransfer,
        mostrarMotorista: filters.modoTransfer
      }
    },
    passeios: {
      ...config.passeios,
      tiposPasseios: {
        ...config.passeios.tiposPasseios,
        incluirPagos: filters.tipoPasseios === 'todos' || filters.tipoPasseios === 'pagos',
        incluirGratuitos: filters.tipoPasseios === 'todos' || filters.tipoPasseios === 'gratuitos'
      },
      exibicaoNaLista: {
        ...config.passeios.exibicaoNaLista,
        mostrarStatus: filters.mostrarStatusPagamento,
        mostrarValoresIndividuais: filters.mostrarValoresPassageiros
      }
    },
    secoes: {
      ...config.secoes,
      secoes: config.secoes.secoes.map(secao => ({
        ...secao,
        visivel: getSecaoVisibilityFromFilters(secao.tipo, filters)
      }))
    }
  };
}

/**
 * Determina se uma seção deve estar visível baseada nos filtros
 */
function getSecaoVisibilityFromFilters(tipo: string, filters: ReportFilters): boolean {
  // Seções financeiras
  if (['resumo_financeiro', 'formas_pagamento', 'status_pagamento'].includes(tipo)) {
    return filters.incluirResumoFinanceiro && !filters.modoResponsavel && !filters.modoPassageiro;
  }
  
  // Distribuição por setor
  if (tipo === 'distribuicao_setor') {
    return filters.incluirDistribuicaoSetor;
  }
  
  // Distribuição por ônibus
  if (tipo === 'distribuicao_onibus') {
    return filters.incluirListaOnibus;
  }
  
  // Estatísticas de passeios
  if (['estatisticas_passeios', 'faixas_etarias_passeios'].includes(tipo)) {
    return filters.modoComprarPasseios || (!filters.modoResponsavel && !filters.modoEmpresaOnibus);
  }
  
  // Por padrão, mostrar a seção
  return true;
}

// ============================================================================
// CONVERSÃO DE PERSONALIZAÇÃO PARA FILTROS
// ============================================================================

/**
 * Converte configuração de personalização para filtros (compatibilidade reversa)
 */
export function convertPersonalizationToFilters(config: PersonalizationConfig): Partial<ReportFilters> {
  const filters: Partial<ReportFilters> = {};
  
  // Determinar modo baseado na configuração
  const colunasFinanceirasVisiveis = config.passageiros.colunas
    .filter(col => col.categoria === 'financeiro' && col.visivel).length;
  
  const secoesFinanceirasVisiveis = config.secoes.secoes
    .filter(secao => ['resumo_financeiro', 'formas_pagamento'].includes(secao.tipo) && secao.visivel).length;
  
  if (colunasFinanceirasVisiveis === 0 && secoesFinanceirasVisiveis === 0) {
    filters.modoResponsavel = true;
  }
  
  // Agrupamento
  filters.agruparPorOnibus = config.passageiros.agrupamento.ativo && 
                            config.passageiros.agrupamento.campo === 'onibus';
  
  // Colunas específicas
  const telefoneCol = config.passageiros.colunas.find(col => col.id === 'telefone');
  filters.mostrarTelefone = telefoneCol?.visivel || false;
  
  const numeroCol = config.passageiros.colunas.find(col => col.id === 'numeroSequencial');
  filters.mostrarNumeroPassageiro = numeroCol?.visivel || false;
  
  // Foto do ônibus
  filters.mostrarFotoOnibus = config.onibus.dadosTecnicos.mostrarFoto;
  
  // Valores
  filters.mostrarValorPadrao = config.header.dadosViagem.mostrarValorPadrao;
  
  const valorCol = config.passageiros.colunas.find(col => col.id === 'valorPago');
  filters.mostrarValoresPassageiros = valorCol?.visivel || false;
  
  // Status de pagamento
  const statusCol = config.passageiros.colunas.find(col => col.id === 'statusPagamento');
  filters.mostrarStatusPagamento = statusCol?.visivel || false;
  
  // Seções
  const resumoFinanceiroSecao = config.secoes.secoes.find(s => s.tipo === 'resumo_financeiro');
  filters.incluirResumoFinanceiro = resumoFinanceiroSecao?.visivel || false;
  
  const distribuicaoSetorSecao = config.secoes.secoes.find(s => s.tipo === 'distribuicao_setor');
  filters.incluirDistribuicaoSetor = distribuicaoSetorSecao?.visivel || false;
  
  const distribuicaoOnibusSecao = config.secoes.secoes.find(s => s.tipo === 'distribuicao_onibus');
  filters.incluirListaOnibus = distribuicaoOnibusSecao?.visivel || false;
  
  // Passeios
  if (config.passeios.tiposPasseios.incluirPagos && config.passeios.tiposPasseios.incluirGratuitos) {
    filters.tipoPasseios = 'todos';
  } else if (config.passeios.tiposPasseios.incluirPagos) {
    filters.tipoPasseios = 'pagos';
  } else if (config.passeios.tiposPasseios.incluirGratuitos) {
    filters.tipoPasseios = 'gratuitos';
  }
  
  // Filtros de dados
  filters.valorMinimo = config.passageiros.filtros.valorMinimo;
  filters.valorMaximo = config.passageiros.filtros.valorMaximo;
  
  return filters;
}

// ============================================================================
// DETECÇÃO DE MODO AUTOMÁTICA
// ============================================================================

/**
 * Detecta o modo de relatório baseado nos filtros atuais
 */
export function detectReportMode(filters: ReportFilters): ConfigScenario {
  if (filters.modoResponsavel) return ConfigScenario.RESPONSAVEL;
  if (filters.modoPassageiro) return ConfigScenario.PASSAGEIROS;
  if (filters.modoEmpresaOnibus) return ConfigScenario.EMPRESA_ONIBUS;
  if (filters.modoComprarIngressos) return ConfigScenario.COMPRAR_INGRESSOS;
  if (filters.modoComprarPasseios) return ConfigScenario.COMPRAR_PASSEIOS;
  if (filters.modoTransfer) return ConfigScenario.TRANSFER;
  
  return ConfigScenario.COMPLETO;
}

// ============================================================================
// VALIDAÇÃO DE COMPATIBILIDADE
// ============================================================================

/**
 * Verifica se uma configuração é compatível com o sistema atual
 */
export function isConfigCompatible(config: PersonalizationConfig): boolean {
  try {
    // Verificar se consegue converter para filtros
    const filters = convertPersonalizationToFilters(config);
    
    // Verificar se tem pelo menos uma coluna visível
    const colunasVisiveis = config.passageiros.colunas.filter(col => col.visivel);
    if (colunasVisiveis.length === 0) return false;
    
    // Verificar se tem configurações básicas
    if (!config.header || !config.passageiros || !config.secoes) return false;
    
    return true;
  } catch (error) {
    return false;
  }
}

// ============================================================================
// UTILITÁRIOS DE URL
// ============================================================================

/**
 * Gera URL com parâmetros de personalização
 */
export function generatePersonalizationUrl(
  baseUrl: string, 
  config: PersonalizationConfig, 
  viagemId?: string
): string {
  try {
    const url = new URL(baseUrl);
    
    // Comprimir configuração para URL
    const compressed = btoa(encodeURIComponent(JSON.stringify(config)));
    url.searchParams.set('personalization', compressed);
    
    if (viagemId) {
      url.searchParams.set('viagem', viagemId);
    }
    
    return url.toString();
  } catch (error) {
    console.error('Erro ao gerar URL de personalização:', error);
    return baseUrl;
  }
}

/**
 * Extrai configuração de personalização da URL
 */
export function extractPersonalizationFromUrl(url: string): PersonalizationConfig | null {
  try {
    const urlObj = new URL(url);
    const personalizationParam = urlObj.searchParams.get('personalization');
    
    if (!personalizationParam) return null;
    
    const decompressed = JSON.parse(decodeURIComponent(atob(personalizationParam)));
    
    // Validar estrutura básica
    if (!decompressed.header || !decompressed.passageiros) return null;
    
    return decompressed as PersonalizationConfig;
  } catch (error) {
    console.error('Erro ao extrair personalização da URL:', error);
    return null;
  }
}

// ============================================================================
// MIGRAÇÃO AUTOMÁTICA
// ============================================================================

/**
 * Aplica migração automática de URLs antigas para novas
 */
export function migrateUrlIfNeeded(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Verificar se já tem personalização
    if (urlObj.searchParams.has('personalization')) {
      return url;
    }
    
    // Extrair filtros antigos e converter
    const oldFilters: Partial<ReportFilters> = {};
    
    // Mapear parâmetros conhecidos
    const paramMap: Record<string, keyof ReportFilters> = {
      'modo-responsavel': 'modoResponsavel',
      'modo-passageiro': 'modoPassageiro',
      'modo-empresa': 'modoEmpresaOnibus',
      'agrupar-onibus': 'agruparPorOnibus',
      'mostrar-telefone': 'mostrarTelefone',
      'mostrar-valores': 'mostrarValoresPassageiros'
    };
    
    Object.entries(paramMap).forEach(([param, filterKey]) => {
      if (urlObj.searchParams.has(param)) {
        (oldFilters as any)[filterKey] = urlObj.searchParams.get(param) === 'true';
      }
    });
    
    // Se encontrou filtros antigos, converter para personalização
    if (Object.keys(oldFilters).length > 0) {
      const config = migrateFiltersToPersonalization(oldFilters as ReportFilters);
      return generatePersonalizationUrl(url, config);
    }
    
    return url;
  } catch (error) {
    console.error('Erro na migração de URL:', error);
    return url;
  }
}