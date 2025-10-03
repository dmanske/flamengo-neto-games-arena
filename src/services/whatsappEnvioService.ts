/**
 * =====================================================
 * SERVIÇO - ENVIO MÚLTIPLO DE WHATSAPP
 * =====================================================
 * 
 * Serviço para gerenciar envio em lote de mensagens WhatsApp
 * com controle de rate limiting, tratamento de erros e logs.
 */

import { 
  EnvioMensagemData, 
  ResultadoEnvio, 
  ResumoEnvio, 
  SelectedTemplate,
  ViagemData,
  PassageiroData,
  VariableMapping
} from '@/types/whatsapp-templates';

// =====================================================
// INTERFACES
// =====================================================

interface EnvioConfig {
  /** Delay entre mensagens (ms) */
  delayEntreMensagens?: number;
  
  /** Máximo de tentativas por mensagem */
  maxTentativas?: number;
  
  /** Timeout por mensagem (ms) */
  timeoutMensagem?: number;
  
  /** Se deve parar no primeiro erro */
  pararNoErro?: boolean;
}

interface ProgressoEnvio {
  /** Total de mensagens */
  total: number;
  
  /** Mensagens processadas */
  processadas: number;
  
  /** Mensagens com sucesso */
  sucessos: number;
  
  /** Mensagens com falha */
  falhas: number;
  
  /** Mensagem atual sendo processada */
  mensagemAtual?: string;
  
  /** Percentual de progresso */
  percentual: number;
}

// =====================================================
// CLASSE PRINCIPAL
// =====================================================

export class WhatsAppEnvioService {
  private config: Required<EnvioConfig>;
  private abortController?: AbortController;
  
  constructor(config: EnvioConfig = {}) {
    this.config = {
      delayEntreMensagens: config.delayEntreMensagens ?? 2000, // 2 segundos
      maxTentativas: config.maxTentativas ?? 3,
      timeoutMensagem: config.timeoutMensagem ?? 10000, // 10 segundos
      pararNoErro: config.pararNoErro ?? false
    };
  }
  
  // =====================================================
  // MÉTODOS PÚBLICOS
  // =====================================================
  
