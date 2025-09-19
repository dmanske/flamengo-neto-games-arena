/**
 * Configurações padrão para diferentes cenários de personalização de relatórios
 */

import {
  PersonalizationConfig,
  ConfigScenario,
  DefaultConfigMap,
  PassageiroColumn,
  SecaoConfig,
  PassageiroDisplay
} from '@/types/personalizacao-relatorios';

// ============================================================================
// COLUNAS PADRÃO PARA PASSAGEIROS
// ============================================================================

/**
 * Gera as colunas padrão para a lista de passageiros
 */
export function gerarColunasPassageirosPadrao(): PassageiroColumn[] {
  return [
    {
      id: 'numeroSequencial',
      label: 'Nº',
      visivel: true,
      largura: 50,
      ordem: 0,
      categoria: 'pessoais',
      alinhamento: 'center',
      formatacao: { tipo: 'numero' }
    },
    {
      id: 'nome',
      label: 'Nome',
      visivel: true,
      largura: 200,
      ordem: 1,
      categoria: 'pessoais',
      alinhamento: 'left',
      formatacao: { tipo: 'texto' }
    },
    {
      id: 'cpf',
      label: 'CPF',
      visivel: true,
      largura: 120,
      ordem: 2,
      categoria: 'pessoais',
      alinhamento: 'center',
      formatacao: { tipo: 'cpf' }
    },
    {
      id: 'dataNascimento',
      label: 'Data Nasc.',
      visivel: false,
      largura: 100,
      ordem: 3,
      categoria: 'pessoais',
      alinhamento: 'center',
      formatacao: { tipo: 'data' }
    },
    {
      id: 'idade',
      label: 'Idade',
      visivel: false,
      largura: 60,
      ordem: 4,
      categoria: 'pessoais',
      alinhamento: 'center',
      formatacao: { tipo: 'numero' }
    },
    {
      id: 'telefone',
      label: 'Telefone',
      visivel: true,
      largura: 120,
      ordem: 5,
      categoria: 'pessoais',
      alinhamento: 'center',
      formatacao: { tipo: 'telefone' }
    },
    {
      id: 'email',
      label: 'E-mail',
      visivel: false,
      largura: 180,
      ordem: 6,
      categoria: 'pessoais',
      alinhamento: 'left',
      formatacao: { tipo: 'texto' }
    },
    {
      id: 'cidade',
      label: 'Cidade',
      visivel: true,
      largura: 120,
      ordem: 7,
      categoria: 'localizacao',
      alinhamento: 'left',
      formatacao: { tipo: 'texto' }
    },
    {
      id: 'estado',
      label: 'Estado',
      visivel: false,
      largura: 60,
      ordem: 8,
      categoria: 'localizacao',
      alinhamento: 'center',
      formatacao: { tipo: 'texto' }
    },
    {
      id: 'endereco',
      label: 'Endereço',
      visivel: false,
      largura: 200,
      ordem: 9,
      categoria: 'localizacao',
      alinhamento: 'left',
      formatacao: { tipo: 'texto' }
    },
    {
      id: 'setorMaracana',
      label: 'Setor',
      visivel: true,
      largura: 80,
      ordem: 10,
      categoria: 'viagem',
      alinhamento: 'center',
      formatacao: { tipo: 'texto' }
    },
    {
      id: 'onibusAlocado',
      label: 'Ônibus',
      visivel: true,
      largura: 80,
      ordem: 11,
      categoria: 'viagem',
      alinhamento: 'center',
      formatacao: { tipo: 'texto' }
    },
    {
      id: 'statusPagamento',
      label: 'Status Pag.',
      visivel: true,
      largura: 100,
      ordem: 12,
      categoria: 'financeiro',
      alinhamento: 'center',
      formatacao: { tipo: 'texto' }
    },
    {
      id: 'valorPago',
      label: 'Valor Pago',
      visivel: true,
      largura: 100,
      ordem: 13,
      categoria: 'financeiro',
      alinhamento: 'right',
      formatacao: { tipo: 'moeda', prefixo: 'R$ ' }
    },
    {
      id: 'formaPagamento',
      label: 'Forma Pag.',
      visivel: false,
      largura: 120,
      ordem: 14,
      categoria: 'financeiro',
      alinhamento: 'center',
      formatacao: { tipo: 'texto' }
    },
    {
      id: 'passeiosSelecionados',
      label: 'Passeios',
      visivel: true,
      largura: 150,
      ordem: 15,
      categoria: 'passeios',
      alinhamento: 'left',
      formatacao: { tipo: 'texto' }
    },
    {
      id: 'observacoes',
      label: 'Observações',
      visivel: false,
      largura: 200,
      ordem: 16,
      categoria: 'extras',
      alinhamento: 'left',
      formatacao: { tipo: 'texto' }
    }
  ];
}

