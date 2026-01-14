import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Search, ShoppingBag } from "lucide-react";
import type { Order } from "~backend/order/create";

export function OrderSearch() {
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);

  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: () => backend.order.list(),
  });

  const { mutate: searchOrder, isPending } = useMutation({
    mutationFn: async (orderNum: string) => {
      return backend.order.search({ orderNumber: orderNum });
    },
    onSuccess: (data) => {
      setOrder(data);
    },
    onError: (error) => {
      console.error("Order search failed:", error);
      setOrder(null);
      toast({
        title: "Order not found",
        description: error instanceof Error ? error.message : "Could not find an order with that number.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      searchOrder(orderNumber.trim());
    }
  };

  const handleOrderClick = (orderNum: string) => {
    setOrderNumber(orderNum);
    searchOrder(orderNum);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Track Your Order</CardTitle>
          <CardDescription>Enter your order number to view order details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="orderNumber" className="sr-only">Order Number</Label>
              <Input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Enter order number (e.g., ORD-1234567890-ABC123)"
                required
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {order && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  {order.orderNumber}
                </CardTitle>
                <CardDescription className="mt-2">
                  Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">${order.total.toFixed(2)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Customer Information</h3>
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">Name: <span className="text-foreground">{order.customerName}</span></p>
                <p className="text-muted-foreground">Email: <span className="text-foreground">{order.customerEmail}</span></p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-3">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">${item.priceAtPurchase.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-4">All Orders</h2>
        {isLoadingOrders ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-4">
            {ordersData?.orders.map((orderItem) => (
              <Card 
                key={orderItem.id} 
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
                onClick={() => handleOrderClick(orderItem.orderNumber)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{orderItem.orderNumber}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {orderItem.customerName} • {orderItem.customerEmail}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">${orderItem.total.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(orderItem.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
