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

## 🔄 TASKS PENDENTES - PRÓXIMOS PASSOS

- [ ] 13. Testes e validação do sistema atual
  - **PRIORIDADE**: ALTA - Validar funcionalidades já implementadas
  - Testar fluxo completo: cadastro viagem → adicionar passageiros → configurar passeios
  - Testar modo rápido vs detalhado para múltiplos passageiros
  - Validar capacidade de ônibus e bloqueios
  - Testar compatibilidade com viagens antigas
  - Verificar correções de português e tela branca
  - _Requirements: 4.2, 6.1, 7.1, 7.2_

- [x] 14. Modernizar tela de detalhes do passageiro (PassageiroDetailsDialog)
  - Atualizar layout e design da tela de detalhes do passageiro
  - Adicionar seção visual para exibir passeios selecionados com valores
  - Implementar cards informativos para melhor organização dos dados
  - Adicionar indicadores visuais para status de pagamento e passeios
  - Integrar com sistema híbrido (viagens antigas vs novas)
  - _Requirements: 2.1, 4.1, 7.1_

- [x] 15. Implementar sistema avançado de pagamento com passeios
  - **SISTEMA UNIFICADO COM 3 CENÁRIOS DE PAGAMENTO:**
  
  **15.1 Estrutura Base do Sistema**
  - Adicionar campo `tipo_pagamento` na tabela viagens ('livre' | 'parcelado_flexivel' | 'parcelado_obrigatorio')
  - Criar interfaces TypeScript para cada cenário de pagamento
  - Implementar sistema de controle financeiro adaptativo por tipo de viagem
  - Separar receitas: valor base (transporte + ingresso) vs passeios pagos à parte
  - _Requirements: 4.2, 5.2_
  
  **15.2 Cenário 1: Pagamento Livre (Saldo Devedor)**
  - Implementar controle por saldo devedor (sem datas fixas)
  - Sistema de pagamentos aleatórios com histórico completo
  - Controle de inadimplência por tempo em aberto (30, 60, 90+ dias)
  - Relatório separado "Saldos em Aberto" (NÃO entra no fluxo de caixa projetado)
  - Cliente pode viajar mesmo devendo (controle posterior)
  - _Requirements: 4.2, 6.4_
  
  **15.3 Cenário 2: Parcelamento Flexível**
  - Sistema híbrido: parcelas sugeridas + pagamentos livres aceitos
  - Controle de parcelas pagas + pagamentos extras fora das parcelas
  - Parcelas futuras entram no fluxo de caixa + saldos sem prazo em categoria separada
  - Cliente pode viajar com parcelas pendentes
  - Recálculo automático quando há pagamentos extras
  - _Requirements: 4.2, 5.2, 6.4_
  
  **15.4 Cenário 3: Parcelamento Obrigatório**
  - Parcelas fixas e obrigatórias (não podem ser alteradas após criação)
  - Controle rígido de vencimentos e inadimplência por parcela
  - Todas as parcelas futuras entram no fluxo de caixa projetado
  - Relatórios detalhados de parcelas vencidas vs futuras
  - Sistema de alertas automáticos para parcelas em atraso
  - _Requirements: 4.2, 5.2, 6.4_
  
  **15.5 Sistema Financeiro Unificado**
  - Adaptar relatórios financeiros para cada tipo de viagem
  - Fluxo de caixa inteligente (inclui ou não baseado no tipo)
  - Contas a receber adaptativas (parcelas vs saldos vs ambos)
  - Breakdown de receitas: base vs passeios para todos os cenários
  - Controle de inadimplência específico por tipo de pagamento
  - _Requirements: 4.2, 5.2, 6.4_
  
  **15.6 Interface Adaptativa**
  - Formulário de cadastro de viagem com seleção do tipo de pagamento
  - Telas de controle financeiro que se adaptam ao tipo da viagem
  - Botões contextuais: "Registrar Pagamento Livre" vs "Pagar Parcela"
  - Dashboard financeiro unificado com visão por tipo de viagem
  - _Requirements: 4.2, 6.4_
  
  **NOTAS PARA IMPLEMENTAÇÃO FUTURA:**
  - **Pré-cadastramento de Despesas**: Sistema para cadastrar despesas padrão que podem ser adicionadas às viagens
  - **Pré-cadastramento de Receitas**: Sistema para cadastrar tipos de receita recorrentes
  - **Integração com Cobrança**: Alertas automáticos por WhatsApp/Email baseados no tipo de viagem
  - **Relatórios Avançados**: Análise de rentabilidade por tipo de pagamento e comportamento do cliente

