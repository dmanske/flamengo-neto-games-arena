# ✅ Correção Taxa de Ocupação com Fallback

## 🎯 **Problema Identificado**

Toda viagem tem ônibus cadastrado, mas o hook não estava conseguindo buscar os dados dos ônibus, resultando em `capacidadeTotal = 0`.

## 🛠️ **Solução Implementada**

### **Fallback Inteligente:**
```typescript
// Usar capacidade calculada dos ônibus, ou fallback para capacidade padrão
const capacidadeReal = capacidadeTotal > 0 ? capacidadeTotal : 50;
const taxaOcupacao = ((dadosPresenca.total_passageiros / capacidadeReal) * 100).toFixed(0);
const vagasLivres = capacidadeReal - dadosPresenca.total_passageiros;
```

### **Indicador Visual:**
```typescript
{capacidadeTotal === 0 && (
  <p className="text-xs text-orange-500 mt-1">
    * Capacidade estimada
  </p>
)}
```

## 📊 **Cenários de Exibição**

### **1. Capacidade Real (Ideal):**
```
Taxa de Ocupação
6%
3/50 lugares
47 vagas livres
```

### **2. Capacidade Estimada (Fallback):**
```
Taxa de Ocupação
6%
3/50 lugares
47 vagas livres
* Capacidade estimada
```

## 🔍 **Debug Adicionado**

Adicionei logs no hook para investigar por que os ônibus não estão sendo encontrados:

```typescript
const onibusData = data.viagem_onibus || [];
console.log('🚌 DEBUG - Ônibus encontrados:', onibusData.length, onibusData);

const capacidadeTotalCalculada = onibusData.reduce(
  (total: number, onibus: any) => {
    const capacidade = (onibus.capacidade_onibus || 0) + (onibus.lugares_extras || 0);
    console.log('🚌 Ônibus:', onibus.numero_identificacao, 'Capacidade:', capacidade);
    return total + capacidade;
  },
  0
);

console.log('🚌 Capacidade total calculada:', capacidadeTotalCalculada);
```

## 🎯 **Resultado Esperado**

### **Agora sempre mostra a taxa:**
- ✅ **6%** (3/50 lugares)
- ✅ **47 vagas livres**
- ✅ **Indicador** se está usando capacidade estimada

### **Debug no console:**
- 🚌 Quantidade de ônibus encontrados
- 🚌 Capacidade de cada ônibus
- 🚌 Capacidade total calculada

## 🔧 **Próximos Passos**

1. **Verificar logs** no console do navegador
2. **Identificar** por que `viagem_onibus` está vazio
3. **Corrigir** a query ou estrutura de dados se necessário
4. **Remover logs** após identificar o problema

## ✨ **Benefícios**

1. **Sempre funciona**: Nunca mais mostra "N/A"
2. **Transparente**: Indica quando está usando estimativa
3. **Debug**: Logs para identificar o problema real
4. **Flexível**: Se adapta aos dados disponíveis

## 🎉 **Status: Implementado com Fallback**

O card agora sempre mostra uma taxa de ocupação útil!