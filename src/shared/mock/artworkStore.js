// Stores uploaded artwork files as base64 in localStorage.
// Key: quoteId or orderNumber → { name, type, dataUrl, savedAt }
const STORAGE_KEY = 'signscous-artwork-v1';

function read() {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}

function write(data) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveArtwork(key, file) {
  if (!file || !key) return;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const store = read();
      store[key] = { name: file.name, type: file.type, dataUrl: e.target.result, savedAt: new Date().toISOString() };
      write(store);
      resolve();
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getArtwork(key) {
  if (!key) return null;
  return read()[key] || null;
}

export function downloadArtwork(key) {
  const entry = getArtwork(key);
  if (!entry) return false;
  const a = document.createElement('a');
  a.href = entry.dataUrl;
  a.download = entry.name || `artwork-${key}`;
  a.click();
  return true;
}

// Link quoteId artwork to an orderNumber after checkout
export function linkArtworkToOrder(quoteId, orderNumber) {
  const store = read();
  const entry = store[quoteId];
  if (entry && !store[orderNumber]) {
    store[orderNumber] = { ...entry };
    write(store);
  }
}

export function getAllArtworkKeys() {
  return Object.keys(read());
}
