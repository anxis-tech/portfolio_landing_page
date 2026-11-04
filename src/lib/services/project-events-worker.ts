import { createHash, timingSafeEqual } from 'node:crypto'

/** The scheduler credential is server-only and never returned to the caller. */
export function isProjectWorkerAuthorized(header: string | null, secret: string | undefined): boolean {
  if (!secret || secret.length < 32 || !header?.startsWith('Bearer ')) return false
  const supplied = header.slice('Bearer '.length)
  const expectedHash = createHash('sha256').update(secret).digest()
  const suppliedHash = createHash('sha256').update(supplied).digest()
  return timingSafeEqual(expectedHash, suppliedHash)
}

export async function processIndependentProjectEvents<TBilling, TFiscal>(dependencies: {
  billing: () => Promise<TBilling>
  fiscal: () => Promise<TFiscal>
}) {
  // A fiscal failure must never prevent a released final charge from being processed.
  const [billing, fiscal] = await Promise.allSettled([
    Promise.resolve().then(dependencies.billing),
    Promise.resolve().then(dependencies.fiscal),
  ])
  return {
    billing: billing.status === 'fulfilled' ? { ok: true as const, result: billing.value } : { ok: false as const },
    fiscal: fiscal.status === 'fulfilled' ? { ok: true as const, result: fiscal.value } : { ok: false as const },
  }
}
