# Design Document - Templates de WhatsApp

## Overview

Sistema de templates de WhatsApp que permite criar, gerenciar e usar mensagens pré-definidas com variáveis dinâmicas. O sistema mantém o fluxo atual de envio por viagem, mas adiciona funcionalidade de templates reutilizáveis com seleção múltipla.

## Architecture

### Database Schema

```sql
-- Tabela principal de templates
CREATE TABLE whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  mensagem TEXT NOT NULL,
  variaveis TEXT[] DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_whatsapp_templates_categoria ON whatsapp_templates(categoria);
CREATE INDEX idx_whatsapp_templates_ativo ON whatsapp_templates(ativo);

-- Dados iniciais (exemplos)
INSERT INTO whatsapp_templates (nome, categoria, mensagem, variaveis) VALUES
('Confirmação de Viagem', 'confirmacao', 
 'Olá {NOME}! ✈️ Sua viagem para {DESTINO} está confirmada para {DATA} às {HORARIO}. Embarque: {LOCAL_SAIDA}. Ônibus: {ONIBUS}. Qualquer dúvida, estamos aqui! 🚌',
 ARRAY['NOME', 'DESTINO', 'DATA', 'HORARIO', 'LOCAL_SAIDA', 'ONIBUS']),

('Link do Grupo', 'grupo',
 'Oi {NOME}! 👋 Entre no grupo da viagem {DESTINO}: {LINK_GRUPO} - Lá você receberá todas as informações importantes! 📱',
 ARRAY['NOME', 'DESTINO', 'LINK_GRUPO']),

('Lembrete de Embarque', 'lembrete',
 '⏰ LEMBRETE: {NOME}, sua viagem para {DESTINO} sai AMANHÃ às {HORARIO}! Local: {LOCAL_SAIDA}. Chegue 30min antes. Boa viagem! 🎒',
 ARRAY['NOME', 'DESTINO', 'HORARIO', 'LOCAL_SAIDA']),

('Cobrança Pendente', 'cobranca',
 'Oi {NOME}! Sua viagem {DESTINO} em {DATA} está quase chegando. Ainda temos R$ {VALOR} pendente. Pode regularizar? PIX: (11) 99999-9999 💳',
 ARRAY['NOME', 'DESTINO', 'DATA', 'VALOR']);
```

### Component Structure

```
src/
├── pages/
│   └── TemplatesWhatsApp.tsx          # Página principal de gerenciamento
├── components/
│   └── templates-whatsapp/
│       ├── TemplateList.tsx           # Lista de templates
│       ├── TemplateForm.tsx           # Formulário criar/editar
│       ├── TemplatePreview.tsx        # Preview em tempo real
│       ├── VariableEditor.tsx         # Editor de variáveis
│       └── TemplateSelector.tsx       # Seletor múltiplo para viagens
├── hooks/
│   └── useWhatsAppTemplates.ts        # Hook para gerenciar templates
└── types/
    └── whatsapp-templates.ts          # Tipos TypeScript
```

## Components and Interfaces

### 1. TemplatesWhatsApp Page

**Funcionalidade:** Página principal para gerenciar templates
**Localização:** `/templates-whatsapp`

**Features:**
- Lista todos os templates
- Filtro por categoria
- Busca por nome
- Botões para criar, editar, excluir
- Preview de templates

### 2. TemplateForm Component

**Funcionalidade:** Formulário para criar/editar templates

**Props:**
```typescript
interface TemplateFormProps {
  template?: WhatsAppTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: Omit<WhatsAppTemplate, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}
```

**Features:**
- Campo nome (obrigatório)
- Seletor de categoria
- Editor de mensagem com syntax highlighting para variáveis
- Detector automático de variáveis
- Preview em tempo real
- Validação de campos

### 3. TemplateSelector Component

**Funcionalidade:** Seletor múltiplo de templates para usar nas viagens

