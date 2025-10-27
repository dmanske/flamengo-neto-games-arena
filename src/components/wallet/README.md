# 💳 Sistema de Créditos Pré-pagos (Wallet)

Sistema de carteira digital interna que permite aos clientes depositar valores antecipadamente e usar esse saldo conforme o consumo.

## 🎯 Características Principais

- ✅ **Carteira Digital Simples**: Saldo por cliente, sem complexidade
- ✅ **Depósitos Manuais**: Administrador registra depósitos via interface
- ✅ **Uso Manual**: Administrador registra usos de créditos manualmente
- ✅ **Histórico Agrupado**: Transações organizadas por mês
- ✅ **Dashboard Administrativo**: Visão geral de todos os clientes
- ✅ **Alertas Visuais**: Notificações para saldo baixo
- ✅ **Relatórios**: Análise de movimentações por período
- ✅ **Interface Responsiva**: Funciona em desktop e mobile

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

```sql
-- Saldo atual por cliente
cliente_wallet (
  id, cliente_id, saldo_atual, total_depositado, total_usado, created_at, updated_at
)

-- Histórico completo de transações
wallet_transacoes (
  id, cliente_id, tipo, valor, saldo_anterior, saldo_posterior, 
  descricao, forma_pagamento, referencia_externa, usuario_admin, created_at
)

-- Logs de auditoria
wallet_audit_logs (
  id, operacao, usuario, cliente_afetado, valor, ip_address, user_agent, detalhes, created_at
)
```

### Funções SQL

- `wallet_depositar()`: Registra depósito e atualiza saldo
- `wallet_usar_creditos()`: Registra uso e debita saldo
- View materializada para relatórios mensais

## 🧩 Componentes

### 1. WalletSaldoCard
Exibe o saldo atual com alertas visuais e indicadores de tendência.

```tsx
<WalletSaldoCard
  saldo={1250.00}
  totalDepositado={2500.00}
  totalUsado={1250.00}
  ultimaMovimentacao={new Date()}
  size="large"
  showAlerts={true}
/>
```

### 2. WalletDepositoModal
Modal para registrar novos depósitos na carteira.

```tsx
<WalletDepositoModal
  open={modalOpen}
  onOpenChange={setModalOpen}
  clienteId="uuid-cliente"
  onSuccess={() => refetch()}
/>
```

### 3. WalletUsoModal
Modal para registrar uso manual de créditos.

```tsx
<WalletUsoModal
  open={modalOpen}
  onOpenChange={setModalOpen}
  clienteId="uuid-cliente"
  onSuccess={() => refetch()}
/>
```

### 4. WalletHistoricoAgrupado
Histórico de transações agrupado por mês com filtros.

```tsx
<WalletHistoricoAgrupado
  clienteId="uuid-cliente"
  filtroRapido="ultimos_3_meses"
  showFilters={true}
  showExport={true}
/>
```

### 5. WalletRelatorios
Sistema de relatórios com métricas e exportação.

```tsx
<WalletRelatorios className="space-y-6" />
```

## 🔧 Hooks

### useWalletSaldo
Consulta o saldo de um cliente específico.

```tsx
const { data: wallet, isLoading, error } = useWalletSaldo(clienteId);
```

### useWalletTransacoes
Lista transações com filtros e paginação.

```tsx
const { data: transacoes } = useWalletTransacoes(clienteId, filtros, limite);
```

### useWalletDeposito
Mutation para registrar depósitos.

```tsx
const depositoMutation = useWalletDeposito();
await depositoMutation.mutateAsync(dadosDeposito);
```

### useWalletUso
Mutation para registrar uso de créditos.

```tsx
const usoMutation = useWalletUso();
await usoMutation.mutateAsync(dadosUso);
```

## 🎨 Sistema de Cores e Alertas

### Cores do Saldo
- **Verde** (>R$ 500): Saldo saudável
- **Amarelo** (R$ 100-500): Saldo médio, atenção
- **Vermelho** (<R$ 100): Saldo baixo, crítico

