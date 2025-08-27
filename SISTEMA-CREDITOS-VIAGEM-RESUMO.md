# 💳 Sistema de Créditos de Viagem - Resumo Completo

## 📋 Visão Geral

O Sistema de Créditos de Viagem é uma funcionalidade que permite aos clientes pagarem antecipadamente por viagens futuras, criando um "saldo" que pode ser utilizado posteriormente para quitar viagens específicas.

## 🎯 Objetivo Principal

Facilitar o pagamento de viagens permitindo que clientes:
- Paguem antecipadamente e acumulem créditos
- Utilizem esses créditos para quitar viagens futuras
- Tenham flexibilidade no pagamento (valor exato, sobra ou falta)
- Registrem pagamentos adicionais quando necessário

## 🔧 Como Funciona

### 1. **Criação de Créditos**
- Cliente realiza pagamento antecipado
- Valor é registrado como crédito disponível
- Crédito fica vinculado ao cliente
- Status inicial: "Disponível"

### 2. **Vinculação com Viagem**
- Cliente escolhe uma viagem para usar o crédito
- Sistema calcula automaticamente:
  - Valor da viagem (base)
  - Valor dos ingressos (se selecionados)
  - Valor dos passeios (se selecionados)
  - Total necessário vs crédito disponível

### 3. **Cenários de Pagamento**

#### 🟢 **Valor Exato**
- Crédito = Valor total da viagem
- Passageiro fica "Pago Completo"
- Crédito totalmente utilizado

#### 🔵 **Sobra de Crédito**
- Crédito > Valor total da viagem
- Passageiro fica "Pago Completo"
- Sobra permanece como crédito disponível

#### 🟡 **Valor Faltante**
- Crédito < Valor total da viagem
- Sistema oferece duas opções:
  - **"Registrar Pagamento Agora"**: Cria registro automático do valor faltante
  - **"Deixar Pendente"**: Apenas vincula o crédito, deixa saldo pendente

### 4. **Integração com Sistema de Pagamentos Separados**
- Funciona com o novo sistema de categorização (viagem vs passeios)
- Créditos são incluídos no cálculo do breakdown de pagamento
- Status do passageiro é atualizado automaticamente
- Histórico de pagamentos é mantido

## 🏗️ Arquitetura Técnica

### **Tabelas Principais**
- `cliente_creditos`: Armazena os créditos dos clientes
- `credito_viagem_vinculacoes`: Histórico de vinculações
- `historico_pagamentos_categorizado`: Pagamentos adicionais
- `viagem_passageiros`: Passageiros com créditos vinculados

### **Componentes Principais**
- `VincularCreditoModal`: Modal principal de vinculação
- `CreditoDetailsModal`: Detalhes e gestão de créditos
- `usePagamentosSeparados`: Hook para pagamentos categorizados
- `useCreditos`: Hook para gestão de créditos

### **Fluxo de Dados**
1. **Seleção**: Cliente + Viagem + Ônibus + Passeios/Ingressos
2. **Cálculo**: Sistema calcula valores e cenários
3. **Validação**: Verifica disponibilidade e restrições
4. **Execução**: Vincula crédito e registra pagamentos
5. **Atualização**: Atualiza status e dados em tempo real

## 🎨 Interface do Usuário

### **Modal de Vinculação**
- Seleção de viagem disponível
- Escolha obrigatória de ônibus
- Seleção opcional de ingressos e passeios
- Cálculo automático em tempo real
- Feedback visual claro sobre cenários

### **Modal de Pagamento Faltante**
- Aparece quando crédito é insuficiente
- Oferece opções claras ao usuário
- Explica as consequências de cada escolha
- Permite continuidade do processo

### **Resultado da Vinculação**
- Mostra resumo completo da operação
- Indica se pagamento adicional foi registrado
- Fornece navegação direta para a viagem
- Feedback visual com cores apropriadas

## 📊 Status e Estados

### **Status de Crédito**
- ✅ **Disponível**: Pode ser usado
- 🟡 **Parcial**: Parcialmente utilizado
- 🔴 **Utilizado**: Totalmente usado
- 💸 **Reembolsado**: Devolvido ao cliente

### **Status de Pagamento (Integrado)**
- ✅ **Pago Completo**: Viagem + Passeios pagos
- 🟡 **Viagem Paga**: Só viagem paga (crédito)
- 🟡 **Passeios Pagos**: Só passeios pagos
- 🔴 **Pendente**: Nada pago
- 🎁 **Brinde**: Cortesia

## 🔄 Fluxo Completo de Uso

### **1. Cadastro de Crédito**
```
Cliente → Pagamento Antecipado → Crédito Disponível
```

### **2. Vinculação**
```
Crédito → Seleção de Viagem → Cálculo → Vinculação → Resultado
```

### **3. Cenários**
```
Valor Exato    → Pago Completo
Sobra         → Pago Completo + Crédito Restante
Falta         → Modal de Opções → Pago/Pendente
```

## 🎯 Benefícios

### **Para o Cliente**
- Flexibilidade de pagamento
- Pagamento antecipado facilitado
- Controle sobre uso dos créditos
- Transparência total no processo

### **Para a Empresa**
- Fluxo de caixa antecipado
- Redução de inadimplência
- Automação de processos
- Controle financeiro aprimorado

### **Para o Sistema**
- Integração perfeita com pagamentos existentes
- Rastreabilidade completa
- Atualizações automáticas
- Consistência de dados

## 🚀 Funcionalidades Avançadas

### **Registro Automático de Pagamento**
- Quando há valor faltante
- Usuário pode escolher registrar automaticamente
- Cria entrada no histórico categorizado
- Atualiza status para "Pago Completo"

### **Validações Inteligentes**
- Verifica disponibilidade de ônibus
- Evita passageiros duplicados
- Valida saldos e valores
- Oferece feedback em tempo real

### **Integração Completa**
- Funciona com sistema de pagamentos separados
- Atualiza dados em múltiplas telas
- Mantém consistência em tempo real
- Suporte a múltiplos cenários

## 📈 Métricas e Controle

### **Dashboards**
- Total de créditos por cliente
- Valor disponível vs utilizado
- Histórico de vinculações
- Status de pagamentos

### **Relatórios**
- Créditos por período
- Vinculações realizadas
- Valores faltantes/sobras
- Performance do sistema

## 🔧 Manutenção e Suporte

### **Operações Administrativas**
- Edição de créditos
- Cancelamento de vinculações
- Reembolsos
- Correções manuais

### **Monitoramento**
- Logs detalhados de operações
- Rastreamento de erros
- Performance de queries
- Integridade de dados

---

## 🎉 Conclusão

O Sistema de Créditos de Viagem oferece uma solução completa e integrada para pagamentos antecipados, proporcionando flexibilidade aos clientes e controle à empresa, com interface intuitiva e funcionalidades avançadas que se integram perfeitamente ao sistema existente.