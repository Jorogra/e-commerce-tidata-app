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
  // 1. Se o Checkout estiver aberto, volta para o Carrinho ou Loja
  if (showCheckout) {
    setShowCheckout(false);
    setCartOpen(true);
  } 
  // 2. NOVO: Se o Carrinho estiver aberto, fecha o Carrinho
  else if (cartOpen) {
    setCartOpen(false);
  }
  // 3. Se estiver em abas como Admin ou Pesquisa, volta para a aba "shop"
  else if (activeTab !== "shop") {
    handleTabChange("shop");
  } 
  // 4. Se já estiver na Loja Limpa (Home)
  else {
    if (backPressCount === 0) {
      backPressCount++;
      toast({
        description: "Pressione voltar novamente para sair",
        duration: 2000,
      });
      setTimeout(() => { backPressCount = 0; }, 2000);
    } else {
      CapApp.exitApp();
    }
  }
});

  return () => { backHandler.then(h => h.remove()); };
  }, [activeTab, showCheckout, cartOpen]); // Ele monitora a aba e se o checkout está aberto

  const handleTabChange = (tab: "shop" | "track" | "admin") => {
    setActiveTab(tab);
    setShowCheckout(false);
    // Se mudar para qualquer aba que não seja a de pesquisa, limpamos a busca anterior
    if (tab !== "track") {
      setSearchQuery("");
    }
  };

return (
    // Adicionamos pb-safe para o conteúdo não ficar atrás do BottomNav
    <div className="min-h-screen bg-background pb-[calc(6rem+env(safe-area-inset-bottom))]">
      
      {/* Só renderizamos o Header do pai se o Checkout NÃO estiver aberto */}
{!showCheckout ? (
  <header className="border-b sticky top-0 bg-background z-10 pt-[env(safe-area-inset-top)]">
    <div className="px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="Logo Tidata" 
            className="h-12 w-12 object-contain" 
          />
          <h1 className="text-2xl font-extrabold tracking-tight">Loja Tidata</h1>
        </div>
        
        {activeTab === "shop" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCartOpen(true)}
            className="relative h-12 w-12"
          >
            <ShoppingCart className="h-8 w-8" />
            {itemCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 min-w-6 flex items-center justify-center p-0 text-[10px] rounded-full"
              >
                {itemCount}
              </Badge>
            )}
          </Button>
        )}
      </div>
    </div>
  </header>
) : null}

  <main className={showCheckout ? "flex-1" : "px-4 pt-2"}>
  {activeTab === "shop" ? (
    showCheckout ? (
      <Checkout
        onComplete={() => setShowCheckout(false)} 
        onBack={() => {
          setShowCheckout(false); // Fecha o Pagamento
          setCartOpen(true);      // Abre o Carrinho (Volta pra onde o usuário estava!)
        }}
      />
    ) : (
      <ProductList />
    )
  ) : activeTab === "track" ? (
    <OrderSearch searchQuery={searchQuery}/>
  ) : (
    <AdminPanel 
      setActiveTab={handleTabChange} 
      setSearchQuery={setSearchQuery} 
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
