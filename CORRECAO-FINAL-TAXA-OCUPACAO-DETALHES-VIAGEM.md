# ✅ Correção Final - Taxa de Ocupação usando dados de DetalhesViagem

## 🎯 **Problema Resolvido**

O card "Taxa de Ocupação" estava mostrando dados incorretos porque o hook `useViagemFinanceiro` não conseguia buscar os ônibus da viagem corretamente.

### ❌ **Antes:**
- **Taxa**: 6% (3/50 lugares) - usando fallback de 50
- **Capacidade**: Estimada (não real)
- **Fonte**: Query JOIN complexa que falhava

### ✅ **Depois:**
- **Taxa**: 100% (3/3 lugares) - usando capacidade real
- **Capacidade**: Real dos ônibus cadastrados
- **Fonte**: Mesma query que DetalhesViagem usa

## 🛠️ **Solução Implementada**

### **1. Nova função `fetchOnibus` (igual ao DetalhesViagem):**

```typescript
// Buscar ônibus da viagem (mesma forma que useViagemDetails)
const fetchOnibus = async () => {
  if (!viagemId) return;

  try {
    const { data, error } = await supabase
      .from("viagem_onibus")
      .select("*")
      .eq("viagem_id", viagemId);

    if (error) throw error;

    console.log('🚌 DEBUG - Ônibus encontrados:', data?.length || 0, data);
    
    if (data && data.length > 0) {
      const capacidadeTotalCalculada = data.reduce(
        (total: number, onibus: any) => {
          const capacidade = (onibus.capacidade_onibus || 0) + (onibus.lugares_extras || 0);
          console.log('🚌 Ônibus:', onibus.numero_identificacao, 'Capacidade:', capacidade);
          return total + capacidade;
        },
        0
      );
      
      console.log('🚌 Capacidade total calculada:', capacidadeTotalCalculada);
      setCapacidadeTotal(capacidadeTotalCalculada);
    } else {
      console.log('🚌 Nenhum ônibus encontrado para a viagem');
      setCapacidadeTotal(0);
    }
  } catch (error) {
    console.error('Erro ao buscar ônibus:', error);
    setCapacidadeTotal(0);
  }
};
```

### **2. Função `fetchViagem` simplificada:**

```typescript
// Buscar dados da viagem (sem ônibus - busca separada)
const fetchViagem = async () => {
  if (!viagemId) return;

  try {
    const { data, error } = await supabase
      .from('viagens')
      .select(`
        *,
        viagem_passeios (
          passeio_id,
          passeios (
            nome,
            valor,
            categoria
          )
        )
      `)
      .eq('id', viagemId)
      .single();

    if (error) throw error;
    setViagem(data);
  } catch (error) {
    console.error('Erro ao buscar dados da viagem:', error);
  }
};
```

### **3. `fetchAllData` atualizada:**

```typescript
const fetchAllData = async () => {
  if (!viagemId) {
    console.warn('fetchAllData: viagemId não definido');
    return;
  }

  setIsLoading(true);
  try {
    await Promise.all([
      fetchViagem(), // Buscar dados da viagem
      fetchOnibus(), // ✅ NOVO: Buscar ônibus separadamente (mesma forma que DetalhesViagem)
      fetchReceitas(),
      fetchDespesas(),
      fetchPassageirosPendentes(),
      fetchTodosPassageiros(),
      fetchHistoricoCobranca()
    ]);
    await calcularResumoFinanceiro();
  } catch (error) {
    console.error('Erro ao carregar dados financeiros:', error);
  } finally {
    setIsLoading(false);
  }
};
```

## 🔄 **Fluxo de Dados Correto**

### **Antes (Falhava):**
```
viagens JOIN viagem_onibus → capacidade = 0 → fallback 50
```

### **Depois (Funciona):**
```
viagem_onibus.select("*").eq("viagem_id", id) → capacidade real → taxa correta
```

## 📊 **Resultado Esperado**

### **Para ônibus de 3 lugares com 3 passageiros:**
```
Taxa de Ocupação
100%
3/3 lugares
0 vagas livres
```

### **Debug no Console:**
```
🚌 DEBUG - Ônibus encontrados: 1 [{ capacidade_onibus: 3, lugares_extras: 0, ... }]
🚌 Ônibus: ABC-1234 Capacidade: 3
🚌 Capacidade total calculada: 3
```

## ✨ **Benefícios da Correção**

1. **Mesma fonte de dados**: Usa exatamente a mesma query que DetalhesViagem
2. **Dados reais**: Capacidade real dos ônibus cadastrados
3. **Debug completo**: Logs para verificar se está funcionando
4. **Fallback inteligente**: Se não encontrar ônibus, usa 50 como padrão
5. **Consistência**: Todos os dados vêm das mesmas fontes

## 🎯 **Como Verificar se Funcionou**

1. **Abrir Console** (F12 no navegador)
2. **Ir para aba Financeiro** da viagem
3. **Verificar logs**:
   - `🚌 DEBUG - Ônibus encontrados: X`
   - `🚌 Ônibus: [nome] Capacidade: [número]`
   - `🚌 Capacidade total calculada: [total]`

4. **Verificar card**:
   - Se encontrou ônibus: Taxa real (ex: 100%)
   - Se não encontrou: Taxa com fallback + "* Capacidade estimada"

## 🎉 **Status: Implementado e Testável**

Agora o card "Taxa de Ocupação" usa exatamente os mesmos dados que a página DetalhesViagem!