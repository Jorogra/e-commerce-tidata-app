ALTER TABLE orders ADD COLUMN order_number TEXT UNIQUE NOT NULL DEFAULT '';

CREATE INDEX idx_orders_order_number ON orders(order_number);
