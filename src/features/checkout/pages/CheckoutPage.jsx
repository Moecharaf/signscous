import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { calculateCheckoutPrice, placeOrder } from '../api/checkoutApi';
import { calculateMockCheckoutPrice, placeMockOrder } from '../../../shared/mock/flowStore';
import { useAuth } from '../../../shared/auth/AuthContext';
import { linkArtworkToOrder, getCartArtworkId } from '../../../shared/mock/artworkStore';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartId } = useParams();
  const [totals, setTotals] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentError, setPaymentError] = useState('');

  function isCardValid() {
    const digits = cardNumber.replace(/\D/g, '');
    const cvvDigits = cardCvv.replace(/\D/g, '');
    const expiryOk = /^\d{2}\/\d{2}$/.test(cardExpiry);
    return cardName.trim().length >= 2 && digits.length >= 13 && digits.length <= 19 && expiryOk && cvvDigits.length >= 3 && cvvDigits.length <= 4;
  }

  function getPaymentMethodToken() {
    if (paymentMethod !== 'card') return `${paymentMethod}-demo-token`;
    const last4 = cardNumber.replace(/\D/g, '').slice(-4) || '0000';
    return `card-demo-${last4}`;
  }

  useEffect(() => {
    let isMounted = true;

    async function loadTotals() {
      try {
        const liveTotals = await calculateCheckoutPrice({
          cartId,
          shippingPostalCode: '77001',
          shippingMethod: 'ground',
        });
        if (isMounted) setTotals(liveTotals);
      } catch {
        const fallbackTotals = calculateMockCheckoutPrice(cartId, 'ground');
        if (isMounted) setTotals(fallbackTotals);
      }
    }

    loadTotals();
    return () => {
      isMounted = false;
    };
  }, [cartId]);

  async function handlePlaceOrder() {
    if (paymentMethod === 'card' && !isCardValid()) {
      setPaymentError('Please enter valid card details before placing the order.');
      return;
    }

    setPaymentError('');
    setIsLoading(true);
    try {
      const artworkId = getCartArtworkId(cartId);
      const response = await placeOrder({
        cartId,
        shippingAddressId: 'shipping-demo',
        billingAddressId: 'billing-demo',
        shippingMethod: 'ground',
        paymentMethod,
        paymentMethodToken: getPaymentMethodToken(),
        artworkId: artworkId || undefined,
      });
      linkArtworkToOrder(cartId, response.orderNumber);
      navigate(`/order-confirmation/${response.orderNumber}`);
    } catch {
      const fallbackOrder = placeMockOrder({
        cartId,
        shippingMethod: 'ground',
        userId: user?.id || null,
        paymentMethod,
      });
      linkArtworkToOrder(cartId, fallbackOrder.orderNumber);
      navigate(`/order-confirmation/${fallbackOrder.orderNumber}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 text-zinc-100">
      <h1 className="text-4xl font-black">Checkout</h1>
      <p className="mt-3 text-zinc-400">Enter addresses, choose shipping, complete payment, and place your order.</p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-5 text-sm text-zinc-300">
        Cart ID: <span className="font-semibold text-white">{cartId}</span>
      </div>

      {totals ? (
        <div className="mt-6 rounded-3xl border border-white/10 bg-zinc-950 p-6 text-sm text-zinc-300">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-white">${Number(totals.subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Shipping</span>
            <span className="font-semibold text-white">${Number(totals.shipping || 0).toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Tax</span>
            <span className="font-semibold text-white">${Number(totals.tax || 0).toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-3">
            <span>Total</span>
            <span className="text-lg font-bold text-white">${Number(totals.total || 0).toFixed(2)}</span>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-5 text-sm text-zinc-400">Calculating totals...</div>
      )}

      <div className="mt-6 rounded-3xl border border-white/10 bg-zinc-950 p-6 text-sm text-zinc-300">
        <div className="text-sm font-semibold text-zinc-200">Payment Method</div>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`rounded-xl border px-3 py-2 text-sm ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-500/10 text-orange-300' : 'border-white/10 bg-black/40 text-zinc-300 hover:bg-white/5'}`}
          >
            Credit/Debit Card
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('paypal')}
            className={`rounded-xl border px-3 py-2 text-sm ${paymentMethod === 'paypal' ? 'border-orange-500 bg-orange-500/10 text-orange-300' : 'border-white/10 bg-black/40 text-zinc-300 hover:bg-white/5'}`}
          >
            PayPal
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('apple_pay')}
            className={`rounded-xl border px-3 py-2 text-sm ${paymentMethod === 'apple_pay' ? 'border-orange-500 bg-orange-500/10 text-orange-300' : 'border-white/10 bg-black/40 text-zinc-300 hover:bg-white/5'}`}
          >
            Apple Pay
          </button>
        </div>

        {paymentMethod === 'card' ? (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs text-zinc-400 sm:col-span-2">
              Name on card
              <input
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-orange-500/70"
                placeholder="John Smith"
                autoComplete="cc-name"
              />
            </label>
            <label className="text-xs text-zinc-400 sm:col-span-2">
              Card number
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-orange-500/70"
                placeholder="4242 4242 4242 4242"
                autoComplete="cc-number"
              />
            </label>
            <label className="text-xs text-zinc-400">
              Expiry (MM/YY)
              <input
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-orange-500/70"
                placeholder="12/29"
                autoComplete="cc-exp"
              />
            </label>
            <label className="text-xs text-zinc-400">
              CVV
              <input
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-orange-500/70"
                placeholder="123"
                autoComplete="cc-csc"
              />
            </label>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-zinc-400">
            {paymentMethod === 'paypal'
              ? 'PayPal is enabled in demo mode. Your method will be saved on the order.'
              : 'Apple Pay is enabled in demo mode. Your method will be saved on the order.'}
          </div>
        )}

        {paymentError ? (
          <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{paymentError}</div>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={handlePlaceOrder} disabled={isLoading} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60">
          {isLoading ? 'Placing Order...' : 'Place Order'}
        </button>
        <Link to={`/cart/${cartId}`} className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/5">
          Back to Cart
        </Link>
      </div>
    </section>
  );
}
