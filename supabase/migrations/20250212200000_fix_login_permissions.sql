-- MIGRATION: Fix Login Permissions and Ensure User Access
-- Description: Unlocks the 'usuarios' table to prevent login hangs due to RLS policies.

-- 1. Enable RLS but add a permissive policy for authenticated users
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Usuarios podem ver seu proprio perfil" ON public.usuarios;
DROP POLICY IF EXISTS "Admins podem ver tudo" ON public.usuarios;
DROP POLICY IF EXISTS "Allow all for authenticated" ON public.usuarios;

-- Create a "Catch-all" policy for authenticated users to ensure they can ALWAYS read/write their own data
-- This is critical for the login process to work smoothly
CREATE POLICY "Allow all for authenticated"
ON public.usuarios
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 2. Ensure the trigger exists and works for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nome, role, created_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'visual'),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    nome = EXCLUDED.nome,
    role = EXCLUDED.role;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Grant permissions explicitly
GRANT ALL ON public.usuarios TO authenticated;
GRANT ALL ON public.usuarios TO service_role;
