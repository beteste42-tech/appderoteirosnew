/*
  # Correção da função verify_password e atualização de senhas
  
  Esta migration:
  1. Corrige a função verify_password para remover ambiguidade
  2. Atualiza as senhas de todos os usuários existentes para "junio2019"
  
  ## Metadata:
  - Schema-Category: "Fix"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: false
*/

-- 1. Corrigir função verify_password (remover ambiguidade)
CREATE OR REPLACE FUNCTION public.verify_password(email_input TEXT, password_input TEXT)
RETURNS TABLE(
    id UUID,
    email TEXT,
    nome TEXT,
    tipo_usuario TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.nome,
        u.tipo_usuario,
        u.created_at
    FROM public.usuarios u
    WHERE u.email = email_input
    AND u.senha = crypt(password_input, u.senha);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Atualizar senhas de todos os usuários existentes para "junio2019"
UPDATE public.usuarios
SET senha = crypt('junio2019', gen_salt('bf', 10))
WHERE senha IS NOT NULL;

-- 3. Comentário informativo
DO $$
BEGIN
    RAISE NOTICE 'Senhas de todos os usuários foram atualizadas para: junio2019';
END $$;

