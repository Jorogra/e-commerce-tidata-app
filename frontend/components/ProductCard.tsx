import type { Product } from "~backend/product/create";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package } from "lucide-react";
import { useCart } from "../lib/cart-context";
import { useToast } from "@/components/ui/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (product.stockQuantity === 0) {
      toast({
        title: "Out of stock",
        description: "This product is currently unavailable.",
        variant: "destructive",
      });
      return;
    }

    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="overflow-hidden transition-all active:scale-[0.98]">
      <div className="aspect-[4/3] bg-muted relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-20 w-20 text-muted-foreground" />
          </div>
        )}
        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="destructive" className="text-base px-4 py-2">Out of Stock</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-5">
        <h3 className="font-semibold text-xl mb-2">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mb-4">
          <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
        </div>
        {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
          <p className={`text-sm mb-3 ${
            product.stockQuantity === 1 
              ? "font-bold text-red-600" 
              : "font-semibold text-red-600"
          }`}>
            {product.stockQuantity === 1 ? "Last one in stock!" : `Only ${product.stockQuantity} in stock`}
          </p>
        )}
        <Button
          className="w-full h-12 text-base"
          onClick={handleAddToCart}
          disabled={product.stockQuantity === 0}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}
