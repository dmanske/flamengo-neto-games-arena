
import React, { useState, useEffect } from "react";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { ShoppingBag, MapPin, Calendar, Users, ArrowRight, Zap, Package, Star } from "lucide-react";
import { CheckoutButton } from "@/components/pagamentos/CheckoutButton";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { ContadorCarrinho } from "@/components/loja/ContadorCarrinho";
import { CarrinhoCompras, adicionarAoCarrinho } from "@/components/loja/CarrinhoCompras";

interface Viagem {
  id: string;
  adversario: string;
  data_jogo: string;
  rota: string;
  capacidade_onibus: number;
  valor_padrao: number;
  status_viagem: string;
  logo_adversario?: string;
  ativa_loja?: boolean;
  destaque_loja?: boolean;
  descricao_loja?: string;
}

interface Produto {
  id: string;
  nome: string;
  preco: number;
  descricao: string;
  imagem?: string;
  categoria: string;
  em_estoque: boolean;
  destaque: boolean;
}

export const StoreSection = () => {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  useEffect(() => {
    const fetchDados = async () => {
      try {
        // Buscar viagens ativas
        const { data: viagensData, error: viagensError } = await supabase
          .from('viagens')
          .select('*')
          .eq('status_viagem', 'Aberta')
          .eq('ativa_loja', true)
          .order('data_jogo', { ascending: true })
          .limit(3);

        if (viagensError) throw viagensError;
        setViagens(viagensData || []);

        // Produtos de exemplo (já que não temos tabela de produtos ainda)
        const produtosExemplo: Produto[] = [
          {
            id: 'produto-1',
            nome: 'Camisa Flamengo 2024',
            preco: 199.90,
            descricao: 'Camisa oficial do Flamengo temporada 2024',
            imagem: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop',
            categoria: 'Vestuário',
            em_estoque: true,
            destaque: true
          },
          {
            id: 'produto-2',
            nome: 'Boné Oficial CRF',
            preco: 79.90,
            descricao: 'Boné oficial do Clube de Regatas do Flamengo',
            imagem: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=400&fit=crop',
            categoria: 'Acessórios',
            em_estoque: true,
            destaque: false
          },
          {
            id: 'produto-3',
            nome: 'Caneca Mengão',
            preco: 39.90,
            descricao: 'Caneca de porcelana com escudo do Flamengo',
            imagem: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93c?w=400&h=400&fit=crop',
            categoria: 'Casa',
            em_estoque: true,
            destaque: false
          }
        ];
        setProdutos(produtosExemplo);
      } catch (error: any) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar produtos e viagens');
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, []);

  const handleAdicionarCarrinho = (item: Viagem | Produto, tipo: 'viagem' | 'produto') => {
    if (tipo === 'viagem') {
      const viagem = item as Viagem;
      adicionarAoCarrinho({
        id: viagem.id,
        nome: `Flamengo x ${viagem.adversario}`,
        preco: viagem.valor_padrao,
        tipo: 'viagem',
        descricao: viagem.descricao_loja || viagem.rota,
        data: formatDate(viagem.data_jogo)
      });
    } else {
      const produto = item as Produto;
      adicionarAoCarrinho({
        id: produto.id,
        nome: produto.nome,
        preco: produto.preco,
        tipo: 'produto',
        descricao: produto.descricao
      });
    }
    
    toast.success('Item adicionado ao carrinho!');
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

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-red-900/30 to-black/60"></div>
      <div className="absolute top-10 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="flex justify-between items-center mb-8">
            <div></div>
            <ContadorCarrinho onClick={() => setCarrinhoAberto(true)} />
          </div>
          
          <div className="inline-flex items-center gap-2 bg-red-600/20 backdrop-blur-md border border-red-500/30 rounded-full px-6 py-2 mb-6">
            <ShoppingBag className="w-5 h-5 text-red-400" />
            <span className="text-red-100 font-medium">Loja Oficial</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Loja
            <span className="bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent block">
              Rubro-Negra
            </span>
          </h2>
          
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            Viagens exclusivas e produtos oficiais do Mengão! Garante sua vaga nas próximas 
            viagens e leve o Flamengo sempre com você.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
            <p className="text-red-200 mt-4">Carregando loja...</p>
          </div>
        ) : (
          <>
            {/* Seção de Viagens */}
            {viagens.length > 0 && (
              <div className="mb-16">
                <h3 className="text-3xl font-bold text-white mb-8 text-center">
                  🎫 Próximas Viagens
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {viagens.map((viagem, index) => (
                    <ViagemCard
                      key={viagem.id}
                      viagem={viagem}
                      isDestaque={viagem.destaque_loja || false}
                      onAdicionarCarrinho={(v) => handleAdicionarCarrinho(v, 'viagem')}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Seção de Produtos */}
            <div className="mb-16">
              <h3 className="text-3xl font-bold text-white mb-8 text-center">
                🛍️ Produtos Oficiais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {produtos.map((produto) => (
                  <ProdutoCard
                    key={produto.id}
                    produto={produto}
                    onAdicionarCarrinho={(p) => handleAdicionarCarrinho(p, 'produto')}
                  />
                ))}
              </div>
            </div>
            
            {/* Link para loja completa */}
            <div className="text-center">
              <a 
                href="/loja" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Ver Loja Completa
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </>
        )}
      </div>

      {/* Carrinho */}
      <CarrinhoCompras 
        isOpen={carrinhoAberto} 
        onClose={() => setCarrinhoAberto(false)} 
      />
    </section>
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
      className="group overflow-hidden"
      glow={isDestaque}
    >
      {isDestaque && (
        <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-white text-center py-2 text-sm font-bold">
          <Zap className="w-4 h-4 inline mr-1" />
          DESTAQUE
        </div>
      )}
      
      <div className={`p-6 ${isDestaque ? 'pt-4' : ''}`}>
        {/* Header com logos */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              🔴
            </div>
            <span className="text-gray-400 font-medium">VS</span>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              {viagem.logo_adversario ? (
                <img 
                  src={viagem.logo_adversario} 
                  alt={viagem.adversario}
                  className="w-6 h-6 object-contain"
                />
              ) : (
                <span className="text-black text-xs font-bold">
                  {viagem.adversario.substring(0, 3).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Título */}
        <h4 className="text-lg font-bold text-white mb-3">
          Flamengo x {viagem.adversario}
        </h4>
        
        {/* Informações */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-red-200">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(viagem.data_jogo)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-red-200">
            <MapPin className="w-4 h-4" />
            <span>{viagem.rota}</span>
          </div>
          
          <div className="flex items-center gap-2 text-red-200">
            <Users className="w-4 h-4" />
            <span>{viagem.capacidade_onibus} vagas</span>
          </div>
        </div>

        {viagem.descricao_loja && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-100 text-xs">{viagem.descricao_loja}</p>
          </div>
        )}
        
        {/* Preço */}
        <div className="text-center mb-4">
          <span className="text-2xl font-bold text-white">
            {formatCurrency(viagem.valor_padrao)}
          </span>
        </div>
        
        {/* Botões */}
        <div className="space-y-2">
          <button
            onClick={() => onAdicionarCarrinho(viagem)}
            className="w-full border border-red-500 text-red-400 hover:bg-red-500 hover:text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Adicionar ao Carrinho
          </button>
          
          <CheckoutButton
            tripId={viagem.id}
            price={viagem.valor_padrao}
            description={`Viagem Flamengo x ${viagem.adversario} - ${viagem.rota}`}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200"
          >
            Comprar Agora
          </CheckoutButton>
        </div>
      </div>
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
        <div className="bg-gradient-to-r from-red-600 to-yellow-500 text-white text-center py-2 text-sm font-bold">
          <Star className="w-4 h-4 inline mr-1" />
          DESTAQUE
        </div>
      )}
      
      <div className={`${produto.destaque ? '' : 'p-6'}`}>
        {/* Imagem do produto */}
        <div className="aspect-square mb-4 overflow-hidden rounded-lg">
          <img 
            src={produto.imagem || 'https://via.placeholder.com/300x300?text=Produto'} 
            alt={produto.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className={produto.destaque ? 'p-6 pt-0' : ''}>
          {/* Categoria */}
          <div className="text-red-400 text-sm font-medium mb-2">{produto.categoria}</div>
          
          {/* Nome */}
          <h4 className="text-lg font-bold text-white mb-2">{produto.nome}</h4>
          
          {/* Descrição */}
          <p className="text-red-200 text-sm mb-4">{produto.descricao}</p>
          
          {/* Preço */}
          <div className="text-center mb-4">
            <span className="text-2xl font-bold text-white">
              {formatCurrency(produto.preco)}
            </span>
          </div>
          
          {/* Botões */}
          <div className="space-y-2">
            <button
              onClick={() => onAdicionarCarrinho(produto)}
              className="w-full border border-red-500 text-red-400 hover:bg-red-500 hover:text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              disabled={!produto.em_estoque}
            >
              <ShoppingBag className="w-4 h-4" />
              {produto.em_estoque ? 'Adicionar ao Carrinho' : 'Fora de Estoque'}
            </button>
            
            {produto.em_estoque && (
              <CheckoutButton
                tripId={produto.id}
                price={produto.preco}
                description={produto.nome}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200"
              >
                Comprar Agora
              </CheckoutButton>
            )}
          </div>
        </div>
      </div>
    </EnhancedCard>
  );
};
