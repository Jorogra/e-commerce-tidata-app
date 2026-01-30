import { api } from "encore.dev/api";
import db from "../db";

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string;
  createdAt: Date;
}

// Creates a new product.
export const create = api<CreateProductRequest, Product>(
  { expose: true, method: "POST", path: "/products" },
  async (req) => {
    const row = await db.queryRow<Product>`
      INSERT INTO products (name, description, price, stock_quantity, image_url)
      VALUES (${req.name}, ${req.description || null}, ${req.price}, ${req.stockQuantity}, ${req.imageUrl || null})
      RETURNING id, name, description, price, stock_quantity AS "stockQuantity", image_url AS "imageUrl", created_at AS "createdAt"
    `;
    return row!;
  }
);
