# Diferença entre Despesas e Contas a Pagar

## 📊 **DESPESAS**
- **Conceito**: Gastos gerais do negócio, podem ser pontuais ou relacionados a viagens específicas
- **Características**:
  - Podem estar vinculadas a uma viagem específica
  - Fornecedor é opcional
  - Foco em categorização de gastos operacionais
  - Exemplos: Combustível, Alimentação, Hospedagem, Manutenção

## 💳 **CONTAS A PAGAR**
- **Conceito**: Compromissos financeiros fixos e recorrentes da empresa
- **Características**:
  - Fornecedor é obrigatório
  - Podem ser recorrentes (mensal, trimestral, etc.)
  - Foco em obrigações financeiras regulares
  - Exemplos: Aluguel, Energia, Internet, Seguros, Financiamentos

## 🔧 **Problemas Corrigidos**

### ✅ Despesas:
- ❌ **Problema**: Formulário não salvava (erro nos nomes das funções do hook)
- ✅ **Solução**: Corrigido para usar `createDespesa` em vez de `adicionarDespesa`
- ❌ **Problema**: Status 'paga' vs 'pago' (inconsistência de tipos)
- ✅ **Solução**: Padronizado para 'pago' conforme banco de dados
- ❌ **Problema**: Dialog complexo causava tela branca
- ✅ **Solução**: Substituído por modal simples + formulário básico

### ✅ Contas a Pagar:
- ❌ **Problema**: Dados fictícios (mock) em vez de dados reais
- ✅ **Solução**: Integrado com hook real `useContasPagar`
- ❌ **Problema**: Não salvava no Supabase
- ✅ **Solução**: Conectado corretamente com o banco de dados
- ❌ **Problema**: Dialog complexo
- ✅ **Solução**: Substituído por modal simples + formulário básico

## 🎯 **Como usar agora**

### Nova Despesa:
1. Clique em "Nova Despesa" (botão vermelho)
2. Preencha: Descrição, Valor, Categoria, Data de Vencimento
3. Fornecedor é opcional
4. Salva no banco e atualiza a lista automaticamente

### Nova Conta a Pagar:
1. Clique em "Nova Conta" (botão amarelo)
2. Preencha: Descrição, Valor, Categoria, Fornecedor (obrigatório), Data de Vencimento
3. Marque se é recorrente (opcional)
4. Salva no banco e atualiza a lista automaticamente

## 📋 **Funcionalidades Implementadas**
- ✅ Formulários básicos e robustos
- ✅ Validação de campos obrigatórios
- ✅ Salvamento no Supabase
- ✅ Atualização automática das listas
- ✅ Botões para atualizar manualmente
- ✅ Tratamento de erros
- ✅ Logs de debug no console
- ✅ Modais simples (sem dependências complexas)