import { useState, useEffect } from "react";
import { ProductList } from "./ProductList";
import { Checkout } from "./Checkout";
import { AdminPanel } from "./AdminPanel";
import { OrderSearch } from "./OrderSearch";
import { CartDrawer } from "./CartDrawer";
import { BottomNav } from "./BottomNav";
import { ShoppingCart, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "../lib/cart-context";
import { useToast } from "@/components/ui/use-toast";
import { App as CapApp } from '@capacitor/app';

export function AppInner() {
  const [activeTab, setActiveTab] = useState<"shop" | "track" | "admin">("shop");
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const { items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
  let backPressCount = 0;

  const backHandler = CapApp.addListener('backButton', ({ canGoBack }) => {
    // 1. Se estivermos no Checkout, voltamos para a Loja
    if (showCheckout) {
      setShowCheckout(false);
    } 
    // 2. Se estivermos em Admin ou Pesquisa (track), voltamos para a Loja
    else if (activeTab !== "shop") {
      handleTabChange("shop");
    } 
    // 3. Se já estivermos na Loja (tela inicial)
    else {
      if (backPressCount === 0) {
        backPressCount++;
        // Exibe um alerta rápido (Toast)
        toast({
          description: "Pressione voltar novamente para sair",
          duration: 2000,
        });
        // Reseta o contador após 2 segundos
        setTimeout(() => { backPressCount = 0; }, 2000);
      } else {
        // Se clicar pela segunda vez em menos de 2s, o app fecha
        CapApp.exitApp();
      }
    }
  });

  return () => {
    backHandler.then(h => h.remove());
  };
}, [activeTab, showCheckout]); // Ele monitora a aba e se o checkout está aberto

  const handleTabChange = (tab: "shop" | "track" | "admin") => {
    setActiveTab(tab);
    setShowCheckout(false);
  };

return (
    // Adicionamos pb-safe para o conteúdo não ficar atrás do BottomNav
    <div className="min-h-screen bg-background pb-[calc(6rem+env(safe-area-inset-bottom))]">
      
      {/* HEADER: Adicionamos pt-safe para afastar o título da barra de status (bateria/relógio) */}
      <header className="border-b sticky top-0 bg-background z-10 pt-[env(safe-area-inset-top)]">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {showCheckout ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCheckout(false)}
                className="h-10 w-10"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6" />
                <h1 className="text-xl font-bold">Loja Tidata</h1>
              </div>
            )}
            {activeTab === "shop" && !showCheckout && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCartOpen(true)}
                className="relative h-10 w-10"
              >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {itemCount}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="px-4 pt-2">
        {activeTab === "shop" ? (
          showCheckout ? (
            <Checkout onComplete={() => setShowCheckout(false)} />
          ) : (
            <ProductList />
          )
        ) : activeTab === "track" ? (
          <OrderSearch />
        ) : (
          <AdminPanel 
  setActiveTab={handleTabChange} 
  setSearchQuery={setSearchQuery} // Certifique-se de que setSearchQuery existe aqui no pai também
/>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => setShowCheckout(true)}
      />
    </div>
  );
}
