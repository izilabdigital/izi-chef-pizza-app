import { useState, useEffect } from 'react';
import { ArrowLeft, User, MapPin, Clock, Heart, Settings, LogOut, Search, Edit, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BottomNavigation from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCEP } from '@/hooks/useCEP';
import { toast } from 'sonner';

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  imagem_url: string;
  categoria: string;
  tamanhos: Array<{ tamanho: string; preco: number }>;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  const { searchCEP, loading: cepLoading } = useCEP();
  
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [showFavoritesDialog, setShowFavoritesDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [favoritos, setFavoritos] = useState<Produto[]>([]);
  
  const [addressForm, setAddressForm] = useState({
    cep: '',
    estado: '',
    bairro: '',
    rua: '',
    numero: '',
    complemento: ''
  });

  useEffect(() => {
    if (profile) {
      setAddressForm({
        cep: profile.cep || '',
        estado: profile.estado || '',
        bairro: profile.bairro || '',
        rua: profile.rua || '',
        numero: profile.numero || '',
        complemento: profile.complemento || ''
      });
    }
  }, [profile]);

  const loadFavoritos = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favoritos')
        .select('produto_id, produtos(*)')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const produtos = (data as any)?.map((fav: any) => fav.produtos).filter(Boolean) || [];
      setFavoritos(produtos);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

  const handleSearchCEP = async () => {
    if (!addressForm.cep) {
      toast.error('Digite um CEP');
      return;
    }
    
    const data = await searchCEP(addressForm.cep);
    if (data) {
      setAddressForm(prev => ({
        ...prev,
        estado: data.uf,
        bairro: data.bairro,
        rua: data.logradouro
      }));
    }
  };

  const handleSaveAddress = async () => {
    if (!user || !addressForm.cep || !addressForm.estado || !addressForm.bairro || 
        !addressForm.rua || !addressForm.numero) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(addressForm)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Endereço salvo com sucesso!');
      setEditingAddress(false);
      setShowAddressDialog(false);
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      toast.error('Erro ao salvar endereço');
    }
  };

  const handleRemoveFavorito = async (produtoId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favoritos')
        .delete()
        .eq('user_id', user.id)
        .eq('produto_id', produtoId);

      if (error) throw error;

      toast.success('Removido dos favoritos');
      loadFavoritos();
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      toast.error('Erro ao remover favorito');
    }
  };

  const menuItems = [
    { icon: User, label: 'Meus Dados', action: () => navigate('/login') },
    { 
      icon: MapPin, 
      label: 'Endereços', 
      action: () => {
        setShowAddressDialog(true);
        setEditingAddress(false);
      }
    },
    { icon: Clock, label: 'Histórico de Pedidos', action: () => navigate('/meus-pedidos') },
    { 
      icon: Heart, 
      label: 'Favoritos', 
      action: () => {
        loadFavoritos();
        setShowFavoritesDialog(true);
      }
    },
    { icon: Settings, label: 'Configurações', action: () => {} }
  ];

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
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
                {profile?.nome ? profile.nome.substring(0, 2).toUpperCase() : 'IZ'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{profile?.nome || 'Visitante'}</h2>
              <p className="text-muted-foreground">
                {isAuthenticated 
                  ? profile?.telefone || 'Perfil completo' 
                  : 'Faça login para acessar todos os recursos'}
              </p>
            </div>
            {!isAuthenticated && (
              <Button variant="gold" className="w-full" onClick={() => navigate('/login')}>
                Entrar / Cadastrar
              </Button>
            )}
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

          {isAuthenticated && (
            <Button 
              variant="ghost" 
              className="w-full text-destructive"
              onClick={() => {
                supabase.auth.signOut();
                toast.success('Logout realizado com sucesso');
                navigate('/');
              }}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sair
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Meu Endereço</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="cep">CEP *</Label>
                <Input 
                  id="cep" 
                  value={addressForm.cep}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, cep: e.target.value }))}
                  placeholder="00000-000"
                  maxLength={9}
                  disabled={!editingAddress}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  type="button" 
                  onClick={handleSearchCEP}
                  disabled={cepLoading || !editingAddress}
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
                  value={addressForm.estado}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, estado: e.target.value }))}
                  placeholder="SP"
                  maxLength={2}
                  disabled={!editingAddress}
                />
              </div>
              <div>
                <Label htmlFor="bairro">Bairro *</Label>
                <Input 
                  id="bairro" 
                  value={addressForm.bairro}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, bairro: e.target.value }))}
                  placeholder="Centro"
                  disabled={!editingAddress}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="rua">Rua *</Label>
              <Input 
                id="rua" 
                value={addressForm.rua}
                onChange={(e) => setAddressForm(prev => ({ ...prev, rua: e.target.value }))}
                placeholder="Rua das Flores"
                disabled={!editingAddress}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="numero">Número *</Label>
                <Input 
                  id="numero" 
                  value={addressForm.numero}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, numero: e.target.value }))}
                  placeholder="123"
                  disabled={!editingAddress}
                />
              </div>
              <div>
                <Label htmlFor="complemento">Complemento</Label>
                <Input 
                  id="complemento" 
                  value={addressForm.complemento}
                  onChange={(e) => setAddressForm(prev => ({ ...prev, complemento: e.target.value }))}
                  placeholder="Apto 45"
                  disabled={!editingAddress}
                />
              </div>
            </div>

            <div className="flex gap-2">
              {!editingAddress ? (
                <Button 
                  variant="gold" 
                  className="flex-1"
                  onClick={() => setEditingAddress(true)}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setEditingAddress(false);
                      if (profile) {
                        setAddressForm({
                          cep: profile.cep || '',
                          estado: profile.estado || '',
                          bairro: profile.bairro || '',
                          rua: profile.rua || '',
                          numero: profile.numero || '',
                          complemento: profile.complemento || ''
                        });
                      }
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button 
                    variant="gold" 
                    className="flex-1"
                    onClick={handleSaveAddress}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFavoritesDialog} onOpenChange={setShowFavoritesDialog}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Meus Favoritos</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {favoritos.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum favorito ainda</p>
              </div>
            ) : (
              favoritos.map((produto) => (
                <Card key={produto.id} className="p-4">
                  <div className="flex gap-4">
                    <img 
                      src={produto.imagem_url} 
                      alt={produto.nome} 
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold">{produto.nome}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {produto.descricao}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-destructive"
                        onClick={() => handleRemoveFavorito(produto.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </>
  );
}
