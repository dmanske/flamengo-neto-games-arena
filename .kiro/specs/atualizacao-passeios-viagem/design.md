# Design Document

## Overview

Esta funcionalidade atualiza completamente o sistema de passeios no cadastro de viagens, substituindo a lista atual por uma nova estrutura organizada em duas categorias distintas. A implementação envolve mudanças no frontend (React/TypeScript), atualizações no banco de dados (Supabase) e garantia de compatibilidade com dados existentes.

## Architecture

### Frontend Architecture
```
src/pages/
├── CadastrarViagem.tsx (atualizar lista de passeios)
├── EditarViagem.tsx (atualizar lista de passeios)

src/components/
├── viagem/
│   ├── PasseiosSection.tsx (novo componente)
│   ├── PasseiosPagosSection.tsx (novo componente)
│   └── PasseiosGratuitosSection.tsx (novo componente)

src/data/
└── passeios.ts (nova estrutura de dados)
```

### Database Architecture
```
Supabase Tables:
├── passeios (nova tabela principal)
│   ├── id: UUID PRIMARY KEY
│   ├── nome: TEXT NOT NULL
│   ├── valor: DECIMAL(10,2) NOT NULL
│   ├── categoria: TEXT NOT NULL ('pago' | 'gratuito')
│   ├── ativo: BOOLEAN DEFAULT true
│   ├── created_at: TIMESTAMP
│   └── updated_at: TIMESTAMP
│
├── viagem_passeios (nova tabela de relacionamento)
│   ├── id: UUID PRIMARY KEY
│   ├── viagem_id: UUID REFERENCES viagens(id)
│   ├── passeio_id: UUID REFERENCES passeios(id)
│   ├── valor_cobrado: DECIMAL(10,2)
│   └── created_at: TIMESTAMP
│
└── viagens (existente - manter compatibilidade)
    ├── passeios_pagos: string[] (deprecar gradualmente)
    └── outro_passeio: string (manter)
```

## Components and Interfaces

### 1. Nova Estrutura de Dados dos Passeios

```typescript
// src/types/passeio.ts
export interface Passeio {
  id: string;
  nome: string;
  valor: number;
  categoria: 'pago' | 'gratuito';
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ViagemPasseio {
  id: string;
  viagem_id: string;
  passeio_id: string;
  valor_cobrado: number;
  created_at: string;
  passeio?: Passeio; // Join com tabela passeios
}

// src/data/passeios-iniciais.ts
export const PASSEIOS_INICIAIS: Omit<Passeio, 'id' | 'created_at' | 'updated_at'>[] = [
  // Passeios Pagos à Parte
  { nome: "Cristo Redentor", valor: 85.00, categoria: 'pago', ativo: true },
  { nome: "Pão de Açúcar", valor: 120.00, categoria: 'pago', ativo: true },
  { nome: "Museu do Flamengo", valor: 45.00, categoria: 'pago', ativo: true },
  { nome: "Aquário", valor: 60.00, categoria: 'pago', ativo: true },
  { nome: "Roda-Gigante", valor: 35.00, categoria: 'pago', ativo: true },
  { nome: "Museu do Amanhã", valor: 30.00, categoria: 'pago', ativo: true },
  { nome: "Tour do Maracanã", valor: 55.00, categoria: 'pago', ativo: true },
  { nome: "Rocinha", valor: 40.00, categoria: 'pago', ativo: true },
  { nome: "Vidigal", valor: 35.00, categoria: 'pago', ativo: true },
  { nome: "Tour da Gávea", valor: 65.00, categoria: 'pago', ativo: true },
  { nome: "Parque Lage", valor: 25.00, categoria: 'pago', ativo: true },
  { nome: "Museu do Mar", valor: 40.00, categoria: 'pago', ativo: true },
  
  // Passeios Gratuitos
  { nome: "Lapa", valor: 0, categoria: 'gratuito', ativo: true },
  { nome: "Escadaria Selarón", valor: 0, categoria: 'gratuito', ativo: true },
  { nome: "Igreja Catedral Metropolitana", valor: 0, categoria: 'gratuito', ativo: true },
  { nome: "Teatro Municipal", valor: 0, categoria: 'gratuito', ativo: true },
  { nome: "Copacabana", valor: 0, categoria: 'gratuito', ativo: true },
  { nome: "Ipanema", valor: 0, categoria: 'gratuito', ativo: true },
  { nome: "Leblon", valor: 0, categoria: 'gratuito', ativo: true },
  { nome: "Barra da Tijuca", valor: 0, categoria: 'gratuito', ativo: true },
  { nome: "Museu do Amanhã", valor: 0, categoria: 'gratuito', ativo: true },
  { nome: "Boulevard Olímpico", valor: 0, categoria: 'gratuito', ativo: true },
  { nome: "Cidade do Samba", valor: 0, categoria: 'gratuito', ativo: true },
  { nome: "Pedra do Sal", valor: 0, categoria: 'gratuito', ativo: true }
];
```

