# Requirements Document - Sistema de Créditos Pré-pagos

## Introduction

O Sistema de Créditos Pré-pagos é uma carteira digital interna que permite aos clientes depositar valores antecipadamente e usar esse saldo conforme o consumo. Funciona como um wallet interno onde o cliente mantém um saldo disponível para futuras compras, sem necessidade de vincular a viagens específicas. O sistema deve ser simples, focado em depósitos, uso de saldo e controle administrativo.

## Glossary

- **Sistema_Creditos**: O sistema de carteira digital interna
- **Cliente**: Usuário que possui conta no sistema
- **Deposito**: Entrada de valor na carteira do cliente
- **Saldo**: Valor disponível na carteira do cliente
- **Transacao**: Qualquer movimentação (entrada ou saída) na carteira
- **Dashboard_Admin**: Interface administrativa para controle geral

## Requirements

### Requirement 1

**User Story:** Como cliente, eu quero depositar um valor antecipado no meu saldo de créditos, para poder usar esse valor em futuras compras ou serviços sem precisar pagar cada vez.

#### Acceptance Criteria

1. WHEN o cliente acessa a seção "Créditos", THE Sistema_Creditos SHALL exibir o saldo atual disponível
2. WHEN o administrador registra um depósito, THE Sistema_Creditos SHALL somar o valor ao saldo do cliente
3. WHEN um depósito é registrado, THE Sistema_Creditos SHALL criar uma transação de "entrada" no histórico
4. THE Sistema_Creditos SHALL atualizar o saldo em tempo real após cada depósito
5. THE Sistema_Creditos SHALL registrar data, hora e forma de pagamento de cada depósito

### Requirement 2

**User Story:** Como cliente, eu quero usar meus créditos acumulados para pagar produtos ou serviços, para simplificar o processo de compra.

#### Acceptance Criteria

1. WHEN o cliente tem saldo positivo, THE Sistema_Creditos SHALL permitir usar créditos para pagamento
2. WHEN uma compra é realizada com créditos, THE Sistema_Creditos SHALL debitar o valor do saldo automaticamente
3. WHEN o saldo é insuficiente, THE Sistema_Creditos SHALL bloquear o uso e informar o valor faltante
4. WHEN créditos são utilizados, THE Sistema_Creditos SHALL registrar uma transação de "saída" no histórico
5. THE Sistema_Creditos SHALL notificar o cliente quando o saldo atingir valor baixo (menos de R$ 100)

### Requirement 3

**User Story:** Como administrador, eu quero visualizar todos os clientes com seus saldos e histórico, para monitorar depósitos, usos e prever consumo.

#### Acceptance Criteria

1. WHEN o administrador acessa o Dashboard_Admin, THE Sistema_Creditos SHALL exibir lista de todos os clientes com saldo atual
2. WHEN o administrador seleciona um cliente, THE Sistema_Creditos SHALL mostrar histórico completo de transações
3. THE Dashboard_Admin SHALL exibir métricas de total depositado, total consumido e saldo geral
4. THE Dashboard_Admin SHALL permitir filtrar por cliente, data e tipo de operação
5. THE Dashboard_Admin SHALL atualizar informações em tempo real

### Requirement 4

**User Story:** Como administrador, eu quero gerar relatórios mensais de créditos depositados e usados, para acompanhar o fluxo financeiro do sistema.

#### Acceptance Criteria

1. WHEN o administrador solicita relatório, THE Sistema_Creditos SHALL gerar resumo por período selecionado
2. THE Sistema_Creditos SHALL calcular total de depósitos, total de usos e saldo final do período
3. THE Sistema_Creditos SHALL permitir exportar relatórios em formato Excel/CSV
4. THE Sistema_Creditos SHALL incluir gráficos de evolução de saldos por mês
5. THE Sistema_Creditos SHALL gerar relatório em PDF com resumo executivo

### Requirement 5

**User Story:** Como administrador, eu quero ter controle de auditoria completo, para garantir transparência e rastreabilidade de todas as operações financeiras.

#### Acceptance Criteria

1. THE Sistema_Creditos SHALL registrar timestamp de todas as transações
2. THE Sistema_Creditos SHALL manter log de qual usuário realizou cada operação
3. THE Sistema_Creditos SHALL impedir alteração ou exclusão de transações já registradas
4. THE Sistema_Creditos SHALL manter backup automático de todas as movimentações
5. THE Sistema_Creditos SHALL permitir consulta de auditoria por período e cliente

### Requirement 6

**User Story:** Como administrador, eu quero ter interface responsiva e acessível, para gerenciar créditos tanto no desktop quanto no mobile.

#### Acceptance Criteria

1. THE Sistema_Creditos SHALL funcionar corretamente em dispositivos móveis
2. THE Sistema_Creditos SHALL ter botões grandes e contraste mínimo AA para acessibilidade
3. THE Sistema_Creditos SHALL carregar lista de até 1000 registros em menos de 3 segundos
4. THE Sistema_Creditos SHALL ter histórico rolável em interface mobile
5. THE Sistema_Creditos SHALL manter sessão ativa e sincronizar dados automaticamente