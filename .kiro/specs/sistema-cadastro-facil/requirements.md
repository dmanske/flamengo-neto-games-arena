# Requirements Document

## Introduction

Este documento define os requisitos para implementar um sistema de controle de "Cadastramento Facial" para clientes, permitindo marcar quais clientes já possuem cadastramento facial realizado e utilizar essa informação para otimizar processos futuros de viagens e conferências de embarque.

## Requirements

### Requirement 1

**User Story:** Como administrador do sistema, eu quero marcar se um cliente já possui cadastramento facial, para que eu possa identificar rapidamente quais clientes já passaram por esse processo de reconhecimento.

#### Acceptance Criteria

1. WHEN eu estiver cadastrando um novo cliente THEN o sistema SHALL exibir um campo checkbox "Possui Cadastramento Facial"
2. WHEN eu estiver editando um cliente existente THEN o sistema SHALL permitir alterar o status do cadastramento facial
3. WHEN eu salvar as informações do cliente THEN o sistema SHALL armazenar o status do cadastramento facial no banco de dados
4. IF o cliente já possui cadastramento facial marcado THEN o sistema SHALL exibir um indicador visual na lista de clientes

### Requirement 2

**User Story:** Como operador de viagem, eu quero visualizar o status do cadastramento facial na lista de passageiros do ônibus, para que eu possa fazer a conferência de forma mais eficiente.

#### Acceptance Criteria

1. WHEN eu acessar a lista de passageiros de um ônibus THEN o sistema SHALL exibir o status do cadastramento facial abaixo do CPF de cada passageiro
2. WHEN um passageiro possui cadastramento facial THEN o sistema SHALL exibir "✓ Facial OK" em cor verde
3. WHEN um passageiro não possui cadastramento facial THEN o sistema SHALL exibir "⚠ Facial pendente" em cor amarela/laranja
4. WHEN eu visualizar a informação THEN o sistema SHALL apresentar de forma discreta e não intrusiva

### Requirement 3

**User Story:** Como administrador, eu quero que o sistema lembre automaticamente do status do cadastramento facial em viagens futuras, para que eu não precise verificar novamente clientes que já foram conferidos.

#### Acceptance Criteria

1. WHEN um cliente com cadastramento facial for adicionado a uma nova viagem THEN o sistema SHALL automaticamente exibir "✓ Facial OK"
2. WHEN eu visualizar a lista de passageiros THEN o sistema SHALL mostrar o status atual do cadastramento facial de cada cliente
3. WHEN um cliente já possui cadastramento facial THEN o sistema SHALL manter essa informação permanentemente no cadastro
4. IF um cliente não possui cadastramento facial THEN o sistema SHALL exibir "⚠ Facial pendente" para alertar sobre a necessidade

### Requirement 4

**User Story:** Como administrador, eu quero poder marcar o cadastramento facial diretamente no cadastro do cliente, para que essa informação fique salva permanentemente.

#### Acceptance Criteria

1. WHEN eu estiver cadastrando um novo cliente THEN o sistema SHALL exibir um checkbox "Possui cadastramento facial" na seção de dados pessoais
2. WHEN eu estiver editando um cliente existente THEN o sistema SHALL permitir alterar o status do cadastramento facial
3. WHEN eu marcar o checkbox THEN o sistema SHALL salvar essa informação no banco de dados
4. WHEN eu salvar o cadastro THEN o sistema SHALL manter o status do cadastramento facial para uso futuro