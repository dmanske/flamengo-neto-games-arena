
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Minus, ShoppingCart, X, CreditCard } from "lucide-react";
import { CheckoutButton } from "@/components/pagamentos/CheckoutButton";

interface ItemCarrinho {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  tipo: 'viagem' | 'produto';
  descricao?: string;
  data?: string;
  imagem?: string;
}

interface CarrinhoComprasProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CarrinhoCompras = ({ isOpen, onClose }: CarrinhoComprasProps) => {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  useEffect(() => {
    if (isOpen) {
      const carrinhoSalvo = localStorage.getItem('carrinho-neto-tours');
      if (carrinhoSalvo) {
        setItens(JSON.parse(carrinhoSalvo));
      }
    }
  }, [isOpen]);

  const salvarCarrinho = (novosItens: ItemCarrinho[]) => {
    setItens(novosItens);
    localStorage.setItem('carrinho-neto-tours', JSON.stringify(novosItens));
    // Disparar evento para atualizar contador
    window.dispatchEvent(new CustomEvent('carrinho-atualizado'));
  };

  const removerItem = (id: string) => {
    const novosItens = itens.filter(item => item.id !== id);
    salvarCarrinho(novosItens);
  };

  const atualizarQuantidade = (id: string, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerItem(id);
      return;
    }
    
    const novosItens = itens.map(item => 
      item.id === id ? { ...item, quantidade: novaQuantidade } : item
    );
    salvarCarrinho(novosItens);
  };

  const limparCarrinho = () => {
    salvarCarrinho([]);
  };

  const total = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
  const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Carrinho de Compras
              {totalItens > 0 && (
                <Badge className="bg-yellow-500 text-black">
                  {totalItens} {totalItens === 1 ? 'item' : 'itens'}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {itens.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={limparCarrinho}
                  className="text-red-200 hover:bg-red-700 hover:text-white"
                >
                  Limpar
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onClose} 
                className="text-white hover:bg-red-700"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {itens.length === 0 ? (
            <div className="text-center py-16 px-6">
              <ShoppingCart className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-700 mb-3">
                Seu carrinho está vazio
              </h3>
              <p className="text-gray-500 mb-6">
                Adicione viagens ou produtos para começar suas compras
              </p>
              <Button 
                onClick={onClose}
                className="bg-red-600 hover:bg-red-700"
              >
                Continuar Comprando
              </Button>
            </div>
          ) : (
            <>
              {/* Lista de Itens */}
              <div className="max-h-96 overflow-y-auto p-6">
                <div className="space-y-4">
                  {itens.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                      {/* Imagem do item (placeholder) */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.tipo === 'viagem' ? (
                          <span className="text-2xl">🎫</span>
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{item.nome}</h4>
                        {item.descricao && (
                          <p className="text-sm text-gray-600 truncate">{item.descricao}</p>
                        )}
                        {item.data && (
                          <p className="text-sm text-red-600 font-medium">{item.data}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={item.tipo === 'viagem' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {item.tipo === 'viagem' ? 'Viagem' : 'Produto'}
                          </Badge>
                          <span className="text-sm font-bold text-gray-900">
                            {formatCurrency(item.preco)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Controles de quantidade */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantidade}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {/* Preço total e botão remover */}
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-lg text-gray-900">
                          {formatCurrency(item.preco * item.quantidade)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removerItem(item.id)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Resumo e Checkout */}
              <div className="border-t bg-gray-50 p-6">
                <div className="space-y-4">
                  {/* Resumo de valores */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({totalItens} itens):</span>
                      <span className="font-medium">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frete:</span>
                      <span className="font-medium text-green-600">Grátis</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-red-600">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botões de ação */}
                  <div className="space-y-3">
                    <CheckoutButton
                      tripId="carrinho-multiple"
                      price={total}
                      description={`Compra múltipla - ${totalItens} item(ns)`}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-semibold rounded-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-5 h-5" />
                      Finalizar Compra - {formatCurrency(total)}
                    </CheckoutButton>
                    
                    <Button 
                      variant="outline"
                      onClick={onClose}
                      className="w-full py-3 text-gray-700 border-gray-300 hover:bg-gray-50"
                    >
                      Continuar Comprando
                    </Button>
                  </div>
                  
                  <p className="text-xs text-gray-500 text-center">
                    🔒 Pagamento 100% seguro via Stripe • Confirmação imediata
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const adicionarAoCarrinho = (item: Omit<ItemCarrinho, 'quantidade'>) => {
  const carrinhoAtual = localStorage.getItem('carrinho-neto-tours');
  const itens: ItemCarrinho[] = carrinhoAtual ? JSON.parse(carrinhoAtual) : [];
  
  const itemExistente = itens.find(i => i.id === item.id);
  
  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    itens.push({ ...item, quantidade: 1 });
  }
  
  localStorage.setItem('carrinho-neto-tours', JSON.stringify(itens));
  
  // Disparar evento customizado para atualizar contador
  window.dispatchEvent(new CustomEvent('carrinho-atualizado'));
};
