/*
  # Configuração de Autenticação e Logs
  
  1. Tabelas
    - access_logs: Histórico de logins e ações importantes
  
  2. Automação (Triggers)
    - Sincroniza auth.users -> public.usuarios
    - Garante que todo usuário criado no Auth tenha um registro na tabela de aplicação
*/

-- 1. Tabela de Logs de Acesso
CREATE TABLE IF NOT EXISTS public.access_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  user_email text,
  action text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS para logs
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ver logs, todos podem criar (via função ou insert direto se permitido)
CREATE POLICY "Admins can view all logs" ON public.access_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own logs" ON public.access_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Função para Sincronizar Usuários (Auth -> Public)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nome, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'nome', 'Usuário'),
    COALESCE(new.raw_user_meta_data->>'role', 'visual')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nome = EXCLUDED.nome,
    role = EXCLUDED.role;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Ajustes na tabela usuarios (garantir que existe e tem as colunas certas conforme seu pedido)
-- Caso a tabela já tenha sido criada na migração anterior, isso é apenas garantia
DO $$ 
BEGIN
    -- Adicionar coluna role se não existir (embora deva existir pelo DER anterior)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usuarios' AND column_name = 'role') THEN
        ALTER TABLE public.usuarios ADD COLUMN role text DEFAULT 'visual';
    END IF;
END $$;
