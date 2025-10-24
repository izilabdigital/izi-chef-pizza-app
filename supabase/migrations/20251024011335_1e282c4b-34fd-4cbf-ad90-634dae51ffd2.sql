-- Criar tabela de cupons se não existir
CREATE TABLE IF NOT EXISTS public.cupons (
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

-- Enable RLS nos cupons
ALTER TABLE public.cupons ENABLE ROW LEVEL SECURITY;

-- Políticas para cupons (público pode ler cupons ativos)
DROP POLICY IF EXISTS "Qualquer pessoa pode ler cupons ativos" ON public.cupons;
CREATE POLICY "Qualquer pessoa pode ler cupons ativos"
ON public.cupons
FOR SELECT
USING (ativo = true);

-- Inserir cupons de exemplo se não existirem
INSERT INTO public.cupons (codigo, descricao, tipo, valor, minimo_pedido, ativo) 
VALUES
('CHEFE10', '10% de desconto em pedidos acima de R$ 50', 'percentual', 10, 50, true),
('PRIMEIRA', 'R$ 15 OFF na primeira compra', 'fixo', 15, 40, true),
('PIZZA20', '20% OFF em pedidos acima de R$ 80', 'percentual', 20, 80, true)
ON CONFLICT (codigo) DO NOTHING;

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