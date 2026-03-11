const store = {
  users: [
    {
      id: 'admin-1',
      name: 'Signscous Admin',
      email: 'admin@signscous.com',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      password: 'admin123',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
  ],
  quotes: {},
  carts: {},
  orders: {},
  timeline: {},
};

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function makeOrderNumber() {
  return `SC-${Math.floor(100000 + Math.random() * 900000)}`;
}

function makeQuoteNumber() {
  return `Q-${Math.floor(100000 + Math.random() * 900000)}`;
}

function buildItemDescription(quote) {
  const sku = quote.skuCode || '';
  const prefix = sku.split('-')[0];
  const productNameMap = {
    YS: 'Yard Signs',
    BN: 'Banners',
    AL: 'Aluminum Signs',
    PVC: 'PVC Signs',
    ACR: 'Acrylic Signs',
    WIN: 'Window Graphics',
  };
  const productName = productNameMap[prefix] || 'Custom Signs';
  const parts = [];

  if (quote.input?.size) parts.push(quote.input.size);
  if (quote.input?.sides) parts.push(quote.input.sides.replace('_', '-'));
  if (quote.input?.material) parts.push(quote.input.material.replace('_', ' '));
  if (quote.input?.thickness) parts.push(quote.input.thickness);

  return `${productName}${parts.length ? ` ${parts.join(', ')}` : ''}`;
}

export function createUser({
  name,
  email,
  password,
  phone,
  addressLine1,
  addressLine2,
  city,
  state,
  postalCode,
  country,
}) {
  const existing = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    throw new Error('Email is already registered.');
  }

  const user = {
    id: makeId('user'),
    name,
    email,
    phone,
    addressLine1,
    addressLine2: addressLine2 || '',
    city,
    state,
    postalCode,
    country: country || 'US',
    password,
    role: 'customer',
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  return user;
}

export function findUserByEmail(email) {
  return store.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export function findUserById(userId) {
  return store.users.find((u) => u.id === userId) || null;
}

export function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    addressLine1: user.addressLine1 || '',
    addressLine2: user.addressLine2 || '',
    city: user.city || '',
    state: user.state || '',
    postalCode: user.postalCode || '',
    country: user.country || 'US',
    role: user.role,
  };
}

export function getAllUsers() {
  return store.users
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .map((user) => sanitizeUser(user));
}

export function getYardSignsConfig() {
  return {
    productSlug: 'yard-signs',
    options: [
      { code: 'size', label: 'Size', values: [{ code: '18x24', label: '18x24' }, { code: '24x18', label: '24x18' }, { code: '24x36', label: '24x36' }] },
      { code: 'material', label: 'Material', values: [{ code: 'coroplast_4mm', label: '4mm Coroplast' }, { code: 'coroplast_10mm', label: '10mm Coroplast' }] },
      { code: 'sides', label: 'Print Sides', values: [{ code: 'single_sided', label: 'Single-sided' }, { code: 'double_sided', label: 'Double-sided' }] },
      { code: 'turnaround', label: 'Turnaround', values: [{ code: 'standard_48h', label: 'Standard 48h' }, { code: 'rush_24h', label: 'Rush 24h' }] },
    ],
  };
}

