# Requirements Document - Gestão Administrativa de Créditos

## ✅ Status: IMPLEMENTADO

**Data de Conclusão:** 16/12/2024

Todos os requisitos foram implementados e testados com sucesso.

---

## Introduction

Este documento especifica os requisitos para implementar funcionalidades administrativas no sistema de créditos pré-pagos (wallet), permitindo que administradores gerenciem carteiras de clientes com operações de edição, cancelamento, ajuste e exclusão, além de gerar relatórios em PDF.

O sistema atual permite apenas criar depósitos e usar créditos, mas não oferece ferramentas para corrigir erros, fazer ajustes ou gerar documentação para os clientes.

## Glossary

- **Sistema**: Sistema de gestão de créditos pré-pagos (wallet)
- **Administrador**: Usuário com permissões para gerenciar carteiras de clientes
- **Carteira**: Conta digital do cliente que armazena créditos pré-pagos
- **Transação**: Registro de depósito, uso, ajuste ou cancelamento de créditos
- **Saldo**: Valor disponível na carteira do cliente
- **Estorno**: Reversão de uma transação, devolvendo o valor ao saldo
- **Ajuste**: Correção manual do saldo por motivos administrativos
- **Extrato PDF**: Documento com histórico de transações do cliente

## Requirements

### Requirement 1: Exclusão de Carteira

**User Story:** Como administrador, eu quero excluir a carteira de um cliente, para que eu possa remover contas inativas ou duplicadas do sistema.

#### Acceptance Criteria

1. WHEN o Administrador acessa a página de detalhes da carteira, THE Sistema SHALL exibir um botão "Excluir Carteira"

2. WHEN o Administrador clica em "Excluir Carteira" AND o saldo da carteira é maior que zero, THE Sistema SHALL exibir um alerta informando que a carteira possui saldo e impedir a exclusão

3. WHEN o Administrador clica em "Excluir Carteira" AND o saldo da carteira é igual a zero, THE Sistema SHALL exibir um modal de confirmação com aviso sobre a ação irreversível

4. WHEN o Administrador confirma a exclusão no modal, THE Sistema SHALL deletar a carteira e todas as transações associadas do banco de dados

5. WHEN a exclusão é concluída com sucesso, THE Sistema SHALL exibir uma mensagem de confirmação e redirecionar para a lista de carteiras

### Requirement 2: Edição de Transações

**User Story:** Como administrador, eu quero editar transações existentes, para que eu possa corrigir erros de digitação ou valores incorretos.

#### Acceptance Criteria

1. WHEN o Administrador visualiza o histórico de transações, THE Sistema SHALL exibir um botão "Editar" ao lado de cada transação não cancelada

2. WHEN o Administrador clica em "Editar", THE Sistema SHALL abrir um modal com os campos valor e descrição preenchidos com os dados atuais

3. WHEN o Administrador altera o valor da transação, THE Sistema SHALL recalcular automaticamente o saldo da carteira

4. WHEN o Administrador salva a edição, THE Sistema SHALL atualizar a transação com os novos valores e registrar a data e hora da edição

5. WHEN a edição é salva, THE Sistema SHALL exibir um indicador visual "Editado em [data]" na transação

6. IF a transação editada é um depósito, THEN THE Sistema SHALL aumentar ou diminuir o saldo conforme a diferença entre valor original e novo valor

7. IF a transação editada é um uso, THEN THE Sistema SHALL ajustar o saldo conforme a diferença entre valor original e novo valor

### Requirement 3: Cancelamento de Transações

**User Story:** Como administrador, eu quero cancelar transações, para que eu possa estornar operações realizadas por engano.

#### Acceptance Criteria

1. WHEN o Administrador visualiza o histórico de transações, THE Sistema SHALL exibir um botão "Cancelar" ao lado de cada transação não cancelada

2. WHEN o Administrador clica em "Cancelar", THE Sistema SHALL abrir um modal solicitando o motivo do cancelamento

3. WHEN o Administrador confirma o cancelamento, THE Sistema SHALL reverter o valor da transação no saldo da carteira

4. WHEN o cancelamento é processado, THE Sistema SHALL marcar a transação como cancelada sem deletá-la do banco de dados

5. WHEN uma transação é cancelada, THE Sistema SHALL exibir um badge "Cancelada" e o motivo do cancelamento no histórico

6. IF a transação cancelada é um depósito, THEN THE Sistema SHALL subtrair o valor do saldo atual

7. IF a transação cancelada é um uso, THEN THE Sistema SHALL adicionar o valor de volta ao saldo atual

8. WHEN o saldo resultante do cancelamento seria negativo, THE Sistema SHALL impedir o cancelamento e exibir mensagem de erro

### Requirement 4: Ajuste Manual de Saldo

**User Story:** Como administrador, eu quero ajustar manualmente o saldo de uma carteira, para que eu possa fazer correções administrativas quando necessário.

#### Acceptance Criteria

1. WHEN o Administrador acessa a página de detalhes da carteira, THE Sistema SHALL exibir um botão "Ajustar Saldo" na seção de ações rápidas

2. WHEN o Administrador clica em "Ajustar Saldo", THE Sistema SHALL abrir um modal com campos para novo saldo e motivo obrigatório

