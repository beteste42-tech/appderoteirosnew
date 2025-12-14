-- Habilitar RLS em todas as tabelas críticas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Política para Usuarios: Todos podem ler seus próprios dados
DROP POLICY IF EXISTS "Usuarios podem ver seu proprio perfil" ON public.usuarios;
CREATE POLICY "Usuarios podem ver seu proprio perfil" 
ON public.usuarios FOR SELECT 
USING (auth.uid() = id);

-- Política para Usuarios: Trigger do sistema pode inserir (já é padrão, mas garantindo para insert manual)
DROP POLICY IF EXISTS "Permitir insert proprio usuario" ON public.usuarios;
CREATE POLICY "Permitir insert proprio usuario" 
ON public.usuarios FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Política para Access Logs: Usuários autenticados podem inserir logs
DROP POLICY IF EXISTS "Usuarios podem criar logs" ON public.access_logs;
CREATE POLICY "Usuarios podem criar logs" 
ON public.access_logs FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Política para Access Logs: Apenas admins podem ver logs (opcional, por segurança)
DROP POLICY IF EXISTS "Admins veem logs" ON public.access_logs;
CREATE POLICY "Admins veem logs" 
ON public.access_logs FOR SELECT 
TO authenticated 
USING (EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND role = 'admin'));

-- Garantir permissões básicas
GRANT ALL ON public.usuarios TO authenticated;
GRANT ALL ON public.access_logs TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