/**
 * Gera as seções padrão para o relatório
 */
export function gerarSecoesPadrao(): SecaoConfig[] {
  return [
    {
      id: 'resumo_financeiro',
      titulo: 'Resumo Financeiro',
      visivel: true,
      ordem: 0,
      tipo: 'resumo_financeiro',
      configuracao: {
        mostrarTotalArrecadado: true,
        mostrarTotalPendente: true,
        mostrarDescontos: true
      }
    },
    {
      id: 'distribuicao_setor',
      titulo: 'Distribuição por Setor',
      visivel: true,
      ordem: 1,
      tipo: 'distribuicao_setor',
      configuracao: {
        mostrarPercentuais: true,
        mostrarGraficos: false
      }
    },
    {
      id: 'distribuicao_onibus',
      titulo: 'Distribuição por Ônibus',
      visivel: true,
      ordem: 2,
      tipo: 'distribuicao_onibus',
      configuracao: {
        mostrarOcupacao: true,
        mostrarCapacidade: true
      }
    },
    {
      id: 'estatisticas_passeios',
      titulo: 'Estatísticas de Passeios',
      visivel: true,
      ordem: 3,
      tipo: 'estatisticas_passeios',
      configuracao: {
        mostrarParticipantes: true,
        mostrarReceita: true,
        mostrarFaixasEtarias: true
      }
    },
    {
      id: 'faixas_etarias',
      titulo: 'Distribuição por Faixa Etária',
      visivel: false,
      ordem: 4,
      tipo: 'faixas_etarias',
      configuracao: {
        mostrarPercentuais: true,
        faixas: ['0-17', '18-29', '30-49', '50+']
      }
    },
    {
      id: 'formas_pagamento',
      titulo: 'Formas de Pagamento',
      visivel: false,
      ordem: 5,
      tipo: 'formas_pagamento',
      configuracao: {
        mostrarPercentuais: true,
        mostrarValores: true
      }
    }
  ];
}

// ============================================================================
// CONFIGURAÇÕES PADRÃO POR CENÁRIO
// ============================================================================

/**
 * Configuração completa padrão
 */
