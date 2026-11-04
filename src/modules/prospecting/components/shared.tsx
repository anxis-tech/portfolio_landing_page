import { Flame, Snowflake } from 'lucide-react'
import type { LeadRow, OpportunityType, QualificationStatus, DigitalPresence } from '../types/index'
export const inputClass =
  'min-h-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#233141] focus:ring-2 focus:ring-[#233141]/20 disabled:opacity-50'
export const buttonClass =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
export const primaryClass =
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#233141] px-4 py-2 text-sm font-semibold text-white hover:bg-[#182331] transition-colors disabled:cursor-not-allowed disabled:opacity-50'
export const opportunityLabels: Record<OpportunityType, string> = {
  website: 'Site',
  redesign: 'Redesign',
  software: 'Sistema',
  automation: 'Automação',
  website_and_software: 'Site + Sistema',
}
export const qualificationLabels: Record<QualificationStatus, string> = {
  discovered: 'Descoberto',
  enriching: 'Enriquecendo',
  enriched: 'Enriquecido',
  auditing: 'Auditando',
  audited: 'Auditado',
  opportunity: 'Oportunidade',
  qualified: 'Qualificado',
  highly_qualified: 'Alta prioridade',
  discarded: 'Descartado',
  error: 'Falha no processamento',
}
export const auditFailureLabels: Record<string, string> = {
  AUDIT_LEASE_EXPIRED: 'Auditoria interrompida',
  AUDIT_INTERNAL_ERROR: 'Falha interna na auditoria',
  AUDIT_CLIENT_ERROR: 'Erro na requisição do crawler',
  AUDIT_BLOCKED: 'Auditoria bloqueada por política do site',
  AUDIT_INCONCLUSIVE: 'Auditoria inconclusiva',
  WEBSITE_DNS_NOT_FOUND: 'Domínio não encontrado',
  WEBSITE_DNS_FAILURE: 'DNS inexistente / domínio não encontrado',
  WEBSITE_ADDRESS_BLOCKED: 'Endereço não permitido (segurança)',
  WEBSITE_URL_NOT_ALLOWED: 'URL de website não permitida',
  WEBSITE_CERTIFICATE_ERROR: 'Certificado SSL/TLS inválido',
  WEBSITE_TLS_HANDSHAKE_ERROR: 'Falha de conexão TLS',
  WEBSITE_TLS_ERROR: 'Falha SSL/TLS registrada anteriormente',
  WEBSITE_UNREACHABLE: 'Site não respondeu',
  WEBSITE_HTTP_ERROR: 'Erro HTTP no site',
  AUDIT_UNREACHABLE: 'Site inacessível após tentativas',
  PAGESPEED_ERROR: 'PageSpeed indisponível',
}

export type WebsiteDisplayStatus =
  | 'Sem site'
  | 'Somente social'
  | 'Site disponível'
  | 'Site indisponível'

export function isInvalidOrNonPublicHostname(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl)
    if (!['http:', 'https:'].includes(url.protocol)) return true
    if (url.username || url.password) return true
    if (url.port && !['80', '443'].includes(url.port)) return true
    const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase()
    if (!host.includes('.') && !host.includes(':')) return true
    if (/(?:^|\.)(localhost|local|internal|test|invalid)$/.test(host)) return true
    return false
  } catch {
    return true
  }
}

export function isTlsCertFailure(code?: string | null, detail?: string | null): boolean {
  if (code === 'WEBSITE_CERTIFICATE_ERROR' || code === 'WEBSITE_TLS_ERROR') {
    return true
  }
  const str = `${code ?? ''} ${detail ?? ''}`
  return /UnknownIssuer|CERTIFICATE_ERROR|CERT_HAS_EXPIRED|CERT_NOT_YET_VALID|DEPTH_ZERO_SELF_SIGNED_CERT|SELF_SIGNED|UNABLE_TO_VERIFY_LEAF_SIGNATURE|HOSTNAME_MISMATCH|ALTNAME_INVALID|CertNotValidForName|CertExpired|UntrustedCert|InvalidCertificate|ERR_TLS_CERT/i.test(
    str
  )
}

