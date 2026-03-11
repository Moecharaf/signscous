const BADGE_MAP = {
  yard: { key: 'yard', label: 'Yard Signs', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' },
  banner: { key: 'banner', label: 'Banners', className: 'bg-sky-500/20 text-sky-300 border-sky-400/30' },
  aluminum: { key: 'aluminum', label: 'Aluminum Signs', className: 'bg-slate-500/20 text-slate-200 border-slate-300/30' },
  pvc: { key: 'pvc', label: 'PVC Signs', className: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30' },
  acrylic: { key: 'acrylic', label: 'Acrylic Signs', className: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30' },
  window: { key: 'window', label: 'Window Graphics', className: 'bg-violet-500/20 text-violet-300 border-violet-400/30' },
};

const DEFAULT_BADGE = { key: 'custom', label: 'Custom Sign', className: 'bg-zinc-500/20 text-zinc-300 border-zinc-400/30' };
const MIXED_BADGE = { key: 'mixed', label: 'Mixed Order', className: 'bg-amber-500/20 text-amber-300 border-amber-400/30' };

function getBadgeByDescription(description = '') {
  const text = String(description).toLowerCase();
  if (text.includes('yard')) return BADGE_MAP.yard;
  if (text.includes('banner')) return BADGE_MAP.banner;
  if (text.includes('aluminum')) return BADGE_MAP.aluminum;
  if (text.includes('pvc')) return BADGE_MAP.pvc;
  if (text.includes('acrylic')) return BADGE_MAP.acrylic;
  if (text.includes('window')) return BADGE_MAP.window;
  return DEFAULT_BADGE;
}

export function getProductBadgeMeta(description = '') {
  const badge = getBadgeByDescription(description);
  return { label: badge.label, className: badge.className };
}

export function getOrderBadgeMeta(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return { label: DEFAULT_BADGE.label, className: DEFAULT_BADGE.className };
  }

  const keys = new Set(items.map((item) => getBadgeByDescription(item?.description).key));
  if (keys.size > 1) {
    return { label: MIXED_BADGE.label, className: MIXED_BADGE.className };
  }

  const [singleKey] = Array.from(keys);
  const singleBadge = Object.values(BADGE_MAP).find((badge) => badge.key === singleKey) || DEFAULT_BADGE;
  return { label: singleBadge.label, className: singleBadge.className };
}

export function getOrderBadgeDetails(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      label: DEFAULT_BADGE.label,
      className: DEFAULT_BADGE.className,
      isMixed: false,
      typeCount: 1,
      typeLabels: [DEFAULT_BADGE.label],
    };
  }

  const badges = items.map((item) => getBadgeByDescription(item?.description));
  const unique = new Map();
  for (const badge of badges) {
    if (!unique.has(badge.key)) {
      unique.set(badge.key, badge);
    }
  }

  if (unique.size > 1) {
    return {
      label: `Mixed Order (${unique.size} types)`,
      className: MIXED_BADGE.className,
      isMixed: true,
      typeCount: unique.size,
      typeLabels: Array.from(unique.values()).map((badge) => badge.label),
    };
  }

  const singleBadge = Array.from(unique.values())[0] || DEFAULT_BADGE;
  return {
    label: singleBadge.label,
    className: singleBadge.className,
    isMixed: false,
    typeCount: 1,
    typeLabels: [singleBadge.label],
  };
}
