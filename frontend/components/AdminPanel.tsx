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
import { Loader2, Plus, Pencil, Trash2, Package } from "lucide-react";
import type { Product } from "~backend/product/create";

export function AdminPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
      <CardContent className="p-4">
        <div className="flex items-center gap-3"> {/* Reduzi o gap para mobile */}
          <div className="w-14 h-14 rounded bg-muted flex items-center justify-center shrink-0">
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
            <h3 className="font-semibold text-sm truncate">{product.name}</h3>
            
            {/* Limitamos a 2 linhas e forçamos quebra de palavras longas */}
            <p className="text-xs text-muted-foreground line-clamp-2 break-words leading-tight">
              {product.description || "Sem descrição"}
            </p>
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <span className="font-bold text-sm">R$ {product.price.toFixed(2)}</span>
              <span className={`text-[10px] font-bold uppercase ${product.stockQuantity <= 5 ? 'text-red-600' : 'text-muted-foreground'}`}>
                Est: {product.stockQuantity}
              </span>
            </div>
          </div>

          {/* Botões fixos no canto direito que não encolhem */}
          <div className="flex gap-1 shrink-0 ml-2">
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
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => deleteMutation.mutate(product.id)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
      </div>

      <div>
  <h2 className="text-3xl font-bold mb-6">Pedidos recentes</h2>
  <div className="grid gap-4 w-full"> {/* Adicionado w-full */}
    {ordersData?.orders.map((order) => (
      <Card key={order.id} className="overflow-hidden"> {/* Adicionado overflow-hidden */}
        <CardHeader className="p-4"> {/* Ajustado padding para mobile */}
          <div className="flex items-center justify-between gap-2"> {/* Gap para evitar colisão */}
            <div className="min-w-0 flex-1"> {/* Segredo do truncamento */}
              <CardTitle className="text-base truncate">{order.orderNumber}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {order.customerName}
              </p>
              <p className="text-[10px] text-muted-foreground truncate italic">
                {order.customerEmail}
              </p>
            </div>
            <div className="text-right shrink-0"> {/* Impede o preço de espremer */}
              <p className="font-bold text-base">R$ {order.total.toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
    ))}
  </div>
</div>
    </div>
  );
}
