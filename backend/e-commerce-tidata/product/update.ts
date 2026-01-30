import { api, APIError } from "encore.dev/api";
import db from "../db";
import type { Product } from "./create";

export interface UpdateProductParams {
  id: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stockQuantity?: number;
  imageUrl?: string;
}

// Updates a product.
export const update = api<UpdateProductParams & UpdateProductRequest, Product>(
  { expose: true, method: "PUT", path: "/products/:id" },
  async ({ id, name, description, price, stockQuantity, imageUrl }) => {
    const existing = await db.queryRow`SELECT id FROM products WHERE id = ${id}`;
    if (!existing) {
      throw APIError.notFound("product not found");
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramIndex++}`);
      values.push(price);
    }
    if (stockQuantity !== undefined) {
      updates.push(`stock_quantity = $${paramIndex++}`);
      values.push(stockQuantity);
    }
    if (imageUrl !== undefined) {
      updates.push(`image_url = $${paramIndex++}`);
      values.push(imageUrl);
    }

    if (updates.length === 0) {
      throw APIError.invalidArgument("no fields to update");
    }

    const query = `
      UPDATE products
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, name, description, price, stock_quantity AS "stockQuantity", image_url AS "imageUrl", created_at AS "createdAt"
    `;

    const product = await db.rawQueryRow<Product>(query, ...values, id);
    return product!;
  }
);
