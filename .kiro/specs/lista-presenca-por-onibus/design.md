# Documento de Design - Lista de Presença por Ônibus

## Overview

O sistema de Lista de Presença por Ônibus permitirá que administradores gerem links específicos para cada ônibus de uma viagem, possibilitando que responsáveis/guias acessem uma interface dedicada apenas aos passageiros do seu ônibus específico. A solução mantém toda a funcionalidade da lista de presença atual, mas com foco específico em um ônibus.

## Architecture

### Estrutura de Rotas
```
/lista-presenca/:viagemId                    # Lista geral (existente)
/lista-presenca/:viagemId/onibus/:onibusId   # Lista específica por ônibus (nova)
```

### Componentes Principais
```
src/pages/ListaPresencaOnibus.tsx           # Nova página específica por ônibus
src/components/lista-presenca/
  ├── LinksOnibusSection.tsx                # Seção para gerar links (admin)
  ├── OnibusHeader.tsx                      # Cabeçalho com info do ônibus
  ├── PassageirosOnibusGrid.tsx             # Grid de passageiros do ônibus
  └── EstatisticasOnibus.tsx                # Estatísticas específicas do ônibus
```

## Components and Interfaces

### 1. LinksOnibusSection Component
**Localização:** Integrado na página `DetalhesViagem.tsx`
**Propósito:** Permitir que administradores gerem e copiem links específicos por ônibus

```typescript
interface LinksOnibusProps {
  viagemId: string;
  onibus: OnibusViagem[];
}

interface OnibusViagem {
  id: string;
  numero_identificacao: string;
  tipo_onibus: string;
  empresa: string;
  capacidade_onibus: number;
}
```

**Funcionalidades:**
- Listar todos os ônibus da viagem
- Botão "Copiar Link" para cada ônibus
- Indicador visual de link copiado
- Contagem de passageiros por ônibus

### 2. ListaPresencaOnibus Page
**Rota:** `/lista-presenca/:viagemId/onibus/:onibusId`
**Propósito:** Interface dedicada para lista de presença de um ônibus específico

```typescript
interface ListaPresencaOnibusProps {
  viagemId: string;
  onibusId: string;
}

interface PassageiroOnibus {
  id: string;
  viagem_passageiro_id: string;
  nome: string;
  telefone: string;
  cpf: string;
  foto?: string;
  cidade_embarque: string;
  setor_maracana: string;
  status_presenca: 'pendente' | 'presente' | 'ausente';
  status_pagamento: string;
  valor: number;
  desconto: number;
  is_responsavel_onibus: boolean;
  passeios: PasseioInfo[];
  historico_pagamentos: PagamentoInfo[];
}
```

### 3. OnibusHeader Component
**Propósito:** Exibir informações do ônibus e estatísticas básicas

```typescript
interface OnibusHeaderProps {
  onibus: OnibusInfo;
  viagem: ViagemInfo;
  estatisticas: EstatisticasOnibus;
}

interface EstatisticasOnibus {
  total: number;
  presentes: number;
  pendentes: number;
  ausentes: number;
  taxa_presenca: number;
}
```

### 4. PassageirosOnibusGrid Component
**Propósito:** Exibir lista de passageiros com funcionalidade de presença

```typescript
interface PassageirosOnibusGridProps {
  passageiros: PassageiroOnibus[];
  onTogglePresenca: (viagemPassageiroId: string, statusAtual: string) => Promise<void>;
  loading: boolean;
}
```

## Data Models

### Estrutura de Dados Existente (Reutilizada)
```sql
-- Tabelas existentes que serão utilizadas:
viagens (id, adversario, data_jogo, status_viagem, logo_flamengo, logo_adversario)
viagem_onibus (id, viagem_id, numero_identificacao, tipo_onibus, empresa, capacidade_onibus)
viagem_passageiros (id, viagem_id, cliente_id, onibus_id, status_presenca, ...)
clientes (id, nome, telefone, cpf, foto)
passageiro_passeios (...)
historico_pagamentos_categorizado (...)
```

### Queries Principais
```sql
-- Buscar ônibus específico da viagem
SELECT * FROM viagem_onibus 
WHERE viagem_id = $1 AND id = $2;

-- Buscar passageiros do ônibus específico
SELECT vp.*, c.nome, c.telefone, c.cpf, c.foto
FROM viagem_passageiros vp
JOIN clientes c ON vp.cliente_id = c.id
WHERE vp.viagem_id = $1 AND vp.onibus_id = $2;
```

## Error Handling

