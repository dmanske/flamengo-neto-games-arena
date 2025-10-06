# Requirements Document - Reformular WhatsApp Massa para Usar Apenas Templates do Banco

## Introduction

O sistema atual de WhatsApp em massa na página de detalhes de viagem está usando dois sistemas de templates diferentes: templates rápidos hardcoded e templates personalizados do banco de dados. Precisamos reformular para usar **APENAS** os templates cadastrados no banco de dados (tabela whatsapp_templates), removendo completamente os templates rápidos hardcoded.

## Requirements

### Requirement 1: Remover Templates Rápidos Hardcoded

**User Story:** Como administrador do sistema, eu quero que o WhatsApp em massa use apenas os templates cadastrados no banco de dados, para que eu tenha controle total sobre todos os templates disponíveis.

#### Acceptance Criteria

1. WHEN o usuário abrir o modal de WhatsApp em massa THEN o sistema SHALL mostrar apenas os templates cadastrados no banco de dados
2. WHEN o sistema carregar os templates THEN o sistema SHALL NOT exibir os templates rápidos hardcoded (useTemplatesMensagem)
3. WHEN não houver templates no banco THEN o sistema SHALL exibir uma mensagem informativa sobre como criar templates
4. IF existirem templates no banco THEN o sistema SHALL organizá-los por categoria automaticamente

### Requirement 2: Simplificar Interface de Templates

**User Story:** Como usuário, eu quero uma interface mais limpa e organizada para selecionar templates, para que seja mais fácil encontrar e usar os templates disponíveis.

#### Acceptance Criteria

1. WHEN o usuário visualizar a seção de templates THEN o sistema SHALL mostrar apenas uma seção unificada de templates
2. WHEN existirem templates de diferentes categorias THEN o sistema SHALL agrupá-los por categoria automaticamente
3. WHEN o usuário clicar em um template THEN o sistema SHALL aplicá-lo imediatamente no campo de mensagem
4. WHEN houver muitos templates THEN o sistema SHALL implementar paginação ou busca para facilitar a navegação

### Requirement 3: Manter Funcionalidade de Variáveis

**User Story:** Como usuário, eu quero que todas as variáveis continuem funcionando corretamente, para que eu possa personalizar as mensagens com dados da viagem e passageiros.

#### Acceptance Criteria

1. WHEN um template for aplicado THEN o sistema SHALL substituir as variáveis com os dados corretos da viagem
2. WHEN o usuário visualizar as variáveis disponíveis THEN o sistema SHALL mostrar todas as variáveis suportadas
3. WHEN o usuário clicar em uma variável THEN o sistema SHALL adicioná-la na posição do cursor na mensagem
4. IF um template contiver variáveis não reconhecidas THEN o sistema SHALL mantê-las como estão e exibir um aviso

### Requirement 4: Otimizar Performance

**User Story:** Como usuário, eu quero que o carregamento dos templates seja rápido, para que eu possa usar o sistema de forma eficiente.

#### Acceptance Criteria

1. WHEN o modal for aberto THEN o sistema SHALL carregar os templates em menos de 2 segundos
2. WHEN os templates forem carregados THEN o sistema SHALL implementar cache para evitar recarregamentos desnecessários
3. WHEN houver erro no carregamento THEN o sistema SHALL exibir uma mensagem de erro clara e permitir tentar novamente
4. WHEN o usuário fechar e reabrir o modal THEN o sistema SHALL usar o cache se os dados não expiraram

### Requirement 5: Manter Compatibilidade com Sistema Existente

**User Story:** Como desenvolvedor, eu quero que a reformulação não quebre funcionalidades existentes, para que o sistema continue funcionando corretamente.

#### Acceptance Criteria

1. WHEN a reformulação for implementada THEN todas as funcionalidades de envio em massa SHALL continuar funcionando
2. WHEN o usuário usar o sistema reformulado THEN o comportamento de substituição de variáveis SHALL permanecer idêntico
3. WHEN existirem integrações com outros componentes THEN elas SHALL continuar funcionando sem modificações
4. IF houver dependências externas THEN elas SHALL ser mantidas ou migradas adequadamente

### Requirement 6: Gerenciar Estado Vazio

**User Story:** Como usuário, eu quero orientações claras quando não houver templates cadastrados, para que eu saiba como proceder.

#### Acceptance Criteria

1. WHEN não houver templates cadastrados no banco THEN o sistema SHALL exibir uma mensagem explicativa
2. WHEN a mensagem for exibida THEN ela SHALL incluir um link ou botão para acessar o gerenciador de templates
3. WHEN o usuário for administrador THEN o sistema SHALL oferecer a opção de criar um template rapidamente
4. WHEN houver templates inativos THEN o sistema SHALL NOT exibi-los na lista principal

### Requirement 7: Melhorar Experiência do Usuário

**User Story:** Como usuário, eu quero uma experiência mais intuitiva ao usar templates, para que eu possa trabalhar de forma mais eficiente.

#### Acceptance Criteria

1. WHEN o usuário visualizar um template THEN o sistema SHALL mostrar um preview da mensagem
2. WHEN o template for muito longo THEN o sistema SHALL mostrar apenas as primeiras linhas com opção de expandir
3. WHEN o usuário aplicar um template THEN o sistema SHALL mostrar feedback visual de confirmação
4. WHEN existirem templates favoritos THEN o sistema SHALL destacá-los na interface

### Requirement 8: Implementar Busca e Filtros

**User Story:** Como usuário, eu quero poder buscar e filtrar templates, para que eu possa encontrar rapidamente o template que preciso.

#### Acceptance Criteria

1. WHEN houver mais de 5 templates THEN o sistema SHALL implementar uma funcionalidade de busca
2. WHEN o usuário digitar na busca THEN o sistema SHALL filtrar templates por nome e conteúdo em tempo real
3. WHEN existirem múltiplas categorias THEN o sistema SHALL permitir filtrar por categoria
4. WHEN nenhum template corresponder à busca THEN o sistema SHALL exibir uma mensagem informativa