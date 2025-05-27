-- Adiciona coluna de cidade de embarque
ALTER TABLE viagens ADD COLUMN cidade_embarque TEXT NOT NULL DEFAULT 'Blumenau';

-- Adiciona coluna de passeios pagos
ALTER TABLE viagens ADD COLUMN passeios_pagos TEXT[] DEFAULT '{}';

-- Adiciona coluna de outro passeio
ALTER TABLE viagens ADD COLUMN outro_passeio TEXT;

-- Remove coluna de rota que não será mais usada
ALTER TABLE viagens DROP COLUMN rota; 