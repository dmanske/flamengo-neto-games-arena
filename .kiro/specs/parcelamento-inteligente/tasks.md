# Sistema de Parcelamento Inteligente - Plano de Implementação

## Visão Geral

Este plano implementa o Sistema de Parcelamento Inteligente em fases incrementais, priorizando funcionalidades core e construindo progressivamente até o sistema completo. Cada tarefa é focada em código e pode ser executada por um agente de desenvolvimento.

## Fases de Implementação

### FASE 1: Estrutura Base e Cálculo de Parcelamento (Semana 1)

- [x] 1. Criar estrutura de banco de dados para parcelamento
  - Criar tabela `viagem_parcelamento_config`
  - Adicionar colunas na tabela `viagem_passageiros_parcelas`
  - Criar tabelas de alertas e histórico
  - Adicionar índices para performance
  - _Requirements: 1.1, 1.2, 4.1, 9.1_

- [x] 2. Implementar calculadora de parcelamento
  - Criar classe `ParcelamentoCalculator` com lógica de cálculo
  - Implementar função de validação de prazo limite (5 dias antes)
  - Implementar cálculo de opções baseado em intervalo mínimo (15 dias)
  - Criar testes unitários para todas as funções de cálculo
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 3. Criar interfaces TypeScript e tipos
  - Definir interfaces `ParcelamentoOpcao`, `Parcela`, `ParcelamentoConfig`
  - Criar tipos para status de parcela e tipos de alerta
  - Implementar validações de tipo para dados de entrada
  - Criar constantes para códigos de erro
  - _Requirements: 4.1, 4.2, 4.3, 8.1, 8.2_

### FASE 2: Interface de Seleção de Parcelamento (Semana 2)

- [x] 4. Criar componente de seleção de parcelamento ✅
  - Implementar `ParcelamentoSelector` component
  - Criar interface para mostrar opções (à vista + parcelamentos)
  - Implementar seleção de opção com preview de datas
  - Adicionar validação visual de datas limite
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.6_

- [x] 5. Implementar modo de edição personalizada ✅
  - Criar interface para edição manual de datas de parcelas
  - Implementar validação em tempo real de datas editadas
  - Adicionar feedback visual para datas inválidas
  - Criar função de recálculo automático de valores
  - _Requirements: 3.3, 3.4, 8.3, 8.4_

- [x] 6. Integrar com formulário de cadastro de passageiro ✅
  - Modificar formulário existente para incluir seleção de parcelamento
  - Implementar cálculo automático baseado na viagem selecionada
  - Adicionar configuração de desconto à vista por viagem
  - Criar função de criação de parcelas no banco
  - _Requirements: 2.4, 2.5, 3.5, 11.1, 11.2, 11.3_

### FASE 3: Sistema de Alertas e Vencimentos (Semana 3)

- [ ] 7. Implementar sistema de alertas automáticos
  - Criar `AlertaManager` class com lógica de verificação
  - Implementar job para verificar vencimentos diariamente
  - Criar templates de mensagem para cada tipo de alerta
  - Implementar envio de alertas via WhatsApp
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1, 7.2, 7.3_

- [ ] 8. Criar dashboard de vencimentos
  - Implementar `VencimentoDashboard` component
  - Criar agrupamento por urgência (hoje, amanhã, semana)
  - Implementar filtros por status de parcela
  - Adicionar ações de cobrança individual e em massa
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 9. Implementar sistema de cobrança específica
  - Criar templates personalizados por tipo de parcela
  - Implementar geração de mensagem com dados específicos
  - Adicionar histórico de tentativas de cobrança
  - Criar função de cobrança em massa para múltiplas parcelas
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

### FASE 4: Gestão Avançada e Validações (Semana 4)

- [ ] 10. Implementar validações de prazo limite
  - Criar validação automática na criação de parcelas
  - Implementar alertas quando viagem está próxima (5 dias)
  - Adicionar bloqueio de parcelamento para viagens muito próximas
  - Criar mensagens de erro explicativas para cada validação
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 11. Criar sistema de histórico e auditoria
  - Implementar registro automático de todas as alterações
  - Criar interface para visualizar histórico de parcela
  - Adicionar rastreamento de usuário em alterações
  - Implementar timeline de ações para cada parcela
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 12. Implementar configuração de descontos
  - Criar interface para configurar desconto à vista por viagem
  - Implementar cálculo automático de desconto na seleção
  - Adicionar exibição de valor original vs valor com desconto
  - Criar registro de desconto aplicado no histórico
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

### FASE 5: Integração com Sistema Financeiro (Semana 5)

