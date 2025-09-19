# Plano de Implementação - Lista de Presença por Ônibus

- [x] 1. Criar hook personalizado para lista de presença por ônibus
  - Implementar `useListaPresencaOnibus` hook com funcionalidades específicas
  - Incluir busca de dados do ônibus, passageiros e estatísticas
  - Implementar função de toggle de presença
  - _Requirements: 2.1, 3.1, 4.1_

- [x] 2. Implementar componente de cabeçalho do ônibus
  - Criar `OnibusHeader` component com informações do ônibus
  - Exibir estatísticas de presença (total, presentes, pendentes, taxa)
  - Incluir informações da viagem e do jogo
  - _Requirements: 2.2, 4.1, 4.2_

- [x] 3. Criar componente de estatísticas específicas do ônibus
  - Implementar `EstatisticasOnibus` component com cards de resumo
  - Incluir resumo financeiro dos passageiros do ônibus
  - Destacar responsáveis do ônibus se existirem
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 4. Implementar grid de passageiros do ônibus
  - Criar `PassageirosOnibusGrid` component para exibir passageiros
  - Incluir botões de marcar/desmarcar presença
  - Exibir informações detalhadas dos passageiros (foto, dados, passeios)
  - Destacar responsáveis do ônibus com badges especiais
  - _Requirements: 3.1, 3.2, 6.1, 6.2, 6.3, 6.4_

- [x] 5. Criar sistema de filtros e busca para o ônibus
  - Implementar filtros por cidade, status de presença
  - Adicionar busca em tempo real por nome, CPF, telefone
  - Incluir resumo de filtros aplicados
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 6. Implementar página principal de lista de presença por ônibus
  - Criar `ListaPresencaOnibus.tsx` page component
  - Integrar todos os componentes criados anteriormente
  - Implementar validação de parâmetros da URL
  - Adicionar tratamento de erros e estados de loading
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 8.1, 8.2, 8.3, 8.4_

- [x] 7. Criar seção de links por ônibus para administradores
  - Implementar `LinksOnibusSection` component
  - Adicionar funcionalidade de gerar e copiar links específicos
  - Integrar na página de detalhes da viagem
  - Incluir contagem de passageiros por ônibus
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 8. Implementar design responsivo e mobile-first
  - Adaptar todos os componentes para dispositivos móveis
  - Otimizar botões e interações para toque
  - Implementar layout empilhado para telas pequenas
  - Testar em diferentes tamanhos de tela
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 9. Adicionar rota e configurar navegação
  - Adicionar nova rota `/lista-presenca/:viagemId/onibus/:onibusId`
  - Configurar proteção de rota com autenticação
  - Implementar redirecionamentos adequados
  - Testar navegação entre páginas
  - _Requirements: 2.1, 8.1, 8.2_

- [x] 10. Implementar validações de segurança e tratamento de erros
  - Adicionar validação de parâmetros UUID
  - Implementar verificação de permissões
  - Criar tratamento para ônibus não encontrado
  - Adicionar validação de status da viagem
  - _Requirements: 2.4, 8.1, 8.2, 8.3, 8.4_

- [x] 11. Otimizar performance e adicionar feedback visual
  - Implementar loading states em todas as operações
  - Adicionar toasts de confirmação e erro
  - Implementar debounce na busca
  - Otimizar queries do banco de dados
  - _Requirements: 3.3, 3.4, 5.1_

- [x] 12. Testar funcionalidade completa e integração
  - Testar geração e acesso aos links específicos
  - Verificar funcionamento da marcação de presença
  - Testar filtros e busca em diferentes cenários
  - Validar responsividade em dispositivos móveis
  - Testar integração com sistema existente
  - _Requirements: 1.1, 2.1, 3.1, 5.1, 7.1_