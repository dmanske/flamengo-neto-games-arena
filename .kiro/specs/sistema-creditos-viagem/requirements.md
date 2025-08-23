# Requirements Document - Sistema de Créditos de Viagem

## Introduction

O Sistema de Créditos de Viagem permite que clientes façam pagamentos antecipados sem ter uma viagem específica definida. Esses pagamentos ficam como "créditos" na conta do cliente, que posteriormente podem ser utilizados para pagar viagens quando disponíveis. O sistema deve gerenciar sobras e faltas de crédito, além de organizar os dados por mês para melhor controle administrativo.

## Requirements

### Requirement 1

**User Story:** Como administrador, eu quero registrar pagamentos antecipados de clientes sem viagem definida, para que eles possam acumular créditos para uso futuro.

#### Acceptance Criteria

1. WHEN o administrador acessa a seção de créditos THEN o sistema SHALL exibir uma lista de créditos organizados por mês
2. WHEN o administrador clica em "Novo Crédito" THEN o sistema SHALL abrir um formulário de cadastro
3. WHEN o administrador seleciona um cliente THEN o sistema SHALL carregar os dados do cliente já cadastrado
4. WHEN o pagamento é registrado THEN o sistema SHALL criar um crédito disponível para o cliente
5. WHEN há múltiplos pagamentos THEN o sistema SHALL somar os créditos do mesmo cliente

### Requirement 2

**User Story:** Como administrador, eu quero vincular créditos de clientes a viagens disponíveis, para que eles possam utilizar seus pagamentos antecipados.

#### Acceptance Criteria

1. WHEN o administrador acessa a vinculação THEN o sistema SHALL exibir lista de viagens disponíveis
2. WHEN uma viagem é selecionada THEN o sistema SHALL mostrar o valor padrão da viagem
3. WHEN o cliente tem créditos THEN o sistema SHALL calcular automaticamente a diferença
4. WHEN o crédito é maior que o valor THEN o sistema SHALL mostrar o valor que sobrará
5. WHEN o crédito é menor que o valor THEN o sistema SHALL mostrar o valor que falta pagar

### Requirement 3

**User Story:** Como administrador, eu quero gerenciar sobras e faltas de crédito, para que eu possa informar corretamente os clientes sobre valores pendentes ou disponíveis.

#### Acceptance Criteria

1. WHEN há sobra de crédito THEN o sistema SHALL manter o saldo disponível para próximas viagens
2. WHEN há falta de crédito THEN o sistema SHALL calcular exatamente quanto o cliente deve pagar
3. WHEN o crédito é exato THEN o sistema SHALL marcar como "Pago Completo"
4. WHEN necessário THEN o sistema SHALL permitir reembolso de créditos não utilizados
5. WHEN há alterações THEN o sistema SHALL manter histórico completo de movimentações

### Requirement 4

**User Story:** Como administrador, eu quero visualizar relatórios de créditos organizados por mês, para que eu possa acompanhar o fluxo de pagamentos antecipados.

#### Acceptance Criteria

1. WHEN o administrador acessa relatórios THEN o sistema SHALL organizar créditos por mês/ano
2. WHEN um mês é selecionado THEN o sistema SHALL exibir todos os clientes com créditos do período
3. WHEN há créditos utilizados THEN o sistema SHALL mostrar histórico de vinculações
4. WHEN há créditos pendentes THEN o sistema SHALL destacar valores não utilizados
5. WHEN necessário THEN o sistema SHALL permitir exportar relatórios por período

### Requirement 5

**User Story:** Como administrador, eu quero ter controle financeiro detalhado dos créditos, para que eu possa analisar o impacto dos pagamentos antecipados no fluxo de caixa.

#### Acceptance Criteria

1. WHEN créditos são registrados THEN o sistema SHALL contabilizar como receita antecipada
2. WHEN créditos são utilizados THEN o sistema SHALL transferir para receita da viagem específica
3. WHEN há sobras THEN o sistema SHALL manter como passivo (valor devido ao cliente)
4. WHEN há reembolsos THEN o sistema SHALL registrar como saída de caixa
5. WHEN necessário THEN o sistema SHALL gerar relatórios de impacto no fluxo de caixa

### Requirement 6

**User Story:** Como administrador, eu quero definir manualmente os tipos de crédito, para que eu possa categorizar diferentes formas de pagamento antecipado.

#### Acceptance Criteria

1. WHEN o crédito é registrado THEN o sistema SHALL permitir definir tipo (viagem completa, passeios, geral)
2. WHEN o tipo é "viagem completa" THEN o sistema SHALL aplicar apenas ao valor base da viagem
3. WHEN o tipo é "passeios" THEN o sistema SHALL aplicar apenas aos valores de passeios
4. WHEN o tipo é "geral" THEN o sistema SHALL permitir usar para qualquer componente da viagem
5. WHEN há restrições THEN o sistema SHALL validar compatibilidade entre tipo de crédito e uso