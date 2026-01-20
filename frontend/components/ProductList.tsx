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
        Failed to load products. Please try again.
      </div>
    );
  }

  if (!data?.products.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No products available yet.
      </div>
    );
  }

  const sortedProducts = data.products.slice().sort((a, b) => {
    if (a.stockQuantity === 0 && b.stockQuantity > 0) return 1;
    if (a.stockQuantity > 0 && b.stockQuantity === 0) return -1;
    
    if (a.stockQuantity > 0 && b.stockQuantity > 0) {
      if (a.stockQuantity <= 5 && b.stockQuantity > 5) return -1;
      if (a.stockQuantity > 5 && b.stockQuantity <= 5) return 1;
    }
    
    return 0;
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Products</h2>
      <div className="space-y-4">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
