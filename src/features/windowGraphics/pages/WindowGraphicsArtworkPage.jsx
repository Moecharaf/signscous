import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { addQuoteItemToCart, createCartFromQuote } from '../../cart/api/cartApi';
import { createMockCartFromQuote, getMockQuote } from '../../../shared/mock/flowStore';

const artworkExamples = [
  '/products/window-graphics/window-storefront.svg',
  '/products/window-graphics/window-hours.svg',
];

export default function WindowGraphicsArtworkPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { quoteId } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const quote = location.state || getMockQuote(quoteId);

  async function handleAddToCart() {
    setIsLoading(true);
    try {
      const cart = await createCartFromQuote(quoteId);
      if (quote?.quoteItemId) {
        await addQuoteItemToCart(cart.cartId, quote.quoteItemId, quote.input?.quantity || 1);
      }
      navigate(`/cart/${cart.cartId}`);
    } catch {
      const fallbackCart = createMockCartFromQuote(quoteId, quote?.input?.quantity || 1);
      navigate(`/cart/${fallbackCart.cartId}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 text-zinc-100">
      <h1 className="text-4xl font-black">Upload Artwork — Window Graphics</h1>
      <p className="mt-3 text-zinc-400">Upload print-ready files and track preflight status before adding to cart.</p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-5 text-sm text-zinc-300">
        Quote ID: <span className="font-semibold text-white">{quoteId}</span>
      </div>

      {quote ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-950 p-5 text-sm text-zinc-300">
          Quoted total: <span className="font-semibold text-white">${Number(quote.total || 0).toFixed(2)}</span>
        </div>
      ) : null}

      <div className="mt-6 rounded-3xl border border-white/10 bg-zinc-950 p-6">
        <div className="text-sm font-semibold text-zinc-200">Window graphics examples</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {artworkExamples.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`Window graphics example ${index + 1}`}
              className="h-24 w-full rounded-xl border border-white/10 object-cover"
            />
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-zinc-950 p-6">
        <div className="text-sm text-zinc-400">Artwork status</div>
        <div className="mt-2 text-lg font-semibold text-white">Preflight passed</div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={handleAddToCart} disabled={isLoading} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60">
          {isLoading ? 'Adding to Cart...' : 'Add to Cart'}
        </button>
        <Link to="/window-graphics" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/5">
          Back to Quote
        </Link>
      </div>
    </section>
  );
}
