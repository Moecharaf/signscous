-- PostgreSQL schema for Signscous Yard Signs end-to-end flow.
-- Covers: account -> quote -> artwork -> cart -> checkout -> order -> tracking.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT,
  is_trade_account BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE account_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  address_type TEXT NOT NULL CHECK (address_type IN ('billing', 'shipping')),
  label TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state_code TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'US',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  option_code TEXT NOT NULL,
  option_label TEXT NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('select', 'number')),
  is_required BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL,
  UNIQUE(product_id, option_code)
);

CREATE TABLE product_option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
  value_code TEXT NOT NULL,
  value_label TEXT NOT NULL,
  numeric_value NUMERIC(10,2),
  sort_order INT NOT NULL,
  UNIQUE(option_id, value_code)
);

CREATE TABLE yard_sign_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  width_in NUMERIC(6,2) NOT NULL,
  height_in NUMERIC(6,2) NOT NULL,
  material_code TEXT NOT NULL,
  sides_code TEXT NOT NULL,
  turnaround_code TEXT NOT NULL,
  min_qty INT NOT NULL,
  max_qty INT NOT NULL,
  unit_price NUMERIC(10,4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (min_qty > 0),
  CHECK (max_qty >= min_qty)
);

CREATE INDEX idx_yard_sign_pricing_lookup
ON yard_sign_pricing_rules (product_id, width_in, height_in, material_code, sides_code, turnaround_code, min_qty, max_qty);

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  quote_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'ready', 'expired', 'converted')),
  currency_code TEXT NOT NULL DEFAULT 'USD',
  subtotal_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  shipping_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  sku_code TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,4) NOT NULL,
  line_total NUMERIC(12,2) NOT NULL,
  production_days INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quote_item_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_item_id UUID NOT NULL REFERENCES quote_items(id) ON DELETE CASCADE,
  option_code TEXT NOT NULL,
  option_value_code TEXT NOT NULL,
  option_value_label TEXT NOT NULL,
  UNIQUE(quote_item_id, option_code)
);

CREATE TABLE artwork_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  quote_item_id UUID REFERENCES quote_items(id) ON DELETE SET NULL,
  storage_key TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_ext TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  checksum_sha256 TEXT,
  width_px INT,
  height_px INT,
  dpi INT,
  status TEXT NOT NULL CHECK (status IN ('uploaded', 'preflight_pending', 'preflight_failed', 'preflight_passed')),
  preflight_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'locked', 'converted', 'abandoned')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  quote_item_id UUID NOT NULL REFERENCES quote_items(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,4) NOT NULL,
  line_total NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  account_id UUID NOT NULL REFERENCES accounts(id),
  cart_id UUID REFERENCES carts(id),
  shipping_address_id UUID REFERENCES account_addresses(id),
  billing_address_id UUID REFERENCES account_addresses(id),
  status TEXT NOT NULL CHECK (status IN ('pending_payment', 'paid', 'preflight', 'in_production', 'packed', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('unpaid', 'authorized', 'captured', 'failed', 'refunded')),
  shipping_method TEXT NOT NULL,
  tracking_number TEXT,
  subtotal_amount NUMERIC(12,2) NOT NULL,
  shipping_amount NUMERIC(12,2) NOT NULL,
  tax_amount NUMERIC(12,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  sku_code TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,4) NOT NULL,
  line_total NUMERIC(12,2) NOT NULL,
  production_days INT NOT NULL,
  artwork_file_id UUID REFERENCES artwork_files(id)
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_payment_id TEXT,
  amount NUMERIC(12,2) NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Minimal seed data for Yard Signs product and options.
INSERT INTO products (slug, name, description)
VALUES ('yard-signs', 'Yard Signs', 'Coroplast yard signs for campaigns, retail, and real estate.');

WITH yard AS (
  SELECT id FROM products WHERE slug = 'yard-signs'
)
INSERT INTO product_options (product_id, option_code, option_label, input_type, is_required, sort_order)
SELECT id, 'size', 'Size', 'select', TRUE, 1 FROM yard
UNION ALL
SELECT id, 'material', 'Material', 'select', TRUE, 2 FROM yard
UNION ALL
SELECT id, 'sides', 'Print Sides', 'select', TRUE, 3 FROM yard
UNION ALL
SELECT id, 'quantity', 'Quantity', 'number', TRUE, 4 FROM yard
UNION ALL
SELECT id, 'turnaround', 'Turnaround', 'select', TRUE, 5 FROM yard;
