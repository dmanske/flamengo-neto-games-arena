# 🎯 **Exemplos Práticos - Módulo Financeiro**

## 🔗 **1. Integração com Viagens**

### **Como Funciona na Prática:**

#### **Cenário: Viagem para São Paulo**
```
Viagem: "São Paulo - Final do Campeonato"
Data: 15/02/2024
```

#### **Receitas Vinculadas:**
```javascript
// Exemplo de receita vinculada à viagem
{
  id: "rec_001",
  descricao: "Pagamento passageiros - São Paulo",
  valor: 12500.00,
  categoria: "Pagamento de Viagem",
  data_recebimento: "2024-02-10",
  viagem_id: "viagem_sp_001", // ← VINCULAÇÃO COM A VIAGEM
  cliente_id: null,
  status: "recebido"
}
```

#### **Despesas Vinculadas:**
```javascript
// Despesas da mesma viagem
[
  {
    id: "desp_001",
    descricao: "Aluguel ônibus - São Paulo",
    valor: 3500.00,
    categoria: "Aluguel de Ônibus",
    viagem_id: "viagem_sp_001", // ← MESMA VIAGEM
    fornecedor: "Transportes Silva",
    status: "pago"
  },
  {
    id: "desp_002", 
    descricao: "Combustível ida/volta",
    valor: 800.00,
    categoria: "Combustível",
    viagem_id: "viagem_sp_001", // ← MESMA VIAGEM
    fornecedor: "Posto BR",
    status: "pago"
  },
  {
    id: "desp_003",
    descricao: "Pedágio São Paulo",
    valor: 120.00,
    categoria: "Pedágio", 
    viagem_id: "viagem_sp_001", // ← MESMA VIAGEM
    status: "pago"
  }
]
```

#### **Análise de Lucratividade Automática:**
```javascript
// O sistema calcula automaticamente:
const analiseViagem = {
  viagem: "São Paulo - Final do Campeonato",
  receitas_total: 12500.00,
  despesas_total: 4420.00, // (3500 + 800 + 120)
  lucro_liquido: 8080.00,   // (12500 - 4420)
  margem_lucro: 64.6%       // (8080 / 12500 * 100)
}
```

### **Como Usar:**

1. **Ao cadastrar receita/despesa:**
   - Selecione a viagem no dropdown
   - O sistema vincula automaticamente

2. **Na página de detalhes da viagem:**
   - Veja resumo financeiro completo
   - Adicione receitas/despesas diretamente
   - Analise lucratividade em tempo real

3. **Relatórios por viagem:**
   - Filtre por viagem específica
   - Compare lucratividade entre viagens
   - Identifique viagens mais rentáveis

---

## 🔄 **2. Contas Recorrentes**

### **Como Funciona na Prática:**

#### **Cenário: Aluguel Mensal do Galpão**
```javascript
// Conta recorrente configurada uma vez
{
  id: "conta_001",
  descricao: "Aluguel Galpão dos Ônibus",
  valor: 2500.00,
  data_vencimento: "2024-01-05", // Todo dia 5
  fornecedor: "Imobiliária Santos",
  categoria: "Aluguel",
  recorrente: true,              // ← MARCA COMO RECORRENTE
  frequencia_recorrencia: "mensal", // ← FREQUÊNCIA
  status: "pendente"
}
```

#### **O que acontece quando você paga:**

**1. Você marca como "pago":**
```javascript
// Atualização da conta atual
{
  id: "conta_001",
  status: "pago",                    // ← MUDOU PARA PAGO
  data_pagamento: "2024-01-05"       // ← DATA DO PAGAMENTO
}
```

**2. Sistema cria automaticamente a próxima:**
```javascript
// Nova conta criada automaticamente pelo trigger
{
  id: "conta_002",                   // ← NOVO ID
  descricao: "Aluguel Galpão dos Ônibus",
  valor: 2500.00,
  data_vencimento: "2024-02-05",     // ← PRÓXIMO MÊS
  fornecedor: "Imobiliária Santos",
  categoria: "Aluguel",
  recorrente: true,
  frequencia_recorrencia: "mensal",
  status: "pendente"                 // ← NOVA CONTA PENDENTE
}
```

### **Frequências Disponíveis:**

#### **Mensal:**
```
Janeiro → Fevereiro → Março → ...
05/01 → 05/02 → 05/03 → ...
```

#### **Trimestral:**
```
Janeiro → Abril → Julho → Outubro
05/01 → 05/04 → 05/07 → 05/10
```

#### **Semestral:**
```
Janeiro → Julho → Janeiro (próximo ano)
05/01 → 05/07 → 05/01 (2025)
```

#### **Anual:**
```
2024 → 2025 → 2026 → ...
05/01/2024 → 05/01/2025 → 05/01/2026
```

### **Exemplos de Contas Recorrentes Típicas:**

#### **1. Aluguel (Mensal):**
```javascript
{
  descricao: "Aluguel Escritório",
  valor: 1800.00,
  frequencia_recorrencia: "mensal",
  data_vencimento: "2024-01-10" // Todo dia 10
}
```

#### **2. Seguro do Ônibus (Anual):**
```javascript
{
  descricao: "Seguro Frota de Ônibus",
  valor: 8500.00,
  frequencia_recorrencia: "anual",
  data_vencimento: "2024-03-15" // Todo 15 de março
}
```

