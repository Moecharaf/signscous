import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createYardSignsQuote } from '../api/yardSignsApi';
import { yardSignsDefaults } from '../model/yardSignsDefaults';
import { validateYardSignsInput } from '../model/yardSignsValidation';
import { createMockQuote } from '../../../shared/mock/flowStore';

const YARD_SIGN_PRESETS = ['18x24', '24x18', '24x36', '36x48'];

export default function YardSignsQuotePage() {
  const navigate = useNavigate();
  const [input, setInput] = useState(yardSignsDefaults);
  const [customW, setCustomW] = useState('18');
  const [customH, setCustomH] = useState('24');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    const errors = validateYardSignsInput(input);
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await createYardSignsQuote(input);
      const quoteId = response.quoteId;
      navigate(`/yard-signs/artwork/${quoteId}`, { state: response });
    } catch {
      const fallback = createMockQuote(input);
      navigate(`/yard-signs/artwork/${fallback.quoteId}`, { state: fallback });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 text-zinc-100">
      <h1 className="text-4xl font-black">Yard Signs Quote</h1>
      <p className="mt-3 text-zinc-400">Configure size, material, sides, quantity, and turnaround to generate a real-time quote.</p>

      <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950">
        <img
          src="/products/yard-signs/yard-sign-hero.png"
          alt="Yard signs sample"
          className="h-56 w-full object-cover"
        />
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-6">
        <div className="grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
          <div className="col-span-2 rounded-xl border border-white/10 bg-black/50 px-4 py-3">
            <div className="mb-2 text-sm text-zinc-300">Size (inches)</div>
            <div className="mb-3 flex flex-wrap gap-2">
              {YARD_SIGN_PRESETS.map((p) => {
                const [pw, ph] = p.split('x');
                return (
                  <button key={p} type="button" onClick={() => applySize(pw, ph)}
                    className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${input.size === p ? 'border-orange-500 bg-orange-500/20 text-orange-300' : 'border-white/15 text-zinc-300 hover:border-white/40'}`}>
                    {p} in
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
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.material} onChange={(e) => setInput({ ...input, material: e.target.value })}>
              <option value="coroplast_4mm">4mm Coroplast</option>
              <option value="coroplast_10mm">10mm Coroplast</option>
            </select>
          </label>
          <label className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">Sides
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.sides} onChange={(e) => setInput({ ...input, sides: e.target.value })}>
              <option value="single_sided">Single-sided</option>
              <option value="double_sided">Double-sided</option>
            </select>
          </label>
          <label className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">Quantity
            <input type="number" min="1" className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.quantity} onChange={(e) => setInput({ ...input, quantity: Number(e.target.value) })} />
          </label>
          <label className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">Turnaround
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.turnaround} onChange={(e) => setInput({ ...input, turnaround: e.target.value })}>
              <option value="standard_48h">Standard 48h</option>
              <option value="rush_24h">Rush 24h</option>
            </select>
          </label>

          <div className="col-span-2 rounded-xl border border-white/10 bg-black/50 px-4 py-3">
            <div className="mb-3 text-sm font-semibold text-zinc-200">Advanced Options</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>Grommets
                <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.grommets} onChange={(e) => setInput({ ...input, grommets: e.target.value })}>
                  <option value="none">No Grommets</option>
                  <option value="corners_only">Corners Only</option>
                  <option value="all_sides">All Sides</option>
                </select>
              </label>
              <label>Stakes
                <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.stakes} onChange={(e) => setInput({ ...input, stakes: e.target.value })}>
                  <option value="h_stakes">H Stakes</option>
                  <option value="u_stakes">U Stakes</option>
                  <option value="none">No Stakes</option>
                </select>
              </label>
              <label>Shape Cut
                <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.contourCut} onChange={(e) => setInput({ ...input, contourCut: e.target.value })}>
                  <option value="none">Rectangle (Standard)</option>
                  <option value="circle">Circle Cut</option>
                  <option value="custom_contour">Custom Contour</option>
                </select>
              </label>
              <label>Proofing
                <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.proof} onChange={(e) => setInput({ ...input, proof: e.target.value })}>
                  <option value="online_proof">Free Online Proof</option>
                  <option value="pdf_proof">PDF Proof Required</option>
                  <option value="no_proof">No Proof Needed</option>
                </select>
              </label>
              <label className="sm:col-span-2">Packaging
                <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.packaging} onChange={(e) => setInput({ ...input, packaging: e.target.value })}>
                  <option value="bulk">Bulk Pack</option>
                  <option value="sets_of_10">Bundle in Sets of 10</option>
                  <option value="single_polybag">Single Polybag</option>
                </select>
              </label>
              <label className="sm:col-span-2">Special Instructions
                <textarea rows="3" className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.notes} onChange={(e) => setInput({ ...input, notes: e.target.value })} placeholder="Hole positions, stake packing notes, special handling..." />
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
