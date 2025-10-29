import { useState } from 'react';
import { ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { products } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { Product, CartItem } from '@/types/product';
import { toast } from 'sonner';
import BottomNavigation from '@/components/BottomNavigation';

export default function Menu() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [size, setSize] = useState<'P' | 'M' | 'G' | 'GG'>('M');
  const [observations, setObservations] = useState('');

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    const cartItem: CartItem = {
      ...selectedProduct,
      quantity: 1,
      size,
      observations: observations || undefined
    };
    
    addItem(cartItem);
    toast.success('Pizza adicionada ao carrinho! 🍕');
    setSelectedProduct(null);
    setObservations('');
    setSize('M');
  };

  const getSizePrice = (basePrice: number) => {
    const multipliers = { P: 0.7, M: 1, G: 1.3, GG: 1.6 };
    return (basePrice * multipliers[size]).toFixed(2);
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-10 bg-white border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Cardápio</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="classicas" className="w-full">
          <TabsList className="w-full sticky top-0 z-10 grid grid-cols-3 mb-6">
            <TabsTrigger value="classicas">Clássicas</TabsTrigger>
            <TabsTrigger value="especiais">Especiais</TabsTrigger>
            <TabsTrigger value="doces">Doces</TabsTrigger>
          </TabsList>

          {['classicas', 'especiais', 'doces'].map(category => (
            <TabsContent key={category} value={category} className="space-y-4">
              {products.filter(p => p.category === category).map(product => (
                <Card key={product.id} className="overflow-hidden card-elevated hover:scale-[1.02] transition-transform">
                  <div className="flex gap-4 p-4">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-bold text-lg">
                          R$ {product.price.toFixed(2)}
                        </span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => navigate('/customize-pizza', { state: { product } })}
                          >
                            Personalizar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="gold"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">Tamanho</Label>
              <div className="grid grid-cols-4 gap-2">
                {(['P', 'M', 'G', 'GG'] as const).map(s => (
                  <Button
                    key={s}
                    variant={size === s ? 'default' : 'outline'}
                    onClick={() => setSize(s)}
                    className="w-full"
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                placeholder="Ex: Sem cebola, bem passada..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-xl font-bold text-primary">
                R$ {selectedProduct && getSizePrice(selectedProduct.price)}
              </span>
              <Button variant="gold" onClick={handleAddToCart}>
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    <BottomNavigation />
  </>
  );
}
