# Implementation Plan

- [x] 1. Criar estrutura de banco de dados para passeios com valores
  - Criar migration SQL para tabela `passeios` com campos: id, nome, valor, categoria, ativo, timestamps
  - Criar migration SQL para tabela `viagem_passeios` para relacionamento com valores históricos
  - Executar migrations no Supabase
  - Atualizar tipos TypeScript do Supabase com as novas tabelas
  - _Requirements: 3.1, 3.2_

- [x] 2. Implementar seed de dados iniciais dos passeios
  - Criar script SQL para popular tabela `passeios` com os 24 passeios e seus valores
  - Definir valores específicos: Cristo Redentor (R$ 85), Pão de Açúcar (R$ 120), Museu do Flamengo (R$ 45), etc.
  - Marcar passeios gratuitos com valor 0 e categoria 'gratuito'
  - Executar seed no banco de dados
  - _Requirements: 1.3, 1.4, 5.1_

- [x] 3. Criar tipos TypeScript e interfaces para passeios
  - Definir interface `Passeio` com id, nome, valor, categoria, ativo
  - Definir interface `ViagemPasseio` para relacionamento viagem-passeio
  - Criar tipos para formulários e exibição de dados
  - Atualizar interfaces existentes de viagem para incluir passeios com valores
  - _Requirements: 4.1, 4.4_

- [x] 4. Implementar hook para gerenciamento de passeios
  - Criar hook `usePasseios` para buscar passeios do banco de dados
  - Implementar função `calcularTotal` para somar valores dos passeios selecionados
  - Adicionar cache e otimizações de performance
  - Implementar tratamento de erros e loading states
  - _Requirements: 2.2, 4.2, 5.2_

- [x] 5. Implementar componentes de seleção de passeios com valores
- [x] 5.1 Criar componente PasseiosSection principal
  - Implementar componente container que carrega passeios do banco
  - Adicionar cálculo automático de total de custos adicionais
  - Estruturar layout responsivo para as duas categorias
  - _Requirements: 2.1, 4.1, 4.2_

- [x] 5.2 Criar componente PasseiosPagosSection com valores
  - Implementar seção para passeios pagos com exibição de valores (R$ XX,XX)
  - Adicionar checkboxes interativos que atualizam total automaticamente
  - Implementar ícone de dinheiro e styling diferenciado para passeios pagos
  - Mostrar total parcial dos passeios pagos selecionados
  - _Requirements: 1.3, 2.1, 2.2, 4.2_

- [x] 5.3 Criar componente PasseiosGratuitosSection
  - Implementar seção informativa para passeios gratuitos (valor R$ 0,00)
  - Adicionar lista visual com ícones de check para passeios inclusos
  - Implementar styling diferenciado com cor verde para passeios gratuitos
  - _Requirements: 1.4, 2.3, 4.1_

- [x] 6. Atualizar página de cadastro de viagem
  - Substituir lista antiga de passeios pelo novo componente PasseiosSection
  - Integrar hook usePasseios para carregar dados do banco
  - Implementar salvamento de relacionamentos viagem-passeios com valores
  - Atualizar validação para trabalhar com IDs de passeios
  - _Requirements: 1.1, 1.2, 4.4_

- [x] 7. Atualizar página de edição de viagem
  - Substituir lista antiga pelo novo sistema de passeios com valores
  - Implementar carregamento de passeios previamente selecionados via viagem_passeios
  - Preservar valores históricos dos passeios na edição
  - Permitir adicionar/remover passeios mantendo histórico
  - _Requirements: 4.3, 5.3, 5.4_

