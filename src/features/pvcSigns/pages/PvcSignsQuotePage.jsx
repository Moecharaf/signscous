import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPvcSignsQuote } from '../api/pvcSignsApi';
import { pvcSignsDefaults } from '../model/pvcSignsDefaults';
import { validatePvcSignsInput } from '../model/pvcSignsValidation';
import { createMockQuote } from '../../../shared/mock/flowStore';

const pvcSamples = [
  { id: 'retail', name: 'Retail Promo', src: '/products/pvc-signs/pvc-retail.svg' },
  { id: 'menu', name: 'Menu Board', src: '/products/pvc-signs/pvc-menu-board.svg' },
  { id: 'directional', name: 'Directional', src: '/products/pvc-signs/pvc-directional.svg' },
];

const PVC_PRESETS = ['12x18', '18x24', '24x36', '36x48'];

export default function PvcSignsQuotePage() {
  const navigate = useNavigate();
  const [input, setInput] = useState(pvcSignsDefaults);
  const [selectedSample, setSelectedSample] = useState(pvcSamples[0].id);
  const [customW, setCustomW] = useState('12');
  const [customH, setCustomH] = useState('18');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function set(field) {
    return (e) => setInput({ ...input, [field]: e.target.value });
  }

  function applySize(w, h) {
    setCustomW(String(w));
    setCustomH(String(h));
    setInput((prev) => ({ ...prev, size: `${w}x${h}` }));
  }

  function handleDimension(axis, val) {
    const n = val.replace(/[^0-9]/g, '');
    if (axis === 'w') { setCustomW(n); setInput((prev) => ({ ...prev, size: `${n || 0}x${customH}` })); }
    else { setCustomH(n); setInput((prev) => ({ ...prev, size: `${customW}x${n || 0}` })); }
  }

  async function handleContinue() {
    const errors = validatePvcSignsInput(input);
    if (errors.length > 0) { setError(errors[0]); return; }

    setError('');
    setIsLoading(true);
    try {
      const response = await createPvcSignsQuote(input);
      navigate(`/pvc-signs/artwork/${response.quoteId}`, { state: response });
    } catch {
      const fallback = createMockQuote(input);
      navigate(`/pvc-signs/artwork/${fallback.quoteId}`, { state: fallback });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 text-zinc-100">
      <h1 className="text-4xl font-black">PVC Signs Quote</h1>
      <p className="mt-3 text-zinc-400">Rigid lightweight boards for clean, professional branding — configure size, thickness, and quantity.</p>

      <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-6">
        <div className="mb-5 text-sm font-semibold text-zinc-200">Sample PVC sign designs</div>
        <div className="grid gap-3 sm:grid-cols-3">
          {pvcSamples.map((sample) => (
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
            src={pvcSamples.find((sample) => sample.id === selectedSample)?.src}
            alt="Selected PVC sign preview"
            className="h-44 w-full object-cover"
          />
        </div>

        <div className="grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">

          <div className="col-span-2 rounded-xl border border-white/10 bg-black/50 px-4 py-3">
            <div className="mb-2 text-sm text-zinc-300">Size (inches)</div>
            <div className="mb-3 flex flex-wrap gap-2">
              {PVC_PRESETS.map((p) => {
                const [pw, ph] = p.split('x');
                return (
                  <button key={p} type="button" onClick={() => applySize(pw, ph)}
                    className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${input.size === p ? 'border-orange-500 bg-orange-500/20 text-orange-300' : 'border-white/15 text-zinc-300 hover:border-white/40'}`}>
                    {pw} × {ph} in
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <label className="flex-1">
                <span className="text-xs text-zinc-500">Width</span>
                <div className="mt-1 flex items-center rounded-lg bg-zinc-900 px-3 py-2">
                  <input type="number" min="1" max="240" value={customW} onChange={(e) => handleDimension('w', e.target.value)} className="w-full bg-transparent text-sm text-white outline-none" />
                  <span className="text-xs text-zinc-500">in</span>
                </div>
              </label>
              <span className="mt-5 text-zinc-500">×</span>
              <label className="flex-1">
                <span className="text-xs text-zinc-500">Height</span>
                <div className="mt-1 flex items-center rounded-lg bg-zinc-900 px-3 py-2">
                  <input type="number" min="1" max="240" value={customH} onChange={(e) => handleDimension('h', e.target.value)} className="w-full bg-transparent text-sm text-white outline-none" />
                  <span className="text-xs text-zinc-500">in</span>
                </div>
              </label>
            </div>
          </div>

          <label className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">Thickness
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.thickness} onChange={set('thickness')}>
              <option value="3mm">3mm Standard</option>
              <option value="6mm">6mm Heavy</option>
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