### 2. Interface de Dados da Viagem

```typescript
// Nova interface para formulário
interface ViagemFormData {
  // ... outros campos existentes
  passeios_selecionados: string[]; // IDs dos passeios selecionados
  outro_passeio?: string;
  total_passeios?: number; // calculado automaticamente
}

// Interface para exibição
interface ViagemComPasseios {
  // ... outros campos da viagem
  viagem_passeios: ViagemPasseio[];
  total_custos_adicionais: number;
  outro_passeio?: string;
}

// Hook para gerenciar passeios (geral)
interface UsePasseiosReturn {
  passeios: Passeio[];
  passeiosPagos: Passeio[];
  passeiosGratuitos: Passeio[];
  loading: boolean;
  error: string | null;
  calcularTotal: (passeioIds: string[]) => number;
  refetch: () => void;
}

// Hook otimizado para passeios específicos de uma viagem
interface UsePasseiosViagemReturn {
  passeiosViagem: ViagemPasseio[]; // Passeios com dados do relacionamento
  passeiosDisponiveis: Passeio[]; // Todos os passeios para seleção
  loading: boolean;
  error: string | null;
  calcularTotalViagem: () => number;
  adicionarPasseio: (passeioId: string) => Promise<void>;
  removerPasseio: (passeioId: string) => Promise<void>;
  refetch: () => void;
}
```

### 3. Componente de Seleção de Passeios

```typescript
// src/components/viagem/PasseiosSection.tsx
interface PasseiosSectionProps {
  form: UseFormReturn<ViagemFormData>;
}

export const PasseiosSection: React.FC<PasseiosSectionProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Passeios Inclusos</CardTitle>
        <CardDescription>
          Selecione os passeios disponíveis para esta viagem
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <PasseiosPagosSection form={form} />
        <PasseiosGratuitosSection form={form} />
      </CardContent>
    </Card>
  );
};
```

### 4. Seção de Passeios Pagos

```typescript
// src/components/viagem/PasseiosPagosSection.tsx
export const PasseiosPagosSection: React.FC<{ form: UseFormReturn<ViagemFormData> }> = ({ form }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-orange-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {PASSEIOS_CONFIG.pagos.titulo}
        </h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        {PASSEIOS_CONFIG.pagos.descricao}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PASSEIOS_CONFIG.pagos.lista.map((passeio) => (
          <FormField
            key={passeio}
            control={form.control}
            name="passeios_pagos"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value?.includes(passeio)}
                    onCheckedChange={(checked) => {
                      const updatedValue = checked
                        ? [...(field.value || []), passeio]
                        : field.value?.filter((value) => value !== passeio) || [];
                      field.onChange(updatedValue);
                    }}
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal cursor-pointer">
                  {passeio}
                </FormLabel>
              </FormItem>
            )}
          />
        ))}
      </div>
    </div>
  );
};
```

### 5. Seção de Passeios Gratuitos

