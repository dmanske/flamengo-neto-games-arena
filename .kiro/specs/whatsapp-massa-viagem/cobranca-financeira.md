# Sistema de Cobrança Financeira - WhatsApp Massa

## 📋 Resumo
Integração do sistema financeiro com as mensagens de WhatsApp para enviar cobranças personalizadas baseadas nos dados reais de pagamento de cada passageiro.

## 🎯 Objetivo
Automatizar mensagens de cobrança com dados financeiros reais do sistema, mostrando:
- Valor total da viagem
- Valor já pago
- Saldo devedor
- Status do pagamento
- Datas relevantes

## 💡 Funcionalidades Propostas

### 1. Dados Financeiros por Passageiro
- **Valor total da viagem** (por passageiro)
- **Valor já pago** (soma dos pagamentos)
- **Saldo devedor** (total - pago)
- **Data do último pagamento**
- **Forma de pagamento** (PIX, dinheiro, cartão)
- **Status** (pago, pendente, atrasado)

### 2. Templates de Cobrança Inteligentes

#### 🔴 Cobrança Urgente (Saldo Alto > R$ 100)
```
Oi {nome}! ⚠️

Sua viagem para o jogo FLAMENGO x {adversario} está confirmada, mas ainda temos pendências:

💰 Valor total: R$ {valorTotal}
✅ Já pago: R$ {valorPago}
🔴 Saldo devedor: R$ {saldoDevedor}

⏰ Prazo final: {prazoFinal}
📅 Último pagamento: {ultimoPagamento}

Por favor, regularize até {prazoFinal} para garantir sua vaga!

PIX: [chave-pix]
```

#### 🟡 Lembrete Amigável (Saldo R$ 50-100)
```
Oi {nome}! 😊

Quase lá! Falta pouco para quitar sua viagem:

🎯 FLAMENGO x {adversario}
💰 Restam apenas: R$ {saldoDevedor}
✅ Já pago: R$ {valorPago} de R$ {valorTotal}

Quando puder, finalize o pagamento! 
PIX: [chave-pix]

Obrigado! 🔴⚫
```

#### ✅ Confirmação de Pagamento
```
{nome}, pagamento confirmado! ✅

🎉 Sua vaga está garantida!
💰 Valor pago: R$ {valorPago}
📅 Data: {dataPagamento}

Detalhes da viagem:
🔥 FLAMENGO x {adversario}
📅 {dataJogo}
🚌 Ônibus: {onibus}

Nos vemos lá! 🔴⚫
```

### 3. Filtros por Status Financeiro
- 📊 **Todos os Status**
- 🔴 **Com Saldo Devedor**
- ✅ **Pagamento em Dia**
- ⚠️ **Pagamento Atrasado**

### 4. Regras de Negócio
- **Saldo > R$ 100**: Template urgente
- **Saldo R$ 50-100**: Template lembrete
- **Saldo < R$ 50**: Template amigável
- **Pago**: Template confirmação

## 🛠️ Implementação Técnica

### Hook Financeiro
```typescript
const useFinanceiroPassageiro = (passageiroId: string, viagemId: string) => {
  const { data: financeiro } = useQuery({
    queryKey: ['financeiro', passageiroId, viagemId],
    queryFn: () => buscarFinanceiroPassageiro(passageiroId, viagemId)
  });

  return {
    valorTotal: financeiro?.valor_total || 0,
    valorPago: financeiro?.valor_pago || 0,
    saldoDevedor: (financeiro?.valor_total || 0) - (financeiro?.valor_pago || 0),
    ultimoPagamento: financeiro?.ultimo_pagamento,
    status: financeiro?.status
  };
};
```

### Template Dinâmico por Status
```typescript
const getTemplatePorStatus = (status: string) => {
  switch (status) {
    case 'devedor_alto': return TEMPLATE_COBRANCA_URGENTE;
    case 'devedor_baixo': return TEMPLATE_LEMBRETE_AMIGAVEL;
    case 'pago': return TEMPLATE_CONFIRMACAO;
    case 'atrasado': return TEMPLATE_COBRANCA_ATRASADO;
    default: return TEMPLATE_PADRAO;
  }
};
```

### Consulta SQL Necessária
```sql
-- Buscar dados financeiros por passageiro
SELECT 
  vp.passageiro_id,
  vp.valor_total,
  COALESCE(SUM(p.valor), 0) as valor_pago,
  (vp.valor_total - COALESCE(SUM(p.valor), 0)) as saldo_devedor,
  MAX(p.data_pagamento) as ultimo_pagamento,
  CASE 
    WHEN (vp.valor_total - COALESCE(SUM(p.valor), 0)) <= 0 THEN 'pago'
    WHEN (vp.valor_total - COALESCE(SUM(p.valor), 0)) > 100 THEN 'devedor_alto'
    WHEN (vp.valor_total - COALESCE(SUM(p.valor), 0)) > 50 THEN 'devedor_baixo'
    ELSE 'devedor_baixo'
  END as status
FROM viagem_passageiros vp
LEFT JOIN pagamentos p ON p.viagem_passageiro_id = vp.id
WHERE vp.viagem_id = $1
GROUP BY vp.passageiro_id, vp.valor_total;
```

## 📁 Arquivos a Criar/Modificar

### Novos Arquivos
- `src/hooks/useFinanceiroPassageiro.ts` - Hook para dados financeiros
- `src/services/financeiroService.ts` - Serviço para buscar dados financeiros
- `src/components/whatsapp-massa/FiltroFinanceiro.tsx` - Filtro por status financeiro

### Arquivos a Modificar
- `src/hooks/useTemplatesMensagem.ts` - Adicionar templates de cobrança
- `src/components/whatsapp-massa/WhatsAppMassaModal.tsx` - Integrar dados financeiros
- `src/components/whatsapp-massa/TemplatesMensagem.tsx` - Templates dinâmicos por status

## 🔄 Funcionalidades Avançadas (Futuro)

### Histórico de Cobrança
- Registrar quando foi enviada cobrança
- Evitar spam (não enviar todo dia)
- Mostrar última cobrança enviada

### Automação
- Envio automático de cobrança X dias antes do vencimento
- Escalonamento de templates (amigável → urgente)
- Integração com sistema de notificações

### Relatórios
- Dashboard de cobranças enviadas
- Taxa de conversão (cobrança → pagamento)
- Análise de efetividade dos templates

## 📊 Métricas de Sucesso
- Redução do tempo gasto em cobranças manuais
- Aumento na taxa de pagamentos em dia
- Melhoria na comunicação com passageiros
- Redução de inadimplência

## ⚠️ Considerações
- **Privacidade**: Dados financeiros sensíveis
- **Segurança**: Validar permissões de acesso
- **Performance**: Cache de dados financeiros
- **UX**: Interface clara para diferentes status

---

**Status**: 📋 Documentado - Aguardando implementação
**Prioridade**: 🟡 Média
**Estimativa**: 2-3 dias de desenvolvimento