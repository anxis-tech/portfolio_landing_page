import { checked, type DatabaseClient } from './base.ts'
import type { LeadFilters } from '../schemas/lead.schema.ts'
import type { LeadRow } from '../types/index.ts'
export const PAGE_SIZE = 25
export async function listLeads(db: DatabaseClient, filters: LeadFilters) {
  let q = db.from('prospecting_lead_list').select('*', { count: 'exact' })
  if (filters.campaignId) q = q.eq('campaign_id', filters.campaignId)
  if (filters.classification) q = q.eq('classification', filters.classification)
  if (filters.opportunity) q = q.eq('opportunity_type', filters.opportunity)
  if (filters.segment) q = q.eq('segment', filters.segment)
  if (filters.city) q = q.eq('city', filters.city)
  if (filters.state) q = q.eq('state', filters.state)
  if (filters.website === 'yes') q = q.eq('has_website', true)
  if (filters.website === 'none') q = q.eq('has_website', false)
  if (filters.website === 'social') q = q.eq('has_website', false).eq('has_social', true)
  if (filters.minRating !== undefined) q = q.gte('rating', filters.minRating)
  if (filters.minReviews !== undefined) q = q.gte('reviews', filters.minReviews)
  if (filters.pipeline) q = q.eq('pipeline_stage', filters.pipeline)
  if (filters.since) q = q.gte('created_at', `${filters.since}T00:00:00Z`)
  if (filters.quick === 'hot' || filters.quick === 'cold')
    q = q.eq('classification', filters.quick).eq('manually_discarded', false)
  if (filters.quick === 'none') q = q.eq('has_website', false)
  const column = {
    classification: 'classification',
    reviews: 'reviews',
    rating: 'rating',
    performance: 'performance',
    recent: 'created_at',
  }[filters.sort]
  const result = await q
    .order(column, { ascending: filters.sort === 'performance', nullsFirst: false })
    .order('id')
    .range((filters.page - 1) * PAGE_SIZE, filters.page * PAGE_SIZE - 1)
  return { leads: checked(result) as LeadRow[], total: result.count ?? 0 }
}
export async function getLead(db: DatabaseClient, id: string) {
  return checked(
    await db.from('prospecting_lead_list').select('*').eq('id', id).single(),
    'getLead'
  ) as LeadRow
}

export async function getOperationalLead(db: DatabaseClient, id: string): Promise<LeadRow> {
  const viewRes = await db.from('prospecting_operational_lead_list').select('*').eq('id', id).maybeSingle()
  if (viewRes.data) {
    return viewRes.data as LeadRow
  }

  const clRes = await db.from('prospecting_campaign_leads').select('*').eq('id', id).single()
  const cl = checked(clRes, 'getOperationalLead:campaign_lead') as any

  const [leadRes, campRes] = await Promise.all([
    db.from('prospecting_leads').select('name, google_place_id').eq('id', cl.lead_id).single(),
    db.from('prospecting_campaigns').select('segment').eq('id', cl.campaign_id).single(),
  ])
  const l = checked(leadRes, 'getOperationalLead:lead') as any
  const c = checked(campRes, 'getOperationalLead:campaign') as any

  const business = cl.business ?? {}
  const digital = cl.digital ?? {}

  return {
    id: cl.id,
    campaign_id: cl.campaign_id,
    lead_id: cl.lead_id,
    business,
    digital,
    qualification_status: cl.qualification_status,
    pipeline_stage: cl.pipeline_stage,
    current_score: cl.current_score,
    classification: cl.classification,
    has_website: cl.has_website,
    has_contact: cl.has_contact,
    has_social: cl.has_social,
    opportunity_type: cl.opportunity_type,
    ai_analyzed: cl.ai_analyzed,
    manually_discarded: cl.manually_discarded,
    last_contact_at: cl.last_contact_at,
    enriched_at: cl.enriched_at,
    audited_at: cl.audited_at,
    scored_at: cl.scored_at,
    created_at: cl.created_at,
    updated_at: cl.updated_at,
    score_status: cl.score_status,
    score_confidence: cl.score_confidence,
    audit_failure_code: cl.audit_failure_code,
    audit_failure_detail: cl.audit_failure_detail,
    data_status: cl.data_status,
    name: l.name ?? 'Estabelecimento',
    google_place_id: l.google_place_id ?? null,
    segment: c.segment ?? '',
    city: business.city ?? null,
    state: business.state ?? null,
    rating: typeof business.rating === 'number' ? business.rating : null,
    reviews: typeof business.reviews === 'number' ? business.reviews : null,
    website: business.website ?? null,
    phone: business.phone ?? null,
    email: digital.email ?? null,
    website_kind: digital.websiteKind ?? null,
    performance: typeof digital.performance === 'number' ? digital.performance : null,
    bad_website: typeof digital.badWebsite === 'boolean' ? digital.badWebsite : null,
    has_booking: typeof digital.hasBooking === 'boolean' ? digital.hasBooking : null,
    whatsapp_only: typeof digital.whatsappOnly === 'boolean' ? digital.whatsappOnly : null,
  }
}

export async function getLeadOptional(db: DatabaseClient, id: string): Promise<LeadRow | null> {
  const res = await db.from('prospecting_lead_list').select('*').eq('id', id).maybeSingle()
  if (res.error) throw new Error(res.error.message)
  return res.data as LeadRow | null
}

export async function listProcessingLeads(
  db: DatabaseClient,
  campaignId: string
): Promise<import('../types/index.ts').ProcessingDetails> {
  const leadsRes = await db
    .from('prospecting_processing_leads')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('updated_at', { ascending: false })
    .limit(100)

  const processingLeads = checked(leadsRes) as {
    id: string
    campaign_id: string
    lead_id: string
    data_status: 'discovered' | 'enriching' | 'failed'
    qualification_status: string
    created_at: string
    updated_at: string
    name: string
    google_place_id: string | null
    segment: string
  }[]

  if (!processingLeads.length) {
    return { processing: [], failed: [] }
  }

  const leadIds = processingLeads.map((l) => l.id)
  const jobsRes = await db
    .from('prospecting_jobs')
    .select('id,campaign_lead_id,type,status,attempts,max_attempts,error_message,run_after')
    .in('campaign_lead_id', leadIds)
    .order('created_at', { ascending: false })

  const jobsByLead = new Map<string, any>()
  for (const j of (jobsRes.data ?? []) as any[]) {
    if (!jobsByLead.has(j.campaign_lead_id)) {
      jobsByLead.set(j.campaign_lead_id, j)
    }
  }

  const items: import('../types/index.ts').ProcessingLeadItem[] = processingLeads.map((l) => ({
    ...l,
    qualification_status: l.qualification_status as any,
    job: jobsByLead.get(l.id) ?? null,
  }))

  return {
    processing: items.filter((i) => i.data_status === 'discovered' || i.data_status === 'enriching'),
    failed: items.filter((i) => i.data_status === 'failed'),
  }
}
