# 🔍 Filtro por Grupos de Ingressos

## 🎯 Funcionalidade Implementada

Agora você pode **filtrar ingressos por grupo** de duas formas na página de detalhes do jogo:
1. **Dropdown de filtro** (tradicional)
2. **Barra de chips clicáveis** (visual e rápido) ⭐ NOVO!

## ✨ Características

### 🎨 Barra de Chips Clicáveis (Nova!):
- ✅ **Visualização rápida** de todos os grupos disponíveis
- ✅ **Cores identificadoras** - Cada chip usa a cor do grupo
- ✅ **Contador de membros** - Badge mostrando quantos ingressos
- ✅ **Seleção visual** - Chip selecionado fica destacado com a cor do grupo
- ✅ **Scroll horizontal** - Navega facilmente quando há muitos grupos
- ✅ **Botão "Todos"** - Mostra todos os ingressos
- ✅ **Botão "Sem Grupo"** - Mostra apenas individuais

### 📋 Dropdown de Filtro (Tradicional):
- ✅ **Todos os grupos** - Mostra todos os ingressos (padrão)
- ✅ **Sem grupo** - Mostra apenas ingressos individuais
- ✅ **Grupos específicos** - Filtra por um grupo com identificação visual

### Combinação de Filtros:
Você pode combinar o filtro de grupo com:
- 🔍 **Busca por texto** (nome, CPF, telefone, setor)
- 💰 **Status de pagamento** (Pago, Pendente, Cancelado)

## 🚀 Como Usar

### Método 1: Barra de Chips (Recomendado)
1. **Visualize** todos os grupos na barra horizontal
2. **Clique** no chip do grupo desejado
3. **Veja** o chip ficar destacado com a cor do grupo
4. **Resultado** aparece instantaneamente

### Método 2: Dropdown
1. **Acesse** a página de detalhes do jogo
2. **Localize** a barra de filtros no topo
3. **Clique** no dropdown "Filtrar por grupo"
4. **Selecione** o grupo desejado

## 🎨 Design da Barra de Chips

### Chip Normal (não selecionado):
- Borda colorida com a cor do grupo
- Texto na cor do grupo
- Bolinha colorida identificadora
- Badge com contador em cinza

### Chip Selecionado:
- Fundo com a cor do grupo
- Texto branco
- Bolinha branca
- Badge com fundo semi-transparente branco

### Layout:
```
Grupos: [Todos: 45] [🔴 Família Silva: 8] [🔵 Amigos João: 5] [Sem Grupo: 3]
```

## 💡 Casos de Uso

### 1. Navegação Rápida
Clique rapidamente entre grupos sem abrir dropdowns.

### 2. Visão Geral
Veja todos os grupos e quantos membros cada um tem de uma vez.

### 3. Identificação Visual
Cores facilitam encontrar o grupo desejado rapidamente.

### 4. Exportar Grupo Específico
Filtre um grupo e exporte apenas ele para WhatsApp.

### 5. Análise Rápida
Compare tamanhos de grupos visualmente.

## 🔧 Implementação Técnica

### Componentes:
- **Button** do shadcn/ui para chips
- **Badge** para contadores
- **Cores dinâmicas** aplicadas via style inline
- **Scroll horizontal** com overflow-x-auto

### Estados Visuais:
```typescript
// Chip selecionado
style={{
  backgroundColor: grupo.cor,
  borderColor: grupo.cor,
  color: '#ffffff'
}}

// Chip não selecionado
style={{
  borderColor: grupo.cor,
  color: grupo.cor
}}
```

## 📊 Hierarquia Visual

```
┌─────────────────────────────────────────────────┐
│ [Busca]                    [Dropdown] [Status]  │
├─────────────────────────────────────────────────┤
│ Grupos: [Todos] [Grupo 1] [Grupo 2] [Sem Grupo]│
└─────────────────────────────────────────────────┘
```

## 🎯 Benefícios

### Para o Usuário:
- ✅ **Navegação mais rápida** - Um clique para trocar de grupo
- ✅ **Visão geral** - Vê todos os grupos de uma vez
- ✅ **Feedback visual** - Sabe qual grupo está selecionado
- ✅ **Contadores visíveis** - Vê quantos membros em cada grupo
- ✅ **Identificação por cor** - Encontra grupos rapidamente

### Para o Sistema:
- ✅ **Duas formas de acesso** - Dropdown + Chips
- ✅ **Performance otimizada** - Memoização
- ✅ **Responsivo** - Scroll horizontal em telas pequenas
- ✅ **Acessível** - Funciona com teclado e mouse

## 🔄 Sincronização

Os dois métodos (dropdown e chips) estão **sincronizados**:
- Clicar em um chip atualiza o dropdown
- Selecionar no dropdown atualiza o chip
- Ambos filtram a mesma lista

## 📱 Responsividade

### Desktop:
- Barra horizontal com todos os chips visíveis
- Scroll suave se necessário

### Mobile:
- Scroll horizontal touch-friendly
- Chips mantêm tamanho legível
- Badges compactos mas visíveis

## 🎯 Próximas Melhorias Possíveis

- [ ] Arrastar para reordenar grupos
- [ ] Animação ao trocar de grupo
- [ ] Atalhos de teclado (1, 2, 3 para grupos)
- [ ] Modo compacto (só ícones coloridos)
- [ ] Estatísticas no hover do chip

---

**Implementado em**: Janeiro 2026
**Componente**: `src/components/detalhes-jogo/IngressosCard.tsx`
**Relacionado**: Sistema de Grupos de Ingressos
**Atualização**: Adicionada barra de chips clicáveis
