# Requirements Document - Sistema de Ingressos

## Introduction

O Sistema de Ingressos é uma funcionalidade administrativa para controlar vendas de ingressos separados das viagens completas. Destina-se a clientes que compram apenas o ingresso para jogos do Flamengo e vão por conta própria ao estádio, sem utilizar o transporte e hospedagem oferecidos nas viagens organizadas.

## Requirements

### Requirement 1

**User Story:** Como administrador, eu quero cadastrar vendas de ingressos para clientes que não participam das viagens, para que eu possa controlar essas vendas separadamente.

#### Acceptance Criteria

1. WHEN o administrador acessa a seção de ingressos THEN o sistema SHALL exibir uma lista de ingressos cadastrados
2. WHEN o administrador clica em "Novo Ingresso" THEN o sistema SHALL abrir um formulário de cadastro
3. WHEN o administrador seleciona um cliente THEN o sistema SHALL carregar os dados do cliente já cadastrado
4. WHEN o administrador seleciona um jogo existente THEN o sistema SHALL vincular o ingresso à viagem correspondente
5. IF o jogo não existir THEN o sistema SHALL permitir cadastrar um novo jogo

### Requirement 2

**User Story:** Como administrador, eu quero definir setores e valores dos ingressos, para que eu possa precificar adequadamente cada venda.

#### Acceptance Criteria

1. WHEN o jogo é no Maracanã THEN o sistema SHALL exibir uma lista pré-definida de setores
2. WHEN o jogo é fora de casa THEN o sistema SHALL permitir inserção manual do setor
3. WHEN o administrador define o preço THEN o sistema SHALL permitir inserir preço de custo e preço de venda
4. WHEN os preços são definidos THEN o sistema SHALL calcular automaticamente o lucro
5. WHEN há desconto THEN o sistema SHALL recalcular o valor final e o lucro

### Requirement 3

**User Story:** Como administrador, eu quero controlar a situação financeira dos ingressos, para que eu possa acompanhar pagamentos e inadimplência.

#### Acceptance Criteria

1. WHEN o ingresso é cadastrado THEN o sistema SHALL definir status como "Pendente"
2. WHEN o pagamento é registrado THEN o sistema SHALL atualizar o status para "Pago"
3. WHEN necessário THEN o sistema SHALL permitir cancelar o ingresso
4. WHEN há histórico de pagamentos THEN o sistema SHALL exibir todas as transações
5. WHEN o administrador visualiza o ingresso THEN o sistema SHALL mostrar situação financeira atual

### Requirement 4

**User Story:** Como administrador, eu quero visualizar informações detalhadas de cada ingresso, para que eu possa gerenciar adequadamente as vendas.

#### Acceptance Criteria

1. WHEN o administrador clica em um ingresso THEN o sistema SHALL abrir modal com detalhes completos
2. WHEN o modal é exibido THEN o sistema SHALL mostrar setor do estádio, valores, desconto e observações
3. WHEN há histórico financeiro THEN o sistema SHALL exibir todos os pagamentos realizados
4. WHEN há observações THEN o sistema SHALL permitir visualizar e editar as informações
5. WHEN necessário THEN o sistema SHALL permitir imprimir ou exportar os dados do ingresso

### Requirement 5

**User Story:** Como administrador, eu quero ter controle financeiro detalhado dos ingressos, para que eu possa analisar a rentabilidade das vendas.

#### Acceptance Criteria

1. WHEN o ingresso é cadastrado THEN o sistema SHALL registrar preço de custo e preço de venda
2. WHEN os valores são inseridos THEN o sistema SHALL calcular automaticamente o lucro bruto
3. WHEN há desconto THEN o sistema SHALL calcular o lucro líquido após desconto
4. WHEN necessário THEN o sistema SHALL exibir a margem de lucro percentual
5. WHEN o administrador consulta relatórios THEN o sistema SHALL mostrar análise de rentabilidade por jogo/setor