# 💰 Sistema Financeiro da Viagem - Documentação Completa

## 📋 Visão Geral

O Sistema Financeiro da Viagem é um módulo completo para gestão financeira individual de cada viagem, permitindo controle total de receitas, despesas, cobrança e análises de rentabilidade.

## 🎯 Objetivos

- **Controle Financeiro Completo**: Gestão de todas as receitas e despesas por viagem
- **Cobrança Eficiente**: Sistema automatizado de cobrança de pendências
- **Análise de Rentabilidade**: Relatórios detalhados de lucro/prejuízo
- **Tomada de Decisão**: Dados para otimizar futuras viagens
- **Profissionalização**: Relatórios profissionais para apresentação

## 🏗️ Arquitetura do Sistema

### 📊 1. Dashboard Financeiro da Viagem

**Localização**: Nova aba "Financeiro" na página de detalhes da viagem

**Componentes**:
```
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD FINANCEIRO                     │
├─────────────────┬─────────────────┬─────────────────────────┤
│   💰 RECEITAS   │   💸 DESPESAS   │      📊 LUCRO           │
│   R$ 40.000     │   R$ 33.000     │      R$ 7.000           │
│   ↗️ +5% vs prev │   ↘️ -2% vs prev │      🎯 17.5%           │
├─────────────────┴─────────────────┴─────────────────────────┤
│  🔴 PENDÊNCIAS: R$ 6.400 (4 passageiros)                   │
│  [Ver Devedores] [Enviar Cobrança em Massa] [Relatório]    │
└─────────────────────────────────────────────────────────────┘
```

**Funcionalidades**:
- Cards com totais financeiros
- Indicadores visuais de performance
- Alertas de pendências
- Ações rápidas de cobrança

### 💰 2. Gestão de Receitas da Viagem

#### **Fontes de Receita**:

| Categoria | Descrição | Status Atual |
|-----------|-----------|--------------|
| **Passageiros** | Pagamentos de passagens | ✅ Implementado |
| **Patrocínios** | Empresas parceiras, apoiadores | 🆕 Novo |
| **Vendas** | Produtos da loja, camisetas | 🆕 Novo |
| **Extras** | Passeios adicionais, upgrades | 🆕 Novo |

#### **Interface de Receitas**:
```
┌─────────────────────────────────────────────────────────────┐
│  [+ Adicionar Receita] [Filtros ▼] [Exportar] [Relatório]  │
├─────────────────────────────────────────────────────────────┤
│ Data     │ Descrição        │ Categoria   │ Valor    │ Status│
├─────────────────────────────────────────────────────────────┤
│ 15/01/24 │ João Silva       │ Passageiro  │ R$ 800   │ Pago  │
│ 16/01/24 │ Patrocínio XYZ   │ Patrocínio  │ R$ 1.000 │ Pago  │
│ 17/01/24 │ Venda Camisetas  │ Vendas      │ R$ 300   │ Pago  │
└─────────────────────────────────────────────────────────────┘
```

#### **Campos do Formulário de Receita**:
- **Data**: Data do recebimento
- **Descrição**: Descrição da receita
- **Categoria**: Passageiro/Patrocínio/Vendas/Extras
- **Valor**: Valor recebido
- **Forma de Pagamento**: PIX/Cartão/Dinheiro/Transferência
- **Status**: Recebido/Pendente/Cancelado
- **Observações**: Notas adicionais

### 💸 3. Gestão de Despesas da Viagem

#### **Categorias de Despesa**:

| Categoria | Subcategorias | Exemplos |
|-----------|---------------|----------|
| **🚌 Transporte** | Combustível, Pedágio, Manutenção | Diesel, Praça de pedágio, Pneus |
| **🏨 Hospedagem** | Hotéis, Pousadas, Estadias | Hotel Copacabana, Pousada Centro |
| **🍽️ Alimentação** | Refeições, Lanches, Bebidas | Almoço grupo, Lanche ônibus |
| **🎫 Ingressos** | Estádio, Passeios, Atrações | Maracanã, Cristo Redentor |
| **👥 Pessoal** | Motorista, Guia, Comissões | Diária motorista, Comissão guia |
| **📋 Administrativo** | Seguros, Taxas, Documentos | Seguro viagem, Taxa embarque |

