# 🔒 CORREÇÃO: RLS para Landing Page Pública

## 🚨 Problema Identificado

A landing page só mostra jogos para usuários **logados** porque o Supabase tem **RLS (Row Level Security)** ativo, bloqueando acesso anônimo.

## ✅ Solução

Criar uma **política RLS pública** que permite visitantes anônimos **lerem** as viagens, mas **não modificarem** nada.

## 📋 Passos para Corrigir

### 1. Acessar o Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)

### 2. Executar o SQL

Copie e execute o arquivo: `database/migrations/rls_public_viagens.sql`

```sql
-- Criar política pública para leitura de viagens
CREATE POLICY "Permitir leitura pública de viagens"
ON viagens
FOR SELECT
TO anon, authenticated
USING (true);
```

### 3. Testar

1. Abra a landing page **sem estar logado**
2. As viagens devem aparecer normalmente
3. ✅ Problema resolvido!

## 🔐 Segurança

Esta solução é **100% segura** porque:

- ✅ Permite apenas **LEITURA** (SELECT)
- ✅ Visitantes **NÃO podem** criar, editar ou deletar
- ✅ Outras tabelas continuam protegidas
- ✅ Sistema administrativo continua funcionando
- ✅ Dados sensíveis (clientes, pagamentos) continuam privados

## 📊 O que Muda

### Antes
- ❌ Landing page vazia para visitantes
- ❌ Só mostra viagens se logado
- ❌ Experiência ruim para novos clientes

### Depois
- ✅ Landing page funciona para todos
- ✅ Visitantes veem viagens disponíveis
- ✅ Podem se interessar e entrar em contato
- ✅ Sistema administrativo continua protegido

## 🎯 Resultado Esperado

Após executar o SQL, a landing page mostrará:
- **Próximas Viagens**: Jogos futuros com vagas abertas
- **Viagens Realizadas**: Histórico de jogos passados
- **Sem necessidade de login**: Acesso público total

## 📝 Observações

- Esta é uma prática comum e segura
- Sites públicos precisam de dados públicos
- O RLS continua protegendo operações de escrita
- Apenas a tabela `viagens` fica pública para leitura