- [x] 16. Correção e atualização de funcionalidades após sistema avançado de pagamento
  - **PROBLEMA IDENTIFICADO**: Após implementação do sistema avançado, algumas funcionalidades pararam de funcionar
  
  **16.1 Página de Edição de Viagem** ✅ **CONCLUÍDO**
  - ✅ Página EditarViagem.tsx carregando novos campos de tipo de pagamento
  - ✅ Formulário de edição incluindo TipoPagamentoSection
  - ✅ Passeios exibidos corretamente na edição
  - ✅ Salvamento dos novos campos funcionando (tipo_pagamento, exige_pagamento_completo, etc.)
  - ✅ Sistema de compatibilidade com viagens antigas (fallback para 'livre')
  - _Requirements: 4.2, 7.1_
  
  **16.2 Lista de Passageiros e Edição** ✅ **CONCLUÍDO + MODERNIZADO**
  - ✅ PassageiroEditDialog funcionando com sistema de banco de dados
  - ✅ Seleção de passeios corrigida (novo componente PasseiosEditSection)
  - ✅ **MODERNIZAÇÃO COMPLETA**: Interface redesenhada com gradientes e animações
  - ✅ **PASSEIOS ESPECÍFICOS**: Carrega apenas passeios da viagem atual
  - ✅ **UX MELHORADA**: Cards interativos, badges coloridos, resumo detalhado
  - ✅ **ESTADOS VISUAIS**: Loading, erro, vazio com feedback claro
  - ✅ Cálculos de valor total (base + passeios) funcionando na edição
  - ✅ Compatibilidade com sistema híbrido garantida
  - _Requirements: 4.1, 4.4, 7.1_
  
  **16.3 Página de Viagens (Lista)** ✅ **CONCLUÍDO**
  - ✅ Lista de viagens carregando passeios do banco de dados
  - ✅ Exibição de tipo de pagamento nos cards (Livre, Flexível, Obrigatório)
  - ✅ Passeios exibidos com valores e categorias (pagos vs gratuitos)
  - ✅ Interface atualizada no CleanViagemCard
  - ✅ Query otimizada para carregar relacionamentos
  - _Requirements: 6.1, 7.1_

  **16.3.1 Página de Detalhes da Viagem** ✅ **CONCLUÍDO**
  - ✅ Hook useViagemDetails carregando novos campos e passeios
  - ✅ Interface Viagem atualizada com campos do sistema avançado
  - ✅ ModernViagemDetailsLayout exibindo tipo de pagamento
  - ✅ Card dedicado para tipo de pagamento com badges e informações
  - ✅ Query otimizada para carregar viagem_passeios com relacionamentos
  - ✅ Compatibilidade com viagens antigas (fallback para 'livre')
  - _Requirements: 6.1, 7.1_
  
  **16.4 Sistema de Compatibilidade**
  - Revisar função de detecção automática (viagem nova vs antiga)
  - Corrigir renderização condicional de componentes
  - Garantir que viagens antigas continuem funcionando
  - Testar migração suave de viagens existentes
  - _Requirements: 7.1, 7.2, 7.3_
  
  **16.5 Hooks e Integrações**
  - Verificar se useViagemDetails está carregando novos campos
  - Atualizar usePasseios para trabalhar com sistema unificado
  - Corrigir integrações com sistema financeiro
  - Testar performance e loading states
  - _Requirements: 4.2, 5.2_
  
  **16.6 Sistema Financeiro da Viagem**
  - Verificar se FinanceiroViagem.tsx está funcionando com novos tipos de pagamento
  - Atualizar cálculos de receita para considerar breakdown (base vs passeios)
  - Corrigir integração com useViagemFinanceiro para novos cenários
  - Adaptar relatórios financeiros por tipo de pagamento (livre, flexível, obrigatório)
  - Testar fluxo de caixa inteligente (inclui ou não baseado no tipo)
  - Verificar contas a receber adaptativas (parcelas vs saldos vs ambos)
  - _Requirements: 4.2, 5.2, 6.4_
  
  **16.7 Testes de Fluxo Completo**
  - Testar: Cadastrar viagem → Adicionar passageiros → Editar → Pagamentos → Financeiro
  - Validar: Cada tipo de pagamento funciona corretamente
  - Verificar: Relatórios e filtros estão atualizados
  - Confirmar: Sistema híbrido funciona sem quebras
  - Testar: Integração completa entre todos os módulos financeiros
  - _Requirements: 4.2, 6.1, 7.1, 7.2_

