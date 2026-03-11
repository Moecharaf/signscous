import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';

// Use PostgreSQL store when DATABASE_URL is configured; fall back to in-memory.
const USE_PG = Boolean(process.env.DATABASE_URL);

let store;
if (USE_PG) {
  store = await import('./lib/pgStore.js');
  const { migrate } = await import('./db/migrate.js');
  await migrate();
  console.log('[api] Using PostgreSQL store.');
} else {
  store = await import('./lib/store.js');
  console.log('[api] DATABASE_URL not set — using in-memory store (data will not persist).');
}

const {
  addCartItem,
  createCart,
  createQuote,
  createUser,
  findUserByEmail,
  findUserById,
  getAllOrders,
  getCart,
  getCheckoutTotals,
  getOrder,
  getOrderTimeline,
  getOrdersByUser,
  getQuote,
  getYardSignsConfig,
  placeOrder,
  sanitizeUser,
  updateOrderStatus,
  verifyPassword,
} = store;

const createBannersQuote = store.createBannersQuote;
const createAluminumSignsQuote = store.createAluminumSignsQuote;
const createPvcSignsQuote = store.createPvcSignsQuote;

const app = express();
const port = Number(process.env.PORT || 8787);
const jwtSecret = process.env.JWT_SECRET || 'change-this-secret';
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: '7d' });
}

async function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing auth token.' });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ error: 'Invalid user.' });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token.' });
  }
}

function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  return next();
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, store: USE_PG ? 'postgres' : 'memory' });
});

app.post('/v1/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required.' });
    }
    const user = await createUser({ name, email, password });
    const token = signToken(user);
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    return res.status(400).json({ error: err.message || 'Signup failed.' });
  }
});

app.post('/v1/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // pgStore uses bcrypt hash; in-memory store stores plain password.
  const passwordOk = verifyPassword
    ? await verifyPassword(user, password)
    : user.password === password;

  if (!passwordOk) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken(user);
  return res.json({ token, user: sanitizeUser(user) });
});

app.get('/v1/auth/me', authRequired, (req, res) => {
  res.json(sanitizeUser(req.user));
});

app.get('/v1/products/yard-signs/config', (_req, res) => {
  res.json(getYardSignsConfig());
});

app.post('/v1/quotes/yard-signs', async (req, res) => {
  const { size, material, sides, quantity, turnaround } = req.body || {};
  if (!size || !material || !sides || !quantity || !turnaround) {
    return res.status(400).json({ error: 'Incomplete quote payload.' });
  }
  try {
    const quote = await createQuote(req.body);
    return res.json(quote);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});
  
app.post('/v1/quotes/banners', async (req, res) => {
  const { size, material, sides, finishing, quantity, turnaround } = req.body || {};
  if (!size || !material || !sides || !finishing || !quantity || !turnaround) {
    return res.status(400).json({ error: 'Incomplete quote payload.' });
  }
  try {
    const quote = await createBannersQuote(req.body);
    return res.json(quote);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/v1/quotes/aluminum-signs', async (req, res) => {
  const { size, thickness, sides, finishing, quantity, turnaround } = req.body || {};
  if (!size || !thickness || !sides || !finishing || !quantity || !turnaround) {
    return res.status(400).json({ error: 'Incomplete quote payload.' });
  }
  try {
    const quote = await createAluminumSignsQuote(req.body);
    return res.json(quote);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/v1/quotes/pvc-signs', async (req, res) => {
  const { size, thickness, sides, finishing, quantity, turnaround } = req.body || {};
  if (!size || !thickness || !sides || !finishing || !quantity || !turnaround) {
    return res.status(400).json({ error: 'Incomplete quote payload.' });
  }
  try {
    const quote = await createPvcSignsQuote(req.body);
    return res.json(quote);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/v1/artwork/uploads/presign', (_req, res) => {
  const artworkId = `art-${Date.now()}`;
  return res.json({
    artworkId,
    uploadUrl: 'https://example-upload.local/mock',
    uploadMethod: 'PUT',
    uploadHeaders: {},
    storageKey: `artwork/${artworkId}`,
  });
});

app.post('/v1/artwork/uploads/complete', (req, res) => {
  const { artworkId } = req.body || {};
  return res.json({ artworkId, status: 'preflight_pending' });
});

app.post('/v1/carts', async (req, res) => {
  try {
    const { quoteId } = req.body || {};
    if (!quoteId) return res.status(400).json({ error: 'quoteId is required.' });
    const cart = await createCart(quoteId);
    return res.status(201).json(cart);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/v1/carts/:cartId/items', async (req, res) => {
  try {
    const { cartId } = req.params;
    const { quoteItemId, quantity } = req.body || {};
    const cart = await addCartItem(cartId, quoteItemId, quantity);
    return res.json(cart);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.get('/v1/carts/:cartId', async (req, res) => {
  const cart = await getCart(req.params.cartId);
  if (!cart) return res.status(404).json({ error: 'Cart not found.' });
  return res.json(cart);
});

app.post('/v1/checkout/price', async (req, res) => {
  try {
    const { cartId, shippingMethod } = req.body || {};
    const totals = await getCheckoutTotals(cartId, shippingMethod || 'ground');
    return res.json(totals);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/v1/orders', authRequired, async (req, res) => {
  try {
    const { cartId, shippingMethod } = req.body || {};
    const result = await placeOrder({
      userId: req.user.id,
      cartId,
      shippingMethod: shippingMethod || 'ground',
    });
    return res.status(201).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.get('/v1/orders/:orderNumber', authRequired, async (req, res) => {
  const order = await getOrder(req.params.orderNumber);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  if (req.user.role !== 'admin' && order.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not allowed to access this order.' });
  }

  return res.json(order);
});

app.get('/v1/orders/:orderNumber/timeline', authRequired, async (req, res) => {
  const order = await getOrder(req.params.orderNumber);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  if (req.user.role !== 'admin' && order.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not allowed to access this order.' });
  }

  const events = await getOrderTimeline(req.params.orderNumber);
  return res.json({ orderNumber: req.params.orderNumber, events });
});

app.get('/v1/account/orders', authRequired, async (req, res) => {
  const orders = await getOrdersByUser(req.user.id);
  return res.json({ orders });
});

app.get('/v1/admin/orders', authRequired, adminRequired, async (_req, res) => {
  const orders = await getAllOrders();
  return res.json({ orders });
});

app.patch('/v1/admin/orders/:orderNumber/status', authRequired, adminRequired, async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ error: 'status is required.' });
    const order = await updateOrderStatus(req.params.orderNumber, status);
    return res.json({ order });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Signscous API running on http://localhost:${port}`);
});
