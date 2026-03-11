import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createBannersQuote } from '../api/bannersApi';
import { bannersDefaults } from '../model/bannersDefaults';
import { validateBannersInput } from '../model/bannersValidation';
import { createMockQuote } from '../../../shared/mock/flowStore';

const bannerSamples = [
  { id: 'retail', name: 'Retail Sale', src: '/products/banners/banner-retail-sale.svg' },
  { id: 'construction', name: 'Construction Notice', src: '/products/banners/banner-construction.svg' },
  { id: 'event', name: 'Event Promo', src: '/products/banners/banner-event.svg' },
];

export default function BannersQuotePage() {
  const navigate = useNavigate();
  const [input, setInput] = useState(bannersDefaults);
  const [selectedSample, setSelectedSample] = useState(bannerSamples[0].id);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function set(field) {
    return (e) => setInput({ ...input, [field]: e.target.value });
  }

  async function handleContinue() {
    const errors = validateBannersInput(input);
    if (errors.length > 0) { setError(errors[0]); return; }

    setError('');
    setIsLoading(true);
    try {
      const response = await createBannersQuote(input);
      navigate(`/banners/artwork/${response.quoteId}`, { state: response });
    } catch {
      const fallback = createMockQuote(input);
      navigate(`/banners/artwork/${fallback.quoteId}`, { state: fallback });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 text-zinc-100">
      <h1 className="text-4xl font-black">Banners Quote</h1>
      <p className="mt-3 text-zinc-400">Configure size, material, finishing, quantity, and turnaround for real-time vinyl banner pricing.</p>

      <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-6">
        <div className="mb-5 text-sm font-semibold text-zinc-200">Sample banner designs</div>
        <div className="grid gap-3 sm:grid-cols-3">
          {bannerSamples.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => setSelectedSample(sample.id)}
              className={`overflow-hidden rounded-2xl border text-left transition ${selectedSample === sample.id ? 'border-orange-500' : 'border-white/10 hover:border-white/30'}`}
            >
              <img src={sample.src} alt={sample.name} className="h-28 w-full object-cover" />
              <div className="bg-black/60 px-3 py-2 text-xs text-zinc-200">{sample.name}</div>
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <img
            src={bannerSamples.find((sample) => sample.id === selectedSample)?.src}
            alt="Selected banner preview"
            className="h-44 w-full object-cover"
          />
        </div>

        <div className="grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">

          <label className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">Size
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.size} onChange={set('size')}>
              <option value="2x4">2ft × 4ft</option>
              <option value="2x6">2ft × 6ft</option>
              <option value="3x6">3ft × 6ft</option>
              <option value="3x8">3ft × 8ft</option>
              <option value="4x8">4ft × 8ft</option>
              <option value="4x10">4ft × 10ft</option>
            </select>
          </label>

          <label className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">Material
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.material} onChange={set('material')}>
              <option value="vinyl_13oz">13oz Vinyl</option>
              <option value="vinyl_18oz">18oz Vinyl (Heavy)</option>
            </select>
          </label>

          <label className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">Print Sides
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.sides} onChange={set('sides')}>
              <option value="single_sided">Single-sided</option>
              <option value="double_sided">Double-sided</option>
            </select>
          </label>

          <label className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">Finishing
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.finishing} onChange={set('finishing')}>
              <option value="hemmed_grommets">Hemmed + Grommets</option>
              <option value="pole_pocket">Pole Pocket</option>
              <option value="none">No Finishing</option>
            </select>
          </label>

          <label className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">Quantity
            <input type="number" min="1" className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.quantity} onChange={(e) => setInput({ ...input, quantity: Number(e.target.value) })} />
          </label>

          <label className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">Turnaround
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.turnaround} onChange={set('turnaround')}>
              <option value="standard_48h">Standard 48h</option>
              <option value="rush_24h">Rush 24h</option>
            </select>
          </label>

        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={handleContinue} disabled={isLoading} className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-400 disabled:opacity-60">
          {isLoading ? 'Generating Quote...' : 'Continue to Artwork'}
        </button>
        <Link to="/" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/5">
          Back to Homepage
        </Link>
      </div>
    </section>
  );
}
