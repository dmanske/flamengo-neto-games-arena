# Sistema de Filtros para Relatórios PDF

## Visão Geral

O sistema de filtros permite personalizar os relatórios PDF de viagens, oferecendo controle granular sobre quais dados incluir e como apresentá-los.

## Componentes

### 1. ReportFilters.tsx
Componente principal que renderiza a interface de filtros com:
- **Filtros de Passageiros**: Status, setor, ônibus, passeios
- **Filtros de Valores**: Faixa de valores, descontos
- **Personalização**: Seções do relatório a incluir

### 2. ReportFiltersDialog.tsx
Modal que contém o componente de filtros com:
- Botões de ação (Aplicar, Resetar, Cancelar)
- Scroll area para filtros longos
- Preview em tempo real

### 3. ReportPreview.tsx
Componente que mostra preview dos dados filtrados:
- Número de passageiros afetados
- Total arrecadado filtrado
- Seções que serão incluídas
- Indicador visual de filtros ativos

### 4. ViagemReport.tsx (Atualizado)
Componente do relatório que agora aceita:
- `filters`: Configurações de filtro
- `passageirosFiltrados`: Lista filtrada de passageiros
- Renderização condicional de seções

## Tipos de Filtros Disponíveis

### 🚀 Filtros Rápidos
- **📋 Lista para Responsável do Ônibus**: Remove todas as informações financeiras
  - Oculta valores da viagem e passageiros
  - Oculta resumo financeiro
  - Foca em: Nome, Telefone, Setor, Passeios
  - Opção de mostrar/ocultar status de pagamento

### Filtros de Passageiros
- **Status de Pagamento**: Todos, Pago, Pendente, Parcial
- **Setor do Maracanã**: Múltipla seleção por setor
- **Ônibus**: Filtrar por ônibus específicos
- **Passeios Específicos**: Para viagens novas com sistema de passeios

### Filtros de Passeios
- **Tipo de Passeios**: Todos, Apenas Pagos, Apenas Gratuitos
- **Mostrar Nomes**: Exibir nomes dos passeios na lista de passageiros
- **Passeios Específicos**: Filtrar por passeios individuais

### Filtros de Valores
- **Valor Mínimo/Máximo**: Faixa de valores (desabilitado no modo responsável)
- **Apenas com Desconto**: Mostrar só passageiros com desconto

### Personalização do Relatório
- **Seções**: Resumo Financeiro, Distribuição por Setor, Lista de Ônibus, etc.
- **Informações Financeiras**: Controle granular sobre exibição de valores
- **Agrupar por Ônibus**: Alterar formato de exibição

## Como Usar

### 1. Na Página de Detalhes da Viagem
```tsx
// O botão "Filtros do Relatório" abre o modal
<Button onClick={() => setFiltersDialogOpen(true)}>
  <Filter className="h-4 w-4 mr-2" />
  Filtros do Relatório
</Button>
```

### 2. Aplicar Filtros
1. Clique em "Filtros do Relatório"
2. Configure os filtros desejados
3. Observe o preview em tempo real
4. Clique em "Aplicar Filtros"
5. Use "Imprimir" ou "Exportar PDF" normalmente

### 3. Resetar Filtros
- Use o botão "Resetar Filtros" no modal
- Ou feche e reabra a página

## Compatibilidade

### Sistema Híbrido
- **Viagens Antigas**: Filtros básicos (status, setor, ônibus, valores)
- **Viagens Novas**: Todos os filtros incluindo passeios

### Filtros Futuros (Planejados)
- Data de pagamento das parcelas
- Período de criação da viagem
- Número de parcelas
- Forma de pagamento
- Histórico de alterações de valor

## Implementação Técnica

### Hook useViagemReport
```tsx
const {
  filters,
  setFilters,
  filterPassageiros,
  calculatePreviewData
} = useViagemReport();
```

### Filtrar Passageiros
```tsx
const passageirosFiltrados = filterPassageiros(passageiros, filters);
```

### Calcular Preview
```tsx
const previewData = calculatePreviewData(passageiros, filters);
```

## Performance

- Filtros são aplicados em memória (client-side)
- Preview é calculado em tempo real
- Não há chamadas adicionais ao banco de dados
- Otimizado para listas de até 1000 passageiros

## Extensibilidade

Para adicionar novos filtros:

1. **Atualizar tipos** em `report-filters.ts`
2. **Adicionar UI** em `ReportFilters.tsx`
3. **Implementar lógica** em `useViagemReport.ts`
4. **Atualizar relatório** em `ViagemReport.tsx`

## Exemplos de Uso

### 📋 Lista para Responsável do Ônibus
```tsx
filters = {
  modoResponsavel: true,
  incluirResumoFinanceiro: false,
  mostrarValorPadrao: false,
  mostrarValoresPassageiros: false,
  mostrarStatusPagamento: false, // opcional
  mostrarNomesPasseios: true,
  // ... outros filtros padrão
}
```

### Relatório Apenas de Pagos
```tsx
filters = {
  statusPagamento: 'pago',
  // ... outros filtros padrão
}
```

### Relatório de Passeios Pagos
```tsx
filters = {
  tipoPasseios: 'pagos',
  mostrarNomesPasseios: true,
  // ... outros filtros padrão
}
```

### Relatório de Setor Específico
```tsx
filters = {
  setorMaracana: ['Norte', 'Sul'],
  // ... outros filtros padrão
}
```

### Relatório Simplificado
```tsx
filters = {
  incluirDistribuicaoSetor: false,
  incluirPassageirosNaoAlocados: false,
  // ... outros filtros padrão
}
```