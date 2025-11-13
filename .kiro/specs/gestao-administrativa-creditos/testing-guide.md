# Guia de Testes - Gestão Administrativa de Créditos

## Visão Geral

Este documento descreve todos os testes que devem ser realizados para validar as funcionalidades administrativas do sistema de créditos.

---

## 1. Testes de Banco de Dados

### 1.1 Verificar Alterações na Tabela

```sql
-- Verificar se as colunas foram adicionadas
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'wallet_transacoes'
  AND column_name IN ('editado_em', 'editado_por', 'cancelada', 'motivo_cancelamento', 'valor_original')
ORDER BY column_name;
```

**Resultado Esperado:** 5 linhas mostrando as novas colunas

### 1.2 Testar Função wallet_editar_transacao

```sql
-- Criar transação de teste
INSERT INTO wallet_transacoes (cliente_id, tipo, valor, descricao)
VALUES ('SEU_CLIENTE_ID', 'deposito', 100.00, 'Teste de edição')
RETURNING id;

-- Editar a transação
SELECT wallet_editar_transacao(
  'ID_DA_TRANSACAO',
  150.00,
  'Teste editado',
  'admin_teste'
);

-- Verificar resultado
SELECT * FROM wallet_transacoes WHERE id = 'ID_DA_TRANSACAO';
SELECT * FROM cliente_wallet WHERE cliente_id = 'SEU_CLIENTE_ID';
```

**Resultado Esperado:**
- Transação com valor 150.00
- Campo editado_em preenchido
- Campo valor_original = 100.00
- Saldo da carteira aumentou em 50.00

### 1.3 Testar Função wallet_cancelar_transacao

```sql
-- Cancelar a transação
SELECT wallet_cancelar_transacao(
  'ID_DA_TRANSACAO',
  'Teste de cancelamento',
  'admin_teste'
);

-- Verificar resultado
SELECT * FROM wallet_transacoes WHERE id = 'ID_DA_TRANSACAO';
SELECT * FROM cliente_wallet WHERE cliente_id = 'SEU_CLIENTE_ID';
```

**Resultado Esperado:**
- Campo cancelada = TRUE
- Campo motivo_cancelamento preenchido
- Saldo da carteira diminuiu em 150.00

### 1.4 Testar Função wallet_ajustar_saldo

```sql
-- Ajustar saldo
SELECT wallet_ajustar_saldo(
  'SEU_CLIENTE_ID',
  500.00,
  'Teste de ajuste manual',
  'admin_teste'
);

-- Verificar resultado
SELECT * FROM cliente_wallet WHERE cliente_id = 'SEU_CLIENTE_ID';
SELECT * FROM wallet_transacoes 
WHERE cliente_id = 'SEU_CLIENTE_ID' 
  AND tipo = 'ajuste'
ORDER BY created_at DESC 
LIMIT 1;
```

**Resultado Esperado:**
- Saldo da carteira = 500.00
- Nova transação tipo 'ajuste' criada
- Descrição contém o motivo

### 1.5 Testar Função wallet_deletar_carteira

```sql
-- Tentar deletar com saldo > 0 (deve falhar)
SELECT wallet_deletar_carteira('SEU_CLIENTE_ID');

-- Zerar saldo primeiro
UPDATE cliente_wallet SET saldo_atual = 0 WHERE cliente_id = 'SEU_CLIENTE_ID';

-- Deletar carteira (deve funcionar)
SELECT wallet_deletar_carteira('SEU_CLIENTE_ID');

-- Verificar resultado
SELECT * FROM cliente_wallet WHERE cliente_id = 'SEU_CLIENTE_ID';
SELECT * FROM wallet_transacoes WHERE cliente_id = 'SEU_CLIENTE_ID';
```

**Resultado Esperado:**
- Primeira tentativa retorna erro
- Segunda tentativa retorna sucesso
- Carteira e transações foram deletadas

---

## 2. Testes de Interface

### 2.1 Teste de Edição de Transação

