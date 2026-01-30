import { api, APIError } from "encore.dev/api";
import db from "../db";

export interface DeleteProductParams {
  id: number;
}

// Deletes a product.
export const remove = api<DeleteProductParams, void>(
  { expose: true, method: "DELETE", path: "/products/:id" },
  async ({ id }) => {
    const result = await db.queryRow`SELECT id FROM products WHERE id = ${id}`;
    if (!result) {
      throw APIError.notFound("product not found");
    }
    
    await db.exec`DELETE FROM products WHERE id = ${id}`;
  }
);
