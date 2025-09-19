# Sistema de Personalização de Relatórios

Este diretório contém toda a estrutura base do sistema de personalização completa de relatórios, implementado como parte da **Tarefa 1** do projeto.

## 📁 Estrutura de Arquivos

### Tipos e Interfaces (`/types/personalizacao-relatorios.ts`)
- **PersonalizationConfig**: Interface principal que define toda a configuração
- **HeaderConfig**: Configuração do cabeçalho do relatório
- **PassageirosConfig**: Configuração da lista de passageiros
- **OnibusConfig**: Configuração da lista de ônibus
- **PasseiosConfig**: Configuração dos dados de passeios
- **SecoesConfig**: Configuração das seções do relatório
- **EstiloConfig**: Configuração de formatação e estilo
- **Template**: Interface para templates salvos
- **ValidationResult**: Resultado de validações

### Validação (`/lib/validations/personalizacao-relatorios.ts`)
- **PersonalizationValidator**: Classe para validar configurações
- **PersonalizationSanitizer**: Classe para sanitizar configurações inválidas
- Funções utilitárias de validação e verificação de compatibilidade

### Configurações Padrão (`/lib/personalizacao-defaults.ts`)
- **DEFAULT_CONFIGS**: Mapeamento de cenários para configurações
- Funções geradoras para cada cenário (completo, responsável, passageiros, etc.)
- **getDefaultConfig()**: Obtém configuração padrão por cenário
- **getAvailableScenarios()**: Lista cenários disponíveis

### Utilitários (`/lib/personalizacao-utils.ts`)
- Manipulação de colunas (reordenar, alternar visibilidade, etc.)
- Manipulação de seções (reordenar, alternar visibilidade, etc.)
- Clonagem e merge de configurações
- Exportação/importação de configurações
- URLs compartilháveis
- Armazenamento local (localStorage)
- Histórico de configurações
- Formatação de valores

### Constantes (`/lib/personalizacao-constants.ts`)
- **COLUMN_CATEGORIES**: Categorias de colunas com metadados
- **SECTION_TYPES**: Tipos de seções com metadados
- **COLOR_PRESETS**: Esquemas de cores predefinidos
- **LAYOUT_PRESETS**: Layouts predefinidos
- **VALIDATION_LIMITS**: Limites para validação
- Mensagens de erro e aviso
- Configurações de performance

## 🎯 Cenários de Configuração Suportados

### 1. **Completo** (`ConfigScenario.COMPLETO`)
- Todas as informações e seções disponíveis
- Configuração padrão mais abrangente

### 2. **Responsável** (`ConfigScenario.RESPONSAVEL`)
- Remove informações financeiras
- Foco em dados operacionais
- Ideal para responsáveis de ônibus

### 3. **Passageiros** (`ConfigScenario.PASSAGEIROS`)
- Lista simplificada
- Agrupado por ônibus
- Informações essenciais para passageiros

### 4. **Empresa de Ônibus** (`ConfigScenario.EMPRESA_ONIBUS`)
- CPF, data nascimento, dados de embarque
- Específico para empresas de transporte

### 5. **Comprar Ingressos** (`ConfigScenario.COMPRAR_INGRESSOS`)
- Foco em setores e dados de ingressos
- Similar ao sistema de ingressos existente

### 6. **Comprar Passeios** (`ConfigScenario.COMPRAR_PASSEIOS`)
- Foco em passeios e faixas etárias
- Ideal para venda de passeios

### 7. **Transfer** (`ConfigScenario.TRANSFER`)
- Agrupado por ônibus
- Dados de rota, placa e motorista

## 🔧 Como Usar

### Importação Básica
```typescript
import {
  PersonalizationConfig,
  getDefaultConfig,
  ConfigScenario,
  PersonalizationValidator
} from '@/lib/personalizacao';
```

### Criar uma Configuração Padrão
```typescript
// Obter configuração completa
const config = getDefaultConfig(ConfigScenario.COMPLETO);

// Obter configuração para responsável
const configResponsavel = getDefaultConfig(ConfigScenario.RESPONSAVEL);
```

### Validar uma Configuração
```typescript
import { PersonalizationValidator } from '@/lib/personalizacao';

const validation = PersonalizationValidator.validate(config);
if (!validation.valido) {
  console.log('Erros:', validation.errors);
  console.log('Avisos:', validation.warnings);
}
```

