# 🎯 Como Acessar o Sistema de Personalização

## 📍 **Onde Encontrar**

### **1. Na Página de Detalhes da Viagem**
- **Localização**: Dentro do modal de "Filtros do Relatório"
- **Como acessar**:
  1. Vá para qualquer viagem (ex: `/viagem/123`)
  2. Clique no botão **"📊 Gerar Relatório PDF"**
  3. No modal que abrir, procure o botão **"🎨 Personalização Avançada"** no canto superior direito
  4. Clique para abrir o sistema completo de personalização

### **2. Demonstração Completa**
- **Componente**: `PersonalizationDemo`
- **Como usar**:
```tsx
import { PersonalizationDemo } from '@/components/relatorios/PersonalizationDemo';

// Em qualquer página
<PersonalizationDemo viagemId="123" />
```

### **3. Botão Independente**
- **Componente**: `ReportPersonalizationButton`
- **Como usar**:
```tsx
import { ReportPersonalizationButton } from '@/components/relatorios/ReportPersonalizationButton';

<ReportPersonalizationButton
  viagemId="123"
  currentFilters={filters}
  onConfigApplied={(config) => {
    // Aplicar configuração
  }}
/>
```

## 🚀 **Acesso Rápido - Passo a Passo**

### **Método 1: Via Relatórios Existentes**
1. **Abra uma viagem** (qualquer viagem do sistema)
2. **Clique em "📊 Gerar Relatório PDF"**
3. **Procure o botão "🎨 Personalização Avançada"** (canto superior direito)
4. **Clique para abrir** o sistema completo

### **Método 2: Via Demonstração**
1. **Adicione o componente demo** em qualquer página:
```tsx
// Em src/pages/DetalhesViagem.tsx, adicione:
import { PersonalizationDemo } from '@/components/relatorios/PersonalizationDemo';

// Dentro do componente, adicione:
<PersonalizationDemo viagemId={id} />
```

### **Método 3: Via Hook Direto**
```tsx
import { usePersonalizacao } from '@/hooks/usePersonalizacao';
import { PersonalizacaoDialog } from '@/components/relatorios/PersonalizacaoDialog';

function MeuComponente() {
  const [showDialog, setShowDialog] = useState(false);
  
  return (
    <>
      <Button onClick={() => setShowDialog(true)}>
        Personalizar Relatório
      </Button>
      
      <PersonalizacaoDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        viagemId="123"
        onAplicar={(config) => {
          // Usar configuração
        }}
      />
    </>
  );
}
```

## 🎨 **O Que Você Encontrará**

### **Interface Principal - 8 Abas**
1. **📋 Cabeçalho** - Configurar informações do header
2. **👥 Passageiros** - Personalizar colunas da lista
3. **🚌 Ônibus** - Configurar dados dos ônibus
4. **🎠 Passeios** - Personalizar informações de passeios
5. **📄 Seções** - Gerenciar seções do relatório
6. **🎨 Estilo** - Formatação e aparência
7. **📁 Templates** - Gerenciar templates salvos
8. **👁️ Preview** - Visualizar resultado em tempo real

### **Cenários Pré-configurados**
- **📊 Completo** - Todas as informações
- **📋 Responsável** - Sem dados financeiros
- **👥 Passageiros** - Lista simplificada
- **🚌 Empresa de Ônibus** - Dados de embarque
- **🎫 Comprar Ingressos** - Foco em setores
- **🎠 Comprar Passeios** - Foco em passeios
- **🚐 Transfer** - Dados de rota

## 🔧 **Funcionalidades Disponíveis**

### **Personalização de Colunas**
- ✅ 17 colunas configuráveis
- ✅ Drag-and-drop para reordenar
- ✅ Larguras personalizadas
- ✅ 6 categorias (pessoais, localização, viagem, financeiro, passeios, extras)

### **Seções do Relatório**
- ✅ 17 tipos de seções disponíveis
- ✅ Reordenação por drag-and-drop
- ✅ Títulos personalizados
- ✅ 6 categorias de seções

### **Estilo e Formatação**
- ✅ Configuração de fontes (família, tamanhos, pesos)
- ✅ Esquemas de cores (4 presets + personalizado)
- ✅ Layout (orientação, margens, espaçamentos)
- ✅ Elementos visuais (bordas, separadores, etc.)

### **Sistema de Templates**
- ✅ Templates oficiais baseados nos cenários
- ✅ Templates personalizados
- ✅ Exportação/importação
- ✅ Compartilhamento via URL

## 📱 **URLs de Teste**

### **Para Testar Rapidamente**
```
# Viagem existente com personalização
/viagem/[ID_DA_VIAGEM]

# Adicionar parâmetro de personalização
/viagem/[ID_DA_VIAGEM]?personalization=[CONFIG_BASE64]
```

### **Exemplo de URL Compartilhável**
```
https://seusite.com/viagem/123?personalization=eyJoZWFkZXIiOnsibW9zdHJhckFkdmVyc2FyaW8iOnRydWV9fQ==
```

## 🎯 **Casos de Uso Comuns**

### **1. Lista para Responsável do Ônibus**
- Acesse via cenário "📋 Responsável"
- Remove informações financeiras
- Foca em dados operacionais

### **2. Lista para Passageiros**
- Acesse via cenário "👥 Passageiros"
- Lista simplificada e agrupada por ônibus
- Inclui foto do ônibus

### **3. Relatório para Empresa de Ônibus**
- Acesse via cenário "🚌 Empresa de Ônibus"
- CPF, data nascimento, dados de embarque
- Remove informações desnecessárias

### **4. Lista para Compra de Ingressos**
- Acesse via cenário "🎫 Comprar Ingressos"
- Foco em setores do Maracanã
- Similar ao sistema de ingressos

### **5. Lista para Compra de Passeios**
- Acesse via cenário "🎠 Comprar Passeios"
- Foco em passeios e faixas etárias
- Estatísticas por tipo de passeio

## 🔍 **Solução de Problemas**

### **Botão não aparece?**
- Verifique se o `viagemId` está sendo passado corretamente
- Confirme que os componentes foram importados
- Verifique o console para erros de TypeScript

### **Configuração não salva?**
- O sistema usa localStorage automático
- Verifique se o navegador permite localStorage
- Configurações são salvas automaticamente com debounce de 1 segundo

### **Preview não funciona?**
- Verifique se há dados mockados ou reais
- Confirme se a configuração é válida
- Veja o console para erros de renderização

## 📞 **Suporte**

Se tiver dúvidas ou problemas:
1. Verifique o console do navegador para erros
2. Teste com dados mockados primeiro
3. Use o componente `PersonalizationDemo` para testar
4. Verifique se todos os imports estão corretos

---

**🎉 O sistema está 100% funcional e pronto para uso!**