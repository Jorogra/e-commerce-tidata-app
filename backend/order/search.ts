import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { Order, OrderItemResponse } from "./create";

export interface SearchOrderParams {
  orderNumber: string;
}

export const search = api<SearchOrderParams, Order>(
  { expose: true, method: "GET", path: "/orders/search/:orderNumber" },
  async ({ orderNumber }) => {
    const order = await db.queryRow<{
      id: number;
      order_number: string;
      customer_name: string;
      customer_email: string;
      total: number;
      created_at: Date;
    }>`
      SELECT id, order_number, customer_name, customer_email, total, created_at
      FROM orders
      WHERE order_number = ${orderNumber}
    `;

    if (!order) {
      throw APIError.notFound("order not found");
    }

    const items = await db.queryAll<OrderItemResponse>`
      SELECT 
        oi.id,
        oi.product_id AS "productId",
        p.name AS "productName",
        oi.quantity,
        oi.price_at_purchase AS "priceAtPurchase"
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ${order.id}
    `;

    return {
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      total: order.total,
      createdAt: order.created_at,
      items,
    };
  }
);
