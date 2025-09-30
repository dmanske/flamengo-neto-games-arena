# Implementation Plan

- [x] 1. Criar estrutura de banco de dados para grupos
  - Criar migration para adicionar colunas grupo_nome e grupo_cor na tabela viagem_passageiros
  - Criar índice para otimizar consultas por grupo
  - Testar migration em ambiente de desenvolvimento
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Implementar tipos TypeScript para grupos e trocas
  - Estender interface PassageiroDisplay com campos de grupo
  - Criar interface GrupoPassageiros para agrupamentos
  - Criar interface TrocaOnibusData para dados de troca
  - Adicionar tipos aos hooks existentes
  - _Requirements: 2.1, 1.1, 4.1_

- [x] 3. Criar hook useGruposPassageiros para gerenciar grupos
  - Implementar função para buscar grupos de uma viagem
  - Implementar função para criar novo grupo
  - Implementar função para adicionar passageiro ao grupo
  - Implementar função para remover passageiro do grupo
  - Implementar função para obter cores disponíveis
  - Adicionar tratamento de erros e loading states
  - _Requirements: 2.1, 2.2, 3.1, 3.2_

- [x] 4. Criar hook useTrocaOnibus para gerenciar trocas
  - Implementar função para trocar passageiro entre ônibus
  - Implementar função para verificar capacidade disponível
  - Implementar função para obter lista de ônibus disponíveis
  - Adicionar validação de capacidade antes da troca
  - Adicionar tratamento de erros e loading states
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 5. Implementar componente TrocarOnibusModal
  - Criar modal com dropdown de ônibus disponíveis
  - Exibir capacidade atual e disponível de cada ônibus
  - Desabilitar ônibus lotados no dropdown
  - Implementar validação de capacidade em tempo real
  - Adicionar feedback visual durante operação
  - Integrar com hook useTrocaOnibus
  - _Requirements: 1.1, 1.2, 1.4, 4.3, 4.4_

- [x] 6. Implementar componente GrupoPassageiros
  - Criar cabeçalho com nome do grupo e cor de fundo
  - Listar membros do grupo com indentação visual
  - Integrar ações individuais (editar, excluir, trocar ônibus)
  - Aplicar cor do grupo como destaque visual
  - Implementar ordenação dos membros por nome
  - _Requirements: 2.3, 2.4, 5.2, 5.4, 5.5_

- [x] 7. Implementar componente PassageiroGroupForm
  - Criar campo de texto para nome do grupo
  - Criar seletor de cor com paleta predefinida
  - Implementar dropdown com grupos existentes na viagem
  - Adicionar opção "Criar novo grupo"
  - Implementar validação de nomes únicos
  - Integrar com hook useGruposPassageiros
  - _Requirements: 2.1, 2.2, 4.1_

- [x] 8. Atualizar PassageiroRow para exibir grupos e botão de troca
  - Adicionar badge colorido com nome do grupo ao lado do nome
  - Adicionar botão "Trocar Ônibus" na coluna de ações
  - Integrar com TrocarOnibusModal
  - Aplicar cor de fundo sutil para passageiros agrupados
  - _Requirements: 2.3, 4.1, 4.2_

- [x] 9. Atualizar PassageirosList para agrupar passageiros
  - Modificar renderização para agrupar por grupo_nome
  - Implementar ordenação: grupos primeiro, depois individuais
  - Renderizar componente GrupoPassageiros para cada grupo
  - Renderizar passageiros sem grupo após os grupos
  - Manter funcionalidades existentes de busca e filtros
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 10. Atualizar PassageiroDialog para incluir campo de grupo
  - Integrar componente PassageiroGroupForm no modal de cadastro
  - Implementar lógica para salvar grupo_nome e grupo_cor
  - Adicionar validação de campos de grupo
  - Testar criação de passageiros com e sem grupo
  - _Requirements: 2.1, 4.1_

- [ ] 11. Atualizar PassageiroEditDialog para editar grupos
  - Integrar componente PassageiroGroupForm no modal de edição
  - Carregar dados atuais do grupo do passageiro
  - Implementar lógica para alterar/remover grupo
  - Adicionar opção para limpar grupo (remover do grupo)
  - Testar edição de grupos existentes
  - _Requirements: 2.2, 3.1, 3.2, 3.4_