### Manipular Colunas
```typescript
import { toggleColumnVisibility, reorderColumns } from '@/lib/personalizacao';

// Alternar visibilidade de uma coluna
const newColumns = toggleColumnVisibility(config.passageiros.colunas, 'telefone');

// Reordenar colunas
const reorderedColumns = reorderColumns(config.passageiros.colunas, 0, 2);
```

### Exportar/Importar Configurações
```typescript
import { exportConfig, importConfig } from '@/lib/personalizacao';

// Exportar
const jsonString = exportConfig(config);

// Importar
const importedConfig = importConfig(jsonString);
```

### Trabalhar com Templates
```typescript
import { configToTemplate, saveTemplate, loadTemplates } from '@/lib/personalizacao';

// Converter configuração em template
const template = configToTemplate(config, {
  nome: 'Meu Template',
  descricao: 'Template personalizado'
});

// Salvar template
saveTemplate(template);

// Carregar templates
const templates = loadTemplates();
```

## 📊 Estrutura de Dados

### Configuração Principal
```typescript
interface PersonalizationConfig {
  header: HeaderConfig;           // Configuração do cabeçalho
  passageiros: PassageirosConfig; // Lista de passageiros
  onibus: OnibusConfig;          // Lista de ônibus
  passeios: PasseiosConfig;      // Dados de passeios
  secoes: SecoesConfig;          // Seções do relatório
  estilo: EstiloConfig;          // Formatação e estilo
  metadata: ConfigMetadata;       // Metadados da configuração
}
```

### Coluna de Passageiro
```typescript
interface PassageiroColumn {
  id: keyof PassageiroDisplay;    // ID da coluna
  label: string;                  // Rótulo exibido
  visivel: boolean;              // Se está visível
  largura?: number;              // Largura em pixels
  ordem: number;                 // Ordem de exibição
  categoria: PassageiroColumnCategory; // Categoria da coluna
  alinhamento?: 'left' | 'center' | 'right'; // Alinhamento
  formatacao?: ColumnFormatacao;  // Formatação específica
}
```

## 🎨 Personalização de Estilo

### Esquemas de Cores Predefinidos
- **Flamengo**: Cores oficiais do clube
- **Professional**: Esquema profissional neutro
- **Modern**: Esquema moderno com roxo
- **Classic**: Esquema clássico com cinza

### Layouts Predefinidos
- **Compact**: Margens e espaçamentos reduzidos
- **Normal**: Configuração padrão balanceada
- **Spacious**: Margens e espaçamentos amplos

## 🔍 Validação e Sanitização

### Validações Implementadas
- ✅ Pelo menos uma coluna visível
- ✅ Ordens de colunas únicas
- ✅ Larguras dentro dos limites
- ✅ Cores em formato hexadecimal válido
- ✅ Tamanhos de fonte dentro dos limites
- ✅ Margens não negativas
- ✅ Pelo menos um tipo de passeio incluído

### Sanitização Automática
- 🔧 Corrige ordens duplicadas
- 🔧 Limita larguras de colunas
- 🔧 Corrige tamanhos de fonte inválidos
- 🔧 Substitui cores inválidas por padrões
- 🔧 Garante pelo menos uma coluna visível

## 📱 Compatibilidade

### Versões Suportadas
- **Atual**: 1.0.0
- **Compatibilidade**: ['1.0.0']

### Migração
- Sistema preparado para futuras migrações
- Validação de compatibilidade entre versões
- Sanitização automática de configurações antigas

## 🚀 Próximos Passos

Esta estrutura base está pronta para ser utilizada nas próximas tarefas:

1. **Tarefa 2**: Sistema de armazenamento e templates
2. **Tarefa 3**: Componente principal PersonalizacaoDialog
3. **Tarefa 4**: Personalização do Header
4. **Tarefa 5**: Personalização de Passageiros
5. E assim por diante...

## 📝 Notas de Implementação

- Todos os tipos são fortemente tipados com TypeScript
- Validação robusta com mensagens de erro claras
- Sanitização automática para prevenir configurações inválidas
- Sistema de templates flexível
- Suporte a URLs compartilháveis
- Armazenamento local para persistência
- Histórico de configurações para desfazer/refazer
- Performance otimizada com debounce e limites

---

**Status**: ✅ **Tarefa 1 Concluída**  
**Próxima Tarefa**: Implementar sistema de armazenamento e templates (Tarefa 2)