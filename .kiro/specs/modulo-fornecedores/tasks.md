# Plano de Implementação - Módulo de Fornecedores

- [x] 1. Configurar estrutura base do módulo
  - Criar tipos TypeScript para fornecedores e templates de mensagens
  - Implementar constantes para tipos de fornecedores e variáveis de sistema
  - Configurar validações Zod para formulários
  - _Requisitos: 1.1, 2.1, 3.1_

- [x] 2. Implementar hooks e utilitários
  - [x] 2.1 Criar hook useFornecedores para operações CRUD
    - Implementar funções de buscar, criar, atualizar e excluir fornecedores
    - Adicionar tratamento de erros específicos do Supabase
    - Incluir funcionalidades de busca e filtros
    - _Requisitos: 1.1, 1.2, 7.1, 8.1_

  - [x] 2.2 Criar hook useMessageTemplates para gerenciar templates
    - Implementar CRUD completo para templates de mensagens
    - Adicionar validação de nome único por tipo de fornecedor
    - Incluir filtros por tipo de fornecedor
    - _Requisitos: 3.1, 3.2_

  - [x] 2.3 Implementar utilitários de processamento de mensagens
    - Criar função para substituir variáveis em templates
    - Implementar busca de dados de viagem para preenchimento automático
    - Adicionar formatação de mensagens para WhatsApp e Email
    - _Requisitos: 4.1, 4.2, 4.3_

- [x] 3. Criar componentes base de formulários
  - [x] 3.1 Implementar FornecedorForm component
    - Criar formulário reutilizável com todos os campos necessários
    - Implementar validação em tempo real com Zod
    - Adicionar seletor de tipo de fornecedor com cores diferenciadas
    - _Requisitos: 1.2, 1.3, 2.1_

  - [x] 3.2 Criar MessageTemplateForm component
    - Implementar formulário para criação/edição de templates
    - Adicionar editor de texto com suporte a variáveis
    - Incluir lista de variáveis disponíveis como referência
    - _Requisitos: 3.2, 3.3_

- [x] 4. Desenvolver componentes de listagem e cards
  - [x] 4.1 Implementar FornecedorCard component
    - Criar card seguindo padrão visual dos clientes
    - Adicionar avatar com iniciais e cor baseada no tipo
    - Incluir badges para tipo, email e informações de contato
    - Implementar dropdown de ações (editar, excluir, enviar mensagem)
    - _Requisitos: 1.1, 2.2, 7.1_

  - [x] 4.2 Criar componentes de filtros e busca
    - Implementar FiltroTipoFornecedor component
    - Adicionar barra de busca com funcionalidade em tempo real
    - Incluir filtros por status ativo/inativo
    - _Requisitos: 8.1, 8.2, 8.3_

- [x] 5. Implementar páginas principais
  - [x] 5.1 Criar página Fornecedores.tsx (listagem principal)
    - Implementar layout idêntico à página de clientes
    - Adicionar header com contador e botão "Novo Fornecedor"
    - Incluir sistema de paginação (30 itens por página)
    - Implementar busca e filtros integrados
    - _Requisitos: 1.1, 2.2, 8.1, 8.4_

  - [x] 5.2 Desenvolver CadastrarFornecedor.tsx
    - Criar página de cadastro usando FornecedorForm
    - Implementar navegação de retorno e mensagens de sucesso
    - Adicionar validação completa antes do envio
    - _Requisitos: 1.2, 1.3, 1.4, 1.5_

  - [x] 5.3 Implementar EditarFornecedor.tsx
    - Criar página de edição com dados pré-carregados
    - Implementar atualização de dados com confirmação
    - Adicionar opção de exclusão com dialog de confirmação
    - _Requisitos: 7.1, 7.2, 7.3, 7.4_

- [ ] 6. Desenvolver sistema de templates de mensagens
  - [ ] 6.1 Criar página TemplatesMensagens.tsx
    - Implementar listagem de templates com filtros por tipo
    - Adicionar funcionalidades de criar, editar e excluir templates
    - Incluir prévia de templates com variáveis de exemplo
    - _Requisitos: 3.1, 3.2, 3.3, 3.4_

  - [ ] 6.2 Implementar MessagePreview component
    - Criar componente para exibir prévia de mensagens
    - Mostrar variáveis substituídas com dados reais da viagem
    - Incluir formatação adequada para WhatsApp e Email
    - _Requisitos: 4.2, 4.3_

- [ ] 7. Criar sistema de comunicação
  - [ ] 7.1 Implementar ComunicacaoDialog component
    - Criar dialog para seleção de viagem e template
    - Implementar prévia da mensagem com dados preenchidos
    - Adicionar opção de edição manual da mensagem
    - Incluir botões de confirmação antes do envio
    - _Requisitos: 4.1, 4.2, 4.3, 4.4, 5.4, 6.4_

  - [ ] 7.2 Desenvolver integração com apps externos
    - Implementar função para abrir WhatsApp com mensagem preenchida
    - Criar função para abrir cliente de email padrão
    - Adicionar validação de dados de contato antes do envio
    - _Requisitos: 5.1, 5.2, 5.3, 6.1, 6.2, 6.3_

- [ ] 8. Implementar página de detalhes do fornecedor
  - Criar FornecedorDetalhes.tsx com informações completas
  - Adicionar histórico de comunicações (se implementado futuramente)
  - Incluir botões de ação rápida (editar, enviar mensagem)
  - Implementar navegação breadcrumb
  - _Requisitos: 7.1, 7.2_

- [x] 9. Integrar com navegação e menu principal
  - Adicionar item "Fornecedores" no menu de navegação
  - Configurar rotas no sistema de roteamento
  - Implementar breadcrumbs e navegação contextual
  - Adicionar links relacionados entre módulos
  - _Requisitos: 1.1_

- [ ] 10. Implementar testes unitários essenciais
  - Criar testes para hooks useFornecedores e useMessageTemplates
  - Implementar testes de validação de formulários
  - Adicionar testes para substituição de variáveis em templates
  - Testar integração com funções de comunicação externa
  - _Requisitos: Todos os requisitos de validação_

- [ ] 11. Configurar banco de dados e migrações
  - Executar scripts SQL para criação das tabelas
  - Configurar políticas RLS no Supabase
  - Criar índices para otimização de performance
  - Implementar triggers para updated_at automático
  - _Requisitos: Todos os requisitos de persistência_

- [ ] 12. Realizar testes de integração e ajustes finais
  - Testar fluxo completo de cadastro e uso de fornecedores
  - Validar integração com dados de viagens existentes
  - Verificar responsividade e acessibilidade
  - Ajustar estilos e comportamentos conforme necessário
  - _Requisitos: Todos os requisitos funcionais_