- [x] 8. Implementar sistema híbrido de compatibilidade
  - Criar função de detecção automática do tipo de viagem (nova vs antiga)
  - Implementar componentes condicionais para renderização
  - Adicionar fallbacks para viagens sem a nova estrutura
  - Testar compatibilidade com viagens existentes
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 9. Atualizar lista de passageiros com visualização compacta
  - Modificar coluna "Passeios" para formato compacto "🗺️ Nome1, Nome2 (+X)"
  - Implementar truncamento para mais de 2 passeios
  - Adicionar tooltip com lista completa no hover
  - Atualizar coluna "Valor" para mostrar total individual (base + passeios)
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 10. Implementar cadastro de passageiros com seleção de passeios (SIMPLIFICADO)
  - Adicionar seção de seleção de passeios no formulário de cadastro de passageiro
  - Implementar cálculo automático do valor total (base + passeios) apenas para exibição
  - Salvar relacionamentos passageiro-passeios no banco
  - Manter sistema de pagamento atual (sem alterações no parcelamento por enquanto)
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 11. Atualizar componentes de exibição de viagens
  - Atualizar DetalhesViagem.tsx para mostrar passeios com sistema híbrido
  - Modificar componentes de resumo financeiro para incluir receita de passeios
  - Implementar exibição condicional (viagem nova vs antiga)
  - Garantir consistência visual em todo o sistema
  - _Requirements: 2.1, 2.2, 7.1_

- [x] 12. Implementar sistema de filtros para relatórios PDF (DISCUSSÃO NECESSÁRIA)
  - NOTA: Discutir tipos de filtros desejados antes da implementação
  - Adicionar interface de filtros no componente ViagemReport
  - Implementar filtros por: status de pagamento, passeios selecionados, ônibus, setor, etc.
  - Criar opções de personalização do relatório (incluir/excluir seções)
  - Atualizar hook useViagemReport para suportar filtros
  - Implementar preview do relatório com filtros aplicados
  - **MELHORIAS ADICIONAIS:**
    - Filtro rápido "Lista para Responsável do Ônibus" (remove valores financeiros)
    - Filtros de passeios por tipo (Pagos, Gratuitos, Todos)
    - Exibição de nomes dos passeios na lista de passageiros
    - Opção de mostrar/ocultar status de pagamento na lista para responsável
  - Garantir compatibilidade com sistema híbrido (viagens antigas vs novas)
  - _Requirements: 2.1, 6.1, 7.1_

- [ ] 13. Testes e validação final
  - Testar fluxo completo com viagens novas (cadastro → passageiros → valores)
  - Testar compatibilidade com viagens antigas (visualização → edição)
  - Validar cálculos de totais e parcelamento
  - Testar performance e usabilidade
  - Testar sistema de filtros de relatórios
  - _Requirements: 4.2, 6.1, 7.1, 7.2_

- [x] 14. Modernizar tela de detalhes do passageiro (PassageiroDetailsDialog)
  - Atualizar layout e design da tela de detalhes do passageiro
  - Adicionar seção visual para exibir passeios selecionados com valores
  - Implementar cards informativos para melhor organização dos dados
  - Adicionar indicadores visuais para status de pagamento e passeios
  - Integrar com sistema híbrido (viagens antigas vs novas)
  - _Requirements: 2.1, 4.1, 7.1_

- [ ] 15. Implementar sistema avançado de pagamento com passeios (FUTURO - DISCUSSÃO NECESSÁRIA)
  - NOTA: Discutir possibilidades antes da implementação
  - Integração obrigatória com financeiro geral e financeiro da viagem
  - Atualizar parcelamento para considerar valor total (base + passeios)
  - Implementar atualização automática de status de pagamento
  - Criar lógica para recalcular parcelas quando passeios são alterados
  - Implementar relatórios financeiros com breakdown de valores (base vs passeios)
  - Garantir consistência entre todos os módulos financeiros
  - **FILTROS AVANÇADOS PARA IMPLEMENTAÇÃO FUTURA:**
    - Data de pagamento das parcelas
    - Período de criação da viagem
    - Número de parcelas
    - Forma de pagamento (quando implementado)
    - Histórico de alterações de valor
  - _Requirements: 4.2, 5.2, 6.4_

- [ ] 16. Documentação e treinamento
  - Documentar diferenças entre viagens antigas e novas
  - Criar guia de uso do novo sistema de passeios
  - Preparar material de treinamento para usuários
  - Documentar processo de recriação manual de viagens
  - _Requirements: 7.4_