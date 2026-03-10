import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCart } from '../api/cartApi';
import { getMockCart } from '../../../shared/mock/flowStore';

export default function CartPage() {
  const { cartId } = useParams();
  const [cart, setCart] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCart() {
      try {
        const liveCart = await getCart(cartId);
        if (isMounted) setCart(liveCart);
      } catch {
        const fallback = getMockCart(cartId);
        if (isMounted) setCart(fallback);
      }
    }

    loadCart();
    return () => {
      isMounted = false;
    };
  }, [cartId]);

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 text-zinc-100">
      <h1 className="text-4xl font-black">Cart</h1>
      <p className="mt-3 text-zinc-400">Review line items, update quantity, and proceed to checkout.</p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-5 text-sm text-zinc-300">
        Cart ID: <span className="font-semibold text-white">{cartId}</span>
      </div>

      {cart ? (
        <div className="mt-6 rounded-3xl border border-white/10 bg-zinc-950 p-6 text-zinc-300">
          {cart.items?.map((item) => (
            <div key={item.cartItemId || item.quoteItemId} className="flex items-center justify-between border-b border-white/10 pb-3 text-sm">
              <span>{item.description || `Quote Item ${item.quoteItemId}`}</span>
              <span className="font-semibold text-white">${Number(item.lineTotal || 0).toFixed(2)}</span>
            </div>
          ))}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold text-white">${Number(cart.subtotal || 0).toFixed(2)}</span>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-5 text-sm text-zinc-400">Loading cart...</div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link to={`/checkout/${cartId}`} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-400">
          Continue to Checkout
        </Link>
        <Link to="/yard-signs" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/5">
          Back to Quote
        </Link>
      </div>
    </section>
  );
}
