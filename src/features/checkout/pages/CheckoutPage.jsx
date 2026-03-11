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
    setIsLoading(true);
    try {
      const artworkId = getCartArtworkId(cartId);
      const response = await placeOrder({
        cartId,
        shippingAddressId: 'shipping-demo',
        billingAddressId: 'billing-demo',
        shippingMethod: 'ground',
        paymentMethodToken: 'demo-token',
        artworkId: artworkId || undefined,
      });
      linkArtworkToOrder(cartId, response.orderNumber);
      navigate(`/order-confirmation/${response.orderNumber}`);
    } catch {
      const fallbackOrder = placeMockOrder({ cartId, shippingMethod: 'ground', userId: user?.id || null });
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

      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={handlePlaceOrder} disabled={isLoading} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60">
          {isLoading ? 'Placing Order...' : 'Place Demo Order'}
        </button>
        <Link to={`/cart/${cartId}`} className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/5">
          Back to Cart
        </Link>
      </div>
    </section>
  );
}