#### **Interface de Despesas**:
```
┌─────────────────────────────────────────────────────────────┐
│ [+ Adicionar Despesa] [Importar Orçamento] [Filtros ▼]     │
├─────────────────────────────────────────────────────────────┤
│ Data │ Fornecedor    │ Categoria    │ Valor   │ Status │ Ações│
├─────────────────────────────────────────────────────────────┤
│15/01 │ Posto Shell   │ Transporte   │ R$ 800  │ Pago   │ [📄] │
│16/01 │ Hotel Copa    │ Hospedagem   │ R$ 1.200│ Pago   │ [📄] │
│17/01 │ Rest. Garota  │ Alimentação  │ R$ 600  │ Pago   │ [📄] │
└─────────────────────────────────────────────────────────────┘
```

#### **Campos do Formulário de Despesa**:
- **Data**: Data da despesa
- **Fornecedor**: Nome do fornecedor
- **Categoria**: Categoria da despesa
- **Subcategoria**: Subcategoria específica
- **Valor**: Valor da despesa
- **Forma de Pagamento**: PIX/Cartão/Dinheiro/Boleto
- **Status**: Pago/Pendente/Cancelado
- **Comprovante**: Upload de nota fiscal/recibo
- **Observações**: Detalhes adicionais

### 📋 4. Sistema de Cobrança Inteligente

#### **Dashboard de Pendências**:
```
┌─────────────────────────────────────────────────────────────┐
│                    SITUAÇÃO DE PAGAMENTOS                  │
├─────────────────────────────────────────────────────────────┤
│ 🔴 URGENTE (vencido há +7 dias): 3 passageiros - R$ 2.400  │
│ 🟡 ATENÇÃO (vence em 3 dias): 5 passageiros - R$ 4.000    │
│ 🟢 EM DIA: 12 passageiros - R$ 9.600                      │
├─────────────────────────────────────────────────────────────┤
│ Taxa de Inadimplência: 15% | Valor Médio em Atraso: R$ 533 │
└─────────────────────────────────────────────────────────────┘
```

#### **Lista de Devedores**:
```
┌─────────────────────────────────────────────────────────────┐
│ Nome          │ Valor  │ Atraso │ Último    │ Ações         │
│               │ Devido │        │ Contato   │               │
├─────────────────────────────────────────────────────────────┤
│ João Silva    │ R$ 400 │ 12 dias│ 05/01     │[📱][📧][📞] │
│ Maria Santos  │ R$ 800 │ 5 dias │ 10/01     │[📱][📧][📞] │
│ Pedro Costa   │ R$ 600 │ 2 dias │ 12/01     │[📱][📧][📞] │
└─────────────────────────────────────────────────────────────┘
```

#### **Funcionalidades de Cobrança**:

**Botão "Cobrar Agora"**:
- Envia WhatsApp personalizado
- Gera PIX instantâneo
- Registra tentativa de cobrança
- Agenda próximo follow-up

**Templates de Mensagem**:
```
TEMPLATE LEMBRETE:
"Oi [NOME]! 👋 Faltam apenas R$ [VALOR] para quitar sua viagem para o jogo contra o [ADVERSARIO] no dia [DATA]. 
PIX: [CHAVE] ou clique aqui: [LINK_PAGAMENTO] 
Qualquer dúvida, estou aqui! 🔴⚫"

TEMPLATE URGENTE:
"[NOME], sua viagem está com [DIAS] dias de atraso. Para não perder sua vaga, quite hoje: R$ [VALOR]
PIX: [CHAVE] | Link: [LINK_PAGAMENTO]
Prazo final: [DATA] ⏰"
```

**Histórico de Cobrança**:
- Data e hora de cada tentativa
- Canal utilizado (WhatsApp/Email/Telefone)
- Status da mensagem (Enviado/Lido/Respondido)
- Resultado da cobrança

### 📈 5. Análises e Relatórios

