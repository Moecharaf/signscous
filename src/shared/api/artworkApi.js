import { getAuthToken } from '../auth/tokenStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.signscous.com';

/**
 * Reads a File object as a base64 DataURL and uploads it to the backend.
 * Returns a Promise that resolves to the artworkId string.
 */
export function uploadArtworkToServer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const res = await fetch(`${API_BASE_URL}/v1/artworks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            mimetype: file.type,
            data: e.target.result, // full DataURL including data: prefix
          }),
        });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Upload failed (${res.status}): ${body}`);
        }
        const { artworkId } = await res.json();
        resolve(artworkId);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Downloads artwork from the server by artworkId.
 * Requires admin auth token to be present.
 */
export async function downloadArtworkFromServer(artworkId) {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/v1/artworks/${artworkId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);

  const blob = await res.blob();
  const contentDisposition = res.headers.get('Content-Disposition') || '';
  const match = contentDisposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : `artwork-${artworkId}`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
