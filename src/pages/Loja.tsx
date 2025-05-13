import React from "react";
import { Store, ShoppingCart, Tag, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Define product interface
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

// Sample product data
const products: Product[] = [{
  id: "1",
  name: "Camisa Oficial Flamengo I 2024",
  description: "Camisa oficial do Flamengo para a temporada 2024, modelo titular.",
  price: 299.90,
  image: "https://logodetimes.com/wp-content/uploads/flamengo.png"
}, {
  id: "2",
  name: "Camisa Oficial Flamengo II 2024",
  description: "Camisa oficial do Flamengo para a temporada 2024, modelo visitante.",
  price: 279.90,
  image: "https://logodetimes.com/wp-content/uploads/flamengo.png"
}, {
  id: "3",
  name: "Camisa Flamengo Retrô 1981",
  description: "Camisa retrô do Flamengo, modelo Mundial 1981.",
  price: 199.90,
  image: "https://logodetimes.com/wp-content/uploads/flamengo.png"
}, {
  id: "4",
  name: "Camisa Flamengo Libertadores 2019",
  description: "Camisa comemorativa da conquista da Libertadores 2019.",
  price: 249.90,
  image: "https://logodetimes.com/wp-content/uploads/flamengo.png"
}];
const Loja = () => {
  const {
    toast
  } = useToast();
  const handleAddToCart = (product: Product) => {
    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao seu carrinho.`
    });
  };

  // Format price in Brazilian Real
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };
  return <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Loja Oficial da NetoTours Viagens</h1>
          <p className="text-muted-foreground">Os melhores produtos do Mengão para você!</p>
        </div>
        <Button variant="outline" size="sm">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Carrinho (0)
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => <Card key={product.id} className="overflow-hidden">
            <AspectRatio ratio={16 / 9}>
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <img src={product.image} alt={product.name} className="h-full object-contain p-4" />
              </div>
            </AspectRatio>
            <CardHeader>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-lg font-bold">
                <DollarSign className="h-4 w-4" />
                {formatPrice(product.price)}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                <Tag className="mr-2 h-4 w-4" />
                Detalhes
              </Button>
              <Button onClick={() => handleAddToCart(product)}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Comprar
              </Button>
            </CardFooter>
          </Card>)}
      </div>
    </div>;
};
export default Loja;