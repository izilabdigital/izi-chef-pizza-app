import { ArrowLeft, User, MapPin, Clock, Heart, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Profile() {
  const navigate = useNavigate();

  const menuItems = [
    { icon: User, label: 'Meus Dados', action: () => {} },
    { icon: MapPin, label: 'Endereços', action: () => {} },
    { icon: Clock, label: 'Histórico de Pedidos', action: () => {} },
    { icon: Heart, label: 'Favoritos', action: () => {} },
    { icon: Settings, label: 'Configurações', action: () => {} }
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 glass-effect border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Perfil</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card className="p-6 text-center space-y-4">
          <Avatar className="w-24 h-24 mx-auto">
            <AvatarFallback className="text-2xl gradient-hero text-primary-foreground">
              IZ
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">Visitante</h2>
            <p className="text-muted-foreground">Faça login para acessar todos os recursos</p>
          </div>
          <Button variant="gold" className="w-full">
            Entrar / Cadastrar
          </Button>
        </Card>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.label}
                className="p-4 flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={item.action}
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="flex-1 font-semibold">{item.label}</span>
                <ArrowLeft className="h-5 w-5 rotate-180 text-muted-foreground" />
              </Card>
            );
          })}
        </div>

        <Card className="p-4">
          <h3 className="font-bold mb-3">Diferenciais Izi Chefe</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span>🚀</span>
              <span>Entrega Rápida em até 40 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <span>👨‍🍳</span>
              <span>Receitas Autorais do Chef</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🌿</span>
              <span>Ingredientes Frescos e Selecionados</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💛</span>
              <span>Atendimento Izi e Personalizado</span>
            </div>
          </div>
        </Card>

        <Button variant="ghost" className="w-full text-destructive">
          <LogOut className="mr-2 h-5 w-5" />
          Sair
        </Button>
      </div>
    </div>
  );
}
