# Implementation Plan

- [x] 1. Configurar estrutura básica de abas
  - Importar componente Tabs do shadcn/ui na página Ingressos
  - Adicionar estados para controle de abas (activeTab, viewMode, periodoFiltro)
  - Criar estrutura básica de TabsList e TabsContent
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implementar separação de jogos por data
  - [x] 2.1 Criar função separarJogosPorData para dividir jogos futuros e passados
    - Implementar lógica de comparação de datas baseada na data atual
    - Filtrar jogos futuros (data >= hoje) e passados (data < hoje)
    - _Requirements: 2.1, 3.1_

  - [x] 2.2 Mover conteúdo existente para aba "Jogos Futuros"
    - Transferir cards de resumo financeiro para TabsContent futuros
    - Mover lógica de jogos futuros existente para a nova estrutura
    - Manter funcionalidade de busca e filtros existentes
    - _Requirements: 2.2, 2.3, 2.4_

- [x] 3. Implementar aba "Jogos Passados"
  - [x] 3.1 Criar lógica de agrupamento por mês
    - Implementar função agruparJogosPorMes similar à página Viagens
    - Ordenar jogos passados por data decrescente (mais recentes primeiro)
    - Criar estrutura de grupos com chave, mesAno e jogos
    - _Requirements: 3.2, 3.3_

  - [x] 3.2 Implementar filtros de período para jogos passados
    - Adicionar Select com opções de período (todos, mês atual, etc.)
    - Criar função filtrarJogosPorPeriodo baseada na página Viagens
    - Aplicar filtros antes do agrupamento por mês
    - _Requirements: 3.4, 6.4_

  - [x] 3.3 Implementar renderização de jogos passados agrupados
    - Criar renderização com cabeçalhos de mês/ano
    - Implementar contagem de jogos por grupo
    - Manter funcionalidade de busca desabilitando agrupamento quando ativa
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 4. Implementar controles de visualização
  - [x] 4.1 Adicionar botões de alternância Grid/Tabela
    - Reutilizar componentes de botão da página Viagens
    - Implementar estado viewMode compartilhado entre abas
    - Adicionar tooltips explicativos
    - _Requirements: 5.1, 5.4, 7.3_

  - [x] 4.2 Implementar visualização em tabela
    - Criar estrutura de Table para jogos futuros e passados
    - Definir colunas: Data, Adversário, Local, Total Ingressos, Receita, Status
    - Manter agrupamento por mês na visualização tabela para jogos passados
    - _Requirements: 5.2, 6.1_

- [x] 5. Implementar funcionalidade de busca cross-tab
  - Adaptar lógica de busca existente para funcionar em ambas as abas
  - Manter filtro de busca independente da aba selecionada
  - Desabilitar agrupamento por mês quando há busca ativa
  - _Requirements: 4.1, 4.2, 4.3, 6.3_

- [x] 6. Implementar estados vazios e loading
  - [x] 6.1 Criar estados vazios específicos para cada aba
    - Mensagem para jogos futuros vazios com botões de ação
    - Mensagem para jogos passados vazios
    - Mensagem para busca sem resultados por aba
    - _Requirements: 2.2, 7.4_

  - [x] 6.2 Manter estados de loading existentes
    - Preservar loading states durante mudança de abas
    - Aplicar skeleton loading quando necessário
    - _Requirements: 7.4_

- [x] 7. Aplicar estilos e consistência visual
  - Usar mesmos estilos da página Viagens para abas e controles
  - Manter ícones consistentes (Calendar, Archive, List, LayoutGrid)
  - Aplicar mesmo layout de filtros e busca
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 8. Otimizar performance e acessibilidade
  - [x] 8.1 Implementar otimizações de performance
    - Usar useMemo para cálculos de agrupamento e separação
    - Implementar useCallback para funções de filtro
    - _Requirements: Performance considerations_

  - [x] 8.2 Garantir acessibilidade
    - Manter navegação por teclado nas abas
    - Preservar labels ARIA existentes
    - Testar contraste e responsividade
    - _Requirements: Accessibility requirements_

- [x] 9. Testes e validação final
  - [x] 9.1 Testar funcionalidades principais
    - Validar separação correta de jogos por data
    - Testar agrupamento por mês em jogos passados
    - Verificar filtros de período funcionando
    - _Requirements: All requirements_

  - [x] 9.2 Testar integração e estados edge
    - Testar mudança entre abas mantendo estados
    - Validar busca funcionando em ambas abas
    - Testar estados vazios e loading
    - _Requirements: All requirements_