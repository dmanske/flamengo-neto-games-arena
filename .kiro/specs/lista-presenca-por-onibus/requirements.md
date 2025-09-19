# Documento de Requisitos - Lista de Presença por Ônibus

## Introdução

Este documento especifica os requisitos para implementar um sistema de links específicos de lista de presença por ônibus, permitindo que cada responsável/guia de ônibus tenha acesso a uma interface dedicada apenas aos passageiros do seu ônibus específico.

## Requisitos

### Requisito 1

**User Story:** Como administrador da viagem, eu quero gerar links específicos para cada ônibus, para que cada responsável/guia possa acessar apenas a lista de presença do seu ônibus.

#### Acceptance Criteria

1. QUANDO o administrador acessa a página de detalhes da viagem ENTÃO o sistema SHALL exibir uma seção "Links por Ônibus" com botões para gerar/copiar links específicos
2. QUANDO o administrador clica em "Gerar Link" para um ônibus ENTÃO o sistema SHALL criar um link no formato `/lista-presenca/:viagemId/onibus/:onibusId`
3. QUANDO o administrador clica em "Copiar Link" ENTÃO o sistema SHALL copiar o link para a área de transferência e exibir confirmação
4. IF existe pelo menos um ônibus na viagem THEN o sistema SHALL mostrar a seção de links por ônibus

### Requisito 2

**User Story:** Como responsável/guia de ônibus, eu quero acessar um link específico do meu ônibus, para que eu possa ver apenas os passageiros que estão sob minha responsabilidade.

#### Acceptance Criteria

1. WHEN o guia acessa o link `/lista-presenca/:viagemId/onibus/:onibusId` THEN o sistema SHALL exibir apenas os passageiros alocados naquele ônibus específico
2. WHEN a página carrega THEN o sistema SHALL mostrar o cabeçalho com informações do ônibus (número, tipo, empresa)
3. WHEN não existem passageiros no ônibus THEN o sistema SHALL exibir mensagem informativa "Nenhum passageiro alocado neste ônibus"
4. IF o ônibus não existe ou não pertence à viagem THEN o sistema SHALL exibir erro 404

### Requisito 3

**User Story:** Como responsável/guia de ônibus, eu quero marcar a presença dos passageiros do meu ônibus, para que eu possa controlar quem embarcou.

#### Acceptance Criteria

1. WHEN o guia visualiza a lista de passageiros THEN o sistema SHALL exibir botões de presença para cada passageiro
2. WHEN o guia clica em "Marcar Presente" THEN o sistema SHALL atualizar o status para "presente" e exibir confirmação
3. WHEN o guia clica em "Remover Presença" THEN o sistema SHALL atualizar o status para "pendente" e exibir confirmação
4. WHEN ocorre erro na atualização THEN o sistema SHALL exibir mensagem de erro e manter estado anterior

### Requisito 4

**User Story:** Como responsável/guia de ônibus, eu quero ver estatísticas do meu ônibus, para que eu possa ter controle sobre a ocupação e presença.

#### Acceptance Criteria

1. WHEN a página carrega THEN o sistema SHALL exibir cards com estatísticas: Total, Presentes, Pendentes, Taxa de Presença
2. WHEN um passageiro tem presença marcada/removida THEN o sistema SHALL atualizar as estatísticas em tempo real
3. WHEN existem informações financeiras THEN o sistema SHALL exibir resumo financeiro dos passageiros do ônibus
4. IF o ônibus tem responsáveis designados THEN o sistema SHALL destacar os responsáveis na lista

### Requisito 5

**User Story:** Como responsável/guia de ônibus, eu quero filtrar e buscar passageiros do meu ônibus, para que eu possa encontrar rapidamente um passageiro específico.

#### Acceptance Criteria

1. WHEN o guia digita no campo de busca THEN o sistema SHALL filtrar passageiros por nome, CPF ou telefone em tempo real
2. WHEN o guia seleciona filtro por cidade THEN o sistema SHALL mostrar apenas passageiros da cidade selecionada
3. WHEN o guia seleciona filtro por status THEN o sistema SHALL mostrar apenas passageiros com o status selecionado
4. WHEN múltiplos filtros são aplicados THEN o sistema SHALL aplicar todos os filtros simultaneamente

### Requisito 6

**User Story:** Como responsável/guia de ônibus, eu quero ver informações detalhadas dos passageiros, para que eu possa identificá-los e verificar suas informações.

#### Acceptance Criteria

1. WHEN a lista de passageiros é exibida THEN o sistema SHALL mostrar nome, cidade de embarque, setor, status de pagamento
2. WHEN o passageiro tem passeios contratados THEN o sistema SHALL exibir badges dos passeios
3. WHEN o passageiro tem foto THEN o sistema SHALL exibir a foto do passageiro
4. IF o passageiro é responsável do ônibus THEN o sistema SHALL destacar com badge especial

### Requisito 7

**User Story:** Como administrador, eu quero que o sistema seja responsivo e funcione em dispositivos móveis, para que os guias possam usar smartphones/tablets durante o embarque.

#### Acceptance Criteria

1. WHEN acessado em dispositivo móvel THEN o sistema SHALL adaptar o layout para telas pequenas
2. WHEN em modo mobile THEN os botões SHALL ter tamanho adequado para toque
3. WHEN em modo mobile THEN as informações SHALL ser organizadas em cards empilhados
4. WHEN em modo desktop THEN o sistema SHALL aproveitar o espaço horizontal disponível

### Requisito 8

**User Story:** Como administrador, eu quero que o acesso aos links por ônibus seja seguro, para que apenas pessoas autorizadas possam marcar presença.

#### Acceptance Criteria

1. WHEN um usuário acessa o link específico THEN o sistema SHALL verificar autenticação
2. WHEN o usuário não está autenticado THEN o sistema SHALL redirecionar para login
3. WHEN o usuário está autenticado mas não tem permissão THEN o sistema SHALL exibir erro de acesso negado
4. IF a viagem não está em status "Em andamento" THEN o sistema SHALL exibir aviso sobre disponibilidade da lista de presença