# Documento de Design - Módulo de Fornecedores

## Visão Geral

O módulo de fornecedores será desenvolvido seguindo os mesmos padrões visuais e de UX do módulo de clientes existente, garantindo consistência na experiência do usuário. O sistema permitirá o gerenciamento completo de fornecedores e a criação de mensagens padronizadas para comunicação eficiente.

## Arquitetura

### Estrutura de Páginas
```
src/pages/
├── Fornecedores.tsx              # Lista principal de fornecedores
├── CadastrarFornecedor.tsx       # Formulário de cadastro
├── EditarFornecedor.tsx          # Formulário de edição
├── FornecedorDetalhes.tsx        # Página de detalhes do fornecedor
└── TemplatesMensagens.tsx        # Gerenciamento de templates
```

### Estrutura de Componentes
```
src/components/fornecedores/
├── FornecedorCard.tsx            # Card individual do fornecedor
├── FornecedorForm.tsx            # Formulário reutilizável
├── FiltroTipoFornecedor.tsx      # Filtro por tipo
├── MessageTemplateForm.tsx       # Formulário de templates
├── MessagePreview.tsx            # Prévia da mensagem
├── MessageVariables.tsx          # Lista de variáveis disponíveis
└── ComunicacaoDialog.tsx         # Dialog para envio de mensagens
```

## Componentes e Interfaces

### 1. Página Principal - Fornecedores.tsx

**Layout:** Idêntico à página de clientes com adaptações específicas

**Elementos principais:**
- Header com título "Fornecedores" e contador
- Botão "Novo Fornecedor" (similar ao "Novo Cliente")
- Barra de busca com placeholder específico
- Cards de fornecedores com informações relevantes
- Paginação (30 itens por página)

**Card do Fornecedor:**
```typescript
interface FornecedorCard {
  avatar: string; // Iniciais do nome com cor baseada no tipo
  nome: string;
  tipoFornecedor: string; // Badge colorido
  telefone?: string;
  whatsapp?: string; // Botão WhatsApp se disponível
  email?: string; // Badge "Email" se disponível
  endereco?: string;
  tempoUltimaAtualizacao: string;
  acoes: DropdownMenu; // Editar, Excluir, Enviar Mensagem
}
```

### 2. Formulário de Cadastro/Edição

**Campos do formulário:**
```typescript
interface FornecedorForm {
  nome: string; // Obrigatório
  tipoFornecedor: 'ingressos' | 'transporte' | 'hospedagem' | 'alimentacao' | 'eventos'; // Obrigatório
  email?: string;
  telefone?: string;
  whatsapp?: string;
  endereco?: string;
  cnpj?: string;
  contatoPrincipal?: string;
  observacoes?: string;
}
```

**Validação:**
- Nome: mínimo 2 caracteres
- Tipo: seleção obrigatória
- Email: formato válido se preenchido
- Telefone/WhatsApp: formato brasileiro
- CNPJ: validação de formato se preenchido

### 3. Sistema de Templates de Mensagens

**Interface do Template:**
```typescript
interface MessageTemplate {
  id: string;
  nome: string;
  tipoFornecedor: string;
  assunto: string;
  corpoMensagem: string;
  variaveisDisponiveis: string[];
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}
```

**Variáveis Disponíveis:**
```typescript
const VARIAVEIS_SISTEMA = {
  '{viagem_nome}': 'Nome da viagem',
  '{data_jogo}': 'Data do jogo',
  '{adversario}': 'Time adversário',
  '{estadio}': 'Local do jogo',
  '{quantidade_passageiros}': 'Número de passageiros',
  '{data_ida}': 'Data de ida',
  '{data_volta}': 'Data de volta',
  '{contato_responsavel}': 'Contato do responsável',
  '{fornecedor_nome}': 'Nome do fornecedor',
  '{fornecedor_contato}': 'Contato principal do fornecedor'
};
```

### 4. Dialog de Comunicação

**Fluxo de uso:**
1. Usuário seleciona fornecedor
2. Clica em "Enviar Mensagem" no dropdown
3. Dialog abre com:
   - Seleção de viagem (dropdown)
   - Seleção de template (filtrado por tipo do fornecedor)
   - Prévia da mensagem com variáveis preenchidas
   - Opção de editar mensagem
   - Botões "Enviar WhatsApp" e "Enviar Email"

**Componente ComunicacaoDialog:**
```typescript
interface ComunicacaoDialogProps {
  fornecedor: Fornecedor;
  isOpen: boolean;
  onClose: () => void;
}
```

