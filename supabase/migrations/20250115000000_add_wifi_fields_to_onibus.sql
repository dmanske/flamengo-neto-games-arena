-- Adiciona campos de WiFi na tabela onibus
ALTER TABLE onibus ADD COLUMN wifi_ssid VARCHAR(255);
ALTER TABLE onibus ADD COLUMN wifi_password VARCHAR(255);

-- Adiciona comentários para documentação
COMMENT ON COLUMN onibus.wifi_ssid IS 'Nome da rede WiFi do ônibus (SSID)';
COMMENT ON COLUMN onibus.wifi_password IS 'Senha da rede WiFi do ônibus';

-- Cria índice para consultas mais rápidas (opcional)
CREATE INDEX idx_onibus_wifi_ssid ON onibus(wifi_ssid) WHERE wifi_ssid IS NOT NULL;