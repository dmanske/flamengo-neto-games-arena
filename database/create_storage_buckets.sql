-- =====================================================
-- CRIAÇÃO DE BUCKETS DE ARMAZENAMENTO
-- =====================================================
-- Execute este script no SQL Editor do Supabase Dashboard

-- Criar bucket para imagens de ônibus
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'onibus',
  'onibus', 
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Criar bucket para logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Criar bucket para fotos de clientes
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-photos',
  'client-photos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- POLÍTICAS DE ACESSO (RLS)
-- =====================================================

-- Política para permitir upload de imagens de ônibus (usuários autenticados)
CREATE POLICY "Usuários autenticados podem fazer upload de imagens de ônibus"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'onibus');

-- Política para permitir visualização pública de imagens de ônibus
CREATE POLICY "Imagens de ônibus são públicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'onibus');

-- Política para permitir atualização de imagens de ônibus (usuários autenticados)
CREATE POLICY "Usuários autenticados podem atualizar imagens de ônibus"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'onibus');

-- Política para permitir exclusão de imagens de ônibus (usuários autenticados)
CREATE POLICY "Usuários autenticados podem excluir imagens de ônibus"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'onibus');

-- Políticas similares para logos
CREATE POLICY "Usuários autenticados podem fazer upload de logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos');

CREATE POLICY "Logos são públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');

CREATE POLICY "Usuários autenticados podem atualizar logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'logos');

CREATE POLICY "Usuários autenticados podem excluir logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'logos');

-- Políticas para fotos de clientes
CREATE POLICY "Usuários autenticados podem fazer upload de fotos de clientes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-photos');

CREATE POLICY "Fotos de clientes são públicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'client-photos');

CREATE POLICY "Usuários autenticados podem atualizar fotos de clientes"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'client-photos');

CREATE POLICY "Usuários autenticados podem excluir fotos de clientes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'client-photos');

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

-- Verificar se os buckets foram criados
SELECT id, name, public, file_size_limit, allowed_mime_types, created_at
FROM storage.buckets
WHERE id IN ('onibus', 'logos', 'client-photos')
ORDER BY id;

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;