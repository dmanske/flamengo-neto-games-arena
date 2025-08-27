# 🧪 Instruções para Testar Vinculação de Crédito

## 📍 Como Acessar o Teste

### Opção 1: Card de Teste (Mais Visível)
1. Vá para **Sistema de Créditos** no menu principal
2. No topo da página, você verá um **card azul** com "🧪 Testar Nova Funcionalidade"
3. Clique em **"Testar Vinculação"**

### Opção 2: Botão no Header
1. Vá para **Sistema de Créditos** no menu principal
2. No canto superior direito, clique em **"🧪 Testar Vinculação"**

### Opção 3: Lista de Clientes
1. Vá para **Sistema de Créditos** no menu principal
2. Na lista de clientes, você verá uma opção **"Teste Rápido - Cliente Demo"** no topo
3. Clique em **"Testar"**

## 🎯 Cenários de Teste

### Cenário 1: Valor Exato (Mais Simples)
**Dados do Teste:**
- Cliente: João Silva (Teste)
- Crédito Disponível: R$ 120,00
- Viagem: Escolha uma de R$ 120,00 (se houver)

**Resultado Esperado:**
- Vinculação direta sem valor faltante
- Passageiro fica "Pago Completo"
- Crédito totalmente utilizado

### Cenário 2: Valor Faltante (Teste Principal)
**Dados do Teste:**
- Cliente: João Silva (Teste)
- Crédito Disponível: R$ 120,00
- Viagem: Escolha uma de R$ 150,00 ou mais

**Passos:**
1. Selecione uma viagem mais cara que R$ 120
2. Selecione um ônibus obrigatoriamente
3. Mantenha o titular selecionado
4. Clique em "Confirmar Vinculação"
5. **AQUI APARECE O MODAL DE PAGAMENTO FALTANTE** 🎯
6. Escolha uma das opções:
   - **"Registrar Pagamento Agora"**: Cria registro automático
   - **"Deixar Pendente"**: Apenas vincula o crédito

### Cenário 3: Com Passeios
**Passos:**
1. Selecione uma viagem que tenha passeios disponíveis
2. Marque alguns passeios para aumentar o valor total
3. Teste com valor faltante para ver o modal

## ✅ O Que Verificar

### 1. Modal de Pagamento Faltante
- [ ] Aparece quando há valor faltante
- [ ] Mostra o valor faltante correto
- [ ] Oferece duas opções claras
- [ ] Botões funcionam corretamente

### 2. Registro Automático de Pagamento
- [ ] Quando escolhe "Registrar Pagamento Agora"
- [ ] Sistema cria registro na tabela `historico_pagamentos_categorizado`
- [ ] Passageiro fica como "Pago Completo"
- [ ] Observação automática é adicionada

### 3. Resultado da Vinculação
- [ ] Aba de resultado mostra informações corretas
- [ ] Indica se pagamento adicional foi registrado
- [ ] Cores corretas (verde para pago, laranja para pendente)
- [ ] Botão para ir para a viagem funciona

### 4. Integração com Sistema de Pagamentos
- [ ] Dados aparecem corretamente na página da viagem
- [ ] Status do passageiro é atualizado
- [ ] Breakdown de pagamento está correto
- [ ] Créditos aparecem na seção de créditos vinculados

## 🐛 Possíveis Problemas e Soluções

### Problema: Modal não abre
**Solução:** Verifique se há viagens cadastradas no sistema

### Problema: Erro ao vincular
**Solução:** Verifique se o ônibus foi selecionado (obrigatório)

### Problema: Dados não atualizam
**Solução:** O sistema tem delay de 500ms, aguarde um pouco

### Problema: Não encontra viagem_passageiro_id
**Solução:** Isso pode acontecer em dados de teste, é normal

## 📊 Dados de Teste Criados

O sistema cria automaticamente:

```javascript
Cliente Teste: {
  nome: "João Silva (Teste)",
  telefone: "(21) 99999-9999",
  email: "joao.teste@exemplo.com",
  credito_disponivel: R$ 120,00
}
```

## 🎉 Sucesso do Teste

Você saberá que funcionou quando:

1. **Modal de pagamento faltante aparece** quando há valor faltante
2. **Escolha da opção funciona** e continua o processo
3. **Resultado é exibido** com informações corretas
4. **Toast de sucesso aparece** confirmando a operação
5. **Aba de resultado** mostra detalhes da vinculação

## 🚀 Próximos Passos Após Teste

Depois de testar, você pode:

1. **Ir para a viagem** usando o botão no resultado
2. **Verificar os dados** na página de detalhes da viagem
3. **Ver o histórico** de pagamentos categorizados
4. **Testar outros cenários** com valores diferentes

---

**💡 Dica:** Use o navegador em modo desenvolvedor (F12) para ver os logs detalhados do processo no console!