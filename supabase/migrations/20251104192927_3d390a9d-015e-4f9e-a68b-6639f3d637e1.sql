-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('gerente', 'pizzaiolo', 'entregador', 'cliente');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Migrate existing roles from usuarios table to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, cargo::app_role
FROM public.usuarios
WHERE cargo IN ('gerente', 'pizzaiolo', 'entregador')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update get_user_role function to use new table
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text 
  FROM public.user_roles 
  WHERE user_id = _user_id 
  LIMIT 1;
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'gerente'))
  WITH CHECK (public.has_role(auth.uid(), 'gerente'));

-- Fix usuarios table - remove public read access
DROP POLICY IF EXISTS "Usuários podem ver todos os funcionários" ON public.usuarios;

CREATE POLICY "Users can view their own profile"
  ON public.usuarios
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Managers can view all users"
  ON public.usuarios
  FOR SELECT
  USING (public.has_role(auth.uid(), 'gerente'));

-- Fix cliente table - add proper RLS policies
CREATE POLICY "Service can insert cliente records"
  ON public.cliente
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Managers can view all cliente records"
  ON public.cliente
  FOR SELECT
  USING (public.has_role(auth.uid(), 'gerente'));

-- Fix pedidos table - remove unauthenticated access
DROP POLICY IF EXISTS "Usuários não autenticados podem ver pedidos sem user_id" ON public.pedidos;
DROP POLICY IF EXISTS "Usuários autenticados podem ver seus próprios pedidos" ON public.pedidos;

CREATE POLICY "Users can view their own orders"
  ON public.pedidos
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all orders"
  ON public.pedidos
  FOR SELECT
  USING (public.has_role(auth.uid(), 'gerente'));

CREATE POLICY "Staff can view orders for their role"
  ON public.pedidos
  FOR SELECT
  USING (
    (public.has_role(auth.uid(), 'pizzaiolo') AND status IN ('pendente', 'em preparo', 'pronto')) OR
    (public.has_role(auth.uid(), 'entregador') AND status IN ('pronto', 'em rota de entrega', 'entregue'))
  );

-- Update pedidos policies to use has_role
DROP POLICY IF EXISTS "Pizzaiolos podem atualizar status dos pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Entregadores podem atualizar status dos pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Gerentes podem atualizar qualquer pedido" ON public.pedidos;

CREATE POLICY "Pizzaiolos can update order status"
  ON public.pedidos
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'pizzaiolo'))
  WITH CHECK (
    public.has_role(auth.uid(), 'pizzaiolo') AND 
    status IN ('em preparo', 'pronto')
  );

CREATE POLICY "Entregadores can update order status"
  ON public.pedidos
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'entregador'))
  WITH CHECK (
    public.has_role(auth.uid(), 'entregador') AND 
    status IN ('em rota de entrega', 'entregue')
  );

CREATE POLICY "Managers can update any order"
  ON public.pedidos
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'gerente'))
  WITH CHECK (public.has_role(auth.uid(), 'gerente'));

-- Update produtos policies to use has_role
DROP POLICY IF EXISTS "Gerentes podem gerenciar produtos" ON public.produtos;

CREATE POLICY "Managers can manage products"
  ON public.produtos
  FOR ALL
  USING (public.has_role(auth.uid(), 'gerente'))
  WITH CHECK (public.has_role(auth.uid(), 'gerente'));

-- Update ponto_funcionarios policies to use has_role
DROP POLICY IF EXISTS "Gerentes podem ver todos os registros de ponto" ON public.ponto_funcionarios;

CREATE POLICY "Managers can view all time records"
  ON public.ponto_funcionarios
  FOR SELECT
  USING (public.has_role(auth.uid(), 'gerente'));