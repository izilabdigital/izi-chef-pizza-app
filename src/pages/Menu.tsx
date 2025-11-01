import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, ChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { CartItem } from '@/types/product';
import { toast } from 'sonner';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';
import heroPizza from '@/assets/hero-pizza.jpg';

interface ProductSize {
  tamanho: string;
  preco: number;
}

interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagem_url: string;
  ingredientes: string[];
  disponivel: boolean;
  tamanhos: ProductSize[];
}

export default function Menu() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [size, setSize] = useState<'P' | 'M' | 'G' | 'GG'>('M');
  const [observations, setObservations] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('produtos')
        .select('id, nome, descricao, preco, categoria, imagem_url, ingredientes, disponivel, tamanhos')
        .eq('disponivel', true)
        .order('categoria', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      
      const mappedProducts: Product[] = (data || []).map((p: any) => ({
        id: p.id,
        nome: p.nome || '',
        descricao: p.descricao || '',
        preco: Number(p.preco) || 0,
        categoria: p.categoria || '',
        imagem_url: p.imagem_url || '',
        ingredientes: Array.isArray(p.ingredientes) ? p.ingredientes : [],
        disponivel: p.disponivel,
        tamanhos: Array.isArray(p.tamanhos) ? p.tamanhos : []
      }));
      
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const getProductsByCategory = (category: string) => {
    return products.filter(p => p.categoria.toLowerCase() === category.toLowerCase());
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    const selectedSize = selectedProduct.tamanhos.find(t => t.tamanho === size);
    const finalPrice = selectedSize ? selectedSize.preco : selectedProduct.preco;
    
    const cartItem: CartItem = {
      id: selectedProduct.id,
      name: selectedProduct.nome,
      description: selectedProduct.descricao,
      price: finalPrice,
      image: selectedProduct.imagem_url || heroPizza,
      category: selectedProduct.categoria as any,
      quantity: 1,
      size,
      observations: observations || undefined
    };
    
    addItem(cartItem);
    toast.success('Produto adicionado ao carrinho! 🍕');
    setSelectedProduct(null);
    setObservations('');
    setSize('M');
  };

  const getSizePrice = (product: Product, selectedSize: string) => {
    const sizeData = product.tamanhos.find(t => t.tamanho === selectedSize);
    return sizeData ? sizeData.preco.toFixed(2) : product.preco.toFixed(2);
  };

  const isSizeAvailable = (product: Product, selectedSize: string) => {
    return product.tamanhos.some(t => t.tamanho === selectedSize);
  };

  const categories = [
    { value: 'pizza', label: 'Pizzas' },
    { value: 'bebida', label: 'Bebidas' },
    { value: 'combo', label: 'Combos' },
    { value: 'sobremesa', label: 'Sobremesas' }
  ];

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
        {/* Botão Monte sua Pizza */}
        <div className="mb-6">
          <Button 
            variant="hero" 
            size="lg" 
            className="w-full"
            onClick={() => navigate('/customize-pizza')}
          >
            <ChefHat className="h-5 w-5 mr-2" />
            Monte sua Pizza
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : (
          <Tabs defaultValue="pizza" className="w-full">
            <TabsList className="w-full sticky top-20 z-10 grid grid-cols-4 mb-6">
              {categories.map(cat => (
                <TabsTrigger key={cat.value} value={cat.value}>
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category.value} value={category.value} className="space-y-4">
                {getProductsByCategory(category.value).map(product => (
                  <Card key={product.id} className="overflow-hidden card-elevated hover:scale-[1.02] transition-transform">
                    <div className="flex gap-4 p-4">
                      <img 
                        src={product.imagem_url || heroPizza} 
                        alt={product.nome}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground">{product.nome}</h3>
                        <p className="text-sm text-muted-foreground mb-1">{product.descricao}</p>
                        {product.ingredientes && product.ingredientes.length > 0 && (
                          <p className="text-xs text-muted-foreground mb-2">
                            <span className="font-semibold">Ingredientes:</span> {product.ingredientes.join(', ')}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-primary font-bold text-lg">
                            R$ {product.preco.toFixed(2)}
                          </span>
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
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.nome}</DialogTitle>
          </DialogHeader>
          
            <div className="space-y-4 py-4">
              <div>
                <Label className="mb-2 block">Tamanho</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(['P', 'M', 'G', 'GG'] as const).map(s => {
                    const available = selectedProduct ? isSizeAvailable(selectedProduct, s) : false;
                    return (
                      <Button
                        key={s}
                        variant={size === s ? 'default' : 'outline'}
                        onClick={() => setSize(s)}
                        disabled={!available}
                        className="w-full"
                      >
                        {s}
                      </Button>
                    );
                  })}
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
                  R$ {selectedProduct && getSizePrice(selectedProduct, size)}
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