```typescript
// src/components/viagem/PasseiosGratuitosSection.tsx
export const PasseiosGratuitosSection: React.FC<{ form: UseFormReturn<ViagemFormData> }> = ({ form }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          {PASSEIOS_CONFIG.gratuitos.titulo}
        </h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        {PASSEIOS_CONFIG.gratuitos.descricao}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PASSEIOS_CONFIG.gratuitos.lista.map((passeio) => (
          <div key={passeio} className="flex items-center space-x-3">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-700">{passeio}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 6. Hook Otimizado para Passeios de Viagem Específica

```typescript
// src/hooks/usePasseiosViagem.ts
export const usePasseiosViagem = (viagemId: string) => {
  const [passeiosViagem, setPasseiosViagem] = useState<ViagemPasseio[]>([]);
  const [passeiosDisponiveis, setPasseiosDisponiveis] = useState<Passeio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Query otimizada com JOIN
  const fetchPasseiosViagem = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar passeios da viagem com JOIN
      const { data: viagemPasseios, error: viagemError } = await supabase
        .from('viagem_passeios')
        .select(`
          *,
          passeio:passeios(*)
        `)
        .eq('viagem_id', viagemId);

      if (viagemError) throw viagemError;

      // Buscar todos os passeios disponíveis para seleção
      const { data: todosPasseios, error: passeiosError } = await supabase
        .from('passeios')
        .select('*')
        .eq('ativo', true)
        .order('categoria', { ascending: true })
        .order('nome', { ascending: true });

      if (passeiosError) throw passeiosError;

      setPasseiosViagem(viagemPasseios || []);
      setPasseiosDisponiveis(todosPasseios || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar passeios');
    } finally {
      setLoading(false);
    }
  }, [viagemId]);

  // Calcular total dos passeios da viagem
  const calcularTotalViagem = useCallback(() => {
    return passeiosViagem.reduce((total, vp) => total + vp.valor_cobrado, 0);
  }, [passeiosViagem]);

  // Adicionar passeio à viagem
  const adicionarPasseio = useCallback(async (passeioId: string) => {
    const passeio = passeiosDisponiveis.find(p => p.id === passeioId);
    if (!passeio) return;

    const { error } = await supabase
      .from('viagem_passeios')
      .insert({
        viagem_id: viagemId,
        passeio_id: passeioId,
        valor_cobrado: passeio.valor
      });

    if (!error) {
      await fetchPasseiosViagem();
    }
  }, [viagemId, passeiosDisponiveis, fetchPasseiosViagem]);

  // Remover passeio da viagem
  const removerPasseio = useCallback(async (passeioId: string) => {
    const { error } = await supabase
      .from('viagem_passeios')
      .delete()
      .eq('viagem_id', viagemId)
      .eq('passeio_id', passeioId);

    if (!error) {
      await fetchPasseiosViagem();
    }
  }, [viagemId, fetchPasseiosViagem]);

  useEffect(() => {
    if (viagemId) {
      fetchPasseiosViagem();
    }
  }, [viagemId, fetchPasseiosViagem]);

  return {
    passeiosViagem,
    passeiosDisponiveis,
    loading,
    error,
    calcularTotalViagem,
    adicionarPasseio,
    removerPasseio,
    refetch: fetchPasseiosViagem
  };
};
```

## Data Models

### Estrutura Atual vs Nova

```typescript
// ANTES (estrutura atual)
const passeiosDisponiveis = [
  "Cristo Redentor",
  "Pão de Açúcar",
  // ... lista única sem categorização
];

