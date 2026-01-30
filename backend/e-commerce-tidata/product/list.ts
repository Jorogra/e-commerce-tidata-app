import { api } from "encore.dev/api";
import db from "../db";
import type { Product } from "./create";

export interface ListProductsResponse {
  products: Product[];
}

// Retrieves all products, ordered by creation date.
export const list = api<void, ListProductsResponse>(
  { expose: true, method: "GET", path: "/products" },
  async () => {
    const products = await db.queryAll<Product>`
      SELECT id, name, description, price, stock_quantity AS "stockQuantity", image_url AS "imageUrl", created_at AS "createdAt"
      FROM products
      ORDER BY created_at DESC
    `;
    return { products };
  }
);
