# Requirements Document

## Introduction

Este documento define os requisitos para criar uma página dedicada "Detalhes do Jogo de Ingressos" que será acessada ao clicar no botão "Ver" nos cards de jogos. A página deve seguir o mesmo padrão visual da página DetalhesViagem, mas adaptada para o contexto de ingressos, com 2 abas principais e funcionalidades específicas para gerenciamento de ingressos.

## Requirements

### Requirement 1

**User Story:** Como usuário, eu quero acessar uma página dedicada para detalhes de um jogo específico, para que eu possa gerenciar todos os ingressos desse jogo em uma interface completa.

#### Acceptance Criteria

1. WHEN o usuário clica no botão "Ver" em um card de jogo THEN o sistema SHALL navegar para uma página dedicada de detalhes do jogo
2. WHEN a página carrega THEN o sistema SHALL exibir informações completas do jogo (adversário, data, local, logos)
3. WHEN a página carrega THEN o sistema SHALL exibir cards de resumo financeiro específicos do jogo
4. WHEN o jogo não existe ou há erro THEN o sistema SHALL redirecionar para a página de ingressos

### Requirement 2

**User Story:** Como usuário, eu quero ver um header visual com logos dos times e informações do jogo, para que eu tenha contexto claro sobre qual jogo estou gerenciando.

#### Acceptance Criteria

1. WHEN a página carrega THEN o sistema SHALL exibir logos do Flamengo e do adversário
2. WHEN a página carrega THEN o sistema SHALL exibir o nome dos times no formato "Flamengo × Adversário"
3. WHEN a página carrega THEN o sistema SHALL exibir data, hora e local do jogo formatados
4. WHEN a página carrega THEN o sistema SHALL exibir botões de ação (Voltar, Exportar PDF)

### Requirement 3

**User Story:** Como usuário, eu quero ver cards de resumo financeiro do jogo, para que eu tenha uma visão geral rápida dos números importantes.

#### Acceptance Criteria

1. WHEN a página carrega THEN o sistema SHALL exibir card com total de ingressos (pagos e pendentes)
2. WHEN a página carrega THEN o sistema SHALL exibir card com receita total do jogo
3. WHEN a página carrega THEN o sistema SHALL exibir card com lucro total do jogo
4. WHEN a página carrega THEN o sistema SHALL exibir card com quantidade de pendências

### Requirement 4

**User Story:** Como usuário, eu quero navegar entre abas de "Ingressos" e "Financeiro", para que eu possa organizar as informações por contexto.

#### Acceptance Criteria

1. WHEN a página carrega THEN o sistema SHALL exibir 2 abas: "Ingressos" e "Financeiro"
2. WHEN o usuário clica em uma aba THEN o sistema SHALL alternar o conteúdo mantendo o estado
3. WHEN a página carrega THEN o sistema SHALL exibir por padrão a aba "Ingressos"
4. WHEN o usuário alterna entre abas THEN o sistema SHALL manter filtros e busca ativos

### Requirement 5

**User Story:** Como usuário, eu quero ver uma lista detalhada de todos os ingressos do jogo na aba "Ingressos", para que eu possa gerenciar cada ingresso individualmente.

#### Acceptance Criteria

1. WHEN o usuário está na aba "Ingressos" THEN o sistema SHALL exibir tabela com todos os ingressos do jogo
2. WHEN há ingressos THEN o sistema SHALL exibir colunas: Cliente, Setor, Valor, Status, Ações
3. WHEN não há ingressos THEN o sistema SHALL exibir mensagem informativa com opção de criar novo
4. WHEN há ingressos THEN o sistema SHALL exibir contador total na tabela

### Requirement 6

**User Story:** Como usuário, eu quero buscar e filtrar ingressos de forma inteligente, para que eu possa encontrar rapidamente ingressos específicos.

#### Acceptance Criteria

1. WHEN o usuário digita na busca THEN o sistema SHALL filtrar por nome do cliente, CPF, telefone, setor
2. WHEN o usuário seleciona filtro de status THEN o sistema SHALL filtrar por situação financeira
3. WHEN há busca ou filtro ativo THEN o sistema SHALL atualizar contador de resultados
4. WHEN o campo de busca está vazio THEN o sistema SHALL exibir todos os ingressos do jogo

### Requirement 7

**User Story:** Como usuário, eu quero executar ações em cada ingresso (ver, editar, deletar), para que eu possa gerenciar os ingressos individualmente.

#### Acceptance Criteria

1. WHEN o usuário clica em "Ver" THEN o sistema SHALL abrir modal de detalhes do ingresso
2. WHEN o usuário clica em "Editar" THEN o sistema SHALL abrir modal de edição do ingresso
3. WHEN o usuário clica em "Deletar" THEN o sistema SHALL abrir confirmação de exclusão
4. WHEN uma ação é executada com sucesso THEN o sistema SHALL atualizar a lista automaticamente

### Requirement 8

**User Story:** Como usuário, eu quero ver informações financeiras detalhadas na aba "Financeiro" com sistema de sub-abas, para que eu possa analisar a performance financeira completa do jogo.

#### Acceptance Criteria

1. WHEN o usuário está na aba "Financeiro" THEN o sistema SHALL exibir 6 sub-abas: Resumo, Receitas, Despesas, Lista de Clientes, Pendências, Gráficos
2. WHEN há dados financeiros THEN o sistema SHALL calcular e exibir margem de lucro por setor
3. WHEN há dados financeiros THEN o sistema SHALL separar valores recebidos de pendentes
4. WHEN há dados financeiros THEN o sistema SHALL exibir análise de performance por setor do estádio

