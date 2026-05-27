import { handlers } from '@/lib/auth';

// NextAuth v5 exports `handlers` as an object with `.GET` and `.POST` methods.
// We destructure here so Next.js's App Router picks them up as route handlers.
export const { GET, POST } = handlers;
