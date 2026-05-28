'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, Upload, Trash2, X, AlertCircle } from 'lucide-react';

type Photo = {
  id: string;
  url: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
};

export function LessonPhotos({ lessonId }: { lessonId: string }) {
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [blobEnabled, setBlobEnabled] = useState<boolean | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/lessons/${lessonId}/photo`)
      .then((r) => r.json())
      .then((j) => {
        setPhotos(j.photos ?? []);
        setBlobEnabled(!!j.blobEnabled);
      });
  }, [open, lessonId]);

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    for (const file of Array.from(files)) {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`/api/lessons/${lessonId}/photo`, { method: 'POST', body: fd });
      setUploading(false);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error ?? `Upload failed (${res.status})`);
        return;
      }
      const j = await res.json();
      setPhotos((p) => [...p, j.photo]);
    }
  }

  async function remove(photoId: string) {
    const res = await fetch(`/api/lessons/${lessonId}/photo/${photoId}`, { method: 'DELETE' });
    if (res.ok) setPhotos((p) => p.filter((x) => x.id !== photoId));
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="text-xs flex items-center gap-1 text-ink-muted hover:text-ink"
        title="Attach photos to this lesson"
      >
        <Camera size={12} /> {open ? 'Hide photos' : `Photos${photos.length ? ` (${photos.length})` : ''}`}
      </button>

      {open && (
        <div className="mt-2 bg-paper border border-rule rounded p-3 w-full">
          {blobEnabled === false && (
            <div className="flex items-start gap-2 text-xs text-ink-muted mb-3">
              <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
              <span>
                Photo upload requires Vercel Blob. Add <code className="px-1 bg-cream rounded">BLOB_READ_WRITE_TOKEN</code> in
                Vercel project settings → Environment Variables, then redeploy.
              </span>
            </div>
          )}

          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-3">
              {photos.map((p) => (
                <div key={p.id} className="relative group">
                  <button
                    onClick={() => setLightbox(p.url)}
                    className="block w-full aspect-square rounded overflow-hidden border border-rule"
                    title="Click to view full size"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                  </button>
                  <button
                    onClick={() => remove(p.id)}
                    className="absolute top-1 right-1 p-0.5 bg-cream border border-rule rounded opacity-0 group-hover:opacity-100 transition"
                    title="Delete photo"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {blobEnabled !== false && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => upload(e.target.files)}
                className="hidden"
              />
              <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-rule rounded text-ink-soft hover:bg-cream disabled:opacity-50"
              >
                <Upload size={12} />
                {uploading ? 'Uploading…' : 'Add photos'}
              </button>
            </>
          )}

          {error && <div className="text-xs text-red-700 mt-2">{error}</div>}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-cream p-1">
            <X size={24} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={lightbox} alt="" className="max-w-full max-h-full" />
        </div>
      )}
    </>
  );
}
