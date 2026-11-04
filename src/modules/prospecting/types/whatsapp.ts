import type { LeadClassification } from './index.ts'

// WhatsApp CRM Integration Types (Section 4 & 7 of docs/whatsapp-crm-implementation-plan.md)

export type WhatsAppAccountStatus = 'unconfigured' | 'ready' | 'degraded' | 'disabled'

export type WhatsAppOptInStatus = 'unknown' | 'granted' | 'revoked'

export type WhatsAppCapability = 'unknown' | 'confirmed' | 'unavailable'

export type WhatsAppConversationStatus = 'open' | 'waiting_customer' | 'waiting_agent' | 'closed'

export type WhatsAppMessageDirection = 'inbound' | 'outbound'

export type WhatsAppMessageType =
  | 'text'
  | 'template'
  | 'image'
  | 'document'
  | 'audio'
  | 'interactive'
  | 'unsupported'

export type WhatsAppMessageStatus =
  | 'pending'
  | 'accepted'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'received'

export type WhatsAppSendState =
  | 'not_applicable'
  | 'queued'
  | 'sending'
  | 'retry_wait'
  | 'accepted'
  | 'uncertain'
  | 'failed'

export type WhatsAppConsentSource =
  | 'form'
  | 'written_request'
  | 'verbal_record'
  | 'manual_evidence'
  | 'inbound_keyword'

export type WhatsAppCommercialActionType =
  | 'lost'
  | 'interested'
  | 'meeting'
  | 'proposal'

export interface WhatsAppAccount {
  id: string
  waba_id: string
  phone_number_id: string
  display_phone_number: string
  label: string
  enabled: boolean
  connection_status: WhatsAppAccountStatus
  last_checked_at: string | null
  last_error_code: string | null
  last_wake_at: string | null
  templates_sync_requested_at: string | null
  templates_synced_at: string | null
  created_at: string
  updated_at: string
}

export interface WhatsAppContact {
  id: string
  account_id: string
  phone_e164: string
  display_name: string | null
  wa_id: string | null
  capability: WhatsAppCapability
  capability_source: string | null
  capability_checked_at: string | null
  opt_in_status: WhatsAppOptInStatus
  granted_at: string | null
  revoked_at: string | null
  created_at: string
  updated_at: string
}

export interface WhatsAppConversation {
  id: string
  account_id: string
  contact_id: string
  lead_id: string | null
  campaign_lead_id: string | null
  prospecting_contact_id: string | null
  assigned_to: string | null
  status: WhatsAppConversationStatus
  last_message_id: string | null
  last_message_at: string | null
  last_inbound_at: string | null
  last_outbound_at: string | null
  customer_window_expires_at: string | null
  inbound_seq: number
  read_seq: number
  unread_count: number
  last_read_at: string | null
  last_read_by: string | null
  closed_at: string | null
  created_at: string
  updated_at: string
}

export interface WhatsAppTemplate {
  id: string
  account_id: string
  meta_template_id: string
  name: string
  language: string
  category: string
  status: string
  components: WhatsAppTemplateComponent[]
  supported: boolean
  synced_at: string
  sync_error_code: string | null
  created_at: string
  updated_at: string
}

export interface WhatsAppTemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS'
  format?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO'
  text?: string
  example?: {
    body_text?: string[][]
    header_text?: string[]
  }
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER'
    text: string
    url?: string
    phone_number?: string
  }>
}

export interface WhatsAppMessage {
  id: string
  account_id: string
  conversation_id: string
  direction: WhatsAppMessageDirection
  type: WhatsAppMessageType
  body: string | null
  content: Record<string, unknown>
  template_id: string | null
  wamid: string | null
  client_request_id: string | null
  request_hash: string | null
  status: WhatsAppMessageStatus
  send_state: WhatsAppSendState
  reply_to_id: string | null
  reply_to_wamid: string | null
  inbound_seq: number | null
  sent_by_user_id: string | null
  sent_by_name: string | null
  pipeline_campaign_lead_id: string | null
  occurred_at: string
  accepted_at: string | null
  sent_at: string | null
  delivered_at: string | null
  read_at: string | null
  failed_at: string | null
  error_code: string | null
  error_message: string | null
  uncertainty_acknowledged_at: string | null
  attempt_count: number
  next_attempt_at: string
  created_at: string
  updated_at: string
}

export interface WhatsAppOptIn {
  id: string
  account_id: string
  contact_id: string
  status: 'granted' | 'revoked'
  source: WhatsAppConsentSource
  proof: {
    description: string
    evidenceRef?: string
    keyword?: string
    wamid?: string
    [key: string]: unknown
  }
  occurred_at: string
  recorded_by: string | null
  source_message_id: string | null
  request_id: string
  created_at: string
}

export interface WhatsAppConversationEvent {
  id: string
  conversation_id: string
  kind: string
  actor_user_id: string | null
  actor_name: string | null
  request_id: string
  data: Record<string, unknown>
  created_at: string
}

