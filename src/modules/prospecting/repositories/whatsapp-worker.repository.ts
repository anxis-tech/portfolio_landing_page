import { SupabaseClient } from '@supabase/supabase-js'
import { WhatsAppAccount } from '../types/whatsapp'

export interface WhatsAppMessageForDispatch {
  id: string
  account_id: string
  conversation_id: string
  direction: string
  type: string
  body: string | null
  content: Record<string, unknown> | null
  template_id: string | null
  reply_to_wamid: string | null
  conversation: {
    contact: {
      phone_e164: string
    }
  }
  template?: {
    name: string
    language: string
    components: Record<string, unknown>[]
    status: string
    supported: boolean
    synced_at: string | null
  } | null
  account: {
    phone_number_id: string
    enabled: boolean
    connection_status: string
  }
}

export class WhatsAppWorkerRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async claimInbox(
    workerId: string,
    limit = 10
  ): Promise<Array<{ id: string; payload_sha256: string; payload: Record<string, unknown>; attempts: number }>> {
    const { data, error } = await this.supabase.rpc('whatsapp_claim_inbox', {
      p_worker: workerId,
      p_limit: limit,
    })
    if (error) throw error
    return data || []
  }

  async processInbound(
    webhookId: string,
    workerId: string,
    unit: Record<string, unknown>
  ): Promise<void> {
    const { error } = await this.supabase.rpc('whatsapp_process_inbound', {
      p_webhook_id: webhookId,
      p_worker: workerId,
      p_unit: unit,
    })
    if (error) throw error
  }

  async processStatus(
    webhookId: string,
    workerId: string,
    unit: Record<string, unknown>
  ): Promise<void> {
    const { error } = await this.supabase.rpc('whatsapp_process_status', {
      p_webhook_id: webhookId,
      p_worker: workerId,
      p_unit: unit,
    })
    if (error) throw error
  }

  async finishInbox(
    webhookId: string,
    workerId: string,
    errorCode: string | null = null
  ): Promise<void> {
    const { error } = await this.supabase.rpc('whatsapp_finish_inbox', {
      p_id: webhookId,
      p_worker: workerId,
      p_error_code: errorCode,
    })
    if (error) throw error
  }

  async claimOutbound(
    workerId: string,
    limit = 5
  ): Promise<Array<{ id: string; conversation_id: string; account_id: string }>> {
    const { data, error } = await this.supabase.rpc('whatsapp_claim_outbound', {
      p_worker: workerId,
      p_limit: limit,
    })
    if (error) throw error
    return data || []
  }

  async prepareDispatch(
    messageId: string,
    workerId: string
  ): Promise<{ eligible: boolean; code?: string }> {
    const { data, error } = await this.supabase.rpc('whatsapp_prepare_dispatch', {
      p_message_id: messageId,
      p_worker: workerId,
    })
    if (error) throw error
    return data as { eligible: boolean; code?: string }
  }

  async finishOutbound(
    messageId: string,
    workerId: string,
    result: Record<string, unknown>
  ): Promise<void> {
    const { error } = await this.supabase.rpc('whatsapp_finish_outbound', {
      p_message_id: messageId,
      p_worker: workerId,
      p_result: result,
    })
    if (error) throw error
  }

  async recoverLeases(): Promise<void> {
    const { error } = await this.supabase.rpc('whatsapp_recover_leases')
    if (error) throw error
  }

  async syncTemplates(
    accountId: string,
    templates: Array<Record<string, unknown>>
  ): Promise<void> {
    const { error } = await this.supabase.rpc('whatsapp_sync_templates', {
      p_account_id: accountId,
      p_templates: templates,
    })
    if (error) throw error
  }

  async reconcileEvents(): Promise<number> {
    const { data, error } = await this.supabase.rpc('whatsapp_reconcile_events')
    if (error) throw error
    return Number(data || 0)
  }

  async purgeWebhookPayloads(): Promise<void> {
    const { error } = await this.supabase.rpc('whatsapp_purge_webhook_payloads')
    if (error) throw error
  }

  async getMessageForDispatch(messageId: string): Promise<WhatsAppMessageForDispatch | null> {
    const { data, error } = await this.supabase
      .from('whatsapp_messages')
      .select(`
        id, account_id, conversation_id, direction, type, body, content, template_id,
        reply_to_wamid,
        conversation:whatsapp_conversations!whatsapp_messages_conversation_id_account_id_fkey!inner(
        contact:whatsapp_contacts!inner(phone_e164)
        ),
        template:whatsapp_templates(
          name, language, components, status, supported, synced_at
        ),
        account:whatsapp_accounts!inner(
          phone_number_id, enabled, connection_status
        )
      `)
      .eq('id', messageId)
      .single()

    if (error) throw error
    return data as unknown as WhatsAppMessageForDispatch
  }

  async getAccount(accountId: string): Promise<WhatsAppAccount | null> {
    const { data, error } = await this.supabase
      .from('whatsapp_accounts')
      .select('*')
      .eq('id', accountId)
      .single()

    if (error) throw error
    return data as WhatsAppAccount
  }

  async getEnabledAccount(): Promise<WhatsAppAccount | null> {
    const { data, error } = await this.supabase
      .from('whatsapp_accounts')
      .select('*')
      .eq('enabled', true)
      .maybeSingle()

    if (error) throw error
    return data as WhatsAppAccount | null
  }
}

