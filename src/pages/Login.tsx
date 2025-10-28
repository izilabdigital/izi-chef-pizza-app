import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOTP = () => {
    if (phone.length < 10) {
      toast({
        title: 'Telefone inválido',
        description: 'Digite um número válido com DDD',
        variant: 'destructive'
      });
      return;
    }
    
    // Simular envio de OTP
    toast({
      title: 'Código enviado!',
      description: 'Digite o código 123456 para continuar'
    });
    setStep('otp');
  };

  const handleVerifyOTP = () => {
    // Simular verificação (código fixo: 123456)
    if (otp === '123456') {
      login(phone);
      toast({
        title: 'Login realizado!',
        description: 'Bem-vindo de volta'
      });
      navigate('/meus-pedidos');
    } else {
      toast({
        title: 'Código inválido',
        description: 'Tente novamente',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-10 glass-effect border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Acompanhar Pedido</h1>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="p-6 space-y-6">
            {step === 'phone' ? (
              <>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <Phone className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Digite seu telefone</h2>
                  <p className="text-muted-foreground">
                    Enviaremos um código para verificação
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    type="tel"
                    placeholder="(14) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    maxLength={11}
                  />
                  <Button onClick={handleSendOTP} className="w-full">
                    Enviar Código
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/')} 
                    className="w-full"
                  >
                    Pular Login
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Digite o código</h2>
                  <p className="text-muted-foreground">
                    Enviamos para {phone}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    (Use o código: <strong>123456</strong>)
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-center">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <Button 
                    onClick={handleVerifyOTP} 
                    className="w-full"
                    disabled={otp.length !== 6}
                  >
                    Verificar
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setStep('phone')} 
                    className="w-full"
                  >
                    Voltar
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
      <BottomNavigation />
    </>
  );
}
