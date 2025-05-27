
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { CheckoutButton } from "@/components/pagamentos/CheckoutButton";

interface ItemCarrinho {
  id: string;
  nome: string;
  preco: number;
  quantidade: number;
  tipo: 'viagem' | 'produto';
  descricao?: string;
  data?: string;
}

interface CarrinhoComprasProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CarrinhoCompras = ({ isOpen, onClose }: CarrinhoComprasProps) => {
  const [itens, setItens] = useState<ItemCarrinho[]>([]);

  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('carrinho-neto-tours');
    if (carrinhoSalvo) {
      setItens(JSON.parse(carrinhoSalvo));
    }
  }, [isOpen]);

  const salvarCarrinho = (novosItens: ItemCarrinho[]) => {
    setItens(novosItens);
    localStorage.setItem('carrinho-neto-tours', JSON.stringify(novosItens));
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

  const total = itens.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="bg-red-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrinho de Compras
            </CardTitle>
            <Button variant="ghost" onClick={onClose} className="text-white hover:bg-red-700">
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 overflow-y-auto">
          {itens.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Seu carrinho está vazio</p>
              <p className="text-gray-500">Adicione viagens para começar sua reserva</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {itens.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.nome}</h4>
                      {item.descricao && (
                        <p className="text-sm text-gray-600">{item.descricao}</p>
                      )}
                      {item.data && (
                        <p className="text-sm text-red-600">{item.data}</p>
                      )}
                      <Badge variant={item.tipo === 'viagem' ? 'default' : 'secondary'}>
                        {item.tipo === 'viagem' ? 'Viagem' : 'Produto'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => atualizarQuantidade(item.id, item.quantidade - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantidade}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => atualizarQuantidade(item.id, item.quantidade + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(item.preco * item.quantidade)}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(item.preco)} cada</p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removerItem(item.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold">Total:</span>
                  <span className="text-2xl font-bold text-red-600">{formatCurrency(total)}</span>
                </div>
                
                <CheckoutButton
                  tripId="carrinho-multiple"
                  price={total}
                  description={`Compra múltipla - ${itens.length} item(ns)`}
                  className="w-full py-3 text-lg"
                >
                  Finalizar Compra - {formatCurrency(total)}
                </CheckoutButton>
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
