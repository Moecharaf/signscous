import { useRef, useState } from 'react';

const MAX_SIZE_MB = 50;

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ArtworkUploader({ onChange }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  function processFile(f) {
    if (!f) return;
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_SIZE_MB} MB.`);
      return;
    }
    setError('');
    setFile(f);
    onChange?.(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }

  function handleClear() {
    setFile(null);
    setPreview(null);
    setError('');
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6">
      <div className="mb-4 text-sm font-semibold text-zinc-200">Upload Your Artwork</div>

      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFile(e.dataTransfer.files?.[0]); }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-8 py-14 text-center transition-colors ${
            isDragging
              ? 'border-orange-400 bg-orange-500/10'
              : 'border-white/20 hover:border-white/40 hover:bg-white/5'
          }`}
        >
          <svg className="h-12 w-12 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <div>
            <div className="text-sm font-semibold text-zinc-200">Click to browse or drag &amp; drop</div>
            <div className="mt-1 text-xs text-zinc-500">PNG, JPEG, SVG, PDF — max 50 MB</div>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".png,.jpg,.jpeg,.gif,.svg,.pdf,.ai,.eps"
            onChange={(e) => processFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
          {preview ? (
            <img
              src={preview}
              alt="Uploaded artwork preview"
              className="max-h-80 w-full bg-zinc-900 object-contain"
            />
          ) : (
            <div className="flex h-40 items-center justify-center bg-zinc-900">
              <svg className="h-16 w-16 text-zinc-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
          )}
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{file.name}</div>
              <div className="mt-0.5 text-xs text-zinc-400">{formatBytes(file.size)}</div>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {!file && (
        <p className="mt-3 text-xs text-zinc-600">
          Accepted: PNG, JPEG, GIF, SVG, PDF, AI, EPS
        </p>
      )}
    </div>
  );
}
