import { useNavigate } from 'react-router-dom';
import { Pizza, Star, ShoppingBag, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import logo from '@/assets/logoizichefe.png';
import heroPizza from '@/assets/hero-pizza.jpg';
import BottomNavigation from '@/components/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

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

export default function Index() {
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
    
    addItem({
      id: selectedProduct.id,
      name: selectedProduct.nome,
      description: selectedProduct.descricao,
      price: finalPrice,
      image: selectedProduct.imagem_url || heroPizza,
      category: selectedProduct.categoria as any,
      quantity: 1,
      size,
      observations: observations || undefined
    });
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

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
          <div className="absolute inset-0">
            <img src={heroPizza} alt="Pizza Gourmet" className="w-full h-full object-cover" />
            <div className="absolute inset-0 gradient-overlay" />
          </div>
          <div className="relative h-full flex flex-col items-center justify-center text-center px-4 z-10">
            <img src={logo} alt="Logo" className="mx-auto w-24 animate-fade-in-up" style={{ animationDelay: "0.1s" }}/>
            <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              A Qualidade de um Chefe, a Facilidade do Izi
            </p>
            <Button 
              variant="gold" 
              size="lg" 
              className="animate-scale-in" 
              style={{ animationDelay: "0.2s" }}
              onClick={() => navigate('/menu')}
            >
              🍕 PEDIR AGORA
            </Button>
          </div>
        </section>

        {/* Quick Actions */}
        <div className="container mx-auto px-4 -mt-8 relative z-10">
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/menu')}>
              <Pizza className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Cardápio</p>
            </Card>
            <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Promoções</p>
            </Card>
            <Card className="p-4 text-center hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/meus-pedidos')}>
              <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Pedidos</p>
            </Card>
          </div>
        </div>

        {/* Products by Category */}
        <div className="container mx-auto px-4 py-4 space-y-8">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          ) : (
            <>
              {['Pizza', 'Bebida', 'Combo', 'Sobremesa'].map(category => {
                const categoryProducts = getProductsByCategory(category);
                if (categoryProducts.length === 0) return null;

                return (
                  <div key={category}>
                    <h2 className="text-2xl font-bold text-foreground mb-4">{category}s</h2>
                    <div className="space-y-4">
                      {categoryProducts.map(product => (
                        <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                    </div>
                  </div>
                );
              })}
            </>
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
