import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "../lib/cart-context";
import { Loader2, CheckCircle2 } from "lucide-react";

interface CheckoutProps {
  onComplete: () => void;
}

export function Checkout({ onComplete }: CheckoutProps) {
  const { items, clearCart } = useCart();
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const { mutate: placeOrder, isPending } = useMutation({
    mutationFn: async () => {
      return backend.order.create({
        customerName,
        customerEmail,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      });
    },
    onSuccess: (data) => {
      setOrderPlaced(true);
      setOrderNumber(data.orderNumber);
      clearCart();
      toast({
        title: "Order placed!",
        description: `Order ${data.orderNumber} has been successfully placed.`,
      });
    },
    onError: (error) => {
      console.error("Order creation failed:", error);
      toast({
        title: "Order failed",
        description: error instanceof Error ? error.message : "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    placeOrder();
  };

  if (orderPlaced) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
          <CardDescription className="space-y-2">
            <p className="text-lg font-semibold text-foreground mt-2">Order Number: {orderNumber}</p>
            <p>Thank you for your purchase. A confirmation has been sent to {customerEmail}</p>
            <p className="text-xs text-muted-foreground">Save this order number for tracking your order.</p>
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button onClick={onComplete}>Continue Shopping</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
        <CardDescription>Complete your purchase</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                placeholder="john@example.com"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-semibold">Order Summary</h3>
            {items.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span>
                  {item.product.name} × {item.quantity}
                </span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Processing..." : "Place Order"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