**Passos:**
1. Acessar `/dashboard/creditos-prepagos/cliente/[ID]`
2. Localizar uma transação no histórico
3. Clicar no botão "Editar"
4. Alterar o valor de R$ 100,00 para R$ 150,00
5. Alterar a descrição
6. Clicar em "Salvar"

**Resultado Esperado:**
- Modal fecha
- Toast verde: "Transação editada com sucesso!"
- Transação mostra novo valor
- Badge "Editado em [data]" aparece
- Saldo da carteira atualizado (+R$ 50,00)

**Teste de Erro:**
- Tentar editar para valor negativo → Deve mostrar erro
- Tentar editar transação cancelada → Botão deve estar desabilitado

### 2.2 Teste de Cancelamento de Transação

**Passos:**
1. Acessar página de detalhes da carteira
2. Localizar uma transação
3. Clicar no botão "Cancelar"
4. Preencher motivo: "Teste de cancelamento"
5. Confirmar

**Resultado Esperado:**
- Modal fecha
- Toast verde: "Transação cancelada com sucesso!"
- Transação aparece riscada
- Badge vermelho "Cancelada"
- Motivo visível ao passar mouse
- Saldo atualizado (depósito diminui, uso aumenta)

**Teste de Erro:**
- Tentar cancelar sem motivo → Deve mostrar erro
- Tentar cancelar quando saldo ficaria negativo → Deve mostrar erro

### 2.3 Teste de Ajuste de Saldo

**Passos:**
1. Acessar página de detalhes da carteira
2. Clicar em "Ajustar Saldo"
3. Informar novo saldo: R$ 500,00
4. Informar motivo: "Correção administrativa"
5. Confirmar

**Resultado Esperado:**
- Modal fecha
- Toast verde: "Saldo ajustado com sucesso!"
- Saldo da carteira = R$ 500,00
- Nova transação tipo "Ajuste Manual" no histórico
- Badge laranja na transação de ajuste

**Teste de Erro:**
- Tentar ajustar para valor negativo → Deve mostrar erro
- Tentar ajustar sem motivo → Deve mostrar erro
- Tentar ajustar para o mesmo valor → Deve mostrar erro

### 2.4 Teste de Exclusão de Carteira

**Passos:**
1. Acessar página de detalhes da carteira
2. Clicar em "Excluir Carteira"
3. Verificar aviso se saldo > 0
4. Se saldo = 0, digitar nome do cliente para confirmar
5. Confirmar exclusão

**Resultado Esperado:**
- Se saldo > 0: Modal mostra erro e não permite exclusão
- Se saldo = 0: Modal pede confirmação
- Após confirmar: Toast verde e redirecionamento para lista
- Carteira não aparece mais na lista

**Teste de Erro:**
- Tentar excluir com saldo > 0 → Deve mostrar erro
- Não digitar nome corretamente → Botão deve estar desabilitado

### 2.5 Teste de Geração de PDF

**Passos:**
1. Acessar página de detalhes da carteira
2. Clicar em "Gerar PDF"
3. Selecionar período (ex: último mês)
4. Clicar em "Gerar"

**Resultado Esperado:**
- Modal mostra loading
- PDF é baixado automaticamente
- PDF contém:
  - Logo da empresa
  - Nome do cliente
  - Saldo atual
  - Total depositado e usado
  - Lista de transações do período
  - Valores formatados em R$
  - Datas formatadas em DD/MM/YYYY

**Teste de Erro:**
- Período sem transações → PDF deve mostrar mensagem informativa

---

## 3. Testes de Integridade

### 3.1 Teste de Saldo Nunca Negativo

**Cenário:**
1. Cliente com saldo R$ 50,00
2. Tentar cancelar depósito de R$ 100,00

**Resultado Esperado:**
- Operação bloqueada
- Erro: "Saldo ficaria negativo"

### 3.2 Teste de Transação Cancelada Não Editável

**Cenário:**
1. Cancelar uma transação
2. Tentar editar a mesma transação