## Modelos de Dados

### Tabela: fornecedores
```sql
CREATE TABLE fornecedores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo_fornecedor VARCHAR(50) NOT NULL CHECK (tipo_fornecedor IN ('ingressos', 'transporte', 'hospedagem', 'alimentacao', 'eventos')),
    email VARCHAR(255),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    endereco TEXT,
    cnpj VARCHAR(18),
    contato_principal VARCHAR(255),
    observacoes TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_fornecedores_tipo ON fornecedores(tipo_fornecedor);
CREATE INDEX idx_fornecedores_ativo ON fornecedores(ativo);
CREATE INDEX idx_fornecedores_nome ON fornecedores(nome);
```

### Tabela: message_templates
```sql
CREATE TABLE message_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo_fornecedor VARCHAR(50) NOT NULL,
    assunto VARCHAR(255),
    corpo_mensagem TEXT NOT NULL,
    variaveis_disponiveis TEXT[],
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para nome único por tipo
    UNIQUE(nome, tipo_fornecedor)
);

-- Índices
CREATE INDEX idx_templates_tipo ON message_templates(tipo_fornecedor);
CREATE INDEX idx_templates_ativo ON message_templates(ativo);
```

### Tipos TypeScript
```typescript
// Tipos principais
export type TipoFornecedor = 'ingressos' | 'transporte' | 'hospedagem' | 'alimentacao' | 'eventos';

export interface Fornecedor {
  id: string;
  nome: string;
  tipo_fornecedor: TipoFornecedor;
  email?: string;
  telefone?: string;
  whatsapp?: string;
  endereco?: string;
  cnpj?: string;
  contato_principal?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageTemplate {
  id: string;
  nome: string;
  tipo_fornecedor: TipoFornecedor;
  assunto: string;
  corpo_mensagem: string;
  variaveis_disponiveis: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface MensagemGerada {
  assunto: string;
  corpo: string;
  fornecedor: Fornecedor;
  viagem: any; // Usar tipo existente da viagem
  template: MessageTemplate;
}
```

## Tratamento de Erros

### Validações do Frontend
- Formulários com validação em tempo real usando Zod
- Mensagens de erro claras e em português
- Prevenção de submissão com dados inválidos

### Tratamento de Erros da API
```typescript
// Hook personalizado para operações de fornecedores
export const useFornecedores = () => {
  const handleError = (error: any, operacao: string) => {
    console.error(`Erro ao ${operacao}:`, error);
    
    if (error.code === '23505') { // Unique constraint violation
      toast.error('Já existe um fornecedor com este nome e tipo');
    } else if (error.code === '23503') { // Foreign key violation
      toast.error('Não é possível excluir fornecedor com dados relacionados');
    } else {
      toast.error(`Erro ao ${operacao}. Tente novamente.`);
    }
  };
  
  // ... métodos CRUD
};
```

## Estratégia de Testes

### Testes Unitários
- Validação de formulários
- Formatação de dados
- Substituição de variáveis em templates
- Funções utilitárias

### Testes de Integração
- Fluxo completo de cadastro de fornecedor
- Criação e uso de templates
- Geração de mensagens com dados reais
- Integração com apps externos (WhatsApp/Email)

### Testes E2E
- Jornada completa do usuário
- Navegação entre páginas
- Persistência de dados
- Responsividade mobile

## Considerações de UX/UI

### Cores por Tipo de Fornecedor
```typescript
const CORES_TIPO_FORNECEDOR = {
  ingressos: 'bg-blue-500',      // Azul
  transporte: 'bg-green-500',    // Verde
  hospedagem: 'bg-purple-500',   // Roxo
  alimentacao: 'bg-orange-500',  // Laranja
  eventos: 'bg-pink-500'         // Rosa
};
```

### Responsividade
- Layout mobile-first seguindo padrão dos clientes
- Cards adaptáveis para diferentes tamanhos de tela
- Navegação otimizada para touch

### Acessibilidade
- Labels adequados em todos os campos
- Contraste adequado nas cores
- Navegação por teclado
- Screen reader friendly

## Integração com Sistema Existente

### Reutilização de Componentes
- Usar componentes UI existentes (shadcn/ui)
- Aproveitar hooks de formatação existentes
- Manter padrões de toast e loading

### Navegação
- Adicionar item "Fornecedores" no menu principal
- Breadcrumbs consistentes
- Links contextuais entre módulos relacionados

### Permissões
- Seguir mesmo sistema de autenticação
- Considerar níveis de acesso se necessário
- Logs de auditoria para operações críticas