-- Adicionar campos de endereço à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS estado text,
ADD COLUMN IF NOT EXISTS bairro text,
ADD COLUMN IF NOT EXISTS rua text,
ADD COLUMN IF NOT EXISTS numero text,
ADD COLUMN IF NOT EXISTS complemento text;

-- Criar tabela de favoritos
CREATE TABLE IF NOT EXISTS public.favoritos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  produto_id uuid NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, produto_id)
);

-- Habilitar RLS na tabela favoritos
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;

-- Políticas para favoritos
CREATE POLICY "Usuários podem ver seus próprios favoritos"
ON public.favoritos
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem adicionar favoritos"
ON public.favoritos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem remover seus favoritos"
ON public.favoritos
FOR DELETE
USING (auth.uid() = user_id);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_favoritos_user_id ON public.favoritos(user_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_produto_id ON public.favoritos(produto_id);