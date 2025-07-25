---
inclusion: always
---

# Configuração Kiro - Português Brasileiro

## Idioma e Comunicação
- **SEMPRE** responder em português brasileiro (PT-BR)
- Usar linguagem técnica mas acessível
- Manter tom profissional e amigável
- Usar emojis para melhor comunicação visual

## Contexto do Projeto
Este é um projeto de **sistema de gestão de viagens do Flamengo** com as seguintes características:

### Tecnologias Principais
- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL)
- **UI**: shadcn/ui + Tailwind CSS
- **Formulários**: React Hook Form + Zod

### Estrutura do Projeto
- **Sistema híbrido**: Compatibilidade entre sistema antigo e novo
- **Passeios com valores**: Nova funcionalidade principal em desenvolvimento
- **Módulos**: Viagens, Passageiros, Ônibus, Financeiro, Relatórios

### Estado Atual do Desenvolvimento
- ✅ **Tarefas 1-10**: Concluídas (estrutura base + cadastro de passageiros)
- 🔄 **Próxima**: Tarefa 11 (atualizar exibição de viagens)
- 📋 **Plano**: 16 tarefas totais no arquivo `.kiro/specs/atualizacao-passeios-viagem/tasks.md`

## Diretrizes de Desenvolvimento

### Padrões de Código
- **TypeScript**: Sempre tipado, sem `any`
- **Componentes**: Funcionais com hooks
- **Styling**: Tailwind CSS + shadcn/ui
- **Validação**: Zod schemas
- **Estado**: React hooks + Context quando necessário

### Estrutura de Arquivos
```
src/
├── components/
│   ├── ui/ (shadcn components)
│   ├── viagem/
│   └── detalhes-viagem/
├── hooks/
├── lib/
├── pages/
├── types/
└── utils/
```

### Banco de Dados
- **Tabelas principais**: viagens, clientes, viagem_passageiros, passeios, passageiro_passeios
- **Políticas RLS**: Configuradas no Supabase
- **Migrations**: Arquivos SQL organizados

## Comportamento Esperado

### Ao Iniciar Conversa
1. **Cumprimentar** em português
2. **Verificar** status atual do projeto
3. **Oferecer** continuidade das tarefas pendentes
4. **Manter** contexto das implementações anteriores

### Durante Desenvolvimento
1. **Explicar** o que está sendo feito
2. **Mostrar** código relevante
3. **Testar** implementações
4. **Documentar** mudanças importantes
5. **Atualizar** status das tarefas

### Resolução de Problemas
1. **Analisar** logs e erros em português
2. **Propor** soluções práticas
3. **Explicar** o motivo dos problemas
4. **Implementar** correções
5. **Verificar** se funcionou

## Comandos Úteis

### Desenvolvimento
```bash
npm run dev          # Iniciar desenvolvimento
npm run build        # Build de produção
npx tsc --noEmit     # Verificar TypeScript
```

### Testes
```bash
npm test             # Executar testes (se configurado)
npx vitest --run     # Executar testes específicos
```

## Arquivos Importantes
- `.kiro/specs/atualizacao-passeios-viagem/` - Especificações do projeto
- `src/hooks/usePasseios.ts` - Hook principal para passeios
- `src/data/passeios.ts` - Configuração dos passeios
- `src/components/detalhes-viagem/` - Componentes principais

## Lembrete
**SEMPRE** manter este contexto ativo e responder em português brasileiro, independente de como a conversa começar!