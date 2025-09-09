-- Trigger para sincronização automática entre viagem_passeios e passageiro_passeios
-- Remove registros órfãos de passageiro_passeios quando passeios são removidos de uma viagem

-- Função que será executada pelo trigger
CREATE OR REPLACE FUNCTION sync_passageiro_passeios_on_viagem_passeios_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Remove registros de passageiro_passeios que referenciam o passeio removido da viagem
    DELETE FROM passageiro_passeios pp
    WHERE pp.passeio_nome = (
        SELECT p.nome 
        FROM passeios p 
        WHERE p.id = OLD.passeio_id
    )
    AND pp.viagem_passageiro_id IN (
        SELECT vp.id 
        FROM viagem_passageiros vp 
        WHERE vp.viagem_id = OLD.viagem_id
    );
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Criar o trigger que executa APÓS a remoção de um registro de viagem_passeios
CREATE TRIGGER trigger_sync_passageiro_passeios_delete
    AFTER DELETE ON viagem_passeios
    FOR EACH ROW
    EXECUTE FUNCTION sync_passageiro_passeios_on_viagem_passeios_delete();

-- Comentário explicativo
COMMENT ON FUNCTION sync_passageiro_passeios_on_viagem_passeios_delete() IS 
'Função que sincroniza automaticamente a tabela passageiro_passeios quando passeios são removidos de uma viagem, evitando registros órfãos';

COMMENT ON TRIGGER trigger_sync_passageiro_passeios_delete ON viagem_passeios IS 
'Trigger que executa a sincronização automática entre viagem_passeios e passageiro_passeios ao remover passeios';