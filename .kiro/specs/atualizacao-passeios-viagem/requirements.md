# Requirements Document

## Introduction

Esta funcionalidade visa implementar um sistema completo de gerenciamento de passeios com valores, substituindo a lista atual por uma estrutura organizada que inclui preços específicos para cada passeio. O sistema permitirá categorizar passeios em "Pagos à Parte" e "Gratuitos", armazenar valores individuais, e calcular automaticamente custos adicionais das viagens. A implementação inclui mudanças no frontend, criação de novas tabelas no Supabase, e migração de dados existentes.

## Requirements

### Requirement 1

**User Story:** Como um administrador do sistema, eu quero criar um sistema de passeios com valores específicos, para que eu possa gerenciar preços e calcular custos adicionais automaticamente.

#### Acceptance Criteria

1. WHEN o sistema é implementado THEN SHALL existir uma tabela de passeios no Supabase com nome, valor e categoria
2. WHEN o usuário acessa o formulário de cadastro de viagem THEN o sistema SHALL exibir passeios organizados em "Passeios Pagos à Parte" e "Passeios Gratuitos" com valores visíveis
3. WHEN o usuário visualiza passeios pagos THEN o sistema SHALL exibir: Cristo Redentor, Pão de Açúcar, Museu do Flamengo, Aquário, Roda-Gigante, Museu do Amanhã, Tour do Maracanã, Rocinha, Vidigal, Tour da Gávea, Parque Lage, Museu do Mar com seus respectivos valores
4. WHEN o usuário visualiza passeios gratuitos THEN o sistema SHALL exibir: Lapa, Escadaria Selarón, Igreja Catedral Metropolitana, Teatro Municipal, Copacabana, Ipanema, Leblon, Barra da Tijuca, Museu do Amanhã, Boulevard Olímpico, Cidade do Samba, Pedra do Sal marcados como inclusos

### Requirement 2

**User Story:** Como um administrador do sistema, eu quero que a interface exiba claramente os valores dos passeios pagos, para que eu possa informar corretamente os clientes sobre os custos adicionais.

#### Acceptance Criteria

1. WHEN o usuário visualiza passeios pagos THEN o sistema SHALL exibir o valor de cada passeio formatado em reais (R$ XX,XX)
2. WHEN o usuário seleciona passeios pagos THEN o sistema SHALL calcular e exibir o total dos custos adicionais
3. WHEN o usuário seleciona passeios gratuitos THEN o sistema SHALL indicar visualmente que estão inclusos sem custo adicional
4. WHEN o usuário salva a viagem THEN o sistema SHALL armazenar os passeios selecionados com seus valores no momento da criação

### Requirement 3

**User Story:** Como um desenvolvedor do sistema, eu quero criar uma estrutura de banco de dados robusta para gerenciar passeios com valores, para que o sistema seja escalável e mantenha histórico de preços.

#### Acceptance Criteria

1. WHEN a migração é executada THEN o sistema SHALL criar tabela `passeios` com campos: id, nome, valor, categoria, ativo, created_at, updated_at
2. WHEN a migração é executada THEN o sistema SHALL criar tabela `viagem_passeios` para relacionar viagens com passeios e valores históricos
3. WHEN dados antigos existem THEN o sistema SHALL migrar passeios existentes mantendo compatibilidade
4. WHEN consultas são feitas THEN o sistema SHALL retornar passeios com valores atualizados e histórico preservado

### Requirement 4

**User Story:** Como um usuário do sistema, eu quero uma interface intuitiva que mostre valores e calcule totais automaticamente, para que eu possa tomar decisões informadas sobre os passeios da viagem.

#### Acceptance Criteria

1. WHEN o usuário visualiza passeios THEN o sistema SHALL apresentar interface organizada com valores claramente visíveis
2. WHEN o usuário seleciona/deseleciona passeios pagos THEN o sistema SHALL atualizar automaticamente o total de custos adicionais
3. WHEN o usuário edita uma viagem existente THEN o sistema SHALL carregar passeios com valores históricos preservados
4. WHEN o usuário salva uma viagem THEN o sistema SHALL persistir relacionamentos viagem-passeios com valores no momento da seleção

### Requirement 6

**User Story:** Como um usuário do sistema, eu quero visualizar os passeios de cada passageiro na lista de forma compacta, para que eu possa rapidamente identificar quem selecionou quais passeios.

#### Acceptance Criteria

1. WHEN o usuário visualiza a lista de passageiros THEN o sistema SHALL exibir os passeios na coluna "Passeios" em formato compacto
2. WHEN um passageiro tem passeios selecionados THEN o sistema SHALL mostrar "🗺️ Nome1, Nome2 (+X)" onde X é o número total
3. WHEN um passageiro não tem passeios THEN o sistema SHALL mostrar "🗺️ Nenhum"
4. WHEN há mais de 2 passeios THEN o sistema SHALL truncar e mostrar "Nome1, Nome2... (+X)"

### Requirement 7

**User Story:** Como um administrador do sistema, eu quero manter compatibilidade total com viagens existentes, para que eu não precise migrar dados antigos obrigatoriamente.

#### Acceptance Criteria

1. WHEN uma viagem antiga é visualizada THEN o sistema SHALL continuar funcionando com a estrutura atual
2. WHEN uma viagem nova é criada THEN o sistema SHALL usar automaticamente a nova estrutura com valores
3. WHEN o usuário edita uma viagem antiga THEN o sistema SHALL manter a estrutura original funcionando
4. WHEN o usuário quiser migrar uma viagem THEN o sistema SHALL permitir recriação manual opcional

### Requirement 5

**User Story:** Como um administrador do sistema, eu quero poder gerenciar os valores dos passeios de forma centralizada, para que eu possa atualizar preços sem alterar código.

#### Acceptance Criteria

1. WHEN passeios são cadastrados THEN o sistema SHALL permitir definir e alterar valores individuais
2. WHEN valores são atualizados THEN viagens futuras SHALL usar os novos valores automaticamente
3. WHEN valores são alterados THEN viagens existentes SHALL manter os valores históricos
4. WHEN passeios são desativados THEN o sistema SHALL manter histórico mas não exibir em novas viagens

### Requirement 8

**User Story:** Como um desenvolvedor do sistema, eu quero carregar apenas os passeios específicos de uma viagem, para que eu tenha melhor performance e dados mais precisos nos componentes.

#### Acceptance Criteria

1. WHEN um componente precisa dos passeios de uma viagem THEN o sistema SHALL carregar apenas os passeios relacionados àquela viagem específica
2. WHEN um hook é criado para passeios de viagem THEN o sistema SHALL usar queries otimizadas com JOIN entre viagem_passeios e passeios
3. WHEN os dados são carregados THEN o sistema SHALL incluir informações completas do passeio (nome, valor, categoria) junto com dados do relacionamento
4. WHEN não há passeios para a viagem THEN o sistema SHALL retornar array vazio sem causar erros