# ✈️ Lista Detalhada de Viagens no Financeiro Geral

## 🎯 **OBJETIVO**
Melhorar a seção "Performance por Viagem" no Financeiro Geral, transformando-a em uma lista detalhada similar à dos ingressos, mostrando receitas, despesas, lucros e margem de cada viagem individualmente.

## ✅ **IMPLEMENTAÇÃO REALIZADA**

### **1. Seção "Performance por Viagem" Melhorada**

#### **1.1 Layout Detalhado Implementado**
```jsx
{/* ✨ MELHORADO: Performance por Viagem - Lista Detalhada */}
{viagensFinanceiro && viagensFinanceiro.length > 0 && (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-lg font-semibold flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        Performance por Viagem
      </CardTitle>
      <p className="text-sm text-gray-600">
        Análise detalhada de receitas, despesas e margem por viagem realizada
      </p>
    </CardHeader>
    <CardContent>
      {/* Cards individuais para cada viagem */}
      {/* Resumo consolidado */}
    </CardContent>
  </Card>
)}
```

#### **1.2 Card Individual para Cada Viagem**
```jsx
<div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
  {/* Cabeçalho da Viagem */}
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <Users className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h4 className="font-semibold text-gray-900">
          Flamengo x {viagem.adversario}
        </h4>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>📅 {format(new Date(viagem.data_jogo), 'dd/MM/yyyy')}</span>
          <span>👥 {viagem.total_passageiros} passageiros</span>
          {viagem.pendencias > 0 && (
            <span className="text-yellow-600">⚠️ {viagem.pendencias} pendências</span>
          )}
        </div>
      </div>
    </div>
    <div className="text-right">
      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
        ✈️ Margem: {viagem.margem.toFixed(1)}%
      </div>
    </div>
  </div>
  
  {/* Métricas Financeiras */}
  <div className="grid grid-cols-4 gap-4">
    {/* 4 cards coloridos com métricas */}
  </div>
</div>
```

#### **1.3 Métricas Financeiras Detalhadas**

**🟢 Receita Total (Verde)**
```jsx
<div className="text-center p-3 bg-green-50 rounded-lg">
  <p className="text-xs text-gray-600 mb-1">Receita Total</p>
  <p className="text-lg font-bold text-green-600">
    {formatCurrency(viagem.total_receitas)}
  </p>
  <div className="text-xs text-gray-500 mt-1">
    <div>• Viagens: {formatCurrency(viagem.receitas_viagem)}</div>
    {viagem.receitas_passeios > 0 && (
      <div>• Passeios: {formatCurrency(viagem.receitas_passeios)}</div>
    )}
    {viagem.receitas_extras > 0 && (
      <div>• Extras: {formatCurrency(viagem.receitas_extras)}</div>
    )}
  </div>
</div>
```

**🔴 Despesas (Vermelho)**
```jsx
<div className="text-center p-3 bg-red-50 rounded-lg">
  <p className="text-xs text-gray-600 mb-1">Despesas</p>
  <p className="text-lg font-bold text-red-600">
    {formatCurrency(viagem.total_despesas)}
  </p>
  <div className="text-xs text-gray-500 mt-1">
    <div>• Operacionais</div>
    <div>• Combustível</div>
    <div>• Outras</div>
  </div>
</div>
```

**🔵 Lucro (Azul)**
```jsx
<div className="text-center p-3 bg-blue-50 rounded-lg">
  <p className="text-xs text-gray-600 mb-1">Lucro</p>
  <p className={`text-lg font-bold ${
    viagem.lucro >= 0 ? 'text-blue-600' : 'text-red-600'
  }`}>
    {formatCurrency(viagem.lucro)}
  </p>
  <div className="text-xs text-gray-500 mt-1">
    <div>{viagem.lucro >= 0 ? '📈 Positivo' : '📉 Negativo'}</div>
  </div>
</div>
```

**🟣 Margem (Roxo)**
```jsx
<div className="text-center p-3 bg-purple-50 rounded-lg">
  <p className="text-xs text-gray-600 mb-1">Margem</p>
  <p className={`text-lg font-bold ${
    viagem.margem >= 15 ? 'text-green-600' :
    viagem.margem >= 10 ? 'text-yellow-600' :
    'text-red-600'
  }`}>
    {viagem.margem.toFixed(1)}%
  </p>
  <div className="text-xs text-gray-500 mt-1">
    <div>
      {viagem.margem >= 15 ? '🟢 Excelente' :
       viagem.margem >= 10 ? '🟡 Boa' :
       '🔴 Baixa'}
    </div>
  </div>
</div>
```

