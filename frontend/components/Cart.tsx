import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import { useCart } from "../lib/cart-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CartProps {
  onCheckout: () => void;
  onBack?: () => void; // Para fechar o carrinho se necessário
}

export function Cart({ onCheckout, onBack }: CartProps) {
  const { items, updateQuantity, removeItem } = useCart();
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* HEADER PERSONALIZADO */}
      <header className="border-b sticky top-0 bg-background z-10 pt-[env(safe-area-inset-top)]">
  <div className="px-4 py-3 flex items-center justify-between">
    {/* Div invisível ou botão de voltar com largura fixa de 40px (w-10) */}
    <div className="w-10">
       <Button variant="ghost" size="icon" onClick={onBack}>
         <ArrowLeft className="h-6 w-6" />
       </Button>
    </div>

    {/* O flex-1 faz o H1 ocupar todo o meio, e o text-center centraliza o texto */}
    <h1 className="text-2xl font-bold text-center flex-1">Carrinho</h1>

    {/* Logo na direita com a mesma largura fixa (w-10) para equilibrar o centro */}
    <div className="w-10 flex justify-end">
      <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
    </div>
  </div>
</header>

      <div className="p-4 flex-1 overflow-auto">
        {items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg">Seu carrinho está vazio</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Produtos ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        R$ {item.product.price.toFixed(2)} cada
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[90%] rounded-lg">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover item?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Deseja retirar <strong>{item.product.name}</strong> do seu carrinho?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeItem(item.product.id)}
                            className="bg-black text-white font-bold hover:bg-gray-800 border-none"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => updateQuantity(item.product.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <Button variant="outline" size="icon" onClick={() => updateQuantity(item.product.id, item.quantity + 1)} disabled={item.quantity >= item.product.stockQuantity}>
                      <Plus className="h-4 w-4" />
                    </Button>
                    <span className="ml-auto font-semibold">
                      R$ {(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <div className="flex items-center justify-between w-full text-lg font-bold">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <Button className="w-full py-6 text-lg" size="lg" onClick={onCheckout}>
                Finalizar compra
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}