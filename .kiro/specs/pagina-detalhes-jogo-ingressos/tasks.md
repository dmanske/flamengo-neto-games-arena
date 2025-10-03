# Implementation Plan

- [x] 1. Criar estrutura base da página DetalhesJogoIngressos
  - Criar página principal com roteamento
  - Implementar hook useJogoDetails para buscar dados
  - Configurar navegação e validação de parâmetros
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implementar layout e header da página
  - [x] 2.1 Criar componente ModernJogoDetailsLayout
    - Header com logos dos times (Flamengo vs Adversário)
    - Informações do jogo (data, hora, local)
    - Botões de ação (Voltar, Editar, Deletar, Exportar PDF)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 2.2 Implementar cards de resumo financeiro
    - Card Total de Ingressos
    - Card Receita Total
    - Card Lucro Total
    - Card Pendências
    - _Requirements: 2.4, 3.1_

- [x] 3. Implementar aba "Ingressos"
  - [x] 3.1 Criar componente IngressosCard com lista de ingressos
    - Tabela de ingressos com colunas: Cliente, Setor, Valor, Status
    - Ações por ingresso: Ver, Editar, Deletar
    - Paginação e ordenação
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 3.2 Implementar busca inteligente
    - Campo de busca por cliente (nome, CPF, telefone)
    - Busca por setor do estádio
    - Busca por status financeiro
    - Busca em tempo real
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 3.3 Implementar filtros avançados
    - Filtro por status (pago, pendente, cancelado)
    - Filtro por setor
    - Filtro por faixa de valores
    - Filtro por data de compra
    - _Requirements: 4.4, 4.5_

- [ ] 4. Expandir aba "Financeiro" com sistema de sub-abas completo
  - [x] 4.1 Refatorar componente FinanceiroJogo para sistema de abas
    - Implementar TabsList com 6 abas: Resumo, Receitas, Despesas, Clientes, Pendências, Gráficos
    - Criar estrutura base para gerenciar estado das sub-abas
    - Implementar navegação entre sub-abas
    - _Requirements: 8.1, 8.2_

  - [x] 4.2 Implementar sub-aba "Resumo"
    - Cards principais: Receita Total, Custo Total, Lucro Líquido, Pendências
    - Cards secundários: Ticket Médio, Margem de Lucro, Taxa de Conversão
    - Resumo por setor do estádio com vendas e lucro
    - Indicadores visuais de progresso e performance
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 4.3 Implementar sub-aba "Receitas"
    - Seção de receitas automáticas dos ingressos vendidos
    - Formulário para adicionar receitas manuais (patrocínios, extras)
    - Lista detalhada por cliente com valores individuais
    - Totalizadores separados por tipo de receita
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 4.4 Implementar sub-aba "Despesas"
    - Seção de custos dos ingressos (preço compra vs venda)
    - Formulário para adicionar despesas operacionais
    - Análise de margem de lucro por ingresso
    - Categorização de despesas fixas vs variáveis
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [x] 4.5 Implementar sub-aba "Lista de Clientes"
    - Tabela completa com todos os clientes do jogo
    - Colunas: Nome, Status, Valor Pago, Desconto, Lucro Individual
    - Ações rápidas: Marcar como pago, Enviar cobrança
    - Filtros por status financeiro
    - _Requirements: 14.1, 14.2, 14.3, 14.4_

  - [x] 4.6 Implementar sub-aba "Pendências"
    - Dashboard com clientes com pagamento pendente
    - Ferramentas de cobrança integradas (WhatsApp, email, telefone)
    - Histórico de tentativas de cobrança
    - Sistema de priorização por valor e prazo
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [x] 4.7 Implementar sub-aba "Gráficos"
    - Gráfico de performance por setor do estádio
    - Análise temporal de vendas até o jogo
    - Comparativo com média de outros jogos
    - Cálculo e exibição de ROI por setor
    - _Requirements: 16.1, 16.2, 16.3, 16.4_

- [x] 5. Implementar funcionalidades de ação
  - [x] 5.1 Integrar modais existentes
    - Modal de detalhes do ingresso
    - Modal de edição de ingresso
    - Modal de novo ingresso (pré-preenchido com o jogo)
    - _Requirements: 6.1, 6.2_

  - [x] 5.2 Implementar ações de jogo
    - Deletar jogo completo com confirmação
    - Exportar PDF do jogo
    - Editar informações do jogo
    - _Requirements: 6.3, 6.4_

- [x] 6. Configurar roteamento e navegação
  - Adicionar rota /dashboard/jogo-ingressos/:jogoId
  - Atualizar botão "Ver" na página Ingressos para navegar
  - Implementar breadcrumbs e navegação
  - _Requirements: 7.1, 7.2_

- [x] 7. Implementar estados de loading e erro
  - Loading states para carregamento de dados
  - Estados de erro com mensagens apropriadas
  - Skeleton loading para melhor UX
  - _Requirements: 8.1, 8.2_

