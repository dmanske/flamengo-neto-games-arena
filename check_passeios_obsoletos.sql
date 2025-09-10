-- Verificar passeios inativos ou obsoletos no Supabase

-- 1. Passeios marcados como inativos
SELECT 
    'PASSEIOS_INATIVOS' as tipo,
    id,
    nome,
    valor,
    categoria,
    ativo,
    created_at
FROM passeios 
WHERE ativo = false
ORDER BY created_at DESC;

-- 2. Passeios órfãos (referenciados em passageiro_passeios mas não existem na tabela passeios)
SELECT 
    'PASSEIOS_ORFAOS' as tipo,
    pp.passeio_nome,
    COUNT(*) as referencias,
    MIN(pp.created_at) as primeira_referencia,
    MAX(pp.created_at) as ultima_referencia
FROM passageiro_passeios pp
LEFT JOIN passeios p ON p.nome = pp.passeio_nome
WHERE p.id IS NULL
GROUP BY pp.passeio_nome
ORDER BY referencias DESC;

-- 3. Passeios sem uso (existem na tabela mas nunca foram selecionados)
SELECT 
    'PASSEIOS_SEM_USO' as tipo,
    p.id,
    p.nome,
    p.valor,
    p.categoria,
    p.ativo,
    p.created_at
FROM passeios p
LEFT JOIN passageiro_passeios pp ON pp.passeio_nome = p.nome
WHERE pp.id IS NULL
ORDER BY p.created_at DESC;

-- 4. Passeios com status problemático
SELECT 
    'STATUS_PROBLEMATICO' as tipo,
    pp.passeio_nome,
    pp.status,
    COUNT(*) as ocorrencias
FROM passageiro_passeios pp
WHERE pp.status NOT IN ('confirmado', 'Confirmado', 'ativo', 'Ativo')
GROUP BY pp.passeio_nome, pp.status
ORDER BY ocorrencias DESC;

-- 5. Resumo geral
SELECT 
    'RESUMO_GERAL' as tipo,
    (
        SELECT COUNT(*) FROM passeios WHERE ativo = false
    ) as passeios_inativos,
    (
        SELECT COUNT(DISTINCT pp.passeio_nome) 
        FROM passageiro_passeios pp
        LEFT JOIN passeios p ON p.nome = pp.passeio_nome
        WHERE p.id IS NULL
    ) as passeios_orfaos,
    (
        SELECT COUNT(*) 
        FROM passeios p
        LEFT JOIN passageiro_passeios pp ON pp.passeio_nome = p.nome
        WHERE pp.id IS NULL
    ) as passeios_sem_uso,
    (
        SELECT COUNT(*) FROM passeios WHERE ativo = true
    ) as passeios_ativos_total;
