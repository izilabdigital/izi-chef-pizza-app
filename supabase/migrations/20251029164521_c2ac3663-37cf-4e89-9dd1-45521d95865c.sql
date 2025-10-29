-- Função que envia notificação quando o status muda
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
BEGIN
  -- Só notifica se o status mudou
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Monta o payload para o Edge Function
    payload := jsonb_build_object(
      'pedido_id', NEW.id,
      'numero_pedido', NEW.numero_pedido,
      'status_novo', NEW.status,
      'telefone_cliente', NEW.telefone,
      'nome_cliente', NEW.nome
    );
    
    -- Chama o Edge Function de forma assíncrona
    PERFORM net.http_post(
      url := 'https://dufbtyqoxhhpomgirrsv.supabase.co/functions/v1/notify-order-status',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', current_setting('app.settings.supabase_anon_key', true)
      ),
      body := payload
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Cria o trigger
DROP TRIGGER IF EXISTS on_order_status_change ON public.pedidos;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();