-- Permitir atualização do status de pedidos (para cancelamento)
CREATE POLICY "Qualquer pessoa pode atualizar status de pedidos para cancelado"
ON public.pedidos
FOR UPDATE
USING (true)
WITH CHECK (status IN ('cancelado', 'pendente', 'preparando', 'entregue'));