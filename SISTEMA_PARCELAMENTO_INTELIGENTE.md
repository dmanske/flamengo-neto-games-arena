# Sistema de Parcelamento Inteligente

## Visão Geral
O sistema de parcelamento foi aprimorado para ser mais inteligente e flexível, adaptando-se automaticamente ao tempo disponível até a data da viagem.

## Regras Principais

### 1. Prazo Limite
- **Regra fundamental:** Todos os pagamentos devem estar quitados **5 dias antes da viagem**
- **Não há parcelamento:** Se restam menos de 7 dias até o prazo limite

### 2. Intervalos de Parcelamento Baseados no Tempo

#### Mais de 30 dias disponíveis
- ✅ **Parcelamento Semanal** (a cada 7 dias)
- ✅ **Parcelamento Quinzenal** (a cada 15 dias)  
- ✅ **Parcelamento Mensal** (a cada 30 dias)

#### Entre 15-30 dias disponíveis
- ✅ **Parcelamento Semanal** (a cada 7 dias)
- ✅ **Parcelamento Quinzenal** (a cada 15 dias)

#### Entre 7-15 dias disponíveis
- ✅ **Apenas Parcelamento Semanal** (a cada 7 dias)

#### Menos de 7 dias disponíveis
- ❌ **Sem parcelamento** - Apenas à vista

## Exemplos Práticos

### Exemplo 1: Viagem em 60 dias
- **Prazo limite:** 55 dias (60 - 5)
- **Opções disponíveis:**
  - 2x semanais (7 e 14 dias)
  - 3x semanais (7, 14 e 21 dias)
  - 2x quinzenais (15 e 30 dias)
  - 3x quinzenais (15, 30 e 45 dias)
  - 2x mensais (30 e 60 dias) - **Não disponível** (passaria do prazo)

### Exemplo 2: Viagem em 25 dias
- **Prazo limite:** 20 dias (25 - 5)
- **Opções disponíveis:**
  - 2x semanais (7 e 14 dias)
  - 3x semanais (7, 14 e 21 dias) - **Não disponível** (passaria do prazo)
  - 2x quinzenais (15 e 30 dias) - **Não disponível** (passaria do prazo)

### Exemplo 3: Viagem em 10 dias
- **Prazo limite:** 5 dias (10 - 5)
- **Opções disponíveis:**
  - Apenas à vista (sem parcelamento)

## Interface do Usuário

### Informações Exibidas
Para cada opção de parcelamento, o sistema mostra:
- 📅 **Tipo de intervalo** (semanal, quinzenal, mensal)
- 💰 **Valor de cada parcela**
- 📆 **Data da primeira parcela**
- 📆 **Data da última parcela**
- 🔢 **Número total de parcelas**

### Mensagens de Aviso
- Quando não há tempo suficiente para parcelamento, o sistema exibe uma mensagem explicativa
- Todas as opções respeitam automaticamente o prazo limite de 5 dias antes da viagem

## Benefícios do Sistema

### Para o Cliente
- ✅ **Flexibilidade:** Pode escolher entre diferentes intervalos de pagamento
- ✅ **Transparência:** Vê claramente todas as datas de vencimento
- ✅ **Segurança:** Não pode criar parcelamentos que passem do prazo limite

### Para a Empresa
- ✅ **Garantia de recebimento:** Todos os pagamentos ficam prontos antes da viagem
- ✅ **Redução de inadimplência:** Prazos realistas baseados no tempo disponível
- ✅ **Automação:** Sistema calcula automaticamente as melhores opções

## Implementação Técnica

### Arquivos Modificados
- `ParcelasManager.tsx` - Lógica principal de cálculo
- `CadastroPassageiroSimples.tsx` - Interface de cadastro
- Interface melhorada com informações mais detalhadas

### Algoritmo de Cálculo
1. Calcula dias disponíveis até 5 dias antes da viagem
2. Define intervalos possíveis baseado no tempo
3. Gera opções respeitando os intervalos
4. Filtra opções que passariam do prazo limite
5. Ordena por número de parcelas e tipo de intervalo

## Casos de Uso

### Viagem de Longa Data (ex: 90 dias)
- Cliente pode parcelar em até 6x mensais
- Ou escolher parcelamento semanal/quinzenal para mais flexibilidade

### Viagem de Média Data (ex: 30 dias)
- Parcelamento semanal ou quinzenal
- Máximo de 4 parcelas semanais

### Viagem de Curta Data (ex: 15 dias)
- Apenas parcelamento semanal
- Máximo de 2 parcelas

### Viagem Iminente (ex: 5 dias)
- Apenas pagamento à vista
- Sistema bloqueia parcelamento automaticamente

Este sistema garante que todos os pagamentos sejam recebidos com segurança antes da viagem, oferecendo máxima flexibilidade dentro dos prazos seguros.