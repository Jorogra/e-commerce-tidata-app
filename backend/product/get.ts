import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { Product } from "./create";

export interface GetProductParams {
  id: number;
}

// Retrieves a product by ID.
export const get = api<GetProductParams, Product>(
  { expose: true, method: "GET", path: "/products/:id" },
  async ({ id }) => {
    const product = await db.queryRow<Product>`
      SELECT id, name, description, price, stock_quantity AS "stockQuantity", image_url AS "imageUrl", created_at AS "createdAt"
      FROM products
      WHERE id = ${id}
    `;
    
    if (!product) {
      throw APIError.notFound("product not found");
    }
    
    return product;
  }
);
