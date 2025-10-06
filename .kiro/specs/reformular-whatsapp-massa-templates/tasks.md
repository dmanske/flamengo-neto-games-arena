# Implementation Plan - Reformular WhatsApp Massa Templates

## Overview

Este plano implementa a reformulação do sistema de WhatsApp massa para usar exclusivamente templates do banco de dados, removendo os templates hardcoded e criando uma interface unificada com busca e filtros.

## Tasks

- [x] 1. Preparar infraestrutura e validar dados
  - Verificar se todos os templates necessários existem no banco de dados
  - Validar estrutura da tabela whatsapp_templates
  - Criar templates de exemplo se necessário para testes
  - _Requirements: 1.3, 6.1, 6.2_

- [x] 2. Aprimorar hook useWhatsAppTemplates
  - [x] 2.1 Adicionar funcionalidade de agrupamento por categoria
    - Implementar método getTemplatesByCategory()
    - Adicionar contagem de templates por categoria
    - Criar interface TemplateGroup para tipagem
    - _Requirements: 1.4, 2.2_

  - [x] 2.2 Implementar sistema de cache inteligente
    - Adicionar cache com TTL de 5 minutos
    - Implementar refresh automático quando necessário
    - Adicionar estados de cache (loading, fresh, stale, error)
    - _Requirements: 4.1, 4.2, 4.4_

  - [x] 2.3 Adicionar funcionalidade de busca em tempo real
    - Implementar método searchTemplates() com debounce
    - Filtrar por nome e conteúdo da mensagem
    - Adicionar filtro por categoria
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 2.4 Melhorar tratamento de erros
    - Implementar tipos de erro específicos (TemplateErrorType)
    - Adicionar retry com exponential backoff
    - Criar mensagens de erro user-friendly
    - _Requirements: 4.3, 5.3_

- [x] 3. Criar componentes auxiliares
  - [x] 3.1 Criar componente TemplateSearch
    - Implementar campo de busca com debounce
    - Adicionar filtro por categoria (dropdown)
    - Mostrar contador de resultados
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 3.2 Criar componente TemplateCategoryGroup
    - Agrupar templates por categoria com ícones
    - Implementar cards de template com preview
    - Adicionar funcionalidade de expandir/colapsar grupos
    - _Requirements: 2.2, 7.1, 7.2_

  - [x] 3.3 Criar componente TemplatesEmptyState
    - Implementar estado vazio quando não há templates
    - Adicionar link para gerenciador de templates
    - Mostrar mensagem diferente para busca sem resultados
    - _Requirements: 6.1, 6.2, 6.3, 8.4_

- [x] 4. Refatorar componente TemplatesMensagem principal
  - [x] 4.1 Remover dependência do useTemplatesMensagem
    - Remover import do hook de templates hardcoded
    - Remover todas as referências aos templates rápidos
    - Limpar código relacionado aos templates hardcoded
    - _Requirements: 1.1, 1.2, 5.1_

  - [x] 4.2 Implementar interface unificada
    - Substituir seções separadas por uma seção única
    - Integrar componentes de busca e agrupamento
    - Implementar layout responsivo para templates
    - _Requirements: 2.1, 2.2, 7.4_

  - [x] 4.3 Adicionar funcionalidade de preview
    - Mostrar preview da mensagem ao selecionar template
    - Implementar substituição de variáveis em tempo real
    - Adicionar indicador visual de template aplicado
    - _Requirements: 7.1, 7.3, 3.1, 3.2_

  - [x] 4.4 Implementar estados de loading e erro
    - Adicionar skeleton loading para templates
    - Mostrar mensagens de erro apropriadas
    - Implementar botão de retry em caso de erro
    - _Requirements: 4.1, 4.3, 6.4_

- [x] 5. Otimizar performance e UX
  - [x] 5.1 Implementar lazy loading de templates
    - Carregar templates apenas quando modal abre
    - Implementar cache local para evitar recarregamentos
    - Adicionar preloader durante carregamento inicial
    - _Requirements: 4.1, 4.2_

  - [x] 5.2 Adicionar feedback visual melhorado
    - Implementar animações suaves para transições
    - Adicionar indicadores de estado (loading, success, error)
    - Melhorar responsividade da interface
    - _Requirements: 7.3, 7.4_

  - [x] 5.3 Implementar busca com debounce
    - Adicionar delay de 300ms para busca
    - Cancelar requisições anteriores se nova busca iniciada
    - Mostrar indicador de busca em andamento
    - _Requirements: 8.1, 8.2_

- [ ] 6. Atualizar testes e documentação
  - [ ] 6.1 Criar testes unitários para novos componentes
    - Testar TemplateSearch com diferentes cenários
    - Testar TemplateCategoryGroup com agrupamento
    - Testar TemplatesEmptyState com estados vazios
    - _Requirements: 5.2, 5.4_

  - [ ] 6.2 Atualizar testes do TemplatesMensagem
    - Remover testes relacionados a templates hardcoded
    - Adicionar testes para interface unificada
    - Testar integração com useWhatsAppTemplates aprimorado
    - _Requirements: 5.1, 5.2_

  - [ ] 6.3 Criar testes de integração
    - Testar fluxo completo de carregamento de templates
    - Testar busca e filtros funcionando corretamente
    - Testar aplicação de templates com variáveis
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 7. Validação e cleanup final
  - [x] 7.1 Remover código obsoleto
    - Deletar arquivo useTemplatesMensagem.ts se não usado em outros lugares
    - Remover imports e referências não utilizadas
    - Limpar comentários e código comentado
    - _Requirements: 1.2, 5.4_

  - [x] 7.2 Validar funcionalidades existentes
    - Testar que envio em massa continua funcionando
    - Verificar que substituição de variáveis funciona corretamente
    - Confirmar que todas as integrações estão mantidas
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 7.3 Testar cenários edge case
    - Testar com banco de dados vazio
    - Testar com muitos templates (performance)
    - Testar com templates inválidos ou corrompidos
    - _Requirements: 6.4, 4.3, 3.4_

  - [x] 7.4 Documentar mudanças
    - Atualizar documentação técnica
    - Criar guia de migração se necessário
    - Documentar novas funcionalidades para usuários
    - _Requirements: 5.4_