export interface WhatsAppMessageEvent {
  id: string
  account_id: string
  message_id: string | null
  wamid: string | null
  event_key: string
  kind: string
  provider_timestamp: string | null
  error_code: string | null
  detail: Record<string, unknown>
  webhook_event_id: string | null
  created_at: string
}

// DTOs for UI and Server Actions
export interface WhatsAppSummaryDTO {
  campaignLeadId: string
  commercialStatus: 'new' | 'contacted' | 'replied'
  hasCandidate: boolean
  conversationId?: string
  contactId?: string
  phoneE164?: string
  unreadCount: number
  lastMessageStatus?: WhatsAppMessageStatus
  lastMessageAt?: string
  lastMessageType?: WhatsAppMessageType
  optInStatus: WhatsAppOptInStatus
  isWindowOpen: boolean
  hasConversation: boolean
}

export interface WhatsAppCandidateDTO {
  prospectingContactId: string | null
  phoneE164: string
  displayPhone: string
  source: string
  type?: string
  isPrimary?: boolean
}

export interface WhatsAppAccountDTO {
  id: string
  displayPhoneNumber: string
  label: string
  enabled: boolean
  connectionStatus: WhatsAppAccountStatus
}

export interface WhatsAppConversationDTO {
  id: string
  accountId: string
  contactId: string
  leadId: string | null
  campaignLeadId: string | null
  prospectingContactId: string | null
  assignedTo: string | null
  assignedName?: string | null
  status: WhatsAppConversationStatus
  lastInboundAt: string | null
  lastOutboundAt: string | null
  customerWindowExpiresAt: string | null
  inboundSeq: number
  readSeq: number
  unreadCount: number
  lastReadAt: string | null
  closedAt: string | null
  phoneE164: string
  optInStatus: WhatsAppOptInStatus
  isWindowOpen: boolean
}

export interface WhatsAppMessageDTO {
  id: string
  conversationId: string
  direction: WhatsAppMessageDirection
  type: WhatsAppMessageType
  body: string | null
  content: Record<string, unknown>
  templateId: string | null
  wamid: string | null
  status: WhatsAppMessageStatus
  sendState: WhatsAppSendState
  inboundSeq: number | null
  sentByName: string | null
  occurredAt: string
  acceptedAt: string | null
  sentAt: string | null
  deliveredAt: string | null
  readAt: string | null
  failedAt: string | null
  errorCode: string | null
  errorMessage: string | null
  uncertaintyAcknowledgedAt: string | null
  isUncertain: boolean
}

export interface WhatsAppTemplateDTO {
  id: string
  name: string
  language: string
  category: string
  status: string
  components: WhatsAppTemplateComponent[]
  supported: boolean
}

export interface WhatsAppAssigneeDTO {
  id: string
  fullName: string
}

export interface WhatsAppCursor {
  occurredAt: string
  id: string
}

export interface WhatsAppConversationPageDTO {
  conversation: WhatsAppConversationDTO
  contact: {
    id: string
    phoneE164: string
    displayName: string | null
    optInStatus: WhatsAppOptInStatus
    capability: WhatsAppCapability
  }
  lead: {
    id: string
    name: string
    companyName?: string
    city?: string
    state?: string
    stage?: string
    /** Historical value retained for integrations. */
    score?: number
    classification?: LeadClassification
  } | null
  messages: WhatsAppMessageDTO[]
  nextCursor: WhatsAppCursor | null
  templates: WhatsAppTemplateDTO[]
  serverNow: string
}

export interface WhatsAppContextDTO {
  accounts: WhatsAppAccountDTO[]
  candidates: WhatsAppCandidateDTO[]
  conversations: WhatsAppConversationDTO[]
  canManage: boolean
  firstContactTemplate: WhatsAppTemplateDTO | null
}

export interface WhatsAppInboxConversationDTO {
  id: string
  accountId: string
  contactId: string
  leadId: string | null
  campaignLeadId: string | null
  prospectingContactId: string | null
  assignedTo: string | null
  assignedName?: string | null
  status: WhatsAppConversationStatus
  lastInboundAt: string | null
  lastOutboundAt: string | null
  lastMessageAt: string | null
  customerWindowExpiresAt: string | null
  inboundSeq: number
  readSeq: number
  unreadCount: number
  phoneE164: string
  optInStatus: WhatsAppOptInStatus
  contactName: string
  companyName?: string | null
  city?: string | null
  state?: string | null
  website?: string | null
  email?: string | null
  pipelineStage?: string | null
  /** Historical value retained for integrations. */
  score?: number | null
  classification?: LeadClassification | null
  opportunityType?: string | null
  campaignName?: string | null
  qualificationStatus?: string | null
  lastMessageSnippet?: string | null
  lastMessageType?: WhatsAppMessageType | null
  lastMessageStatus?: WhatsAppMessageStatus | null
  lastMessageDirection?: 'inbound' | 'outbound' | null
  isWindowOpen: boolean
}

export interface WhatsAppStandaloneConversationResultDTO {
  contactId: string
  conversationId: string
  phoneE164: string
  displayName: string
  reusedContact: boolean
  reusedConversation: boolean
}

export type WhatsAppActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: string }
