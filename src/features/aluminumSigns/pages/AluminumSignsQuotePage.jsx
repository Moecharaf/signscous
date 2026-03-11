import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createAluminumSignsQuote } from '../api/aluminumSignsApi';
import { aluminumSignsDefaults } from '../model/aluminumSignsDefaults';
import { validateAluminumSignsInput } from '../model/aluminumSignsValidation';
import { createMockQuote } from '../../../shared/mock/flowStore';

export default function AluminumSignsQuotePage() {
  const navigate = useNavigate();
  const [input, setInput] = useState(aluminumSignsDefaults);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function set(field) {
    return (e) => setInput({ ...input, [field]: e.target.value });
  }

  async function handleContinue() {
    const errors = validateAluminumSignsInput(input);
    if (errors.length > 0) { setError(errors[0]); return; }

    setError('');
    setIsLoading(true);
    try {
      const response = await createAluminumSignsQuote(input);
      navigate(`/aluminum-signs/artwork/${response.quoteId}`, { state: response });
    } catch {
      const fallback = createMockQuote(input);
      navigate(`/aluminum-signs/artwork/${fallback.quoteId}`, { state: fallback });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 text-zinc-100">
      <h1 className="text-4xl font-black">Aluminum Signs Quote</h1>
      <p className="mt-3 text-zinc-400">Durable metal signage — configure size, thickness, finishing, and quantity.</p>

      <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-6">
        <div className="grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">

          <label className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">Size
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.size} onChange={set('size')}>
              <option value="12x18">12 × 18 in</option>
              <option value="18x24">18 × 24 in</option>
              <option value="24x36">24 × 36 in</option>
            </select>
          </label>

          <label className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">Thickness
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.thickness} onChange={set('thickness')}>
              <option value="040">.040 Standard</option>
              <option value="063">.063 Heavy Duty</option>
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
              <option value="none">No Finishing</option>
              <option value="holes_drilled">Pre-drilled Holes</option>
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
