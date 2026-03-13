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
    src: '/products/banners/type-hd-banner.svg',
    defaultMaterial: 'vinyl_13oz',
  },
  {
    id: 'hdpe',
    name: 'HDPE',
    subtitle: 'Water & Tear Resistant Paper',
    src: '/products/banners/type-hdpe.svg',
    defaultMaterial: 'hdpe_paper',
  },
  {
    id: 'canvas',
    name: 'Canvas',
    subtitle: 'Poly-Cotton Blend, Stretch & Frame',
    src: '/products/banners/type-canvas.svg',
    defaultMaterial: 'canvas_polycotton',
  },
  {
    id: 'mesh',
    name: 'Mesh',
    subtitle: 'Polyester with Air-Flow Perforation',
    src: '/products/banners/type-mesh.svg',
    defaultMaterial: 'mesh_10oz',
  },
  {
    id: 'poster',
    name: 'Poster',
    subtitle: 'Bright White Paper, Short-Term Indoor',
    src: '/products/banners/type-poster.svg',
    defaultMaterial: 'poster_paper',
  },
  {
    id: 'no_curl',
    name: 'No Curl Banner',
    subtitle: 'No Edge Curl Material',
    src: '/products/banners/type-no-curl.svg',
    defaultMaterial: 'vinyl_no_curl',
  },
  {
    id: 'econo_stand',
    name: 'Econo Stand',
    subtitle: 'Economical Banner Stand Solution',
    src: '/products/banners/type-econo-stand.svg',
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

  const selectedType = BANNER_TYPES.find((sample) => sample.id === input.bannerType) || BANNER_TYPES[0];

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-16 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(255,122,26,0.12),transparent_35%),radial-gradient(circle_at_85%_5%,rgba(255,183,74,0.1),transparent_28%)]" />
      <div className="overflow-hidden rounded-3xl border border-orange-500/20 bg-gradient-to-br from-zinc-950 via-zinc-950 to-orange-950/30 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-300">
              Banner Configurator
            </div>
            <h1 className="mt-3 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-4xl font-black tracking-tight text-transparent md:text-5xl">Banners Quote</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-300">
              Build your order with 7 product families, custom dimensions, finishing controls, and production preferences.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"><div className="font-bold text-orange-300">7</div><div className="text-zinc-400">Types</div></div>
            <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"><div className="font-bold text-orange-300">6</div><div className="text-zinc-400">Sizes</div></div>
            <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"><div className="font-bold text-orange-300">24h</div><div className="text-zinc-400">Rush</div></div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="rounded-3xl border border-white/10 bg-zinc-950/85 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.42)] backdrop-blur-md">
          <div className="mb-5 text-sm font-semibold text-zinc-200">Banner product types</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {BANNER_TYPES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => applyBannerType(sample.id)}
                className={`overflow-hidden rounded-2xl border text-left transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(0,0,0,0.35)] ${input.bannerType === sample.id ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-white/10 hover:border-white/30'}`}
              >
                <img src={sample.src} alt={sample.name} className="h-28 w-full object-cover" />
                <div className="bg-black/60 px-3 py-2">
                  <div className="text-xs font-semibold text-zinc-100">{sample.name}</div>
                  <div className="text-[11px] text-zinc-300">{sample.subtitle}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_12px_30px_rgba(0,0,0,0.35)]">
            <img
              src={selectedType.src}
              alt="Selected banner preview"
              className="h-48 w-full object-cover"
            />
            <div className="flex items-center justify-between border-t border-white/10 bg-black/50 px-4 py-2 text-xs">
              <span className="font-semibold text-zinc-200">{selectedType.name}</span>
              <span className="rounded-full border border-white/15 px-2 py-0.5 text-zinc-300">{selectedType.subtitle}</span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">

          <div className="col-span-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
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

          <label className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">Material
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

          <label className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">Print Sides
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.sides} onChange={set('sides')}>
              <option value="single_sided">Single-sided</option>
              <option value="double_sided">Double-sided</option>
            </select>
          </label>

          <label className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">Finishing
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.finishing} onChange={set('finishing')}>
              <option value="hemmed_grommets">Hemmed + Grommets</option>
              <option value="pole_pocket">Pole Pocket</option>
              <option value="none">No Finishing</option>
            </select>
          </label>

          <label className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">Quantity
            <input type="number" min="1" className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.quantity} onChange={(e) => setInput({ ...input, quantity: Number(e.target.value) })} />
          </label>

          <label className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">Turnaround
            <select className="mt-2 w-full rounded-lg bg-zinc-900 px-3 py-2" value={input.turnaround} onChange={set('turnaround')}>
              <option value="standard_48h">Standard 48h</option>
              <option value="rush_24h">Rush 24h</option>
            </select>
          </label>

          <div className="col-span-2 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
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

        <aside className="h-fit rounded-3xl border border-white/10 bg-zinc-950/90 p-4 shadow-[0_12px_35px_rgba(0,0,0,0.45)] backdrop-blur-md lg:sticky lg:top-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Live Quote Snapshot</div>
          <div className="mt-3 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-3">
            <div className="text-sm font-semibold text-orange-300">{selectedType.name}</div>
            <div className="text-xs text-zinc-300">{customW || 0}ft x {customH || 0}ft • Qty {input.quantity || 0}</div>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-2 py-1.5"><span className="text-zinc-400">Material</span><span className="text-zinc-200">{input.material}</span></div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-2 py-1.5"><span className="text-zinc-400">Sides</span><span className="text-zinc-200">{input.sides}</span></div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-2 py-1.5"><span className="text-zinc-400">Finishing</span><span className="text-zinc-200">{input.finishing}</span></div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/30 px-2 py-1.5"><span className="text-zinc-400">Turnaround</span><span className="text-zinc-200">{input.turnaround}</span></div>
          </div>
          <p className="mt-3 text-[11px] text-zinc-500">Pricing is finalized on the next step after quote generation.</p>
        </aside>
      </div>

      {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={handleContinue} disabled={isLoading} className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-semibold text-white hover:from-orange-400 hover:to-amber-400 disabled:opacity-60">
          {isLoading ? 'Generating Quote...' : 'Continue to Artwork'}
        </button>
        <Link to="/" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-zinc-200 hover:bg-white/5">
          Back to Homepage
        </Link>
      </div>
    </section>
  );
}
