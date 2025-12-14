/*
  # Add Password Column and Fix RLS

  ## Query Description:
  1. Adds `senha_inicial` column to `usuarios` table for admin reference (not used for auth).
  2. Ensures RLS policies allow users to read their own data (fixing loading bug).
  3. Grants necessary permissions.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
*/

-- Adicionar coluna de senha inicial (apenas para registro, não usada para login)
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS senha_inicial text;

-- Garantir que RLS está habilitado
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver seus próprios dados
DROP POLICY IF EXISTS "Usuarios podem ver seu proprio perfil" ON public.usuarios;
CREATE POLICY "Usuarios podem ver seu proprio perfil" 
ON public.usuarios FOR SELECT 
USING (auth.uid() = id);

-- Política: Admins podem ver tudo (opcional, mas útil)
DROP POLICY IF EXISTS "Admins podem ver todos usuarios" ON public.usuarios;
CREATE POLICY "Admins podem ver todos usuarios" 
ON public.usuarios FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Garantir permissões
GRANT ALL ON public.usuarios TO authenticated;
GRANT ALL ON public.usuarios TO service_role;
