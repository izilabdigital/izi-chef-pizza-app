-- Criar tabela de pedidos
CREATE TABLE public.pedidos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_pedido TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  cep TEXT NOT NULL,
  estado TEXT NOT NULL,
  bairro TEXT NOT NULL,
  rua TEXT NOT NULL,
  numero TEXT NOT NULL,
  complemento TEXT,
  forma_pagamento TEXT NOT NULL,
  cupom TEXT,
  desconto DECIMAL(10,2) DEFAULT 0,
  itens JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  taxa_entrega DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de cupons
CREATE TABLE public.cupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  descricao TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('percentual', 'fixo')),
  valor DECIMAL(10,2) NOT NULL,
  minimo_pedido DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  validade TIMESTAMP WITH TIME ZONE,
  usos_maximos INTEGER,
  usos_atuais INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;

-- Políticas para pedidos (público pode inserir e ler seus próprios pedidos)
CREATE POLICY "Qualquer pessoa pode inserir pedidos"
ON public.pedidos
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Qualquer pessoa pode ler todos os pedidos"
ON public.pedidos
FOR SELECT
USING (true);

-- Políticas para cupons (público pode ler cupons ativos)
CREATE POLICY "Qualquer pessoa pode ler cupons ativos"
ON public.cupons
FOR SELECT
USING (ativo = true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_pedidos_updated_at
BEFORE UPDATE ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns cupons de exemplo
INSERT INTO public.cupons (codigo, descricao, tipo, valor, minimo_pedido, ativo) VALUES
('CHEFE10', '10% de desconto em pedidos acima de R$ 50', 'percentual', 10, 50, true),
('PRIMEIRA', 'R$ 15 OFF na primeira compra', 'fixo', 15, 40, true),
('PIZZA20', '20% OFF em pedidos acima de R$ 80', 'percentual', 20, 80, true);

-- Função para gerar número de pedido único
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    new_number := 'IZI' || LPAD(FLOOR(RANDOM() * 99999)::TEXT, 5, '0');
    
    SELECT COUNT(*) INTO exists_count
    FROM public.pedidos
    WHERE numero_pedido = new_number;
    
    EXIT WHEN exists_count = 0;
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;