-- Criar tabela de endereços
CREATE TABLE public.enderecos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_endereco TEXT NOT NULL,
  cep TEXT NOT NULL,
  estado TEXT NOT NULL,
  bairro TEXT NOT NULL,
  rua TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  is_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.enderecos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver seus próprios endereços"
  ON public.enderecos
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios endereços"
  ON public.enderecos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios endereços"
  ON public.enderecos
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios endereços"
  ON public.enderecos
  FOR DELETE
  USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_enderecos_user_id ON public.enderecos(user_id);
CREATE INDEX idx_enderecos_principal ON public.enderecos(user_id, is_principal) WHERE is_principal = true;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_enderecos_updated_at
  BEFORE UPDATE ON public.enderecos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();