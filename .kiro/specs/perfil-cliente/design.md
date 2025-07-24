# Sistema de Perfil do Cliente - Documento de Design

## Visão Geral

O Sistema de Perfil do Cliente é uma página completa que oferece visão 360° de cada cliente, integrando dados pessoais, histórico comercial, situação financeira e insights inteligentes em uma interface moderna e responsiva.

## Arquitetura do Sistema

### Estrutura de Componentes

```
src/pages/ClienteDetalhes.tsx
├── ClienteHeader.tsx (foto, nome, dados básicos)
├── ClienteNavigation.tsx (tabs de navegação)
├── sections/
│   ├── InformacoesPessoais.tsx
│   ├── HistoricoViagens.tsx
│   ├── SituacaoFinanceira.tsx
│   ├── HistoricoComunicacao.tsx
│   ├── EstatisticasInsights.tsx
│   └── AcoesRapidas.tsx
├── hooks/
│   ├── useClienteDetalhes.ts
│   ├── useClienteViagens.ts
│   ├── useClienteFinanceiro.ts
│   └── useClienteComunicacao.ts
└── types/
    └── cliente-detalhes.ts
```

### Fluxo de Dados

```mermaid
graph TD
    A[Lista de Clientes] --> B[Clique no Cliente]
    B --> C[/dashboard/clientes/:id]
    C --> D[useClienteDetalhes Hook]
    D --> E[Buscar Dados Básicos]
    D --> F[Buscar Histórico Viagens]
    D --> G[Buscar Situação Financeira]
    D --> H[Buscar Comunicação]
    E --> I[Renderizar Header]
    F --> J[Renderizar Histórico]
    G --> K[Renderizar Financeiro]
    H --> L[Renderizar Comunicação]
    I --> M[Página Completa]
    J --> M
    K --> M
    L --> M
```

## Design da Interface

### Layout Principal

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

### Seção: Informações Pessoais

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

### Seção: Histórico de Viagens

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

### Seção: Situação Financeira

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

### Seção: Histórico de Comunicação

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

### Seção: Estatísticas e Insights

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

## Estrutura de Dados

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
    parcelas_pendentes: {
      id: string;
      numero_parcela: number;
      total_parcelas: number;
      valor_parcela: number;
      data_vencimento: string;
      dias_atraso: number;
      viagem_adversario: string;
    }[];
    historico_pagamentos: {
      id: string;
      data_pagamento: string;
      valor_pago: number;
      forma_pagamento: string;
      numero_parcela: number;
      total_parcelas: number;
      viagem_adversario: string;
    }[];
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
    timeline: {
      id: string;
      data_hora: string;
      tipo: 'whatsapp' | 'email' | 'ligacao';
      conteudo: string;
      status?: 'enviado' | 'lido' | 'respondido';
      duracao?: number; // para ligações
    }[];
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

// Hook para viagens
const useClienteViagens = (clienteId: string) => {
  // Busca viagens do cliente
  // Calcula estatísticas
  // Retorna dados formatados
};

// Hook para financeiro
const useClienteFinanceiro = (clienteId: string) => {
  // Busca parcelas e pagamentos
  // Calcula score de crédito
  // Identifica pendências
};

// Hook para comunicação
const useClienteComunicacao = (clienteId: string) => {
  // Busca histórico de cobrança
  // Organiza timeline
  // Calcula preferências
};
```

## Integrações

### Banco de Dados

```sql
-- Consultas principais
SELECT * FROM clientes WHERE id = $1;

SELECT vp.*, v.adversario, v.data_jogo 
FROM viagem_passageiros vp
JOIN viagens v ON vp.viagem_id = v.id
WHERE vp.cliente_id = $1
ORDER BY v.data_jogo DESC;

SELECT * FROM viagem_passageiros_parcelas 
WHERE viagem_passageiro_id IN (
  SELECT id FROM viagem_passageiros WHERE cliente_id = $1
)
ORDER BY data_vencimento;

