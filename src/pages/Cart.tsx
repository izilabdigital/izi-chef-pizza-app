import { useState } from 'react';
import { ArrowLeft, Minus, Plus, Trash2, MessageCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { useCEP } from '@/hooks/useCEP';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const { searchCEP, loading: cepLoading } = useCEP();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cep, setCep] = useState('');
  const [estado, setEstado] = useState('');
  const [bairro, setBairro] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cupom, setCupom] = useState('');
  const [desconto, setDesconto] = useState(0);
  const [cupomAplicado, setCupomAplicado] = useState(false);
  
  const deliveryFee = 8.00;
  const subtotal = total;
  const finalTotal = subtotal + deliveryFee - desconto;

  const handleSearchCEP = async () => {
    if (!cep) {
      toast.error('Digite um CEP');
      return;
    }
    
    const data = await searchCEP(cep);
    if (data) {
      setEstado(data.uf);
      setBairro(data.bairro);
      setRua(data.logradouro);
    }
  };

  const handleAplicarCupom = async () => {
    if (!cupom) {
      toast.error('Digite um cupom');
      return;
    }

    if (cupomAplicado) {
      toast.error('Cupom já aplicado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cupons')
        .select('*')
        .eq('codigo', cupom.toUpperCase())
        .eq('ativo', true)
        .single();

      if (error || !data) {
        toast.error('Cupom inválido');
        return;
      }

      // Verificar validade
      if (data.validade && new Date(data.validade) < new Date()) {
        toast.error('Cupom expirado');
        return;
      }

      // Verificar usos
      if (data.usos_maximos && data.usos_atuais >= data.usos_maximos) {
        toast.error('Cupom esgotado');
        return;
      }

      // Verificar valor mínimo
      if (data.minimo_pedido && subtotal < data.minimo_pedido) {
        toast.error(`Pedido mínimo de R$ ${data.minimo_pedido.toFixed(2)} para este cupom`);
        return;
      }

      // Calcular desconto
      let valorDesconto = 0;
      if (data.tipo === 'percentual') {
        valorDesconto = (subtotal * data.valor) / 100;
      } else {
        valorDesconto = data.valor;
      }

      setDesconto(valorDesconto);
      setCupomAplicado(true);
      toast.success(`Cupom aplicado! Desconto de R$ ${valorDesconto.toFixed(2)}`);
    } catch (error) {
      toast.error('Erro ao validar cupom');
    }
  };

  const handleFinishOrder = async () => {
    if (!customerName || !customerPhone || !cep || !estado || !bairro || !rua || !numero || !paymentMethod) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      // Gerar número do pedido
      const { data: orderData, error: orderError } = await supabase
        .rpc('generate_order_number');

      if (orderError) throw orderError;
      
      const orderNumber = orderData;

      // Salvar pedido no Supabase
      const { error: insertError } = await supabase
        .from('pedidos')
        .insert({
          numero_pedido: orderNumber,
          nome: customerName,
          telefone: customerPhone,
          cep,
          estado,
          bairro,
          rua,
          numero,
          complemento,
          forma_pagamento: paymentMethod,
          cupom: cupomAplicado ? cupom.toUpperCase() : null,
          desconto,
          itens: items,
          subtotal,
          taxa_entrega: deliveryFee,
          total: finalTotal,
          status: 'pendente'
        });

      if (insertError) throw insertError;

      // Atualizar uso do cupom se aplicado
      if (cupomAplicado) {
        await supabase.rpc('increment_cupom_uso', { cupom_code: cupom.toUpperCase() });
      }

      // Preparar mensagem WhatsApp
      const endereco = `${rua}, ${numero}${complemento ? ` - ${complemento}` : ''}, ${bairro}, ${estado} - CEP: ${cep}`;
      
      const orderText = `🍕 *NOVO PEDIDO - IZI CHEFE*\n` +
        `*Pedido:* ${orderNumber}\n\n` +
        `*Cliente:* ${customerName}\n` +
        `*Telefone:* ${customerPhone}\n` +
        `*Endereço:* ${endereco}\n` +
        `*Pagamento:* ${paymentMethod}\n\n` +
        `*ITENS:*\n` +
        items.map(item => 
          `${item.quantity}x ${item.name} (${item.size})\n` +
          `   R$ ${(item.price * item.quantity).toFixed(2)}` +
          (item.observations ? `\n   Obs: ${item.observations}` : '')
        ).join('\n\n') +
        `\n\n*Subtotal:* R$ ${subtotal.toFixed(2)}\n` +
        `*Taxa de Entrega:* R$ ${deliveryFee.toFixed(2)}\n` +
        (desconto > 0 ? `*Desconto (${cupom}):* -R$ ${desconto.toFixed(2)}\n` : '') +
        `*TOTAL:* R$ ${finalTotal.toFixed(2)}`;

      const whatsappNumber = '5514991710935';
      const encodedText = encodeURIComponent(orderText);
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;
      
      window.open(whatsappUrl, '_blank');
      clearCart();
      toast.success('Pedido enviado! Aguarde o contato.');
      navigate('/order-tracking', { state: { orderNumber } });
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      toast.error('Erro ao processar pedido. Tente novamente.');
    }
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
          <h3 className="font-bold text-lg">Dados do Cliente</h3>
          
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
              placeholder="(14) 99999-9999"
            />
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-bold text-lg">Endereço de Entrega</h3>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="cep">CEP *</Label>
              <Input 
                id="cep" 
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>
            <div className="flex items-end">
              <Button 
                type="button" 
                onClick={handleSearchCEP}
                disabled={cepLoading}
                variant="outline"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estado">Estado *</Label>
              <Input 
                id="estado" 
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                placeholder="SP"
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="bairro">Bairro *</Label>
              <Input 
                id="bairro" 
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Centro"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="rua">Rua *</Label>
            <Input 
              id="rua" 
              value={rua}
              onChange={(e) => setRua(e.target.value)}
              placeholder="Rua das Flores"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numero">Número *</Label>
              <Input 
                id="numero" 
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="123"
              />
            </div>
            <div>
              <Label htmlFor="complemento">Complemento</Label>
              <Input 
                id="complemento" 
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
                placeholder="Apto 45"
              />
            </div>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-bold text-lg">Pagamento</h3>
          
          <div>
            <Label htmlFor="payment">Forma de Pagamento *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="debito">Cartão de Débito</SelectItem>
                <SelectItem value="credito">Cartão de Crédito</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h3 className="font-bold text-lg">Cupom de Desconto</h3>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <Input 
                value={cupom}
                onChange={(e) => setCupom(e.target.value.toUpperCase())}
                placeholder="Digite o cupom"
                disabled={cupomAplicado}
              />
            </div>
            <Button 
              type="button" 
              onClick={handleAplicarCupom}
              disabled={cupomAplicado}
              variant="outline"
            >
              Aplicar
            </Button>
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Taxa de Entrega</span>
            <span>R$ {deliveryFee.toFixed(2)}</span>
          </div>
          {desconto > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Desconto ({cupom})</span>
              <span>-R$ {desconto.toFixed(2)}</span>
            </div>
          )}
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
