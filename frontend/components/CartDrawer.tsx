import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X, Plus, Minus, Trash2 } from "lucide-react";
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

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, updateQuantity, removeItem } = useCart();
  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 bottom-0 w-full max-w-md bg-background z-50 shadow-xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* TOPO PADRONIZADO */}
<div className="flex items-center justify-between px-4 pb-4 pt-12 border-b bg-background"> 
  <div className="w-12">
    <Button variant="ghost" size="icon" onClick={onClose}>
      <X className="h-7 w-7" />
    </Button>
  </div>

  {/* Título com destaque */}
  <h2 className="text-2xl font-bold text-center flex-1">
    Carrinho {items.length > 0 && `(${items.length})`}
  </h2>

  {/* Logo maior (h-10) para destaque */}
  <div className="w-12 flex justify-end">
    <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
  </div>
</div>

          <div className="flex-1 overflow-y-auto p-4 pb-10">
            {items.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">
                Seu carrinho está vazio
              </p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {item.product.price.toFixed(2)} cada
                        </p>
                      </div>
                      <AlertDialog>
  <AlertDialogTrigger asChild>
    <Button
      variant="ghost"
      size="icon"
      className="shrink-0 h-10 w-10 text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-5 w-5" />
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent className="w-[90%] rounded-lg">
    <AlertDialogHeader>
      <AlertDialogTitle>Remover item?</AlertDialogTitle>
      <AlertDialogDescription>
        Deseja retirar <strong>{item.product.name}</strong> do seu carrinho?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="flex-row gap-2">
      <AlertDialogCancel className="flex-1 mt-0 border-none">
        Cancelar
      </AlertDialogCancel>
      <AlertDialogAction
        onClick={() => removeItem(item.product.id)}
        className="flex-1 bg-black text-white font-bold hover:bg-gray-800"
      >
        Remover
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-10 w-10"
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                      <span className="w-16 text-center font-medium text-lg">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stockQuantity}
                        className="h-10 w-10"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                      <span className="ml-auto font-semibold text-lg">
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    <Separator />
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            /* RODAPÉ: Safe Area para a barra de gestos */
            <div className="border-t p-4 space-y-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between text-xl font-bold">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <Button
                className="w-full h-14 text-lg"
                onClick={() => {
                  onCheckout();
                  onClose();
                }}
              >
                Ir para pagamento
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}