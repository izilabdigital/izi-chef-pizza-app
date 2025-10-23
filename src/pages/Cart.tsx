import { useState } from 'react';
import { ArrowLeft, Minus, Plus, Trash2, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  const deliveryFee = 8.00;
  const finalTotal = total + deliveryFee;

  const handleFinishOrder = () => {
    if (!customerName || !customerPhone || !deliveryAddress || !paymentMethod) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const orderText = `🍕 *NOVO PEDIDO - IZI CHEFE*\n\n` +
      `*Cliente:* ${customerName}\n` +
      `*Telefone:* ${customerPhone}\n` +
      `*Endereço:* ${deliveryAddress}\n` +
      `*Pagamento:* ${paymentMethod}\n\n` +
      `*ITENS:*\n` +
      items.map(item => 
        `${item.quantity}x ${item.name} (${item.size})\n` +
        `   R$ ${(item.price * item.quantity).toFixed(2)}` +
        (item.observations ? `\n   Obs: ${item.observations}` : '')
      ).join('\n\n') +
      `\n\n*Subtotal:* R$ ${total.toFixed(2)}\n` +
      `*Taxa de Entrega:* R$ ${deliveryFee.toFixed(2)}\n` +
      `*TOTAL:* R$ ${finalTotal.toFixed(2)}`;

    const whatsappNumber = '5511999999999'; // Substitua pelo número da pizzaria
    const encodedText = encodeURIComponent(orderText);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
    clearCart();
    toast.success('Pedido enviado! Aguarde o contato.');
    navigate('/order-tracking');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <p className="text-6xl mb-4">🍕</p>
          <h2 className="text-2xl font-bold mb-2">Carrinho Vazio</h2>
          <p className="text-muted-foreground mb-6">Adicione pizzas deliciosas ao seu carrinho!</p>
          <Button variant="gold" onClick={() => navigate('/menu')}>
            Ver Cardápio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 glass-effect border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-primary">Carrinho</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="space-y-4">
          {items.map(item => (
            <Card key={`${item.id}-${item.size}`} className="p-4">
              <div className="flex gap-4">
                <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                <div className="flex-1">
                  <h3 className="font-bold">{item.name} ({item.size})</h3>
                  <p className="text-sm text-muted-foreground">{item.observations}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => removeItem(item.id, item.size)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <p className="text-primary font-bold mt-2">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-4 space-y-4">
          <h3 className="font-bold text-lg">Dados do Pedido</h3>
          
          <div>
            <Label htmlFor="name">Nome Completo *</Label>
            <Input 
              id="name" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone *</Label>
            <Input 
              id="phone" 
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <Label htmlFor="address">Endereço de Entrega *</Label>
            <Textarea
              id="address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Rua, número, bairro, complemento..."
            />
          </div>

          <div>
            <Label htmlFor="payment">Forma de Pagamento *</Label>
            <Input
              id="payment"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="Pix, Dinheiro, Cartão..."
            />
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxa de Entrega</span>
            <span>R$ {deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold text-primary border-t pt-2">
            <span>Total</span>
            <span>R$ {finalTotal.toFixed(2)}</span>
          </div>
        </Card>

        <Button 
          variant="gold" 
          size="lg" 
          className="w-full"
          onClick={handleFinishOrder}
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Finalizar Pedido via WhatsApp
        </Button>
      </div>
    </div>
  );
}