export function createQuote(input) {
  const quantity = Number(input.quantity || 1);
  const unitPrice = Number((2.45 + (input.sides === 'double_sided' ? 0.55 : 0)).toFixed(2));
  const subtotal = Number((quantity * unitPrice).toFixed(2));
  const shippingEstimate = 24;
  const total = Number((subtotal + shippingEstimate).toFixed(2));

  const quoteId = makeId('quote');
  const quoteItemId = makeId('qi');

  const quote = {
    quoteId,
    quoteItemId,
    quoteNumber: makeQuoteNumber(),
    skuCode: `YS-${input.size}-${input.material}-${input.sides}`,
    input,
    unitPrice,
    subtotal,
    shippingEstimate,
    total,
    productionDays: input.turnaround === 'rush_24h' ? 1 : 2,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  store.quotes[quoteId] = quote;
  return quote;
}

// shared helper used by all product quote creators
function buildQuote({ input, unitPrice, skuCode, productionDays }) {
  const quantity = Number(input.quantity || 1);
  const subtotal = Number((quantity * unitPrice).toFixed(2));
  const shippingEstimate = 24;
  const total = Number((subtotal + shippingEstimate).toFixed(2));
  const quoteId = makeId('quote');
  const quoteItemId = makeId('qi');
  const quoteNumber = makeQuoteNumber();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const quote = { quoteId, quoteItemId, quoteNumber, skuCode, input, unitPrice, subtotal, shippingEstimate, total, productionDays, expiresAt };
  store.quotes[quoteId] = quote;
  return quote;
}

export function createBannersQuote(input) {
  const sizeMultipliers = { '2x4': 1.0, '2x6': 1.3, '3x6': 1.6, '3x8': 2.0, '4x8': 2.5, '4x10': 3.0 };
  const basePrice = 3.50 * (sizeMultipliers[input.size] || 1.0);
  const unitPrice = Number((basePrice + (input.sides === 'double_sided' ? 1.50 : 0)).toFixed(2));
  return buildQuote({ input, unitPrice, skuCode: `BN-${input.size}-${input.material}-${input.sides}`, productionDays: input.turnaround === 'rush_24h' ? 1 : 2 });
}

export function createAluminumSignsQuote(input) {
  const sizeMultipliers = { '12x18': 1.0, '18x24': 1.5, '24x36': 2.5 };
  const basePrice = 5.00 * (sizeMultipliers[input.size] || 1.0);
  const unitPrice = Number((basePrice + (input.thickness === '063' ? 1.50 : 0) + (input.sides === 'double_sided' ? 2.00 : 0)).toFixed(2));
  return buildQuote({ input, unitPrice, skuCode: `AL-${input.size}-${input.thickness}-${input.sides}`, productionDays: input.turnaround === 'rush_24h' ? 1 : 2 });
}

export function createPvcSignsQuote(input) {
  const sizeMultipliers = { '12x18': 1.0, '18x24': 1.5, '24x36': 2.5 };
  const basePrice = 4.00 * (sizeMultipliers[input.size] || 1.0);
  const unitPrice = Number((basePrice + (input.thickness === '6mm' ? 1.00 : 0) + (input.sides === 'double_sided' ? 1.50 : 0)).toFixed(2));
  return buildQuote({ input, unitPrice, skuCode: `PVC-${input.size}-${input.thickness}-${input.sides}`, productionDays: input.turnaround === 'rush_24h' ? 1 : 2 });
}

export function createAcrylicSignsQuote(input) {
  const sizeMultipliers = { '12x18': 1.0, '18x24': 1.6, '24x36': 2.8 };
  const basePrice = 8.00 * (sizeMultipliers[input.size] || 1.0);
  const unitPrice = Number((basePrice + (input.thickness === '6mm' ? 2.00 : 0)).toFixed(2));
  return buildQuote({ input, unitPrice, skuCode: `ACR-${input.size}-${input.thickness}-${input.printStyle}`, productionDays: input.turnaround === 'rush_24h' ? 1 : 2 });
}

export function createWindowGraphicsQuote(input) {
  const sizeMultipliers = { '24x36': 1.0, '36x48': 1.8, '48x60': 2.8 };
  const basePrice = 5.50 * (sizeMultipliers[input.size] || 1.0);
  const unitPrice = Number((basePrice + (input.material === 'perforated_vinyl' ? 1.00 : 0)).toFixed(2));
  return buildQuote({ input, unitPrice, skuCode: `WIN-${input.size}-${input.material}-${input.installSurface}`, productionDays: input.turnaround === 'rush_24h' ? 1 : 2 });
}

export function getQuote(quoteId) {
  return store.quotes[quoteId] || null;
}

export function createCart(quoteId) {
  const quote = getQuote(quoteId);
  if (!quote) throw new Error('Quote not found.');

  const cart = {
    cartId: makeId('cart'),
    quoteId,
    status: 'active',
    items: [],
    subtotal: 0,
  };

  store.carts[cart.cartId] = cart;
  return cart;
}

export function addCartItem(cartId, quoteItemId, quantity) {
  const cart = store.carts[cartId];
  if (!cart) throw new Error('Cart not found.');

  const quote = getQuote(cart.quoteId);
  if (!quote || quote.quoteItemId !== quoteItemId) {
    throw new Error('Quote item not found.');
  }

  const itemQuantity = Number(quantity || quote.input.quantity || 1);
  const lineTotal = Number((quote.unitPrice * itemQuantity).toFixed(2));

  const item = {
    cartItemId: makeId('ci'),
    quoteItemId,
    quantity: itemQuantity,
    description: buildItemDescription(quote),
    unitPrice: quote.unitPrice,
    lineTotal,
  };

  cart.items = [item];
  cart.subtotal = lineTotal;
  return cart;
}

export function getCart(cartId) {
  return store.carts[cartId] || null;
}

export function getCheckoutTotals(cartId, shippingMethod) {
  const cart = getCart(cartId);
  if (!cart) throw new Error('Cart not found.');

  const shippingMap = { ground: 24, two_day: 42, overnight: 68 };
  const shipping = shippingMap[shippingMethod] || 24;
  const tax = Number((cart.subtotal * 0.07).toFixed(2));
  const total = Number((cart.subtotal + shipping + tax).toFixed(2));

  return { subtotal: cart.subtotal, shipping, tax, total };
}

export function placeOrder({ userId, cartId, shippingMethod }) {
  const cart = getCart(cartId);
  if (!cart) throw new Error('Cart not found.');

  const totals = getCheckoutTotals(cartId, shippingMethod || 'ground');
  const orderNumber = makeOrderNumber();

  const order = {
    orderId: makeId('order'),
    orderNumber,
    userId,
    status: 'paid',
    paymentStatus: 'captured',
    items: cart.items,
    totals,
    createdAt: new Date().toISOString(),
  };

  store.orders[orderNumber] = order;
  store.timeline[orderNumber] = [
    { status: 'paid', message: 'Payment captured successfully.', at: new Date().toISOString() },
    { status: 'preflight', message: 'Artwork preflight passed.', at: new Date().toISOString() },
  ];

  return {
    orderId: order.orderId,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
  };
}

export function getOrder(orderNumber) {
  return store.orders[orderNumber] || null;
}

export function getOrderTimeline(orderNumber) {
  return store.timeline[orderNumber] || [];
}

export function getOrdersByUser(userId) {
  return Object.values(store.orders)
    .filter((o) => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getAllOrders() {
  return Object.values(store.orders).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function updateOrderStatus(orderNumber, status) {
  const order = getOrder(orderNumber);
  if (!order) throw new Error('Order not found.');

  order.status = status;
  const events = store.timeline[orderNumber] || [];
  events.push({ status, message: `Order status changed to ${status}.`, at: new Date().toISOString() });
  store.timeline[orderNumber] = events;

  return order;
}
