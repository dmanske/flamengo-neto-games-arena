# Implementation Plan - WhatsApp em Massa para Viagens

- [x] 1. Criar estrutura base e hook principal
  - Implementar hook `usePassageirosWhatsApp` com lógica de filtros e geração de listas
  - Criar funções para filtrar passageiros por ônibus e validar telefones
  - Implementar geração de lista de números no formato internacional
  - Implementar geração de arquivo VCF com dados dos passageiros
  - _Requirements: 1.1, 2.1, 4.1, 5.1_

- [x] 2. Criar tabela de histórico no banco de dados
  - Criar migration SQL para tabela `historico_whatsapp_massa`
  - Definir campos: viagem_id, tipo_acao, quantidade_destinatarios, filtro_aplicado, data_acao
  - Criar índices para performance nas consultas por viagem e data
  - Implementar função de registro de histórico no hook
  - _Requirements: 8.1, 8.2, 8.3_

- [x] 3. Implementar componente WhatsAppMassaButton
  - Criar botão na página DetalhesViagem.tsx próximo aos botões existentes
  - Implementar lógica de habilitação baseada em passageiros com telefone
  - Adicionar ícone do WhatsApp e contador de passageiros válidos
  - Implementar tooltip informativo quando desabilitado
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 4. Criar componente FiltroPassageiros
  - Implementar Select com opção "Todos os passageiros" como padrão
  - Adicionar opções para cada ônibus da viagem com identificação clara
  - Implementar atualização automática da contagem ao alterar filtro
  - Adicionar ícones visuais para melhor UX (👥 para todos, 🚌 para ônibus)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

- [x] 5. Implementar componente CampoMensagem
  - Criar Textarea amplo para mensagem personalizada
  - Implementar contador de caracteres com limite de 1000
  - Adicionar placeholder e dica visual para o usuário
  - Implementar validação em tempo real para habilitar/desabilitar ações
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 6. Criar componente PreviewMensagem
  - Implementar preview visual simulando interface do WhatsApp
  - Criar balão de mensagem verde com formatação adequada
  - Adicionar timestamp e indicadores de entrega (✓✓)
  - Implementar atualização em tempo real conforme usuário digita
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 7. Implementar componente EstatisticasPassageiros
  - Criar cards com estatísticas: passageiros com WhatsApp vs sem telefone
  - Implementar alerta quando houver passageiros sem telefone
  - Adicionar atualização automática baseada nos filtros aplicados
  - Implementar design responsivo para diferentes tamanhos de tela
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 8. Criar componente GerarListaContatos
  - Implementar Tabs para alternar entre "Lista de Números" e "Arquivo VCF"
  - Criar funcionalidade de copiar lista de números para clipboard
  - Implementar download de arquivo VCF com nome descritivo
  - Adicionar validações e estados de desabilitado quando necessário
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 9. Implementar componente WhatsAppMassaModal principal
  - Criar modal responsivo com layout em duas colunas
  - Integrar todos os subcomponentes criados anteriormente
  - Implementar gerenciamento de estado local (filtros, mensagem, modo)
  - Adicionar header com título e descrição informativos
  - _Requirements: 1.1, 1.2_

- [x] 10. Integrar funcionalidade na página DetalhesViagem
  - Adicionar botão WhatsAppMassaButton na interface existente
  - Implementar estado do modal e handlers de abertura/fechamento
  - Passar props necessários (viagem, passageiros, ônibus) para o modal
  - Testar integração com dados reais da viagem
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 11. Implementar tratamento de erros e loading states
  - Adicionar estados de loading para operações assíncronas
  - Implementar tratamento de erros na cópia para clipboard
  - Adicionar tratamento de erros no download de arquivo VCF
  - Implementar toasts informativos para feedback do usuário
  - _Requirements: 4.4, 5.6, 8.6_

- [x] 12. Adicionar validações e casos edge
  - Implementar validação de telefones inválidos
  - Tratar casos de passageiros sem nome ou telefone
  - Adicionar validação de mensagem muito longa
  - Implementar fallbacks para situações de erro
  - _Requirements: 4.5, 5.4, 7.4_

- [x] 13. Testar funcionalidade completa
  - Testar fluxo completo: abrir modal → filtrar → digitar → gerar lista
  - Validar formato dos números gerados (+5511999999999)
  - Testar download e conteúdo do arquivo VCF
  - Verificar funcionamento em diferentes tamanhos de tela
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1_

- [x] 14. Otimizar performance e UX
  - Implementar debounce na atualização do preview da mensagem
  - Otimizar re-renders desnecessários com useMemo e useCallback
  - Adicionar animações suaves para transições de estado
  - Implementar lazy loading se necessário para listas grandes
  - _Requirements: 6.3, 7.6_

- [x] 15. Documentar e finalizar
  - Adicionar comentários no código para facilitar manutenção
  - Criar documentação de uso da funcionalidade
  - Verificar acessibilidade dos componentes criados
  - Realizar testes finais com dados de produção
  - _Requirements: 8.1, 8.2, 8.3_