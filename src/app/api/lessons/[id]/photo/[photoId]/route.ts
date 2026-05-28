import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { deletePhoto } from '@/lib/storage';
import { audit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string; photoId: string } }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });

  const photo = await prisma.photo.findUnique({ where: { id: params.photoId } });
  if (!photo || photo.lessonId !== params.id) {
    return NextResponse.json({ error: 'photo not found' }, { status: 404 });
  }

  // Best-effort blob delete first; DB row delete always runs.
  await deletePhoto(photo.url);
  await prisma.photo.delete({ where: { id: photo.id } });

  await audit({
    userId: user.id,
    action: 'photo.delete',
    entityType: 'Photo',
    entityId: photo.id,
    payload: { lessonId: params.id, url: photo.url },
  });

  return NextResponse.json({ deleted: true });
}
