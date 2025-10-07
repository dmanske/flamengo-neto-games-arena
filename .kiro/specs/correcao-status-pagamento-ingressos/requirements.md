# Correção do Status de Pagamento de Ingressos

## Introdução

Este documento define os requisitos para corrigir o problema onde o sistema marca ingressos como "pendente" quando o preço de custo é editado, mesmo que o ingresso já estivesse marcado como "pago" anteriormente.

## Problema Atual

Quando um ingresso está marcado como "pago" com custo 0 e posteriormente o usuário edita o preço de custo para o valor real, o sistema recalcula incorretamente o status de pagamento, marcando o ingresso como "pendente" porque compara o total pago com o novo valor final (que mudou automaticamente devido às colunas calculadas).

## Requirements

### Requirement 1

**User Story:** Como administrador do sistema, eu quero que o status de pagamento de um ingresso não seja alterado automaticamente quando eu edito apenas o preço de custo, para que ingressos já pagos não sejam marcados incorretamente como pendentes.

#### Acceptance Criteria

1. WHEN eu edito apenas o preço de custo de um ingresso que está marcado como "pago" THEN o sistema SHALL manter o status como "pago"
2. WHEN eu edito apenas o preço de custo de um ingresso THEN o sistema SHALL NOT recalcular automaticamente o status de pagamento
3. WHEN eu edito o preço de venda ou desconto de um ingresso THEN o sistema SHALL recalcular o status de pagamento apenas se necessário

### Requirement 2

**User Story:** Como administrador do sistema, eu quero ter controle manual sobre quando o status de pagamento deve ser recalculado, para evitar alterações indesejadas em ingressos já processados.

#### Acceptance Criteria

1. WHEN eu edito um ingresso THEN o sistema SHALL preservar o status atual se não houver mudanças nos valores que afetam o pagamento
2. WHEN eu adiciono ou removo pagamentos THEN o sistema SHALL recalcular o status automaticamente
3. WHEN eu edito valores financeiros (preço_venda, desconto) THEN o sistema SHALL oferecer opção de recalcular o status

### Requirement 3

**User Story:** Como administrador do sistema, eu quero que o sistema seja inteligente ao recalcular status de pagamento, considerando o contexto da edição realizada.

#### Acceptance Criteria

1. WHEN apenas o preço de custo é alterado THEN o sistema SHALL NOT alterar o status de pagamento existente
2. WHEN o valor final do ingresso diminui e o total pago é maior que o novo valor THEN o sistema SHALL marcar como "pago"
3. WHEN o valor final do ingresso aumenta mas havia pagamentos registrados THEN o sistema SHALL manter o status atual e permitir ajuste manual

### Requirement 4

**User Story:** Como administrador do sistema, eu quero ter visibilidade sobre quando e por que o status de um ingresso foi alterado, para auditoria e controle.

#### Acceptance Criteria

1. WHEN o status de um ingresso é alterado automaticamente THEN o sistema SHALL registrar o motivo da alteração
2. WHEN há discrepância entre valor pago e valor final THEN o sistema SHALL exibir alerta informativo
3. WHEN edito um ingresso com pagamentos registrados THEN o sistema SHALL mostrar resumo dos pagamentos antes de salvar