- [x] 17. Implementar hook otimizado para passeios específicos de viagem ✅ **CONCLUÍDO**
  - **PROBLEMA IDENTIFICADO**: PassageiroDialog usava PasseiosSelectionSection com usePasseios() que carrega TODOS os passeios do sistema
  - **SOLUÇÃO IMPLEMENTADA**: Substituído por PasseiosViagemSection que carrega apenas passeios da viagem específica
  
  **17.1 Correção do componente PassageiroDialog** ✅
  - ✅ Substituído import de PasseiosSelectionSection por PasseiosViagemSection
  - ✅ Adicionado prop viagemId para o componente de passeios
  - ✅ Removido hook usePasseios() desnecessário
  - ✅ Implementado função local calcularTotal() com dados específicos da viagem
  - ✅ Adicionado useEffect para carregar passeios da viagem para cálculos
  - _Requirements: 8.1, 8.2_
  
  **17.2 Componentes já otimizados confirmados** ✅
  - ✅ PassageiroEditDialog/PasseiosEditSection.tsx - JÁ ESTAVA CORRETO
  - ✅ PassageiroDialog/PasseiosViagemSection.tsx - JÁ ESTAVA CORRETO
  - ✅ Ambos usam query otimizada: `viagem_passeios` JOIN `passeios` WHERE `viagem_id`
  - ✅ Interface moderna com loading, erro e estados vazios
  - _Requirements: 8.1, 8.3, 8.4_
  
  **17.3 Performance otimizada** ✅
  - ✅ Query específica por viagem (não carrega todos os passeios)
  - ✅ JOIN otimizado entre viagem_passeios e passeios
  - ✅ Cache automático do Supabase por query
  - ✅ Estados de loading e erro implementados
  - _Requirements: 8.1, 8.3_
  
  **17.4 Compatibilidade mantida** ✅
  - ✅ Sistema funciona com viagens novas (com viagem_passeios)
  - ✅ Fallback para viagens antigas (exibe "nenhum passeio disponível")
  - ✅ Detecção automática baseada na existência de relacionamentos
  - ✅ Interface consistente em ambos os cenários
  - _Requirements: 8.1, 8.4_

