# Implementation Plan - Gestão Administrativa de Créditos

## Visão Geral

Este plano implementa funcionalidades administrativas para o sistema de créditos pré-pagos, permitindo edição, cancelamento, ajuste e exclusão de transações, além de geração de relatórios em PDF.

---

## Tasks

- [x] 1. Preparar alterações no banco de dados
  - Criar script SQL com todas as alterações necessárias
  - Adicionar novos campos na tabela wallet_transacoes
  - Criar funções SQL para operações administrativas
  - Testar scripts em ambiente de desenvolvimento
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

- [x] 1.1 Adicionar campos de auditoria na tabela wallet_transacoes
  - Adicionar campo editado_em (TIMESTAMP)
  - Adicionar campo editado_por (TEXT)
  - Adicionar campo cancelada (BOOLEAN DEFAULT FALSE)
  - Adicionar campo motivo_cancelamento (TEXT)
  - Adicionar campo valor_original (NUMERIC)
  - _Requirements: 2.4, 3.4, 3.5_

- [x] 1.2 Criar função SQL wallet_editar_transacao
  - Implementar lógica de busca da transação
  - Calcular diferença de valor
  - Atualizar saldo da carteira
  - Salvar valor_original na primeira edição
  - Registrar editado_em e editado_por
  - Retornar JSON com sucesso/erro
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 1.3 Criar função SQL wallet_cancelar_transacao
  - Verificar se transação já está cancelada
  - Calcular impacto no saldo
  - Validar se saldo não ficará negativo
  - Reverter valor no saldo (depósito subtrai, uso adiciona)
  - Marcar transação como cancelada
  - Registrar motivo e quem cancelou
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 1.4 Criar função SQL wallet_ajustar_saldo
  - Buscar saldo atual da carteira
  - Calcular diferença entre saldo atual e novo
  - Criar transação tipo 'ajuste' no histórico
  - Atualizar saldo da carteira
  - Registrar motivo do ajuste
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.7_

- [x] 1.5 Criar função SQL wallet_deletar_carteira
  - Verificar se saldo é igual a zero
  - Retornar erro se saldo > 0
  - Deletar todas as transações da carteira
  - Deletar registro da carteira
  - Retornar confirmação de sucesso
  - _Requirements: 1.2, 1.3, 1.4_

- [x] 2. Criar hook useWalletAdmin
  - Criar arquivo src/hooks/useWalletAdmin.ts
  - Implementar mutation editarTransacao
  - Implementar mutation cancelarTransacao
  - Implementar mutation ajustarSaldo
  - Implementar mutation deletarCarteira
  - Adicionar invalidação de queries após operações
  - Adicionar tratamento de erros com mensagens específicas
  - _Requirements: 2.1, 3.1, 4.1, 1.1, 6.6, 7.1, 7.2_

- [x] 3. Criar componente WalletTransacaoEditModal
  - Criar arquivo src/components/wallet/WalletTransacaoEditModal.tsx
  - Implementar formulário com campos valor e descrição
  - Adicionar validação de valor > 0
  - Calcular e exibir preview do impacto no saldo
  - Implementar confirmação antes de salvar
  - Adicionar feedback visual de loading
  - Integrar com hook useWalletAdmin
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 7.1, 7.7_

- [x] 4. Criar componente WalletTransacaoCancelModal
  - Criar arquivo src/components/wallet/WalletTransacaoCancelModal.tsx
  - Implementar campo obrigatório para motivo
  - Calcular e exibir impacto no saldo
  - Validar se saldo não ficará negativo
  - Adicionar confirmação com aviso destacado
  - Implementar feedback visual de loading
  - Integrar com hook useWalletAdmin
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.8, 6.2, 6.5, 7.1, 7.6, 7.7_

- [x] 5. Criar componente WalletAjusteSaldoModal
  - Criar arquivo src/components/wallet/WalletAjusteSaldoModal.tsx
  - Implementar input para novo saldo
  - Calcular e exibir diferença automaticamente
  - Adicionar campo obrigatório para motivo
  - Implementar preview visual do ajuste
  - Validar saldo >= 0
  - Adicionar confirmação com destaque
  - Integrar com hook useWalletAdmin
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 6.4, 6.5, 7.1, 7.6, 7.7_

- [x] 6. Criar componente WalletDeleteModal
  - Criar arquivo src/components/wallet/WalletDeleteModal.tsx
  - Verificar e exibir saldo atual
  - Bloquear exclusão se saldo > 0
  - Implementar campo de confirmação (digitar nome do cliente)
  - Adicionar aviso sobre ação irreversível
  - Estilizar botão de exclusão em vermelho
  - Implementar redirecionamento após exclusão
  - Integrar com hook useWalletAdmin
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 6.1, 7.6, 7.7_

