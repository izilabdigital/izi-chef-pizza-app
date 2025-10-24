-- Corrigir função para ter search_path definido
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;