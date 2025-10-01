# Requirements Document - WhatsApp em Massa para Viagens

## Introdução

Esta funcionalidade permitirá aos usuários enviar mensagens personalizadas em massa via WhatsApp para todos os passageiros de uma viagem específica. O sistema gerará listas formatadas de contatos para facilitar o uso de listas de transmissão do WhatsApp Business, permitindo comunicação rápida e eficiente com todos os passageiros.

A solução foca em simplicidade e praticidade, oferecendo uma abordagem direta que utiliza as funcionalidades nativas do WhatsApp Business para envio em massa real.

## Requirements

### Requirement 1

**User Story:** Como administrador de viagens, eu quero acessar uma funcionalidade de "WhatsApp em Massa" na página de detalhes da viagem, para que eu possa comunicar informações importantes para todos os passageiros de forma eficiente.

#### Acceptance Criteria

1. WHEN o usuário estiver na página de detalhes de uma viagem THEN o sistema SHALL exibir um botão "WhatsApp em Massa" na interface principal
2. WHEN o usuário clicar no botão "WhatsApp em Massa" THEN o sistema SHALL abrir um modal com opções de configuração de mensagem
3. IF a viagem não possuir passageiros com telefone cadastrado THEN o sistema SHALL exibir uma mensagem informativa sobre a ausência de contatos
4. WHEN o modal for aberto THEN o sistema SHALL exibir o número total de passageiros com telefone válido

### Requirement 2

**User Story:** Como administrador, eu quero filtrar quais passageiros receberão a mensagem por ônibus, para que eu possa enviar comunicações específicas para passageiros de ônibus diferentes quando necessário.

#### Acceptance Criteria

1. WHEN o modal de WhatsApp em massa for aberto THEN o sistema SHALL exibir opção "Todos os passageiros" selecionada por padrão
2. WHEN a viagem possuir múltiplos ônibus THEN o sistema SHALL exibir filtro por ônibus específico
3. WHEN o usuário selecionar um ônibus específico THEN o sistema SHALL atualizar automaticamente a lista de passageiros selecionados
4. WHEN um filtro for aplicado THEN o sistema SHALL exibir o número atualizado de passageiros selecionados
5. IF um ônibus não possuir passageiros com telefone THEN o sistema SHALL exibir mensagem informativa
6. WHEN o filtro for alterado THEN o sistema SHALL atualizar em tempo real a contagem de destinatários

### Requirement 3

**User Story:** Como administrador, eu quero digitar uma mensagem personalizada, para que eu possa comunicar informações específicas da viagem de forma livre e flexível.

#### Acceptance Criteria

1. WHEN o modal for aberto THEN o sistema SHALL exibir um campo de texto amplo para digitação da mensagem
2. WHEN o usuário digitar a mensagem THEN o sistema SHALL permitir texto livre sem limitações de template
3. WHEN a mensagem for digitada THEN o sistema SHALL suportar quebras de linha e formatação básica
4. IF a mensagem estiver vazia THEN o sistema SHALL desabilitar as opções de geração de lista
5. WHEN a mensagem for muito longa THEN o sistema SHALL exibir contador de caracteres
6. WHEN o usuário finalizar a digitação THEN o sistema SHALL validar se a mensagem não está vazia

### Requirement 4

**User Story:** Como administrador, eu quero gerar uma lista formatada de números de telefone, para que eu possa copiar e colar diretamente na criação de uma lista de transmissão do WhatsApp Business.

#### Acceptance Criteria

1. WHEN o usuário clicar em "Gerar Lista de Números" THEN o sistema SHALL criar uma lista formatada com todos os telefones no formato internacional (+5511999999999)
2. WHEN a lista for gerada THEN o sistema SHALL exibir os números em um campo de texto copiável
3. WHEN o usuário clicar em "Copiar Lista" THEN o sistema SHALL copiar todos os números para a área de transferência
4. WHEN a cópia for realizada THEN o sistema SHALL exibir uma confirmação visual com o número de contatos copiados
5. IF algum telefone estiver em formato inválido THEN o sistema SHALL filtrar automaticamente apenas números válidos
6. WHEN a lista for exibida THEN o sistema SHALL mostrar quantos números foram incluídos vs total de passageiros

