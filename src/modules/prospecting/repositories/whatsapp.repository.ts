import { SupabaseClient } from '@supabase/supabase-js'
import {
  WhatsAppAccountDTO,
  WhatsAppCandidateDTO,
  WhatsAppContextDTO,
  WhatsAppConversationDTO,
  WhatsAppConversationPageDTO,
  WhatsAppCursor,
  WhatsAppMessageDTO,
  WhatsAppSummaryDTO,
  WhatsAppTemplateDTO,
  WhatsAppAssigneeDTO,
  WhatsAppMessageType,
  WhatsAppConversationStatus,
  WhatsAppOptInStatus,
  WhatsAppMessageStatus,
  WhatsAppSendState,
  WhatsAppTemplateComponent,
  WhatsAppInboxConversationDTO,
  WhatsAppStandaloneConversationResultDTO,
} from '../types/whatsapp'
import { checkCustomerWindow } from '../services/whatsapp-policy'
import { formatPhoneDisplay, normalizeToE164 } from '../services/whatsapp-phone'
import { isSupportedFirstContactTemplate } from '../services/whatsapp-template-policy'

interface ConversationDbRow {
  id: string
  account_id: string
  contact_id: string
  lead_id: string | null
  campaign_lead_id: string | null
  prospecting_contact_id: string | null
  assigned_to: string | null
  status: WhatsAppConversationStatus
  last_inbound_at: string | null
  last_outbound_at: string | null
  last_message_at: string | null
  customer_window_expires_at: string | null
  inbound_seq: number | null
  read_seq: number | null
  unread_count: number | null
  last_read_at: string | null
  closed_at: string | null
  contact?: { id?: string; phone_e164?: string; display_name?: string | null; opt_in_status?: WhatsAppOptInStatus } | Array<{ id?: string; phone_e164?: string; display_name?: string | null; opt_in_status?: WhatsAppOptInStatus }> | null
  last_message?: { id?: string; status?: WhatsAppMessageStatus; type?: WhatsAppMessageType; send_state?: WhatsAppSendState; occurred_at?: string } | Array<{ id?: string; status?: WhatsAppMessageStatus; type?: WhatsAppMessageType; send_state?: WhatsAppSendState; occurred_at?: string }> | null
}

interface AssigneeRpcRow {
  user_id?: string
  id?: string
  full_name?: string | null
}

