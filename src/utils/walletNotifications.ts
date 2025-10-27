import { toast } from 'sonner';
import { WalletAlerta } from '@/types/wallet';
import { formatCurrency } from '@/utils/formatters';

// =====================================================
// SISTEMA DE NOTIFICAÇÕES DA CARTEIRA
// =====================================================

export class WalletNotificationService {
  private static instance: WalletNotificationService;
  
  public static getInstance(): WalletNotificationService {
    if (!WalletNotificationService.instance) {
      WalletNotificationService.instance = new WalletNotificationService();
    }
    return WalletNotificationService.instance;
  }

  // =====================================================
  // NOTIFICAÇÕES DE SALDO
  // =====================================================

  public notificarSaldoBaixo(clienteNome: string, saldo: number): void {
    toast.warning(
      `⚠️ Saldo baixo para ${clienteNome}`,
      {
        description: `Saldo atual: ${formatCurrency(saldo)}. Considere fazer um depósito.`,
        duration: 8000,
        action: {
          label: 'Ver Cliente',
          onClick: () => {
            // TODO: Navegar para página do cliente
            console.log('Navegar para cliente:', clienteNome);
          },
        },
      }
    );
  }

  public notificarSaldoZerado(clienteNome: string): void {
    toast.error(
      `🚨 Saldo zerado para ${clienteNome}`,
      {
        description: 'Cliente não possui mais créditos disponíveis.',
        duration: 10000,
        action: {
          label: 'Fazer Depósito',
          onClick: () => {
            // TODO: Abrir modal de depósito
            console.log('Abrir modal de depósito para:', clienteNome);
          },
        },
      }
    );
  }

  // =====================================================
  // NOTIFICAÇÕES DE TRANSAÇÕES
  // =====================================================

  public notificarDepositoSucesso(clienteNome: string, valor: number, novoSaldo: number): void {
    toast.success(
      `💰 Depósito realizado com sucesso!`,
      {
        description: `${clienteNome}: +${formatCurrency(valor)}. Novo saldo: ${formatCurrency(novoSaldo)}`,
        duration: 5000,
      }
    );
  }

  public notificarUsoSucesso(clienteNome: string, valor: number, novoSaldo: number): void {
    toast.success(
      `🛒 Uso de créditos registrado!`,
      {
        description: `${clienteNome}: -${formatCurrency(valor)}. Saldo restante: ${formatCurrency(novoSaldo)}`,
        duration: 5000,
      }
    );
  }

  public notificarSaldoInsuficiente(clienteNome: string, valorTentativa: number, saldoAtual: number): void {
    const falta = valorTentativa - saldoAtual;
    
    toast.error(
      `❌ Saldo insuficiente para ${clienteNome}`,
      {
        description: `Tentativa: ${formatCurrency(valorTentativa)}. Saldo: ${formatCurrency(saldoAtual)}. Falta: ${formatCurrency(falta)}`,
        duration: 8000,
        action: {
          label: 'Fazer Depósito',
          onClick: () => {
            // TODO: Abrir modal de depósito
            console.log('Abrir modal de depósito para:', clienteNome);
          },
        },
      }
    );
  }

  // =====================================================
  // NOTIFICAÇÕES ADMINISTRATIVAS
  // =====================================================

  public notificarClientesSaldoBaixo(quantidade: number): void {
    if (quantidade === 0) return;

    toast.warning(
      `⚠️ ${quantidade} cliente(s) com saldo baixo`,
      {
        description: 'Clientes com menos de R$ 100,00 na carteira.',
        duration: 10000,
        action: {
          label: 'Ver Lista',
          onClick: () => {
            // TODO: Filtrar lista por saldo baixo
            console.log('Filtrar clientes com saldo baixo');
          },
        },
      }
    );
  }

  public notificarResumoMensal(depositos: number, usos: number, saldoLiquido: number): void {
    const icone = saldoLiquido >= 0 ? '📈' : '📉';
    const cor = saldoLiquido >= 0 ? 'success' : 'warning';
    
    toast[cor](
      `${icone} Resumo mensal atualizado`,
      {
        description: `Depósitos: ${formatCurrency(depositos)} | Usos: ${formatCurrency(usos)} | Líquido: ${formatCurrency(saldoLiquido)}`,
        duration: 6000,
      }
    );
  }

  // =====================================================
  // ALERTAS DE SISTEMA
  // =====================================================

  public criarAlertaSaldoBaixo(clienteId: string, clienteNome: string, saldo: number): WalletAlerta {
    return {
      tipo: 'saldo_baixo',
      mensagem: `${clienteNome} possui saldo baixo: ${formatCurrency(saldo)}`,
      cor: saldo < 50 ? 'red' : 'yellow',
      icone: saldo < 50 ? '🚨' : '⚠️',
      cliente_id: clienteId,
    };
  }

  public criarAlertaSemMovimentacao(clienteId: string, clienteNome: string, diasSemMovimentacao: number): WalletAlerta {
    return {
      tipo: 'sem_movimentacao',
      mensagem: `${clienteNome} sem movimentação há ${diasSemMovimentacao} dias`,
      cor: 'blue',
      icone: '📅',
      cliente_id: clienteId,
    };
  }

  public criarAlertaAltoUso(clienteId: string, clienteNome: string, valorUsado: number, periodo: string): WalletAlerta {
    return {
      tipo: 'alto_uso',
      mensagem: `${clienteNome} com alto uso: ${formatCurrency(valorUsado)} em ${periodo}`,
      cor: 'yellow',
      icone: '📊',
      cliente_id: clienteId,
    };
  }