**Props:**
```typescript
interface TemplateSelectorProps {
  viagemData: ViagemData;
  onTemplatesSelected: (templates: SelectedTemplate[]) => void;
  selectedPassageiros: Passageiro[];
}
```

**Features:**
- Lista templates por categoria
- Seleção múltipla com checkboxes
- Preview automático com dados da viagem
- Editor inline para personalização
- Validação antes do envio

### 4. TemplatePreview Component

**Funcionalidade:** Preview em tempo real da mensagem

**Props:**
```typescript
interface TemplatePreviewProps {
  template: WhatsAppTemplate;
  viagemData?: ViagemData;
  passageiroData?: Passageiro;
  customVariables?: Record<string, string>;
}
```

**Features:**
- Substituição automática de variáveis
- Highlight de variáveis substituídas
- Simulação com dados reais ou mock
- Contador de caracteres
- Validação de links

## Data Models

### WhatsAppTemplate

```typescript
interface WhatsAppTemplate {
  id: string;
  nome: string;
  categoria: 'confirmacao' | 'grupo' | 'lembrete' | 'cobranca' | 'promocional' | 'outros';
  mensagem: string;
  variaveis: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
```

### SelectedTemplate

```typescript
interface SelectedTemplate {
  template: WhatsAppTemplate;
  mensagemPersonalizada: string;
  variaveisCustomizadas?: Record<string, string>;
}
```

### VariableMapping

```typescript
interface VariableMapping {
  NOME: string;           // passageiro.nome
  DESTINO: string;        // viagem.destino
  DATA: string;           // viagem.data_viagem (formatada)
  HORARIO: string;        // viagem.horario_saida
  LOCAL_SAIDA: string;    // viagem.local_saida
  ONIBUS: string;         // onibus.numero ou onibus.nome
  LINK_GRUPO: string;     // editável por viagem
  VALOR: string;          // passageiro.valor_total (formatado)
  TELEFONE: string;       // telefone de contato
}
```

## Error Handling

### Template Management
- Validação de campos obrigatórios
- Verificação de duplicatas por nome
- Sanitização de mensagens
- Validação de variáveis

### Template Usage
- Fallback para variáveis não encontradas
- Validação de dados da viagem
- Tratamento de templates inativos
- Backup para mensagem manual

### WhatsApp Integration
- Validação de números de telefone
- Tratamento de falhas de envio
- Retry automático
- Log de mensagens enviadas

## Testing Strategy

### Unit Tests
- Substituição de variáveis
- Validação de templates
- Formatação de dados
- Sanitização de entrada

### Integration Tests
- CRUD de templates
- Integração com dados de viagem
- Envio de mensagens
- Fluxo completo de uso

### E2E Tests
- Criação de template completa
- Seleção múltipla e envio
- Edição inline de mensagens
- Fluxo de erro e recuperação

## Performance Considerations

### Database
- Índices em categoria e status ativo
- Paginação para listas grandes
- Cache de templates frequentes

### Frontend
- Lazy loading de templates
- Debounce em preview
- Memoização de componentes
- Virtual scrolling para listas grandes

### WhatsApp API
- Rate limiting
- Batch processing
- Queue para envios múltiplos
- Retry com backoff exponencial

## Security

### Data Validation
- Sanitização de mensagens
- Validação de variáveis
- Escape de caracteres especiais
- Limite de tamanho de mensagem

### Access Control
- Permissões por usuário
- Auditoria de mudanças
- Log de envios
- Proteção contra spam

## Migration Strategy

### Phase 1: Database Setup
- Criar tabelas
- Inserir templates iniciais
- Configurar índices

### Phase 2: Template Management
- Página de administração
- CRUD completo
- Sistema de categorias

### Phase 3: Integration
- Integrar com WhatsApp em massa
- Seleção múltipla
- Preview e edição

### Phase 4: Enhancement
- Variáveis avançadas
- Templates condicionais
- Analytics de uso