SELECT * FROM viagem_cobranca_historico vch
JOIN viagem_passageiros vp ON vch.viagem_passageiro_id = vp.id
WHERE vp.cliente_id = $1
ORDER BY vch.data_tentativa DESC;
```

### APIs Externas

```typescript
// WhatsApp Web Integration
const openWhatsApp = (telefone: string, mensagem?: string) => {
  const url = `https://wa.me/55${telefone.replace(/\D/g, '')}`;
  if (mensagem) {
    url += `?text=${encodeURIComponent(mensagem)}`;
  }
  window.open(url, '_blank');
};

// Email Integration
const openEmail = (email: string, assunto?: string) => {
  const url = `mailto:${email}`;
  if (assunto) {
    url += `?subject=${encodeURIComponent(assunto)}`;
  }
  window.location.href = url;
};
```

## Performance

### Estratégias de Otimização

1. **Carregamento Progressivo**
   - Dados básicos primeiro (< 500ms)
   - Seções secundárias assíncronas
   - Lazy loading para históricos longos

2. **Cache Inteligente**
   - Cache local para navegação rápida
   - Invalidação automática em mudanças
   - Prefetch de dados relacionados

3. **Paginação**
   - Histórico de viagens: 10 por página
   - Timeline de comunicação: 20 por página
   - Infinite scroll quando apropriado

4. **Otimização de Queries**
   - Índices otimizados no banco
   - Queries específicas por seção
   - Agregações no backend

## Responsividade

### Breakpoints

```css
/* Mobile First */
.cliente-detalhes {
  /* Base: Mobile (< 768px) */
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  /* Tablet */
  .cliente-detalhes {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1024px) {
  /* Desktop */
  .cliente-detalhes {
    grid-template-columns: 2fr 1fr;
  }
}
```

### Adaptações Mobile

- **Header compacto**: Foto menor, informações essenciais
- **Tabs horizontais**: Navegação por swipe
- **Cards empilhados**: Layout vertical otimizado
- **Botões grandes**: Touch-friendly (44px mínimo)
- **Scroll infinito**: Para listas longas

## Segurança

### Controle de Acesso

```typescript
// Verificação de permissões
const useClientePermissions = (clienteId: string) => {
  const { user } = useAuth();
  
  return {
    canView: user?.role === 'admin' || user?.role === 'manager',
    canEdit: user?.role === 'admin',
    canDelete: user?.role === 'admin',
    canViewFinancial: user?.permissions?.includes('financial')
  };
};
```

### Proteção de Dados

- **Mascaramento**: CPF e telefone parcialmente ocultos
- **Logs de acesso**: Registro de visualizações
- **Sanitização**: Inputs sempre sanitizados
- **Rate limiting**: Proteção contra abuso

## Testes

### Casos de Teste

1. **Carregamento de dados**
   - Cliente existente
   - Cliente inexistente
   - Erro de conexão
   - Dados parciais

2. **Interações**
   - Clique em WhatsApp
   - Clique em email
   - Navegação entre tabs
   - Ações rápidas

3. **Responsividade**
   - Mobile portrait/landscape
   - Tablet
   - Desktop
   - Diferentes resoluções

4. **Performance**
   - Tempo de carregamento
   - Uso de memória
   - Navegação fluida
   - Cache funcionando

## Métricas de Sucesso

### KPIs Técnicos
- **Tempo de carregamento**: < 2 segundos
- **Taxa de erro**: < 1%
- **Uso de cache**: > 80%
- **Performance mobile**: > 90 (Lighthouse)

### KPIs de Negócio
- **Tempo de atendimento**: Redução de 30%
- **Satisfação do cliente**: Aumento de 25%
- **Conversão de cobrança**: Aumento de 40%
- **Uso da funcionalidade**: > 80% dos usuários

---

## Próximos Passos

1. **Aprovação do design** ✅
2. **Implementação Fase 1**: Estrutura básica e dados pessoais
3. **Implementação Fase 2**: Histórico e financeiro
4. **Implementação Fase 3**: Comunicação e insights
5. **Testes e otimização**
6. **Deploy e monitoramento**