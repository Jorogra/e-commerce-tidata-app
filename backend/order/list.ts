import { api } from "encore.dev/api";
import db from "../db";

export interface OrderSummary {
  id: number;
  customerName: string;
  customerEmail: string;
  total: number;
  createdAt: Date;
}

export interface ListOrdersResponse {
  orders: OrderSummary[];
}

// Retrieves all orders, ordered by creation date.
export const list = api<void, ListOrdersResponse>(
  { expose: true, method: "GET", path: "/orders" },
  async () => {
    const orders = await db.queryAll<OrderSummary>`
      SELECT id, customer_name AS "customerName", customer_email AS "customerEmail", total, created_at AS "createdAt"
      FROM orders
      ORDER BY created_at DESC
    `;
    return { orders };
  }
);
