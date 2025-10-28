import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/BottomNavigation';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  
  // Login fields
  const [loginTelefone, setLoginTelefone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup fields
  const [signupNome, setSignupNome] = useState('');
  const [signupTelefone, setSignupTelefone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/meus-pedidos');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loginTelefone.length < 10) {
      toast({
        title: 'Telefone inválido',
        description: 'Digite um número válido com DDD',
        variant: 'destructive'
      });
      return;
    }

    if (!loginPassword) {
      toast({
        title: 'Senha obrigatória',
        description: 'Digite sua senha',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(loginTelefone, loginPassword);
    setLoading(false);

    if (error) {
      toast({
        title: 'Erro ao fazer login',
        description: error.message || 'Telefone ou senha incorretos',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Login realizado!',
      description: 'Bem-vindo de volta'
    });
    navigate('/meus-pedidos');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupNome) {
      toast({
        title: 'Nome obrigatório',
        description: 'Digite seu nome',
        variant: 'destructive'
      });
      return;
    }

    if (signupTelefone.length < 10) {
      toast({
        title: 'Telefone inválido',
        description: 'Digite um número válido com DDD',
        variant: 'destructive'
      });
      return;
    }

    if (signupPassword.length < 6) {
      toast({
        title: 'Senha muito curta',
        description: 'A senha deve ter no mínimo 6 caracteres',
        variant: 'destructive'
      });
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: 'Senhas não conferem',
        description: 'Digite a mesma senha nos dois campos',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    // Usar telefone como email (formato: telefone@izi.com)
    const email = `${signupTelefone}@izi.com`;
    
    const { error } = await signUp(email, signupPassword, signupNome, signupTelefone);
    setLoading(false);

    if (error) {
      toast({
        title: 'Erro ao criar conta',
        description: error.message || 'Tente novamente',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Conta criada!',
      description: 'Você já pode fazer login'
    });
    
    // Mudar para modo login
    setMode('login');
    setLoginTelefone(signupTelefone);
  };

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-10 glass-effect border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">
              {mode === 'login' ? 'Entrar' : 'Criar Conta'}
            </h1>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-md">
          <Card className="p-6 space-y-6">
            {mode === 'login' ? (
              <>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Entrar</h2>
                  <p className="text-muted-foreground">
                    Acesse sua conta para acompanhar pedidos
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-telefone">Telefone</Label>
                    <Input
                      id="login-telefone"
                      type="tel"
                      placeholder="(14) 99999-9999"
                      value={loginTelefone}
                      onChange={(e) => setLoginTelefone(e.target.value.replace(/\D/g, ''))}
                      maxLength={11}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Digite sua senha"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>

                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={() => setMode('signup')} 
                    className="w-full"
                  >
                    Não tem conta? Criar conta
                  </Button>

                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => navigate('/')} 
                    className="w-full"
                  >
                    Pular Login
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Criar Conta</h2>
                  <p className="text-muted-foreground">
                    Cadastre-se para acompanhar seus pedidos
                  </p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-nome">Nome Completo</Label>
                    <Input
                      id="signup-nome"
                      type="text"
                      placeholder="Seu nome"
                      value={signupNome}
                      onChange={(e) => setSignupNome(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-telefone">Telefone</Label>
                    <Input
                      id="signup-telefone"
                      type="tel"
                      placeholder="(14) 99999-9999"
                      value={signupTelefone}
                      onChange={(e) => setSignupTelefone(e.target.value.replace(/\D/g, ''))}
                      maxLength={11}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirmar Senha</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Digite a senha novamente"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>

                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={() => setMode('login')} 
                    className="w-full"
                  >
                    Já tem conta? Entrar
                  </Button>
                </form>
              </>
            )}
          </Card>
        </div>
      </div>
      <BottomNavigation />
    </>
  );
}
