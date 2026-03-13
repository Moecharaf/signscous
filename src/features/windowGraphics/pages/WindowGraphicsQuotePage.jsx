import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createWindowGraphicsQuote } from '../api/windowGraphicsApi';
import { windowGraphicsDefaults } from '../model/windowGraphicsDefaults';
import { validateWindowGraphicsInput } from '../model/windowGraphicsValidation';
import { createMockQuote } from '../../../shared/mock/flowStore';

const windowSamples = [
  { id: 'storefront', name: 'Storefront Promo', src: '/products/window-graphics/window-storefront.svg' },
  { id: 'hours', name: 'Business Hours', src: '/products/window-graphics/window-hours.svg' },
];

const WINDOW_PRESETS = ['24x36', '36x48', '48x60', '48x72'];

export default function WindowGraphicsQuotePage() {
  const navigate = useNavigate();
  const [input, setInput] = useState(windowGraphicsDefaults);
  const [selectedSample, setSelectedSample] = useState(windowSamples[0].id);
  const [customW, setCustomW] = useState('24');
  const [customH, setCustomH] = useState('36');
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
    const errors = validateWindowGraphicsInput(input);
    if (errors.length > 0) { setError(errors[0]); return; }

    setError('');
    setIsLoading(true);
    try {
      const response = await createWindowGraphicsQuote(input);
      navigate(`/window-graphics/artwork/${response.quoteId}`, { state: response });
    } catch {
      const fallback = createMockQuote(input);
      navigate(`/window-graphics/artwork/${fallback.quoteId}`, { state: fallback });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 text-zinc-100">
      <h1 className="text-4xl font-black">Window Graphics Quote</h1>
      <p className="mt-3 text-zinc-400">Perforated and adhesive vinyl graphics for storefront windows.</p>

      <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-6">
        <div className="mb-5 text-sm font-semibold text-zinc-200">Sample window graphic designs</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {windowSamples.map((sample) => (
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
            src={windowSamples.find((sample) => sample.id === selectedSample)?.src}
            alt="Selected window graphics preview"
            className="h-44 w-full object-cover"
          />
        </div>

        <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
          <div className="col-span-2 rounded-xl border border-white/10 bg-black/50 px-4 py-3">
            <div className="mb-2 text-sm text-zinc-300">Size (inches)</div>
            <div className="mb-3 flex flex-wrap gap-2">
              {WINDOW_PRESETS.map((p) => {
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

          <label className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">Material
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.material} onChange={set('material')}>
              <option value="perforated_vinyl">Perforated Vinyl</option>
              <option value="clear_vinyl">Clear Vinyl</option>
              <option value="opaque_vinyl">Opaque Vinyl</option>
            </select>
          </label>

          <label className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">Install Surface
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.installSurface} onChange={set('installSurface')}>
              <option value="outside_glass">Outside Glass</option>
              <option value="inside_glass">Inside Glass</option>
            </select>
          </label>

          <label className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">Laminate
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.laminate} onChange={set('laminate')}>
              <option value="none">No Laminate</option>
              <option value="matte">Matte Laminate</option>
              <option value="gloss">Gloss Laminate</option>
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

          <div className="col-span-2 rounded-xl border border-white/10 bg-black/50 px-4 py-3">
            <div className="mb-3 text-sm font-semibold text-zinc-200">Advanced Options</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>Opacity Mode
                <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.opacityMode} onChange={set('opacityMode')}>
                  <option value="full_color">Full Color</option>
                  <option value="white_ink">White Ink + Color</option>
                  <option value="clear_only">Clear/No Ink</option>
                </select>
              </label>
              <label>Adhesive
                <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.adhesive} onChange={set('adhesive')}>
                  <option value="removable">Removable</option>
                  <option value="permanent">Permanent</option>
                  <option value="static_cling">Static Cling</option>
                </select>
              </label>
              <label>Cut Type
                <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.cutType} onChange={set('cutType')}>
                  <option value="square_cut">Square Cut</option>
                  <option value="contour_cut">Contour Cut</option>
                  <option value="kiss_cut">Kiss Cut</option>
                </select>
              </label>
              <label>Perforation Pattern
                <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.perforation} onChange={set('perforation')}>
                  <option value="70_30">70/30</option>
                  <option value="60_40">60/40</option>
                  <option value="50_50">50/50</option>
                </select>
              </label>
              <label className="sm:col-span-2">Install Kit
                <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.installKit} onChange={set('installKit')}>
                  <option value="none">No Kit</option>
                  <option value="squeegee">Squeegee</option>
                  <option value="full_kit">Full Install Kit</option>
                </select>
              </label>
              <label className="sm:col-span-2">Special Instructions
                <textarea rows="3" className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.notes} onChange={set('notes')} placeholder="Inside mount notes, white ink zones, contour path details..." />
              </label>
            </div>
          </div>
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
