-- Adiciona coluna de comentário por entrega
ALTER TABLE public.rota_clientes
ADD COLUMN IF NOT EXISTS comentario_entrega TEXT;
