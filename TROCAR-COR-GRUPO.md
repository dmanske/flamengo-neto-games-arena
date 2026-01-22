# 🎨 Trocar Cor do Grupo de Ingressos

## 🎯 Funcionalidade Implementada

Agora você pode **trocar a cor de um grupo de ingressos** clicando na bolinha colorida no cabeçalho do grupo!

## ✨ Características

### Como Funciona:
- ✅ **Clique na bolinha colorida** no cabeçalho do grupo
- ✅ **Abre um color picker** nativo do navegador
- ✅ **Escolha a nova cor** visualmente
- ✅ **Atualização instantânea** na interface
- ✅ **Salva no banco de dados** automaticamente
- ✅ **Todos os ingressos do grupo** são atualizados

### Feedback Visual:
- 🎨 Bolinha fica maior ao passar o mouse (hover)
- 💾 Notificação de sucesso ao salvar
- 🔄 Atualização imediata da cor em toda a interface
- 📊 Código hexadecimal atualizado ao lado

## 🚀 Como Usar

1. **Localize** o grupo que deseja alterar a cor
2. **Clique** na bolinha colorida no cabeçalho do grupo
3. **Escolha** a nova cor no color picker
4. **Pronto!** A cor é atualizada automaticamente

## 🎨 Color Picker Nativo

### Vantagens:
- ✅ Interface nativa do sistema operacional
- ✅ Suporte a todas as cores (16 milhões+)
- ✅ Fácil de usar
- ✅ Não precisa de biblioteca externa
- ✅ Funciona em todos os navegadores modernos

### Aparência:
- **Windows**: Color picker do Windows
- **macOS**: Color picker do macOS
- **Linux**: Color picker do sistema
- **Mobile**: Color picker touch-friendly

## 💾 Persistência de Dados

### O que é salvo:
- Nova cor é salva na tabela `ingressos`
- Campo `grupo_cor` é atualizado
- Todos os ingressos do grupo são atualizados de uma vez

### Query SQL executada:
```sql
UPDATE ingressos 
SET grupo_cor = 'nova_cor'
WHERE grupo_nome = 'nome_do_grupo' 
  AND grupo_cor = 'cor_antiga'
```

## 🔄 Atualização em Tempo Real

### Interface atualiza:
1. **Bolinha colorida** - Nova cor imediatamente
2. **Fundo do card** - Transparência com nova cor
3. **Bordas** - Nova cor aplicada
4. **Badges** - Fundo com nova cor
5. **Código hex** - Atualizado ao lado do ícone de paleta

## 🎯 Casos de Uso

### 1. Organização Visual
Mude cores para melhor identificação visual dos grupos.

### 2. Padronização
Ajuste cores para seguir um padrão de cores da empresa.

### 3. Diferenciação
Use cores contrastantes para grupos que não devem ser confundidos.

### 4. Correção
Corrija cores escolhidas incorretamente na criação.

### 5. Tematização
Adapte cores para eventos especiais ou datas comemorativas.

## 🔧 Implementação Técnica

### Estado Local:
```typescript
const [corAtual, setCorAtual] = useState(grupo.cor);
```

### Input Oculto:
```typescript
<input
  ref={colorInputRef}
  type="color"
  value={corAtual}
  onChange={(e) => atualizarCorGrupo(e.target.value)}
  className="hidden"
/>
```

### Botão Clicável:
```typescript
<button
  onClick={abrirColorPicker}
  className="w-4 h-4 rounded-full border-2 cursor-pointer hover:scale-110"
  style={{ backgroundColor: corAtual }}
  title="Clique para trocar a cor do grupo"
/>
```

### Função de Atualização:
```typescript
const atualizarCorGrupo = async (novaCor: string) => {
  setCorAtual(novaCor); // Atualiza UI imediatamente
  
  await supabase
    .from('ingressos')
    .update({ grupo_cor: novaCor })
    .eq('grupo_nome', grupo.nome)
    .eq('grupo_cor', grupo.cor);
    
  toast.success('Cor do grupo atualizada!');
};
```

## 🎨 Paleta de Cores Sugeridas

### Cores Vibrantes:
- 🔴 Vermelho: `#EF4444`
- 🔵 Azul: `#3B82F6`
- 🟢 Verde: `#10B981`
- 🟡 Amarelo: `#F59E0B`
- 🟣 Roxo: `#8B5CF6`
- 🟠 Laranja: `#F97316`

### Cores Pastéis:
- 🌸 Rosa: `#F9A8D4`
- 💙 Azul Claro: `#93C5FD`
- 💚 Verde Claro: `#86EFAC`
- 💛 Amarelo Claro: `#FDE047`
- 💜 Roxo Claro: `#C4B5FD`

## 📱 Responsividade

### Desktop:
- Color picker completo
- Hover effect na bolinha
- Transição suave

### Mobile:
- Color picker touch-friendly
- Toque na bolinha abre o picker
- Interface adaptada ao dispositivo

## ⚠️ Tratamento de Erros

### Se falhar ao salvar:
- ❌ Cor reverte para a original
- 🔔 Notificação de erro exibida
- 📝 Erro logado no console
- 🔄 Usuário pode tentar novamente

### Validação:
- Apenas cores hexadecimais válidas
- Formato: `#RRGGBB`
- Validação automática pelo input type="color"

## 🎯 Benefícios

### Para o Usuário:
- ✅ **Rápido** - Um clique para trocar
- ✅ **Visual** - Vê a cor antes de confirmar
- ✅ **Intuitivo** - Interface familiar
- ✅ **Flexível** - Qualquer cor disponível

### Para o Sistema:
- ✅ **Simples** - Usa input nativo
- ✅ **Eficiente** - Uma query para todo o grupo
- ✅ **Consistente** - Atualiza todos os ingressos
- ✅ **Seguro** - Validação automática

## 🔄 Sincronização

### Após trocar a cor:
1. Interface atualiza instantaneamente
2. Banco de dados é atualizado
3. Próximo carregamento já mostra nova cor
4. Exportação para WhatsApp usa nova cor

## 💡 Dicas de Uso

### Escolha de Cores:
- Use cores contrastantes para grupos diferentes
- Evite cores muito claras (difícil de ver)
- Considere acessibilidade (contraste adequado)
- Mantenha consistência entre grupos relacionados

### Organização:
- Família: Tons de azul
- Amigos: Tons de verde
- Trabalho: Tons de laranja
- VIP: Tons de dourado/roxo

---

**Implementado em**: Janeiro 2026
**Componente**: `src/components/detalhes-jogo/GrupoIngressos.tsx`
**Relacionado**: Sistema de Grupos de Ingressos
**Banco de Dados**: Campo `grupo_cor` na tabela `ingressos`
