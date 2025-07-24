# Sistema de Perfil do Cliente - Especificação de Requisitos

## Introdução

O Sistema de Perfil do Cliente é uma funcionalidade completa que permite visualizar informações detalhadas de cada cliente quando clicado na lista de clientes. O sistema oferece uma visão 360° do cliente, incluindo dados pessoais, histórico de viagens, situação financeira, comunicação e insights inteligentes.

## Requisitos

### Requirement 1: Página de Detalhes do Cliente

**User Story:** Como administrador, eu quero clicar em um cliente na lista e ver uma página completa com todas as informações dele, para que eu possa ter uma visão completa do relacionamento comercial.

#### Acceptance Criteria

1. WHEN o usuário clica em um cliente na lista THEN o sistema SHALL navegar para `/dashboard/clientes/:id`
2. WHEN a página carrega THEN o sistema SHALL exibir um header com foto, nome e informações básicas do cliente
3. WHEN a página carrega THEN o sistema SHALL organizar as informações em seções claramente definidas
4. IF o cliente não existir THEN o sistema SHALL exibir uma mensagem de erro 404
5. WHEN o usuário acessa a página THEN o sistema SHALL carregar os dados em tempo real do banco de dados

### Requirement 2: Seção de Informações Pessoais

**User Story:** Como administrador, eu quero ver todos os dados pessoais do cliente organizados de forma clara, para que eu possa ter acesso rápido às informações de contato e pessoais.

#### Acceptance Criteria

1. WHEN a seção carrega THEN o sistema SHALL exibir nome completo, CPF, telefone e email
2. WHEN a seção carrega THEN o sistema SHALL exibir endereço completo (CEP, rua, bairro, cidade, estado)
3. WHEN a seção carrega THEN o sistema SHALL exibir data de nascimento e idade calculada automaticamente
4. WHEN a seção carrega THEN o sistema SHALL exibir como o cliente conheceu a empresa
5. WHEN existe foto do cliente THEN o sistema SHALL exibir a foto do perfil
6. WHEN o usuário clica no telefone THEN o sistema SHALL abrir WhatsApp Web
7. WHEN o usuário clica no email THEN o sistema SHALL abrir cliente de email padrão

### Requirement 3: Histórico de Viagens

**User Story:** Como administrador, eu quero ver todas as viagens que o cliente já participou, para que eu possa entender o histórico de relacionamento e identificar padrões.

#### Acceptance Criteria

1. WHEN a seção carrega THEN o sistema SHALL listar todas as viagens do cliente em ordem cronológica decrescente
2. WHEN exibe uma viagem THEN o sistema SHALL mostrar adversário, data do jogo, valor pago e status
3. WHEN exibe uma viagem THEN o sistema SHALL usar badges coloridos para diferentes status (Confirmado, Cancelado, Finalizado)
4. WHEN o cliente não tem viagens THEN o sistema SHALL exibir mensagem "Nenhuma viagem encontrada"
5. WHEN o usuário clica em uma viagem THEN o sistema SHALL navegar para os detalhes da viagem
6. WHEN a seção carrega THEN o sistema SHALL exibir contador total de viagens participadas

### Requirement 4: Situação Financeira

**User Story:** Como administrador, eu quero ver a situação financeira completa do cliente, para que eu possa tomar decisões sobre crédito, cobrança e relacionamento comercial.

#### Acceptance Criteria

1. WHEN a seção carrega THEN o sistema SHALL exibir cards com total gasto, valor pendente, última compra e ticket médio
2. WHEN a seção carrega THEN o sistema SHALL calcular e exibir status de crédito (Bom Pagador, Atenção, Inadimplente)
3. WHEN existem parcelas pendentes THEN o sistema SHALL listar todas com valores e datas de vencimento
4. WHEN existem parcelas pagas THEN o sistema SHALL exibir histórico de pagamentos com datas
5. WHEN o cliente tem pendências THEN o sistema SHALL destacar visualmente com cores de alerta
6. WHEN o usuário clica em "Cobrar" THEN o sistema SHALL abrir modal de cobrança via WhatsApp
7. WHEN a seção carrega THEN o sistema SHALL exibir gráfico simples da evolução de pagamentos

### Requirement 5: Histórico de Comunicação

**User Story:** Como administrador, eu quero ver todo o histórico de comunicação com o cliente, para que eu possa dar continuidade às conversas e evitar repetições.

#### Acceptance Criteria

1. WHEN a seção carrega THEN o sistema SHALL exibir timeline de todas as interações (WhatsApp, email, ligações)
2. WHEN exibe uma interação THEN o sistema SHALL mostrar data, hora, canal e resumo da mensagem
3. WHEN a seção carrega THEN o sistema SHALL exibir contadores de mensagens enviadas por canal
4. WHEN a seção carrega THEN o sistema SHALL identificar a preferência de contato baseada no histórico
5. WHEN o usuário clica em "Nova mensagem" THEN o sistema SHALL abrir composer de WhatsApp
6. WHEN não há histórico THEN o sistema SHALL exibir "Nenhuma comunicação registrada"

