import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useCart } from "../lib/cart-context";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

interface CheckoutProps {
  onComplete: () => void;
  onBack: () => void;
}

export function Checkout({ onComplete, onBack }: CheckoutProps) {
  useEffect(() => {
  window.scrollTo(0, 0); // Força a tela a ir para o topo ao abrir
  }, []);
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
        title: "Pedido finalizado!",
        description: `Pedido ${data.orderNumber} foi bem sucedido.`,
        duration: 3000,
        className: "pointer-events-none select-none", // Trava para não bugar ao tocar
      });
    },
    onError: (error) => {
      toast({
        title: "Falha no pedido",
        description: error instanceof Error ? error.message : "Falha em processar pedido.",
        variant: "destructive",
        duration: 3000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    placeOrder();
  };

// 1. TELA DE SUCESSO (CENTRALIZADA E SEM SCROLL)
if (orderPlaced) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background overflow-hidden">
      {/* Header Fixo também no Sucesso para manter o padrão */}
      <header className="flex items-center justify-between px-4 pb-4 pt-12 border-b w-full bg-background">
        <div className="w-12" /> {/* Espaço vazio para centralizar o título */}
        <h2 className="text-2xl font-bold text-center flex-1">Pagamento</h2>
        <div className="w-12 flex justify-end">
          <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
        </div>
      </header>

      {/* Miolo Centralizado: O flex-1 com justify-center mata o scroll */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full border-none shadow-none bg-transparent animate-in fade-in zoom-in duration-300">
          <CardHeader className="text-center p-0">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100/80">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Pedido Confirmado!</CardTitle>
            <div className="space-y-6 pt-6">
              <div className="bg-muted/50 p-6 rounded-2xl border border-border/50">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold mb-2">Número do Pedido</p>
                <p className="text-lg font-mono font-bold text-foreground break-all">{orderNumber}</p>
              </div>
              <p className="text-muted-foreground text-sm px-4">
                Enviamos os detalhes para <br/>
                <span className="font-semibold text-foreground">{customerEmail}</span>
              </p>
            </div>
          </CardHeader>
          <CardFooter className="justify-center pt-10">
            <Button onClick={onComplete} className="w-full max-w-[240px] h-14 text-lg font-bold rounded-2xl">
              Continuar compras
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// 2. TELA DE FORMULÁRIO (HEADER FIXO)
return (
  <div className="fixed inset-0 z-50 flex flex-col bg-background overflow-hidden">
    {/* HEADER FIXO: Fora da div de scroll */}
    <header className="flex items-center justify-between px-4 pb-4 pt-12 border-b border-border/100 w-full bg-background shrink-0">
      <div className="w-12">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-7 w-7" />
        </Button>
      </div>
      <h2 className="text-2xl font-bold text-center flex-1">Pagamento</h2>
      <div className="w-12 flex justify-end">
        <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
      </div>
    </header>

      {/* CONTEÚDO PRINCIPAL*/}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pt-2 pb-6 px-4">
      <Card className="border-none shadow-none bg-transparent">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="Ana Maria" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required placeholder="ana@exemplo.com" />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
  <h3 className="font-semibold text-lg">Resumo do pedido</h3>
  {items.map((item) => (
    <div key={item.product.id} className="flex justify-between items-start text-sm py-1 gap-4">
      {/* Nome do produto: flex-1 permite que ele ocupe o espaço, mas respeite o gap */}
      <span className="flex-1 leading-tight">
        {item.product.name} × {item.quantity}
      </span>
      
      {/* Preço: whitespace-nowrap e shrink-0 impedem que o R$ quebre em duas linhas */}
      <span className="font-medium whitespace-nowrap shrink-0">
        R$ {(item.product.price * item.quantity).toFixed(2)}
      </span>
    </div>
  ))}
              <div className="pt-2">
                 <Separator />
              </div>
              <div className="flex justify-between font-bold text-xl pt-2">
                <span>Total</span>
                <span className="text-primary">R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>

          {/* RODAPÉ COM ESPAÇAMENTO PARA O ANDROID */}
          <CardFooter className="pt-4 pb-2 px-0">
            <Button type="submit" className="w-full h-16 text-xl font-bold rounded-2xl shadow-lg" disabled={isPending}>
              {isPending ? "Processando..." : "Fazer pedido"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  </div>
);
}