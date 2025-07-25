-- Criar política para permitir inserção pública na tabela clientes
DROP POLICY IF EXISTS "clientes_policy" ON public.clientes;

-- Política para SELECT - apenas usuários autenticados
CREATE POLICY "clientes_select_policy" ON public.clientes
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Política para INSERT - permitir cadastro público
CREATE POLICY "clientes_insert_public_policy" ON public.clientes
FOR INSERT 
WITH CHECK (true);

-- Política para UPDATE/DELETE - apenas usuários autenticados
CREATE POLICY "clientes_update_policy" ON public.clientes
FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "clientes_delete_policy" ON public.clientes
FOR DELETE 
USING (auth.role() = 'authenticated');