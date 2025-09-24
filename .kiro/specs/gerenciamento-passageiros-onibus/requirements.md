# Requirements Document

## Introduction

Esta funcionalidade permite o gerenciamento avançado de passageiros nos ônibus, incluindo a troca de passageiros entre diferentes ônibus e o agrupamento de passageiros para melhor organização. O sistema deve ser simples, objetivo e respeitar sempre a capacidade dos ônibus.

## Requirements

### Requirement 1

**User Story:** Como administrador, eu quero trocar passageiros entre ônibus diferentes através de um modal simples, para que eu possa reorganizar a distribuição conforme necessário.

#### Acceptance Criteria

1. WHEN o usuário clica no botão "Trocar Ônibus" na linha do passageiro THEN o sistema SHALL abrir um modal com dropdown dos ônibus disponíveis
2. WHEN o modal é exibido THEN o sistema SHALL mostrar a capacidade atual e disponível de cada ônibus no dropdown
3. WHEN o usuário tenta trocar um passageiro para um ônibus THEN o sistema SHALL verificar se há capacidade disponível
4. IF o ônibus de destino não tem capacidade THEN o sistema SHALL desabilitar a opção no dropdown e mostrar "Lotado"
5. WHEN a troca é realizada com sucesso THEN o sistema SHALL atualizar automaticamente as listas de passageiros de ambos os ônibus
6. WHEN a troca é realizada THEN o sistema SHALL manter todos os dados do passageiro (pagamentos, créditos, etc.)

### Requirement 2

**User Story:** Como administrador, eu quero agrupar passageiros com nomes personalizados, para que eu possa organizar famílias ou grupos que viajam juntos.

#### Acceptance Criteria

1. WHEN o usuário cadastra um passageiro THEN o sistema SHALL oferecer campo opcional "Nome do Grupo"
2. WHEN o usuário edita um passageiro THEN o sistema SHALL permitir criar novo grupo ou juntar-se a grupo existente
3. WHEN passageiros são agrupados THEN o sistema SHALL exibir badge colorido com o nome do grupo ao lado do nome do passageiro
4. WHEN o usuário visualiza a lista de passageiros no ônibus THEN o sistema SHALL agrupar visualmente os passageiros do mesmo grupo
5. WHEN há grupos na lista THEN o sistema SHALL exibir o nome do grupo como cabeçalho acima dos membros do grupo
6. WHEN o usuário seleciona mover um grupo THEN o sistema SHALL permitir mover todos os membros juntos para outro ônibus

### Requirement 3

**User Story:** Como administrador, eu quero remover passageiros de grupos existentes, para que eu possa reorganizar os agrupamentos conforme necessário.

#### Acceptance Criteria

1. WHEN o usuário edita um passageiro agrupado THEN o sistema SHALL oferecer opção de limpar o campo "Nome do Grupo"
2. WHEN um passageiro é removido do grupo THEN o sistema SHALL atualizar a exibição visual imediatamente
3. WHEN um grupo fica com apenas um passageiro THEN o sistema SHALL manter o grupo (não desfazer automaticamente)
4. WHEN o usuário remove um passageiro do grupo THEN o sistema SHALL manter todos os outros dados do passageiro
5. WHEN não há mais passageiros em um grupo THEN o sistema SHALL remover automaticamente o agrupamento visual

### Requirement 4

**User Story:** Como administrador, eu quero uma interface simples e intuitiva para essas operações, para que eu possa gerenciar rapidamente sem complexidade.

#### Acceptance Criteria

1. WHEN o usuário acessa a lista de passageiros THEN o sistema SHALL exibir botão "Trocar Ônibus" na coluna de ações
2. WHEN há grupos na lista de passageiros do ônibus THEN o sistema SHALL exibir os grupos agrupados visualmente com cabeçalho do nome do grupo
3. WHEN o usuário realiza uma operação THEN o sistema SHALL fornecer feedback visual imediato
4. WHEN há erro em uma operação THEN o sistema SHALL exibir mensagem clara e específica
5. WHEN o usuário cancela uma operação THEN o sistema SHALL retornar ao estado anterior sem alterações
6. WHEN o sistema exibe grupos THEN o sistema SHALL usar cores distintas para cada grupo e badge colorido com nome do grupo

### Requirement 5

**User Story:** Como administrador, eu quero que a lista de passageiros no ônibus seja organizada por grupos primeiro, para que eu possa visualizar facilmente as famílias e grupos.

#### Acceptance Criteria

1. WHEN há passageiros agrupados em um ônibus THEN o sistema SHALL exibir os grupos primeiro, antes dos passageiros individuais
2. WHEN exibe um grupo THEN o sistema SHALL mostrar o nome do grupo como cabeçalho seguido pelos membros do grupo
3. WHEN há passageiros sem grupo THEN o sistema SHALL exibi-los após todos os grupos, em ordem alfabética
4. WHEN um grupo tem múltiplos membros THEN o sistema SHALL manter os membros do grupo juntos visualmente
5. WHEN o usuário visualiza a lista THEN o sistema SHALL usar cores consistentes para identificar cada grupo