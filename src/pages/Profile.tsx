import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Edit, Heart, LogOut, Plus, Trash2, Package, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCEP } from '@/hooks/useCEP';
import BottomNavigation from '@/components/BottomNavigation';
import { format } from 'date-fns';

interface Produto {
  id: string;
  nome: string;
  descricao: string;
  imagem_url: string;
  categoria: string;
  tamanhos: { tamanho: string; preco: number }[];
}

interface Endereco {
  id: string;
  nome_endereco: string;
  cep: string;
  estado: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento?: string;
  is_principal: boolean;
}

interface Pedido {
  id: string;
  numero_pedido: string;
  created_at: string;
  itens: any[];
  total: number;
  status: string;
}

const statusColors: Record<string, string> = {
  pendente: 'bg-yellow-500',
  preparando: 'bg-orange-500',
  'saiu para entrega': 'bg-blue-500',
  entregue: 'bg-green-500',
  cancelado: 'bg-gray-500'
};

const statusLabels: Record<string, string> = {
  pendente: 'Pendente',
  preparando: 'Preparando',
  'saiu para entrega': 'Saiu para Entrega',
  entregue: 'Entregue',
  cancelado: 'Cancelado'
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, logout, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { searchCEP, loading: cepLoading } = useCEP();
  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [favoritos, setFavoritos] = useState<Produto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [editEnderecoDialog, setEditEnderecoDialog] = useState(false);
  const [enderecoEditando, setEnderecoEditando] = useState<Endereco | null>(null);
  
  // Address form state
  const [nomeEndereco, setNomeEndereco] = useState('');
  const [cep, setCep] = useState('');
  const [estado, setEstado] = useState('');
  const [bairro, setBairro] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [isPrincipal, setIsPrincipal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadEnderecos();
    loadFavoritos();
    loadPedidos();
  }, [user, isAuthenticated]);

  const loadEnderecos = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('enderecos')
        .select('*')
        .eq('user_id', user.id)
        .order('is_principal', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEnderecos(data || []);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPedidos = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPedidos((data as any) || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

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
    if (!cep) {
      toast({
        title: 'CEP vazio',
        description: 'Digite um CEP',
        variant: 'destructive'
      });
      return;
    }
    
    const data = await searchCEP(cep);
    if (data) {
      setEstado(data.uf);
      setBairro(data.bairro);
      setRua(data.logradouro);
    }
  };

  const handleOpenEditEndereco = (endereco?: Endereco) => {
    if (endereco) {
      setEnderecoEditando(endereco);
      setNomeEndereco(endereco.nome_endereco);
      setCep(endereco.cep);
      setEstado(endereco.estado);
      setBairro(endereco.bairro);
      setRua(endereco.rua);
      setNumero(endereco.numero);
      setComplemento(endereco.complemento || '');
      setIsPrincipal(endereco.is_principal);
    } else {
      setEnderecoEditando(null);
      setNomeEndereco('');
      setCep('');
      setEstado('');
      setBairro('');
      setRua('');
      setNumero('');
      setComplemento('');
      setIsPrincipal(false);
    }
    setEditEnderecoDialog(true);
  };

  const handleSaveEndereco = async () => {
    if (!user || !nomeEndereco || !cep || !estado || !bairro || !rua || !numero) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos do endereço',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Se marcar como principal, desmarcar outros
      if (isPrincipal) {
        await supabase
          .from('enderecos')
          .update({ is_principal: false })
          .eq('user_id', user.id);
      }

      const enderecoData = {
        user_id: user.id,
        nome_endereco: nomeEndereco,
        cep,
        estado,
        bairro,
        rua,
        numero,
        complemento,
        is_principal: isPrincipal
      };

      if (enderecoEditando) {
        const { error } = await supabase
          .from('enderecos')
          .update(enderecoData)
          .eq('id', enderecoEditando.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('enderecos')
          .insert(enderecoData);
        if (error) throw error;
      }

      toast({
        title: 'Endereço salvo',
        description: 'Seu endereço foi salvo com sucesso'
      });
      
      setEditEnderecoDialog(false);
      loadEnderecos();
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Tente novamente',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteEndereco = async (id: string) => {
    try {
      const { error } = await supabase
        .from('enderecos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Endereço removido',
        description: 'O endereço foi removido com sucesso'
      });

      loadEnderecos();
    } catch (error) {
      toast({
        title: 'Erro ao remover',
        description: 'Tente novamente',
        variant: 'destructive'
      });
    }
  };

  const handleCancelOrder = async (pedidoId: string, status: string) => {
    if (status !== 'pendente' && status !== 'preparando') {
      toast({
        title: 'Não é possível cancelar',
        description: 'Este pedido já está em andamento',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ status: 'cancelado' })
        .eq('id', pedidoId);

      if (error) throw error;

      toast({
        title: 'Pedido cancelado',
        description: 'Seu pedido foi cancelado com sucesso'
      });
      
      loadPedidos();
    } catch (error) {
      toast({
        title: 'Erro ao cancelar',
        description: 'Tente novamente',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center pb-24">
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
        <BottomNavigation />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
        <header className="sticky top-0 z-10 bg-white border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-primary">Meu Perfil</h1>
                <p className="text-sm text-muted-foreground">{profile?.nome || profile?.telefone}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Perfil</TabsTrigger>
              <TabsTrigger value="enderecos">Endereços</TabsTrigger>
              <TabsTrigger value="favoritos">
                <Heart className="h-4 w-4 mr-1" />
                Favoritos
              </TabsTrigger>
              <TabsTrigger value="pedidos">
                <Package className="h-4 w-4 mr-1" />
                Pedidos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">Informações Pessoais</h2>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    <strong>Nome:</strong> {profile?.nome}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Telefone:</strong> {profile?.telefone}
                  </p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="enderecos" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Meus Endereços</h2>
                <Button onClick={() => handleOpenEditEndereco()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              {enderecos.length > 0 ? (
                <div className="space-y-3">
                  {enderecos.map((endereco) => (
                    <Card key={endereco.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold">{endereco.nome_endereco}</h3>
                            {endereco.is_principal && (
                              <Badge variant="secondary">
                                <Star className="h-3 w-3 mr-1" />
                                Principal
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {endereco.rua}, {endereco.numero}
                          </p>
                          {endereco.complemento && (
                            <p className="text-sm text-muted-foreground">{endereco.complemento}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {endereco.bairro}, {endereco.estado}
                          </p>
                          <p className="text-sm text-muted-foreground">CEP: {endereco.cep}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenEditEndereco(endereco)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteEndereco(endereco.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Nenhum endereço cadastrado</p>
                  <Button onClick={() => handleOpenEditEndereco()}>
                    Adicionar Primeiro Endereço
                  </Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="favoritos" className="space-y-4">
              <h2 className="text-xl font-bold">Pizzas Favoritas</h2>
              {favoritos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favoritos.map((produto) => (
                    <Card key={produto.id} className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => navigate('/menu')}>
                      <img 
                        src={produto.imagem_url} 
                        alt={produto.nome}
                        className="w-full h-32 object-cover rounded-md mb-2"
                      />
                      <h3 className="font-bold">{produto.nome}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {produto.descricao}
                      </p>
                      {produto.tamanhos && produto.tamanhos.length > 0 && (
                        <p className="text-sm font-bold mt-2 text-primary">
                          A partir de R$ {produto.tamanhos[0].preco.toFixed(2)}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Você ainda não favoritou nenhuma pizza
                  </p>
                  <Button onClick={() => navigate('/menu')}>Ver Cardápio</Button>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="pedidos" className="space-y-4">
              <h2 className="text-xl font-bold">Meus Pedidos</h2>
              {pedidos.length > 0 ? (
                <div className="space-y-4">
                  {pedidos.map((pedido) => (
                    <Card key={pedido.id} className="p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-lg">{pedido.numero_pedido}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(pedido.created_at), 'dd/MM/yyyy HH:mm')}
                          </p>
                        </div>
                        <Badge className={statusColors[pedido.status]}>
                          {statusLabels[pedido.status]}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Itens:</p>
                        {pedido.itens?.map((item: any, index: number) => (
                          <p key={index} className="text-sm text-muted-foreground">
                            {item.quantity}x {item.name} ({item.size})
                          </p>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <p className="font-bold">Total: R$ {pedido.total.toFixed(2)}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => navigate('/order-tracking', { 
                            state: { orderNumber: pedido.numero_pedido } 
                          })}
                        >
                          Acompanhar
                        </Button>
                        {(pedido.status === 'pendente' || pedido.status === 'preparando') && (
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleCancelOrder(pedido.id, pedido.status)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-bold mb-2">Nenhum pedido encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Você ainda não fez nenhum pedido
                  </p>
                  <Button onClick={() => navigate('/menu')}>Ver Cardápio</Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Edit/Add Address Dialog */}
        <Dialog open={editEnderecoDialog} onOpenChange={setEditEnderecoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {enderecoEditando ? 'Editar Endereço' : 'Novo Endereço'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome_endereco">Nome do Endereço</Label>
                <Input
                  id="nome_endereco"
                  value={nomeEndereco}
                  onChange={(e) => setNomeEndereco(e.target.value)}
                  placeholder="Ex: Casa, Trabalho"
                />
              </div>
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  disabled={cepLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleSearchCEP}
                  disabled={cepLoading}
                >
                  Buscar CEP
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    placeholder="UF"
                  />
                </div>
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="rua">Rua</Label>
                <Input
                  id="rua"
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_principal"
                  checked={isPrincipal}
                  onChange={(e) => setIsPrincipal(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="is_principal" className="cursor-pointer">
                  Definir como endereço principal
                </Label>
              </div>
              <Button onClick={handleSaveEndereco} className="w-full">
                Salvar Endereço
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <BottomNavigation />
    </>
  );
}