### Requirement 5

**User Story:** Como administrador, eu quero baixar um arquivo VCF (vCard) com todos os contatos dos passageiros, para que eu possa importar diretamente no meu celular e criar a lista de transmissão facilmente.

#### Acceptance Criteria

1. WHEN o usuário clicar em "Baixar Arquivo de Contatos" THEN o sistema SHALL gerar um arquivo .vcf com todos os passageiros selecionados
2. WHEN o arquivo VCF for gerado THEN o sistema SHALL incluir nome completo e telefone de cada passageiro
3. WHEN o download for iniciado THEN o arquivo SHALL ter nome descritivo incluindo data da viagem
4. IF um passageiro não tiver nome completo THEN o sistema SHALL usar "Passageiro [número]" como fallback
5. WHEN o arquivo for baixado THEN o sistema SHALL exibir instruções de como importar no celular
6. IF não houver passageiros selecionados THEN o sistema SHALL desabilitar o botão de download

### Requirement 6

**User Story:** Como administrador, eu quero visualizar um preview da mensagem, para que eu possa verificar como ficará antes de gerar as listas de contato.

#### Acceptance Criteria

1. WHEN uma mensagem for digitada THEN o sistema SHALL exibir um preview da mensagem em tempo real
2. WHEN o preview for exibido THEN o sistema SHALL mostrar exatamente como a mensagem aparecerá no WhatsApp
3. WHEN a mensagem for alterada THEN o sistema SHALL atualizar o preview automaticamente
4. IF a mensagem estiver vazia THEN o sistema SHALL exibir placeholder no preview
5. WHEN o preview for exibido THEN o sistema SHALL simular a aparência de uma conversa do WhatsApp
6. WHEN a mensagem for longa THEN o sistema SHALL mostrar como ficará a formatação

### Requirement 7

**User Story:** Como administrador, eu quero ver estatísticas dos passageiros selecionados, para que eu possa entender o alcance da minha comunicação antes de enviar.

#### Acceptance Criteria

1. WHEN passageiros forem selecionados THEN o sistema SHALL exibir total de passageiros com telefone válido
2. WHEN filtros forem aplicados THEN o sistema SHALL mostrar breakdown por ônibus e status de pagamento
3. WHEN a lista for gerada THEN o sistema SHALL exibir quantos números foram incluídos vs excluídos
4. IF houver passageiros sem telefone THEN o sistema SHALL mostrar quantos foram excluídos e por quê
5. WHEN estatísticas forem exibidas THEN o sistema SHALL incluir informações sobre telefones inválidos ou duplicados
6. WHEN a seleção mudar THEN o sistema SHALL atualizar as estatísticas em tempo real

### Requirement 8

**User Story:** Como administrador, eu quero que o sistema registre quando gero listas para WhatsApp, para que eu possa ter controle das comunicações realizadas.

#### Acceptance Criteria

1. WHEN uma lista de contatos for gerada THEN o sistema SHALL registrar a ação no histórico da viagem
2. WHEN o histórico for registrado THEN o sistema SHALL incluir data/hora, número de destinatários e filtro aplicado (todos ou ônibus específico)
3. WHEN uma ação for registrada THEN o sistema SHALL associar ao usuário que executou a ação
4. IF múltiplas listas forem geradas THEN o sistema SHALL manter registro de cada geração
5. WHEN o histórico for consultado THEN o sistema SHALL exibir as ações de forma simples e clara
6. WHEN uma lista for gerada THEN o sistema SHALL confirmar visualmente que a ação foi registrada