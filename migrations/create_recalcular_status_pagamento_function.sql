-- Função para recalcular o status de pagamento de um passageiro baseado nas parcelas existentes
CREATE OR REPLACE FUNCTION recalcular_status_pagamento(passageiro_id UUID)
RETURNS TEXT AS $$
DECLARE
    passageiro_record RECORD;
    total_parcelas DECIMAL(10,2) := 0;
    valor_total_devido DECIMAL(10,2) := 0;
    valor_viagem DECIMAL(10,2) := 0;
    valor_passeios DECIMAL(10,2) := 0;
    novo_status TEXT;
BEGIN
    -- Buscar dados do passageiro
    SELECT 
        vp.valor,
        vp.desconto,
        vp.pago_por_credito,
        vp.valor_credito_utilizado
    INTO passageiro_record
    FROM viagem_passageiros vp
    WHERE vp.id = passageiro_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Passageiro não encontrado: %', passageiro_id;
    END IF;
    
    -- Calcular valor da viagem (valor - desconto)
    valor_viagem := COALESCE(passageiro_record.valor, 0) - COALESCE(passageiro_record.desconto, 0);
    
    -- Calcular valor dos passeios
    SELECT COALESCE(SUM(valor_cobrado), 0)
    INTO valor_passeios
    FROM passageiro_passeios
    WHERE viagem_passageiro_id = passageiro_id;
    
    -- Valor total devido
    valor_total_devido := valor_viagem + valor_passeios;
    
    -- Se é brinde (valor total = 0), sempre pago
    IF valor_total_devido = 0 THEN
        novo_status := 'Pago';
        UPDATE viagem_passageiros 
        SET status_pagamento = novo_status 
        WHERE id = passageiro_id;
        RETURN novo_status;
    END IF;
    
    -- Calcular total pago em parcelas
    SELECT COALESCE(SUM(valor_parcela), 0)
    INTO total_parcelas
    FROM viagem_passageiros_parcelas
    WHERE viagem_passageiro_id = passageiro_id;
    
    -- Adicionar valor pago por crédito
    IF passageiro_record.pago_por_credito THEN
        total_parcelas := total_parcelas + COALESCE(passageiro_record.valor_credito_utilizado, 0);
    END IF;
    
    -- Determinar novo status baseado no valor pago
    IF total_parcelas >= valor_total_devido THEN
        -- Pago completo
        IF valor_viagem > 0 AND valor_passeios > 0 THEN
            novo_status := 'Pago Completo';
        ELSE
            novo_status := 'Pago';
        END IF;
    ELSIF total_parcelas >= valor_viagem AND valor_viagem > 0 THEN
        -- Viagem paga, passeios pendentes
        IF valor_passeios > 0 THEN
            novo_status := 'Viagem Paga';
        ELSE
            novo_status := 'Pago';
        END IF;
    ELSIF total_parcelas >= valor_passeios AND valor_passeios > 0 AND valor_viagem > 0 THEN
        -- Passeios pagos, viagem pendente
        novo_status := 'Passeios Pagos';
    ELSIF total_parcelas > 0 THEN
        -- Pagamento parcial
        novo_status := 'Pagamento Parcial';
    ELSE
        -- Nada pago
        novo_status := 'Pendente';
    END IF;
    
    -- Atualizar status no banco
    UPDATE viagem_passageiros 
    SET status_pagamento = novo_status 
    WHERE id = passageiro_id;
    
    RETURN novo_status;
END;
$$ LANGUAGE plpgsql;

-- Função para recalcular status de todos os passageiros de uma viagem
CREATE OR REPLACE FUNCTION recalcular_status_viagem(viagem_id UUID)
RETURNS TABLE(passageiro_id UUID, nome TEXT, status_anterior TEXT, status_novo TEXT) AS $$
DECLARE
    passageiro_record RECORD;
BEGIN
    FOR passageiro_record IN 
        SELECT vp.id, c.nome, vp.status_pagamento as status_atual
        FROM viagem_passageiros vp
        JOIN clientes c ON c.id = vp.cliente_id
        WHERE vp.viagem_id = viagem_id
    LOOP
        passageiro_id := passageiro_record.id;
        nome := passageiro_record.nome;
        status_anterior := passageiro_record.status_atual;
        status_novo := recalcular_status_pagamento(passageiro_record.id);
        
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;