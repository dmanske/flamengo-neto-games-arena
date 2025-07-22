# 🎯 **Sistema Financeiro Completo - Controle por Viagem e Cliente**

## 📋 **Visão Geral**

O sistema financeiro agora oferece controle completo por viagem e por cliente, permitindo:

- ✅ **Controle de pagamentos por viagem** (quem pagou, quanto falta)
- ✅ **Orçamento vs realizado por viagem** (custos planejados vs reais)
- ✅ **Extrato completo do cliente** (histórico de débitos e créditos)
- ✅ **Análise de lucratividade por viagem**
- ✅ **Controle de inadimplência**

## 🗄️ **Estrutura do Banco de Dados**

### **Novas Tabelas Criadas:**

#### **1. `pagamentos_viagem`**
Controla os pagamentos de cada passageiro por viagem:
```sql
- viagem_id (referência à viagem)
- cliente_id (referência ao cliente)
- valor_total (valor que o cliente deve pagar)
- valor_pago (quanto já foi pago)
- valor_pendente (calculado automaticamente)
- status (pendente, pago, parcial, vencido)
```

#### **2. `parcelas_pagamento`**
Registra cada pagamento individual:
```sql
- pagamento_viagem_id (referência ao pagamento principal)
- valor (valor da parcela)
- data_pagamento
- metodo_pagamento
- comprovante_url
```

#### **3. `orcamento_viagem`**
Controla custos planejados vs reais por viagem:
```sql
- viagem_id
- categoria (combustível, ônibus, etc.)
- valor_planejado
- valor_real
- status (planejado, executado)
```

#### **4. `extrato_cliente`**
Histórico financeiro completo do cliente:
```sql
- cliente_id
- tipo (débito ou crédito)
- valor
- saldo_anterior
- saldo_atual
- descrição
```

## 🚀 **Como Usar na Prática**

### **1. Configuração Inicial de uma Viagem**

#### **Passo 1: Criar Orçamento da Viagem**
```javascript
// Exemplo: Viagem São Paulo
const orcamento = [
  {
    categoria: "Aluguel de Ônibus",
    descricao: "Ônibus 50 lugares - 2 dias",
    valor_planejado: 3500.00
  },
  {
    categoria: "Combustível", 
    descricao: "Ida e volta SP",
    valor_planejado: 800.00
  },
  {
    categoria: "Pedágio",
    descricao: "Pedágios ida/volta",
    valor_planejado: 120.00
  }
];
// Total planejado: R$ 4.420,00
```

#### **Passo 2: Cadastrar Pagamentos dos Passageiros**
```javascript
// Para cada passageiro inscrito
const pagamento = {
  viagem_id: "viagem_sp_001",
  cliente_id: "cliente_123",
  valor_total: 250.00, // Preço da passagem
  data_vencimento: "2024-02-10"
};
```

### **2. Durante a Venda (Recebimento de Pagamentos)**

#### **Registrar Pagamento Parcial:**
```javascript
const parcela = {
  pagamento_viagem_id: "pag_001",
  valor: 100.00,
  data_pagamento: "2024-01-15",
  metodo_pagamento: "pix"
};
// Sistema atualiza automaticamente:
// - valor_pago: 100.00
// - valor_pendente: 150.00
// - status: "parcial"
```

#### **Pagamento Completo:**
```javascript
const parcela = {
  pagamento_viagem_id: "pag_001", 
  valor: 150.00,
  data_pagamento: "2024-01-20",
  metodo_pagamento: "dinheiro"
};
// Sistema atualiza automaticamente:
// - valor_pago: 250.00
// - valor_pendente: 0.00
// - status: "pago"
```

### **3. Durante a Viagem (Registro de Custos Reais)**

#### **Marcar Orçamento como Executado:**
```javascript
// Quando pagar o ônibus
marcarComoExecutado("orc_001", 3600.00); // R$ 100 a mais que o planejado

// Quando abastecer
marcarComoExecutado("orc_002", 750.00); // R$ 50 a menos que o planejado
```

### **4. Análise Pós-Viagem**

#### **Resumo Automático da Viagem:**
```javascript
const resumo = {
  viagem: "São Paulo - Final do Campeonato",
  
  // Receitas
  receita_prevista: 12500.00,  // 50 passageiros × R$ 250
  receita_recebida: 11800.00,  // 47 pagaram, 3 pendentes
  receita_pendente: 700.00,
  
  // Despesas  
  despesa_planejada: 4420.00,
  despesa_real: 4470.00,      // R$ 50 a mais que o planejado
  
  // Resultado
  lucro_real: 7330.00,        // 11800 - 4470
  lucro_previsto: 8080.00,    // 12500 - 4420
  
  // Passageiros
  total_passageiros: 50,
  passageiros_pagos: 47,
  passageiros_pendentes: 3
};
```

