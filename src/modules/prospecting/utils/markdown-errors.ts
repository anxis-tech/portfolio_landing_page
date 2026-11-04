import type { ProcessingLeadItem } from '../types/index'

/**
 * Sanitizes technical error messages to prevent accidental leaking of API keys, tokens, or credentials.
 */
export function sanitizeErrorMessage(message: string): string {
  if (!message) return 'Nenhuma mensagem de erro detalhada.'
  return message
    .replace(/AIza[0-9A-Za-z-_]{30,45}/gi, '[REDACTED_GOOGLE_API_KEY]')
    .replace(/sbp_[A-Za-z0-9_]{20,}/gi, '[REDACTED_SUPABASE_TOKEN]')
    .replace(/(Bearer\s+)[A-Za-z0-9_\-\.]{20,}/gi, '$1[REDACTED]')
    .replace(/((?:key=|api[-_]?key[:=]\s*|authorization:\s*bearer\s+))[A-Za-z0-9_\-\.]{16,}/gi, '$1[REDACTED]')
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Data não informada'
  try {
    return new Date(dateStr).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium',
    })
  } catch {
    return dateStr
  }
}

/**
 * Builds clean, structured Markdown for a single technical failure item, ideal for pasting into LLMs.
 */
export function buildTechnicalErrorMarkdown(item: ProcessingLeadItem, index?: number): string {
  const isPlaceholder =
    !item.name ||
    ['Estabelecimento em enriquecimento', 'Carregando empresa...'].includes(item.name.trim())
  const leadName = isPlaceholder
    ? item.google_place_id
      ? `Local ${item.google_place_id} (Nome não enriquecido)`
      : 'Empresa ainda não identificada'
    : item.name

  const prefix = index !== undefined ? `### ${index}. ` : '### '
  const jobType = item.job?.type ?? 'enrich_lead'

  const lines: string[] = []
  lines.push(`${prefix}${jobType}`)
  lines.push('')
  lines.push(`- Lead: ${leadName}`)
  if (item.id) lines.push(`- Campaign Lead ID: ${item.id}`)
  if (item.lead_id) lines.push(`- Lead ID: ${item.lead_id}`)
  if (item.google_place_id) lines.push(`- Google Place ID: ${item.google_place_id}`)
  if (item.segment) lines.push(`- Segmento: ${item.segment}`)

  const status = item.job?.status ?? item.qualification_status ?? item.data_status
  lines.push(`- Status: ${status}`)

  if (item.job) {
    lines.push(`- Tentativa: ${item.job.attempts} de ${item.job.max_attempts}`)
    if (item.job.run_after) {
      lines.push(`- Próxima execução: ${formatDate(item.job.run_after)}`)
    }
  }

  const dateStr = item.updated_at || item.created_at
  if (dateStr) {
    lines.push(`- Data: ${formatDate(dateStr)}`)
  }

  lines.push('')
  lines.push('Erro:')
  lines.push('')

  const rawError =
    item.job?.error_message ||
    'Falha ao buscar dados mínimos do estabelecimento no Google Places.'
  const sanitized = sanitizeErrorMessage(rawError).trim()

  lines.push('```text')
  lines.push(sanitized)
  lines.push('```')

  return lines.join('\n')
}

/**
 * Builds clean, structured Markdown for all technical failures, sorted by most recent first.
 */
export function buildTechnicalErrorsMarkdown(errors: ProcessingLeadItem[]): string {
  if (!errors || errors.length === 0) {
    return '## Falhas técnicas da prospecção\n\nNenhuma falha técnica registrada no momento.'
  }

  // Sort from most recent to oldest
  const sorted = [...errors].sort((a, b) => {
    const timeA = new Date(a.updated_at || a.created_at).getTime()
    const timeB = new Date(b.updated_at || b.created_at).getTime()
    return timeB - timeA
  })

  const header = [
    '## Falhas técnicas da prospecção',
    '',
    `Total de falhas: ${sorted.length}`,
    `Gerado em: ${formatDate(new Date().toISOString())}`,
    '',
  ].join('\n')

  const itemsMarkdown = sorted
    .map((err, idx) => buildTechnicalErrorMarkdown(err, idx + 1))
    .join('\n\n')

  return `${header}\n${itemsMarkdown}\n`
}
