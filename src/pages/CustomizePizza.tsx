import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { products } from '@/data/products';
import { borderOptions, extraOptions, sauceOptions } from '@/data/customization-options';
import { PizzaFlavor, CustomPizza, BorderOption, ExtraOption } from '@/types/pizza-customization';
import PizzaVisualizer from '@/components/PizzaVisualizer';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Product, CartItem } from '@/types/product';

export default function CustomizePizza() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useCart();
  
  const baseProduct = location.state?.product as Product;
  
  const [step, setStep] = useState(1);
  const [size, setSize] = useState<'P' | 'M' | 'G' | 'GG'>('M');
  const [selectedFlavors, setSelectedFlavors] = useState<PizzaFlavor[]>([]);
  const [selectedBorder, setSelectedBorder] = useState<BorderOption>(borderOptions[0]);
  const [selectedExtras, setSelectedExtras] = useState<ExtraOption[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<ExtraOption[]>([sauceOptions[0]]);
  const [observations, setObservations] = useState('');

  const maxFlavors = size === 'P' ? 2 : size === 'M' ? 2 : size === 'G' ? 3 : 4;
  
  const availableFlavors = products.filter(p => p.category !== 'doces');

  const getSizeMultiplier = () => {
    const multipliers = { P: 0.7, M: 1, G: 1.3, GG: 1.6 };
    return multipliers[size];
  };

  const calculatePrice = () => {
    let basePrice = 0;
    
    if (selectedFlavors.length === 0) {
      basePrice = 0;
    } else if (selectedFlavors.length === 1) {
      basePrice = selectedFlavors[0].price;
    } else {
      // Calcula média dos preços dos sabores
      const sum = selectedFlavors.reduce((acc, f) => acc + f.price, 0);
      basePrice = sum / selectedFlavors.length;
    }

    const sizePrice = basePrice * getSizeMultiplier();
    const borderPrice = selectedBorder.price;
    const extrasPrice = selectedExtras.reduce((sum, e) => sum + e.price, 0);
    const saucesPrice = selectedSauces.reduce((sum, s) => sum + s.price, 0);

    return sizePrice + borderPrice + extrasPrice + saucesPrice;
  };

  const toggleFlavor = (product: Product) => {
    const existing = selectedFlavors.find(f => f.id === product.id);
    
    if (existing) {
      setSelectedFlavors(prev => prev.filter(f => f.id !== product.id));
    } else {
      if (selectedFlavors.length >= maxFlavors) {
        toast.error(`Máximo de ${maxFlavors} sabores para este tamanho`);
        return;
      }
      
      const fraction = 1 / (selectedFlavors.length + 1);
      const newFlavor: PizzaFlavor = {
        id: product.id,
        name: product.name,
        price: product.price,
        fraction
      };
      
      setSelectedFlavors(prev => {
        const updated = [...prev, newFlavor];
        const newFraction = 1 / updated.length;
        return updated.map(f => ({ ...f, fraction: newFraction }));
      });
    }
  };

  const toggleExtra = (extra: ExtraOption) => {
    const existing = selectedExtras.find(e => e.id === extra.id);
    if (existing) {
      setSelectedExtras(prev => prev.filter(e => e.id !== extra.id));
    } else {
      setSelectedExtras(prev => [...prev, extra]);
    }
  };

  const toggleSauce = (sauce: ExtraOption) => {
    const existing = selectedSauces.find(s => s.id === sauce.id);
    if (existing) {
      setSelectedSauces(prev => prev.filter(s => s.id !== sauce.id));
    } else {
      setSelectedSauces(prev => [...prev, sauce]);
    }
  };

  const handleAddToCart = () => {
    if (selectedFlavors.length === 0) {
      toast.error('Escolha pelo menos 1 sabor');
      return;
    }

    const customPizzaDescription = `${selectedFlavors.map(f => f.name).join(' + ')}` +
      (selectedBorder.id !== 'none' ? ` | ${selectedBorder.name}` : '') +
      (selectedExtras.length > 0 ? ` | Extras: ${selectedExtras.map(e => e.name).join(', ')}` : '');

    const cartItem: CartItem = {
      id: `custom-${Date.now()}`,
      name: 'Pizza Personalizada',
      description: customPizzaDescription,
      price: calculatePrice(),
      image: selectedFlavors[0]?.id ? products.find(p => p.id === selectedFlavors[0].id)?.image || baseProduct?.image || '' : baseProduct?.image || '',
      category: 'especiais',
      quantity: 1,
      size,
      observations,
      extras: [
        ...selectedExtras.map(e => e.name),
        ...selectedSauces.filter(s => s.id !== 'tomato').map(s => s.name)
      ]
    };

    addItem(cartItem);
    toast.success('Pizza personalizada adicionada! 🍕');
    navigate('/menu');
  };

  const totalPrice = calculatePrice();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 glass-effect border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/menu')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-primary">Monte sua Pizza</h1>
              <p className="text-sm text-muted-foreground">Do Jeito Izi 🍕</p>
            </div>
          </div>
          <Badge variant="outline" className="text-lg font-bold">
            R$ {totalPrice.toFixed(2)}
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Pizza Visualizer */}
        <Card className="p-6">
          <PizzaVisualizer flavors={selectedFlavors} />
          {selectedFlavors.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">
              Escolha seus sabores abaixo
            </p>
          )}
        </Card>

        {/* Step 1: Tamanho */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">1</span>
            Escolha o Tamanho
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {(['P', 'M', 'G', 'GG'] as const).map(s => (
              <Button
                key={s}
                variant={size === s ? 'default' : 'outline'}
                onClick={() => {
                  setSize(s);
                  if (selectedFlavors.length > (s === 'P' ? 2 : s === 'M' ? 2 : s === 'G' ? 3 : 4)) {
                    setSelectedFlavors(prev => prev.slice(0, s === 'P' ? 2 : s === 'M' ? 2 : s === 'G' ? 3 : 4));
                  }
                }}
                className="w-full"
              >
                {s}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Até {maxFlavors} sabores neste tamanho
          </p>
        </Card>

        {/* Step 2: Sabores */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">2</span>
            Escolha os Sabores ({selectedFlavors.length}/{maxFlavors})
          </h3>
          <div className="grid gap-3">
            {availableFlavors.map(product => {
              const isSelected = selectedFlavors.some(f => f.id === product.id);
              return (
                <Card 
                  key={product.id} 
                  className={`p-3 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => toggleFlavor(product)}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-bold">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">R$ {product.price.toFixed(2)}</p>
                    </div>
                    {isSelected && (
                      <Check className="h-6 w-6 text-primary" />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Step 3: Borda */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">3</span>
            Escolha a Borda
          </h3>
          <div className="space-y-2">
            {borderOptions.map(border => (
              <Card
                key={border.id}
                className={`p-4 cursor-pointer transition-all ${selectedBorder.id === border.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedBorder(border)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedBorder.id === border.id && <Check className="h-5 w-5 text-primary" />}
                    <span className="font-medium">{border.name}</span>
                  </div>
                  <span className="font-bold text-primary">
                    {border.price > 0 ? `+R$ ${border.price.toFixed(2)}` : 'Grátis'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Step 4: Adicionais */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">4</span>
            Adicionais
          </h3>
          <div className="space-y-2">
            {extraOptions.map(extra => {
              const isSelected = selectedExtras.some(e => e.id === extra.id);
              return (
                <Card
                  key={extra.id}
                  className={`p-4 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => toggleExtra(extra)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isSelected && <Check className="h-5 w-5 text-primary" />}
                      <span className="font-medium">{extra.name}</span>
                    </div>
                    <span className="font-bold text-primary">+R$ {extra.price.toFixed(2)}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Step 5: Molhos */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">5</span>
            Molhos
          </h3>
          <div className="space-y-2">
            {sauceOptions.map(sauce => {
              const isSelected = selectedSauces.some(s => s.id === sauce.id);
              return (
                <Card
                  key={sauce.id}
                  className={`p-4 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => toggleSauce(sauce)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isSelected && <Check className="h-5 w-5 text-primary" />}
                      <span className="font-medium">{sauce.name}</span>
                    </div>
                    <span className="font-bold text-primary">
                      {sauce.price > 0 ? `+R$ ${sauce.price.toFixed(2)}` : 'Grátis'}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Step 6: Observações */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center">6</span>
            Observações
          </h3>
          <Textarea
            placeholder="Ex: sem cebola, bem passada, cortar em 8 pedaços..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          />
        </Card>

        {/* Resumo e Botão */}
        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-lg">Resumo do Pedido</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tamanho:</span>
              <span className="font-medium">{size}</span>
            </div>
            
            {selectedFlavors.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sabores:</span>
                <span className="font-medium text-right">{selectedFlavors.map(f => f.name).join(', ')}</span>
              </div>
            )}
            
            {selectedBorder.id !== 'none' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Borda:</span>
                <span className="font-medium">{selectedBorder.name}</span>
              </div>
            )}
            
            {selectedExtras.length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Extras:</span>
                <span className="font-medium text-right">{selectedExtras.map(e => e.name).join(', ')}</span>
              </div>
            )}

            {selectedSauces.filter(s => s.id !== 'tomato').length > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Molhos:</span>
                <span className="font-medium text-right">
                  {selectedSauces.filter(s => s.id !== 'tomato').map(s => s.name).join(', ')}
                </span>
              </div>
            )}
          </div>

          <div className="border-t pt-4 flex items-center justify-between">
            <span className="text-xl font-bold">Total</span>
            <span className="text-2xl font-bold text-primary">R$ {totalPrice.toFixed(2)}</span>
          </div>

          <Button 
            variant="gold" 
            size="lg" 
            className="w-full"
            onClick={handleAddToCart}
          >
            Adicionar ao Carrinho
          </Button>
        </Card>
      </div>
    </div>
  );
}
