# 👤 Sistema de Perfil do Cliente - Documentação Completa

## 📋 Visão Geral

O Sistema de Perfil do Cliente é uma funcionalidade completa que transforma a experiência de gestão de clientes, oferecendo uma visão 360° de cada cliente através de uma interface moderna e intuitiva. Quando o usuário clica em um cliente na lista, ele acessa uma página rica em informações e funcionalidades.

## 🎯 Objetivos

- **Visão Completa**: Todas as informações do cliente em um só lugar
- **Relacionamento**: Histórico completo de interações e viagens
- **Inteligência**: Insights e estatísticas para tomada de decisão
- **Eficiência**: Ações rápidas para comunicação e cobrança
- **Profissionalismo**: Interface moderna e responsiva

## 🏗️ Arquitetura do Sistema

### 📊 1. Estrutura da Página de Detalhes

**Localização**: `/dashboard/clientes/:id`

**Layout Principal**:
```
┌─────────────────────────────────────────────────────────────┐
│  [← Voltar]  PERFIL DO CLIENTE                    [Editar]  │
├─────────────────────────────────────────────────────────────┤
│  📸 [Foto]  João Silva Santos                               │
│             📞 (21) 99999-9999  📧 joao@email.com          │
│             📍 Rio de Janeiro, RJ                          │
│             👤 Cliente desde: Jan 2023                     │
├─────────────────────────────────────────────────────────────┤
│  [Pessoal] [Viagens] [Financeiro] [Comunicação] [Insights] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [CONTEÚDO DA ABA SELECIONADA]                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  AÇÕES RÁPIDAS:                                            │
│  [📱 WhatsApp] [📧 Email] [💰 Cobrar] [📊 Relatório]      │
└─────────────────────────────────────────────────────────────┘
```

### 👤 2. Seção: Informações Pessoais

**Funcionalidades**:
- Dados pessoais completos (nome, CPF, telefone, email)
- Endereço completo formatado
- Data de nascimento com idade calculada
- Links clicáveis para WhatsApp e email
- Como conheceu a empresa
- Observações e notas

**Interface**:
```
┌─────────────────────────────────────────────────────────────┐
│  👤 DADOS PESSOAIS                                         │
├─────────────────────────────────────────────────────────────┤
│  Nome Completo: João Silva Santos                          │
│  CPF: 123.456.789-00                                       │
│  Data Nascimento: 15/03/1985 (38 anos)                     │
│  Telefone: (21) 99999-9999 [📱]                            │
│  Email: joao@email.com [📧]                                 │
├─────────────────────────────────────────────────────────────┤
│  🏠 ENDEREÇO                                               │
├─────────────────────────────────────────────────────────────┤
│  CEP: 22070-900                                            │
│  Endereço: Rua das Flores, 123, Apt 45                     │
│  Bairro: Copacabana                                        │
│  Cidade: Rio de Janeiro - RJ                               │
├─────────────────────────────────────────────────────────────┤
│  ℹ️  OUTRAS INFORMAÇÕES                                     │
├─────────────────────────────────────────────────────────────┤
│  Como conheceu: Indicação de amigo                         │
│  Observações: Cliente VIP, sempre pontual                  │
│  Cadastrado em: 15/01/2023 às 14:30                        │
└─────────────────────────────────────────────────────────────┘
```

### 🚌 3. Seção: Histórico de Viagens

**Funcionalidades**:
- Lista completa de viagens participadas
- Status visual (Confirmado, Cancelado, Finalizado)
- Valores pagos e datas
- Links para detalhes da viagem
- Estatísticas de participação
- Adversário favorito

**Interface**:
```
┌─────────────────────────────────────────────────────────────┐
│  🚌 HISTÓRICO DE VIAGENS (12 viagens)                      │
├─────────────────────────────────────────────────────────────┤
│  📅 25/01/2024  Flamengo x Vasco      R$ 800  [Finalizado] │
│  📅 15/12/2023  Flamengo x Palmeiras  R$ 950  [Finalizado] │
│  📅 10/11/2023  Flamengo x Botafogo   R$ 750  [Cancelado]  │
│  📅 05/10/2023  Flamengo x Fluminense R$ 800  [Finalizado] │
│  ...                                                        │
├─────────────────────────────────────────────────────────────┤
│  📊 RESUMO                                                 │
│  Total de viagens: 12                                      │
│  Valor total gasto: R$ 9.600                              │
│  Viagem mais cara: R$ 950 (Palmeiras)                     │
│  Adversário favorito: Vasco (4 jogos)                     │
└─────────────────────────────────────────────────────────────┘
```

