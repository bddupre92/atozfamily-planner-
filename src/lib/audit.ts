import { prisma } from './db';

export async function audit(opts: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  payload?: any;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: opts.userId ?? null,
        action: opts.action,
        entityType: opts.entityType,
        entityId: opts.entityId,
        payload: opts.payload ?? undefined,
      },
    });
  } catch (e) {
    // Never let audit failures break the main flow
    console.error('Audit log write failed:', e);
  }
}