- [x] 12. Atualizar OnibusCards para mostrar indicadores de grupos
  - Exibir ícones ou badges indicando presença de grupos
  - Mostrar contagem de grupos por ônibus
  - Adicionar tooltip com nomes dos grupos
  - Manter funcionalidades existentes dos cards
  - _Requirements: 4.2, 4.6_

- [x] 13. Implementar validações e tratamento de erros
  - Adicionar validação de capacidade antes de confirmar troca
  - Implementar mensagens de erro específicas para cada cenário
  - Adicionar confirmação para operações críticas
  - Implementar retry automático para falhas de rede
  - Testar cenários de erro e recuperação
  - _Requirements: 1.4, 4.4, 4.5_

- [x] 14. Atualizar hook useViagemDetails para suportar grupos
  - Modificar query para incluir campos de grupo
  - Atualizar função agruparPassageirosPorOnibus para considerar grupos
  - Implementar função para recarregar dados após mudanças
  - Manter compatibilidade com código existente
  - _Requirements: 2.3, 5.1_

- [ ] 15. Implementar testes unitários para novos componentes
  - Criar testes para useGruposPassageiros hook
  - Criar testes para useTrocaOnibus hook
  - Criar testes para TrocarOnibusModal component
  - Criar testes para GrupoPassageiros component
  - Criar testes para PassageiroGroupForm component
  - _Requirements: 1.1, 2.1, 4.1_

- [ ] 16. Testar integração completa e ajustes finais
  - Testar fluxo completo de criação de grupos
  - Testar fluxo completo de troca entre ônibus
  - Verificar performance com muitos passageiros e grupos
  - Ajustar estilos e UX conforme necessário
  - Validar acessibilidade dos novos componentes
  - _Requirements: 1.6, 2.4, 4.2, 4.3, 5.5_

## 🚀 MELHORIAS ADICIONAIS

- [x] 17. Adicionar campo de grupo no modal "Adicionar Passageiro"
  - Integrar PassageiroGroupForm no PassageiroDialog
  - Permitir criar grupos já no primeiro cadastro
  - Adicionar campos grupo_nome e grupo_cor no schema
  - Implementar lógica de salvamento com grupos
  - _Requirements: 2.1, 4.1_

- [x] 18. Corrigir atualização da interface após trocas
  - Melhorar evento 'passageiroTrocado' para atualizar ambos os ônibus
  - Implementar reload completo dos dados após troca
  - Garantir que badges de grupo apareçam imediatamente
  - Atualizar contadores de passageiros em tempo real
  - _Requirements: 1.5, 1.6_

- [x] 19. Implementar sistema de troca inteligente para ônibus lotados
  - Criar TrocarOnibusModalAvancado com seleção múltipla
  - Implementar lógica de validação matemática de trocas
  - Permitir trocas equilibradas (5↔5) e desbalanceadas (5↔4)
  - Suportar trocas múltiplas (5↔3+2, 4↔1+1+1+1)
  - Detectar grupos automaticamente e oferecer opções
  - _Requirements: 1.3, 1.4_

- [x] 20. Implementar lógica de grupos em trocas
  - Oferecer opção "trocar apenas indivíduo" vs "trocar grupo inteiro"
  - Validar espaço disponível para grupos completos
  - Permitir trocas grupo↔grupo de tamanhos diferentes
  - Implementar seleção múltipla para trocas complexas
  - _Requirements: 2.5, 2.6_

- [x] 21. Criar interface de seleção múltipla para trocas
  - Checkboxes para selecionar passageiros individuais
  - Checkboxes para selecionar grupos inteiros
  - Contador em tempo real (selecionados vs necessário)
  - Preview matemático da troca antes de confirmar
  - Validação automática - botão só habilita quando válido
  - _Requirements: 1.4, 4.3, 4.4_

- [x] 22. Implementar validações avançadas de troca
  - Função validarTrocaCompleta() para múltiplas combinações
  - Suporte para trocas: Individual↔Individual, Grupo↔Grupo, Múltiplos↔Múltiplos
  - Permitir criar vagas (trocar 5 por 4) se houver espaço
  - Impedir exceder capacidade máxima dos ônibus
  - Mostrar preview: "Resultado: A=44/45, B=42/45"
  - _Requirements: 1.3, 1.4, 4.4_