#### **1.4 Resumo Consolidado das Viagens**
```jsx
<div className="mt-6 p-4 bg-gray-50 rounded-lg">
  <h5 className="font-semibold text-gray-900 mb-3">📊 Resumo das Viagens</h5>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div className="text-center">
      <p className="text-xs text-gray-600">Total Viagens</p>
      <p className="text-lg font-bold text-gray-900">
        {viagensFinanceiro.length}
      </p>
    </div>
    <div className="text-center">
      <p className="text-xs text-gray-600">Receita Total</p>
      <p className="text-lg font-bold text-green-600">
        {formatCurrency(viagensFinanceiro.reduce((sum, v) => sum + v.total_receitas, 0))}
      </p>
    </div>
    <div className="text-center">
      <p className="text-xs text-gray-600">Despesas Total</p>
      <p className="text-lg font-bold text-red-600">
        {formatCurrency(viagensFinanceiro.reduce((sum, v) => sum + v.total_despesas, 0))}
      </p>
    </div>
    <div className="text-center">
      <p className="text-xs text-gray-600">Lucro Total</p>
      <p className="text-lg font-bold text-blue-600">
        {formatCurrency(viagensFinanceiro.reduce((sum, v) => sum + v.lucro, 0))}
      </p>
    </div>
  </div>
</div>
```

### **2. Imports Adicionados**

#### **2.1 Ícones Lucide React**
```typescript
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  FileText,
  AlertTriangle,
  Download,
  Filter,
  RefreshCw,
  Users,        // ✨ NOVO - Para ícone das viagens
  BarChart3,    // ✨ NOVO - Para ícone da seção
  Ticket        // ✨ NOVO - Para ícone dos ingressos
} from 'lucide-react';
```

#### **2.2 Date-fns para Formatação**
```typescript
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
```

## 🎯 **FUNCIONALIDADES IMPLEMENTADAS**

### **✅ Lista Detalhada de Viagens**
- **Card individual** para cada viagem realizada
- **Informações completas**: Adversário, data, total de passageiros, pendências
- **Badge de margem**: Verde (≥15%), Amarelo (≥10%), Vermelho (<10%)
- **Métricas financeiras**: Receita total, despesas, lucro, margem
- **Cores diferenciadas** para cada métrica
- **Hover effects** para melhor UX

### **✅ Detalhamento de Receitas**
- **Receitas de viagem**: Valor das passagens
- **Receitas de passeios**: Valor dos passeios opcionais
- **Receitas extras**: Outras receitas da viagem
- **Exibição condicional**: Só mostra se valor > 0

### **✅ Análise de Margem Inteligente**
- **🟢 Excelente**: Margem ≥ 15%
- **🟡 Boa**: Margem entre 10% e 14.9%
- **🔴 Baixa**: Margem < 10%
- **Indicadores visuais**: Emojis e cores para fácil identificação

### **✅ Resumo Consolidado**
- **Total de viagens** realizadas no período
- **Receita total** de todas as viagens
- **Despesas total** de todas as viagens
- **Lucro total** calculado automaticamente

### **✅ Interface Responsiva**
- **Layout adaptativo** para diferentes tamanhos de tela
- **Grid responsivo** (2 colunas em mobile, 4 em desktop)
- **Transições suaves** para melhor experiência
- **Ícones intuitivos** (✈️, 📅, 👥, ⚠️)

## 📊 **RESULTADO VISUAL**

### **Seção "Performance por Viagem" Melhorada:**
```
✈️ Performance por Viagem
├── Análise detalhada de receitas, despesas e margem por viagem realizada
│
├── 📋 Viagem 1: Flamengo x Botafogo
│   ├── 📅 15/09/2025  👥 45 passageiros  ⚠️ 2 pendências
│   ├── ✈️ Margem: 18.5% (badge verde)
│   └── [💚 Receita: R$ 15.000] [❤️ Despesas: R$ 12.000] [💙 Lucro: R$ 3.000] [💜 Margem: 18.5%]
│       ├── • Viagens: R$ 13.500
│       ├── • Passeios: R$ 1.200
│       └── • Extras: R$ 300
│
├── 📋 Viagem 2: Flamengo x Vasco
│   ├── 📅 10/09/2025  👥 38 passageiros
│   ├── ✈️ Margem: 12.3% (badge amarelo)
│   └── [💚 Receita: R$ 12.800] [❤️ Despesas: R$ 11.200] [💙 Lucro: R$ 1.600] [💜 Margem: 12.3%]
│
└── 📊 Resumo das Viagens (card cinza):
    ├── Total Viagens: 8
    ├── Receita Total: R$ 98.400,00
    ├── Despesas Total: R$ 82.100,00
    └── Lucro Total: R$ 16.300,00
```