// DEPOIS (nova estrutura)
const PASSEIOS_CONFIG = {
  pagos: {
    titulo: "Passeios Pagos à Parte",
    lista: [/* 12 passeios pagos */]
  },
  gratuitos: {
    titulo: "Passeios Gratuitos", 
    lista: [/* 12 passeios gratuitos */]
  }
};
```

### Migração de Dados

```typescript
// Função para migrar dados existentes
const migrarPasseiosExistentes = (passeiosAntigos: string[]) => {
  // Mapear passeios antigos para nova estrutura
  const passeiosPagos = passeiosAntigos.filter(p => 
    PASSEIOS_CONFIG.pagos.lista.includes(p)
  );
  
  return {
    passeios_pagos: passeiosPagos,
    // Manter compatibilidade
  };
};
```

## Error Handling

### Validação de Dados

```typescript
// Validação no frontend
const validatePasseios = (passeios: string[]) => {
  const todosPasseiosValidos = [...PASSEIOS_CONFIG.pagos.lista, ...PASSEIOS_CONFIG.gratuitos.lista];
  
  return passeios.every(passeio => 
    todosPasseiosValidos.includes(passeio)
  );
};

// Schema de validação
const viagemSchema = z.object({
  // ... outros campos
  passeios_pagos: z.array(z.string()).default([]).refine(
    (passeios) => validatePasseios(passeios),
    "Passeios inválidos selecionados"
  ),
});
```

### Tratamento de Erros

1. **Passeios Inválidos**: Filtrar passeios que não existem na nova lista
2. **Dados Corrompidos**: Fallback para array vazio
3. **Compatibilidade**: Manter suporte a dados antigos durante transição

## Testing Strategy

### Testes Unitários

```typescript
// Testes para validação de passeios
describe('PasseiosConfig', () => {
  test('deve conter todos os passeios pagos esperados', () => {
    expect(PASSEIOS_CONFIG.pagos.lista).toHaveLength(12);
    expect(PASSEIOS_CONFIG.pagos.lista).toContain('Cristo Redentor');
  });

  test('deve conter todos os passeios gratuitos esperados', () => {
    expect(PASSEIOS_CONFIG.gratuitos.lista).toHaveLength(12);
    expect(PASSEIOS_CONFIG.gratuitos.lista).toContain('Copacabana');
  });
});
```

### Testes de Integração

1. **Cadastro de Viagem**: Verificar se passeios são salvos corretamente
2. **Edição de Viagem**: Verificar se passeios são carregados corretamente  
3. **Compatibilidade**: Verificar se viagens antigas ainda funcionam

### Testes de Interface

1. **Seleção de Passeios**: Verificar interação com checkboxes
2. **Responsividade**: Verificar layout em diferentes tamanhos de tela
3. **Validação**: Verificar mensagens de erro apropriadas

## Migration Strategy

### Estratégia Híbrida (Cenário 1 + Recriação Manual)

**Princípio**: Sistema dual que suporta viagens antigas e novas simultaneamente

### Compatibilidade Total
```typescript
// Detecção automática do tipo de viagem
const isViagemNova = viagem.viagem_passeios?.length > 0;
const isViagemAntiga = viagem.passeios_pagos?.length > 0;

// Renderização condicional
if (isViagemNova) {
  return <PasseiosComValores passeios={viagem.viagem_passeios} />;
} else {
  return <PasseiosLegacy passeios={viagem.passeios_pagos} />;
}
```

### Visualização na Lista de Passageiros
```typescript
// Formato compacto para coluna "Passeios"
const formatarPasseios = (passageiro) => {
  if (!passageiro.passeios || passageiro.passeios.length === 0) {
    return "🗺️ Nenhum";
  }
  
  if (passageiro.passeios.length <= 2) {
    return `🗺️ ${passageiro.passeios.map(p => p.nome).join(', ')} (+${passageiro.passeios.length})`;
  } else {
    const primeiros = passageiro.passeios.slice(0, 2).map(p => p.nome).join(', ');
    return `🗺️ ${primeiros}... (+${passageiro.passeios.length})`;
  }
};
```

### Fases de Implementação
1. **Fase 1**: Sistema híbrido funcionando
2. **Fase 2**: Interface de lista atualizada  
3. **Fase 3**: Ferramentas de migração opcional
4. **Fase 4**: Melhorias e otimizações

### Rollback Plan
- Viagens antigas nunca são afetadas
- Sistema novo pode ser desabilitado via feature flag
- Dados novos podem ser convertidos de volta se necessário