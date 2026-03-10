/**
 * PostgreSQL-backed store.
 * Exports the same function signatures as lib/store.js but all are async.
 */
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import pool from './db.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${randomBytes(3).toString('hex')}`;
}

function makeOrderNumber() {
  return `SC-${Math.floor(100000 + Math.random() * 900000)}`;
}

function makeQuoteNumber() {
  return `Q-${Math.floor(100000 + Math.random() * 900000)}`;
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function createUser({ name, email, password }) {
  const existing = await pool.query(
    'SELECT id FROM users WHERE lower(email) = lower($1)',
    [email]
  );
  if (existing.rows.length > 0) {
    throw new Error('Email is already registered.');
  }

  const hash = await bcrypt.hash(password, 12);
  const id = makeId('user');
  const { rows } = await pool.query(
    `INSERT INTO users (id, name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, 'customer')
     RETURNING id, name, email, role, created_at`,
    [id, name, email, hash]
  );
  return rows[0];
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE lower(email) = lower($1)',
    [email]
  );
  return rows[0] || null;
}

export async function findUserById(userId) {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  return rows[0] || null;
}

export async function verifyPassword(user, plainPassword) {
  return bcrypt.compare(plainPassword, user.password_hash);
}

export function sanitizeUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// ── Product config (static — no DB round-trip needed) ─────────────────────────

export function getYardSignsConfig() {
  return {
    productSlug: 'yard-signs',
    options: [
      {
        code: 'size',
        label: 'Size',
        values: [
          { code: '18x24', label: '18x24' },
          { code: '24x18', label: '24x18' },
          { code: '24x36', label: '24x36' },
        ],
      },
      {
        code: 'material',
        label: 'Material',
        values: [
          { code: 'coroplast_4mm', label: '4mm Coroplast' },
          { code: 'coroplast_10mm', label: '10mm Coroplast' },
        ],
      },
      {
        code: 'sides',
        label: 'Print Sides',
        values: [
          { code: 'single_sided', label: 'Single-sided' },
          { code: 'double_sided', label: 'Double-sided' },
        ],
      },
      {
        code: 'turnaround',
        label: 'Turnaround',
        values: [
          { code: 'standard_48h', label: 'Standard 48h' },
          { code: 'rush_24h', label: 'Rush 24h' },
        ],
      },
    ],
  };
}

// ── Quotes ────────────────────────────────────────────────────────────────────

export async function createQuote(input) {
  const quantity = Number(input.quantity || 1);
  const unitPrice = Number(
    (2.45 + (input.sides === 'double_sided' ? 0.55 : 0)).toFixed(2)
  );
  const subtotal = Number((quantity * unitPrice).toFixed(2));
  const shippingEstimate = 24;
  const total = Number((subtotal + shippingEstimate).toFixed(2));

  const quoteId = makeId('quote');
  const quoteItemId = makeId('qi');
  const quoteNumber = makeQuoteNumber();
  const skuCode = `YS-${input.size}-${input.material}-${input.sides}`;
  const productionDays = input.turnaround === 'rush_24h' ? 1 : 2;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  await pool.query(
    `INSERT INTO quotes
       (id, quote_item_id, quote_number, sku_code, input,
        unit_price, subtotal, shipping_estimate, total, production_days, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [
      quoteId, quoteItemId, quoteNumber, skuCode, JSON.stringify(input),
      unitPrice, subtotal, shippingEstimate, total, productionDays, expiresAt,
    ]
  );

  return {
    quoteId,
    quoteItemId,
    quoteNumber,
    skuCode,
    input,
    unitPrice,
    subtotal,
    shippingEstimate,
    total,
    productionDays,
    expiresAt,
  };
}

export async function getQuote(quoteId) {
  const { rows } = await pool.query('SELECT * FROM quotes WHERE id = $1', [quoteId]);
  if (!rows[0]) return null;
  const q = rows[0];
  return {
    quoteId: q.id,
    quoteItemId: q.quote_item_id,
    quoteNumber: q.quote_number,
    skuCode: q.sku_code,
    input: q.input,
    unitPrice: Number(q.unit_price),
    subtotal: Number(q.subtotal),
    shippingEstimate: Number(q.shipping_estimate),
    total: Number(q.total),
    productionDays: q.production_days,
    expiresAt: q.expires_at,
  };
}

// ── Carts ─────────────────────────────────────────────────────────────────────

export async function createCart(quoteId) {
  const quote = await getQuote(quoteId);
  if (!quote) throw new Error('Quote not found.');

  const cartId = makeId('cart');
  await pool.query(
    `INSERT INTO carts (id, quote_id, status, subtotal) VALUES ($1,$2,'active',0)`,
    [cartId, quoteId]
  );

  return { cartId, quoteId, status: 'active', items: [], subtotal: 0 };
}

export async function addCartItem(cartId, quoteItemId, quantity) {
  const { rows: cartRows } = await pool.query('SELECT * FROM carts WHERE id = $1', [cartId]);
  if (!cartRows[0]) throw new Error('Cart not found.');
  const cart = cartRows[0];

  const quote = await getQuote(cart.quote_id);
  if (!quote || quote.quoteItemId !== quoteItemId) {
    throw new Error('Quote item not found.');
  }

  const itemQuantity = Number(quantity || quote.input.quantity || 1);
  const lineTotal = Number((quote.unitPrice * itemQuantity).toFixed(2));
  const description = `Yard Signs ${quote.input.size}, ${quote.input.sides.replace('_', '-')}`;
  const cartItemId = makeId('ci');

  // Replace any existing cart item for this quote item.
  await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
  await pool.query(
    `INSERT INTO cart_items (id, cart_id, quote_item_id, quantity, description, unit_price, line_total)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [cartItemId, cartId, quoteItemId, itemQuantity, description, quote.unitPrice, lineTotal]
  );

  await pool.query('UPDATE carts SET subtotal = $1 WHERE id = $2', [lineTotal, cartId]);

  return getCart(cartId);
}