### 💰 4. Seção: Situação Financeira

**Funcionalidades**:
- Resumo financeiro completo
- Score de crédito inteligente
- Parcelas pendentes destacadas
- Histórico de pagamentos
- Sistema de cobrança integrado
- Gráfico de evolução

**Interface**:
```
┌─────────────────────────────────────────────────────────────┐
│  💰 SITUAÇÃO FINANCEIRA                                    │
├─────────────────────────────────────────────────────────────┤
│  [R$ 9.600]     [R$ 400]      [25/01/24]    [R$ 800]      │
│  Total Gasto    Pendente      Última Compra  Ticket Médio  │
├─────────────────────────────────────────────────────────────┤
│  Status: 🟢 BOM PAGADOR                                    │
│  Score de Crédito: 85/100                                  │
├─────────────────────────────────────────────────────────────┤
│  💳 PARCELAS PENDENTES                                     │
├─────────────────────────────────────────────────────────────┤
│  🔴 Parcela 2/4 - R$ 200 - Vence em 15/02/24 (5 dias)    │
│  🟡 Parcela 3/4 - R$ 200 - Vence em 01/03/24 (20 dias)   │
│                                           [Cobrar Agora]   │
├─────────────────────────────────────────────────────────────┤
│  ✅ HISTÓRICO DE PAGAMENTOS                               │
├─────────────────────────────────────────────────────────────┤
│  ✅ 01/02/24 - R$ 200 - PIX - Parcela 1/4                │
│  ✅ 15/01/24 - R$ 800 - Cartão - À vista                  │
│  ✅ 10/12/23 - R$ 950 - PIX - À vista                     │
└─────────────────────────────────────────────────────────────┘
```

### 📱 5. Seção: Histórico de Comunicação

**Funcionalidades**:
- Timeline completa de interações
- Contadores por canal (WhatsApp, email, ligações)
- Identificação de preferência de contato
- Composer para nova mensagem
- Status de mensagens (enviado, lido, respondido)

**Interface**:
```
┌─────────────────────────────────────────────────────────────┐
│  📱 HISTÓRICO DE COMUNICAÇÃO                               │
├─────────────────────────────────────────────────────────────┤
│  Última interação: Hoje às 14:30                           │
│  Preferência: WhatsApp                                     │
│  📱 WhatsApp: 15 mensagens  📧 Email: 3  📞 Ligações: 1   │
├─────────────────────────────────────────────────────────────┤
│  📅 TIMELINE                                               │
├─────────────────────────────────────────────────────────────┤
│  🕐 Hoje 14:30                                             │
│  📱 WhatsApp: "Oi João! Lembrete da parcela que vence..."  │
│                                                             │
│  🕐 Ontem 09:15                                            │
│  📧 Email: "Confirmação de inscrição - Flamengo x Vasco"   │
│                                                             │
│  🕐 20/01 16:45                                            │
│  📱 WhatsApp: "Obrigado pela confirmação! Nos vemos..."    │
│                                                             │
│  🕐 15/01 10:30                                            │
│  📞 Ligação: Duração 5min - "Dúvidas sobre parcelamento"   │
└─────────────────────────────────────────────────────────────┘
```

### 📈 6. Seção: Estatísticas e Insights

**Funcionalidades**:
- Tempo de relacionamento
- Frequência de viagens
- Análise de sazonalidade
- Adversário favorito
- Score de fidelidade
- Sistema de badges
- Gráfico de atividade mensal

