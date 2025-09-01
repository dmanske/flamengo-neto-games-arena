# 🔍 TESTE DEBUG: Hora Final - EXECUTAR AGORA

## 🎯 Objetivo
Identificar exatamente onde a hora está sendo alterada de 15:00 para 21:30.

## 🧪 Como Testar

### **Passo 1: Preparar o Teste**
1. Abrir DevTools (F12)
2. Ir para aba Console
3. Limpar console (Ctrl+L)

### **Passo 2: Criar Viagem**
1. Criar nova viagem para ingressos
2. **Definir hora específica**: 15:00 (15h00)
3. **Verificar card**: Deve mostrar 15:00
4. **Anotar**: Hora exibida no card

### **Passo 3: Adicionar Ingresso**
1. Clicar "Novo Ingresso" no card
2. **Verificar console**: Logs do jogo pré-selecionado
3. Preencher cliente e valores
4. **Clicar Salvar**
5. **Verificar console**: Logs dos dados salvos

### **Passo 4: Verificar Resultado**
1. **Verificar card atualizado**: Qual hora está mostrando?
2. **Verificar console**: Logs do agrupamento
3. **Verificar console**: Logs do CleanJogoCard

## 📋 Logs Esperados

### **Console Log 1: Jogo Pré-selecionado**
```
🎯 Jogo pré-selecionado: {
  original: "2025-12-15T15:00:00.000Z",
  formatado: "2025-12-15T15:00",
  adversario: "Fluminense",
  timezone: "America/Sao_Paulo"
}
```

### **Console Log 2: Dados Salvos**
```
🎯 Dados do ingresso sendo salvos: {
  jogo_data: "2025-12-15T15:00",
  adversario: "Fluminense",
  viagem_id: null,
  viagem_ingressos_id: "uuid-da-viagem"
}
```

### **Console Log 3: Agrupamento**
```
🎯 Agrupamento - Criando grupo: {
  adversario: "Fluminense",
  dataViagem: "2025-12-15T15:00:00.000Z",
  dataIngresso: "2025-12-15T21:30:00.000Z", ← AQUI ESTÁ O PROBLEMA!
  dataEscolhida: "2025-12-15T15:00:00.000Z",
  chaveJogo: "fluminense-2025-12-15-casa"
}
```

### **Console Log 4: Card Final**
```
🎯 CleanJogoCard - Data do jogo: {
  adversario: "Fluminense",
  jogo_data: "2025-12-15T15:00:00.000Z",
  formatado: "15/12/2025 às 15:00",
  total_ingressos: 1
}
```

## 🎯 O que Procurar

### **Se a hora mudar de 15:00 para 21:30:**

1. **Verificar Log 2**: Se `jogo_data` está com hora errada (21:30)
   - **Problema**: Conversão de timezone no formulário
   - **Solução**: Corrigir conversão no IngressoFormModal

2. **Verificar Log 3**: Se `dataIngresso` está com hora errada
   - **Problema**: Ingresso salvo com hora errada no banco
   - **Solução**: Corrigir dados antes de salvar

3. **Verificar Log 4**: Se `jogo_data` final está com hora errada
   - **Problema**: Agrupamento usando data errada
   - **Solução**: Forçar uso da data da viagem

## 🔧 Possíveis Correções

### **Correção A: Problema no Formulário**
Se o Log 2 mostrar hora errada (21:30), o problema está na conversão:

```typescript
// PROBLEMA: Conversão de timezone incorreta
const dataFormatada = new Date(dataJogo.getTime() - (dataJogo.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);

// SOLUÇÃO: Usar data original sem conversão
const dataFormatada = dataJogo.toISOString().slice(0, 16);
```

### **Correção B: Problema no Agrupamento**
Se o Log 3 mostrar `dataIngresso` errada, forçar uso da viagem:

```typescript
// FORÇAR uso da data da viagem SEMPRE
const dataJogoCorreta = ingresso.viagem?.data_jogo || viagem.data_jogo || ingresso.jogo_data;
```

### **Correção C: Problema no Banco**
Se o ingresso está sendo salvo com hora errada, não salvar `jogo_data`:

```typescript
// Remover jogo_data dos dados do ingresso
const { jogo_data, ...dadosParaInserir } = dados;
// Deixar o banco usar a data da viagem vinculada
```

## 🚀 Execute o Teste AGORA

1. **Abra F12**
2. **Crie viagem às 15:00**
3. **Adicione ingresso**
4. **Copie TODOS os logs do console**
5. **Me envie os logs**

Com os logs, vou identificar exatamente onde está o problema e corrigir definitivamente! 🎯