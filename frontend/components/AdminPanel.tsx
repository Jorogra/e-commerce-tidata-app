import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Pencil, Trash2, Package, Search } from "lucide-react"
import type { Product } from "~backend/product/create";
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

interface AdminPanelProps {
  setActiveTab: (tab: "shop" | "track" | "admin") => void;
  setSearchQuery: (query: string) => void;
}

export function AdminPanel({ setActiveTab, setSearchQuery }: AdminPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState<string | number | null>(null);
  const [adminSearchTerm, setAdminSearchTerm] = useState("");

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => backend.product.list(),
  });

  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: () => backend.order.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => backend.product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsDialogOpen(false);
      toast({ title: "Produto criado com successo", duration: 3000});
    },
    onError: (error) => {
      console.error("Falha em criar produto:", error);
      toast({ title: "Falha em criar produto", variant: "destructive", duration: 3000});
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => backend.product.update({ id, ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      toast({ title: "Produto atualizado com successo", duration: 3000});
    },
    onError: (error) => {
      console.error("Falha em atualizar produto:", error);
      toast({ title: "Falha em atualizar produto", variant: "destructive" , duration: 3000});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => backend.product.remove({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product deleted successfully", duration: 3000});
    },
    onError: (error) => {
      console.error("Falha em deletar produto:", error);
      toast({ title: "Falha em deletar produto", variant: "destructive", duration: 3000});
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      stockQuantity: parseInt(formData.get("stockQuantity") as string),
      imageUrl: formData.get("imageUrl") as string,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoadingProducts || isLoadingOrders) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Produtos</h2>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingProduct(null);
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Adc Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Editar Produto" : "Adc Produto"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingProduct?.name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingProduct?.description}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preço</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingProduct?.price}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Qtd estoque</Label>
                  <Input
                    id="stockQuantity"
                    name="stockQuantity"
                    type="number"
                    min="0"
                    defaultValue={editingProduct?.stockQuantity}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL da Imagem</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    defaultValue={editingProduct?.imageUrl}
                    placeholder="https://..."
                  />
                </div>
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingProduct ? "Atualizar" : "Criar"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 w-full"> {/* Garante que o grid use 100% da largura */}
          {productsData?.products
            .slice()
            .sort((a, b) => {
          if (a.stockQuantity <= 5 && b.stockQuantity > 5) return -1;
          if (a.stockQuantity > 5 && b.stockQuantity <= 5) return 1;
      return a.stockQuantity - b.stockQuantity;
          })
    .map((product) => (
    <Card key={product.id} className="overflow-hidden"> {/* Impede vazamento lateral do card */}
      <CardContent className="p-3">
        <div className="flex items-center gap-2"> {/* Reduzi o gap para mobile */}
          <div className="w-10 h-10 rounded bg-muted shrink-0">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <Package className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          
          {/* O segredo está aqui: flex-1 e min-w-0 permite que o texto seja limitado */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xs truncate leading-none mb-1">{product.name}</h3>
            
            {/* Limitamos a 2 linhas e forçamos quebra de palavras longas */}
            <p className="text-[10px] text-muted-foreground line-clamp-1 break-words">
              {product.description || "Sem descrição"}
            </p>
            
            <div className="flex items-center gap-3 mt-1">
              <span className="font-bold text-xs text-foreground">R$ {product.price.toFixed(2)}</span>
              <span className={`text-[11px] font-bold ${product.stockQuantity <= 5 ? 'text-red-600' : 'text-muted-foreground'}`}>
                QTD: {product.stockQuantity}
              </span>
            </div>
          </div>

          {/* Botões fixos no canto direito que não encolhem */}
<div className="flex gap-1 shrink-0 ml-1">
  <Button
    variant="outline"
    size="icon"
    className="h-8 w-8"
    onClick={() => {
      setEditingProduct(product);
      setIsDialogOpen(true);
    }}
  >
    <Pencil className="h-3.5 w-3.5" />
  </Button>

  {/* Início do Alerta de Confirmação para Deletar */}
  <AlertDialog onOpenChange={(open: boolean) => {
  if (open) {
    setCountdown(3); // Começa em 3 segundos ao abrir
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }
}}>
  <AlertDialogTrigger asChild>
    <Button variant="outline" size="icon" className="h-7 w-7 text-destructive">
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  </AlertDialogTrigger>
  
  <AlertDialogContent className="w-[90%] rounded-lg">
    <AlertDialogHeader>
      <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
      <AlertDialogDescription>
        Tem certeza que deseja remover <strong>{product.name}</strong>?
      </AlertDialogDescription>
    </AlertDialogHeader>
    
    <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction
        disabled={countdown > 0 || deleteMutation.isPending}
        onClick={() => deleteMutation.mutate(product.id)}
        className="bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50"
      >
        {countdown > 0 ? `Aguarde (${countdown}s)` : "EXCLUIR"}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
</div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
      </div>

      <div>
  <h2 className="text-3xl font-bold mb-6">Pedidos recentes</h2>
<div className="grid gap-2 w-full"> {/* Reduzi o gap de 4 para 2 */}
  {ordersData?.orders.map((order) => {
    const isExpanded = expandedOrder === order.id;
    
    return (
      <Card 
        key={order.id} 
        className="overflow-hidden cursor-pointer border-border/50 shadow-none bg-white"
        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
      >
        {/* Substituímos CardHeader por uma div p-2.5 (10px) */}
        <div className="p-2.5 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[13px] font-bold block leading-tight truncate">
              {order.orderNumber}
            </span>
            <span className="text-[11px] text-muted-foreground block truncate">
              {order.customerName}
            </span>
          </div>
          
          <div className="text-right shrink-0 leading-tight">
            <p className="font-bold text-[13px]">R$ {order.total.toFixed(2)}</p>
            <p className="text-[9px] text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Área expandida sem o CardContent para evitar padding extra */}
        {isExpanded && (
          <div className="px-2.5 pb-2.5">
            <div className="border-t border-dashed pt-2">
              <Button 
                size="sm" 
                variant="secondary"
                className="w-full h-8 text-[10px] font-bold tracking-tight bg-slate-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab("track");
                  setSearchQuery(order.orderNumber);
                  window.scrollTo(0, 0);
                }}
              >
                <Search className="h-3 w-3 mr-1" />
                PESQUISAR ESSE PEDIDO
              </Button>
            </div>
          </div>
        )}
      </Card>
    );
  })}
</div>
</div>
    </div>
  );
}