### Requirement 6: Estatísticas e Insights

**User Story:** Como administrador, eu quero ver estatísticas inteligentes sobre o cliente, para que eu possa personalizar o atendimento e identificar oportunidades de negócio.

#### Acceptance Criteria

1. WHEN a seção carrega THEN o sistema SHALL calcular e exibir "Cliente desde" com tempo de relacionamento
2. WHEN a seção carrega THEN o sistema SHALL calcular frequência de viagens (viagens por ano)
3. WHEN a seção carrega THEN o sistema SHALL identificar sazonalidade (meses que mais viaja)
4. WHEN a seção carrega THEN o sistema SHALL identificar adversário favorito baseado no histórico
5. WHEN a seção carrega THEN o sistema SHALL calcular score de fidelidade (0-100)
6. WHEN a seção carrega THEN o sistema SHALL exibir gráfico de atividade mensal
7. WHEN o cliente é VIP THEN o sistema SHALL exibir badge especial

### Requirement 7: Ações Rápidas

**User Story:** Como administrador, eu quero ter acesso a ações rápidas relacionadas ao cliente, para que eu possa executar tarefas comuns de forma eficiente.

#### Acceptance Criteria

1. WHEN a seção carrega THEN o sistema SHALL exibir botões para WhatsApp, email e ligação
2. WHEN a seção carrega THEN o sistema SHALL exibir botões para cobrar pendências e gerar relatórios
3. WHEN a seção carrega THEN o sistema SHALL exibir botões para inscrever em nova viagem
4. WHEN o usuário clica em "WhatsApp" THEN o sistema SHALL abrir WhatsApp Web com número preenchido
5. WHEN o usuário clica em "Cobrar" THEN o sistema SHALL abrir modal de cobrança personalizada
6. WHEN o usuário clica em "Relatório" THEN o sistema SHALL gerar PDF com dados do cliente
7. WHEN o usuário clica em "Nova viagem" THEN o sistema SHALL abrir modal de inscrição

### Requirement 8: Interface Responsiva e Navegação

**User Story:** Como administrador, eu quero que a página funcione bem em qualquer dispositivo, para que eu possa acessar as informações do cliente de qualquer lugar.

#### Acceptance Criteria

1. WHEN acessado em mobile THEN o sistema SHALL adaptar layout para tela pequena
2. WHEN acessado em desktop THEN o sistema SHALL usar layout em colunas otimizado
3. WHEN a página carrega THEN o sistema SHALL exibir breadcrumb de navegação
4. WHEN o usuário clica em "Voltar" THEN o sistema SHALL retornar para lista de clientes
5. WHEN a página carrega THEN o sistema SHALL exibir loading states durante carregamento de dados
6. WHEN há erro de conexão THEN o sistema SHALL exibir mensagem de erro com opção de retry

### Requirement 9: Integração com Sistemas Existentes

**User Story:** Como administrador, eu quero que o perfil do cliente se integre com todos os sistemas existentes, para que eu tenha dados sempre atualizados e consistentes.

#### Acceptance Criteria

1. WHEN a página carrega THEN o sistema SHALL buscar dados do cliente na tabela `clientes`
2. WHEN a página carrega THEN o sistema SHALL buscar viagens na tabela `viagem_passageiros`
3. WHEN a página carrega THEN o sistema SHALL buscar parcelas na tabela `viagem_passageiros_parcelas`
4. WHEN a página carrega THEN o sistema SHALL buscar histórico de cobrança na tabela `viagem_cobranca_historico`
5. WHEN dados são atualizados THEN o sistema SHALL refletir mudanças em tempo real
6. WHEN o usuário executa ação THEN o sistema SHALL registrar no histórico apropriado

### Requirement 10: Performance e Otimização

**User Story:** Como administrador, eu quero que a página carregue rapidamente mesmo com muitos dados, para que eu possa trabalhar de forma eficiente.

#### Acceptance Criteria

1. WHEN a página carrega THEN o sistema SHALL carregar dados básicos primeiro (< 1 segundo)
2. WHEN a página carrega THEN o sistema SHALL carregar seções secundárias de forma assíncrona
3. WHEN há muitas viagens THEN o sistema SHALL implementar paginação ou lazy loading
4. WHEN há muitas interações THEN o sistema SHALL limitar exibição aos últimos 50 registros
5. WHEN dados são carregados THEN o sistema SHALL implementar cache local para navegação rápida
6. WHEN a página é revisitada THEN o sistema SHALL usar dados em cache quando apropriado