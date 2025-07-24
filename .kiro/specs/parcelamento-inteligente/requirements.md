# Sistema de Parcelamento Inteligente - Requisitos

## Introdução

O Sistema de Parcelamento Inteligente automatiza a criação e gestão de parcelas para pagamentos de viagens, respeitando a regra de negócio de que todos os pagamentos devem estar quitados até 5 dias antes da data da viagem. O sistema calcula automaticamente as opções de parcelamento disponíveis baseado no tempo disponível e permite edição manual das datas.

## Requisitos

### Requisito 1 - Cálculo Automático de Parcelamento

**User Story:** Como gestor de viagens, eu quero que o sistema calcule automaticamente as opções de parcelamento disponíveis baseado na data da viagem, para que eu possa oferecer opções viáveis aos passageiros sem violar a regra dos 5 dias.

#### Acceptance Criteria

1. WHEN uma viagem é selecionada para cadastro de passageiro THEN o sistema SHALL calcular quantas parcelas são possíveis baseado na data da viagem
2. WHEN o cálculo é feito THEN o sistema SHALL respeitar o limite de 5 dias antes da viagem para a última parcela
3. WHEN há tempo suficiente THEN o sistema SHALL oferecer opções de 2x, 3x, 4x ou mais parcelas sem juros
4. WHEN não há tempo suficiente para parcelamento THEN o sistema SHALL oferecer apenas pagamento à vista
5. WHEN as parcelas são calculadas THEN o sistema SHALL usar intervalo mínimo de 15 dias entre parcelas
6. WHEN o valor é dividido THEN o sistema SHALL arredondar os centavos na última parcela se necessário

### Requisito 2 - Pagamento à Vista

**User Story:** Como gestor de viagens, eu quero oferecer a opção de pagamento à vista com possível desconto, para que eu possa incentivar pagamentos imediatos e melhorar o fluxo de caixa.

#### Acceptance Criteria

1. WHEN cadastro um passageiro THEN o sistema SHALL sempre oferecer a opção "À vista" como primeira opção
2. WHEN seleciono pagamento à vista THEN o sistema SHALL criar apenas 1 parcela com vencimento imediato (hoje)
3. WHEN há desconto configurado para à vista THEN o sistema SHALL aplicar automaticamente e mostrar o valor final
4. WHEN confirmo pagamento à vista THEN o sistema SHALL criar uma única parcela com status "pendente"
5. WHEN o pagamento à vista é efetuado THEN o sistema SHALL marcar como "pago" e finalizar o processo
6. WHEN não há tempo para parcelamento THEN o sistema SHALL oferecer APENAS a opção à vista

### Requisito 3 - Interface de Seleção de Parcelamento

**User Story:** Como gestor de viagens, eu quero uma interface clara para selecionar o tipo de parcelamento durante o cadastro do passageiro, para que eu possa escolher a melhor opção para cada caso.

#### Acceptance Criteria

1. WHEN estou cadastrando um passageiro THEN o sistema SHALL mostrar todas as opções disponíveis (à vista + parcelamentos)
2. WHEN seleciono uma opção de parcelamento THEN o sistema SHALL mostrar as datas de vencimento calculadas automaticamente
3. WHEN seleciono "Personalizado" THEN o sistema SHALL permitir definir número de parcelas e datas manualmente
4. WHEN edito uma data THEN o sistema SHALL validar que não ultrapassa o limite de 5 dias antes da viagem
5. WHEN confirmo qualquer opção THEN o sistema SHALL criar as parcelas correspondentes com status "pendente"
6. WHEN seleciono à vista THEN o sistema SHALL mostrar valor com desconto (se aplicável) e vencimento hoje

### Requisito 4 - Gestão de Parcelas com Vencimento

**User Story:** Como gestor de viagens, eu quero que cada parcela tenha uma data de vencimento específica e status individual, para que eu possa controlar exatamente qual parcela está pendente ou paga.

#### Acceptance Criteria

1. WHEN uma parcela é criada THEN o sistema SHALL definir data de vencimento, número da parcela e total de parcelas
2. WHEN uma parcela é paga THEN o sistema SHALL atualizar o status para "pago" e registrar data de pagamento
3. WHEN uma parcela vence THEN o sistema SHALL atualizar o status para "vencido" automaticamente
4. WHEN consulto um passageiro THEN o sistema SHALL mostrar status individual de cada parcela
5. WHEN calculo pendências THEN o sistema SHALL somar apenas parcelas com status "pendente" ou "vencido"

### Requisito 5 - Sistema de Alertas Automáticos

**User Story:** Como gestor de viagens, eu quero receber alertas automáticos sobre vencimentos de parcelas, para que eu possa fazer a cobrança no momento certo sem esquecer.

#### Acceptance Criteria

