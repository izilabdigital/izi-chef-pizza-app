import { Home, Pizza, ShoppingCart, Package } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useCart();
  const { isAuthenticated } = useAuth();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { icon: Home, label: 'Início', path: '/' },
    { icon: Pizza, label: 'Cardápio', path: '/menu' },
    { icon: ShoppingCart, label: 'Carrinho', path: '/cart', badge: itemCount },
    { icon: Package, label: 'Pedidos', path: isAuthenticated ? '/meus-pedidos' : '/login' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 gap-2 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <Icon className="h-6 w-6" />
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
