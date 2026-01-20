import { useState } from "react";
import { ProductList } from "./ProductList";
import { Cart } from "./Cart";
import { Checkout } from "./Checkout";
import { AdminPanel } from "./AdminPanel";
import { OrderSearch } from "./OrderSearch";
import { ShoppingCart, Package, LayoutDashboard, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCart } from "../lib/cart-context";

export function AppInner() {
  const [activeTab, setActiveTab] = useState<"shop" | "admin" | "track">("shop");
  const [showCheckout, setShowCheckout] = useState(false);
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Store</h1>
          </div>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "shop" | "admin" | "track")}>
            <TabsList>
              <TabsTrigger value="shop" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Shop
              </TabsTrigger>
              <TabsTrigger value="track" className="gap-2">
                <Search className="h-4 w-4" />
                Track Order
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Admin
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === "shop" ? (
          showCheckout ? (
            <div className="max-w-2xl mx-auto">
              <Button
                variant="ghost"
                onClick={() => setShowCheckout(false)}
                className="mb-6"
              >
                ← Back to Cart
              </Button>
              <Checkout onComplete={() => setShowCheckout(false)} />
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ProductList />
              </div>
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <Cart onCheckout={() => setShowCheckout(true)} />
                </div>
              </div>
            </div>
          )
        ) : activeTab === "track" ? (
          <div className="max-w-3xl mx-auto">
            <OrderSearch />
          </div>
        ) : (
          <AdminPanel />
        )}
      </main>

      {activeTab === "shop" && !showCheckout && itemCount > 0 && (
        <div className="fixed bottom-4 right-4 lg:hidden">
          <Button
            size="lg"
            className="rounded-full shadow-lg"
            onClick={() => setShowCheckout(true)}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </Button>
        </div>
      )}
    </div>
  );
}
