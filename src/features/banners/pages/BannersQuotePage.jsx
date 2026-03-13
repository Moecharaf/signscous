import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createBannersQuote } from '../api/bannersApi';
import { bannersDefaults } from '../model/bannersDefaults';
import { validateBannersInput } from '../model/bannersValidation';
import { createMockQuote } from '../../../shared/mock/flowStore';

const BANNER_TYPES = [
  {
    id: 'hd_banner',
    name: 'HD Banner',
    subtitle: 'Premium Vinyl Scrim Banner',
    src: '/products/banners/banner-retail-sale.svg',
    defaultMaterial: 'vinyl_13oz',
  },
  {
    id: 'hdpe',
    name: 'HDPE',
    subtitle: 'Water & Tear Resistant Paper',
    src: '/products/banners/banner-construction.svg',
    defaultMaterial: 'hdpe_paper',
  },
  {
    id: 'canvas',
    name: 'Canvas',
    subtitle: 'Poly-Cotton Blend, Stretch & Frame',
    src: '/products/banners/banner-event.svg',
    defaultMaterial: 'canvas_polycotton',
  },
  {
    id: 'mesh',
    name: 'Mesh',
    subtitle: 'Polyester with Air-Flow Perforation',
    src: '/products/banners/banner-construction.svg',
    defaultMaterial: 'mesh_10oz',
  },
  {
    id: 'poster',
    name: 'Poster',
    subtitle: 'Bright White Paper, Short-Term Indoor',
    src: '/products/banners/banner-retail-sale.svg',
    defaultMaterial: 'poster_paper',
  },
  {
    id: 'no_curl',
    name: 'No Curl Banner',
    subtitle: 'No Edge Curl Material',
    src: '/products/banners/banner-event.svg',
    defaultMaterial: 'vinyl_no_curl',
  },
  {
    id: 'econo_stand',
    name: 'Econo Stand',
    subtitle: 'Economical Banner Stand Solution',
    src: '/products/banners/banner-retail-sale.svg',
    defaultMaterial: 'stand_bundle',
  },
];

const BANNER_PRESETS = ['2x4', '2x6', '3x6', '3x8', '4x8', '4x10'];

export default function BannersQuotePage() {
  const navigate = useNavigate();
  const [input, setInput] = useState(bannersDefaults);
  const [customW, setCustomW] = useState('2');
  const [customH, setCustomH] = useState('4');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function set(field) {
    return (e) => setInput({ ...input, [field]: e.target.value });
  }

  function applyBannerType(typeId) {
    const selected = BANNER_TYPES.find((item) => item.id === typeId);
    if (!selected) return;
    setInput((prev) => ({
      ...prev,
      bannerType: selected.id,
      material: selected.defaultMaterial || prev.material,
    }));
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
      <p className="mt-3 text-zinc-400">Choose from 7 banner product families, then configure size, finishing, quantity, and turnaround.</p>

      <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950 p-6">
        <div className="mb-5 text-sm font-semibold text-zinc-200">Banner product types</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BANNER_TYPES.map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => applyBannerType(sample.id)}
              className={`overflow-hidden rounded-2xl border text-left transition ${input.bannerType === sample.id ? 'border-orange-500' : 'border-white/10 hover:border-white/30'}`}
            >
              <img src={sample.src} alt={sample.name} className="h-28 w-full object-cover" />
              <div className="bg-black/60 px-3 py-2">
                <div className="text-xs font-semibold text-zinc-100">{sample.name}</div>
                <div className="text-[11px] text-zinc-300">{sample.subtitle}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          <img
            src={BANNER_TYPES.find((sample) => sample.id === input.bannerType)?.src}
            alt="Selected banner preview"
            className="h-44 w-full object-cover"
          />
        </div>

        <div className="grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">

          <div className="col-span-2 rounded-xl border border-white/10 bg-black/50 px-4 py-3">
            <div className="mb-2 text-sm text-zinc-300">Size (feet)</div>
            <div className="mb-3 flex flex-wrap gap-2">
              {BANNER_PRESETS.map((p) => {
                const [pw, ph] = p.split('x');
                return (
                  <button key={p} type="button" onClick={() => applySize(pw, ph)}
                    className={`rounded-lg border px-3 py-1 text-xs font-semibold transition ${input.size === p ? 'border-orange-500 bg-orange-500/20 text-orange-300' : 'border-white/15 text-zinc-300 hover:border-white/40'}`}>
                    {pw}ft × {ph}ft
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <label className="flex-1">
                <span className="text-xs text-zinc-500">Width (ft)</span>
                <div className="mt-1 flex items-center rounded-lg bg-zinc-900 px-3 py-2">
                  <input type="number" min="1" max="50" value={customW} onChange={(e) => handleDimension('w', e.target.value)} className="w-full bg-transparent text-sm text-white outline-none" />
                  <span className="text-xs text-zinc-500">ft</span>
                </div>
              </label>
              <span className="mt-5 text-zinc-500">×</span>
              <label className="flex-1">
                <span className="text-xs text-zinc-500">Height (ft)</span>
                <div className="mt-1 flex items-center rounded-lg bg-zinc-900 px-3 py-2">
                  <input type="number" min="1" max="50" value={customH} onChange={(e) => handleDimension('h', e.target.value)} className="w-full bg-transparent text-sm text-white outline-none" />
                  <span className="text-xs text-zinc-500">ft</span>
                </div>
              </label>
            </div>
          </div>

          <label className="rounded-xl border border-white/10 bg-black/50 px-4 py-3">Material
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.material} onChange={set('material')}>
              <option value="vinyl_13oz">13oz Vinyl</option>
              <option value="vinyl_18oz">18oz Vinyl (Heavy)</option>
              <option value="hdpe_paper">HDPE Paper</option>
              <option value="canvas_polycotton">Canvas Poly-Cotton</option>
              <option value="mesh_10oz">10oz Mesh</option>
              <option value="poster_paper">Poster Paper</option>
              <option value="vinyl_no_curl">No Curl Vinyl</option>
              <option value="stand_bundle">Banner + Econo Stand Kit</option>
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

          <div className="col-span-2 rounded-xl border border-white/10 bg-black/50 px-4 py-3">
            <div className="mb-3 text-sm font-semibold text-zinc-200">Advanced Options</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label>Hem Option
                <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.hem} onChange={set('hem')}>
                  <option value="all_sides">Hem All Sides</option>
                  <option value="top_bottom">Hem Top & Bottom</option>
                  <option value="none">No Hem</option>
                </select>
              </label>
              <label>Grommets
                <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.grommets} onChange={set('grommets')}>
                  <option value="every_2ft">Every 2 Feet</option>
                  <option value="corners_only">Corners Only</option>
                  <option value="none">No Grommets</option>
                </select>
              </label>
              <label>Pole Pocket
                <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.polePocket} onChange={set('polePocket')}>
                  <option value="none">None</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="top_bottom">Top & Bottom</option>
                </select>
              </label>
              <label>Wind Slits
                <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.windSlits} onChange={set('windSlits')}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </label>
              <label className="sm:col-span-2">Webbing Reinforcement
                <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.webbing} onChange={set('webbing')}>
                  <option value="no">No Webbing</option>
                  <option value="yes">Add Webbing</option>
                </select>
              </label>
              <label className="sm:col-span-2">Special Instructions
                <textarea rows="3" className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.notes} onChange={set('notes')} placeholder="Pole pocket diameter, grommet placement, wind slit details..." />
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