  /**
   * Enviar mensagens em lote
   */
  async enviarLote(
    dados: EnvioMensagemData,
    onProgress?: (progresso: ProgressoEnvio) => void
  ): Promise<ResumoEnvio> {
    const inicioTempo = Date.now();
    this.abortController = new AbortController();
    
    try {
      // Gerar lista de envios
      const envios = this.gerarListaEnvios(dados);
      const resultados: ResultadoEnvio[] = [];
      
      // Progresso inicial
      const progresso: ProgressoEnvio = {
        total: envios.length,
        processadas: 0,
        sucessos: 0,
        falhas: 0,
        percentual: 0
      };
      
      if (onProgress) {
        onProgress(progresso);
      }
      
      // Processar cada envio
      for (let i = 0; i < envios.length; i++) {
        if (this.abortController.signal.aborted) {
          break;
        }
        
        const envio = envios[i];
        progresso.mensagemAtual = `${envio.passageiro.nome} - ${envio.template.template.nome}`;
        
        if (onProgress) {
          onProgress(progresso);
        }
        
        try {
          // Enviar mensagem individual
          const resultado = await this.enviarMensagemIndividual(envio);
          resultados.push(resultado);
          
          if (resultado.sucesso) {
            progresso.sucessos++;
          } else {
            progresso.falhas++;
            
            // Parar no erro se configurado
            if (this.config.pararNoErro) {
              break;
            }
          }
          
        } catch (error) {
          // Erro não tratado
          const resultado: ResultadoEnvio = {
            passageiro_id: envio.passageiro.id,
            passageiro_nome: envio.passageiro.nome,
            telefone: envio.passageiro.telefone,
            template_nome: envio.template.template.nome,
            sucesso: false,
            erro: error instanceof Error ? error.message : 'Erro desconhecido'
          };
          
          resultados.push(resultado);
          progresso.falhas++;
          
          if (this.config.pararNoErro) {
            break;
          }
        }
        
        // Atualizar progresso
        progresso.processadas++;
        progresso.percentual = Math.round((progresso.processadas / progresso.total) * 100);
        
        if (onProgress) {
          onProgress(progresso);
        }
        
        // Delay entre mensagens (exceto na última)
        if (i < envios.length - 1) {
          await this.delay(this.config.delayEntreMensagens);
        }
      }
      
      // Resumo final
      const tempoProcessamento = Date.now() - inicioTempo;
      
      return {
        total_enviadas: resultados.length,
        total_sucessos: progresso.sucessos,
        total_falhas: progresso.falhas,
        resultados,
        tempo_processamento: tempoProcessamento
      };
      
    } catch (error) {
      throw new Error(`Erro no envio em lote: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
  
  /**
   * Cancelar envio em andamento
   */
  cancelarEnvio(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }
  
  /**
   * Validar dados de envio
   */
  validarDados(dados: EnvioMensagemData): { valido: boolean; erros: string[] } {
    const erros: string[] = [];
    
    // Validar templates
    if (!dados.templates || dados.templates.length === 0) {
      erros.push('Nenhum template selecionado');
    }
    
    // Validar passageiros
    if (!dados.passageiros || dados.passageiros.length === 0) {
      erros.push('Nenhum passageiro selecionado');
    }
    
    // Validar viagem
    if (!dados.viagem) {
      erros.push('Dados da viagem não fornecidos');
    }
    
    // Validar templates individuais
    dados.templates?.forEach((template, index) => {
      if (!template.template.nome) {
        erros.push(`Template ${index + 1}: Nome não informado`);
      }
      
      if (!template.mensagemPersonalizada?.trim()) {
        erros.push(`Template ${index + 1}: Mensagem vazia`);
      }
      
      if (template.mensagemPersonalizada && template.mensagemPersonalizada.length > 4096) {
        erros.push(`Template ${index + 1}: Mensagem muito longa (máximo 4096 caracteres)`);
      }
    });
    
    // Validar passageiros individuais
    dados.passageiros?.forEach((passageiro, index) => {
      if (!passageiro.nome?.trim()) {
        erros.push(`Passageiro ${index + 1}: Nome não informado`);
      }
      
      if (!passageiro.telefone?.trim()) {
        erros.push(`Passageiro ${index + 1}: Telefone não informado`);
      }
      
      // Validar formato do telefone (básico)
      if (passageiro.telefone && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(passageiro.telefone)) {
        erros.push(`Passageiro ${index + 1}: Formato de telefone inválido`);
      }
    });
    
    return {
      valido: erros.length === 0,
      erros
    };
  }
  
  // =====================================================
  // MÉTODOS PRIVADOS
  // =====================================================
  
  /**
   * Gerar lista de envios individuais
   */
  private gerarListaEnvios(dados: EnvioMensagemData) {
    const envios: Array<{
      template: SelectedTemplate;
      passageiro: PassageiroData;
      viagem: ViagemData;
      mensagemProcessada: string;
    }> = [];
    
    // Combinar cada template com cada passageiro
    for (const template of dados.templates) {
      for (const passageiro of dados.passageiros) {
        const mensagemProcessada = this.processarVariaveis(
          template.mensagemPersonalizada,
          dados.viagem,
          passageiro,
          dados.configuracoes,
          dados.variaveisGlobais
        );
        
        envios.push({
          template,
          passageiro,
          viagem: dados.viagem,
          mensagemProcessada
        });
      }
    }
    
    return envios;
  }
  
  /**
   * Enviar mensagem individual
   */
  private async enviarMensagemIndividual(envio: {
    template: SelectedTemplate;
    passageiro: PassageiroData;
    viagem: ViagemData;
    mensagemProcessada: string;
  }): Promise<ResultadoEnvio> {
    
    let ultimoErro: string | undefined;
    
    // Tentar enviar com retry
    for (let tentativa = 1; tentativa <= this.config.maxTentativas; tentativa++) {
      try {
        // Simular envio (substituir por integração real)
        const sucesso = await this.simularEnvioWhatsApp(
          envio.passageiro.telefone,
          envio.mensagemProcessada
        );
        
        if (sucesso) {
          return {
            passageiro_id: envio.passageiro.id,
            passageiro_nome: envio.passageiro.nome,
            telefone: envio.passageiro.telefone,
            template_nome: envio.template.template.nome,
            sucesso: true,
            mensagem_enviada: envio.mensagemProcessada
          };
        } else {
          ultimoErro = `Falha na tentativa ${tentativa}`;
        }
        
      } catch (error) {
        ultimoErro = error instanceof Error ? error.message : 'Erro desconhecido';
        
        // Se não é a última tentativa, aguardar antes de tentar novamente
        if (tentativa < this.config.maxTentativas) {
          await this.delay(1000 * tentativa); // Backoff exponencial
        }
      }
    }
    
    // Todas as tentativas falharam
    return {
      passageiro_id: envio.passageiro.id,
      passageiro_nome: envio.passageiro.nome,
      telefone: envio.passageiro.telefone,
      template_nome: envio.template.template.nome,
      sucesso: false,
      erro: ultimoErro || 'Falha após todas as tentativas'
    };
  }
  
  /**
   * Processar variáveis na mensagem
   */
  private processarVariaveis(
    mensagem: string,
    viagem: ViagemData,
    passageiro: PassageiroData,
    configuracoes?: any,
    variaveisGlobais?: Record<string, string>
  ): string {
    
    // Criar mapeamento de variáveis
    const variaveis: VariableMapping = {
      NOME: passageiro.nome,
      DESTINO: viagem.destino,
      ADVERSARIO: viagem.destino, // Por padrão usa destino, mas pode ser sobrescrito
      DATA: new Date(viagem.data_viagem).toLocaleDateString('pt-BR'),
      HORARIO: viagem.horario_saida,
      HORARIO_CHEGADA: this.calcularHorarioChegada(viagem.horario_saida),
      LOCAL_SAIDA: viagem.local_saida,
      ONIBUS: viagem.onibus?.numero || viagem.onibus?.nome || 'A definir',
      LINK_GRUPO: viagem.link_grupo || 'Link será enviado em breve',
      VALOR: passageiro.valor_total ? `R$ ${passageiro.valor_total.toFixed(2).replace('.', ',')}` : 'A definir',
      TELEFONE: viagem.telefone_contato || '(11) 99999-9999'
    };
    
    // Aplicar configurações customizadas
    if (configuracoes) {
      if (configuracoes.linkGrupo) {
        variaveis.LINK_GRUPO = configuracoes.linkGrupo;
      }
      if (configuracoes.adversario) {
        variaveis.ADVERSARIO = configuracoes.adversario;
      }
      if (configuracoes.dataJogo) {
        variaveis.DATA = configuracoes.dataJogo;
      }
    }
    
    // Aplicar variáveis globais
    if (variaveisGlobais) {
      Object.assign(variaveis, variaveisGlobais);
    }
    
    // Substituir variáveis
    let mensagemProcessada = mensagem;
    
    Object.entries(variaveis).forEach(([chave, valor]) => {
      const regex = new RegExp(`\\{${chave}\\}`, 'g');
      mensagemProcessada = mensagemProcessada.replace(regex, valor);
    });
    
    return mensagemProcessada;
  }
  
  /**
   * Calcular horário de chegada (30min antes)
   */
  private calcularHorarioChegada(horarioSaida: string): string {
    try {
      const [hours, minutes] = horarioSaida.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes - 30;
      
      if (totalMinutes < 0) {
        const adjustedMinutes = 24 * 60 + totalMinutes;
        const newHours = Math.floor(adjustedMinutes / 60);
        const newMinutes = adjustedMinutes % 60;
        return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
      }
      
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      
      return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    } catch {
      return horarioSaida;
    }
  }
  
  /**
   * Simular envio WhatsApp (substituir por integração real)
   */
  private async simularEnvioWhatsApp(telefone: string, mensagem: string): Promise<boolean> {
    // Simular delay de rede
    await this.delay(500 + Math.random() * 1000);
    
    // Simular taxa de sucesso de 90%
    const sucesso = Math.random() > 0.1;
    
    if (!sucesso) {
      throw new Error('Falha simulada na API do WhatsApp');
    }
    
    return true;
  }
  
  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => {
      const timeout = setTimeout(resolve, ms);
      
      // Cancelar se abort signal for ativado
      if (this.abortController) {
        this.abortController.signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          resolve();
        });
      }
    });
  }
}

// =====================================================
// INSTÂNCIA SINGLETON
// =====================================================

export const whatsappEnvioService = new WhatsAppEnvioService();

// =====================================================
// FUNÇÕES UTILITÁRIAS
// =====================================================

/**
 * Criar instância personalizada do serviço
 */
export function criarWhatsAppEnvioService(config: EnvioConfig): WhatsAppEnvioService {
  return new WhatsAppEnvioService(config);
}

/**
 * Validar dados de envio (função utilitária)
 */
export function validarDadosEnvio(dados: EnvioMensagemData) {
  return whatsappEnvioService.validarDados(dados);
}

/**
 * Estimar tempo de envio
 */
export function estimarTempoEnvio(
  totalMensagens: number, 
  delayEntreMensagens: number = 2000
): number {
  return Math.ceil((totalMensagens * delayEntreMensagens) / 1000); // em segundos
}