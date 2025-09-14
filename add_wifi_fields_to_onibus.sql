-- SQL para adicionar campos de WiFi na tabela onibus
-- Execute este script no Supabase SQL Editor

ALTER TABLE onibus 
ADD COLUMN wifi_ssid TEXT,
ADD COLUMN wifi_password TEXT;

-- Adicionar comentários para documentar os novos campos
COMMENT ON COLUMN onibus.wifi_ssid IS 'Nome da rede WiFi do ônibus (SSID)';
COMMENT ON COLUMN onibus.wifi_password IS 'Senha da rede WiFi do ônibus';

-- Verificar se os campos foram adicionados corretamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'onibus' 
AND column_name IN ('wifi_ssid', 'wifi_password');