- [x] 8. Otimizar performance e acessibilidade
  - [x] 8.1 Implementar otimizações de performance
    - useMemo para cálculos pesados
    - useCallback para funções
    - Lazy loading quando apropriado
    - _Requirements: Performance_

  - [x] 8.2 Garantir acessibilidade
    - Labels ARIA apropriados
    - Navegação por teclado
    - Contraste adequado
    - _Requirements: Accessibility_

- [ ] 10. Criar hooks e utilitários para gestão financeira
  - [x] 10.1 Criar hook useJogoFinanceiro
    - Gerenciar estado das receitas e despesas do jogo
    - Funções para CRUD de receitas manuais
    - Funções para CRUD de despesas operacionais
    - Cálculos automáticos de métricas financeiras
    - _Requirements: 12.2, 13.2_

  - [x] 10.2 Criar hook useSetorAnalytics
    - Calcular performance por setor do estádio
    - Análise de ROI por setor
    - Comparativo entre setores
    - Métricas de ocupação e demanda
    - _Requirements: 16.1, 16.4_

  - [x] 10.3 Criar hook useCobrancaJogo
    - Gerenciar sistema de cobranças
    - Integração com WhatsApp, email, telefone
    - Histórico de tentativas de cobrança
    - Sistema de priorização de pendências
    - _Requirements: 15.2, 15.3, 15.4_

- [ ] 11. Criar componentes específicos para cada sub-aba
  - [x] 11.1 Criar componente ResumoFinanceiroJogo
    - Cards de métricas principais e secundárias
    - Resumo visual por setor
    - Indicadores de progresso
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 11.2 Criar componente ReceitasJogo
    - Lista de receitas automáticas e manuais
    - Formulário para nova receita
    - Totalizadores por tipo
    - _Requirements: 12.1, 12.2, 12.4_

  - [x] 11.3 Criar componente DespesasJogo
    - Lista de custos e despesas operacionais
    - Formulário para nova despesa
    - Análise de margem por ingresso
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 11.4 Criar componente ListaClientesJogo
    - Tabela completa de clientes
    - Ações rápidas de cobrança
    - Filtros por status
    - _Requirements: 14.1, 14.3, 14.4_

  - [x] 11.5 Criar componente PendenciasJogo
    - Dashboard de cobranças
    - Ferramentas integradas de contato
    - Sistema de priorização
    - _Requirements: 15.1, 15.2, 15.4_

  - [x] 11.6 Criar componente GraficosJogo
    - Gráficos de performance por setor
    - Análise temporal e comparativa
    - Visualizações de ROI
    - _Requirements: 16.1, 16.2, 16.3_

- [x] 12. Implementar formulários e modais específicos
  - [x] 12.1 Criar ReceitaJogoForm
    - Formulário para receitas manuais
    - Validação com Zod
    - Integração com hook useJogoFinanceiro
    - _Requirements: 12.2_

  - [x] 12.2 Criar DespesaJogoForm
    - Formulário para despesas operacionais
    - Categorização automática
    - Cálculo de impacto na margem
    - _Requirements: 13.2_

  - [x] 12.3 Criar CobrancaModal
    - Interface para envio de cobranças
    - Templates de mensagem
    - Histórico de tentativas
    - _Requirements: 15.2, 15.3_

- [ ] 13. Criar estrutura de banco de dados e fornecer SQLs
  - [x] 13.1 Gerar SQL para tabela receitas_jogos
    - Campos: id, jogo_key, tipo, descricao, valor, data_receita, observacoes
    - Relacionamento com jogos via jogo_key (adversario-data-local)
    - Políticas RLS apropriadas
    - Fornecer SQL completo para execução
    - _Requirements: 12.1, 12.2_

  - [x] 13.2 Gerar SQL para tabela despesas_jogos
    - Campos: id, jogo_key, tipo, descricao, valor, categoria, data_despesa, observacoes
    - Relacionamento com jogos via jogo_key
    - Políticas RLS apropriadas
    - Fornecer SQL completo para execução
    - _Requirements: 13.1, 13.2_

  - [x] 13.3 Gerar SQL para tabela historico_cobrancas_ingressos
    - Campos: id, ingresso_id, tipo_cobranca, data_envio, status, observacoes
    - Relacionamento com tabela de ingressos
    - Log de tentativas de cobrança
    - Fornecer SQL completo para execução
    - _Requirements: 15.3_

  - [x] 13.4 Gerar SQL para views e funções auxiliares
    - View para resumo financeiro por jogo
    - Função para calcular analytics por setor
    - Triggers para atualização automática de totais
    - Fornecer SQLs completos para execução
    - _Requirements: 11.1, 16.1_

- [ ] 14. Testes e validação final
  - [ ] 14.1 Testar funcionalidades das sub-abas
    - Navegação entre sub-abas financeiras
    - CRUD de receitas e despesas
    - Sistema de cobranças
    - _Requirements: All new requirements_

  - [ ] 14.2 Testar integração com sistema existente
    - Compatibilidade com dados existentes
    - Performance com grandes volumes
    - Responsividade mobile
    - _Requirements: All requirements_

  - [ ] 14.3 Validar cálculos financeiros
    - Precisão dos cálculos de margem
    - Consistência entre abas
    - Totalizadores corretos
    - _Requirements: 11.2, 13.3, 16.4_