1. WHEN faltam 5 dias para vencimento de uma parcela THEN o sistema SHALL enviar alerta de lembrete
2. WHEN uma parcela vence no dia THEN o sistema SHALL enviar alerta de vencimento
3. WHEN uma parcela está 1 dia em atraso THEN o sistema SHALL enviar alerta de atraso
4. WHEN um alerta é enviado THEN o sistema SHALL registrar no histórico para não duplicar
5. WHEN há múltiplas parcelas do mesmo passageiro THEN o sistema SHALL agrupar alertas inteligentemente

### Requisito 6 - Dashboard de Vencimentos

**User Story:** Como gestor de viagens, eu quero um dashboard que mostre todas as parcelas organizadas por vencimento, para que eu possa priorizar as cobranças e ter visão geral dos pagamentos.

#### Acceptance Criteria

1. WHEN acesso o dashboard THEN o sistema SHALL mostrar parcelas agrupadas por "Hoje", "Amanhã", "Esta semana", "Próxima semana"
2. WHEN uma parcela está atrasada THEN o sistema SHALL destacar com cor vermelha e ícone de urgência
3. WHEN clico em uma parcela THEN o sistema SHALL mostrar detalhes do passageiro e opções de cobrança
4. WHEN seleciono múltiplas parcelas THEN o sistema SHALL permitir cobrança em massa
5. WHEN filtro por status THEN o sistema SHALL mostrar apenas parcelas do status selecionado

### Requisito 7 - Templates de Cobrança Específicos

**User Story:** Como gestor de viagens, eu quero templates de mensagem específicos para cada tipo de cobrança de parcela, para que as mensagens sejam mais precisas e efetivas.

#### Acceptance Criteria

1. WHEN envio lembrete de 5 dias THEN o sistema SHALL usar template específico mencionando prazo
2. WHEN envio cobrança de vencimento THEN o sistema SHALL mencionar qual parcela e quantas restam
3. WHEN envio cobrança de atraso THEN o sistema SHALL mencionar dias de atraso e urgência
4. WHEN gero mensagem THEN o sistema SHALL incluir informações da viagem e dados de pagamento
5. WHEN personalizo template THEN o sistema SHALL salvar para uso futuro

### Requisito 8 - Validação de Prazo Limite

**User Story:** Como gestor de viagens, eu quero que o sistema impeça parcelamentos que não respeitem o prazo de 5 dias antes da viagem, para que eu não tenha problemas com pagamentos em cima da hora.

#### Acceptance Criteria

1. WHEN a data da viagem está próxima THEN o sistema SHALL calcular se há tempo para parcelamento
2. WHEN não há tempo suficiente THEN o sistema SHALL mostrar apenas opção à vista
3. WHEN edito data de parcela THEN o sistema SHALL validar contra o prazo limite
4. WHEN tento salvar parcela inválida THEN o sistema SHALL mostrar erro explicativo
5. WHEN faltam 5 dias para viagem THEN o sistema SHALL alertar sobre pagamentos pendentes

### Requisito 9 - Histórico e Auditoria

**User Story:** Como gestor de viagens, eu quero um histórico completo de todas as ações relacionadas às parcelas, para que eu possa acompanhar o processo de cobrança e pagamento.

#### Acceptance Criteria

1. WHEN uma parcela é criada THEN o sistema SHALL registrar no histórico
2. WHEN uma data é editada THEN o sistema SHALL registrar a alteração e quem fez
3. WHEN um alerta é enviado THEN o sistema SHALL registrar canal, template e resultado
4. WHEN uma parcela é paga THEN o sistema SHALL registrar data, valor e forma de pagamento
5. WHEN consulto histórico THEN o sistema SHALL mostrar timeline completa das ações

### Requisito 10 - Integração com Sistema Financeiro

**User Story:** Como gestor de viagens, eu quero que o parcelamento se integre automaticamente com o sistema financeiro geral, para que os dados apareçam corretamente nos relatórios e fluxo de caixa.

#### Acceptance Criteria

1. WHEN uma parcela é paga THEN o sistema SHALL atualizar automaticamente o fluxo de caixa
2. WHEN consulto contas a receber THEN o sistema SHALL mostrar parcelas pendentes por vencimento
3. WHEN gero relatório THEN o sistema SHALL incluir projeção de recebimentos futuros
4. WHEN analiso performance THEN o sistema SHALL considerar parcelas individuais
5. WHEN exporto dados THEN o sistema SHALL incluir detalhes de parcelamento

### Requisito 11 - Configuração de Descontos

**User Story:** Como gestor de viagens, eu quero configurar descontos para pagamento à vista por viagem, para que eu possa incentivar pagamentos imediatos e melhorar o fluxo de caixa.

#### Acceptance Criteria

1. WHEN configuro uma viagem THEN o sistema SHALL permitir definir percentual de desconto para pagamento à vista
2. WHEN há desconto configurado THEN o sistema SHALL mostrar valor original e valor com desconto na interface
3. WHEN não há desconto configurado THEN o sistema SHALL mostrar apenas o valor normal para à vista
4. WHEN aplico desconto THEN o sistema SHALL calcular o valor final automaticamente
5. WHEN confirmo pagamento à vista com desconto THEN o sistema SHALL registrar o desconto aplicado no histórico