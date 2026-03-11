import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { addQuoteItemToCart, createCartFromQuote } from '../../cart/api/cartApi';
import { createMockCartFromQuote, getMockQuote } from '../../../shared/mock/flowStore';
import { ArtworkUploader } from '../../../shared/ui/ArtworkUploader';
import { saveArtwork } from '../../../shared/mock/artworkStore';

export default function YardSignsArtworkPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { quoteId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [artworkFile, setArtworkFile] = useState(null);

  const quoteFromRoute = location.state;
  const quote = quoteFromRoute || getMockQuote(quoteId);

  async function handleAddToCart() {
    setIsLoading(true);
    if (artworkFile) await saveArtwork(quoteId, artworkFile).catch(() => {});
    try {
      const cart = await createCartFromQuote(quoteId);
      const cartId = cart.cartId;
      if (artworkFile) await saveArtwork(cartId, artworkFile).catch(() => {});

      if (quote?.quoteItemId) {
        await addQuoteItemToCart(cartId, quote.quoteItemId, quote.input?.quantity || 1);
      }
      navigate(`/cart/${cartId}`);
    } catch {
      const fallbackCart = createMockCartFromQuote(quoteId, quote?.input?.quantity || 1);
      navigate(`/cart/${fallbackCart.cartId}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 text-zinc-100">
      <h1 className="text-4xl font-black">Upload Artwork</h1>
      <p className="mt-3 text-zinc-400">Upload print-ready files and track preflight status before adding to cart.</p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-zinc-950 p-5 text-sm text-zinc-300">
        Quote ID: <span className="font-semibold text-white">{quoteId}</span>
      </div>

      {quote ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-950 p-5 text-sm text-zinc-300">
          Quoted total: <span className="font-semibold text-white">${Number(quote.total || 0).toFixed(2)}</span>
        </div>
      ) : null}

      <div className="mt-6">
        <ArtworkUploader onChange={setArtworkFile} />
      </div>
      {artworkFile && (
        <div className="mt-3 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">
          Artwork ready — file will be reviewed after order is placed.
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={handleAddToCart} disabled={isLoading} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60">
          {isLoading ? 'Adding to Cart...' : 'Add to Cart'}
        </button>
        <Link to="/yard-signs" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/5">
          Back to Quote
        </Link>
      </div>
    </section>
  );
}
