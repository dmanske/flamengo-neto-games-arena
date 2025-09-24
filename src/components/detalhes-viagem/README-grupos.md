# Sistema de Grupos e Troca de Passageiros

## 📋 Funcionalidades Implementadas

### ✅ Troca de Passageiros entre Ônibus
- Modal intuitivo para seleção do ônibus de destino
- Validação automática de capacidade
- Feedback visual em tempo real
- Suporte para remover passageiro do ônibus (não alocado)

### ✅ Agrupamento de Passageiros
- Criação de grupos com nomes personalizados
- Sistema de cores para identificação visual
- Agrupamento automático na lista de passageiros
- Suporte para adicionar/remover passageiros de grupos

### ✅ Interface Visual
- Cards de ônibus mostram indicadores de grupos
- Lista de passageiros organizada por grupos
- Badges coloridos para identificação
- Cores consistentes em toda a interface

## 🗄️ Banco de Dados

**IMPORTANTE**: Execute este SQL antes de usar as funcionalidades:

```sql
-- Adicionar colunas para grupos
ALTER TABLE viagem_passageiros 
ADD COLUMN grupo_nome VARCHAR(100) NULL,
ADD COLUMN grupo_cor VARCHAR(7) NULL;

-- Criar índice para performance
CREATE INDEX idx_viagem_passageiros_grupo 
ON viagem_passageiros(viagem_id, grupo_nome) 
WHERE grupo_nome IS NOT NULL;

-- Comentários para documentação
COMMENT ON COLUMN viagem_passageiros.grupo_nome IS 'Nome do grupo de passageiros (ex: Família Silva)';
COMMENT ON COLUMN viagem_passageiros.grupo_cor IS 'Cor do grupo em formato hex (ex: #FF6B6B)';
```

## 🚀 Como Usar

### 1. Integração Básica

```tsx
import { PassageirosComGrupos } from '@/components/detalhes-viagem/PassageirosComGrupos';

// No seu componente de detalhes da viagem
<PassageirosComGrupos
  passageiros={passageiros}
  viagemId={viagemId}
  onibusList={onibusList}
  passageirosCount={passageirosCount}
  onEditPassageiro={handleEditPassageiro}
  onDeletePassageiro={handleDeletePassageiro}
  onUpdatePassageiros={handleUpdatePassageiros}
/>
```

### 2. Usando Hooks Individuais

```tsx
import { useGruposPassageiros } from '@/hooks/useGruposPassageiros';
import { useTrocaOnibus } from '@/hooks/useTrocaOnibus';

const { agruparPassageiros, adicionarAoGrupo } = useGruposPassageiros(viagemId);
const { trocarPassageiro } = useTrocaOnibus();
```

### 3. Adicionando Campo de Grupo nos Formulários

```tsx
import { PassageiroGroupForm } from '@/components/detalhes-viagem/PassageiroGroupForm';

// No modal de cadastro/edição
<PassageiroGroupForm
  viagemId={viagemId}
  grupoNome={passageiro?.grupo_nome}
  grupoCor={passageiro?.grupo_cor}
  onChange={(nome, cor) => {
    // Atualizar estado do formulário
    setGrupoNome(nome);
    setGrupoCor(cor);
  }}
/>
```

## 🎨 Cores Disponíveis

O sistema usa 10 cores predefinidas:
- `#FF6B6B` - Vermelho suave
- `#4ECDC4` - Verde água  
- `#45B7D1` - Azul claro
- `#96CEB4` - Verde menta
- `#FFEAA7` - Amarelo suave
- `#DDA0DD` - Roxo claro
- `#FFB347` - Laranja suave
- `#98D8C8` - Verde claro
- `#F8BBD9` - Rosa claro
- `#A8E6CF` - Verde pastel

## 🔧 Componentes Principais

### TrocarOnibusModal
Modal para troca de passageiros entre ônibus com validação de capacidade.

### GrupoPassageiros  
Componente que exibe um grupo de passageiros com cabeçalho colorido.

### PassageiroGroupForm
Formulário para criar/editar grupos de passageiros.

### PassageirosComGrupos
Componente principal que integra todas as funcionalidades.

## ⚠️ Validações Implementadas

### Troca de Ônibus
- ✅ Verificação de capacidade disponível
- ✅ Prevenção de troca para o mesmo ônibus
- ✅ Validação de dados do passageiro
- ✅ Retry automático em caso de falha

### Grupos
- ✅ Nome obrigatório (2-50 caracteres)
- ✅ Prevenção de nomes duplicados
- ✅ Validação de formato de cor hex
- ✅ Aviso para cores já utilizadas

## 🔄 Eventos Customizados

O sistema dispara eventos para atualização da interface:

```tsx
// Evento disparado após troca de passageiro
window.dispatchEvent(new CustomEvent('passageiroTrocado', {
  detail: { passageiroId, onibusDestinoId }
}));
```

## 🐛 Tratamento de Erros

- Mensagens de erro amigáveis
- Retry automático com backoff exponencial
- Validações client-side e server-side
- Logs detalhados para debugging

## 📱 Responsividade

- Interface adaptável para mobile e desktop
- Cards de ônibus responsivos
- Tabelas com scroll horizontal quando necessário
- Modais otimizados para telas pequenas

## 🔍 Busca e Filtros

A busca existente continua funcionando e agora inclui:
- Nome dos grupos nos resultados
- Filtros por status de pagamento
- Busca por membros de grupos específicos

## 🚨 Limitações Conhecidas

1. **Banco de Dados**: Requer execução manual do SQL
2. **Testes**: Testes unitários não implementados ainda
3. **Performance**: Com muitos grupos (>50), pode haver lentidão
4. **Cores**: Limitado a 10 cores predefinidas

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique se o SQL foi executado no banco
2. Confirme se os hooks estão sendo importados corretamente
3. Verifique o console do navegador para erros
4. Teste com poucos passageiros primeiro