- [ ] 13. Integrar parcelas com fluxo de caixa
  - Modificar hook `useFinanceiroGeral` para considerar parcelas
  - Implementar projeção de recebimentos futuros
  - Adicionar parcelas pendentes no dashboard financeiro
  - Criar visualização de parcelas no fluxo de caixa
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 14. Atualizar contas a receber com parcelas
  - Modificar `ContasReceberTab` para mostrar parcelas individuais
  - Implementar agrupamento por passageiro com detalhes de parcelas
  - Adicionar filtros por status de parcela
  - Criar ações de cobrança específica por parcela
  - _Requirements: 10.2, 10.4_

- [ ] 15. Implementar relatórios de parcelamento
  - Criar relatório de performance de parcelamento
  - Implementar análise de inadimplência por tipo de parcelamento
  - Adicionar métricas de efetividade de cobrança
  - Criar exportação de dados com detalhes de parcelas
  - _Requirements: 10.4, 10.5_

### FASE 6: Otimizações e Melhorias (Semana 6)

- [ ] 16. Implementar otimizações de performance
  - Adicionar cache para cálculos de parcelamento
  - Otimizar queries de dashboard com índices
  - Implementar paginação para grandes volumes
  - Criar job assíncrono para processamento de alertas
  - _Requirements: Performance e escalabilidade_

- [ ] 17. Adicionar testes de integração
  - Criar testes end-to-end do fluxo completo
  - Implementar testes de integração com sistema financeiro
  - Adicionar testes de performance para cálculos
  - Criar testes de stress para sistema de alertas
  - _Requirements: Qualidade e confiabilidade_

- [ ] 18. Implementar monitoramento e logs
  - Adicionar logging detalhado para todas as operações
  - Implementar métricas de uso do sistema
  - Criar alertas para falhas no sistema de cobrança
  - Adicionar dashboard de monitoramento interno
  - _Requirements: Observabilidade e manutenção_

## Critérios de Aceitação por Fase

### FASE 1 - Estrutura Base ✅
- [ ] Banco de dados criado e funcional
- [ ] Calculadora retorna opções corretas para diferentes cenários
- [ ] Validações de prazo funcionando
- [ ] Testes unitários passando

### FASE 2 - Interface de Seleção ✅
- [x] Interface mostra opções de parcelamento
- [x] Edição manual de datas funciona
- [x] Validações visuais ativas
- [x] Integração com cadastro completa

### FASE 3 - Alertas e Vencimentos ✅
- [ ] Alertas automáticos funcionando
- [ ] Dashboard mostra parcelas organizadas
- [ ] Cobrança específica operacional
- [ ] Templates personalizados ativos

### FASE 4 - Validações Avançadas ✅
- [ ] Todas as validações implementadas
- [ ] Histórico completo funcionando
- [ ] Configuração de descontos ativa
- [ ] Mensagens de erro claras

### FASE 5 - Integração Financeira ✅
- [ ] Fluxo de caixa inclui parcelas
- [ ] Contas a receber detalhadas
- [ ] Relatórios funcionais
- [ ] Projeções precisas

### FASE 6 - Otimizações ✅
- [ ] Performance otimizada
- [ ] Testes completos
- [ ] Monitoramento ativo
- [ ] Sistema estável

## Dependências e Pré-requisitos

### Dependências Técnicas
- Sistema financeiro base funcionando
- Tabelas de viagens e passageiros existentes
- Sistema de WhatsApp integrado
- Autenticação de usuários

### Dependências de Negócio
- Definição final de regras de desconto
- Aprovação de templates de mensagem
- Configuração de intervalos padrão
- Definição de permissões de usuário

## Riscos e Mitigações

### Riscos Técnicos
- **Complexidade de cálculo**: Mitigar com testes extensivos
- **Performance com volume**: Mitigar com otimizações e cache
- **Integração com WhatsApp**: Mitigar com fallbacks

### Riscos de Negócio
- **Mudança de regras**: Mitigar com configurações flexíveis
- **Resistência de usuários**: Mitigar com treinamento e UX intuitiva
- **Problemas de cobrança**: Mitigar com logs detalhados

## Métricas de Sucesso

### Métricas Técnicas
- Tempo de cálculo < 500ms
- Taxa de sucesso de alertas > 95%
- Performance de queries < 100ms
- Zero erros críticos

### Métricas de Negócio
- Redução de inadimplência em 20%
- Aumento de pagamentos à vista em 15%
- Redução de tempo de cobrança em 50%
- Satisfação do usuário > 4.5/5

---

**Status**: ✅ PLANO APROVADO - PRONTO PARA IMPLEMENTAÇÃO

**Próximo Passo**: Executar Tarefa 1 - Criar estrutura de banco de dados