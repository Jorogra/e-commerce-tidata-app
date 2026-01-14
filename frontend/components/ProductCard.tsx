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
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-square bg-muted relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg">Out of Stock</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
          <Badge variant="outline">
            {product.stockQuantity} in stock
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={product.stockQuantity === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
