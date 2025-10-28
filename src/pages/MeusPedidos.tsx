import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';
import { format } from 'date-fns';

interface Pedido {
  id: string;
  numero_pedido: string;
  created_at: string;
  itens: any[];
  total: number;
  status: string;
}

const statusColors: Record<string, string> = {
  pendente: 'bg-yellow-500',
  preparando: 'bg-orange-500',
  'saiu para entrega': 'bg-blue-500',
  entregue: 'bg-green-500',
  cancelado: 'bg-gray-500'
};

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  preparando: 'Preparando',
  'saiu para entrega': 'Saiu para Entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado'
};

export default function MeusPedidos() {
  const navigate = useNavigate();
  const { phone, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadPedidos();
  }, [phone, isAuthenticated]);

  const loadPedidos = async () => {
    if (!phone) return;

    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('telefone', phone)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPedidos((data as any) || []);
    } catch (error) {
      toast({
        title: 'Erro ao carregar pedidos',
        description: 'Tente novamente',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (pedidoId: string, status: string) => {
    if (status !== 'pendente' && status !== 'preparando') {
      toast({
        title: 'Não é possível cancelar',
        description: 'Este pedido já está em andamento',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: 'cancelado' })
        .eq('id', pedidoId);

      if (error) throw error;

      toast({
        title: 'Pedido cancelado',
        description: 'Seu pedido foi cancelado com sucesso'
      });
      
      loadPedidos();
    } catch (error) {
      toast({
        title: 'Erro ao cancelar',
        description: 'Tente novamente',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center pb-24">
          <p className="text-muted-foreground">Carregando pedidos...</p>
        </div>
        <BottomNavigation />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-10 glass-effect border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary">Meus Pedidos</h1>
                <p className="text-sm text-muted-foreground">{phone}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 space-y-4">
          {pedidos.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-bold mb-2">Nenhum pedido encontrado</h2>
              <p className="text-muted-foreground mb-4">
                Você ainda não fez nenhum pedido
              </p>
              <Button onClick={() => navigate('/menu')}>Ver Cardápio</Button>
            </Card>
          ) : (
            pedidos.map((pedido) => (
              <Card key={pedido.id} className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{pedido.numero_pedido}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(pedido.created_at), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                  <Badge className={statusColors[pedido.status]}>
                    {statusLabels[pedido.status]}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Itens:</p>
                  {pedido.itens?.map((item: any, index: number) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      {item.quantity}x {item.name} ({item.size})
                    </p>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="font-bold">
                    Total: R$ {pedido.total.toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/order-tracking', { 
                      state: { orderNumber: pedido.numero_pedido } 
                    })}
                  >
                    Acompanhar
                  </Button>
                  {(pedido.status === 'pendente' || pedido.status === 'preparando') && (
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleCancelOrder(pedido.id, pedido.status)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
      <BottomNavigation />
    </>
  );
}
