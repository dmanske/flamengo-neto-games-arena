# Sistema de Perfil do Cliente - Plano de Implementação

## Visão Geral

Este documento define as tarefas de implementação do Sistema de Perfil do Cliente, organizadas em fases incrementais para desenvolvimento eficiente e entrega de valor contínuo.

## Estrutura de Implementação

### FASE 1 - Fundação (2-3 dias)
Implementação da estrutura básica e informações essenciais

### FASE 2 - Histórico e Financeiro (2-3 dias)  
Adição do histórico de viagens e situação financeira

### FASE 3 - Comunicação e Insights (2-3 dias)
Implementação de comunicação e estatísticas avançadas

---

## FASE 1 - FUNDAÇÃO

### 1.1 Estrutura Base e Roteamento

- [ ] 1.1.1 Criar rota `/dashboard/clientes/:id` no App.tsx
  - Adicionar rota dinâmica para detalhes do cliente
  - Configurar parâmetros de URL
  - Implementar redirecionamento para 404 se cliente não existir
  - _Requirements: 1.1, 1.4_

- [ ] 1.1.2 Criar página ClienteDetalhes.tsx
  - Estrutura básica da página com layout responsivo
  - Header com breadcrumb e navegação
  - Container principal para conteúdo
  - Loading states e error handling
  - _Requirements: 1.1, 1.3, 8.3, 8.5_

- [ ] 1.1.3 Implementar navegação clicável na lista de clientes
  - Modificar Clientes.tsx para tornar cards clicáveis
  - Adicionar Link ou navegação programática
  - Manter funcionalidade existente do dropdown
  - _Requirements: 1.1_

### 1.2 Hook Principal de Dados

- [ ] 1.2.1 Criar hook useClienteDetalhes
  - Buscar dados básicos do cliente por ID
  - Implementar loading states
  - Tratamento de erros (cliente não encontrado)
  - Cache básico para performance
  - _Requirements: 1.5, 9.1, 10.5_

- [ ] 1.2.2 Criar tipos TypeScript
  - Interface ClienteDetalhes completa
  - Tipos para cada seção (pessoal, viagens, financeiro)
  - Enums para status e classificações
  - _Requirements: 9.1_

### 1.3 Header do Cliente

- [ ] 1.3.1 Criar componente ClienteHeader
  - Foto do cliente (avatar com fallback)
  - Nome formatado e informações básicas
  - Badges de status (VIP, etc.)
  - Botão de editar e voltar
  - _Requirements: 1.2, 2.5_

- [ ] 1.3.2 Implementar layout responsivo do header
  - Versão mobile compacta
  - Versão desktop expandida
  - Adaptação automática por breakpoint
  - _Requirements: 8.1, 8.2_

### 1.4 Seção de Informações Pessoais

- [ ] 1.4.1 Criar componente InformacoesPessoais
  - Card com dados pessoais básicos
  - Formatação de CPF, telefone e data
  - Links clicáveis para WhatsApp e email
  - _Requirements: 2.1, 2.2, 2.6, 2.7_

- [ ] 1.4.2 Implementar seção de endereço
  - Dados de endereço completo
  - Formatação de CEP
  - Layout organizado e legível
  - _Requirements: 2.2_

- [ ] 1.4.3 Adicionar outras informações
  - Como conheceu a empresa
  - Observações do cliente
  - Data de cadastro formatada
  - _Requirements: 2.3, 2.4_

### 1.5 Sistema de Navegação por Tabs

- [ ] 1.5.1 Criar componente ClienteNavigation
  - Tabs horizontais responsivas
  - Estado ativo visual
  - Navegação por clique
  - _Requirements: 8.3_

- [ ] 1.5.2 Implementar roteamento interno
  - URLs com hash para cada seção
  - Navegação direta por URL
  - Estado persistente da tab ativa
  - _Requirements: 8.3_

### 1.6 Ações Rápidas Básicas

- [ ] 1.6.1 Criar componente AcoesRapidas
  - Botões para WhatsApp, email e telefone
  - Integração com WhatsApp Web
  - Abertura de cliente de email
  - _Requirements: 7.1, 7.4_

- [ ] 1.6.2 Implementar ações de comunicação
  - Função para abrir WhatsApp com número preenchido
  - Função para abrir email com destinatário
  - Tratamento de erros de integração
  - _Requirements: 7.4_

---

## FASE 2 - HISTÓRICO E FINANCEIRO

### 2.1 Histórico de Viagens

- [ ] 2.1.1 Criar hook useClienteViagens
  - Buscar viagens do cliente com JOIN
  - Calcular estatísticas básicas
  - Ordenação cronológica
  - _Requirements: 3.1, 9.2_