#### **Relatório Financeiro da Viagem**:
```
┌─────────────────────────────────────────────────────────────┐
│                 RELATÓRIO FINANCEIRO - VIAGEM              │
│                 Flamengo x Vasco - 25/01/2024              │
├─────────────────────────────────────────────────────────────┤
│ RECEITAS:                                                   │
│ ├── Passageiros: R$ 35.000 (87.5%) ████████████████████▓   │
│ ├── Patrocínios: R$ 3.000 (7.5%)   ██▓                     │
│ ├── Vendas: R$ 1.500 (3.8%)        █▓                      │
│ └── Extras: R$ 500 (1.2%)          ▓                       │
│ TOTAL RECEITAS: R$ 40.000                                  │
├─────────────────────────────────────────────────────────────┤
│ DESPESAS:                                                   │
│ ├── Transporte: R$ 15.000 (45.5%) ████████████████████     │
│ ├── Hospedagem: R$ 8.000 (24.2%)  ██████████               │
│ ├── Alimentação: R$ 6.000 (18.2%) ███████▓                 │
│ ├── Ingressos: R$ 2.500 (7.6%)    ███▓                     │
│ └── Outros: R$ 1.500 (4.5%)       ██                       │
│ TOTAL DESPESAS: R$ 33.000                                  │
├─────────────────────────────────────────────────────────────┤
│ RESULTADO:                                                  │
│ 💰 LUCRO BRUTO: R$ 7.000                                   │
│ 📊 MARGEM: 17.5%                                           │
│ 👥 LUCRO POR PASSAGEIRO: R$ 175                            │
└─────────────────────────────────────────────────────────────┘
```

#### **Comparativo entre Viagens**:
```
┌─────────────────────────────────────────────────────────────┐
│ Adversário    │ Margem │ Custo/Pass │ Inadimpl │ Satisfação │
├─────────────────────────────────────────────────────────────┤
│ Vasco         │ 17.5%  │ R$ 825     │ 15%      │ 4.8/5      │
│ Botafogo      │ 22.1%  │ R$ 780     │ 8%       │ 4.9/5      │
│ Palmeiras     │ 12.3%  │ R$ 950     │ 20%      │ 4.6/5      │
│ Fluminense    │ 19.8%  │ R$ 800     │ 12%      │ 4.7/5      │
└─────────────────────────────────────────────────────────────┘
```

### 🎨 6. Estrutura de Interface

#### **Nova Aba "Financeiro" na Viagem**:
```
[Resumo] [Receitas] [Despesas] [Cobrança] [Relatórios] [Orçamento]
```

**Resumo**: Dashboard principal com visão geral
**Receitas**: Gestão de todas as receitas
**Despesas**: Controle de gastos da viagem  
**Cobrança**: Sistema de cobrança de pendências
**Relatórios**: Análises e relatórios detalhados
**Orçamento**: Planejamento vs realizado

### 🗄️ 7. Estrutura de Banco de Dados

#### **Tabelas Necessárias**:

