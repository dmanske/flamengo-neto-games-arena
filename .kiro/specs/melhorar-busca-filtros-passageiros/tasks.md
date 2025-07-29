# Implementation Plan

## Phase 1: Core Search Enhancement

- [x] 1. Implementar função de busca otimizada
  - Criar função `normalizeText` para remover acentos e converter para lowercase
  - Implementar `searchPassageiros` que busca em múltiplos campos
  - Adicionar busca em: nome, telefone, email, cidade, setor_maracana, cidade_embarque, observacoes
  - Incluir busca nos nomes dos passeios selecionados
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.3, 6.4_

- [x] 2. Corrigir hook useViagemDetails para busca aprimorada
  - Atualizar função `filterPassageiros` para usar nova lógica de busca
  - Implementar pré-processamento dos dados para otimizar performance
  - Adicionar campo `searchableText` concatenado nos dados dos passageiros
  - Testar busca com termos como "lapa", nomes parciais, telefones
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.2, 5.3_

## Phase 2: Sistema de Filtros por Passeios

- [ ] 3. Criar componente SearchAndFilters
  - Implementar input de busca com ícone e botão limpar
  - Adicionar dropdown para filtro de status (existente)
  - Criar dropdown para filtro por passeios
  - Implementar debounce de 300ms na busca
  - _Requirements: 2.1, 4.1, 5.1_

- [ ] 4. Implementar lógica de filtro por passeios
  - Adicionar opção "Todos" (padrão)
  - Implementar filtro "Sem passeios" para passageiros sem passeios selecionados
  - Criar filtros individuais para cada passeio disponível na viagem
  - Integrar com filtros existentes de status
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2_

- [ ] 5. Atualizar estado de filtros no useViagemDetails
  - Adicionar `passeioFilter` ao estado do hook
  - Implementar função `applyPasseioFilter`
  - Combinar filtros de status, busca e passeios
  - Manter performance com memoização
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.2, 5.3_

## Phase 3: Feedback Visual e UX

- [ ] 6. Criar componente FilterBadges
  - Implementar badges para filtros ativos
  - Adicionar botões X para remover filtros individuais
  - Mostrar filtro de status quando não for "todos"
  - Exibir filtro de passeio quando selecionado
  - _Requirements: 4.1, 4.3_

- [ ] 7. Implementar contador de resultados
  - Adicionar texto "Mostrando X de Y passageiros"
  - Atualizar contador em tempo real conforme filtros mudam
  - Posicionar entre filtros e lista de passageiros
  - Incluir lógica para pluralização correta
  - _Requirements: 4.2_

- [ ] 8. Adicionar botão "Limpar filtros"
  - Mostrar apenas quando há filtros ativos
  - Limpar todos os filtros simultaneamente (busca, status, passeios)
  - Posicionar ao lado do contador de resultados
  - Implementar feedback visual ao limpar
  - _Requirements: 4.3, 3.4_

## Phase 4: Estados de Erro e Mensagens

- [ ] 9. Implementar estados de "nenhum resultado"
  - Mostrar mensagem quando busca não encontra resultados
  - Exibir "Nenhum passageiro encontrado para: [termo]"
  - Adicionar sugestão para limpar filtros ou alterar busca
  - Incluir ícone ilustrativo para melhor UX
  - _Requirements: 1.5, 4.4_

- [ ] 10. Adicionar tratamento de filtros restritivos
  - Detectar quando combinação de filtros não retorna resultados
  - Mostrar "Nenhum passageiro atende aos critérios selecionados"
  - Sugerir ajustes nos filtros aplicados
  - Manter botão "Limpar filtros" visível
  - _Requirements: 4.4_

## Phase 5: Otimizações de Performance

- [ ] 11. Implementar pré-processamento de dados
  - Criar função `preprocessPassageiros` para otimizar busca
  - Adicionar campos `searchableText` e `normalizedSearchText`
  - Incluir flag `hasPasseios` para filtros rápidos
  - Executar pré-processamento apenas quando dados mudam
  - _Requirements: 5.2, 5.3, 5.4_

- [ ] 12. Adicionar memoização e debounce
  - Implementar `useMemo` para resultados filtrados
  - Usar `useDebounce` para termo de busca
  - Otimizar re-renderizações desnecessárias
  - Manter performance com listas grandes (>100 passageiros)
  - _Requirements: 5.1, 5.3_

## Phase 6: Integração e Testes

- [ ] 13. Integrar componentes na página DetalhesViagem
  - Substituir busca atual pelo novo componente SearchAndFilters
  - Integrar FilterBadges na interface
  - Adicionar contador de resultados
  - Testar integração com componentes existentes
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 14. Testes de funcionalidade e performance
  - Testar busca com diferentes termos (nomes, telefones, cidades)
  - Verificar filtros por passeios funcionando corretamente
  - Testar combinação de múltiplos filtros
  - Validar performance com datasets grandes
  - Confirmar que busca por "lapa" funciona corretamente
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 5.3_

## Phase 7: Refinamentos e Polimento

- [ ] 15. Melhorar responsividade mobile
  - Adaptar layout dos filtros para telas pequenas
  - Otimizar dropdown de passeios para mobile
  - Ajustar espaçamento e tamanhos dos badges
  - Testar usabilidade em dispositivos móveis
  - _Requirements: 4.1, 4.2_

- [ ] 16. Adicionar persistência de filtros (opcional)
  - Manter filtros aplicados ao navegar entre abas
  - Salvar estado de filtros no localStorage
  - Restaurar filtros ao recarregar página
  - Implementar limpeza automática após tempo
  - _Requirements: 5.4_