- [ ] 2.1.2 Criar componente HistoricoViagens
  - Lista de viagens com dados formatados
  - Badges coloridos para status
  - Links para detalhes da viagem
  - Contador total de viagens
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_

- [ ] 2.1.3 Implementar resumo de viagens
  - Total de viagens participadas
  - Valor total gasto
  - Viagem mais cara
  - Adversário favorito básico
  - _Requirements: 3.6_

- [ ] 2.1.4 Adicionar estado vazio
  - Mensagem quando não há viagens
  - Sugestão de ação (inscrever em viagem)
  - Design consistente com o sistema
  - _Requirements: 3.4_

### 2.2 Situação Financeira

- [ ] 2.2.1 Criar hook useClienteFinanceiro
  - Buscar parcelas e pagamentos
  - Calcular totais e pendências
  - Identificar status de crédito
  - _Requirements: 4.1, 4.2, 9.3_

- [ ] 2.2.2 Criar componente SituacaoFinanceira
  - Cards com métricas principais
  - Status de crédito visual
  - Cores de alerta para pendências
  - _Requirements: 4.1, 4.2, 4.5_

- [ ] 2.2.3 Implementar lista de parcelas pendentes
  - Parcelas em atraso destacadas
  - Informações de vencimento
  - Botão de cobrança rápida
  - _Requirements: 4.3, 4.5, 4.6_

- [ ] 2.2.4 Adicionar histórico de pagamentos
  - Lista de pagamentos realizados
  - Formas de pagamento
  - Datas e valores
  - _Requirements: 4.4_

### 2.3 Cálculo de Score de Crédito

- [ ] 2.3.1 Implementar algoritmo de score
  - Pontualidade de pagamentos (40%)
  - Histórico de relacionamento (30%)
  - Valor médio de compras (20%)
  - Frequência de viagens (10%)
  - _Requirements: 4.2_

- [ ] 2.3.2 Criar classificação visual
  - Bom Pagador (80-100): Verde
  - Atenção (60-79): Amarelo
  - Inadimplente (0-59): Vermelho
  - _Requirements: 4.2, 4.5_

### 2.4 Integração com Sistema de Cobrança

- [ ] 2.4.1 Criar modal de cobrança
  - Templates de mensagem personalizáveis
  - Seleção de parcelas para cobrança
  - Preview da mensagem
  - _Requirements: 4.6, 7.5_

- [ ] 2.4.2 Implementar envio de cobrança
  - Integração com WhatsApp
  - Registro no histórico
  - Feedback visual de sucesso/erro
  - _Requirements: 4.6, 7.5_

---

## FASE 3 - COMUNICAÇÃO E INSIGHTS

### 3.1 Histórico de Comunicação

- [ ] 3.1.1 Criar hook useClienteComunicacao
  - Buscar histórico de cobrança
  - Organizar timeline cronológica
  - Calcular estatísticas de comunicação
  - _Requirements: 5.1, 5.3, 9.4_

- [ ] 3.1.2 Criar componente HistoricoComunicacao
  - Timeline de interações
  - Ícones por tipo de comunicação
  - Resumo de contadores
  - Identificação de preferência
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 3.1.3 Implementar composer de mensagem
  - Modal para nova mensagem
  - Templates pré-definidos
  - Preview antes do envio
  - _Requirements: 5.5_

- [ ] 3.1.4 Adicionar estado vazio
  - Mensagem quando não há comunicação
  - Sugestão de primeira interação
  - _Requirements: 5.6_

### 3.2 Estatísticas e Insights

- [ ] 3.2.1 Criar hook useClienteEstatisticas
  - Calcular tempo de relacionamento
  - Analisar frequência de viagens
  - Identificar padrões sazonais
  - Calcular score de fidelidade
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [ ] 3.2.2 Criar componente EstatisticasInsights
  - Cards com métricas principais
  - Identificação de adversário favorito
  - Análise de sazonalidade
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 3.2.3 Implementar gráfico de atividade
  - Gráfico de barras mensal
  - Visualização de padrões
  - Responsivo e interativo
  - _Requirements: 6.6_

- [ ] 3.2.4 Adicionar sistema de badges
  - Cliente VIP
  - Fiel (muitas viagens)
  - Pontual (sempre paga em dia)
  - Bom Pagador
  - _Requirements: 6.7_

### 3.3 Ações Avançadas

- [ ] 3.3.1 Implementar geração de relatório
  - PDF com dados completos do cliente
  - Formatação profissional
  - Download automático
  - _Requirements: 7.6_

- [ ] 3.3.2 Criar modal de inscrição em viagem
  - Lista de viagens disponíveis
  - Seleção de viagem
  - Aplicação de desconto se VIP
  - _Requirements: 7.7_

