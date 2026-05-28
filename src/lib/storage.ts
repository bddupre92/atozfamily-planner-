// Vercel Blob wrapper. Pure metadata until BLOB_READ_WRITE_TOKEN is set in
// the environment, at which point upload/delete become real network calls.
//
// `isBlobEnabled()` is the single source of truth — API routes and UI both
// call it to gracefully degrade ("Photo upload requires Vercel Blob — enable
// it in Vercel project settings") rather than 500 when the token is missing.

import { put, del } from '@vercel/blob';

export function isBlobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export type UploadedBlob = {
  url: string;
  contentType: string | null;
  size: number | null;
};

export async function uploadPhoto(
  filename: string,
  body: Blob | ArrayBuffer | Buffer,
  contentType?: string,
): Promise<UploadedBlob> {
  if (!isBlobEnabled()) {
    throw new Error('BLOB_READ_WRITE_TOKEN not set; uploads disabled');
  }
  // `addRandomSuffix` ensures unique URLs even if filenames collide across
  // different lessons. `cacheControlMaxAge` = 1 year (immutable URLs by design).
  const blob = await put(`photos/${filename}`, body, {
    access: 'public',
    addRandomSuffix: true,
    contentType,
    cacheControlMaxAge: 31536000,
  });
  return {
    url: blob.url,
    contentType: blob.contentType ?? contentType ?? null,
    size: sizeOf(body),
  };
}

function sizeOf(body: Blob | ArrayBuffer | Buffer): number | null {
  if (body instanceof ArrayBuffer) return body.byteLength;
  if (Buffer.isBuffer(body)) return body.length;
  if (typeof Blob !== 'undefined' && body instanceof Blob) return body.size;
  return null;
}

export async function deletePhoto(url: string): Promise<void> {
  if (!isBlobEnabled()) return;
  try {
    await del(url);
  } catch {
    // Already gone, or token mismatch with the bucket — surface nothing.
    // The DB row will still be removed by the caller; orphan blobs cost
    // pennies and are visible in the Vercel dashboard for manual cleanup.
  }
}