3. WHEN o Administrador informa o novo saldo, THE Sistema SHALL calcular e exibir a diferença em relação ao saldo atual

4. WHEN o Administrador confirma o ajuste, THE Sistema SHALL criar uma transação do tipo "ajuste" no histórico

5. WHEN o ajuste é salvo, THE Sistema SHALL atualizar o saldo da carteira para o novo valor

6. WHEN o ajuste é concluído, THE Sistema SHALL exibir um alerta visual destacando que foi feito um ajuste manual

7. WHEN o Administrador visualiza o histórico, THE Sistema SHALL exibir transações de ajuste com badge diferenciado e o motivo informado

### Requirement 5: Geração de Relatório PDF

**User Story:** Como administrador, eu quero gerar um extrato em PDF da carteira do cliente, para que eu possa enviar documentação oficial das transações.

#### Acceptance Criteria

1. WHEN o Administrador acessa a página de detalhes da carteira, THE Sistema SHALL exibir um botão "Gerar PDF" na seção de ações rápidas

2. WHEN o Administrador clica em "Gerar PDF", THE Sistema SHALL abrir um modal para selecionar o período do extrato

3. WHEN o Administrador confirma a geração, THE Sistema SHALL criar um documento PDF com logo da empresa, dados do cliente e histórico de transações

4. WHEN o PDF é gerado, THE Sistema SHALL incluir saldo atual, total depositado, total usado e lista de transações do período

5. WHEN o PDF está pronto, THE Sistema SHALL fazer o download automático do arquivo

6. WHEN o período selecionado não possui transações, THE Sistema SHALL gerar PDF apenas com saldo atual e mensagem informativa

7. WHEN o PDF é gerado, THE Sistema SHALL formatar valores em moeda brasileira (R$) e datas no formato DD/MM/YYYY

### Requirement 6: Validações de Segurança

**User Story:** Como administrador, eu quero que o sistema valide todas as operações administrativas, para que eu evite erros que possam comprometer a integridade dos dados.

#### Acceptance Criteria

1. WHEN o Administrador tenta excluir uma carteira com saldo positivo, THE Sistema SHALL impedir a operação e exibir mensagem de erro

2. WHEN o Administrador tenta cancelar uma transação que resultaria em saldo negativo, THE Sistema SHALL impedir a operação e exibir mensagem de erro

3. WHEN o Administrador tenta editar uma transação cancelada, THE Sistema SHALL impedir a operação e exibir mensagem informativa

4. WHEN o Administrador tenta ajustar saldo para valor negativo, THE Sistema SHALL impedir a operação e exibir mensagem de erro

5. WHEN o Administrador não preenche o motivo obrigatório em cancelamento ou ajuste, THE Sistema SHALL impedir a operação e destacar o campo obrigatório

6. WHEN qualquer operação administrativa falha, THE Sistema SHALL exibir mensagem de erro clara e não alterar dados no banco

### Requirement 7: Feedback Visual e UX

**User Story:** Como administrador, eu quero receber feedback visual claro sobre minhas ações, para que eu saiba o resultado de cada operação.

#### Acceptance Criteria

1. WHEN o Administrador completa qualquer operação com sucesso, THE Sistema SHALL exibir uma notificação toast verde com mensagem de confirmação

2. WHEN o Administrador completa uma operação que falha, THE Sistema SHALL exibir uma notificação toast vermelha com mensagem de erro

3. WHEN o Administrador visualiza transações editadas, THE Sistema SHALL exibir um badge "Editado" com cor diferenciada

4. WHEN o Administrador visualiza transações canceladas, THE Sistema SHALL exibir o texto riscado e badge "Cancelada" em vermelho

5. WHEN o Administrador visualiza transações de ajuste, THE Sistema SHALL exibir badge "Ajuste Manual" em cor laranja

6. WHEN o Administrador está prestes a realizar uma ação irreversível, THE Sistema SHALL exibir modal de confirmação com texto destacado em vermelho

7. WHEN o Administrador está processando uma operação, THE Sistema SHALL exibir indicador de loading e desabilitar botões para evitar cliques duplicados

---

## Resumo de Implementação

### Requisitos Atendidos

| Requisito | Descrição | Status |
|-----------|-----------|--------|
| 1 | Exclusão de Carteira | ✅ Implementado |
| 2 | Edição de Transações | ✅ Implementado |
| 3 | Cancelamento de Transações | ✅ Implementado |
| 4 | Ajuste Manual de Saldo | ✅ Implementado |
| 5 | Geração de Relatório PDF | ✅ Implementado |
| 6 | Validações de Segurança | ✅ Implementado |
| 7 | Feedback Visual e UX | ✅ Implementado |

### Arquivos Principais

- **Componentes**: `src/components/wallet/`
- **Hooks**: `src/hooks/useWalletAdmin.ts`
- **Tipos**: `src/types/wallet.ts`
- **Páginas**: `src/pages/WalletClienteDetalhes.tsx`, `src/pages/CreditosPrePagos.tsx`
- **SQL**: `.kiro/specs/gestao-administrativa-creditos/database-changes.sql`

### Documentação

- `RESUMO-GESTAO-ADMINISTRATIVA-CREDITOS.md`
- `GUIA-RAPIDO-TESTE.md`
- `INSTRUCOES-INSTALACAO.md`
