# Unificação dos Sistemas de Pagamento

## Introdução

Atualmente temos dois sistemas de pagamento rodando simultaneamente, causando conflitos, inconsistências e erros na "Situação Financeira". Esta spec define a unificação dos sistemas para eliminar conflitos e simplificar a experiência do usuário.

## Problemas Identificados

- **Conflito de Dados**: Sistema antigo (parcelas) vs Sistema novo (pagamentos separados)
- **Cálculos Inconsistentes**: Valores diferentes entre os sistemas
- **Interface Confusa**: Duas seções financeiras no modal de edição
- **Erros Frequentes**: "Situação Financeira" apresentando erros constantes
- **Duplicação de Código**: Lógicas similares em lugares diferentes

## Requirements

### Requirement 1: Consolidação da Interface Financeira

**User Story:** Como usuário, eu quero uma única seção financeira clara e consistente, para que eu não tenha confusão entre diferentes sistemas de pagamento.

#### Acceptance Criteria

1. WHEN eu abrir o modal de edição de passageiro THEN eu devo ver apenas uma seção financeira unificada
2. WHEN eu visualizar informações financeiras THEN elas devem ser consistentes em toda a aplicação
3. WHEN eu registrar um pagamento THEN ele deve ser refletido imediatamente em todas as visualizações
4. IF existirem dados do sistema antigo THEN eles devem ser migrados ou mantidos compatíveis

### Requirement 2: Histórico de Pagamentos Integrado

**User Story:** Como usuário, eu quero ver o histórico completo de pagamentos de forma organizada, para que eu possa acompanhar todos os pagamentos realizados.

#### Acceptance Criteria

1. WHEN eu visualizar o histórico THEN ele deve incluir pagamentos de ambos os sistemas (antigo e novo)
2. WHEN eu abrir o histórico THEN ele deve estar localizado abaixo da situação financeira principal
3. WHEN houver pagamentos categorizados THEN eles devem ser exibidos com suas respectivas categorias
4. WHEN houver pagamentos do sistema antigo THEN eles devem ser exibidos como "Pagamento Geral"

### Requirement 3: Eliminação de Conflitos de Cálculo

**User Story:** Como usuário, eu quero que os valores financeiros sejam calculados de forma consistente, para que eu não veja informações contraditórias.

#### Acceptance Criteria

1. WHEN o sistema calcular valores THEN deve usar uma única fonte de verdade
2. WHEN existirem dados de ambos os sistemas THEN deve priorizar o sistema novo
3. WHEN não houver dados no sistema novo THEN deve usar o sistema antigo como fallback
4. WHEN eu visualizar totais THEN eles devem ser consistentes em toda a aplicação

### Requirement 4: Migração Gradual e Compatibilidade

**User Story:** Como administrador, eu quero que a transição entre sistemas seja suave, para que não haja perda de dados ou funcionalidades.

#### Acceptance Criteria

1. WHEN existirem dados do sistema antigo THEN eles devem continuar funcionando
2. WHEN novos pagamentos forem registrados THEN devem usar o sistema novo
3. WHEN eu visualizar dados antigos THEN eles devem ser apresentados de forma compatível
4. IF necessário THEN deve haver uma opção de migração de dados

### Requirement 5: Interface Simplificada

**User Story:** Como usuário, eu quero uma interface limpa e intuitiva para gerenciar pagamentos, para que eu possa trabalhar de forma eficiente.

#### Acceptance Criteria

1. WHEN eu abrir o modal de passageiro THEN deve haver apenas uma seção "Situação Financeira"
2. WHEN eu quiser ver o histórico THEN deve haver um botão claro "Ver Histórico Completo"
3. WHEN eu registrar pagamentos THEN deve usar o sistema unificado
4. WHEN eu visualizar status THEN deve mostrar o status mais preciso disponível

## Cenários de Uso

### Cenário 1: Passageiro Apenas com Sistema Antigo
- **Situação**: Passageiro tem apenas parcelas no sistema antigo
- **Comportamento**: Mostrar dados do sistema antigo, permitir novos pagamentos no sistema novo

### Cenário 2: Passageiro Apenas com Sistema Novo
- **Situação**: Passageiro tem apenas pagamentos categorizados
- **Comportamento**: Funcionar normalmente com o sistema novo

### Cenário 3: Passageiro com Ambos os Sistemas
- **Situação**: Passageiro tem dados em ambos os sistemas
- **Comportamento**: Consolidar informações, priorizar sistema novo para novos pagamentos

### Cenário 4: Migração de Dados
- **Situação**: Necessidade de migrar dados do sistema antigo
- **Comportamento**: Converter parcelas em pagamentos categorizados mantendo histórico