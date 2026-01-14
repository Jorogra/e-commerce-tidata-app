import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "../lib/cart-context";

interface CartProps {
  onCheckout: () => void;
}

export function Cart({ onCheckout }: CartProps) {
  const { items, updateQuantity, removeItem } = useCart();

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Your cart is empty
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Cart ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.product.id} className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  ${item.product.price.toFixed(2)} each
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.product.id)}
                className="shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center">{item.quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                disabled={item.quantity >= item.product.stockQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <span className="ml-auto font-semibold">
                ${(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
            <Separator />
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <div className="flex items-center justify-between w-full text-lg font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <Button className="w-full" size="lg" onClick={onCheckout}>
          Proceed to Checkout
        </Button>
      </CardFooter>
    </Card>
  );
}
