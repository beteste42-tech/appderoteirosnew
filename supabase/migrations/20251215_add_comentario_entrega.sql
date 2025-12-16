-- adiciona comentario_entrega em rota_clientes
ALTER TABLE public.rota_clientes ADD COLUMN IF NOT EXISTS comentario_entrega TEXT;