  // =====================================================
  // NOTIFICAÇÕES DE ERRO
  // =====================================================

  public notificarErroConexao(): void {
    toast.error(
      '🔌 Erro de conexão',
      {
        description: 'Não foi possível conectar ao servidor. Tente novamente.',
        duration: 5000,
        action: {
          label: 'Tentar Novamente',
          onClick: () => {
            window.location.reload();
          },
        },
      }
    );
  }

  public notificarErroPermissao(): void {
    toast.error(
      '🔒 Acesso negado',
      {
        description: 'Você não tem permissão para realizar esta operação.',
        duration: 5000,
      }
    );
  }

  public notificarErroValidacao(campo: string, erro: string): void {
    toast.error(
      `❌ Erro de validação`,
      {
        description: `${campo}: ${erro}`,
        duration: 4000,
      }
    );
  }

  // =====================================================
  // NOTIFICAÇÕES DE SUCESSO GERAL
  // =====================================================

  public notificarSucesso(titulo: string, descricao?: string): void {
    toast.success(titulo, {
      description: descricao,
      duration: 3000,
    });
  }

  public notificarInfo(titulo: string, descricao?: string): void {
    toast.info(titulo, {
      description: descricao,
      duration: 4000,
    });
  }

  // =====================================================
  // UTILITÁRIOS
  // =====================================================

  public limparTodasNotificacoes(): void {
    toast.dismiss();
  }

  public verificarSaldosClientes(clientes: Array<{ id: string; nome: string; saldo_atual: number }>): WalletAlerta[] {
    const alertas: WalletAlerta[] = [];
    
    clientes.forEach(cliente => {
      if (cliente.saldo_atual < 100) {
        alertas.push(this.criarAlertaSaldoBaixo(cliente.id, cliente.nome, cliente.saldo_atual));
      }
    });

    return alertas;
  }

  public processarAlertas(alertas: WalletAlerta[]): void {
    alertas.forEach(alerta => {
      switch (alerta.tipo) {
        case 'saldo_baixo':
          if (alerta.cliente_id) {
            // Extrair nome do cliente da mensagem (simplificado)
            const nome = alerta.mensagem.split(' possui')[0];
            const saldoMatch = alerta.mensagem.match(/R\$\s*([\d.,]+)/);
            const saldo = saldoMatch ? parseFloat(saldoMatch[1].replace(',', '.')) : 0;
            this.notificarSaldoBaixo(nome, saldo);
          }
          break;
        case 'sem_movimentacao':
          toast.info(alerta.icone + ' ' + alerta.mensagem, { duration: 6000 });
          break;
        case 'alto_uso':
          toast.warning(alerta.icone + ' ' + alerta.mensagem, { duration: 6000 });
          break;
      }
    });
  }
}

// =====================================================
// INSTÂNCIA SINGLETON PARA USO GLOBAL
// =====================================================

export const walletNotifications = WalletNotificationService.getInstance();

// =====================================================
// HOOKS PARA NOTIFICAÇÕES
// =====================================================

export const useWalletNotifications = () => {
  return {
    notificarSaldoBaixo: walletNotifications.notificarSaldoBaixo.bind(walletNotifications),
    notificarSaldoZerado: walletNotifications.notificarSaldoZerado.bind(walletNotifications),
    notificarDepositoSucesso: walletNotifications.notificarDepositoSucesso.bind(walletNotifications),
    notificarUsoSucesso: walletNotifications.notificarUsoSucesso.bind(walletNotifications),
    notificarSaldoInsuficiente: walletNotifications.notificarSaldoInsuficiente.bind(walletNotifications),
    notificarClientesSaldoBaixo: walletNotifications.notificarClientesSaldoBaixo.bind(walletNotifications),
    notificarResumoMensal: walletNotifications.notificarResumoMensal.bind(walletNotifications),
    notificarErroConexao: walletNotifications.notificarErroConexao.bind(walletNotifications),
    notificarErroPermissao: walletNotifications.notificarErroPermissao.bind(walletNotifications),
    notificarErroValidacao: walletNotifications.notificarErroValidacao.bind(walletNotifications),
    notificarSucesso: walletNotifications.notificarSucesso.bind(walletNotifications),
    notificarInfo: walletNotifications.notificarInfo.bind(walletNotifications),
    limparTodasNotificacoes: walletNotifications.limparTodasNotificacoes.bind(walletNotifications),
    verificarSaldosClientes: walletNotifications.verificarSaldosClientes.bind(walletNotifications),
    processarAlertas: walletNotifications.processarAlertas.bind(walletNotifications),
  };
};

// =====================================================
// CONFIGURAÇÕES DE NOTIFICAÇÃO
// =====================================================

export const WALLET_NOTIFICATION_CONFIG = {
  SALDO_BAIXO_LIMITE: 100,
  SALDO_CRITICO_LIMITE: 50,
  DIAS_SEM_MOVIMENTACAO_ALERTA: 30,
  ALTO_USO_LIMITE_MENSAL: 1000,
  DURACAO_NOTIFICACAO_PADRAO: 5000,
  DURACAO_NOTIFICACAO_ERRO: 8000,
  DURACAO_NOTIFICACAO_SUCESSO: 3000,
} as const;