### Alertas Visuais
- ⚠️ **Saldo Baixo**: Borda vermelha + ícone de alerta
- 📈 **Tendência Crescendo**: Ícone verde
- 📉 **Tendência Diminuindo**: Ícone vermelho

## 📱 Páginas e Rotas

### `/creditos-prepagos`
Dashboard administrativo principal com:
- Cards de resumo geral
- Lista de clientes com saldos
- Filtros e busca
- Ações rápidas (depósito, visualizar)

### Aba "Carteira" na página do cliente
Integrada na página de detalhes do cliente:
- Saldo destacado com alertas
- Resumo rápido de movimentações
- Histórico agrupado por mês
- Botões para depósito e uso

## 🔔 Sistema de Notificações

### Notificações Automáticas
- Saldo baixo (< R$ 100)
- Saldo zerado
- Sucesso em depósitos/usos
- Erros de validação

### Alertas Administrativos
- Clientes com saldo baixo
- Resumo mensal
- Erros de sistema

```tsx
import { useWalletNotifications } from '@/utils/walletNotifications';

const { notificarSaldoBaixo, notificarDepositoSucesso } = useWalletNotifications();
```

## 📊 Relatórios

### Métricas Disponíveis
- Total de transações por período
- Valor total depositado/usado
- Saldo líquido
- Ticket médio de depósitos/usos
- Clientes únicos por operação

### Exportação
- Excel/CSV com dados detalhados
- PDF com resumo executivo (planejado)
- Filtros por período personalizado

## 🔒 Segurança e Auditoria

### Row Level Security (RLS)
- Políticas configuradas no Supabase
- Acesso restrito a admins e financeiro
- Logs de todas as operações

### Validações
- Schemas Zod para formulários
- Validação de saldo suficiente
- Prevenção de valores negativos
- Idempotência em transações

## 🚀 Como Usar

### 1. Executar SQL no Supabase
```sql
-- Execute o arquivo: database/migrations/create_wallet_system.sql
```

### 2. Importar Componentes
```tsx
import { 
  WalletSaldoCard, 
  WalletDepositoButton,
  useWalletSaldo 
} from '@/components/wallet';
```

### 3. Usar na Aplicação
```tsx
// Dashboard principal
<Route path="/creditos-prepagos" component={CreditosPrePagos} />

// Aba do cliente
<CarteiraCliente clienteId={clienteId} cliente={cliente} />
```

## 🎯 Diferenças do Sistema Anterior

| Aspecto | Sistema Anterior | Sistema Novo |
|---------|------------------|--------------|
| **Complexidade** | Vinculação a viagens, tipos de crédito | Simples: depósito → uso |
| **Controle** | Automático | Manual total |
| **Interface** | Complexa | Limpa e intuitiva |
| **Histórico** | Linear | Agrupado por mês |
| **Alertas** | Básicos | Visuais e inteligentes |
| **Relatórios** | Limitados | Completos com exportação |

## 🔧 Configuração

### Variáveis de Ambiente
```env
# Já configurado no Supabase existente
VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_chave
```

### Dependências
```json
{
  "@tanstack/react-query": "^4.x",
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^3.x",
  "zod": "^3.x",
  "date-fns": "^2.x",
  "sonner": "^1.x"
}
```

## 📝 TODO / Melhorias Futuras

- [ ] Exportação real para Excel/CSV
- [ ] Geração de PDF para relatórios
- [ ] Gráficos interativos (Chart.js)
- [ ] Notificações por email
- [ ] API para integração externa
- [ ] Backup automático de dados
- [ ] Métricas avançadas de uso

## 🐛 Troubleshooting

### Erro: "Cliente não possui carteira"
- **Causa**: Cliente nunca recebeu depósito
- **Solução**: Fazer primeiro depósito para criar carteira

### Erro: "Saldo insuficiente"
- **Causa**: Tentativa de usar mais créditos que disponível
- **Solução**: Verificar saldo atual ou fazer depósito

### Performance lenta
- **Causa**: Muitas transações sem paginação
- **Solução**: Usar filtros de período ou implementar paginação virtual

---

**Sistema desenvolvido para simplicidade e eficiência! 🚀**