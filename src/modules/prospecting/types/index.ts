export const pipelineStages = [
  'new',
  'reviewed',
  'contacted',
  'replied',
  'meeting',
  'proposal',
  'won',
  'lost',
] as const
export type PipelineStage = (typeof pipelineStages)[number]
export const pipelineLabels: Record<PipelineStage, string> = {
  new: 'Novo',
  reviewed: 'Revisado',
  contacted: 'Contatado',
  replied: 'Respondeu',
  meeting: 'Reunião',
  proposal: 'Proposta',
  won: 'Ganho',
  lost: 'Perdido',
}
export type QualificationStatus =
  | 'discovered'
  | 'enriching'
  | 'enriched'
  | 'auditing'
  | 'audited'
  | 'opportunity'
  | 'qualified'
  | 'highly_qualified'
  | 'discarded'
  | 'error'
export type OpportunityType =
  'website' | 'redesign' | 'software' | 'automation' | 'website_and_software'
export type JobType =
  | 'discover_places'
  | 'enrich_lead'
  | 'audit_website'
  | 'calculate_score'
  | 'analyze_ai'
  | 'refresh_lead'
export interface Campaign {
  id: string
  segment: string
  city: string
  state: string
  country: string
  volume: number
  min_score: number
  ai_score_threshold: number
  status: 'running' | 'paused' | 'completed' | 'error'
  search_terms: string[]
  discovery_done: boolean
  discovery_note: string | null
  created_at: string
}
export type LeadClassification = 'hot' | 'cold'

export interface Business {
  name: string
  city?: string | null
  state?: string | null
  country?: string | null
  category?: string | null
  socialProfiles?: string[]
  website?: string | null
  phone?: string | null
  rating?: number | null
  reviews?: number | null
  latitude?: number
  longitude?: number
  closed?: boolean
  duplicate?: boolean
  spam?: boolean
  incompatibleCategory?: boolean
  lowFit?: boolean
  multipleLocations?: boolean
  structure?: boolean
  regional?: boolean
  franchise?: boolean
  commercialStructure?: boolean
  attributions?: { provider: string; providerUri?: string }[]
}
export type ScoreStatus = 'pending' | 'provisional' | 'final'
export type ScoreConfidence = 'low' | 'medium' | 'high'
export type AuditFailureCode =
  | 'AUDIT_LEASE_EXPIRED'
  | 'AUDIT_INTERNAL_ERROR'
  | 'AUDIT_CLIENT_ERROR'
  | 'AUDIT_BLOCKED'
  | 'AUDIT_INCONCLUSIVE'
  | 'AUDIT_TIMEOUT'
  | 'WEBSITE_DNS_NOT_FOUND'
  | 'WEBSITE_DNS_FAILURE'
  | 'WEBSITE_ADDRESS_BLOCKED'
  | 'WEBSITE_URL_NOT_ALLOWED'
  | 'WEBSITE_CERTIFICATE_ERROR'
  | 'WEBSITE_TLS_HANDSHAKE_ERROR'
  | 'WEBSITE_TLS_ERROR'
  | 'WEBSITE_UNREACHABLE'
  | 'WEBSITE_HTTP_ERROR'
  | 'AUDIT_UNREACHABLE'
  | 'PAGESPEED_ERROR'
  | 'BODY_LIMIT_EXCEEDED'

export type WebsiteKind =
  | 'website'
  | 'social_only'
  | 'social'
  | 'messaging_only'
  | 'link_aggregator'
  | 'shortener_unresolved'
  | 'none'

