import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "./lib/cart-context";
import { AppInner } from "./components/AppInner";
import { registerServiceWorker } from "./register-sw";

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <AppInner />
        <Toaster />
      </CartProvider>
    </QueryClientProvider>
  );
}