### Requirement 11

**User Story:** Como usuário, eu quero ver um resumo financeiro completo na sub-aba "Resumo", para que eu tenha uma visão geral dos números do jogo.

#### Acceptance Criteria

1. WHEN o usuário está na sub-aba "Resumo" THEN o sistema SHALL exibir cards principais: Receita Total, Custo Total, Lucro Líquido, Pendências
2. WHEN há ingressos THEN o sistema SHALL exibir cards secundários: Ticket Médio, Margem de Lucro, Taxa de Conversão
3. WHEN há ingressos THEN o sistema SHALL exibir resumo por setor com vendas e lucro
4. WHEN há ingressos THEN o sistema SHALL exibir indicadores visuais de progresso

### Requirement 12

**User Story:** Como usuário, eu quero gerenciar receitas automáticas e manuais na sub-aba "Receitas", para que eu possa controlar todas as entradas financeiras do jogo.

#### Acceptance Criteria

1. WHEN o usuário está na sub-aba "Receitas" THEN o sistema SHALL exibir receitas automáticas dos ingressos vendidos
2. WHEN o usuário clica em "Nova Receita" THEN o sistema SHALL abrir formulário para receitas manuais (patrocínios, extras)
3. WHEN há receitas THEN o sistema SHALL exibir detalhamento por cliente com valores individuais
4. WHEN há receitas THEN o sistema SHALL exibir totalizadores separados por tipo

### Requirement 13

**User Story:** Como usuário, eu quero gerenciar despesas e custos na sub-aba "Despesas", para que eu possa controlar todos os gastos relacionados ao jogo.

#### Acceptance Criteria

1. WHEN o usuário está na sub-aba "Despesas" THEN o sistema SHALL exibir custos dos ingressos (preço compra vs venda)
2. WHEN o usuário clica em "Nova Despesa" THEN o sistema SHALL abrir formulário para despesas operacionais
3. WHEN há despesas THEN o sistema SHALL calcular e exibir análise de margem por ingresso
4. WHEN há despesas THEN o sistema SHALL categorizar despesas fixas vs variáveis

### Requirement 14

**User Story:** Como usuário, eu quero ver lista completa de clientes na sub-aba "Lista de Clientes", para que eu possa acompanhar o status individual de cada cliente.

#### Acceptance Criteria

1. WHEN o usuário está na sub-aba "Lista de Clientes" THEN o sistema SHALL exibir tabela com todos os clientes do jogo
2. WHEN há clientes THEN o sistema SHALL exibir status financeiro: Pago, Pendente, Cancelado
3. WHEN há clientes THEN o sistema SHALL exibir valores detalhados: preço pago, desconto, lucro individual
4. WHEN o usuário clica em ações THEN o sistema SHALL permitir marcar como pago ou enviar cobrança

### Requirement 15

**User Story:** Como usuário, eu quero gerenciar pendências na sub-aba "Pendências", para que eu possa fazer cobrança eficiente dos clientes em atraso.

#### Acceptance Criteria

1. WHEN o usuário está na sub-aba "Pendências" THEN o sistema SHALL exibir dashboard com clientes pendentes
2. WHEN há pendências THEN o sistema SHALL fornecer ferramentas de cobrança (WhatsApp, email, telefone)
3. WHEN há tentativas de cobrança THEN o sistema SHALL manter histórico de cobranças enviadas
4. WHEN há múltiplas pendências THEN o sistema SHALL priorizar por valor e prazo

### Requirement 16

**User Story:** Como usuário, eu quero ver gráficos e analytics na sub-aba "Gráficos", para que eu possa analisar performance e tomar decisões estratégicas.

#### Acceptance Criteria

1. WHEN o usuário está na sub-aba "Gráficos" THEN o sistema SHALL exibir performance por setor do estádio
2. WHEN há dados históricos THEN o sistema SHALL exibir análise temporal de vendas
3. WHEN há outros jogos THEN o sistema SHALL exibir comparativo com média de outros jogos
4. WHEN há dados de setores THEN o sistema SHALL calcular e exibir ROI por setor

### Requirement 9

**User Story:** Como usuário, eu quero exportar relatório PDF do jogo, para que eu possa ter documentação física dos ingressos.

#### Acceptance Criteria

1. WHEN o usuário clica em "Exportar PDF" THEN o sistema SHALL gerar relatório com todos os ingressos do jogo
2. WHEN não há ingressos THEN o sistema SHALL exibir mensagem de aviso
3. WHEN há ingressos THEN o sistema SHALL incluir informações do jogo e lista completa de clientes
4. WHEN o PDF é gerado THEN o sistema SHALL usar mesmo formato dos outros relatórios do sistema

### Requirement 10

**User Story:** Como usuário, eu quero que a interface seja consistente com a página DetalhesViagem, para que eu tenha uma experiência familiar no sistema.

#### Acceptance Criteria

1. WHEN a página carrega THEN o sistema SHALL usar mesmos componentes visuais da DetalhesViagem
2. WHEN a página carrega THEN o sistema SHALL usar mesmo layout de header e cards
3. WHEN a página carrega THEN o sistema SHALL usar mesma formatação de data, hora e valores
4. WHEN a página carrega THEN o sistema SHALL usar mesmos estilos de abas e tabelas