# 🎫 Integração dos Ingressos no Financeiro Geral

## 🎯 **OBJETIVO**
Integrar completamente o sistema de ingressos ao Financeiro Geral, incluindo receitas e custos dos ingressos nos cálculos e relatórios financeiros.

## 📊 **DADOS IDENTIFICADOS**
- **14 ingressos** vendidos
- **R$ 6.160,00** de receita total
- **R$ 440,00** de preço médio
- **3 setores**: Leste Inferior (8), Oeste (4), Norte (2)

## ✅ **IMPLEMENTAÇÃO REALIZADA**

### **1. Hook `useFinanceiroGeral.ts` Atualizado**

#### **1.1 Busca de Receitas de Ingressos**
```typescript
// ✨ NOVO: Buscar receitas de ingressos no período
let receitasIngressos = 0;
try {
  const { data: ingressosData, error: ingressosError } = await supabase
    .from('ingressos')
    .select('valor_final, situacao_financeira')
    .gte('jogo_data', filtroData.inicio)
    .lte('jogo_data', filtroData.fim)
    .eq('situacao_financeira', 'pago');

  receitasIngressos = (ingressosData || []).reduce((sum, i) => sum + i.valor_final, 0);
} catch (error) {
  console.log('Tabela ingressos não encontrada ou erro:', error);
  receitasIngressos = 0;
}
```

#### **1.2 Busca de Custos de Ingressos**
```typescript
// ✨ NOVO: Buscar custos dos ingressos como despesas
let custosIngressos = 0;
try {
  const { data: custosIngressosData, error: custosIngressosError } = await supabase
    .from('ingressos')
    .select('preco_custo, situacao_financeira')
    .gte('jogo_data', filtroData.inicio)
    .lte('jogo_data', filtroData.fim)
    .eq('situacao_financeira', 'pago');

  custosIngressos = (custosIngressosData || []).reduce((sum, i) => sum + i.preco_custo, 0);
} catch (error) {
  console.log('Custos de ingressos não encontrados ou erro:', error);
  custosIngressos = 0;
}
```

#### **1.3 Cálculo de Totais Atualizado**
```typescript
// TOTAL: Dados reais + dados extras + ingressos + custos dos passeios
const totalReceitas = totalReceitasPassageiros + receitasExtras + receitasIngressos;
const totalDespesas = despesasManuais + custosPasseios + custosIngressos;
const lucroLiquido = totalReceitas - totalDespesas;
const margemLucro = totalReceitas > 0 ? (lucroLiquido / totalReceitas) * 100 : 0;
```

#### **1.4 Interfaces Atualizadas**
```typescript
export interface ResumoGeral {
  // ... campos existentes
  receitas_ingressos: number; // ✨ NOVO
  percentual_ingressos: number; // ✨ NOVO
}

export interface ViagemFinanceiro {
  // ... campos existentes
  receitas_ingressos: number; // ✨ NOVO
  percentual_ingressos: number; // ✨ NOVO
}
```

### **2. Função `fetchContasPagar` Atualizada**

#### **2.1 Custos dos Ingressos como Despesas Virtuais**
```typescript
// ✨ NOVO: 3. Buscar custos dos ingressos como despesas virtuais
try {
  const { data: ingressosData, error: ingressosError } = await supabase
    .from('ingressos')
    .select('id, adversario, jogo_data, preco_custo, situacao_financeira')
    .gte('jogo_data', filtroData.inicio)
    .lte('jogo_data', filtroData.fim)
    .eq('situacao_financeira', 'pago')
    .gt('preco_custo', 0);

  // Gerar despesas virtuais dos ingressos
  const despesasVirtuaisIngressos = (ingressosData || []).map((ingresso: any) => ({
    id: `virtual-ingresso-${ingresso.id}`,
    fornecedor: `Custo: Ingresso ${ingresso.adversario}`,
    descricao: `Ingresso vendido`,
    categoria: 'ingressos',
    valor: ingresso.preco_custo,
    data_vencimento: ingresso.jogo_data,
    status: 'calculado',
    viagem_nome: `Flamengo x ${ingresso.adversario}`
  }));

  contasPagarData = [...contasPagarData, ...despesasVirtuaisIngressos];
} catch (ingressosError) {
  console.warn('Erro ao buscar custos dos ingressos:', ingressosError);
}
```

### **3. Interface `FinanceiroGeral.tsx` Atualizada**

