-- Ajustar políticas RLS para permitir cadastro público completo
DROP POLICY IF EXISTS "clientes_insert_public_policy" ON public.clientes;
DROP POLICY IF EXISTS "clientes_select_policy" ON public.clientes;
DROP POLICY IF EXISTS "clientes_update_policy" ON public.clientes;
DROP POLICY IF EXISTS "clientes_delete_policy" ON public.clientes;

-- Política para permitir inserção pública (qualquer um pode cadastrar)
CREATE POLICY "clientes_insert_public_policy" 
ON public.clientes 
FOR INSERT 
WITH CHECK (true);

-- Política para seleção apenas para autenticados
CREATE POLICY "clientes_select_policy" 
ON public.clientes 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Política para atualização apenas para autenticados
CREATE POLICY "clientes_update_policy" 
ON public.clientes 
FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Política para exclusão apenas para autenticados
CREATE POLICY "clientes_delete_policy" 
ON public.clientes 
FOR DELETE 
USING (auth.role() = 'authenticated');