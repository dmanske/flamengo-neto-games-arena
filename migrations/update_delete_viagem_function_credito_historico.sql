-- Atualizar função delete_viagem para lidar com credito_historico
-- Esta função agora remove todas as referências de crédito antes de deletar a viagem

-- Primeiro, dropar a função existente
DROP FUNCTION IF EXISTS delete_viagem(UUID);

-- Recriar a função com o nome do parâmetro correto
CREATE OR REPLACE FUNCTION delete_viagem(viagem_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_viagem_id UUID := viagem_id;
BEGIN
  -- Log da operação
  RAISE NOTICE 'Iniciando exclusão da viagem: %', v_viagem_id;

  -- 1. Deletar histórico de créditos relacionados à viagem (se a tabela existir)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'credito_historico') THEN
    DELETE FROM credito_historico ch WHERE ch.viagem_id = v_viagem_id;
    RAISE NOTICE 'Removidos registros de credito_historico';
  END IF;

  -- 2. Deletar vinculações de crédito com viagem
  DELETE FROM credito_viagem_vinculacoes cvv WHERE cvv.passageiro_id IN (
    SELECT vp.id 
    FROM viagem_passageiros vp 
    WHERE vp.viagem_id = v_viagem_id
  );
  RAISE NOTICE 'Removidas vinculações de crédito';

  -- 3. Deletar parcelas de pagamento dos passageiros
  DELETE FROM viagem_passageiros_parcelas vpp
  WHERE vpp.viagem_passageiro_id IN (
    SELECT vp.id FROM viagem_passageiros vp WHERE vp.viagem_id = v_viagem_id
  );
  RAISE NOTICE 'Removidas parcelas de pagamento';

  -- 4. Deletar passeios dos passageiros
  DELETE FROM passageiro_passeios pp
  WHERE pp.viagem_passageiro_id IN (
    SELECT vp.id FROM viagem_passageiros vp WHERE vp.viagem_id = v_viagem_id
  );
  RAISE NOTICE 'Removidos passeios dos passageiros';

  -- 5. Deletar passageiros da viagem
  DELETE FROM viagem_passageiros vp WHERE vp.viagem_id = v_viagem_id;
  RAISE NOTICE 'Removidos passageiros da viagem';

  -- 6. Deletar ônibus da viagem
  DELETE FROM viagem_onibus vo WHERE vo.viagem_id = v_viagem_id;
  RAISE NOTICE 'Removidos ônibus da viagem';

  -- 7. Deletar passeios da viagem
  DELETE FROM viagem_passeios vps WHERE vps.viagem_id = v_viagem_id;
  RAISE NOTICE 'Removidos passeios da viagem';

  -- 8. Deletar receitas da viagem
  DELETE FROM receitas r WHERE r.viagem_id = v_viagem_id;
  RAISE NOTICE 'Removidas receitas da viagem';

  -- 9. Deletar despesas da viagem
  DELETE FROM viagem_despesas vd WHERE vd.viagem_id = v_viagem_id;
  RAISE NOTICE 'Removidas despesas da viagem';

  -- 10. Deletar ingressos relacionados à viagem (se existir)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ingressos') THEN
    DELETE FROM ingressos i WHERE i.viagem_id = v_viagem_id;
    RAISE NOTICE 'Removidos ingressos da viagem';
  END IF;

  -- 11. Finalmente, deletar a viagem
  DELETE FROM viagens v WHERE v.id = v_viagem_id;
  RAISE NOTICE 'Viagem deletada com sucesso';

EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro e re-raise
    RAISE EXCEPTION 'Erro ao deletar viagem %: %', v_viagem_id, SQLERRM;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION delete_viagem IS 'Deleta uma viagem e todos os dados relacionados, incluindo histórico de créditos';