- [x] 18. Implementar seleção flexível de passeios para passageiros múltiplos ✅ **CONCLUÍDO**
  - **FUNCIONALIDADE**: Sistema adaptativo para múltiplos passageiros com validação de capacidade
  - **CENÁRIO A**: Adicionar rápido (sem passeios) → Editar individualmente depois
  - **CENÁRIO B**: Configurar passeios iguais para todos os passageiros selecionados

  **18.1 Interface adaptativa implementada** ✅ **CONCLUÍDO**
  - ✅ **DETECÇÃO AUTOMÁTICA**: Sistema detecta múltiplos clientes selecionados
  - ✅ **INTERFACE SIMPLES**: Barra compacta com botões "Depois" vs "Todos"
  - ✅ **MODO RÁPIDO**: Adiciona passageiros sem passeios (configurar depois)
  - ✅ **MODO DETALHADO**: Aplica mesmos passeios a todos os selecionados
  - ✅ **FEEDBACK VISUAL**: Mensagens claras sobre cada modo
  - ✅ **RESUMO ADAPTATIVO**: Cálculos diferentes por modo
  - _Requirements: 4.1, 4.2_

  **18.2 Validação de capacidade do ônibus** ✅ **CONCLUÍDO**
  - ✅ **MONITORAMENTO AUTOMÁTICO**: Carrega capacidade quando ônibus é selecionado
  - ✅ **INDICADOR VISUAL**: Barra de progresso com cores (verde/amarelo/vermelho)
  - ✅ **VALIDAÇÃO PREVENTIVA**: Bloqueia seleção que excede capacidade
  - ✅ **ALERTA CLARO**: Mostra quantos passageiros remover quando excede
  - ✅ **BOTÃO INTELIGENTE**: Desabilita e muda texto para "Capacidade Excedida"
  - ✅ **CÁLCULO PRECISO**: Considera capacidade base + lugares extras
  - _Requirements: 4.1, 4.2_

  **18.3 Lógica de salvamento otimizada** ✅ **CONCLUÍDO**
  - ✅ **SALVAMENTO CONDICIONAL**: Modo rápido não salva passeios
  - ✅ **SALVAMENTO DETALHADO**: Aplica mesmos passeios a todos
  - ✅ **RELACIONAMENTOS**: Cria registros em passageiro_passeios
  - ✅ **MENSAGENS ADAPTATIVAS**: Feedback diferente por modo
  - ✅ **TRATAMENTO DE ERROS**: Logs detalhados para debug
  - _Requirements: 4.4, 8.1_

  **18.4 Correção de bugs críticos** ✅ **CONCLUÍDO**
  - ✅ **TELA BRANCA**: Corrigido erro do bucket client-photos no Supabase
  - ✅ **PORTUGUÊS**: Corrigidos erros de plural (disponível → disponíveis)
  - ✅ **VALIDAÇÕES**: Adicionadas verificações de segurança
  - ✅ **PERFORMANCE**: Otimizadas queries de capacidade
  - _Requirements: 8.1, 8.3_
  - ✅ **MODO DETALHADO**: Aplica mesmos passeios a todos os passageiros selecionados
  - ✅ **FEEDBACK VISUAL**: Mensagens claras sobre o que cada modo faz
  - ✅ **RESUMO COMPACTO**: Cálculo total simplificado e claro
  - ✅ **UX MELHORADA**: Interface menos confusa e mais intuitiva
  - _Requirements: 4.1, 4.2_
  
  **18.2 Implementar lógica flexível de passeios**
  - **FLUXO RÁPIDO**: Salvar passageiros sem passeios (para editar depois)
  - **FLUXO DETALHADO**: Estado `{ [clienteId]: passeioIds[] }` para configuração individual
  - Cálculos adaptativos: total por passageiro ou total geral
  - Manter compatibilidade com cliente único (comportamento atual)
  - _Requirements: 4.2, 4.4_
  
  **18.3 Atualizar salvamento no banco**
  - Modificar lógica de inserção para salvar passeios específicos por passageiro
  - Garantir que cada passageiro tenha seus próprios relacionamentos em passageiro_passeios
  - Implementar transação para garantir consistência dos dados
  - Adicionar logs detalhados para debug
  - _Requirements: 4.4, 8.1_
  
  **18.4 Melhorar UX para ambos os fluxos**
  - **FLUXO RÁPIDO**: Interface limpa focada em ônibus + botão "Configurar passeios depois"
  - **FLUXO DETALHADO**: Resumo por passageiro + botões "Aplicar a todos"
  - Indicadores visuais de quem tem/não tem passeios configurados
  - Layout otimizado para múltiplos passageiros (scroll, collapse)
  - _Requirements: 4.1, 6.1_
  
  **18.5 Testes e validação**
  - Testar cenários: 1 passageiro, 2 passageiros, 5+ passageiros
  - Validar cálculos de valores individuais e totais
  - Testar salvamento e carregamento dos relacionamentos
  - Verificar performance com muitos passageiros selecionados
  - _Requirements: 4.2, 8.1_