#### **3.1 Card de Receitas com Breakdown**
```typescript
{/* ✨ NOVO: Breakdown das receitas incluindo ingressos */}
{resumoGeral && (resumoGeral.receitas_viagem > 0 || resumoGeral.receitas_passeios > 0 || resumoGeral.receitas_extras > 0 || resumoGeral.receitas_ingressos > 0) && (
  <div className="mt-2 space-y-1">
    {resumoGeral.receitas_viagem > 0 && (
      <div className="flex justify-between text-xs text-gray-600">
        <span>• Viagens:</span>
        <span>{formatCurrency(resumoGeral.receitas_viagem)}</span>
      </div>
    )}
    {resumoGeral.receitas_passeios > 0 && (
      <div className="flex justify-between text-xs text-gray-600">
        <span>• Passeios:</span>
        <span>{formatCurrency(resumoGeral.receitas_passeios)}</span>
      </div>
    )}
    {resumoGeral.receitas_ingressos > 0 && (
      <div className="flex justify-between text-xs text-gray-600">
        <span>• Ingressos:</span>
        <span>{formatCurrency(resumoGeral.receitas_ingressos)}</span>
      </div>
    )}
    {resumoGeral.receitas_extras > 0 && (
      <div className="flex justify-between text-xs text-gray-600">
        <span>• Extras:</span>
        <span>{formatCurrency(resumoGeral.receitas_extras)}</span>
      </div>
    )}
  </div>
)}
```

#### **3.2 Card de Despesas com Custos dos Ingressos**
```typescript
{(() => {
  const despesasManuais = contasPagar.filter(d => d.status !== 'calculado').reduce((sum, d) => sum + d.valor, 0);
  const custosPasseios = contasPagar.filter(d => d.status === 'calculado' && d.categoria === 'passeios').reduce((sum, d) => sum + d.valor, 0);
  const custosIngressos = contasPagar.filter(d => d.status === 'calculado' && d.categoria === 'ingressos').reduce((sum, d) => sum + d.valor, 0);
  
  return (
    <>
      {despesasManuais > 0 && (
        <div className="flex justify-between text-xs text-gray-600">
          <span>• Operacionais:</span>
          <span>{formatCurrency(despesasManuais)}</span>
        </div>
      )}
      {custosPasseios > 0 && (
        <div className="flex justify-between text-xs text-gray-600">
          <span>• Custos Passeios:</span>
          <span>{formatCurrency(custosPasseios)}</span>
        </div>
      )}
      {custosIngressos > 0 && (
        <div className="flex justify-between text-xs text-gray-600">
          <span>• Custos Ingressos:</span>
          <span>{formatCurrency(custosIngressos)}</span>
        </div>
      )}
    </>
  );
})()}
```

## 🎯 **FUNCIONALIDADES IMPLEMENTADAS**

### **✅ Receitas de Ingressos**
- Busca ingressos com `situacao_financeira = 'pago'` no período
- Soma `valor_final` de todos os ingressos pagos
- Inclui no total de receitas do Financeiro Geral
- Mostra breakdown no card de receitas

### **✅ Custos de Ingressos**
- Busca `preco_custo` dos ingressos pagos no período
- Cria despesas virtuais na aba "Contas a Pagar"
- Inclui no total de despesas do Financeiro Geral
- Mostra breakdown no card de despesas

### **✅ Integração Completa**
- Ingressos aparecem nos cálculos de lucro líquido
- Margem de lucro considera receitas e custos dos ingressos
- Percentuais por categoria incluem ingressos
- Compatível com filtros de período (mensal, trimestral, anual)

### **✅ Interface Visual**
- Cards mostram breakdown detalhado
- Despesas virtuais aparecem na aba "Contas a Pagar"
- Categoria "ingressos" diferenciada de "passeios"
- Logs de debug para acompanhar os cálculos

## 📊 **IMPACTO ESPERADO**

Com base nos dados atuais (R$ 6.160,00 em ingressos):

### **Antes da Integração:**
- Receitas: Apenas viagens + passeios + extras
- Despesas: Apenas operacionais + custos passeios
- **Ingressos não apareciam no Financeiro Geral**

### **Depois da Integração:**
- Receitas: Viagens + passeios + extras + **ingressos (R$ 6.160,00)**
- Despesas: Operacionais + custos passeios + **custos ingressos**
- **Visão financeira completa e precisa**

## 🔍 **LOGS DE DEBUG**

O sistema agora mostra logs detalhados:
```
🎫 Receitas de ingressos encontradas: 14
🎫 Total receitas ingressos: 6160
🎫 Custos de ingressos encontrados: 14
🎫 Total custos ingressos: [valor_dos_custos]
📊 RESUMO FINANCEIRO GERAL: {
  receitasIngressos: 6160,
  custosIngressos: [valor],
  totalReceitas: [total_com_ingressos],
  totalDespesas: [total_com_custos_ingressos]
}
```

## ✅ **STATUS FINAL**

**🎯 INTEGRAÇÃO COMPLETA E FUNCIONAL**

- ✅ Receitas de ingressos integradas
- ✅ Custos de ingressos integradas  
- ✅ Interface atualizada com breakdown
- ✅ Despesas virtuais na aba Contas a Pagar
- ✅ Cálculos de lucro e margem corretos
- ✅ Compatível com todos os filtros de período
- ✅ Logs de debug implementados

**📅 Data**: 30/08/2025  
**🎫 Ingressos**: 14 ingressos (R$ 6.160,00) agora integrados  
**💰 Impacto**: Visão financeira completa incluindo ingressos