export function gerarConfigCompleto(): PersonalizationConfig {
  return {
    header: {
      dadosJogo: {
        mostrarAdversario: true,
        mostrarDataHora: true,
        mostrarLocalJogo: true,
        mostrarNomeEstadio: true
      },
      dadosViagem: {
        mostrarStatus: true,
        mostrarValorPadrao: true,
        mostrarSetorPadrao: true,
        mostrarRota: false,
        mostrarTipoPagamento: false
      },
      logos: {
        mostrarLogoEmpresa: true,
        mostrarLogoAdversario: true,
        mostrarLogoFlamengo: true,
        posicionamento: 'horizontal',
        tamanhoLogos: 'medio'
      },
      empresa: {
        mostrarNome: true,
        mostrarTelefone: true,
        mostrarEmail: true,
        mostrarEndereco: false,
        mostrarSite: false,
        mostrarRedesSociais: false
      },
      totais: {
        mostrarTotalIngressos: true,
        mostrarTotalPassageiros: true,
        mostrarTotalArrecadado: true,
        mostrarDataGeracao: true
      },
      textoPersonalizado: {}
    },
    passageiros: {
      colunas: gerarColunasPassageirosPadrao(),
      ordenacao: {
        campo: 'nome',
        direcao: 'asc'
      },
      agrupamento: {
        ativo: false,
        mostrarTotaisPorGrupo: false
      },
      filtros: {
        statusPagamento: [],
        setoresMaracana: [],
        onibusIds: [],
        cidades: [],
        passeios: []
      }
    },
    onibus: {
      dadosBasicos: {
        mostrarNumeroIdentificacao: true,
        mostrarTipoOnibus: true,
        mostrarEmpresa: true,
        mostrarCapacidade: true,
        mostrarLugaresExtras: false
      },
      dadosTransfer: {
        mostrarNomeTour: false,
        mostrarRota: false,
        mostrarPlaca: false,
        mostrarMotorista: false
      },
      dadosOcupacao: {
        mostrarTotalPassageiros: true,
        mostrarPassageirosConfirmados: true,
        mostrarVagasDisponiveis: true,
        mostrarTaxaOcupacao: true
      },
      dadosTecnicos: {
        mostrarWifi: false,
        mostrarFoto: false,
        mostrarObservacoes: false
      },
      exibicao: {
        mostrarListaPassageiros: true,
        paginaSeparadaPorOnibus: false,
        ordenarPor: 'numero'
      }
    },
    passeios: {
      tiposPasseios: {
        incluirPagos: true,
        incluirGratuitos: true,
        passeiosEspecificos: [],
        excluirPasseios: []
      },
      dadosPorPasseio: {
        mostrarNome: true,
        mostrarCategoria: true,
        mostrarValorCobrado: true,
        mostrarCustoOperacional: false,
        mostrarDescricao: false
      },
      estatisticas: {
        mostrarTotalParticipantes: true,
        mostrarReceitaPorPasseio: true,
        mostrarMargemLucro: false,
        mostrarFaixasEtarias: true
      },
      agrupamentos: {
        tipo: 'categoria',
        ordenacao: 'alfabetica'
      },
      exibicaoNaLista: {
        formato: 'texto_concatenado',
        mostrarStatus: false,
        mostrarValoresIndividuais: false,
        mostrarObservacoes: false
      }
    },
    secoes: {
      secoes: gerarSecoesPadrao(),
      ordenacao: ['resumo_financeiro', 'distribuicao_setor', 'distribuicao_onibus', 'estatisticas_passeios'],
      quebrasAutomaticas: true
    },
    estilo: {
      fontes: {
        tamanhoHeader: 16,
        tamanhoTexto: 12,
        tamanhoTabela: 10,
        familia: 'Arial, sans-serif',
        pesoHeader: 'bold',
        pesoTexto: 'normal'
      },
      cores: {
        headerPrincipal: '#1f2937',
        headerSecundario: '#374151',
        textoNormal: '#111827',
        destaque: '#dc2626',
        linhasAlternadas: true,
        corLinhasAlternadas: '#f9fafb',
        bordas: '#d1d5db',
        fundo: '#ffffff'
      },
      layout: {
        orientacao: 'retrato',
        margens: {
          superior: 20,
          inferior: 20,
          esquerda: 20,
          direita: 20
        },
        espacamento: {
          entreSecoes: 15,
          entreTabelas: 10,
          entreParagrafos: 8,
          entreLinhas: 1.2
        },
        quebrasAutomaticas: true,
        colunasDuplas: false
      },
      elementos: {
        bordas: true,
        separadores: true,
        numeracaoPaginas: true
      }
    },
    metadata: {
      nome: 'Configuração Completa',
      descricao: 'Configuração padrão com todas as informações',
      categoria: 'oficial',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      versao: '1.0',
      tags: ['completo', 'padrão']
    }
  };
}

/**
 * Configuração para responsável de ônibus
 */
export function gerarConfigResponsavel(): PersonalizationConfig {
  const config = gerarConfigCompleto();
  
  // Remover informações financeiras
  config.header.dadosViagem.mostrarValorPadrao = false;
  config.header.totais.mostrarTotalArrecadado = false;
  
  // Ajustar colunas de passageiros
  config.passageiros.colunas = config.passageiros.colunas.map(col => ({
    ...col,
    visivel: col.categoria !== 'financeiro' && 
             ['numeroSequencial', 'nome', 'telefone', 'cidade', 'setorMaracana', 'onibusAlocado', 'passeiosSelecionados'].includes(col.id)
  }));
  
  // Remover seções financeiras
  config.secoes.secoes = config.secoes.secoes.map(secao => ({
    ...secao,
    visivel: !['resumo_financeiro', 'formas_pagamento'].includes(secao.id)
  }));
  
  config.metadata.nome = 'Lista para Responsável do Ônibus';
  config.metadata.descricao = 'Lista sem informações financeiras, focada em dados operacionais';
  config.metadata.tags = ['responsável', 'operacional'];
  
  return config;
}

/**
 * Configuração para lista de passageiros
 */
