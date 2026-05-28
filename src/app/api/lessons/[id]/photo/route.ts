import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { isBlobEnabled, uploadPhoto } from '@/lib/storage';
import { audit } from '@/lib/audit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // larger uploads need more than default 10s

// GET — list photos for a lesson
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const photos = await prisma.photo.findMany({
    where: { lessonId: params.id },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ photos, blobEnabled: isBlobEnabled() });
}

// POST — upload a single photo for a lesson. Body is multipart/form-data
// with a single field `file`. Returns the created Photo row.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  if (!isBlobEnabled()) {
    return NextResponse.json(
      { error: 'Photo upload not configured. Set BLOB_READ_WRITE_TOKEN in Vercel project settings.' },
      { status: 503 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });

  const lesson = await prisma.lesson.findUnique({ where: { id: params.id } });
  if (!lesson) return NextResponse.json({ error: 'lesson not found' }, { status: 404 });

  const formData = await req.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'file field required (multipart/form-data)' }, { status: 400 });
  }
  const blobFile = file as File;
  if (blobFile.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'file too large (max 10MB)' }, { status: 413 });
  }
  if (!blobFile.type.startsWith('image/')) {
    return NextResponse.json({ error: 'file must be an image (image/*)' }, { status: 400 });
  }

  const uploaded = await uploadPhoto(`${params.id}/${blobFile.name}`, blobFile, blobFile.type);

  const photo = await prisma.photo.create({
    data: {
      lessonId: params.id,
      url: uploaded.url,
      mimeType: uploaded.contentType,
      sizeBytes: uploaded.size,
      uploadedById: user.id,
    },
  });

  await audit({
    userId: user.id,
    action: 'photo.upload',
    entityType: 'Photo',
    entityId: photo.id,
    payload: { lessonId: params.id, sizeBytes: uploaded.size, mimeType: uploaded.contentType },
  });

  return NextResponse.json({ photo }, { status: 201 });
}
