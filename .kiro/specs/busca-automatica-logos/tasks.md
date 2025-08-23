# Plano de Implementação: Busca Automática de Logos dos Adversários

## Fase 1: Busca Automática no Formulário

- [x] 1. Criar componente AdversarioSearchInput
  - Implementar input com debounce de 300ms para busca
  - Criar dropdown com sugestões de adversários (nome + logo)
  - Implementar busca case-insensitive na tabela adversarios usando ILIKE
  - Adicionar cancelamento de requisições anteriores para evitar race conditions
  - Incluir estados de loading e empty state
  - _Requisitos: 1.1, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 6.1, 6.3_

- [x] 2. Adicionar função de busca de adversários no useIngressos hook
  - Implementar função buscarAdversarios() que consulta a tabela adversarios
  - Usar busca parcial com PostgreSQL ILIKE para nomes similares
  - Limitar resultados a 10 sugestões para performance
  - Implementar timeout de 5 segundos para evitar travamentos
  - Adicionar tratamento de erros silencioso
  - _Requisitos: 1.1, 2.1, 2.4, 6.4, 8.1, 8.2_

- [x] 3. Integrar AdversarioSearchInput no IngressoFormModal
  - Substituir o input simples de adversário pelo novo componente
  - Conectar callback onLogoChange para preencher automaticamente o campo logo_adversario
  - Manter compatibilidade com modo de edição de ingressos existentes
  - Preservar funcionalidade de entrada manual quando não há sugestões
  - Testar integração com validação do formulário (Zod schema)
  - _Requisitos: 1.2, 1.4, 5.1, 5.2, 8.3, 8.4_

- [x] 4. Implementar preview e validação de logos
  - Atualizar preview do logo em tempo real quando adversário for selecionado
  - Implementar fallback para placeholder quando logo não carregar
  - Adicionar validação básica de URL de imagem
  - Manter possibilidade de edição manual da URL do logo
  - Testar comportamento com URLs inválidas
  - _Requisitos: 1.2, 1.3, 4.3, 4.4, 5.3, 5.4_

## Fase 2: Edição de Logos nos Cards

- [x] 5. Criar componente EditarLogoModal
  - Implementar modal com formulário para edição de URL do logo
  - Adicionar preview em tempo real da nova imagem
  - Incluir validação de URL e tratamento de erros de carregamento
  - Implementar botões de salvar/cancelar com estados de loading
  - Adicionar feedback visual para sucesso/erro na atualização
  - _Requisitos: 7.1, 7.3, 5.1, 5.2_

- [x] 6. Adicionar função de atualização em lote no useIngressos hook
  - Implementar função atualizarLogoJogo() que atualiza todos ingressos de um jogo específico
  - Usar filtros por adversario, jogo_data e local_jogo para identificar o jogo
  - Implementar transação para garantir consistência dos dados
  - Adicionar recarregamento automático da lista após atualização
  - Incluir tratamento de erros e rollback em caso de falha
  - _Requisitos: 7.2, 7.3, 6.4_

- [x] 7. Integrar edição de logo no CleanJogoCard
  - Adicionar evento de clique no logo do adversário para abrir modal de edição
  - Implementar indicador visual quando logo não carrega (ícone de edição)
  - Conectar modal EditarLogoModal com dados do jogo
  - Implementar callback onSuccess para recarregar card após edição
  - Adicionar tooltip explicativo sobre a funcionalidade de edição
  - _Requisitos: 7.1, 7.4, 4.1, 4.2_

- [x] 8. Implementar atualização em tempo real dos cards
  - Garantir que alterações no logo sejam refletidas imediatamente no card
  - Implementar recarregamento otimizado apenas do card afetado
  - Adicionar animação sutil para indicar atualização bem-sucedida
  - Testar comportamento com múltiplos cards do mesmo adversário
  - Verificar consistência entre cards e lista de ingressos
  - _Requisitos: 7.3, 6.4_

## Fase 3: Melhorias e Otimizações

- [x] 9. Implementar cache de adversários
  - Adicionar cache local dos adversários buscados recentemente
  - Implementar estratégia de invalidação de cache (TTL de 5 minutos)
  - Limitar cache a 50 adversários para controle de memória
  - Priorizar adversários mais utilizados no cache
  - Testar performance com e sem cache
  - _Requisitos: 6.3, 6.1_

- [x] 10. Adicionar melhorias de UX
  - Implementar estados de loading mais refinados (skeleton, spinners)
  - Adicionar animações suaves para transições de estado
  - Melhorar feedback visual para ações do usuário
  - Implementar keyboard navigation no dropdown de sugestões
  - Adicionar tooltips explicativos onde necessário
  - _Requisitos: 2.2, 4.1, 4.2_

- [x] 11. Implementar testes automatizados
  - Criar testes unitários para AdversarioSearchInput (debounce, busca, seleção)
  - Criar testes unitários para EditarLogoModal (validação, preview, salvamento)
  - Implementar testes de integração para fluxo completo de busca e edição
  - Adicionar testes de performance para busca com muitos resultados
  - Criar testes de acessibilidade para componentes de formulário
  - _Requisitos: 6.1, 6.2, 6.4_

- [x] 12. Otimizações finais e documentação
  - Otimizar queries de busca com índices apropriados se necessário
  - Implementar lazy loading para imagens de logo nas sugestões
  - Adicionar logs para monitoramento de uso da funcionalidade
  - Criar documentação técnica para manutenção futura
  - Realizar testes de carga e ajustes de performance
  - _Requisitos: 6.1, 6.2, 6.3, 6.4_