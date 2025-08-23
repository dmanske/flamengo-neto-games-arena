# Sistema de Pagamentos de Créditos

Este sistema permite gerenciar pagamentos parcelados e histórico de pagamentos para os créditos de viagem dos clientes.

## Funcionalidades Implementadas

### 🎯 **Principais Recursos**

1. **Registro de Pagamentos**
   - Registrar pagamentos parciais ou totais
   - Definir data do pagamento
   - Escolher forma de pagamento
   - Adicionar observações

2. **Histórico Completo**
   - Visualizar todos os pagamentos de um crédito
   - Editar pagamentos existentes
   - Deletar pagamentos (com confirmação)
   - Resumo financeiro visual

3. **Status Visual**
   - Badge de status de pagamento na tabela principal
   - Barra de progresso dos pagamentos
   - Indicadores visuais de saldo restante

### 🔧 **Componentes Criados**

#### `PagamentoCreditoModal`
Modal para registrar ou editar pagamentos de créditos.

**Props:**
- `open`: boolean - Controla se o modal está aberto
- `onOpenChange`: função - Callback para mudança de estado
- `credito`: Credito - Dados do crédito
- `pagamento?`: HistoricoPagamentoCredito - Pagamento para edição (opcional)
- `historicoPagamentos?`: array - Histórico de pagamentos
- `onSuccess`: função - Callback de sucesso
- `onRegistrarPagamento?`: função - Função para registrar pagamento
- `onEditarPagamento?`: função - Função para editar pagamento

#### `HistoricoPagamentosCreditoModal`
Modal para visualizar histórico completo de pagamentos.

**Props:**
- `open`: boolean - Controla se o modal está aberto
- `onOpenChange`: função - Callback para mudança de estado
- `credito`: Credito - Dados do crédito
- `historicoPagamentos`: array - Lista de pagamentos
- `onDeletarPagamento?`: função - Função para deletar pagamento
- `onEditarPagamento?`: função - Callback para editar pagamento
- `onNovoPagamento?`: função - Callback para novo pagamento

#### `StatusPagamentoCredito`
Componente para mostrar status visual do pagamento na tabela.

**Props:**
- `valorTotal`: number - Valor total do crédito
- `saldoDisponivel`: number - Saldo disponível
- `className?`: string - Classes CSS adicionais

### 🗄️ **Hook: `usePagamentosCreditos`**

Hook para gerenciar operações de pagamentos de créditos.

**Métodos:**
- `buscarHistoricoPagamentos(creditoId)` - Busca histórico de pagamentos
- `registrarPagamento(dados)` - Registra novo pagamento
- `editarPagamento(pagamentoId, dados)` - Edita pagamento existente
- `deletarPagamento(pagamentoId)` - Deleta pagamento
- `calcularResumo(valorTotal, pagamentos)` - Calcula resumo financeiro

**Estados:**
- `historicoPagamentos` - Lista de pagamentos
- `estados` - Estados de carregamento/erro
- `formasPagamento` - Opções de formas de pagamento

### 🗃️ **Estrutura do Banco de Dados**

#### Tabela: `credito_pagamentos`

```sql
CREATE TABLE credito_pagamentos (
  id UUID PRIMARY KEY,
  credito_id UUID REFERENCES cliente_creditos(id),
  valor_pago DECIMAL(10,2) NOT NULL,
  data_pagamento DATE NOT NULL,
  forma_pagamento VARCHAR(50) NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 🎨 **Interface na Página de Créditos**

#### Novos Botões na Tabela:
1. **💳 Registrar Pagamento** (verde) - Abre modal para novo pagamento
2. **📋 Histórico** (roxo) - Abre modal com histórico completo
3. **👁️ Ver Detalhes** (azul) - Detalhes do crédito (existente)
4. **🔗 Vincular** (azul) - Vincular a viagem (existente)
5. **✏️ Editar** (cinza) - Editar crédito (existente)
6. **🗑️ Deletar** (vermelho) - Deletar crédito (existente)

#### Nova Coluna: Status Pagamento
- Badge visual com status (Pago Completo, Pagamento Parcial, Não Pago)
- Valores pagos e restantes
- Barra de progresso mini

### 🚀 **Como Usar**

1. **Registrar Pagamento:**
   - Clique no botão verde "💳" na linha do crédito
   - Preencha valor, data, forma de pagamento
   - Clique em "Registrar"

2. **Ver Histórico:**
   - Clique no botão roxo "📋" na linha do crédito
   - Visualize todos os pagamentos
   - Edite ou delete pagamentos conforme necessário

3. **Editar Pagamento:**
   - No modal de histórico, clique no ícone de edição
   - Modifique os dados necessários
   - Salve as alterações

### 🔄 **Fluxo de Dados**

1. **Criação de Crédito** → Status inicial "Não Pago"
2. **Primeiro Pagamento** → Status muda para "Pagamento Parcial"
3. **Pagamento Completo** → Status muda para "Pago Completo"
4. **Edição/Exclusão** → Recalcula status automaticamente

### 🎯 **Benefícios**

- ✅ **Controle Financeiro Completo** - Acompanhe cada pagamento
- ✅ **Flexibilidade** - Pagamentos parciais e parcelados
- ✅ **Histórico Detalhado** - Nunca perca informações
- ✅ **Interface Intuitiva** - Fácil de usar e entender
- ✅ **Integração Perfeita** - Funciona com o sistema existente
- ✅ **Relatórios Visuais** - Status e progresso em tempo real

### 🔧 **Próximas Melhorias**

- [ ] Relatórios de pagamentos por período
- [ ] Notificações de pagamentos em atraso
- [ ] Integração com sistema de cobrança
- [ ] Exportação de histórico para Excel/PDF
- [ ] Dashboard de pagamentos pendentes