```sql
-- Receitas da viagem
CREATE TABLE viagem_receitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
  descricao VARCHAR(255) NOT NULL,
  categoria VARCHAR(50) NOT NULL, -- passageiro, patrocinio, vendas, extras
  valor DECIMAL(10,2) NOT NULL,
  forma_pagamento VARCHAR(30),
  status VARCHAR(20) DEFAULT 'recebido',
  data_recebimento DATE NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Despesas da viagem
CREATE TABLE viagem_despesas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
  fornecedor VARCHAR(255) NOT NULL,
  categoria VARCHAR(50) NOT NULL, -- transporte, hospedagem, alimentacao, etc
  subcategoria VARCHAR(50),
  valor DECIMAL(10,2) NOT NULL,
  forma_pagamento VARCHAR(30),
  status VARCHAR(20) DEFAULT 'pago',
  data_despesa DATE NOT NULL,
  comprovante_url VARCHAR(500),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Histórico de cobrança
CREATE TABLE viagem_cobranca_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_passageiro_id UUID NOT NULL REFERENCES viagem_passageiros(id),
  tipo_contato VARCHAR(20) NOT NULL, -- whatsapp, email, telefone
  template_usado VARCHAR(50),
  status_envio VARCHAR(20), -- enviado, lido, respondido, erro
  data_tentativa TIMESTAMP DEFAULT NOW(),
  observacoes TEXT
);

-- Orçamento da viagem
CREATE TABLE viagem_orcamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viagem_id UUID NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
  categoria VARCHAR(50) NOT NULL,
  subcategoria VARCHAR(50),
  valor_orcado DECIMAL(10,2) NOT NULL,
  valor_realizado DECIMAL(10,2) DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 🚀 8. Plano de Implementação

#### **FASE 1 - Fundação (Semana 1-2)** ✅ CONCLUÍDA
- [x] Criar estrutura de banco de dados
- [x] Dashboard básico de pendências
- [x] Sistema de cobrança via WhatsApp
- [x] Cadastro básico de despesas
- [x] Integração na página de detalhes da viagem
- [x] Sistema de gestão de receitas
- [x] Dashboard financeiro completo

#### **FASE 2 - Expansão (Semana 3-4)**
- [ ] Gestão completa de receitas
- [ ] Categorização avançada de despesas
- [ ] Relatórios financeiros básicos
- [ ] Templates de cobrança personalizáveis

#### **FASE 3 - Otimização (Semana 5-6)**
- [ ] Automações de cobrança
- [ ] Análises comparativas entre viagens
- [ ] Sistema de orçamento vs realizado
- [ ] Integração com módulo financeiro geral

#### **FASE 4 - Inteligência (Semana 7-8)**
- [ ] Previsões de lucro
- [ ] Alertas inteligentes
- [ ] Relatórios executivos
- [ ] Dashboard para tomada de decisão

### 📊 9. Métricas de Sucesso

#### **KPIs Principais**:
- **Taxa de Inadimplência**: < 10%
- **Margem de Lucro**: > 15%
- **Tempo de Cobrança**: < 3 dias
- **Taxa de Resposta**: > 80%

#### **Métricas Operacionais**:
- Tempo médio de quitação
- Efetividade por canal de cobrança
- Custo por passageiro por categoria
- ROI por tipo de viagem

### 🔧 10. Funcionalidades Avançadas (Futuro)

#### **Inteligência Artificial**:
- Previsão de inadimplência por perfil
- Otimização automática de preços
- Sugestões de economia de custos
- Análise de sentimento em cobranças

#### **Integrações**:
- WhatsApp Business API
- Gateways de pagamento
- Sistemas de nota fiscal
- Plataformas de análise

#### **Mobile**:
- App para gestores
- Notificações push
- Cobrança em movimento
- Relatórios mobile

---

## 🎯 Conclusão

Este sistema transformará a gestão financeira das viagens, proporcionando:

- **Controle Total**: Visão completa de receitas e despesas
- **Eficiência**: Cobrança automatizada e inteligente  
- **Profissionalismo**: Relatórios de qualidade empresarial
- **Crescimento**: Dados para otimizar futuras viagens
- **Tranquilidade**: Gestão sem stress financeiro

## 🎉 Sistema Implementado com Sucesso!

### ✅ O que foi entregue:

1. **Dashboard Financeiro Completo**
   - Aba "Financeiro" integrada na página de detalhes da viagem
   - Cards com resumo de receitas, despesas, lucro e pendências
   - Visualização em tempo real dos dados financeiros

2. **Gestão de Receitas**
   - Formulário completo para adicionar receitas
   - Categorização: Passageiros, Patrocínios, Vendas, Extras
   - Status de recebimento e formas de pagamento

3. **Gestão de Despesas**
   - Formulário avançado com 6 categorias principais
   - Subcategorias específicas para cada tipo
   - Upload de comprovantes e observações

4. **Sistema de Cobrança Inteligente**
   - Dashboard de pendências com urgência por cores
   - Templates personalizáveis de mensagens
   - Integração direta com WhatsApp
   - Histórico de tentativas de cobrança

5. **Estrutura de Banco de Dados**
   - Tabelas otimizadas para performance
   - Relacionamentos bem definidos
   - Suporte a todas as funcionalidades

### 🚀 Como Usar:

1. **Acesse uma viagem** na lista de viagens
2. **Clique na aba "Financeiro"** na página de detalhes
3. **Gerencie receitas e despesas** usando os botões de ação
4. **Monitore pendências** na aba específica
5. **Use o sistema de cobrança** para contatar devedores

### 🛠️ Problemas Resolvidos:

1. **Erro de SQL**: Corrigido o problema com a tabela "viagens" não existente
   - Adicionada verificação de existência de tabelas
   - Separada a criação de tabelas e adição de foreign keys

2. **Erro de Importação**: Corrigido o problema com os componentes não exportados
   - Alterados para export default
   - Atualizadas as importações em todos os arquivos

3. **Integração na UI**: Adicionada aba Financeiro na página de detalhes da viagem
   - Interface responsiva
   - Navegação por tabs para melhor organização

### 📊 Próximos Passos Sugeridos:

- Implementar relatórios em PDF
- Adicionar gráficos de análise
- Criar automações de cobrança
- Integrar com gateways de pagamento

**Status**: ✅ SISTEMA FINANCEIRO OPERACIONAL