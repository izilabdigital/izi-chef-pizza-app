-- Fix: Restrict cupons table to authenticated users only
-- Previously: 'Qualquer pessoa pode ler cupons ativos' allowed public access
-- Now: Only authenticated users can view active coupons

DROP POLICY IF EXISTS "Qualquer pessoa pode ler cupons ativos" ON public.cupons;

CREATE POLICY "Usuários autenticados podem ler cupons ativos"
  ON public.cupons
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND ativo = true);