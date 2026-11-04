import type { Rule, ScoringInput } from './types.ts'

export function factsFor(input: Pick<ScoringInput, 'business' | 'digital' | 'segment'>): Record<string, unknown> {
  const { business: b, digital: d, segment: s } = input
  const hasExtractedEmail = Boolean(d.email || d.extractedContacts?.emails?.length)
  const hasExtractedWhatsapp = Boolean(
    d.whatsappNumber || d.hasWhatsapp || d.extractedContacts?.whatsapp?.length
  )
  const hasExtractedPhone = Boolean(
    b.phone || d.hasPhone || d.extractedContacts?.phones?.length
  )

  return {
    reviews: b.reviews,
    rating: b.rating,
    segmentPriority: s.priority,
    structure: b.multipleLocations === true || b.structure === true || b.regional === true,
    noWebsite: d.websiteKind === 'none',
    socialOnly:
      d.websiteKind === 'social' ||
      d.websiteKind === 'social_only' ||
      d.websiteKind === 'link_aggregator' ||
      d.websiteKind === 'messaging_only',
    multipleLocations: b.multipleLocations === true,
    phone: Boolean(b.phone),
    email: hasExtractedEmail,
    accessibleContact: Boolean(
      hasExtractedPhone ||
      hasExtractedEmail ||
      hasExtractedWhatsapp ||
      d.websiteKind === 'messaging_only'
    ),
    highTicket: s.highTicket,
    commercialStructure: b.commercialStructure === true,
    franchise: b.franchise === true,
    lowFit: b.lowFit === true,
  }
}

export function evaluate(rule: Rule, facts: Record<string, unknown>): boolean {
  const value = facts[rule.config.field]
  if (
    isPageSpeedRule(rule) ||
    isTechnicalRule(rule) ||
    isHTMLAuditRule(rule) ||
    value === undefined ||
    value === null
  )
    return false
  const config = rule.config
  if (config.op === 'eq') return value === config.value
  if (typeof value !== 'number' || !Number.isFinite(value) || typeof config.value !== 'number')
    return false
  if (config.op === 'lt') return value < config.value
  if (config.op === 'gte') return value >= config.value
  return value >= config.value && value < (config.max ?? Infinity)
}

export function resolveRules(rules: readonly Rule[], campaignId?: string): Rule[] {
  const merged = new Map<string, Rule>()
  for (const rule of rules) if (rule.campaign_id === null) merged.set(rule.code, rule)
  for (const rule of rules)
    if (campaignId && rule.campaign_id === campaignId) merged.set(rule.code, rule)
  return [...merged.values()].sort(
    (a, b) => a.priority - b.priority || a.code.localeCompare(b.code)
  )
}

// Ignore legacy/global/campaign infrastructure rules, including negative variants.
export function isTechnicalRule(rule: Rule): boolean {
  return (
    ['dnsFailure', 'tlsError', 'unreachable', 'httpError', 'auditBlocked', 'httpsProblem',
      'auditFailureCode', 'httpStatus', 'robotsStatus'].includes(rule.config.field) ||
    /^(WEBSITE_(DNS_|TLS_|CERTIFICATE_|HTTP_|UNREACHABLE)|AUDIT_(UNREACHABLE|BLOCKED)|HTTPS_PROBLEM)/.test(rule.code)
  )
}

// 2.1 ignores even enabled historical rules and campaign overrides, in every group.
export function isPageSpeedRule(rule: Rule): boolean {
  return (
    ['performance', 'seo', 'accessibility', 'bestPractices', 'best_practices',
      'seoScore', 'excellentWebsite', 'pagespeedDurationMs', 'pagespeedError',
      'pagespeedTimeout'].includes(rule.config.field) ||
    /^(PERFORMANCE_|SEO_|EXCELLENT_SITE$|PAGESPEED|LIGHTHOUSE)/i.test(rule.code)
  )
}

// 2.2 ignores automated HTML/technical audit rules.
export function isHTMLAuditRule(rule: Rule): boolean {
  return (
    [
      'noForm',
      'noCTA',
      'whatsappOnly',
      'mobileProblem',
      'noBooking',
      'noClientArea',
      'manualForms',
      'manualProcesses',
      'unstructuredCatalog',
      'integrationNeed',
    ].includes(rule.config.field) ||
    /^(NO_FORM|NO_CTA|WHATSAPP_ONLY|MOBILE_PROBLEM|NO_BOOKING|SYSTEM_BOOKING|SYSTEM_WHATSAPP|SYSTEM_FORMS|SYSTEM_CLIENT_AREA|SYSTEM_CATALOG|SYSTEM_MANUAL|SYSTEM_INTEGRATION)$/.test(
      rule.code
    )
  )
}
