# Implementation Plan - Templates de WhatsApp

## Task Overview

Implementar sistema completo de templates de WhatsApp com seleção múltipla, mantendo o fluxo atual de envio por viagem/ônibus/passageiro.

- [x] 1. Configurar estrutura do banco de dados
  - Criar tabela whatsapp_templates
  - Configurar índices para performance
  - Inserir templates iniciais de exemplo
  - _Requirements: 1.1, 5.1, 7.1_

- [x] 2. Criar tipos e interfaces TypeScript
  - Definir interface WhatsAppTemplate
  - Criar tipos para SelectedTemplate e VariableMapping
  - Configurar enums para categorias
  - _Requirements: 1.2, 5.2, 7.2_

- [x] 3. Implementar hook useWhatsAppTemplates
  - Funções CRUD para templates (criar, listar, editar, excluir)
  - Sistema de cache para performance
  - Tratamento de erros e loading states
  - _Requirements: 1.3, 1.4, 1.5_

- [x] 4. Criar página de gerenciamento de templates
  - Componente TemplatesWhatsApp.tsx
  - Lista de templates com filtros por categoria
  - Busca por nome
  - Botões de ação (criar, editar, excluir)
  - _Requirements: 1.1, 5.1, 5.3_

- [x] 5. Implementar formulário de templates
  - Componente TemplateForm.tsx
  - Campos: nome, categoria, mensagem
  - Detector automático de variáveis na mensagem
  - Validação de campos obrigatórios
  - _Requirements: 1.2, 1.3, 7.8_

- [x] 6. Criar sistema de preview de templates
  - Componente TemplatePreview.tsx
  - Substituição automática de variáveis
  - Preview com dados simulados ou reais
  - Highlight de variáveis substituídas
  - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [x] 7. Implementar seletor múltiplo de templates
  - Componente TemplateSelector.tsx
  - Lista de templates com checkboxes
  - Seleção múltipla
  - Preview automático por template selecionado
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 8. Criar sistema de substituição de variáveis
  - Função processTemplate() para substituir variáveis
  - Mapeamento de dados da viagem para variáveis
  - Fallback para variáveis não encontradas
  - Formatação automática de datas e valores
  - _Requirements: 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.9_

- [x] 9. Integrar com WhatsApp em massa existente
  - Modificar componente atual de WhatsApp em massa
  - Adicionar seleção de templates antes da mensagem manual
  - Manter funcionalidade atual de seleção de passageiros
  - Preservar fluxo de envio existente
  - _Requirements: 2.5, 4.1, 4.2, 4.3_

- [x] 10. Implementar edição inline de mensagens
  - Permitir editar cada template selecionado
  - Manter alterações até o envio
  - Reset para template original se cancelar
  - Validação antes do envio
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 11. Criar sistema de envio múltiplo
  - Enviar cada template selecionado para cada passageiro
  - Processamento em lote com controle de rate limiting
  - Tratamento de erros por mensagem individual
  - Log de sucessos e falhas
  - _Requirements: 4.4, 4.5_

- [x] 12. Implementar categorização e filtros
  - Sistema de categorias (confirmacao, grupo, lembrete, etc.)
  - Filtros na página de gerenciamento
  - Agrupamento por categoria no seletor
  - Sugestões de variáveis por categoria
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 13. Adicionar validações e tratamento de erros
  - Validação de templates (campos obrigatórios, tamanho)
  - Sanitização de mensagens
  - Tratamento de falhas de envio
  - Mensagens de erro amigáveis
  - _Requirements: 1.5, 1.6_

- [x] 14. Criar templates iniciais padrão
  - Template de confirmação de viagem
  - Template de link do grupo
  - Template de lembrete de embarque
  - Template de cobrança pendente
  - _Requirements: 7.1_

- [x] 15. Implementar sistema de backup e recuperação
  - Backup automático de templates
  - Versionamento de alterações
  - Recuperação de templates excluídos
  - Auditoria de mudanças
  - _Requirements: 1.7_

- [x] 16. Adicionar testes unitários e integração
  - Testes para substituição de variáveis
  - Testes de CRUD de templates
  - Testes de integração com WhatsApp
  - Testes de fluxo completo
  - _Requirements: Todos_

- [x] 17. Otimizar performance e UX
  - Cache de templates frequentes
  - Lazy loading de componentes
  - Debounce em preview
  - Loading states e feedback visual
  - _Requirements: 6.3_

- [x] 18. Documentar funcionalidades
  - Documentação de uso para usuários
  - Guia de criação de templates
  - Lista de variáveis disponíveis
  - Exemplos de templates por categoria
  - _Requirements: Todos_

## Notas de Implementação

### Prioridade Alta (MVP)
- Tasks 1-11: Funcionalidade core completa
- Permite criar, gerenciar e usar templates básicos
- Integração com fluxo atual mantida

### Prioridade Média (Melhorias)
- Tasks 12-15: Funcionalidades avançadas
- Categorização, validações, backup
- Melhora experiência do usuário

### Prioridade Baixa (Polimento)
- Tasks 16-18: Testes, performance, documentação
- Garantia de qualidade e manutenibilidade

### Variáveis Disponíveis Iniciais
- `{NOME}` - Nome do passageiro
- `{DESTINO}` - Destino da viagem
- `{DATA}` - Data da viagem (formatada)
- `{HORARIO}` - Horário de saída
- `{LOCAL_SAIDA}` - Local de embarque
- `{ONIBUS}` - Número/nome do ônibus
- `{LINK_GRUPO}` - Link do grupo WhatsApp (editável)
- `{VALOR}` - Valor da viagem (formatado)
- `{TELEFONE}` - Telefone de contato

### Categorias Iniciais
- **confirmacao** - Templates de confirmação de viagem
- **grupo** - Templates com links de grupos
- **lembrete** - Templates de lembrete e avisos
- **cobranca** - Templates para cobrança de pendências
- **promocional** - Templates promocionais e ofertas
- **outros** - Templates diversos