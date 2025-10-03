# Requirements Document

## Introduction

Este documento define os requisitos para implementar um sistema de abas na página de Ingressos, seguindo o mesmo padrão visual e funcional já existente na página de Viagens. O objetivo é organizar melhor a visualização dos jogos, separando jogos futuros de jogos passados, com funcionalidades de busca, filtros e diferentes modos de visualização.

## Requirements

### Requirement 1

**User Story:** Como usuário do sistema, eu quero visualizar os jogos de ingressos organizados em abas, para que eu possa navegar facilmente entre jogos futuros e passados.

#### Acceptance Criteria

1. WHEN o usuário acessa a página de Ingressos THEN o sistema SHALL exibir um componente de abas com duas opções: "Jogos Futuros" e "Jogos Passados"
2. WHEN o usuário clica em uma aba THEN o sistema SHALL alternar o conteúdo exibido mantendo o estado da aba selecionada
3. WHEN a página carrega THEN o sistema SHALL exibir por padrão a aba "Jogos Futuros"

### Requirement 2

**User Story:** Como usuário, eu quero ver os jogos futuros na primeira aba, para que eu possa gerenciar ingressos de jogos que ainda vão acontecer.

#### Acceptance Criteria

1. WHEN o usuário está na aba "Jogos Futuros" THEN o sistema SHALL exibir apenas jogos com data igual ou posterior à data atual
2. WHEN não há jogos futuros THEN o sistema SHALL exibir uma mensagem informativa com opções para criar nova viagem ou novo ingresso
3. WHEN há jogos futuros THEN o sistema SHALL exibir os cards de resumo financeiro no topo da aba
4. WHEN há jogos futuros THEN o sistema SHALL exibir os jogos ordenados por data crescente (próximos primeiro)

### Requirement 3

**User Story:** Como usuário, eu quero ver os jogos passados na segunda aba, para que eu possa consultar histórico e relatórios de jogos já realizados.

#### Acceptance Criteria

1. WHEN o usuário está na aba "Jogos Passados" THEN o sistema SHALL exibir apenas jogos com data anterior à data atual
2. WHEN há jogos passados THEN o sistema SHALL agrupar os jogos por mês e ano
3. WHEN há jogos passados THEN o sistema SHALL exibir os jogos ordenados por data decrescente (mais recentes primeiro)
4. WHEN há jogos passados THEN o sistema SHALL exibir um filtro de período com opções: "Todos", "Mês atual", "Mês anterior", "Últimos 3 meses", "Últimos 6 meses", "Ano atual", "Ano anterior"

### Requirement 4

**User Story:** Como usuário, eu quero buscar jogos em ambas as abas, para que eu possa encontrar rapidamente jogos específicos.

#### Acceptance Criteria

1. WHEN o usuário digita no campo de busca THEN o sistema SHALL filtrar os jogos em tempo real baseado no adversário, local do jogo e data
2. WHEN há busca ativa THEN o sistema SHALL manter a funcionalidade de busca independente da aba selecionada
3. WHEN o campo de busca está vazio THEN o sistema SHALL exibir todos os jogos da aba atual respeitando os filtros de período

### Requirement 5

**User Story:** Como usuário, eu quero alternar entre visualização em grid e tabela, para que eu possa escolher o formato mais adequado para minha necessidade.

#### Acceptance Criteria

1. WHEN o usuário clica no botão de visualização THEN o sistema SHALL alternar entre modo grid (cards) e modo tabela
2. WHEN está no modo tabela THEN o sistema SHALL exibir os jogos em formato de tabela com colunas: Data, Adversário, Local, Total Ingressos, Receita, Status
3. WHEN está no modo grid THEN o sistema SHALL exibir os jogos usando os cards CleanJogoCard existentes
4. WHEN o usuário alterna entre abas THEN o sistema SHALL manter o modo de visualização selecionado

### Requirement 6

**User Story:** Como usuário, eu quero que os jogos passados sejam agrupados por mês, para que eu possa navegar facilmente pelo histórico.

#### Acceptance Criteria

1. WHEN há jogos passados e não há busca ativa THEN o sistema SHALL agrupar os jogos por mês e ano
2. WHEN há agrupamento por mês THEN o sistema SHALL exibir um cabeçalho para cada grupo com o formato "Mês Ano (X jogos)"
3. WHEN há busca ativa THEN o sistema SHALL desabilitar o agrupamento e exibir resultados em lista simples
4. WHEN há filtro de período ativo THEN o sistema SHALL aplicar o filtro antes do agrupamento

### Requirement 7

**User Story:** Como usuário, eu quero que a interface mantenha consistência com a página de Viagens, para que eu tenha uma experiência familiar no sistema.

#### Acceptance Criteria

1. WHEN o sistema exibe as abas THEN o sistema SHALL usar os mesmos componentes visuais da página de Viagens (TabsList, TabsTrigger, TabsContent)
2. WHEN o sistema exibe filtros e busca THEN o sistema SHALL usar o mesmo layout e estilo da página de Viagens
3. WHEN o sistema exibe botões de visualização THEN o sistema SHALL usar os mesmos ícones e estilos da página de Viagens
4. WHEN há estados de loading ou vazio THEN o sistema SHALL usar as mesmas mensagens e estilos da página de Viagens