export function getWebsiteDisplayStatus(lead: {
  website?: string | null
  website_kind?: string | null
  has_website?: boolean
  has_social?: boolean
  audit_failure_code?: string | null
  audit_failure_detail?: string | null
  digital?: DigitalPresence | null
}): WebsiteDisplayStatus {
  const website = lead.website?.trim() || (lead.has_website ? lead.digital?.finalUrl?.trim() : undefined)
  const kind = lead.website_kind ?? lead.digital?.websiteKind
  if (!website) return 'Sem site'
  const socialKind = ['social', 'social_only', 'messaging_only', 'link_aggregator'].includes(kind ?? '')
  if (lead.has_website === false) {
    return lead.has_social || socialKind ? 'Somente social' : 'Sem site'
  }
  if (lead.has_website !== true && kind === 'none') return 'Sem site'
  if (lead.has_website !== true && socialKind) {
    return 'Somente social'
  }

  // 1. Sintaxe de URL inválida ou domínio reservado (.invalid, localhost, etc.)
  if (isInvalidOrNonPublicHostname(website)) {
    return 'Site indisponível'
  }

  const code = lead.audit_failure_code ?? lead.digital?.auditFailureCode
  const detail = lead.audit_failure_detail ?? lead.digital?.warnings?.[0]

  // 2. Exceção TLS: Certificado inválido / UnknownIssuer / expirado / mismatch
  // O servidor existe, DNS resolveu e TCP 443 conectou. O site é comercialmente disponível!
  if (lead.digital?.tlsError || isTlsCertFailure(code, detail)) {
    return 'Site disponível'
  }

  // Extrai status HTTP se disponível no digital ou na mensagem de erro
  let httpStatus = lead.digital?.httpStatus
  if (httpStatus === undefined || httpStatus === null) {
    const match = detail?.match(/HTTP (\d{3})/i)
    if (match) {
      httpStatus = parseInt(match[1], 10)
    }
  }

  // 3. Status HTTP específico
  if (httpStatus !== undefined && httpStatus !== null) {
    // 2xx e 3xx -> Site disponível
    if (httpStatus >= 200 && httpStatus < 400) {
      return 'Site disponível'
    }
    // 401, 403, 429 -> Servidor ativo e respondendo (mesmo com bloqueio de bot/crawler)
    if ([401, 403, 429].includes(httpStatus)) {
      return 'Site disponível'
    }
    // 404, 410 e 5xx (500, 502, 503) -> Site indisponível
    if (httpStatus === 404 || httpStatus === 410 || (httpStatus >= 500 && httpStatus < 600)) {
      return 'Site indisponível'
    }
    // Demais 4xx (ex.: 400 Bad Request, 405 Method Not Allowed)
    if (httpStatus >= 400 && httpStatus < 500) {
      return 'Site indisponível'
    }
  }

  // 4. Códigos de falha de auditoria / infraestrutura
  if (code === 'AUDIT_BLOCKED' || code === 'BODY_LIMIT_EXCEEDED') {
    // Bloqueio por robots.txt/WAF ou conteúdo > 1MB: o servidor respondeu
    return 'Site disponível'
  }

  if (
    code === 'WEBSITE_DNS_NOT_FOUND' ||
    code === 'WEBSITE_DNS_FAILURE' ||
    lead.digital?.dnsFailure
  ) {
    return 'Site indisponível'
  }

  if (code === 'WEBSITE_ADDRESS_BLOCKED' || code === 'WEBSITE_URL_NOT_ALLOWED') {
    return 'Site indisponível'
  }

  if (
    code === 'WEBSITE_UNREACHABLE' ||
    code === 'AUDIT_UNREACHABLE' ||
    code === 'AUDIT_TIMEOUT' ||
    lead.digital?.unreachable
  ) {
    return 'Site indisponível'
  }

  if (code === 'WEBSITE_HTTP_ERROR' || lead.digital?.httpError) {
    return 'Site indisponível'
  }

  if (code === 'WEBSITE_TLS_HANDSHAKE_ERROR') {
    return 'Site indisponível'
  }

  // 5. Se o crawler falhou sem se enquadrar nas exceções de disponibilidade acima
  if (lead.digital?.crawlStatus === 'failed') {
    return 'Site indisponível'
  }

  return 'Site disponível'
}

export type ScoreBand = 'Alta' | 'Média' | 'Baixa'

export function getScoreBand(score: number | null | undefined): ScoreBand | null {
  if (score === null || score === undefined) return null
  if (score >= 85) return 'Alta'
  if (score >= 55) return 'Média'
  return 'Baixa'
}

export function ClassificationBadge({
  lead,
}: {
  lead: Pick<LeadRow, 'classification'>
}) {
  const isHot = lead.classification === 'hot'
  const label = isHot ? 'Quente' : 'Frio'
  const Icon = isHot ? Flame : Snowflake
  const color = isHot
    ? 'bg-amber-50 text-orange-700 ring-amber-200'
    : 'bg-sky-50 text-sky-700 ring-sky-200'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset ${color}`}
    >
      <Icon size={13} strokeWidth={2} aria-hidden="true" />
      {label}
    </span>
  )
}
export function dateLabel(value: string | null) {
  return value
    ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
    : 'Nunca'
}
export function safeLink(value: string | null | undefined) {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined
  } catch {
    return undefined
  }
}
export function observed(value: boolean | undefined | null) {
  return value === undefined || value === null ? 'Não verificado' : value ? 'Sim' : 'Não detectado'
}