#### **3. Manutenção Preventiva (Trimestral):**
```javascript
{
  descricao: "Manutenção Preventiva Ônibus",
  valor: 1200.00,
  frequencia_recorrencia: "trimestral",
  data_vencimento: "2024-01-20" // A cada 3 meses
}
```

### **Vantagens das Contas Recorrentes:**

#### **✅ Automação Total:**
- Configure uma vez, funciona para sempre
- Não precisa lembrar de cadastrar todo mês
- Reduz erro humano

#### **✅ Planejamento Financeiro:**
- Previsibilidade de gastos
- Fluxo de caixa mais preciso
- Orçamento anual automático

#### **✅ Controle de Vencimentos:**
- Alertas automáticos
- Nunca mais esqueça um pagamento
- Histórico completo

### **Como Configurar:**

#### **1. Primeira Configuração:**
```
1. Vá em "Contas a Pagar"
2. Clique "Nova Conta"
3. Preencha os dados normalmente
4. Marque "Recorrente" ✓
5. Escolha a frequência
6. Salve
```

#### **2. Pagamento:**
```
1. Na lista, clique "Marcar como Pago"
2. Sistema atualiza a conta atual
3. Cria automaticamente a próxima
4. Você vê as duas na lista
```

#### **3. Gerenciamento:**
```
- Veja todas as recorrentes no dashboard
- Edite valores para próximas parcelas
- Cancele recorrência se necessário
- Histórico completo de pagamentos
```

---

## 📊 **3. Relatórios de Lucratividade por Viagem**

### **Exemplo de Relatório:**

```
RELATÓRIO DE LUCRATIVIDADE - JANEIRO 2024

┌─────────────────────────────────────────────────────────────┐
│ VIAGEM: São Paulo - Final do Campeonato                    │
├─────────────────────────────────────────────────────────────┤
│ Receitas:                                                   │
│ • Pagamento passageiros............ R$ 12.500,00          │
│ • Taxa de embarque................. R$    300,00          │
│ TOTAL RECEITAS..................... R$ 12.800,00          │
│                                                             │
│ Despesas:                                                   │
│ • Aluguel ônibus................... R$  3.500,00          │
│ • Combustível...................... R$    800,00          │
│ • Pedágio.......................... R$    120,00          │
│ • Alimentação motorista............ R$    150,00          │
│ TOTAL DESPESAS..................... R$  4.570,00          │
│                                                             │
│ LUCRO LÍQUIDO...................... R$  8.230,00          │
│ MARGEM DE LUCRO.................... 64,3%                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ VIAGEM: Rio de Janeiro - Jogo Clássico                     │
├─────────────────────────────────────────────────────────────┤
│ Receitas:                                                   │
│ • Pagamento passageiros............ R$  8.500,00          │
│ TOTAL RECEITAS..................... R$  8.500,00          │
│                                                             │
│ Despesas:                                                   │
│ • Aluguel ônibus................... R$  2.800,00          │
│ • Combustível...................... R$    650,00          │
│ • Pedágio.......................... R$     80,00          │
│ TOTAL DESPESAS..................... R$  3.530,00          │
│                                                             │
│ LUCRO LÍQUIDO...................... R$  4.970,00          │
│ MARGEM DE LUCRO.................... 58,5%                  │
└─────────────────────────────────────────────────────────────┘

RESUMO DO MÊS:
• Total de viagens: 2
• Receita total: R$ 21.300,00
• Despesa total: R$ 8.100,00
• Lucro total: R$ 13.200,00
• Margem média: 62,0%
```

---

## 🎯 **4. Fluxo Completo de Uso**

### **Cenário Real: Organizando uma Excursão**

#### **Passo 1: Planejamento (Antes da Viagem)**
```
1. Crie a viagem no sistema
2. Cadastre despesas previstas:
   - Aluguel do ônibus
   - Combustível estimado
   - Pedágios
3. Configure preço por passageiro
4. Acompanhe vendas/receitas
```

#### **Passo 2: Durante a Venda**
```
1. Cada pagamento recebido:
   - Cadastre como receita
   - Vincule à viagem
   - Marque cliente (se aplicável)
2. Acompanhe em tempo real:
   - Quantos já pagaram
   - Quanto falta arrecadar
   - Lucratividade atual
```

#### **Passo 3: Execução (Durante a Viagem)**
```
1. Registre gastos reais:
   - Combustível real
   - Alimentação
   - Imprevistos
2. Compare com planejado
3. Ajuste próximas viagens
```

#### **Passo 4: Pós-Viagem (Análise)**
```
1. Feche todas as contas
2. Analise lucratividade final
3. Compare com outras viagens
4. Gere relatórios
5. Planeje melhorias
```

---

## 💡 **Dicas Práticas**

### **Para Receitas:**
- Sempre vincule à viagem correspondente
- Use categorias consistentes
- Anexe comprovantes importantes
- Marque status corretamente

### **Para Despesas:**
- Configure contas recorrentes logo no início
- Vincule despesas às viagens quando possível
- Use fornecedores padronizados
- Monitore vencimentos regularmente

### **Para Análises:**
- Compare viagens similares
- Identifique padrões de gastos
- Ajuste preços baseado na lucratividade
- Use relatórios para decisões

---

**🚀 Com essas funcionalidades, você tem controle total sobre a parte financeira do seu negócio de turismo!**