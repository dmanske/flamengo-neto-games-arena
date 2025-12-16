# Requirements Document

## Introduction

Este documento especifica os requisitos para implementar a funcionalidade de agrupamento de ingressos, replicando o sistema de agrupamento de passageiros já existente em detalhes de viagem. O objetivo é permitir que ingressos de um mesmo jogo possam ser organizados em grupos visuais (ex: família, amigos), facilitando a gestão e visualização.

## Glossary

- **Sistema de Ingressos**: Módulo responsável pelo gerenciamento de ingressos de jogos
- **Grupo de Ingressos**: Conjunto de ingressos agrupados visualmente por nome e cor
- **IngressosCard**: Componente principal que exibe a lista de ingressos de um jogo
- **Viagem Ingressos**: Entidade que representa um jogo/evento com ingressos associados

## Requirements

### Requirement 1

**User Story:** Como administrador, quero agrupar ingressos de um mesmo jogo por grupos visuais, para facilitar a organização de famílias ou grupos de amigos.

#### Acceptance Criteria

1. WHEN o administrador visualiza a lista de ingressos THEN o Sistema de Ingressos SHALL exibir os ingressos organizados por grupos, com grupos primeiro e ingressos individuais depois
2. WHEN um ingresso possui grupo_nome e grupo_cor definidos THEN o Sistema de Ingressos SHALL exibir o ingresso dentro de um card visual com a cor do grupo
3. WHEN um ingresso não possui grupo definido THEN o Sistema de Ingressos SHALL exibir o ingresso na seção "Ingressos Individuais"
4. WHEN múltiplos ingressos pertencem ao mesmo grupo THEN o Sistema de Ingressos SHALL exibir todos dentro do mesmo card de grupo com contagem de membros

### Requirement 2

**User Story:** Como administrador, quero adicionar ou remover ingressos de grupos, para organizar os clientes conforme necessário.

#### Acceptance Criteria

1. WHEN o administrador edita um ingresso THEN o Sistema de Ingressos SHALL permitir selecionar um grupo existente ou criar um novo grupo
2. WHEN o administrador cria um novo grupo THEN o Sistema de Ingressos SHALL solicitar nome do grupo e cor (de uma paleta predefinida)
3. WHEN o administrador remove um ingresso de um grupo THEN o Sistema de Ingressos SHALL mover o ingresso para a seção de ingressos individuais
4. WHEN um grupo fica sem membros THEN o Sistema de Ingressos SHALL remover automaticamente o grupo da visualização

### Requirement 3

**User Story:** Como administrador, quero que os grupos tenham cores distintas, para facilitar a identificação visual rápida.

#### Acceptance Criteria

1. WHEN um grupo é criado THEN o Sistema de Ingressos SHALL atribuir uma cor da paleta predefinida de 10 cores
2. WHEN o administrador visualiza grupos THEN o Sistema de Ingressos SHALL exibir cada grupo com borda, fundo e indicador visual na cor definida
3. WHEN todas as cores da paleta estão em uso THEN o Sistema de Ingressos SHALL permitir reutilização de cores com aviso ao usuário

### Requirement 4

**User Story:** Como administrador, quero que a ordenação dos ingressos respeite os grupos, para manter a organização visual consistente.

#### Acceptance Criteria

1. WHEN a lista de ingressos é exibida THEN o Sistema de Ingressos SHALL ordenar primeiro por nome do grupo (alfabeticamente), depois por nome do cliente dentro de cada grupo
2. WHEN ingressos individuais são exibidos THEN o Sistema de Ingressos SHALL ordenar alfabeticamente por nome do cliente
3. WHEN a busca ou filtros são aplicados THEN o Sistema de Ingressos SHALL manter a estrutura de agrupamento nos resultados filtrados
