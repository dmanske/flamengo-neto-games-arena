# Requirements Document

## Introdução

Esta funcionalidade visa melhorar a visualização das informações do cliente no modal de detalhes dos ingressos, adicionando o status do cadastro facial abaixo do CPF, de forma consistente com a exibição já existente na lista de passageiros das viagens.

## Requirements

### Requirement 1

**User Story:** Como operador do sistema, eu quero visualizar o status do cadastro facial do cliente no modal de detalhes dos ingressos, para que eu possa verificar rapidamente se o cliente já fez o cadastramento facial necessário.

#### Acceptance Criteria

1. WHEN o usuário clicar no botão "ver" de um ingresso THEN o modal de detalhes SHALL exibir o status do cadastro facial abaixo do CPF do cliente
2. WHEN o cliente tiver cadastro facial completo THEN o sistema SHALL exibir "✓ Facial OK" em verde
3. WHEN o cliente não tiver cadastro facial THEN o sistema SHALL exibir "⚠ Facial pendente" em amarelo
4. WHEN os dados estiverem carregando THEN o sistema SHALL exibir "..." como placeholder
5. IF o usuário clicar no status do cadastro facial THEN o sistema SHALL permitir alterar o status (toggle)

### Requirement 2

**User Story:** Como operador do sistema, eu quero que o status do cadastro facial no modal de ingressos seja interativo, para que eu possa atualizar o status diretamente sem sair do modal.

#### Acceptance Criteria

1. WHEN o usuário clicar no status do cadastro facial no modal THEN o sistema SHALL alternar entre "Facial OK" e "Facial pendente"
2. WHEN o status for alterado THEN o sistema SHALL salvar a alteração no banco de dados na tabela clientes
3. WHEN a alteração for bem-sucedida THEN o sistema SHALL atualizar a exibição imediatamente no modal
4. WHEN houver erro na alteração THEN o sistema SHALL exibir mensagem de erro e manter o status anterior
5. WHEN o status for alterado no modal THEN o sistema SHALL também refletir a mudança em outras partes do sistema

### Requirement 3

**User Story:** Como operador do sistema, eu quero que a exibição do cadastro facial no modal de ingressos seja consistente com a lista de passageiros das viagens, para que eu tenha uma experiência uniforme no sistema.

#### Acceptance Criteria

1. WHEN o modal exibir o status do cadastro facial THEN o sistema SHALL usar o mesmo componente StatusCadastroFacial da lista de passageiros
2. WHEN o modal for aberto THEN o sistema SHALL carregar os dados de cadastro facial junto com os outros dados do cliente
3. WHEN o modal exibir o status THEN o sistema SHALL posicionar a informação abaixo do CPF, na mesma linha do telefone
4. WHEN o usuário passar o mouse sobre o status THEN o sistema SHALL exibir tooltip explicativo se interativo
5. WHEN o modal for fechado e reaberto THEN o sistema SHALL exibir o status atualizado