- [x] 7. Criar componente WalletPDFGenerator
  - Criar arquivo src/components/wallet/WalletPDFGenerator.tsx
  - Implementar modal com seleção de período (date pickers)
  - Buscar transações do período selecionado
  - Implementar geração de PDF usando react-pdf ou jsPDF
  - Incluir logo da empresa no cabeçalho
  - Adicionar dados do cliente (nome, telefone, email)
  - Listar transações com formatação adequada
  - Incluir resumo (saldo atual, total depositado, total usado)
  - Formatar valores em R$ e datas em DD/MM/YYYY
  - Implementar download automático do arquivo
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 8. Atualizar página WalletClienteDetalhes
  - Adicionar botão "Excluir Carteira" no header
  - Adicionar botão "Ajustar Saldo" na seção de ações rápidas
  - Adicionar botão "Gerar PDF" na seção de ações rápidas
  - Integrar modais de exclusão, ajuste e PDF
  - Adicionar estados para controlar abertura dos modais
  - _Requirements: 1.1, 4.1, 5.1_

- [x] 9. Atualizar componente WalletHistoricoAgrupado
  - Adicionar botão "Editar" em cada transação não cancelada
  - Adicionar botão "Cancelar" em cada transação não cancelada
  - Implementar badge "Editado em [data]" para transações editadas
  - Implementar badge "Cancelada" em vermelho para transações canceladas
  - Implementar badge "Ajuste Manual" em laranja para ajustes
  - Aplicar estilo de texto riscado em transações canceladas
  - Exibir motivo do cancelamento quando disponível
  - Desabilitar edição em transações canceladas
  - Integrar modais de edição e cancelamento
  - _Requirements: 2.1, 2.5, 3.1, 3.5, 4.7, 6.3, 7.3, 7.4, 7.5_

- [x] 10. Adicionar tipos TypeScript
  - Atualizar interface WalletTransacao com novos campos
  - Criar interface EditarTransacaoData
  - Criar interface CancelarTransacaoData
  - Criar interface AjustarSaldoData
  - Adicionar tipo 'ajuste' ao enum de tipos de transação
  - Atualizar arquivo src/types/wallet.ts
  - _Requirements: 2.4, 3.4, 4.4_

- [x] 11. Implementar validações de segurança
  - Validar saldo não negativo em cancelamentos
  - Validar saldo zero em exclusões
  - Validar campos obrigatórios (motivo)
  - Validar valores positivos
  - Impedir edição de transações canceladas
  - Adicionar mensagens de erro específicas
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 12. Adicionar feedback visual e UX
  - Implementar toasts de sucesso (verde)
  - Implementar toasts de erro (vermelho)
  - Adicionar indicadores de loading em operações
  - Desabilitar botões durante processamento
  - Adicionar confirmações para ações irreversíveis
  - Implementar badges coloridos por tipo de transação
  - Adicionar tooltips explicativos
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 13. Testar funcionalidades
  - Testar edição de depósito (aumentar e diminuir valor)
  - Testar edição de uso (aumentar e diminuir valor)
  - Testar cancelamento de depósito (saldo diminui)
  - Testar cancelamento de uso (saldo aumenta)
  - Testar cancelamento que resultaria em saldo negativo (deve falhar)
  - Testar ajuste de saldo para maior e menor
  - Testar ajuste para valor negativo (deve falhar)
  - Testar exclusão com saldo > 0 (deve falhar)
  - Testar exclusão com saldo = 0 (deve funcionar)
  - Testar geração de PDF com diferentes períodos
  - Verificar integridade dos dados após cada operação
  - _Requirements: Todos_

- [x] 14. Documentar funcionalidades
  - Criar guia de uso para administradores
  - Documentar cada funcionalidade com exemplos
  - Adicionar screenshots dos modais
  - Documentar casos de erro e como resolver
  - Atualizar README do sistema de créditos
  - _Requirements: Todos_

---

## Notas Importantes

### Ordem de Implementação
1. **Primeiro**: Executar scripts SQL (Task 1)
2. **Segundo**: Criar hook e tipos (Tasks 2 e 10)
3. **Terceiro**: Criar componentes (Tasks 3-7)
4. **Quarto**: Integrar nas páginas (Tasks 8-9)
5. **Quinto**: Validações e UX (Tasks 11-12)
6. **Sexto**: Testes e documentação (Tasks 13-14)

### Dependências Críticas
- Task 1 deve ser concluída antes de qualquer outra
- Task 2 deve ser concluída antes das Tasks 3-7
- Tasks 3-7 podem ser feitas em paralelo
- Tasks 8-9 dependem das Tasks 3-7
- Tasks 11-12 podem ser feitas junto com Tasks 3-9
- Tasks 13-14 são as últimas

### Pontos de Atenção
- ⚠️ Todas as operações devem manter integridade do saldo
- ⚠️ Transações canceladas não podem ser editadas
- ⚠️ Exclusão só é permitida com saldo zero
- ⚠️ Todos os ajustes e cancelamentos exigem motivo
- ⚠️ Validações devem ser feitas no backend (SQL functions)
