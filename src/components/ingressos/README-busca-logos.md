# Sistema de Busca Automática de Logos dos Adversários

## Visão Geral

Este sistema implementa busca automática de logos dos adversários no formulário de cadastro de ingressos e permite edição de logos diretamente nos cards de jogos.

## Componentes

### AdversarioSearchInput

Componente de input com busca automática de adversários.

**Props:**
- `value`: string - Valor atual do input
- `onValueChange`: (value: string) => void - Callback para mudança de valor
- `onLogoChange`: (logoUrl: string) => void - Callback para mudança de logo
- `placeholder`: string - Placeholder do input
- `disabled`: boolean - Se o input está desabilitado
- `className`: string - Classes CSS adicionais

**Funcionalidades:**
- Debounce de 300ms para busca
- Cache de resultados por 5 minutos
- Navegação por teclado (setas, Enter, Escape)
- Cancelamento automático de requisições anteriores
- Lazy loading de imagens

### EditarLogoModal

Modal para edição de logos dos adversários nos cards de jogos.

**Props:**
- `open`: boolean - Se o modal está aberto
- `onOpenChange`: (open: boolean) => void - Callback para mudança de estado
- `jogo`: JogoIngresso - Dados do jogo
- `onSuccess`: () => void - Callback de sucesso

**Funcionalidades:**
- Preview em tempo real do novo logo
- Validação de URL de imagem
- Atualização em lote de todos os ingressos do jogo
- Feedback visual de erro/sucesso

## Hook useIngressos - Novas Funções

### buscarAdversarios(termo: string)

Busca adversários na tabela `adversarios` por termo.

**Parâmetros:**
- `termo`: string - Termo de busca (mínimo 2 caracteres)

**Retorna:**
- Array de adversários com id, nome e logo_url
- Limitado a 10 resultados
- Busca case-insensitive com ILIKE

### atualizarLogoJogo(adversario, dataJogo, localJogo, novoLogo)

Atualiza o logo de todos os ingressos de um jogo específico.

**Parâmetros:**
- `adversario`: string - Nome do adversário
- `dataJogo`: string - Data do jogo
- `localJogo`: string - Local do jogo ('casa' ou 'fora')
- `novoLogo`: string - Nova URL do logo

**Retorna:**
- boolean - true se sucesso, false se erro

## Cache

O sistema implementa cache simples para melhorar performance:

- **TTL**: 5 minutos
- **Tamanho máximo**: 50 entradas
- **Estratégia**: LRU (Least Recently Used)
- **Limpeza**: Automática a cada busca

## Integração

### No IngressoFormModal

```tsx
<AdversarioSearchInput
  value={field.value}
  onValueChange={field.onChange}
  onLogoChange={(logoUrl) => form.setValue('logo_adversario', logoUrl)}
  placeholder="Digite o nome do adversário..."
  disabled={estados.salvando}
/>
```

### No CleanJogoCard

```tsx
<div onClick={() => setEditarLogoOpen(true)}>
  {/* Logo clicável */}
</div>

<EditarLogoModal
  open={editarLogoOpen}
  onOpenChange={setEditarLogoOpen}
  jogo={jogo}
  onSuccess={() => {/* callback */}}
/>
```

## Performance

### Otimizações Implementadas

1. **Debounce**: Evita muitas requisições durante digitação
2. **Cache**: Reutiliza resultados de buscas recentes
3. **Cancelamento**: Cancela requisições obsoletas
4. **Lazy Loading**: Carrega imagens sob demanda
5. **Limite de resultados**: Máximo 10 sugestões por busca

### Métricas Esperadas

- **Tempo de resposta**: < 500ms para buscas em cache
- **Tempo de resposta**: < 2s para buscas no banco
- **Uso de memória**: < 1MB para cache completo
- **Requisições**: Redução de ~70% com cache

## Troubleshooting

### Problemas Comuns

1. **Sugestões não aparecem**
   - Verificar se há adversários cadastrados na tabela
   - Verificar conexão com Supabase
   - Verificar se termo tem pelo menos 2 caracteres

2. **Logos não carregam**
   - URLs podem estar inválidas
   - Problemas de CORS
   - Fallback para placeholder automático

3. **Edição não funciona**
   - Verificar permissões RLS no Supabase
   - Verificar se jogo tem ingressos cadastrados
   - Verificar logs do console para erros

### Debug

Para debug, adicione logs no console:

```tsx
// No AdversarioSearchInput
console.log('Buscando adversários:', termo);
console.log('Resultados:', resultados);

// No EditarLogoModal
console.log('Atualizando logo:', jogo, novoLogo);
```

## Futuras Melhorias

1. **Busca fuzzy**: Melhor reconhecimento de nomes similares
2. **Sugestões inteligentes**: Baseadas em histórico de uso
3. **Upload de imagens**: Permitir upload direto de logos
4. **Sincronização**: Sync automático com APIs de logos de times
5. **Bulk edit**: Edição em lote de múltiplos jogos