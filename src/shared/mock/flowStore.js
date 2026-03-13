const STORAGE_KEY = 'signscous-flow-store-v1';

function safeRead() {
  if (typeof window === 'undefined') {
    return { quotes: {}, carts: {}, orders: {}, timeline: {} };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { quotes: {}, carts: {}, orders: {}, timeline: {} };

  try {
    return JSON.parse(raw);
  } catch {
    return { quotes: {}, carts: {}, orders: {}, timeline: {} };
  }
}

function safeWrite(data) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function makeOrderNumber() {
  return `SC-${Math.floor(100000 + Math.random() * 900000)}`;
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

export function createMockQuote(input) {
  const store = safeRead();

  const quoteId = makeId('quote');
  const quoteItemId = makeId('qi');
  const quoteNumber = `Q-${Math.floor(100000 + Math.random() * 900000)}`;
  const unitPrice = Number((2.45 + (input.sides === 'double_sided' ? 0.55 : 0)).toFixed(2));
  const subtotal = Number((unitPrice * Number(input.quantity || 1)).toFixed(2));
  const shippingEstimate = 24;
  const total = Number((subtotal + shippingEstimate).toFixed(2));

  const quote = {
    quoteId,
    quoteItemId,
    quoteNumber,
    input,
    skuCode: `YS-${input.size}-${input.material}-${input.sides}`,
    unitPrice,
    subtotal,
    shippingEstimate,
    total,
    productionDays: input.turnaround === 'rush_24h' ? 1 : 2,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  };

  store.quotes[quoteId] = quote;
  safeWrite(store);
  return quote;
}

export function getMockQuote(quoteId) {
  const store = safeRead();
  return store.quotes[quoteId] || null;
}

export function createMockCartFromQuote(quoteId, quantityOverride) {
  const store = safeRead();
  const quote = store.quotes[quoteId];
  if (!quote) throw new Error('Quote not found.');

  const cartId = makeId('cart');
  const quantity = Number(quantityOverride || quote.input.quantity || 1);
  const lineTotal = Number((quote.unitPrice * quantity).toFixed(2));

  const cart = {
    cartId,
    quoteId,
    status: 'active',
    items: [
      {
        cartItemId: makeId('ci'),
        quoteItemId: quote.quoteItemId,
          description: buildItemDescription(quote),
        quantity,
        unitPrice: quote.unitPrice,
        lineTotal,
      },
    ],
    subtotal: lineTotal,
  };

  store.carts[cartId] = cart;
  safeWrite(store);
  return cart;
}

export function getMockCart(cartId) {
  const store = safeRead();
  return store.carts[cartId] || null;
}

export function calculateMockCheckoutPrice(cartId, shippingMethod = 'ground') {
  const cart = getMockCart(cartId);
  if (!cart) throw new Error('Cart not found.');

  const shippingMap = { ground: 24, two_day: 42, overnight: 68 };
  const shipping = shippingMap[shippingMethod] || 24;
  const tax = Number((cart.subtotal * 0.07).toFixed(2));
  const total = Number((cart.subtotal + shipping + tax).toFixed(2));

  return {
    subtotal: cart.subtotal,
    shipping,
    tax,
    total,
  };
}

export function placeMockOrder({ cartId, shippingMethod = 'ground', userId = null, paymentMethod = 'card' }) {
  const store = safeRead();
  const cart = store.carts[cartId];
  if (!cart) throw new Error('Cart not found.');

  const totals = calculateMockCheckoutPrice(cartId, shippingMethod);
  const orderId = makeId('order');
  const orderNumber = makeOrderNumber();

  const order = {
    orderId,
    orderNumber,
    userId,
    status: 'paid',
    paymentStatus: 'captured',
    paymentMethod,
    createdAt: new Date().toISOString(),
    items: cart.items,
    totals,
  };

  store.orders[orderNumber] = order;
  store.timeline[orderNumber] = [
    { status: 'Paid', message: 'Payment captured successfully.', at: new Date().toISOString() },
    { status: 'Preflight', message: 'Artwork preflight passed.', at: new Date().toISOString() },
    { status: 'In Production', message: 'Job entered print queue.', at: new Date().toISOString() },
  ];
  safeWrite(store);

  return {
    orderId,
    orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
  };
}

export function getMockOrderSummary(orderNumber) {
  const store = safeRead();
  return store.orders[orderNumber] || null;
}

export function getMockOrderTimeline(orderNumber) {
  const store = safeRead();
  return store.timeline[orderNumber] || [];
}

export function getAllMockOrders() {
  const store = safeRead();
  return Object.values(store.orders).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export function getMyMockOrders(userId) {
  if (!userId) return [];
  const store = safeRead();
  return Object.values(store.orders)
    .filter((order) => order.userId === userId)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

export function updateMockOrderStatus(orderNumber, status) {
  const store = safeRead();
  const order = store.orders[orderNumber];
  if (!order) throw new Error('Order not found.');

  order.status = status;
  store.timeline[orderNumber] = [
    ...(store.timeline[orderNumber] || []),
    { status, message: `Order status changed to ${status}.`, at: new Date().toISOString() },
  ];

  safeWrite(store);
  return order;
}