- [ ] 14. Integração financeira - Fase 1: Análise e Planejamento
  - **PRIORIDADE**: MÉDIA - Depende dos testes da Task 13
  - **OBJETIVO**: Entender como integrar valores de passeios no sistema financeiro atual
  
  **14.1 Mapeamento do sistema financeiro atual** 
  - Identificar todos os componentes que calculam valores (hooks, componentes, queries)
  - Mapear onde valores de passeios devem ser incluídos
  - Analisar impacto nos status de pagamento existentes
  - Documentar fluxo atual vs fluxo desejado
  - _Requirements: 4.2, 5.2_
  
  **14.2 Definir estratégia de integração**
  - **DISCUSSÃO NECESSÁRIA**: Como separar receita base vs passeios?
  - **DISCUSSÃO NECESSÁRIA**: Quais status de pagamento ter (Base Pago, Passeios Pendentes, etc.)?
  - **DISCUSSÃO NECESSÁRIA**: Como tratar pagamentos parciais?
  - **DISCUSSÃO NECESSÁRIA**: Como integrar com parcelamento avançado?
  - Criar especificação detalhada da integração
  - _Requirements: 4.2, 5.2_

- [ ] 15. Integração financeira - Fase 2: Implementação
  - **PRIORIDADE**: BAIXA - Após definir estratégia na Task 14
  - **DEPENDÊNCIA**: Conclusão da Task 14
  
  **15.1 Atualizar cálculos de receita**
  - Implementar breakdown: receita base + receita passeios = total
  - Atualizar hooks financeiros (useViagemFinanceiro, etc.)
  - Modificar queries para incluir valores de passageiro_passeios
  - _Requirements: 4.2, 5.2_
  
  **15.2 Atualizar status e badges**
  - Implementar nova lógica de status considerando passeios
  - Criar badges específicos para diferentes tipos de pendência
  - Atualizar indicadores visuais em toda a aplicação
  - _Requirements: 4.2, 6.1_
  
  **15.3 Sistema de pagamentos**
  - Permitir pagamentos específicos para passeios
  - Implementar controle de pagamento parcial
  - Atualizar histórico e relatórios financeiros
  - _Requirements: 4.2, 5.2_

- [ ] 16. Documentação e treinamento
  - **PRIORIDADE**: BAIXA - Após conclusão das funcionalidades principais
  - **DEPENDÊNCIA**: Tasks 13, 14 e 15 concluídas
  
  **16.1 Documentação técnica**
  - Documentar diferenças entre viagens antigas e novas
  - Criar guia de uso do novo sistema de passeios
  - Documentar sistema híbrido e compatibilidade
  - Documentar integração financeira (quando implementada)
  - _Requirements: 7.4_
  
  **16.2 Material de treinamento**
  - Preparar material de treinamento para usuários finais
  - Criar tutoriais para funcionalidades novas
  - Documentar processo de migração (se necessário)
  - Preparar FAQ sobre o novo sistema
  - _Requirements: 7.4_

## 📋 RESUMO DAS PRIORIDADES

### 🔥 **ALTA PRIORIDADE - FAZER AGORA**
- **Task 13**: Testes e validação do sistema atual
  - Validar tudo que foi implementado até agora
  - Identificar bugs e problemas pendentes
  - Garantir que funcionalidades básicas estão funcionando

### 🟡 **MÉDIA PRIORIDADE - PRÓXIMO PASSO**  
- **Task 14**: Análise e planejamento da integração financeira
  - Entender como integrar passeios no sistema financeiro
  - Definir estratégia através de discussões
  - Criar especificação detalhada

### 🔵 **BAIXA PRIORIDADE - FUTURO**
- **Task 15**: Implementação da integração financeira
- **Task 16**: Documentação e treinamento

## 🎯 **RECOMENDAÇÃO**
**Começar pela Task 13** - Testar tudo que foi implementado para garantir que está funcionando corretamente antes de avançar para a integração financeira.