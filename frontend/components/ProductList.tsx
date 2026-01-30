import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { ProductCard } from "./ProductCard";
import { Loader2 } from "lucide-react";

export function ProductList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: () => backend.product.list(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        Falha em carregar os produtos. Por favor tente novamente.
      </div>
    );
  }

  if (!data?.products.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Ainda não há produtos disponíveis.
      </div>
    );
  }

  const sortedProducts = data.products.slice().sort((a, b) => {
    if (a.stockQuantity === 0 && b.stockQuantity > 0) return 1;
    if (a.stockQuantity > 0 && b.stockQuantity === 0) return -1;
    
    if (a.stockQuantity > 0 && b.stockQuantity > 0) {
      if (a.stockQuantity <= 5 && b.stockQuantity > 5) return -1;
      if (a.stockQuantity > 5 && b.stockQuantity <= 5) return 1;
      
      if (a.stockQuantity <= 5 && b.stockQuantity <= 5) {
        return a.stockQuantity - b.stockQuantity;
      }
    }
    
    return 0;
  });

  return (
  <div className="pt-4"> {/* Adicionamos um pequeno padding aqui para desgrudar do header */}
    {/* Se quiser manter o título, reduza a margem. Se quiser igualar às outras abas, pode remover o h2 */}
    <h2 className="text-2xl font-bold mb-4">Produtos</h2> 
    <div className="space-y-4">
      {sortedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </div>
);
}