### Cenários de Erro
1. **Ônibus não encontrado:** Retornar 404 com mensagem clara
2. **Ônibus não pertence à viagem:** Retornar 404 com mensagem específica
3. **Viagem não em andamento:** Exibir aviso sobre disponibilidade
4. **Erro de autenticação:** Redirecionar para login
5. **Erro ao atualizar presença:** Manter estado anterior e exibir erro

### Tratamento de Estados
```typescript
interface EstadoListaPresenca {
  loading: boolean;
  error: string | null;
  onibus: OnibusInfo | null;
  passageiros: PassageiroOnibus[];
  atualizandoPresenca: Set<string>; // IDs sendo atualizados
}
```

## Testing Strategy

### Testes Unitários
- **LinksOnibusSection:** Geração e cópia de links
- **OnibusHeader:** Cálculo de estatísticas
- **PassageirosOnibusGrid:** Toggle de presença
- **Filtros:** Busca e filtros funcionando corretamente

### Testes de Integração
- **Rota específica:** Carregamento correto da página por ônibus
- **Autenticação:** Verificação de permissões
- **Atualização de presença:** Persistência no banco de dados
- **Estados de erro:** Tratamento adequado de cenários de falha

### Testes E2E
- **Fluxo completo:** Admin gera link → Guia acessa → Marca presenças
- **Responsividade:** Funcionamento em dispositivos móveis
- **Múltiplos usuários:** Vários guias usando simultaneamente

## Design Patterns

### 1. Reutilização de Código
- **Hooks existentes:** Reutilizar `useListaPresenca` com adaptações
- **Componentes UI:** Usar componentes existentes do shadcn/ui
- **Utilitários:** Aproveitar formatters e validações existentes

### 2. Estado Local vs Global
- **Estado local:** Dados específicos do ônibus (passageiros, filtros)
- **Contexto global:** Informações de autenticação
- **Cache:** Evitar recarregamentos desnecessários

### 3. Performance
- **Lazy loading:** Carregar apenas dados do ônibus específico
- **Debounce:** Busca em tempo real com delay
- **Otimistic updates:** Atualizar UI antes da confirmação do servidor

## User Experience

### Interface Mobile-First
```css
/* Breakpoints */
sm: 640px   /* Smartphones */
md: 768px   /* Tablets */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop grande */
```

### Fluxo de Navegação
1. **Admin:** Detalhes da Viagem → Seção "Links por Ônibus" → Copiar link
2. **Guia:** Acessa link → Login (se necessário) → Lista específica do ônibus
3. **Guia:** Busca passageiro → Marca presença → Vê estatísticas atualizadas

### Feedback Visual
- **Loading states:** Spinners durante carregamento
- **Success feedback:** Toast de confirmação ao marcar presença
- **Error feedback:** Mensagens de erro claras
- **Empty states:** Mensagens quando não há passageiros

## Security Considerations

### Autenticação
- **Verificação obrigatória:** Todos os acessos devem ser autenticados
- **Redirecionamento:** Login automático se não autenticado
- **Sessão persistente:** Manter login durante uso

### Autorização
- **Permissões:** Verificar se usuário pode acessar a viagem
- **Validação de parâmetros:** Verificar se ônibus pertence à viagem
- **Rate limiting:** Evitar spam de atualizações de presença

### Validação de Dados
```typescript
// Validação de parâmetros da URL
const viagemIdSchema = z.string().uuid();
const onibusIdSchema = z.string().uuid();

// Validação de status de presença
const statusPresencaSchema = z.enum(['pendente', 'presente', 'ausente']);
```

## Integration Points

### Com Sistema Existente
- **Lista geral:** Link para voltar à lista completa
- **Detalhes da viagem:** Integração da seção de links
- **Autenticação:** Usar sistema de auth existente
- **Banco de dados:** Mesmas tabelas e estruturas

### APIs Utilizadas
```typescript
// Supabase queries existentes (adaptadas)
const fetchOnibusData = (viagemId: string, onibusId: string) => { ... }
const fetchPassageirosOnibus = (viagemId: string, onibusId: string) => { ... }
const updateStatusPresenca = (viagemPassageiroId: string, status: string) => { ... }
```

## Performance Optimization

### Carregamento Inicial
- **Dados mínimos:** Carregar apenas dados essenciais primeiro
- **Lazy loading:** Carregar detalhes adicionais conforme necessário
- **Cache inteligente:** Evitar recarregamentos desnecessários

### Atualizações em Tempo Real
- **Debounce:** Busca com delay de 300ms
- **Throttle:** Limitar atualizações de presença
- **Optimistic updates:** UI responsiva

### Bundle Size
- **Code splitting:** Carregar página apenas quando necessário
- **Tree shaking:** Remover código não utilizado
- **Lazy imports:** Importar componentes sob demanda