export function gerarConfigPassageiros(): PersonalizationConfig {
  const config = gerarConfigCompleto();
  
  // Simplificar header
  config.header.dadosViagem.mostrarValorPadrao = false;
  config.header.totais.mostrarTotalArrecadado = false;
  config.header.empresa.mostrarEndereco = false;
  
  // Colunas essenciais para passageiros
  config.passageiros.colunas = config.passageiros.colunas.map(col => ({
    ...col,
    visivel: ['numeroSequencial', 'nome', 'cidade', 'setorMaracana', 'onibusAlocado', 'passeiosSelecionados'].includes(col.id)
  }));
  
  // Agrupar por ônibus
  config.passageiros.agrupamento.ativo = true;
  config.passageiros.agrupamento.campo = 'onibus';
  
  // Mostrar foto do ônibus
  config.onibus.dadosTecnicos.mostrarFoto = true;
  
  // Remover seções desnecessárias
  config.secoes.secoes = config.secoes.secoes.map(secao => ({
    ...secao,
    visivel: ['distribuicao_onibus', 'estatisticas_passeios'].includes(secao.id)
  }));
  
  config.metadata.nome = 'Lista para Passageiros';
  config.metadata.descricao = 'Lista simplificada com informações essenciais para passageiros';
  config.metadata.tags = ['passageiros', 'simplificado'];
  
  return config;
}

/**
 * Configuração para empresa de ônibus
 */
export function gerarConfigEmpresaOnibus(): PersonalizationConfig {
  const config = gerarConfigCompleto();
  
  // Focar em dados necessários para empresa de ônibus
  config.header.dadosViagem.mostrarValorPadrao = false;
  config.header.totais.mostrarTotalArrecadado = false;
  
  // Colunas específicas para empresa de ônibus
  config.passageiros.colunas = config.passageiros.colunas.map(col => ({
    ...col,
    visivel: ['numeroSequencial', 'nome', 'cpf', 'dataNascimento', 'cidade', 'onibusAlocado'].includes(col.id)
  }));
  
  // Agrupar por ônibus
  config.passageiros.agrupamento.ativo = true;
  config.passageiros.agrupamento.campo = 'onibus';
  
  // Remover seções desnecessárias
  config.secoes.secoes = config.secoes.secoes.map(secao => ({
    ...secao,
    visivel: secao.id === 'distribuicao_onibus'
  }));
  
  config.metadata.nome = 'Lista para Empresa de Ônibus';
  config.metadata.descricao = 'Lista com dados necessários para empresa de ônibus (CPF, data nascimento, embarque)';
  config.metadata.tags = ['empresa-onibus', 'embarque'];
  
  return config;
}

/**
 * Configuração para compra de ingressos
 */
export function gerarConfigComprarIngressos(): PersonalizationConfig {
  const config = gerarConfigCompleto();
  
  // Focar em dados de ingressos
  config.header.dadosViagem.mostrarValorPadrao = false;
  config.header.totais.mostrarTotalArrecadado = false;
  
  // Colunas para compra de ingressos
  config.passageiros.colunas = config.passageiros.colunas.map(col => ({
    ...col,
    visivel: ['numeroSequencial', 'nome', 'cpf', 'setorMaracana'].includes(col.id)
  }));
  
  // Não agrupar
  config.passageiros.agrupamento.ativo = false;
  
  // Seções específicas para ingressos
  config.secoes.secoes = config.secoes.secoes.map(secao => ({
    ...secao,
    visivel: ['distribuicao_setor', 'total_ingressos'].includes(secao.id)
  }));
  
  config.metadata.nome = 'Lista para Compra de Ingressos';
  config.metadata.descricao = 'Lista focada em dados de ingressos e setores';
  config.metadata.tags = ['ingressos', 'setores'];
  
  return config;
}

/**
 * Configuração para compra de passeios
 */
export function gerarConfigComprarPasseios(): PersonalizationConfig {
  const config = gerarConfigCompleto();
  
  // Focar em dados de passeios
  config.header.dadosViagem.mostrarValorPadrao = false;
  config.header.totais.mostrarTotalArrecadado = false;
  
  // Colunas para passeios
  config.passageiros.colunas = config.passageiros.colunas.map(col => ({
    ...col,
    visivel: ['numeroSequencial', 'nome', 'idade', 'passeiosSelecionados'].includes(col.id)
  }));
  
  // Seções específicas para passeios
  config.secoes.secoes = config.secoes.secoes.map(secao => ({
    ...secao,
    visivel: ['estatisticas_passeios', 'faixas_etarias'].includes(secao.id)
  }));
  
  config.metadata.nome = 'Lista para Compra de Passeios';
  config.metadata.descricao = 'Lista focada em passeios e faixas etárias';
  config.metadata.tags = ['passeios', 'faixas-etarias'];
  
  return config;
}