export interface DigitalPresence {
  /** Found social profile URLs, without personal/professional profile analysis. */
  socialProfiles?: string[]
  websiteKind?: WebsiteKind
  /** Historical Lighthouse metrics only; never populated or scored by automatic audits 2.1+. */
  performance?: number | null
  seo?: number | null
  accessibility?: number | null
  bestPractices?: number | null
  title?: string | null
  description?: string | null
  h1?: string | null
  https?: boolean
  hasViewport?: boolean
  hasForm?: boolean
  hasWhatsapp?: boolean
  hasPhone?: boolean
  hasEmail?: boolean
  email?: string | null
  whatsappNumber?: string | null
  contactExtractionStatus?: 'success' | 'partial' | 'failed' | 'unavailable'
  extractedContacts?: {
    whatsapp?: string[]
    emails?: string[]
    phones?: string[]
    ctaLinks?: Array<{ href: string; text?: string; type?: string }>
  }
  hasCTA?: boolean
  hasBooking?: boolean
  hasLogin?: boolean
  hasClientArea?: boolean
  whatsappOnly?: boolean
  badWebsite?: boolean
  manualForms?: boolean
  manualProcesses?: boolean
  unstructuredCatalog?: boolean
  integrationNeed?: boolean
  technologies?: string[]
  analytics?: string[]
  httpStatus?: number
  crawlStatus?: 'success' | 'partial' | 'failed'
  warnings?: string[]
  initialUrl?: string
  finalUrl?: string
  redirectChain?: string[]
  crawledAt?: string
  auditFailureCode?: AuditFailureCode | null
  dnsFailure?: boolean
  tlsError?: boolean
  unreachable?: boolean
  httpError?: boolean
  robotsStatus?: 'allowed' | 'disallowed' | 'unavailable' | 'blocked' | 'error'
  addressFamily?: 'IPv4' | 'IPv6'
  selectedAddress?: string
  crawlerDurationMs?: number
  /** Historical audit telemetry only. */
  pagespeedDurationMs?: number
  auditTotalDurationMs?: number
  connectionDurationMs?: number
  tlsDurationMs?: number
  transportVersion?: string
  hostname?: string
  attempts?: Array<{
    address: string
    family?: 'IPv4' | 'IPv6'
    durationMs: number
    error?: string
  }>
}
export type DataStatus = 'discovered' | 'enriching' | 'ready' | 'failed'

export interface LeadRow {
  id: string
  lead_id: string
  campaign_id: string
  name: string
  google_place_id: string | null
  segment: string
  city: string | null
  state: string | null
  rating: number | null
  reviews: number | null
  website: string | null
  phone: string | null
  email: string | null
  website_kind: string | null
  current_score: number | null
  classification: LeadClassification
  has_website: boolean
  has_contact: boolean
  has_social: boolean
  qualification_status: QualificationStatus
  pipeline_stage: PipelineStage
  opportunity_type: OpportunityType | null
  ai_analyzed: boolean
  manually_discarded: boolean
  last_contact_at: string | null
  created_at: string
  updated_at?: string
  performance: number | null
  bad_website: boolean | null
  has_booking: boolean | null
  whatsapp_only: boolean | null
  business: Business
  digital: DigitalPresence
  enriched_at: string | null
  audited_at: string | null
  scored_at?: string | null
  score_status: ScoreStatus
  score_confidence?: ScoreConfidence
  audit_failure_code?: AuditFailureCode | null
  audit_failure_detail?: string | null
  data_status: DataStatus
}
export interface Job {
  id: string
  campaign_id: string
  campaign_lead_id: string | null
  type: JobType
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  attempts: number
  max_attempts: number
  error_message: string | null
  run_after: string
  payload: { term?: number; page?: number; pageToken?: string; scoreRunId?: string }
  locked_by: string | null
}
export interface Metrics {
  found: number
  ready: number
  processing: number
  failed: number
  enriched: number
  audited: number
  hot: number
  cold: number
  /** Legacy metric aliases: both now count hot leads. */
  qualified: number
  highPriority: number
  contacted: number
  replied: number
  proposals: number
}
export const emptyMetrics: Metrics = {
  found: 0,
  ready: 0,
  processing: 0,
  failed: 0,
  enriched: 0,
  audited: 0,
  hot: 0,
  cold: 0,
  qualified: 0,
  highPriority: 0,
  contacted: 0,
  replied: 0,
  proposals: 0,
}

export interface ProcessingLeadItem {
  id: string
  campaign_id: string
  lead_id: string
  name: string
  google_place_id: string | null
  segment: string
  data_status: DataStatus
  qualification_status: QualificationStatus
  created_at: string
  updated_at: string
  job?: {
    id: string
    type: JobType
    status: string
    attempts: number
    max_attempts: number
    run_after: string
    error_message: string | null
  } | null
}

export interface ProcessingDetails {
  processing: ProcessingLeadItem[]
  failed: ProcessingLeadItem[]
}
export type ContactChannel = 'whatsapp' | 'email'
export type MessageStatus =
  'draft' | 'queued' | 'sent' | 'delivered' | 'read' | 'opened' | 'replied' | 'bounced' | 'failed'
