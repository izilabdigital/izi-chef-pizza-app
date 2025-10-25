-- Criar função para incrementar uso de cupom
CREATE OR REPLACE FUNCTION public.increment_cupom_uso(cupom_code TEXT)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.cupons
  SET usos_atuais = usos_atuais + 1
  WHERE codigo = cupom_code;
END;
$$;