/**
 * Configuração para transfer
 */
export function gerarConfigTransfer(): PersonalizationConfig {
  const config = gerarConfigCompleto();
  
  // Focar em dados de transfer
  config.header.dadosViagem.mostrarRota = true;
  config.header.dadosViagem.mostrarValorPadrao = false;
  config.header.totais.mostrarTotalArrecadado = false;
  
  // Mostrar dados de transfer nos ônibus
  config.onibus.dadosTransfer.mostrarRota = true;
  config.onibus.dadosTransfer.mostrarPlaca = true;
  config.onibus.dadosTransfer.mostrarMotorista = true;
  
  // Colunas para transfer
  config.passageiros.colunas = config.passageiros.colunas.map(col => ({
    ...col,
    visivel: ['numeroSequencial', 'nome', 'telefone', 'cidade', 'onibusAlocado', 'passeiosSelecionados'].includes(col.id)
  }));
  
  // Agrupar por ônibus
  config.passageiros.agrupamento.ativo = true;
  config.passageiros.agrupamento.campo = 'onibus';
  
  // Seções específicas para transfer
  config.secoes.secoes = config.secoes.secoes.map(secao => ({
    ...secao,
    visivel: ['distribuicao_onibus', 'distribuicao_cidade'].includes(secao.id)
  }));
  
  config.metadata.nome = 'Lista para Transfer';
  config.metadata.descricao = 'Lista agrupada por ônibus com rota, placa e motorista';
  config.metadata.tags = ['transfer', 'onibus', 'rota'];
  
  return config;
}

// ============================================================================
// MAPEAMENTO DE CONFIGURAÇÕES PADRÃO
// ============================================================================

export const DEFAULT_CONFIGS: DefaultConfigMap = {
  [ConfigScenario.COMPLETO]: gerarConfigCompleto,
  [ConfigScenario.RESPONSAVEL]: gerarConfigResponsavel,
  [ConfigScenario.PASSAGEIROS]: gerarConfigPassageiros,
  [ConfigScenario.EMPRESA_ONIBUS]: gerarConfigEmpresaOnibus,
  [ConfigScenario.COMPRAR_INGRESSOS]: gerarConfigComprarIngressos,
  [ConfigScenario.COMPRAR_PASSEIOS]: gerarConfigComprarPasseios,
  [ConfigScenario.TRANSFER]: gerarConfigTransfer,
  [ConfigScenario.FINANCEIRO]: gerarConfigCompleto, // Por enquanto usa o completo
  [ConfigScenario.OPERACIONAL]: gerarConfigResponsavel // Por enquanto usa o responsável
};

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Obtém uma configuração padrão por cenário
 */
export function getDefaultConfig(scenario: ConfigScenario): PersonalizationConfig {
  const configGenerator = DEFAULT_CONFIGS[scenario];
  return configGenerator();
}

/**
 * Lista todos os cenários disponíveis
 */
export function getAvailableScenarios(): Array<{ id: ConfigScenario; nome: string; descricao: string }> {
  return [
    {
      id: ConfigScenario.COMPLETO,
      nome: 'Relatório Completo',
      descricao: 'Todas as informações e seções disponíveis'
    },
    {
      id: ConfigScenario.RESPONSAVEL,
      nome: 'Lista para Responsável',
      descricao: 'Sem informações financeiras, foco operacional'
    },
    {
      id: ConfigScenario.PASSAGEIROS,
      nome: 'Lista para Passageiros',
      descricao: 'Informações essenciais, agrupado por ônibus'
    },
    {
      id: ConfigScenario.EMPRESA_ONIBUS,
      nome: 'Lista para Empresa de Ônibus',
      descricao: 'CPF, data nascimento e dados de embarque'
    },
    {
      id: ConfigScenario.COMPRAR_INGRESSOS,
      nome: 'Lista para Compra de Ingressos',
      descricao: 'Foco em setores e dados de ingressos'
    },
    {
      id: ConfigScenario.COMPRAR_PASSEIOS,
      nome: 'Lista para Compra de Passeios',
      descricao: 'Foco em passeios e faixas etárias'
    },
    {
      id: ConfigScenario.TRANSFER,
      nome: 'Lista para Transfer',
      descricao: 'Agrupado por ônibus com dados de rota'
    }
  ];
}