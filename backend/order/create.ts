import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrderRequest {
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  createdAt: Date;
  items: OrderItemResponse[];
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  priceAtPurchase: number;
}

// Creates a new order and updates inventory.
export const create = api<CreateOrderRequest, Order>(
  { expose: true, method: "POST", path: "/orders" },
  async (req) => {
    if (req.items.length === 0) {
      throw APIError.invalidArgument("order must contain at least one item");
    }

    const tx = await db.begin();
    
    try {
      let total = 0;
      const orderItems: Array<{ productId: number; quantity: number; price: number; name: string }> = [];

      for (const item of req.items) {
        const product = await tx.queryRow<{ id: number; name: string; price: number; stock_quantity: number }>`
          SELECT id, name, price, stock_quantity
          FROM products
          WHERE id = ${item.productId}
          FOR UPDATE
        `;

        if (!product) {
          throw APIError.notFound(`product ${item.productId} not found`);
        }

        if (product.stock_quantity < item.quantity) {
          throw APIError.failedPrecondition(`insufficient stock for product ${product.name}`);
        }

        await tx.exec`
          UPDATE products
          SET stock_quantity = stock_quantity - ${item.quantity}
          WHERE id = ${item.productId}
        `;

        const itemTotal = product.price * item.quantity;
        total += itemTotal;

        orderItems.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          name: product.name,
        });
      }

      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const order = await tx.queryRow<{ id: number; order_number: string; created_at: Date }>`
        INSERT INTO orders (customer_name, customer_email, total, order_number)
        VALUES (${req.customerName}, ${req.customerEmail}, ${total}, ${orderNumber})
        RETURNING id, order_number, created_at
      `;

      const items: OrderItemResponse[] = [];
      for (const item of orderItems) {
        const orderItem = await tx.queryRow<OrderItemResponse>`
          INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
          VALUES (${order!.id}, ${item.productId}, ${item.quantity}, ${item.price})
          RETURNING id, product_id AS "productId", quantity, price_at_purchase AS "priceAtPurchase"
        `;

        items.push({
          ...orderItem!,
          productName: item.name,
        });
      }

      await tx.commit();

      return {
        id: order!.id,
        orderNumber: order!.order_number,
        customerName: req.customerName,
        customerEmail: req.customerEmail,
        total,
        createdAt: order!.created_at,
        items,
      };
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }
);