**Interface**:
```
┌─────────────────────────────────────────────────────────────┐
│  📈 ESTATÍSTICAS E INSIGHTS                                │
├─────────────────────────────────────────────────────────────┤
│  [👤 Cliente há]  [🚌 12 viagens]  [📅 6 por ano]  [⭐ 85] │
│   1 ano 2 meses    Total           Frequência      Score    │
├─────────────────────────────────────────────────────────────┤
│  🎯 PERFIL DO CLIENTE                                      │
│  • Adversário favorito: Vasco (33% das viagens)            │
│  • Mês preferido: Janeiro (4 viagens)                      │
│  • Forma de pagamento: PIX (60%), Cartão (40%)             │
│  • Pontualidade: Sempre pontual                            │
│  • Fidelidade: Cliente fiel (score 85/100)                 │
├─────────────────────────────────────────────────────────────┤
│  📊 GRÁFICO DE ATIVIDADE                                   │
│  Jan ████████ 4                                           │
│  Fev ██ 1                                                  │
│  Mar ████ 2                                               │
│  Abr ██ 1                                                  │
│  Mai ████ 2                                               │
│  Jun ██ 1                                                  │
│  Jul ██ 1                                                  │
├─────────────────────────────────────────────────────────────┤
│  🏆 BADGES E CONQUISTAS                                    │
│  🥇 Cliente VIP  🎯 Fiel  ⚡ Pontual  💰 Bom Pagador      │
└─────────────────────────────────────────────────────────────┘
```

### ⚙️ 7. Ações Rápidas

**Funcionalidades**:
- **Comunicação**: WhatsApp, email, ligação
- **Financeiro**: Cobrar pendências, gerar relatório
- **Viagens**: Inscrever em nova viagem, transferir
- **Administrativo**: Editar dados, adicionar notas

**Integrações**:
- WhatsApp Web com número preenchido
- Cliente de email padrão
- Sistema de cobrança personalizada
- Geração de PDF profissional

## 🗄️ Estrutura de Dados

### Interface Principal

```typescript
interface ClienteDetalhes {
  // Dados básicos
  cliente: {
    id: number;
    nome: string;
    cpf: string;
    telefone: string;
    email: string;
    data_nascimento: string;
    foto?: string;
    endereco: {
      cep: string;
      rua: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      estado: string;
    };
    como_conheceu: string;
    observacoes?: string;
    created_at: string;
  };

  // Histórico de viagens
  viagens: {
    id: string;
    adversario: string;
    data_jogo: string;
    valor_pago: number;
    valor_original: number;
    desconto: number;
    status: 'confirmado' | 'cancelado' | 'finalizado';
    setor_maracana: string;
    numero_onibus: string;
    avaliacao?: number;
  }[];

  // Situação financeira
  financeiro: {
    resumo: {
      total_gasto: number;
      valor_pendente: number;
      ultima_compra: string;
      ticket_medio: number;
      total_viagens: number;
    };
    status_credito: {
      classificacao: 'bom' | 'atencao' | 'inadimplente';
      score: number; // 0-100
      motivo?: string;
    };
    parcelas_pendentes: ParcelaPendente[];
    historico_pagamentos: HistoricoPagamento[];
  };

  // Comunicação
  comunicacao: {
    resumo: {
      ultima_interacao: string;
      preferencia_contato: 'whatsapp' | 'email' | 'telefone';
      total_whatsapp: number;
      total_email: number;
      total_ligacoes: number;
    };
    timeline: InteracaoComunicacao[];
  };

  // Estatísticas
  estatisticas: {
    cliente_desde: string;
    tempo_relacionamento: {
      anos: number;
      meses: number;
    };
    frequencia_viagens: {
      por_ano: number;
      por_mes: number;
    };
    sazonalidade: {
      mes_favorito: string;
      distribuicao_mensal: { mes: string; quantidade: number }[];
    };
    adversario_favorito: {
      nome: string;
      quantidade: number;
      percentual: number;
    };
    formas_pagamento: {
      pix: number;
      cartao: number;
      dinheiro: number;
    };
    score_fidelidade: number;
    badges: string[];
  };
}
```

### Hooks de Dados

```typescript
// Hook principal
const useClienteDetalhes = (clienteId: string) => {
  const [cliente, setCliente] = useState<ClienteDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega dados básicos primeiro
  // Depois carrega seções assíncronas
  
  return { cliente, loading, error, refetch };
};

// Hooks especializados
const useClienteViagens = (clienteId: string);
const useClienteFinanceiro = (clienteId: string);
const useClienteComunicacao = (clienteId: string);
const useClienteEstatisticas = (clienteId: string);
```

## 🚀 Plano de Implementação

### **FASE 1 - Fundação (2-3 dias)** 🎯 PRÓXIMA
- ✅ Estrutura base e roteamento
- ✅ Hook principal de dados
- ✅ Header do cliente
- ✅ Seção de informações pessoais
- ✅ Sistema de navegação por tabs
- ✅ Ações rápidas básicas