export async function getCart(cartId) {
  const { rows: cartRows } = await pool.query('SELECT * FROM carts WHERE id = $1', [cartId]);
  if (!cartRows[0]) return null;
  const c = cartRows[0];

  const { rows: items } = await pool.query(
    'SELECT * FROM cart_items WHERE cart_id = $1',
    [cartId]
  );

  return {
    cartId: c.id,
    quoteId: c.quote_id,
    status: c.status,
    subtotal: Number(c.subtotal),
    items: items.map((i) => ({
      cartItemId: i.id,
      quoteItemId: i.quote_item_id,
      quantity: i.quantity,
      description: i.description,
      unitPrice: Number(i.unit_price),
      lineTotal: Number(i.line_total),
    })),
  };
}

// ── Checkout ──────────────────────────────────────────────────────────────────

export async function getCheckoutTotals(cartId, shippingMethod) {
  const cart = await getCart(cartId);
  if (!cart) throw new Error('Cart not found.');

  const shippingMap = { ground: 24, two_day: 42, overnight: 68 };
  const shipping = shippingMap[shippingMethod] || 24;
  const tax = Number((cart.subtotal * 0.07).toFixed(2));
  const total = Number((cart.subtotal + shipping + tax).toFixed(2));

  return { subtotal: cart.subtotal, shipping, tax, total };
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function placeOrder({ userId, cartId, shippingMethod }) {
  const cart = await getCart(cartId);
  if (!cart) throw new Error('Cart not found.');

  const totals = await getCheckoutTotals(cartId, shippingMethod || 'ground');
  const orderNumber = makeOrderNumber();
  const orderId = makeId('order');
  const now = new Date().toISOString();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO orders
         (id, order_number, user_id, cart_id, status, payment_status,
          shipping_method, subtotal, shipping, tax, total)
       VALUES ($1,$2,$3,$4,'paid','captured',$5,$6,$7,$8,$9)`,
      [orderId, orderNumber, userId || null, cartId,
       shippingMethod || 'ground', totals.subtotal, totals.shipping, totals.tax, totals.total]
    );

    for (const item of cart.items) {
      await client.query(
        `INSERT INTO order_items
           (id, order_id, cart_item_id, quote_item_id, quantity, description, unit_price, line_total)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [makeId('oi'), orderId, item.cartItemId, item.quoteItemId,
         item.quantity, item.description, item.unitPrice, item.lineTotal]
      );
    }

    await client.query(
      `INSERT INTO order_events (order_number, status, message, created_at) VALUES
       ($1, 'paid', 'Payment captured successfully.', $2),
       ($1, 'preflight', 'Artwork preflight passed.', $2)`,
      [orderNumber, now]
    );

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return { orderId, orderNumber, status: 'paid', paymentStatus: 'captured' };
}

export async function getOrder(orderNumber) {
  const { rows } = await pool.query(
    'SELECT * FROM orders WHERE order_number = $1',
    [orderNumber]
  );
  if (!rows[0]) return null;
  const o = rows[0];

  const { rows: items } = await pool.query(
    'SELECT * FROM order_items WHERE order_id = $1',
    [o.id]
  );

  return {
    orderId: o.id,
    orderNumber: o.order_number,
    userId: o.user_id,
    status: o.status,
    paymentStatus: o.payment_status,
    shippingMethod: o.shipping_method,
    totals: {
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      tax: Number(o.tax),
      total: Number(o.total),
    },
    items: items.map((i) => ({
      cartItemId: i.cart_item_id,
      quoteItemId: i.quote_item_id,
      quantity: i.quantity,
      description: i.description,
      unitPrice: Number(i.unit_price),
      lineTotal: Number(i.line_total),
    })),
    createdAt: o.placed_at,
  };
}

export async function getOrderTimeline(orderNumber) {
  const { rows } = await pool.query(
    'SELECT status, message, created_at AS at FROM order_events WHERE order_number = $1 ORDER BY id',
    [orderNumber]
  );
  return rows;
}

export async function getOrdersByUser(userId) {
  const { rows } = await pool.query(
    'SELECT * FROM orders WHERE user_id = $1 ORDER BY placed_at DESC',
    [userId]
  );
  return rows.map((o) => ({
    orderId: o.id,
    orderNumber: o.order_number,
    userId: o.user_id,
    status: o.status,
    totals: {
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      tax: Number(o.tax),
      total: Number(o.total),
    },
    createdAt: o.placed_at,
  }));
}

export async function getAllOrders() {
  const { rows } = await pool.query('SELECT * FROM orders ORDER BY placed_at DESC');
  return rows.map((o) => ({
    orderId: o.id,
    orderNumber: o.order_number,
    userId: o.user_id,
    status: o.status,
    totals: {
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      tax: Number(o.tax),
      total: Number(o.total),
    },
    createdAt: o.placed_at,
  }));
}

export async function updateOrderStatus(orderNumber, status) {
  const { rows } = await pool.query(
    'UPDATE orders SET status = $1 WHERE order_number = $2 RETURNING *',
    [status, orderNumber]
  );
  if (!rows[0]) throw new Error('Order not found.');

  await pool.query(
    `INSERT INTO order_events (order_number, status, message) VALUES ($1, $2, $3)`,
    [orderNumber, status, `Order status changed to ${status}.`]
  );

  const o = rows[0];
  return {
    orderId: o.id,
    orderNumber: o.order_number,
    status: o.status,
    totals: {
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      tax: Number(o.tax),
      total: Number(o.total),
    },
    createdAt: o.placed_at,
  };
}
