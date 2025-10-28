-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Trigger para criar perfil automaticamente ao fazer signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, telefone)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'nome',
    new.raw_user_meta_data->>'telefone'
  );
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Adicionar coluna user_id na tabela pedidos (nullable pois login é opcional)
ALTER TABLE public.pedidos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Atualizar política de leitura para permitir que usuários vejam seus próprios pedidos
DROP POLICY IF EXISTS "Qualquer pessoa pode ler todos os pedidos" ON public.pedidos;

CREATE POLICY "Usuários autenticados podem ver seus próprios pedidos"
  ON public.pedidos
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Usuários não autenticados podem ver pedidos sem user_id"
  ON public.pedidos
  FOR SELECT
  USING (user_id IS NULL);

-- Atualizar política de inserção
DROP POLICY IF EXISTS "Qualquer pessoa pode inserir pedidos" ON public.pedidos;

CREATE POLICY "Qualquer pessoa pode inserir pedidos"
  ON public.pedidos
  FOR INSERT
  WITH CHECK (true);

-- Atualizar política de update
DROP POLICY IF EXISTS "Qualquer pessoa pode atualizar status de pedidos para cancelado" ON public.pedidos;

CREATE POLICY "Usuários podem cancelar seus próprios pedidos"
  ON public.pedidos
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL)
  WITH CHECK (status = ANY (ARRAY['cancelado'::text, 'pendente'::text, 'preparando'::text, 'entregue'::text]));