### **FASE 2 - Histórico e Financeiro (2-3 dias)**
- ✅ Histórico de viagens
- ✅ Situação financeira
- ✅ Cálculo de score de crédito
- ✅ Integração com sistema de cobrança

### **FASE 3 - Comunicação e Insights (2-3 dias)**
- ✅ Histórico de comunicação
- ✅ Estatísticas e insights
- ✅ Ações avançadas
- ✅ Otimizações de performance

### **FASE 4 - Polimento (1-2 dias)** - Opcional
- ✅ Melhorias de UX
- ✅ Funcionalidades avançadas
- ✅ Testes e qualidade

## 🎨 Design e Responsividade

### Breakpoints
- **Mobile**: < 768px (layout vertical, tabs horizontais)
- **Tablet**: 768px - 1024px (grid 2 colunas)
- **Desktop**: > 1024px (grid otimizado, sidebar)

### Componentes Visuais
- **Cards informativos**: Dados organizados em cards
- **Badges coloridos**: Status visual intuitivo
- **Gráficos simples**: Visualização de dados
- **Timeline**: Histórico cronológico
- **Loading states**: Skeleton loading
- **Empty states**: Mensagens quando não há dados

## 🔧 Integrações

### Banco de Dados
```sql
-- Consultas principais
SELECT * FROM clientes WHERE id = $1;
SELECT vp.*, v.adversario, v.data_jogo FROM viagem_passageiros vp...
SELECT * FROM viagem_passageiros_parcelas WHERE...
SELECT * FROM viagem_cobranca_historico WHERE...
```

### APIs Externas
- **WhatsApp Web**: `https://wa.me/55${telefone}?text=${mensagem}`
- **Email**: `mailto:${email}?subject=${assunto}`
- **PDF Generation**: jsPDF para relatórios

## 📊 Métricas de Sucesso

### KPIs Técnicos
- **Tempo de carregamento**: < 2 segundos
- **Taxa de erro**: < 1%
- **Performance mobile**: > 90 (Lighthouse)
- **Uso de cache**: > 80%

### KPIs de Negócio
- **Tempo de atendimento**: Redução de 30%
- **Satisfação do cliente**: Aumento de 25%
- **Conversão de cobrança**: Aumento de 40%
- **Uso da funcionalidade**: > 80% dos usuários

## 💡 Benefícios

### Para o Negócio
1. **👥 Relacionamento**: Conhecimento profundo de cada cliente
2. **💰 Vendas**: Identificação de oportunidades de upsell
3. **🎯 Marketing**: Segmentação inteligente baseada em dados
4. **💳 Cobrança**: Histórico completo para decisões de crédito
5. **📞 Atendimento**: Contexto completo em cada contato

### Para o Usuário
1. **⚡ Eficiência**: Todas as informações em um só lugar
2. **🎨 Experiência**: Interface moderna e intuitiva
3. **📱 Mobilidade**: Funciona perfeitamente em qualquer dispositivo
4. **🔍 Insights**: Dados inteligentes para tomada de decisão
5. **🚀 Produtividade**: Ações rápidas integradas

## 🔒 Segurança

### Controle de Acesso
- Verificação de permissões por role
- Logs de acesso aos perfis
- Mascaramento de dados sensíveis

### Proteção de Dados
- Sanitização de inputs
- Rate limiting
- Criptografia de dados sensíveis

## 🧪 Testes

### Casos de Teste
1. **Carregamento**: Cliente existente/inexistente, erro de conexão
2. **Interações**: WhatsApp, email, navegação, ações
3. **Responsividade**: Mobile, tablet, desktop
4. **Performance**: Tempo, memória, cache

## 📋 Próximos Passos

1. **✅ Documentação aprovada**
2. **🔄 Início da Fase 1**: Estrutura base e informações pessoais
3. **📦 Setup**: Instalar dependências (React Router, Date-fns, etc.)
4. **🚀 Desenvolvimento**: Implementação iterativa por fases

---

## 🎯 Status Atual

**📋 ESPECIFICAÇÃO COMPLETA** ✅
- Requirements definidos
- Design detalhado  
- Tasks organizadas por fase
- Documentação técnica completa

**🚀 PRONTO PARA IMPLEMENTAÇÃO**

Aguardando aprovação para iniciar a **Fase 1** com a estrutura básica e informações pessoais do cliente! 👍