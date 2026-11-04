export type ProposalStatus = 'sent' | 'viewed' | 'accepted' | 'expired'
export type ProposalVersionStatus = ProposalStatus | 'superseded'

export interface ProposalVersionHistoryEntry {
  version: number
  status: ProposalVersionStatus
  createdAt: string
  acceptedAt: string | null
  superseded: boolean
}

export interface ProposalDraftContext {
  clientEmail?: string
  clientPhone?: string
  projectDescription?: string
  objective?: string
  targetAudience?: string
  segment?: string
  deliveryTerm?: string
  validUntil?: string | null
}

export interface ProposalContactSnapshot {
  email: string
  whatsapp: string
}

export interface QuoteProposalSnapshot {
  schemaVersion: 1
  generatedAt: string
  brand: {
    name: 'ANXIS'
    positioning: string
    email: string
    whatsapp: string
  }
  client: {
    name: string
    company: string | null
    email: string | null
    phone: string | null
  }
  project: {
    name: string
    type: string
    platform: string
    description: string
    objective: string | null
    targetAudience: string | null
    segment: string | null
  }
  executive: {
    eyebrow: string
    title: string
    summary: string
    challenge: string
    solution: string
    whyAnxis: string[]
  }
  scope: {
    pageCount: number
    additionalPageCount: number
    contentOption: string
    urgency: string
    deliverables: string[]
  }
  technology: {
    platform: string
    summary: string
    benefits: string[]
    details: string[]
  }
  timeline: Array<{
    title: string
    description: string
  }>
  investment: {
    subtotal: number
    additionalCosts: number
    discount: number
    taxes: number
    finalValue: number
    paymentTerms: string
    paymentOptions?: {
      integral: {
        total: number
      }
      split50_50: {
        surchargeRate: number
        total: number
        installments: [number, number]
      }
    }
    breakdown: Array<{
      label: string
      value: number
    }>
  }
  conditions: {
    validUntil: string | null
    deliveryTerm: string | null
    notes: string | null
    disclaimer: string
  }
}

export interface ProposalAdminState {
  proposalId: string
  quoteId: string
  projectId: string | null
  publicToken: string
  status: ProposalStatus
  version: number
  snapshotHash: string
  expiresAt: string | null
  sentAt: string
  firstViewedAt: string | null
  lastViewedAt: string | null
  viewCount: number
  acceptedAt: string | null
  acceptedName: string | null
  acceptedEmail: string | null
  history?: ProposalVersionHistoryEntry[]
}

export interface PublicProposalPayload {
  publicToken: string
  status: ProposalStatus
  version: number
  expiresAt: string | null
  sentAt: string
  firstViewedAt: string | null
  viewCount: number
  acceptedAt: string | null
  snapshot: QuoteProposalSnapshot
}
