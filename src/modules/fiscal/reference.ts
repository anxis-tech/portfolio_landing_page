import { createHash } from 'node:crypto'

/** Stable internal reference used for permanent ANXIS-side idempotency. */
export function fiscalProviderReference(internalReference: string): string {
  return `anxis_${createHash('sha256').update(internalReference).digest('hex').slice(0, 40)}`
}
