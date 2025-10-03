# Requirements Document - Templates de WhatsApp

## Introduction

Sistema completo para gerenciar templates de mensagens WhatsApp reutilizáveis, permitindo criar, editar e usar múltiplos templates personalizados nas viagens. O sistema deve manter o fluxo atual de envio por viagem/ônibus/passageiro, mas com templates pré-definidos e seleção múltipla.

## Requirements

### Requirement 1

**User Story:** Como administrador, eu quero gerenciar templates de WhatsApp centralizadamente, para que eu possa criar mensagens reutilizáveis com variáveis dinâmicas.

#### Acceptance Criteria

1. WHEN acesso a página de templates THEN o sistema SHALL exibir lista de todos os templates cadastrados
2. WHEN clico em "Novo Template" THEN o sistema SHALL abrir formulário para criar template
3. WHEN preencho nome, categoria e mensagem THEN o sistema SHALL salvar template no banco de dados
4. WHEN uso variáveis como {NOME}, {DESTINO} THEN o sistema SHALL reconhecer e listar as variáveis disponíveis
5. WHEN salvo template THEN o sistema SHALL validar se mensagem não está vazia
6. WHEN edito template existente THEN o sistema SHALL carregar dados atuais no formulário
7. WHEN excluo template THEN o sistema SHALL solicitar confirmação antes de deletar

### Requirement 2

**User Story:** Como usuário, eu quero selecionar múltiplos templates pré-definidos na viagem, para que eu possa enviar várias mensagens diferentes de uma vez.

#### Acceptance Criteria

1. WHEN acesso WhatsApp em massa na viagem THEN o sistema SHALL carregar todos os templates ativos
2. WHEN seleciono um template THEN o sistema SHALL preencher automaticamente as variáveis com dados da viagem
3. WHEN seleciono múltiplos templates THEN o sistema SHALL permitir seleção de vários checkboxes
4. WHEN templates são selecionados THEN o sistema SHALL mostrar preview de cada mensagem
5. WHEN variáveis são preenchidas THEN o sistema SHALL substituir {NOME}, {DESTINO}, {DATA}, etc. com dados reais
6. WHEN não seleciono nenhum template THEN o sistema SHALL permitir digitar mensagem manual (como hoje)

### Requirement 3

**User Story:** Como usuário, eu quero editar mensagens antes do envio, para que eu possa personalizar conteúdo específico como links de grupos.

#### Acceptance Criteria

1. WHEN template é aplicado THEN o sistema SHALL mostrar mensagem editável
2. WHEN edito mensagem THEN o sistema SHALL manter alterações até o envio
3. WHEN múltiplos templates são selecionados THEN o sistema SHALL permitir editar cada mensagem individualmente
4. WHEN confirmo envio THEN o sistema SHALL usar mensagem editada, não o template original
5. WHEN cancelo edição THEN o sistema SHALL voltar ao template original

### Requirement 4

**User Story:** Como usuário, eu quero enviar mensagens usando o fluxo atual, para que eu mantenha a funcionalidade de seleção por passageiro/ônibus.

#### Acceptance Criteria

1. WHEN seleciono passageiros THEN o sistema SHALL manter seleção atual
2. WHEN seleciono ônibus THEN o sistema SHALL manter filtros atuais
3. WHEN clico "Enviar" THEN o sistema SHALL usar mesmo processo de envio atual
4. WHEN envio múltiplas mensagens THEN o sistema SHALL enviar cada template selecionado para cada passageiro
5. WHEN há erro no envio THEN o sistema SHALL mostrar quais mensagens falharam

### Requirement 5

**User Story:** Como sistema, eu quero categorizar templates por tipo, para que usuários possam organizar e encontrar mensagens facilmente.

#### Acceptance Criteria

1. WHEN crio template THEN o sistema SHALL permitir selecionar categoria
2. WHEN listo templates THEN o sistema SHALL agrupar por categoria
3. WHEN filtro por categoria THEN o sistema SHALL mostrar apenas templates da categoria selecionada
4. WHEN categoria é "Confirmação" THEN o sistema SHALL sugerir variáveis relacionadas
5. WHEN categoria é "Grupo" THEN o sistema SHALL incluir variável {LINK_GRUPO}

### Requirement 6

**User Story:** Como usuário, eu quero preview em tempo real dos templates, para que eu possa ver como ficará a mensagem final antes do envio.

#### Acceptance Criteria

1. WHEN seleciono template THEN o sistema SHALL mostrar preview com dados simulados
2. WHEN edito mensagem THEN o sistema SHALL atualizar preview em tempo real
3. WHEN múltiplos templates são selecionados THEN o sistema SHALL mostrar preview de cada um
4. WHEN variáveis não podem ser preenchidas THEN o sistema SHALL mostrar placeholder
5. WHEN preview é exibido THEN o sistema SHALL destacar variáveis substituídas

### Requirement 7

**User Story:** Como administrador, eu quero definir variáveis disponíveis, para que templates possam usar dados dinâmicos das viagens.

#### Acceptance Criteria

1. WHEN crio template THEN o sistema SHALL detectar automaticamente variáveis usadas
2. WHEN uso {NOME} THEN o sistema SHALL substituir pelo nome do passageiro
3. WHEN uso {DESTINO} THEN o sistema SHALL substituir pelo destino da viagem
4. WHEN uso {DATA} THEN o sistema SHALL substituir pela data da viagem
5. WHEN uso {HORARIO} THEN o sistema SHALL substituir pelo horário de saída
6. WHEN uso {ONIBUS} THEN o sistema SHALL substituir pelo número/nome do ônibus
7. WHEN uso {LINK_GRUPO} THEN o sistema SHALL permitir edição manual por viagem
8. WHEN uso {VALOR} THEN o sistema SHALL substituir pelo valor da viagem
9. WHEN uso variável inexistente THEN o sistema SHALL manter texto original