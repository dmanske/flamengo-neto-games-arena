# Implementation Plan - Sistema de Créditos Pré-pagos

- [x] 1. Criar estrutura de banco de dados para carteira digital
  - Criar tabela `cliente_wallet` para saldos atuais por cliente
  - Criar tabela `wallet_transacoes` para histórico completo de movimentações
  - Adicionar índices para performance (cliente_id, created_at, tipo)
  - Criar constraints e validações de integridade
  - _Requirements: 1.2, 1.3, 1.4, 5.1, 5.2_

- [x] 2. Implementar tipos TypeScript e validações
  - Criar interfaces `ClienteWallet` e `WalletTransacao` em types/wallet.ts
  - Implementar schemas Zod para validação de formulários (depósito e uso)
  - Criar tipos para filtros, resumos e relatórios
  - Definir enums para tipos de transação e formas de pagamento
  - _Requirements: 1.1, 2.1, 2.2, 6.1_

- [x] 3. Desenvolver hooks para operações de carteira
  - Criar `useWalletSaldo` para consultar saldo de cliente específico
  - Implementar `useWalletTransacoes` para histórico com paginação
  - Desenvolver `useWalletDeposito` para registrar novos depósitos
  - Criar `useWalletUso` para debitar saldo automaticamente
  - Implementar `useWalletResumo` para métricas do dashboard
  - _Requirements: 1.4, 2.4, 3.1, 3.5_

- [x] 4. Criar componente de saldo da carteira com alertas
  - Implementar `WalletSaldoCard` com saldo destacado e animações
  - Adicionar sistema de cores dinâmicas: Verde (>R$ 500), Amarelo (R$ 100-500), Vermelho (<R$ 100)
  - Implementar alertas visuais para saldo baixo (ícone ⚠️ + borda vermelha)
  - Incluir indicadores de tendência (↗️ crescendo, ↘️ diminuindo)
  - Adicionar informações de total depositado e total usado
  - _Requirements: 1.1, 2.5, 6.2, 6.4_

- [x] 5. Desenvolver modal de depósito
  - Criar `WalletDepositoModal` com formulário de depósito
  - Implementar seletor de cliente (se não pré-definido)
  - Adicionar input de valor com máscara monetária brasileira
  - Incluir campos de forma de pagamento e descrição opcional
  - Implementar validações em tempo real
  - _Requirements: 1.2, 1.3, 1.5, 6.1_

- [x] 6. Implementar histórico agrupado por mês
  - Criar `WalletHistoricoAgrupado` com accordion por mês/ano
  - Implementar resumo mensal (total entradas vs saídas) em cada grupo
  - Adicionar ícones visuais para tipos de transação (💰 depósito, 🛒 uso)
  - Criar filtros rápidos: "Este mês", "Últimos 3 meses", "Este ano", "Tudo"
  - Implementar busca por descrição das transações
  - Adicionar funcionalidade de exportação para Excel
  - _Requirements: 2.4, 3.2, 4.3, 6.4_

- [x] 7. Criar dashboard administrativo principal
  - Implementar página `/creditos-prepagos` com layout responsivo
  - Adicionar cards de resumo geral (total clientes, valor total, movimentações do mês)
  - Criar lista de clientes com saldos e ações rápidas
  - Implementar filtros de busca por cliente e período
  - Adicionar botão "Novo Depósito" com modal integrado
  - _Requirements: 3.1, 3.3, 3.5, 6.1, 6.3_

- [x] 8. Integrar aba "Carteira" na página do cliente
  - Adicionar nova aba "Carteira" na página de detalhes do cliente
  - Implementar visualização do saldo atual em destaque
  - Mostrar resumo rápido (total depositado, usado, última movimentação)
  - Incluir histórico de transações específico do cliente
  - Adicionar botão para novo depósito direto para o cliente
  - _Requirements: 1.1, 2.1, 3.2, 6.2_

- [x] 9. Implementar sistema de uso manual de créditos
  - Criar modal `WalletUsoModal` para registrar saída de créditos manualmente
  - Implementar formulário com cliente, valor, descrição e referência opcional
  - Adicionar validação de saldo suficiente antes de confirmar
  - Criar função para debitar saldo e registrar transação de uso
  - Incluir botão "Registrar Uso" no dashboard e na página do cliente
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 10. Desenvolver sistema de relatórios e exportação
  - Criar página de relatórios com filtros por período
  - Implementar cálculos de resumo (total depositado, usado, saldo final)
  - Adicionar gráficos de evolução mensal usando Chart.js ou similar
  - Desenvolver exportação para Excel/CSV com dados detalhados
  - Implementar geração de PDF com resumo executivo
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

-- [ ] 11. Otimizar performance e adicionar cache
  - Implementar React Query para cache inteligente de saldos
  - Adicionar paginação virtual para listas grandes de transações
  - Criar índices de banco otimizados para consultas frequentes
  - Implementar debounce em filtros de busca
  - Adicionar view materializada para relatórios mensais
  - _Requirements: 6.3, 6.5_

- [x] 12. Configurar notificações e alertas
  - Implementar notificação quando saldo atingir valor baixo (< R$ 100)
  - Criar alertas para administradores sobre clientes sem movimentação
  - Adicionar notificações de sucesso/erro para operações
  - Implementar sistema de notificação por email para relatórios
  - _Requirements: 2.5, 3.3_

- [x] 13. Finalizar sistema e testes de aceitação
  - Testar todos os cenários de uso em ambiente de desenvolvimento
  - Validar responsividade em dispositivos móveis
  - Realizar testes de acessibilidade (contraste, navegação por teclado)
  - Documentar processo de uso para administradores
  - _Requirements: 6.1, 6.2, 6.4, 6.5_