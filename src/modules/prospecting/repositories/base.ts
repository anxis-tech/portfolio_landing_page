import type { SupabaseClient } from '@supabase/supabase-js'

export type DatabaseClient = SupabaseClient

export interface DatabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

function sanitizeDbError(text: string): string {
  return text
    .replace(/(?:key=|api[-_]?key[:=]\s*|authorization:\s*bearer\s+)[A-Za-z0-9_\-\.]{16,}/gi, '[REDACTED]')
    .replace(/sbp_[A-Za-z0-9_]{20,}/gi, '[REDACTED]')
}

export function checked<T>(
  result: {
    data: T
    error: DatabaseError | null
  },
  context?: string
): T {
  if (result.error) {
    if (result.error.code === '42P01' || result.error.code === 'PGRST205') {
      throw new Error('Prospecção ainda não instalada no banco. Aplique as migrations do módulo.')
    }
    const ctxPrefix = context ? `[database:${context}] ` : '[database] '
    const code = result.error.code ?? 'ERROR'
    const msg = sanitizeDbError(result.error.message || 'Erro desconhecido no banco de dados.')
    const extra = result.error.details || result.error.hint
      ? ` - ${sanitizeDbError(result.error.details || result.error.hint || '')}`
      : ''
    throw new Error(`${ctxPrefix}${code}: ${msg}${extra}`)
  }
  return result.data
}