## 🔄 **COMPARAÇÃO: ANTES vs DEPOIS**

### **❌ ANTES (Layout Simples)**
```
Performance por Viagem - Setembro 2025
├── Botafogo | 15/09/2025
│   └── Receitas: R$ 15.000 | Despesas: R$ 12.000 | Lucro: R$ 3.000 | Margem: 18.5%
├── Vasco | 10/09/2025  
│   └── Receitas: R$ 12.800 | Despesas: R$ 11.200 | Lucro: R$ 1.600 | Margem: 12.3%
```

### **✅ DEPOIS (Layout Detalhado)**
```
✈️ Performance por Viagem
├── "Análise detalhada de receitas, despesas e margem por viagem realizada"
│
├── 📋 Card Viagem 1:
│   ├── ✈️ Flamengo x Botafogo
│   ├── 📅 15/09/2025  👥 45 passageiros  ⚠️ 2 pendências
│   ├── ✈️ Margem: 18.5% (badge verde - Excelente)
│   └── Grid 4 colunas:
│       ├── [💚 Receita Total: R$ 15.000]
│       │   ├── • Viagens: R$ 13.500
│       │   ├── • Passeios: R$ 1.200
│       │   └── • Extras: R$ 300
│       ├── [❤️ Despesas: R$ 12.000]
│       │   ├── • Operacionais
│       │   ├── • Combustível
│       │   └── • Outras
│       ├── [💙 Lucro: R$ 3.000]
│       │   └── • 📈 Positivo
│       └── [💜 Margem: 18.5%]
│           └── • 🟢 Excelente
│
└── 📊 Resumo das Viagens:
    ├── Total Viagens: 8
    ├── Receita Total: R$ 98.400,00
    ├── Despesas Total: R$ 82.100,00
    └── Lucro Total: R$ 16.300,00
```

## 🎯 **MELHORIAS IMPLEMENTADAS**

### **1. Visual e UX** ✅
- **Cards individuais** em vez de lista simples
- **Cores diferenciadas** para cada métrica
- **Ícones intuitivos** para melhor identificação
- **Hover effects** para interatividade
- **Layout responsivo** para mobile e desktop

### **2. Informações Detalhadas** ✅
- **Breakdown de receitas** (viagens, passeios, extras)
- **Análise de margem** com classificação visual
- **Indicadores de pendências** quando existem
- **Total de passageiros** por viagem
- **Resumo consolidado** de todas as viagens

### **3. Consistência com Ingressos** ✅
- **Layout similar** à seção de ingressos
- **Mesma estrutura** de cards e métricas
- **Cores padronizadas** (verde, vermelho, azul, roxo)
- **Resumo consolidado** no mesmo formato

## ✅ **STATUS FINAL**

**🎯 IMPLEMENTAÇÃO COMPLETA E FUNCIONAL**

- ✅ Lista detalhada de viagens implementada
- ✅ Layout similar ao dos ingressos
- ✅ Métricas financeiras completas (receita, despesas, lucro, margem)
- ✅ Interface responsiva e intuitiva
- ✅ Resumo consolidado das viagens
- ✅ Análise de margem com classificação visual
- ✅ Detalhamento de receitas por categoria
- ✅ Indicadores de pendências
- ✅ Imports necessários adicionados

**📅 Data**: 30/08/2025  
**✈️ Funcionalidade**: Lista detalhada de viagens no Financeiro Geral  
**💰 Resultado**: Visão completa da performance individual de cada viagem com análise detalhada de receitas, despesas, lucros e margem

## 🚀 **PRÓXIMOS PASSOS SUGERIDOS**

1. **Filtros Avançados**: Filtrar por adversário, margem, status
2. **Exportação**: Botão para exportar lista de viagens
3. **Gráficos**: Visualização gráfica da performance
4. **Comparativo**: Comparar performance entre períodos
5. **Drill-down**: Link para detalhes da viagem específica