- [ ] 3.3.3 Adicionar funcionalidades administrativas
  - Edição rápida de dados
  - Adição de observações
  - Alteração de status
  - _Requirements: 7.3_

### 3.4 Otimizações de Performance

- [ ] 3.4.1 Implementar lazy loading
  - Carregamento progressivo de seções
  - Skeleton loading states
  - Infinite scroll para listas longas
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 3.4.2 Otimizar queries de banco
  - Índices para consultas frequentes
  - Agregações no backend
  - Paginação inteligente
  - _Requirements: 10.4_

- [ ] 3.4.3 Implementar cache avançado
  - Cache local com TTL
  - Invalidação inteligente
  - Prefetch de dados relacionados
  - _Requirements: 10.5, 10.6_

---

## FASE 4 - POLIMENTO E TESTES (Opcional)

### 4.1 Melhorias de UX

- [ ] 4.1.1 Adicionar animações suaves
  - Transições entre tabs
  - Loading animations
  - Hover effects
  - _Requirements: 8.1_

- [ ] 4.1.2 Implementar atalhos de teclado
  - Navegação por tabs (Tab/Shift+Tab)
  - Ações rápidas (Ctrl+W para WhatsApp)
  - Acessibilidade completa
  - _Requirements: 8.4_

### 4.2 Funcionalidades Avançadas

- [ ] 4.2.1 Sistema de notas
  - Adicionar notas privadas sobre cliente
  - Histórico de notas
  - Busca em notas
  - _Requirements: Futuro_

- [ ] 4.2.2 Upload de documentos
  - Anexar documentos ao perfil
  - Visualização de PDFs
  - Organização por categoria
  - _Requirements: Futuro_

### 4.3 Testes e Qualidade

- [ ] 4.3.1 Testes unitários
  - Hooks de dados
  - Componentes principais
  - Funções de cálculo
  - _Requirements: Qualidade_

- [ ] 4.3.2 Testes de integração
  - Fluxo completo de navegação
  - Integração com APIs
  - Responsividade
  - _Requirements: Qualidade_

- [ ] 4.3.3 Testes de performance
  - Lighthouse audit
  - Tempo de carregamento
  - Uso de memória
  - _Requirements: 10.1_

---

## Dependências e Pré-requisitos

### Banco de Dados
- ✅ Tabela `clientes` existente
- ✅ Tabela `viagens` existente  
- ✅ Tabela `viagem_passageiros` existente
- ✅ Tabela `viagem_passageiros_parcelas` existente
- ✅ Tabela `viagem_cobranca_historico` existente

### Componentes Existentes
- ✅ Sistema de autenticação
- ✅ Layout principal (MainLayout)
- ✅ Componentes UI básicos
- ✅ Formatadores de dados
- ✅ Integração WhatsApp

### Bibliotecas Necessárias
- [ ] React Router (navegação)
- [ ] Date-fns (formatação de datas)
- [ ] Recharts (gráficos simples)
- [ ] jsPDF (geração de PDF)
- [ ] React Query (cache de dados)

---

## Critérios de Aceitação por Fase

### FASE 1 ✅
- [ ] Cliente pode clicar na lista e ver página de detalhes
- [ ] Informações pessoais completas são exibidas
- [ ] Layout responsivo funciona em mobile e desktop
- [ ] Navegação por tabs está funcional
- [ ] Ações básicas (WhatsApp, email) funcionam

### FASE 2 ✅
- [ ] Histórico de viagens é exibido corretamente
- [ ] Situação financeira mostra dados reais
- [ ] Score de crédito é calculado automaticamente
- [ ] Parcelas pendentes são destacadas
- [ ] Sistema de cobrança está integrado

### FASE 3 ✅
- [ ] Timeline de comunicação está completa
- [ ] Estatísticas e insights são precisos
- [ ] Gráficos são responsivos e informativos
- [ ] Sistema de badges funciona
- [ ] Relatório PDF é gerado corretamente

---

## Estimativas de Tempo

| Fase | Tarefas | Tempo Estimado | Complexidade |
|------|---------|----------------|--------------|
| **Fase 1** | 1.1 - 1.6 | 2-3 dias | Média |
| **Fase 2** | 2.1 - 2.4 | 2-3 dias | Alta |
| **Fase 3** | 3.1 - 3.4 | 2-3 dias | Alta |
| **Fase 4** | 4.1 - 4.3 | 1-2 dias | Baixa |
| **Total** | | **7-11 dias** | |

---

## Próximos Passos

1. **✅ Aprovação da especificação**
2. **🔄 Início da Fase 1**: Estrutura base e informações pessoais
3. **📋 Setup do ambiente**: Instalar dependências necessárias
4. **🚀 Desenvolvimento iterativo**: Uma fase por vez com testes

**Pronto para começar a implementação! 🚀**