## 💰 **Controle de Clientes**

### **Extrato do Cliente**
O sistema mantém um extrato completo de cada cliente:

```javascript
const extratoCliente = [
  {
    data: "2024-01-10",
    tipo: "debito",
    valor: 250.00,
    descricao: "Viagem São Paulo - Final",
    saldo_anterior: 0.00,
    saldo_atual: 250.00
  },
  {
    data: "2024-01-15", 
    tipo: "credito",
    valor: 100.00,
    descricao: "Pagamento parcial - PIX",
    saldo_anterior: 250.00,
    saldo_atual: 150.00
  },
  {
    data: "2024-01-20",
    tipo: "credito", 
    valor: 150.00,
    descricao: "Pagamento final - Dinheiro",
    saldo_anterior: 150.00,
    saldo_atual: 0.00
  }
];
```

### **Situação do Cliente:**
- **Saldo > 0**: Cliente devedor
- **Saldo < 0**: Cliente tem crédito
- **Saldo = 0**: Cliente quitado

## 📊 **Relatórios Disponíveis**

### **1. Resumo Financeiro por Viagem**
```sql
SELECT * FROM view_resumo_financeiro_viagem 
WHERE viagem_id = 'viagem_sp_001';
```

### **2. Saldo de Todos os Clientes**
```sql
SELECT * FROM view_saldo_cliente 
ORDER BY saldo_atual DESC;
```

### **3. Clientes Devedores**
```sql
SELECT * FROM view_saldo_cliente 
WHERE situacao = 'devedor'
ORDER BY saldo_atual DESC;
```

### **4. Viagens Mais Lucrativas**
```sql
SELECT adversario, lucro_real, margem_lucro
FROM view_resumo_financeiro_viagem 
WHERE lucro_real > 0
ORDER BY lucro_real DESC;
```

## 🎯 **Funcionalidades Automáticas**

### **1. Atualização de Status**
- Pagamento completo → Status "pago"
- Pagamento parcial → Status "parcial"  
- Vencimento passado → Status "vencido"

### **2. Cálculo de Saldos**
- Valor pendente calculado automaticamente
- Extrato do cliente atualizado em tempo real
- Saldos consolidados por cliente

### **3. Triggers do Banco**
- Atualização automática de valores pagos
- Criação de entradas no extrato
- Validação de dados

## 🔧 **Como Implementar**

### **1. Execute as Migrações**
```sql
-- Execute no Supabase SQL Editor
\i sql/financeiro/00_run_all_migrations.sql
```

### **2. Use os Hooks**
```javascript
// Para pagamentos por viagem
import { usePagamentosViagem } from '@/hooks/financeiro/usePagamentosViagem';

// Para orçamento por viagem  
import { useOrcamentoViagem } from '@/hooks/financeiro/useOrcamentoViagem';

// Para extrato do cliente
import { useExtratoCliente } from '@/hooks/financeiro/useExtratoCliente';
```

### **3. Componente Completo**
```javascript
import { ControleFinanceiroViagem } from '@/components/financeiro/viagem/ControleFinanceiroViagem';

// Na página de detalhes da viagem
<ControleFinanceiroViagem 
  viagemId={viagemId}
  viagemNome={viagem.adversario}
  dataViagem={viagem.data_jogo}
  precoPassagem={viagem.valor_padrao}
/>
```

## 📈 **Benefícios do Sistema**

### **Para o Negócio:**
- ✅ **Controle total** de receitas e despesas por viagem
- ✅ **Análise de lucratividade** precisa
- ✅ **Gestão de inadimplência** eficiente
- ✅ **Planejamento financeiro** baseado em dados reais

### **Para o Usuário:**
- ✅ **Interface intuitiva** para controle financeiro
- ✅ **Relatórios automáticos** e em tempo real
- ✅ **Alertas** de pagamentos pendentes
- ✅ **Histórico completo** de cada cliente

### **Para os Clientes:**
- ✅ **Transparência** nos pagamentos
- ✅ **Flexibilidade** para pagamentos parciais
- ✅ **Histórico** de todas as transações

## 🎉 **Resultado Final**

Com este sistema você terá:

1. **Controle Completo por Viagem**: Saiba exatamente quanto cada viagem rendeu
2. **Gestão de Clientes**: Controle quem deve, quem tem crédito, quem está em dia
3. **Orçamento vs Realizado**: Compare custos planejados com reais
4. **Relatórios Automáticos**: Dados sempre atualizados e precisos
5. **Tomada de Decisão**: Base sólida para precificar e planejar viagens

**🚀 Agora você tem um sistema financeiro profissional e completo para seu negócio de turismo!**