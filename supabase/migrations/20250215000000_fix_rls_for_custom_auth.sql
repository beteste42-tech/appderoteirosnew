/*
  # Ajustar Políticas RLS para Autenticação Customizada
  
  Esta migration ajusta as políticas RLS das tabelas principais para funcionar
  com o sistema de autenticação customizada (não usa Supabase Auth).
  
  Como o sistema valida usuários através da função verify_password e não usa
  Supabase Auth, as políticas que dependem de auth.role() = 'authenticated' 
  bloqueiam o acesso aos dados.
  
  Solução: Remover políticas antigas e criar políticas permissivas que permitem
  acesso aos dados, já que a validação de autenticação é feita no código da aplicação.
  
  ## Metadata:
  - Schema-Category: "Security"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true
*/

-- 1. Remover políticas antigas que dependem de auth.role() = 'authenticated'

-- Tabela: fretistas
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON public.fretistas;
ALTER TABLE public.fretistas ENABLE ROW LEVEL SECURITY;

-- Tabela: veiculos
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON public.veiculos;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;

-- Tabela: motoristas
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON public.motoristas;
ALTER TABLE public.motoristas ENABLE ROW LEVEL SECURITY;

-- Tabela: clientes
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON public.clientes;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Tabela: rotas
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON public.rotas;
ALTER TABLE public.rotas ENABLE ROW LEVEL SECURITY;

-- Tabela: rota_clientes
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON public.rota_clientes;
ALTER TABLE public.rota_clientes ENABLE ROW LEVEL SECURITY;

-- Tabela: mapa_carregamento
DROP POLICY IF EXISTS "Acesso total para usuários autenticados" ON public.mapa_carregamento;
ALTER TABLE public.mapa_carregamento ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas permissivas que permitem acesso aos dados
-- Como a autenticação é validada no código da aplicação através de verify_password,
-- podemos permitir acesso público às tabelas de dados

-- Política para fretistas: Permitir leitura e escrita para todos (anon e authenticated)
CREATE POLICY "Permitir acesso completo a fretistas"
ON public.fretistas
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Política para veiculos: Permitir leitura e escrita para todos
CREATE POLICY "Permitir acesso completo a veiculos"
ON public.veiculos
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Política para motoristas: Permitir leitura e escrita para todos
CREATE POLICY "Permitir acesso completo a motoristas"
ON public.motoristas
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Política para clientes: Permitir leitura e escrita para todos
CREATE POLICY "Permitir acesso completo a clientes"
ON public.clientes
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Política para rotas: Permitir leitura e escrita para todos
CREATE POLICY "Permitir acesso completo a rotas"
ON public.rotas
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Política para rota_clientes: Permitir leitura e escrita para todos
CREATE POLICY "Permitir acesso completo a rota_clientes"
ON public.rota_clientes
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Política para mapa_carregamento: Permitir leitura e escrita para todos
CREATE POLICY "Permitir acesso completo a mapa_carregamento"
ON public.mapa_carregamento
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 3. Garantir permissões de acesso
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fretistas TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.veiculos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.motoristas TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clientes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rotas TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rota_clientes TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mapa_carregamento TO anon, authenticated;
