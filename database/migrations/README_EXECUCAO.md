# 🗄️ Scripts SQL para Aba Financeiro de Ingressos

## 📋 Ordem de Execução

Execute os arquivos SQL na seguinte ordem no seu banco Supabase:

### 1️⃣ **Tabelas Base**
```sql
-- 1. Receitas manuais dos jogos
\i database/migrations/receitas_jogos.sql

-- 2. Despesas operacionais dos jogos  
\i database/migrations/despesas_jogos.sql

-- 3. Histórico de cobranças
\i database/migrations/historico_cobrancas_ingressos.sql
```

### 2️⃣ **Views e Funções**
```sql
-- 4. Views e funções auxiliares
\i database/migrations/views_funcoes_jogos.sql
```

## 🔧 Execução via Supabase Dashboard

1. Acesse o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Cole o conteúdo de cada arquivo na ordem acima
4. Execute um por vez
5. Verifique se não há erros

## 📊 Verificação da Instalação

Após executar todos os scripts, verifique se as tabelas foram criadas:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('receitas_jogos', 'despesas_jogos', 'historico_cobrancas_ingressos');

-- Verificar views criadas
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name LIKE 'vw_%jogo%';

-- Verificar funções criadas
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%jogo%';
```

## 🎯 Funcionalidades Habilitadas

Após a execução, você terá:

✅ **Tabela receitas_jogos** - Receitas manuais (patrocínios, extras)  
✅ **Tabela despesas_jogos** - Despesas operacionais  
✅ **Tabela historico_cobrancas_ingressos** - Log de cobranças  
✅ **View vw_resumo_financeiro_jogo** - Resumo automático por jogo  
✅ **View vw_analytics_setor_jogo** - Analytics por setor  
✅ **Função calcular_roi_setor_jogo()** - ROI por setor  
✅ **Função comparar_jogo_com_media()** - Comparativo histórico  
✅ **Função registrar_cobranca_ingresso()** - Registrar cobranças  

## ⚠️ Observações Importantes

- **Backup**: Faça backup antes de executar
- **Ambiente**: Execute primeiro em desenvolvimento
- **Permissões**: Verifique se tem permissões de CREATE TABLE
- **RLS**: As políticas RLS estão configuradas como permissivas (ajuste conforme necessário)

## 🔄 Rollback (se necessário)

Para reverter as mudanças:

```sql
-- Remover em ordem reversa
DROP VIEW IF EXISTS vw_estatisticas_cobranca_ingresso;
DROP VIEW IF EXISTS vw_analytics_setor_jogo;
DROP VIEW IF EXISTS vw_resumo_financeiro_jogo;
DROP FUNCTION IF EXISTS comparar_jogo_com_media(TEXT);
DROP FUNCTION IF EXISTS calcular_roi_setor_jogo(TEXT);
DROP FUNCTION IF EXISTS registrar_cobranca_ingresso(UUID, TEXT, TEXT, TEXT);
DROP TABLE IF EXISTS historico_cobrancas_ingressos;
DROP TABLE IF EXISTS despesas_jogos;
DROP TABLE IF EXISTS receitas_jogos;
```