export class WhatsAppRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Loads context for a lead: available accounts, candidate numbers, and conversations (§7.1).
   */
  async getContext(
    campaignLeadId: string,
    canManage: boolean
  ): Promise<WhatsAppContextDTO> {
    // 1. Fetch enabled accounts
    const { data: accountsData, error: accountsErr } = await this.supabase
      .from('whatsapp_accounts')
      .select('id, display_phone_number, label, enabled, connection_status')
      .eq('enabled', true)

    if (accountsErr) throw accountsErr

    const accounts: WhatsAppAccountDTO[] = (accountsData || []).map((a) => ({
      id: a.id,
      displayPhoneNumber: a.display_phone_number,
      label: a.label,
      enabled: a.enabled,
      connectionStatus: a.connection_status,
    }))

    // 2. Fetch campaign lead and candidate phone numbers
    const { data: campLead, error: leadErr } = await this.supabase
      .from('prospecting_campaign_leads')
      .select('id, lead_id')
      .eq('id', campaignLeadId)
      .single()

    if (leadErr) throw leadErr

    const candidates: WhatsAppCandidateDTO[] = []

    if (campLead?.lead_id) {
      // Enrichment stores Places and audited WhatsApp numbers here. The
      // first-contact RPC requires a matching row in this same table.
      const { data: contactsData, error: contactsErr } = await this.supabase
        .from('prospecting_contacts')
        .select('id, value, channel')
        .eq('lead_id', campLead.lead_id)
        .in('channel', ['phone', 'whatsapp'])

      if (contactsErr) throw contactsErr

      // Prefer a number explicitly found as WhatsApp if the same number was
      // also discovered by Places as a generic phone.
      for (const c of [...(contactsData || [])].sort((a, b) =>
        Number(b.channel === 'whatsapp') - Number(a.channel === 'whatsapp')
      )) {
        const e164 = normalizeToE164(c.value)
        if (e164 && !candidates.some((cand) => cand.phoneE164 === e164)) {
          candidates.push({
            prospectingContactId: c.id,
            phoneE164: e164,
            displayPhone: formatPhoneDisplay(e164),
            source: c.channel,
          })
        }
      }
    }

    // 3. Fetch conversations linked to this campaign_lead_id
    const { data: convsData, error: convsErr } = await this.supabase
      .from('whatsapp_conversations')
      .select(`
        id, account_id, contact_id, lead_id, campaign_lead_id, prospecting_contact_id,
        assigned_to, status, last_inbound_at, last_outbound_at, customer_window_expires_at,
        inbound_seq, read_seq, unread_count, last_read_at, closed_at,
        contact:whatsapp_contacts(phone_e164, opt_in_status)
      `)
      .eq('campaign_lead_id', campaignLeadId)

    if (convsErr) throw convsErr

    const now = new Date()
    const rawData = (convsData || []) as unknown as ConversationDbRow[]
    const conversations: WhatsAppConversationDTO[] = rawData.map((c) => {
      const contact = Array.isArray(c.contact) ? c.contact[0] : c.contact
      const { isOpen } = checkCustomerWindow(c.last_inbound_at, now)
      return {
        id: c.id,
        accountId: c.account_id,
        contactId: c.contact_id,
        leadId: c.lead_id,
        campaignLeadId: c.campaign_lead_id,
        prospectingContactId: c.prospecting_contact_id,
        assignedTo: c.assigned_to,
        status: c.status,
        lastInboundAt: c.last_inbound_at,
        lastOutboundAt: c.last_outbound_at,
        customerWindowExpiresAt: c.customer_window_expires_at,
        inboundSeq: Number(c.inbound_seq || 0),
        readSeq: Number(c.read_seq || 0),
        unreadCount: Math.max(0, Number(c.unread_count || 0)),
        lastReadAt: c.last_read_at,
        closedAt: c.closed_at,
        phoneE164: contact?.phone_e164 || '',
        optInStatus: contact?.opt_in_status || 'unknown',
        isWindowOpen: isOpen,
      }
    })

    const firstContactAccount = accounts.find((account) => account.connectionStatus !== 'disabled')
    const firstContactTemplate = firstContactAccount
      ? (await this.listTemplates(firstContactAccount.id)).find((template) =>
          template.name === 'primeiro_contato_anxis' &&
          template.language === 'pt_BR' &&
          template.supported &&
          isSupportedFirstContactTemplate(template as unknown as Parameters<typeof isSupportedFirstContactTemplate>[0])
        ) || null
      : null

    return {
      accounts,
      candidates,
      conversations,
      canManage,
      firstContactTemplate,
    }
  }

  /**
   * Loads full conversation page: conversation, contact, lead, last 50 messages, and templates.
   */
  async getConversation(conversationId: string): Promise<WhatsAppConversationPageDTO> {
    const { data: convData, error: convErr } = await this.supabase
      .from('whatsapp_conversations')
      .select(`
        id, account_id, contact_id, lead_id, campaign_lead_id, prospecting_contact_id,
        assigned_to, status, last_inbound_at, last_outbound_at, customer_window_expires_at,
        inbound_seq, read_seq, unread_count, last_read_at, closed_at,
        contact:whatsapp_contacts(id, phone_e164, display_name, opt_in_status, capability)
      `)
      .eq('id', conversationId)
      .single()

    if (convErr) throw convErr
    if (!convData) throw new Error('Conversa não encontrada')

    const contactRaw = Array.isArray(convData.contact) ? convData.contact[0] : convData.contact
    const now = new Date()
    const { isOpen } = checkCustomerWindow(convData.last_inbound_at, now)

    const conversation: WhatsAppConversationDTO = {
      id: convData.id,
      accountId: convData.account_id,
      contactId: convData.contact_id,
      leadId: convData.lead_id,
      campaignLeadId: convData.campaign_lead_id,
      prospectingContactId: convData.prospecting_contact_id,
      assignedTo: convData.assigned_to,
      status: convData.status,
      lastInboundAt: convData.last_inbound_at,
      lastOutboundAt: convData.last_outbound_at,
      customerWindowExpiresAt: convData.customer_window_expires_at,
      inboundSeq: Number(convData.inbound_seq || 0),
      readSeq: Number(convData.read_seq || 0),
      unreadCount: Math.max(0, Number(convData.unread_count || 0)),
      lastReadAt: convData.last_read_at,
      closedAt: convData.closed_at,
      phoneE164: contactRaw?.phone_e164 || '',
      optInStatus: contactRaw?.opt_in_status || 'unknown',
      isWindowOpen: isOpen,
    }

    // Fetch lead details
    let lead: WhatsAppConversationPageDTO['lead'] = null
    if (convData.lead_id) {
      const { data: lData } = await this.supabase
        .from('prospecting_leads')
        .select('id, name, company_name, city, state')
        .eq('id', convData.lead_id)
        .single()

      if (lData) {
        lead = {
          id: lData.id,
          name: lData.name,
          companyName: lData.company_name || undefined,
          city: lData.city || undefined,
          state: lData.state || undefined,
        }
      }
    }

    if (convData.campaign_lead_id) {
      const { data: clData } = await this.supabase
        .from('prospecting_campaign_leads')
        .select('pipeline_stage, current_score, classification')
        .eq('id', convData.campaign_lead_id)
        .single()

      if (clData && lead) {
        lead.stage = clData.pipeline_stage
        lead.score = clData.current_score ?? undefined
        lead.classification = clData.classification ?? undefined
      }
    }

    // Fetch messages (first page of 50)
    const { messages, nextCursor } = await this.listMessages(conversationId, null, 50)

    // Fetch supported templates for account
    const templates = await this.listTemplates(convData.account_id)

    return {
      conversation,
      contact: {
        id: contactRaw?.id || convData.contact_id,
        phoneE164: contactRaw?.phone_e164 || '',
        displayName: contactRaw?.display_name || null,
        optInStatus: contactRaw?.opt_in_status || 'unknown',
        capability: contactRaw?.capability || 'unknown',
      },
      lead,
      messages,
      nextCursor,
      templates,
      serverNow: now.toISOString(),
    }
  }

  /**
   * Keyset pagination for messages in chronological order (§7.1).
   */
  async listMessages(
    conversationId: string,
    cursor?: WhatsAppCursor | null,
    limit = 50
  ): Promise<{ messages: WhatsAppMessageDTO[]; nextCursor: WhatsAppCursor | null }> {
    let query = this.supabase
      .from('whatsapp_messages')
      .select(`
        id, conversation_id, direction, type, body, content, template_id,
        wamid, status, send_state, inbound_seq, sent_by_name, occurred_at,
        accepted_at, sent_at, delivered_at, read_at, failed_at, error_code,
        error_message, uncertainty_acknowledged_at
      `)
      .eq('conversation_id', conversationId)
      .order('occurred_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1)

    if (cursor) {
      query = query.or(
        `occurred_at.lt.${cursor.occurredAt},and(occurred_at.eq.${cursor.occurredAt},id.lt.${cursor.id})`
      )
    }

    const { data, error } = await query
    if (error) throw error

    const rows = data || []
    const hasMore = rows.length > limit
    const pageRows = hasMore ? rows.slice(0, limit) : rows

    let nextCursor: WhatsAppCursor | null = null
    if (hasMore && pageRows.length > 0) {
      const last = pageRows[pageRows.length - 1]
      nextCursor = {
        occurredAt: last.occurred_at,
        id: last.id,
      }
    }

    const messages: WhatsAppMessageDTO[] = pageRows.map((m) => ({
      id: m.id,
      conversationId: m.conversation_id,
      direction: m.direction,
      type: m.type,
      body: m.body,
      content: (m.content as Record<string, unknown>) || {},
      templateId: m.template_id,
      wamid: m.wamid,
      status: m.status,
      sendState: m.send_state,
      inboundSeq: m.inbound_seq,
      sentByName: m.sent_by_name,
      occurredAt: m.occurred_at,
      acceptedAt: m.accepted_at,
      sentAt: m.sent_at,
      deliveredAt: m.delivered_at,
      readAt: m.read_at,
      failedAt: m.failed_at,
      errorCode: m.error_code,
      errorMessage: m.error_message,
      uncertaintyAcknowledgedAt: m.uncertainty_acknowledged_at,
      isUncertain: m.send_state === 'uncertain' && !m.uncertainty_acknowledged_at,
    }))

    return { messages, nextCursor }
  }

  /**
   * Batch summaries query for visible leads without N+1 (§12).
   */
  async listSummaries(
    campaignLeadIds: string[]
  ): Promise<Record<string, WhatsAppSummaryDTO>> {
    const result: Record<string, WhatsAppSummaryDTO> = {}
    if (!campaignLeadIds || campaignLeadIds.length === 0) return result

    // Initialize all as default empty summary
    for (const id of campaignLeadIds) {
      result[id] = {
        campaignLeadId: id,
        commercialStatus: 'new',
        hasCandidate: false,
        unreadCount: 0,
        optInStatus: 'unknown',
        isWindowOpen: false,
        hasConversation: false,
      }
    }

    // Match the contact source used by getContext and the first-contact RPC.
    // A valid phone is a sendable candidate, not proof of a WhatsApp account.
    const { data: campaignLeads, error: leadsError } = await this.supabase
      .from('prospecting_campaign_leads')
      .select('id, lead_id')
      .in('id', campaignLeadIds)

    if (leadsError) throw leadsError

    const leadIds = [...new Set((campaignLeads || []).map((lead) => lead.lead_id).filter(Boolean))]
    if (leadIds.length > 0) {
      const { data: contacts, error: contactsError } = await this.supabase
        .from('prospecting_contacts')
        .select('lead_id, value')
        .in('lead_id', leadIds)
        .in('channel', ['phone', 'whatsapp'])

      if (contactsError) throw contactsError

      const leadsWithCandidates = new Set(
        (contacts || [])
          .filter((contact) => normalizeToE164(contact.value) !== null)
          .map((contact) => contact.lead_id)
      )
      for (const lead of campaignLeads || []) {
        if (result[lead.id]) result[lead.id].hasCandidate = leadsWithCandidates.has(lead.lead_id)
      }
    }

   const { data: convs, error } = await this.supabase
  .from('whatsapp_conversations')
  .select(`
    id, account_id, campaign_lead_id, unread_count, last_inbound_at, last_outbound_at, last_message_at,
    account:whatsapp_accounts!inner(enabled, connection_status),
    contact:whatsapp_contacts(id, phone_e164, opt_in_status),
    last_message:whatsapp_messages!whatsapp_last_message_fk(status, type)
  `)
  .in('campaign_lead_id', campaignLeadIds)
  .eq('account.enabled', true)
  .neq('account.connection_status', 'disabled')
  .order('last_message_at', { ascending: false, nullsFirst: false })

    if (error) throw error

    const now = new Date()
    if (convs) {
      for (const c of (convs as unknown as ConversationDbRow[])) {
        const leadId = c.campaign_lead_id
        if (!leadId || !result[leadId]) continue

        // These timestamps represent received messages and provider-confirmed
        // sent/delivered/read events. Queued, accepted and failed attempts alone
        // must not mark a lead as contacted. Preserve evidence across all its
        // conversations even when a newer conversation is still empty.
        const summary = result[leadId]
        if (c.last_inbound_at) summary.commercialStatus = 'replied'
        else if (c.last_outbound_at && summary.commercialStatus === 'new') {
          summary.commercialStatus = 'contacted'
        }

        if (summary.hasConversation) continue

        const contact = Array.isArray(c.contact) ? c.contact[0] : c.contact
        const lastMsg = Array.isArray(c.last_message) ? c.last_message[0] : c.last_message
        const { isOpen } = checkCustomerWindow(c.last_inbound_at, now)

        result[leadId] = {
          campaignLeadId: leadId,
          commercialStatus: summary.commercialStatus,
          hasCandidate: result[leadId].hasCandidate,
          conversationId: c.id,
          contactId: contact?.id,
          phoneE164: contact?.phone_e164,
          unreadCount: Math.max(0, Number(c.unread_count || 0)),
          lastMessageStatus: lastMsg?.status,
          lastMessageAt: c.last_message_at || undefined,
          lastMessageType: lastMsg?.type,
          optInStatus: contact?.opt_in_status || 'unknown',
          isWindowOpen: isOpen,
          hasConversation: true,
        }
      }
    }

    return result
  }

  /**
   * Loads up to 25 unlinked conversations (§7.1).
   */
  async listUnlinked(limit = 25): Promise<WhatsAppConversationDTO[]> {
    const { data, error } = await this.supabase
      .from('whatsapp_conversations')
      .select(`
        id, account_id, contact_id, lead_id, campaign_lead_id, prospecting_contact_id,
        assigned_to, status, last_inbound_at, last_outbound_at, customer_window_expires_at,
        inbound_seq, read_seq, unread_count, last_read_at, closed_at,
        contact:whatsapp_contacts(phone_e164, opt_in_status)
      `)
      .is('campaign_lead_id', null)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error) throw error

    const now = new Date()
    const rawData = (data || []) as unknown as ConversationDbRow[]
    return rawData.map((c) => {
      const contact = Array.isArray(c.contact) ? c.contact[0] : c.contact
      const { isOpen } = checkCustomerWindow(c.last_inbound_at, now)
      return {
        id: c.id,
        accountId: c.account_id,
        contactId: c.contact_id,
        leadId: c.lead_id,
        campaignLeadId: c.campaign_lead_id,
        prospectingContactId: c.prospecting_contact_id,
        assignedTo: c.assigned_to,
        status: c.status,
        lastInboundAt: c.last_inbound_at,
        lastOutboundAt: c.last_outbound_at,
        customerWindowExpiresAt: c.customer_window_expires_at,
        inboundSeq: Number(c.inbound_seq || 0),
        readSeq: Number(c.read_seq || 0),
        unreadCount: Math.max(0, Number(c.unread_count || 0)),
        lastReadAt: c.last_read_at,
        closedAt: c.closed_at,
        phoneE164: contact?.phone_e164 || '',
        optInStatus: contact?.opt_in_status || 'unknown',
        isWindowOpen: isOpen,
      }
    })
  }

  /**
   * Loads conversations for the Commercial > Conversations Inbox.
   * Joins contact phone and opt-in, last message snippet and metadata,
   * associated lead details (name, company, location) and pipeline stages.
   */
  async listInboxConversations(): Promise<WhatsAppInboxConversationDTO[]> {
    const { data, error } = await this.supabase
      .from('whatsapp_conversations')
      .select(`
        id, account_id, contact_id, lead_id, campaign_lead_id, prospecting_contact_id,
        assigned_to, status, last_inbound_at, last_outbound_at, last_message_at,
        customer_window_expires_at, inbound_seq, read_seq, unread_count,
        contact:whatsapp_contacts(phone_e164, display_name, opt_in_status),
        last_message:whatsapp_messages!whatsapp_last_message_fk(id, body, type, status, direction, occurred_at)
      `)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    if (error) throw error
    if (!data) return []

    interface RawInboxConversation {
      id: string
      account_id: string
      contact_id: string
      lead_id: string | null
      campaign_lead_id: string | null
      prospecting_contact_id: string | null
      assigned_to: string | null
      status: WhatsAppConversationStatus
      last_inbound_at: string | null
      last_outbound_at: string | null
      last_message_at: string | null
      customer_window_expires_at: string | null
      inbound_seq: number
      read_seq: number
      unread_count: number
      contact?: { phone_e164?: string; display_name?: string | null; opt_in_status?: WhatsAppOptInStatus } | { phone_e164?: string; display_name?: string | null; opt_in_status?: WhatsAppOptInStatus }[] | null
      last_message?: {
        id: string
        body: string | null
        type: WhatsAppMessageType | null
        status: WhatsAppMessageStatus | null
        direction: 'inbound' | 'outbound' | null
        occurred_at: string
      } | {
        id: string
        body: string | null
        type: WhatsAppMessageType | null
        status: WhatsAppMessageStatus | null
        direction: 'inbound' | 'outbound' | null
        occurred_at: string
      }[] | null
    }

    const convs = data as unknown as RawInboxConversation[]
    const directLeadIds = convs.map((c) => c.lead_id).filter(Boolean) as string[]
    const campaignLeadIds = Array.from(new Set(convs.map((c) => c.campaign_lead_id).filter(Boolean))) as string[]
    const assigneeIds = Array.from(new Set(convs.map((c) => c.assigned_to).filter(Boolean))) as string[]

    const leadsMap: Record<string, { name: string; companyName?: string; city?: string; state?: string; website?: string; email?: string }> = {}
    const campLeadsMap: Record<
      string,
      {
        stage?: string
        score?: number
        classification?: import('../types/index.ts').LeadClassification
        opportunityType?: string
        leadId?: string
        campaignId?: string
        campaignName?: string
        qualificationStatus?: string
        companyName?: string
        city?: string
        state?: string
        website?: string
        email?: string
      }
    > = {}
    const assigneesMap: Record<string, string> = {}

    // 1. Load campaign leads first to find linked campaigns and missing lead IDs
    const campaignLeadsLeadIds: string[] = []
    if (campaignLeadIds.length > 0) {
      const { data: clData } = await this.supabase
        .from('prospecting_campaign_leads')
        .select('id, campaign_id, lead_id, pipeline_stage, current_score, classification, opportunity_type, qualification_status, business')
        .in('id', campaignLeadIds)

      if (clData) {
        const campaignIds = Array.from(new Set(clData.map((cl) => cl.campaign_id).filter(Boolean))) as string[]
        const campaignNamesMap: Record<string, string> = {}

        if (campaignIds.length > 0) {
          const { data: campData } = await this.supabase
            .from('prospecting_campaigns')
            .select('id, name, segment')
            .in('id', campaignIds)

          if (campData) {
            for (const camp of campData) {
              campaignNamesMap[camp.id] = camp.name || camp.segment || 'Campanha'
            }
          }
        }

        for (const cl of clData) {
          if (cl.lead_id) campaignLeadsLeadIds.push(cl.lead_id)
          const bus = (cl.business || {}) as Record<string, unknown>
          campLeadsMap[cl.id] = {
            stage: cl.pipeline_stage,
            score: cl.current_score ?? undefined,
            classification: cl.classification ?? undefined,
            opportunityType: cl.opportunity_type ?? undefined,
            leadId: cl.lead_id || undefined,
            campaignId: cl.campaign_id || undefined,
            campaignName: cl.campaign_id ? campaignNamesMap[cl.campaign_id] : undefined,
            qualificationStatus: cl.qualification_status || undefined,
            companyName: typeof bus.name === 'string' ? bus.name : undefined,
            city: typeof bus.city === 'string' ? bus.city : undefined,
            state: typeof bus.state === 'string' ? bus.state : undefined,
            website: typeof bus.website === 'string' ? bus.website : undefined,
            email: typeof bus.email === 'string' ? bus.email : undefined,
          }
        }
      }
    }

    // 2. Load all lead entities (from direct lead_id or via campaign_lead_id)
    const allLeadIds = Array.from(new Set([...directLeadIds, ...campaignLeadsLeadIds]))
    if (allLeadIds.length > 0) {
      const { data: lData } = await this.supabase
        .from('prospecting_leads')
        .select('id, name, business')
        .in('id', allLeadIds)

      if (lData) {
        for (const l of lData) {
          const bus = (l.business || {}) as Record<string, unknown>
          leadsMap[l.id] = {
            name: l.name,
            companyName: typeof bus.name === 'string' ? bus.name : undefined,
            city: typeof bus.city === 'string' ? bus.city : undefined,
            state: typeof bus.state === 'string' ? bus.state : undefined,
            website: typeof bus.website === 'string' ? bus.website : undefined,
            email: typeof bus.email === 'string' ? bus.email : undefined,
          }
        }
      }
    }

    if (assigneeIds.length > 0) {
      const { data: pData } = await this.supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', assigneeIds)

      if (pData) {
        for (const p of pData) {
          if (p.user_id) assigneesMap[p.user_id] = p.full_name || 'Usuário'
        }
      }
    }

    const now = new Date()
    return convs.map((c) => {
      const contact = Array.isArray(c.contact) ? c.contact[0] : c.contact
      const lastMsg = Array.isArray(c.last_message) ? c.last_message[0] : c.last_message
      const campLead = c.campaign_lead_id ? campLeadsMap[c.campaign_lead_id] : undefined
      const resolvedLeadId = c.lead_id || campLead?.leadId
      const lead = resolvedLeadId ? leadsMap[resolvedLeadId] : undefined
      const { isOpen } = checkCustomerWindow(c.last_inbound_at, now)
      const phone = contact?.phone_e164 || ''

      return {
        id: c.id,
        accountId: c.account_id,
        contactId: c.contact_id,
        leadId: resolvedLeadId || null,
        campaignLeadId: c.campaign_lead_id,
        prospectingContactId: c.prospecting_contact_id,
        assignedTo: c.assigned_to,
        assignedName: c.assigned_to ? assigneesMap[c.assigned_to] || null : null,
        status: c.status,
        lastInboundAt: c.last_inbound_at,
        lastOutboundAt: c.last_outbound_at,
        lastMessageAt: c.last_message_at,
        customerWindowExpiresAt: c.customer_window_expires_at,
        inboundSeq: Number(c.inbound_seq || 0),
        readSeq: Number(c.read_seq || 0),
        unreadCount: Math.max(0, Number(c.unread_count || 0)),
        phoneE164: phone,
        optInStatus: contact?.opt_in_status || 'unknown',
        contactName: contact?.display_name || lead?.name || formatPhoneDisplay(phone) || 'Contato WhatsApp',
        companyName: lead?.companyName || campLead?.companyName || null,
        city: lead?.city || campLead?.city || null,
        state: lead?.state || campLead?.state || null,
        website: lead?.website || campLead?.website || null,
        email: lead?.email || campLead?.email || null,
        pipelineStage: campLead?.stage || null,
        score: campLead?.score ?? null,
        classification: campLead?.classification ?? null,
        opportunityType: campLead?.opportunityType ?? null,
        campaignName: campLead?.campaignName || null,
        qualificationStatus: campLead?.qualificationStatus || null,
        lastMessageSnippet: lastMsg?.body || (lastMsg?.type === 'template' ? '[Template]' : null),
        lastMessageType: lastMsg?.type || null,
        lastMessageStatus: lastMsg?.status || null,
        lastMessageDirection: lastMsg?.direction || null,
        isWindowOpen: isOpen,
      }
    })
  }

  /**
   * Loads supported approved templates for an account.
   */
  async listTemplates(accountId: string): Promise<WhatsAppTemplateDTO[]> {
    const { data, error } = await this.supabase
      .from('whatsapp_templates')
      .select('id, name, language, category, status, components, supported')
      .eq('account_id', accountId)
      .or('supported.eq.true,name.eq.primeiro_contato_anxis')
      .eq('status', 'APPROVED')
      .neq('name', 'hello_world')
      .order('name', { ascending: true })

    if (error) throw error

    return (data || []).filter((template) => template.supported || isSupportedFirstContactTemplate(template)).map((t) => ({
      id: t.id,
      name: t.name,
      language: t.language,
      category: t.category,
      status: t.status,
      components: Array.isArray(t.components) ? (t.components as WhatsAppTemplateComponent[]) : [],
      supported: t.supported,
    }))
  }

  // --- Commands (RPC wrappers) ---

  async createStandaloneConversation(params: {
    name: string
    phoneE164: string
    requestId: string
  }): Promise<WhatsAppStandaloneConversationResultDTO> {
    const { data, error } = await this.supabase.rpc('whatsapp_create_standalone_conversation', {
      p_display_name: params.name,
      p_phone_e164: params.phoneE164,
      p_request_id: params.requestId,
    })
    if (error) throw error

    const result = data as {
      contactId: string
      conversationId: string
      phoneE164: string
      displayName: string
      reusedContact: boolean
      reusedConversation: boolean
    }

    return result
  }

  async openConversation(params: {
    campaignLeadId?: string | null
    phoneE164: string
    prospectingContactId?: string | null
    requestId: string
  }): Promise<string> {
    const { data, error } = await this.supabase.rpc('whatsapp_open_conversation', {
      p_campaign_lead_id: params.campaignLeadId ?? null,
      p_phone_e164: params.phoneE164,
      p_prospecting_contact_id: params.prospectingContactId ?? null,
      p_request_id: params.requestId,
    })
    if (error) throw error
    return data as string
  }

  async sendFirstContact(params: {
    campaignLeadId: string
    phoneE164: string
    prospectingContactId?: string | null
    requestId: string
  }): Promise<{
    conversationId: string
    messageId: string
    status: WhatsAppMessageStatus
    sendState: WhatsAppSendState
  }> {
    const { data, error } = await this.supabase.rpc('whatsapp_send_first_contact', {
      p_campaign_lead_id: params.campaignLeadId,
      p_phone_e164: params.phoneE164,
      p_prospecting_contact_id: params.prospectingContactId ?? null,
      p_request_id: params.requestId,
    })
    if (error) throw error
    return data as {
      conversationId: string
      messageId: string
      status: WhatsAppMessageStatus
      sendState: WhatsAppSendState
    }
  }

  async enqueueMessage(params: {
    conversationId: string
    requestId: string
    type: WhatsAppMessageType
    body?: string | null
    templateId?: string | null
    parameters?: Record<string, unknown> | null
    replyToId?: string | null
  }): Promise<{ messageId: string; status: WhatsAppMessageStatus; sendState: WhatsAppSendState }> {
    if (params.type === 'template' && params.templateId) {
      // Resolve the persisted template in the conversation's account. The browser
      // cannot supply the first-contact recipient, consultant name or parameters.
      const { data: conversation, error: conversationError } = await this.supabase
        .from('whatsapp_conversations')
        .select('account_id')
        .eq('id', params.conversationId)
        .single()
      if (conversationError) throw conversationError
      if (!conversation) throw new Error('CONVERSATION_NOT_FOUND')

      const { data: template, error: templateError } = await this.supabase
        .from('whatsapp_templates')
        .select('name')
        .eq('id', params.templateId)
        .eq('account_id', conversation.account_id)
        .single()
      if (templateError) throw templateError
      if (!template) throw new Error('TEMPLATE_NOT_FOUND')

      if (template.name === 'primeiro_contato_anxis') {
        const { data, error } = await this.supabase.rpc('whatsapp_send_first_contact_in_conversation', {
          p_conversation_id: params.conversationId,
          p_request_id: params.requestId,
        })
        if (error) throw error
        return data as { messageId: string; status: WhatsAppMessageStatus; sendState: WhatsAppSendState }
      }
    }

    const { data, error } = await this.supabase.rpc('whatsapp_enqueue_message', {
      p_conversation_id: params.conversationId,
      p_request_id: params.requestId,
      p_type: params.type,
      p_body: params.body ?? null,
      p_template_id: params.templateId ?? null,
      p_parameters: params.parameters ?? null,
      p_reply_to_id: params.replyToId ?? null,
    })
    if (error) throw error
    return data as { messageId: string; status: WhatsAppMessageStatus; sendState: WhatsAppSendState }
  }

  async markRead(conversationId: string, upToSeq: number): Promise<void> {
    const { error } = await this.supabase.rpc('whatsapp_mark_read', {
      p_conversation_id: conversationId,
      p_up_to_seq: upToSeq,
    })
    if (error) throw error
  }

  async assign(conversationId: string, assignedTo: string | null, requestId: string): Promise<void> {
    const { error } = await this.supabase.rpc('whatsapp_assign', {
      p_conversation_id: conversationId,
      p_assigned_to: assignedTo,
      p_request_id: requestId,
    })
    if (error) throw error
  }

  async commercialAction(
    conversationId: string,
    action: string,
    requestId: string,
    data: Record<string, unknown> = {}
  ): Promise<void> {
    const { error } = await this.supabase.rpc('whatsapp_commercial_action', {
      p_conversation_id: conversationId,
      p_action: action,
      p_request_id: requestId,
      p_data: data,
    })
    if (error) throw error
  }

  async setConversationClosed(
    conversationId: string,
    closed: boolean,
    requestId: string
  ): Promise<void> {
    const { error } = await this.supabase.rpc('whatsapp_set_conversation_closed', {
      p_conversation_id: conversationId,
      p_closed: closed,
      p_request_id: requestId,
    })
    if (error) throw error
  }

  async recordConsent(params: {
    contactId: string
    status: 'granted' | 'revoked'
    source: string
    proof: Record<string, unknown>
    occurredAt: string
    requestId: string
  }): Promise<void> {
    const { error } = await this.supabase.rpc('whatsapp_record_consent', {
      p_contact_id: params.contactId,
      p_status: params.status,
      p_source: params.source,
      p_proof: params.proof,
      p_occurred_at: params.occurredAt,
      p_request_id: params.requestId,
    })
    if (error) throw error
  }

  async linkConversation(
    conversationId: string,
    campaignLeadId: string,
    prospectingContactId: string | null,
    requestId: string
  ): Promise<void> {
    const { error } = await this.supabase.rpc('whatsapp_link_conversation', {
      p_conversation_id: conversationId,
      p_campaign_lead_id: campaignLeadId,
      p_prospecting_contact_id: prospectingContactId,
      p_request_id: requestId,
    })
    if (error) throw error
  }

  async unlinkConversation(conversationId: string, reason: string, requestId: string): Promise<void> {
    const { error } = await this.supabase.rpc('whatsapp_unlink_conversation', {
      p_conversation_id: conversationId,
      p_reason: reason,
      p_request_id: requestId,
    })
    if (error) throw error
  }

  async listAssignees(): Promise<WhatsAppAssigneeDTO[]> {
    const { data, error } = await this.supabase.rpc('whatsapp_list_assignees')
    if (error) throw error
    return (data || []).map((row: AssigneeRpcRow) => ({
      id: row.user_id || row.id || '',
      fullName: row.full_name || 'Atendente',
    }))
  }

  async requestTemplateSync(): Promise<void> {
    const { error } = await this.supabase.rpc('whatsapp_request_template_sync')
    if (error) throw error
  }
}
