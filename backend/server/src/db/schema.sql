-- Signscous API working schema (PostgreSQL).
-- Designed to match the existing API contract with TEXT primary keys.

CREATE TABLE IF NOT EXISTS users (
  id          TEXT        PRIMARY KEY,
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL UNIQUE,
  phone       TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city        TEXT,
  state       TEXT,
  postal_code TEXT,
  country     TEXT,
  password_hash TEXT      NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'customer',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line1 TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_line2 TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS country TEXT;

CREATE TABLE IF NOT EXISTS quotes (
  id              TEXT        PRIMARY KEY,
  quote_item_id   TEXT        NOT NULL,
  quote_number    TEXT        NOT NULL UNIQUE,
  sku_code        TEXT        NOT NULL,
  input           JSONB       NOT NULL,
  unit_price      NUMERIC(10,4) NOT NULL,
  subtotal        NUMERIC(12,2) NOT NULL,
  shipping_estimate NUMERIC(12,2) NOT NULL,
  total           NUMERIC(12,2) NOT NULL,
  production_days INT         NOT NULL,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carts (
  id         TEXT        PRIMARY KEY,
  quote_id   TEXT        NOT NULL REFERENCES quotes(id),
  status     TEXT        NOT NULL DEFAULT 'active',
  subtotal   NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id            TEXT        PRIMARY KEY,
  cart_id       TEXT        NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  quote_item_id TEXT        NOT NULL,
  quantity      INT         NOT NULL,
  description   TEXT        NOT NULL,
  unit_price    NUMERIC(10,4) NOT NULL,
  line_total    NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id             TEXT        PRIMARY KEY,
  order_number   TEXT        NOT NULL UNIQUE,
  user_id        TEXT        REFERENCES users(id) ON DELETE SET NULL,
  cart_id        TEXT,
  status         TEXT        NOT NULL DEFAULT 'paid',
  payment_status TEXT        NOT NULL DEFAULT 'captured',
  shipping_method TEXT       NOT NULL,
  subtotal       NUMERIC(12,2) NOT NULL,
  shipping       NUMERIC(12,2) NOT NULL,
  tax            NUMERIC(12,2) NOT NULL,
  total          NUMERIC(12,2) NOT NULL,
  placed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id            TEXT        PRIMARY KEY,
  order_id      TEXT        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  cart_item_id  TEXT        NOT NULL,
  quote_item_id TEXT        NOT NULL,
  quantity      INT         NOT NULL,
  description   TEXT        NOT NULL,
  unit_price    NUMERIC(10,4) NOT NULL,
  line_total    NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS order_events (
  id           SERIAL      PRIMARY KEY,
  order_number TEXT        NOT NULL,
  status       TEXT        NOT NULL,
  message      TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order_number ON order_events(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

CREATE TABLE IF NOT EXISTS artworks (
  id          TEXT        PRIMARY KEY,
  filename    TEXT        NOT NULL,
  mimetype    TEXT        NOT NULL,
  data        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS artwork_id TEXT;
