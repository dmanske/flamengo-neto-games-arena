
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Users, DollarSign, ArrowLeft, Star, Clock, ShoppingCart, Package, User, Filter, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from 'sonner';
import { CheckoutButton } from "@/components/pagamentos/CheckoutButton";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { CarrinhoCompras, adicionarAoCarrinho } from "@/components/loja/CarrinhoCompras";
import { ContadorCarrinho } from "@/components/loja/ContadorCarrinho";
import { HistoricoPedidos } from "@/components/loja/HistoricoPedidos";
import { exemploViagens, exemploProdutos } from "@/data/exemploViagens";

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  rota: string;
  capacidade_onibus: number;
  valor_padrao: number;
  status_viagem: string;
  logo_adversario?: string;
  descricao_loja?: string;
  destaque_loja?: boolean;
  ativa_loja?: boolean;
}

const Loja = () => {
  const navigate = useNavigate();
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('');
  const [emailVerificado, setEmailVerificado] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [termoBusca, setTermoBusca] = useState('');

  useEffect(() => {
    fetchViagens();
  }, []);

  const fetchViagens = async () => {
    try {
      const { data, error } = await supabase
        .from('viagens')
        .select('*')
        .eq('status_viagem', 'Aberta')
        .eq('ativa_loja', true)
        .order('ordem_exibicao', { ascending: true })
        .order('data_jogo', { ascending: true });

      if (error) throw error;
      
      // Combinar viagens reais com exemplos
      const todasViagens = [...(data || []), ...exemploViagens];
      setViagens(todasViagens);
      setProdutos(exemploProdutos);
    } catch (error: any) {
      console.error('Erro ao buscar viagens:', error);
      toast.error('Erro ao carregar viagens disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionarViagemCarrinho = (viagem: Viagem) => {
    adicionarAoCarrinho({
      id: viagem.id,
      nome: `Flamengo x ${viagem.adversario}`,
      preco: viagem.valor_padrao,
      tipo: 'viagem',
      descricao: viagem.descricao_loja || viagem.rota,
      data: formatDate(viagem.data_jogo)
    });
    
    toast.success('Viagem adicionada ao carrinho!');
  };

  const handleAdicionarProdutoCarrinho = (produto: any) => {
    adicionarAoCarrinho({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      tipo: 'produto',
      descricao: produto.descricao
    });
    
    toast.success('Produto adicionado ao carrinho!');
  };

  const verificarEmail = async () => {
    if (!customerEmail || !customerEmail.includes('@')) {
      toast.error('Por favor, insira um email válido');
      return;
    }
    
    setEmailVerificado(true);
    toast.success('Email verificado! Você pode ver seu histórico de pedidos.');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Filtros
  const viagensFiltradas = viagens.filter(viagem => {
    const matchCategoria = filtroCategoria === 'todas' || 
      (filtroCategoria === 'destaque' && viagem.destaque_loja);
    const matchBusca = termoBusca === '' || 
      viagem.adversario.toLowerCase().includes(termoBusca.toLowerCase()) ||
      viagem.rota.toLowerCase().includes(termoBusca.toLowerCase());
    return matchCategoria && matchBusca;
  });

  const produtosFiltrados = produtos.filter(produto => {
    const matchCategoria = filtroCategoria === 'todas' || 
      (filtroCategoria === 'destaque' && produto.destaque) ||
      (filtroCategoria !== 'todas' && filtroCategoria !== 'destaque' && 
       produto.categoria.toLowerCase() === filtroCategoria.toLowerCase());
    const matchBusca = termoBusca === '' || 
      produto.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
      produto.descricao.toLowerCase().includes(termoBusca.toLowerCase());
    return matchCategoria && matchBusca;
  });

  const viagensDestaque = viagensFiltradas.filter(v => v.destaque_loja);
  const viagensNormais = viagensFiltradas.filter(v => !v.destaque_loja);
  const produtosDestaque = produtosFiltrados.filter(p => p.destaque);
  const produtosNormais = produtosFiltrados.filter(p => !p.destaque);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
          <p className="text-white text-lg">Carregando loja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-red-900 to-black">
      {/* Header */}
      <div className="relative overflow-hidden py-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/50 to-black/50"></div>
        <div className="container mx-auto relative z-10">
          <div className="flex items-center justify-between mb-8">
            <Button 
              onClick={() => navigate("/")} 
              variant="ghost" 
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Site
            </Button>
            
            <ContadorCarrinho onClick={() => setCarrinhoAberto(true)} />
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-red-600/20 backdrop-blur-md border border-red-500/30 rounded-full px-6 py-2 mb-6">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-red-100 font-medium">Loja Oficial</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              🔴⚫ Neto Tours
              <span className="bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent block">
                Flamengo
              </span>
            </h1>
            
            <p className="text-xl text-red-100 max-w-3xl mx-auto">
              Reserve sua vaga nas próximas viagens do Mengão e leve o Flamengo sempre com você! 
              Pagamento seguro e confirmação imediata.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        <Tabs defaultValue="viagens" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/10 backdrop-blur-md">
            <TabsTrigger value="viagens" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Package className="w-4 h-4 mr-2" />
              Viagens
            </TabsTrigger>
            <TabsTrigger value="produtos" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Meus Pedidos
            </TabsTrigger>
          </TabsList>

          {/* Filtros e Busca */}
          <div className="mb-8 bg-white/10 backdrop-blur-md rounded-lg p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-red-300" />
                  <Input
                    placeholder="Buscar viagens, produtos..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="pl-10 bg-white/10 border-red-500/30 text-white placeholder:text-red-300"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filtroCategoria === 'todas' ? 'default' : 'outline'}
                  onClick={() => setFiltroCategoria('todas')}
                  size="sm"
                  className={filtroCategoria === 'todas' ? 'bg-red-600' : 'border-red-500 text-red-400 hover:bg-red-500 hover:text-white'}
                >
                  Todos
                </Button>
                <Button
                  variant={filtroCategoria === 'destaque' ? 'default' : 'outline'}
                  onClick={() => setFiltroCategoria('destaque')}
                  size="sm"
                  className={filtroCategoria === 'destaque' ? 'bg-red-600' : 'border-red-500 text-red-400 hover:bg-red-500 hover:text-white'}
                >
                  <Star className="w-4 h-4 mr-1" />
                  Destaque
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="viagens">
            {viagensFiltradas.length === 0 ? (
              <EnhancedCard variant="glass" className="text-center py-16 max-w-2xl mx-auto">
                <div className="mb-6">
                  <Clock className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-4">
                    {termoBusca ? 'Nenhuma viagem encontrada' : 'Em Breve Novas Viagens!'}
                  </h2>
                  <p className="text-red-200 text-lg">
                    {termoBusca 
                      ? 'Tente usar outros termos de busca ou limpe os filtros.'
                      : 'Estamos preparando as próximas caravanas do Mengão.'
                    }
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {termoBusca && (
                    <Button 
                      onClick={() => setTermoBusca('')}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Limpar Busca
                    </Button>
                  )}
                  <Button 
                    onClick={() => navigate("/")}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Voltar ao Site
                  </Button>
                </div>
              </EnhancedCard>
            ) : (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    🎫 Próximas Viagens ({viagensFiltradas.length})
                  </h2>
                  <p className="text-red-200">
                    Escolha sua viagem e adicione ao carrinho ou compre diretamente
                  </p>
                </div>

                {/* Viagens em Destaque */}
                {viagensDestaque.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-400" />
                      Viagens em Destaque
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {viagensDestaque.map((viagem) => (
                        <ViagemCard
                          key={viagem.id}
                          viagem={viagem}
                          isDestaque={true}
                          onAdicionarCarrinho={handleAdicionarViagemCarrinho}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Outras Viagens */}
                {viagensNormais.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6">
                      Outras Viagens Disponíveis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {viagensNormais.map((viagem) => (
                        <ViagemCard
                          key={viagem.id}
                          viagem={viagem}
                          isDestaque={false}
                          onAdicionarCarrinho={handleAdicionarViagemCarrinho}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="produtos">
            {produtosFiltrados.length === 0 ? (
              <EnhancedCard variant="glass" className="text-center py-16 max-w-2xl mx-auto">
                <div className="mb-6">
                  <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-4">
                    {termoBusca ? 'Nenhum produto encontrado' : 'Produtos em Breve!'}
                  </h2>
                  <p className="text-red-200 text-lg">
                    {termoBusca 
                      ? 'Tente usar outros termos de busca ou limpe os filtros.'
                      : 'Estamos preparando produtos incríveis para você.'
                    }
                  </p>
                </div>
              </EnhancedCard>
            ) : (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    🛍️ Produtos Oficiais ({produtosFiltrados.length})
                  </h2>
                  <p className="text-red-200">
                    Leve o Flamengo sempre com você
                  </p>
                </div>

                {/* Produtos em Destaque */}
                {produtosDestaque.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-400" />
                      Produtos em Destaque
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {produtosDestaque.map((produto) => (
                        <ProdutoCard
                          key={produto.id}
                          produto={produto}
                          onAdicionarCarrinho={handleAdicionarProdutoCarrinho}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Outros Produtos */}
                {produtosNormais.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-6">
                      Outros Produtos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {produtosNormais.map((produto) => (
                        <ProdutoCard
                          key={produto.id}
                          produto={produto}
                          onAdicionarCarrinho={handleAdicionarProdutoCarrinho}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="pedidos">
            <div className="max-w-4xl mx-auto">
              {!emailVerificado ? (
                <EnhancedCard variant="glass" className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">
                    Consultar Meus Pedidos
                  </h3>
                  <p className="text-red-200 mb-6">
                    Digite seu email para ver o histórico de compras
                  </p>
                  
                  <div className="flex gap-4 max-w-md mx-auto">
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="bg-white/10 border-red-500/30 text-white placeholder:text-red-300"
                    />
                    <Button 
                      onClick={verificarEmail}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Consultar
                    </Button>
                  </div>
                </EnhancedCard>
              ) : (
                <HistoricoPedidos customerEmail={customerEmail} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Carrinho */}
      <CarrinhoCompras 
        isOpen={carrinhoAberto} 
        onClose={() => setCarrinhoAberto(false)} 
      />
    </div>
  );
};

// Componente para card de viagem
const ViagemCard = ({ 
  viagem, 
  isDestaque, 
  onAdicionarCarrinho 
}: { 
  viagem: Viagem; 
  isDestaque: boolean; 
  onAdicionarCarrinho: (viagem: Viagem) => void;
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <EnhancedCard 
      variant="interactive"
      className="overflow-hidden group"
      glow={isDestaque}
    >
      {isDestaque && (
        <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-white text-center py-2 font-bold">
          ⭐ DESTAQUE ⭐
        </div>
      )}
      
      <CardHeader className="bg-red-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              🔴
            </div>
            <span className="text-lg font-medium">VS</span>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              {viagem.logo_adversario ? (
                <img 
                  src={viagem.logo_adversario} 
                  alt={viagem.adversario}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <span className="text-black text-sm font-bold">
                  {viagem.adversario.substring(0, 3).toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-500 text-white">
            {viagem.status_viagem}
          </Badge>
        </div>
        <CardTitle className="text-2xl">
          Flamengo x {viagem.adversario}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4 bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2 text-red-200">
          <Calendar className="h-5 w-5" />
          <span className="font-medium">{formatDate(viagem.data_jogo)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-red-200">
          <MapPin className="h-5 w-5" />
          <span>{viagem.rota}</span>
        </div>
        
        <div className="flex items-center gap-2 text-red-200">
          <Users className="h-5 w-5" />
          <span>{viagem.capacidade_onibus} vagas disponíveis</span>
        </div>

        {viagem.descricao_loja && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-100 text-sm">{viagem.descricao_loja}</p>
          </div>
        )}
        
        <div className="border-t border-red-500/20 pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-red-200">Valor:</span>
            <span className="text-3xl font-bold text-white">
              {formatCurrency(viagem.valor_padrao)}
            </span>
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={() => onAdicionarCarrinho(viagem)}
              variant="outline"
              className="w-full border-red-500 text-red-400 hover:bg-red-500 hover:text-white py-3 rounded-xl font-bold text-lg transition-all duration-200"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Adicionar ao Carrinho
            </Button>
            
            <CheckoutButton
              tripId={viagem.id}
              price={viagem.valor_padrao}
              description={`Viagem Flamengo x ${viagem.adversario} - ${viagem.rota}`}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Comprar Diretamente 🎫
            </CheckoutButton>
          </div>
        </div>
        
        <p className="text-xs text-red-300 text-center mt-2">
          Pagamento seguro via Stripe • Confirmação imediata
        </p>
      </CardContent>
    </EnhancedCard>
  );
};

// Componente para card de produto
const ProdutoCard = ({ 
  produto, 
  onAdicionarCarrinho 
}: { 
  produto: any; 
  onAdicionarCarrinho: (produto: any) => void;
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <EnhancedCard 
      variant="interactive"
      className="group overflow-hidden"
      glow={produto.destaque}
    >
      {produto.destaque && (
        <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-white text-center py-2 font-bold">
          ⭐ DESTAQUE ⭐
        </div>
      )}
      
      <div className="aspect-square mb-4 overflow-hidden">
        <img 
          src={produto.imagem || 'https://via.placeholder.com/300x300?text=Produto'} 
          alt={produto.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <CardContent className="p-6 space-y-4 bg-white/5 backdrop-blur-md">
        <div className="text-red-400 text-sm font-medium">{produto.categoria}</div>
        
        <CardTitle className="text-xl text-white">{produto.nome}</CardTitle>
        
        <p className="text-red-200 text-sm">{produto.descricao}</p>
        
        {produto.tags && (
          <div className="flex flex-wrap gap-1">
            {produto.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="border-t border-red-500/20 pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-red-200">Valor:</span>
            <span className="text-2xl font-bold text-white">
              {formatCurrency(produto.preco)}
            </span>
          </div>
          
          <div className="space-y-2">
            <Button
              onClick={() => onAdicionarCarrinho(produto)}
              variant="outline"
              disabled={!produto.em_estoque}
              className="w-full border-red-500 text-red-400 hover:bg-red-500 hover:text-white py-3 rounded-xl font-bold text-lg transition-all duration-200 disabled:opacity-50"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {produto.em_estoque ? 'Adicionar ao Carrinho' : 'Fora de Estoque'}
            </Button>
            
            {produto.em_estoque && (
              <CheckoutButton
                tripId={produto.id}
                price={produto.preco}
                description={produto.nome}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Comprar Diretamente 🛒
              </CheckoutButton>
            )}
          </div>
        </div>
        
        <p className="text-xs text-red-300 text-center mt-2">
          Entrega para todo o Brasil • Pagamento seguro
        </p>
      </CardContent>
    </EnhancedCard>
  );
};

export default Loja;