**Resultado Esperado:**
- Botão "Editar" desabilitado ou não visível
- Se tentar via API: Erro "Transação cancelada"

### 3.3 Teste de Exclusão Apenas com Saldo Zero

**Cenário:**
1. Cliente com saldo R$ 100,00
2. Tentar excluir carteira

**Resultado Esperado:**
- Operação bloqueada
- Erro: "Carteira possui saldo positivo"

### 3.4 Teste de Campos Obrigatórios

**Cenário:**
1. Tentar cancelar sem motivo
2. Tentar ajustar sem motivo

**Resultado Esperado:**
- Botão "Confirmar" desabilitado
- Campo destacado em vermelho
- Mensagem de erro

---

## 4. Testes de Performance

### 4.1 Teste de Múltiplas Operações

**Cenário:**
1. Editar 10 transações seguidas
2. Cancelar 5 transações
3. Fazer 3 ajustes de saldo

**Resultado Esperado:**
- Todas as operações completam em < 2 segundos cada
- Saldo sempre consistente
- Histórico atualizado corretamente

### 4.2 Teste de Geração de PDF com Muitas Transações

**Cenário:**
1. Cliente com 100+ transações
2. Gerar PDF de todo o período

**Resultado Esperado:**
- PDF gerado em < 5 segundos
- Todas as transações incluídas
- Formatação mantida

---

## 5. Testes de Regressão

### 5.1 Funcionalidades Existentes

**Verificar que ainda funcionam:**
- ✅ Criar depósito
- ✅ Usar créditos
- ✅ Visualizar histórico
- ✅ Filtrar transações
- ✅ Buscar clientes
- ✅ Dashboard de resumo

### 5.2 Integrações

**Verificar:**
- ✅ Uso de créditos em viagens ainda funciona
- ✅ Cálculos de saldo corretos
- ✅ Notificações de saldo baixo
- ✅ Relatórios gerais

---

## 6. Checklist Final

Antes de considerar completo, verificar:

- [ ] Todas as funções SQL criadas e testadas
- [ ] Todos os componentes implementados
- [ ] Todos os testes de interface passaram
- [ ] Testes de integridade validados
- [ ] Testes de performance aceitáveis
- [ ] Testes de regressão passaram
- [ ] Documentação atualizada
- [ ] Screenshots capturados
- [ ] Guia de uso criado

---

## 7. Casos de Teste Específicos

### Caso 1: Edição Múltipla da Mesma Transação

```
1. Criar depósito de R$ 100,00
2. Editar para R$ 150,00 (valor_original = 100)
3. Editar para R$ 200,00 (valor_original ainda = 100)
4. Verificar que valor_original não mudou
```

### Caso 2: Cancelamento e Tentativa de Edição

```
1. Criar depósito de R$ 100,00
2. Cancelar o depósito
3. Tentar editar → Deve falhar
4. Verificar que transação permanece cancelada
```

### Caso 3: Ajuste Seguido de Exclusão

```
1. Ajustar saldo para R$ 0,00
2. Excluir carteira
3. Verificar que transação de ajuste foi deletada junto
```

### Caso 4: Geração de PDF com Transações Editadas e Canceladas

```
1. Criar várias transações
2. Editar algumas
3. Cancelar outras
4. Gerar PDF
5. Verificar que badges aparecem corretamente no PDF
```

---

## 8. Relatório de Bugs

Use este template para reportar bugs encontrados:

```
**Bug ID:** [número]
**Severidade:** [Crítica/Alta/Média/Baixa]
**Componente:** [Nome do componente]
**Descrição:** [Descrição detalhada]
**Passos para Reproduzir:**
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

**Resultado Esperado:** [O que deveria acontecer]
**Resultado Atual:** [O que aconteceu]
**Screenshots:** [Se aplicável]
**Logs:** [Erros do console]
```

---

## Conclusão

Todos os testes devem passar antes de considerar a implementação completa. Qualquer falha deve ser documentada e corrigida antes de prosseguir para produção.
