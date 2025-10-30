import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, ChefHat, Bike, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import BottomNavigation from '@/components/BottomNavigation';

type OrderStatus = 'received' | 'preparing' | 'delivery' | 'delivered';

const statusData = {
  received: { icon: Clock, label: 'Pedido Recebido', color: 'text-yellow-500', progress: 25 },
  preparing: { icon: ChefHat, label: 'Preparando', color: 'text-orange-500', progress: 50 },
  delivery: { icon: Bike, label: 'Saiu para Entrega', color: 'text-blue-500', progress: 75 },
  delivered: { icon: CheckCircle, label: 'Entregue', color: 'text-green-500', progress: 100 }
};

export default function OrderTracking() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderNumber = location.state?.orderNumber || '#IZI00000';
  const [status, setStatus] = useState<OrderStatus>('received');

  // useEffect(() => {
  //   // Simula progressão do pedido
  //   const statuses: OrderStatus[] = ['received', 'preparing', 'delivery', 'delivered'];
  //   let currentIndex = 0;

  //   const interval = setInterval(() => {
  //     currentIndex++;
  //     if (currentIndex < statuses.length) {
  //       setStatus(statuses[currentIndex]);
  //     } else {
  //       clearInterval(interval);
  //     }
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, []);

  const currentStatus = statusData[status];
  const StatusIcon = currentStatus.icon;

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-10 bg-white border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-primary">Rastreamento</h1>
              <p className="text-sm text-muted-foreground">Pedido {orderNumber}</p>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 space-y-8">
          <Card className="p-6 text-center space-y-4">
            <div className={`mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center ${currentStatus.color} animate-pulse-glow`}>
              <StatusIcon className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-bold">{currentStatus.label}</h2>
            <Progress value={currentStatus.progress} className="h-3" />
          </Card>

          <div className="space-y-4">
            {Object.entries(statusData).map(([key, data]) => {
              const Icon = data.icon;
              const isActive = status === key;
              const isPast = Object.keys(statusData).indexOf(key) < Object.keys(statusData).indexOf(status);
              
              return (
                <Card 
                  key={key} 
                  className={`p-4 flex items-center gap-4 transition-all ${
                    isActive ? 'card-elevated scale-105' : isPast ? 'opacity-60' : 'opacity-40'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center ${
                    isActive || isPast ? data.color : 'text-muted-foreground'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">{data.label}</h3>
                    {isActive && <p className="text-sm text-muted-foreground">Em andamento...</p>}
                    {isPast && <p className="text-sm text-green-500">Concluído ✓</p>}
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="p-4 bg-muted/50">
            <p className="text-sm text-center text-muted-foreground">
              Tempo estimado de entrega: <span className="font-bold text-foreground">30-40 minutos</span>
            </p>
          </Card>

          <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
            Voltar ao Início
          </Button>
        </div>
      </div>
      <BottomNavigation />
    </>
  );
}
