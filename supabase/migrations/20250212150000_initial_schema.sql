/*
  # Schema Inicial - Roteiriza GDM
  
  Criação das tabelas baseadas no DER solicitado:
  1. usuarios (Perfil vinculado ao auth.users)
  2. fretistas
  3. veiculos
  4. motoristas
  5. clientes
  6. rotas
  7. rota_clientes
  8. mapa_carregamento

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true
*/

-- 1. Tabela de Usuários (Vinculada ao Auth do Supabase)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    nome TEXT,
    role TEXT CHECK (role IN ('admin', 'operador', 'visual')) DEFAULT 'operador',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Fretistas
CREATE TABLE IF NOT EXISTS public.fretistas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    contato TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Veículos
CREATE TABLE IF NOT EXISTS public.veiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fretista_id UUID REFERENCES public.fretistas(id) ON DELETE CASCADE,
    placa TEXT NOT NULL UNIQUE,
    tipo_veiculo TEXT NOT NULL,
    capacidade_kg NUMERIC(10,2) NOT NULL,
    capacidade_paletes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Motoristas
CREATE TABLE IF NOT EXISTS public.motoristas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fretista_id UUID REFERENCES public.fretistas(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT UNIQUE,
    nome TEXT NOT NULL,
    endereco TEXT,
    cidade TEXT,
    uf TEXT,
    bairro TEXT,
    rede TEXT,
    vendedor TEXT,
    loja TEXT,
    regiao TEXT,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabela de Rotas
CREATE TABLE IF NOT EXISTS public.rotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_entrega DATE NOT NULL,
    regiao TEXT NOT NULL,
    numero_carga TEXT,
    fretista_id UUID REFERENCES public.fretistas(id),
    veiculo_id UUID REFERENCES public.veiculos(id),
    motorista_id UUID REFERENCES public.motoristas(id),
    peso_total NUMERIC(10,2) DEFAULT 0,
    qtd_paletes INTEGER DEFAULT 0,
    taxa_ocupacao NUMERIC(5,2) DEFAULT 0,
    distancia_km NUMERIC(10,2),
    tempo_estimado TEXT,
    observacoes TEXT,
    status TEXT DEFAULT 'Criada', -- Criada, Em Transito, Finalizada
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabela de Rota Clientes (Sequência de Entrega)
CREATE TABLE IF NOT EXISTS public.rota_clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rota_id UUID REFERENCES public.rotas(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.clientes(id),
    ordem_entrega INTEGER NOT NULL,
    status_entrega TEXT DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabela de Mapa de Carregamento
CREATE TABLE IF NOT EXISTS public.mapa_carregamento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rota_id UUID REFERENCES public.rotas(id) ON DELETE CASCADE,
    posicao_palete INTEGER NOT NULL, -- Número do quadrante/posição
    cliente_id UUID REFERENCES public.clientes(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) - Segurança
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fretistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rota_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mapa_carregamento ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança (Permissivas para desenvolvimento inicial)
-- Em produção, você deve restringir isso baseada no 'role' do usuario
CREATE POLICY "Acesso total para usuários autenticados" ON public.usuarios FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total para usuários autenticados" ON public.fretistas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total para usuários autenticados" ON public.veiculos FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total para usuários autenticados" ON public.motoristas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total para usuários autenticados" ON public.clientes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total para usuários autenticados" ON public.rotas FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total para usuários autenticados" ON public.rota_clientes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Acesso total para usuários autenticados" ON public.mapa_carregamento FOR ALL USING (auth.role() = 'authenticated');

-- Trigger para criar perfil de usuário automaticamente ao cadastrar no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nome, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'nome', 'operador');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
