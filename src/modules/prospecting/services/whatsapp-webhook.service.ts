/**
 * WhatsApp Webhook parser and cryptographic verification service (§6 of docs/whatsapp-crm-implementation-plan.md).
 * Pure functions: runs seamlessly in Node, Deno and tests without environment-specific bindings.
 */

export interface ParsedWebhookUnits {
  inboundUnits: Array<{
    accountId: string
    wamid: string
    from: string
    waId?: string
    profileName?: string
    providerTimestamp: string
    type: 'text' | 'image' | 'document' | 'audio' | 'interactive' | 'unsupported'
    body?: string | null
    content: Record<string, unknown>
    replyToWamid?: string | null
    unitKey: string
  }>
  statusUnits: Array<{
    accountId: string
    wamid: string
    status: 'sent' | 'delivered' | 'read' | 'failed'
    providerTimestamp: string
    recipientId?: string | null
    callbackMessageId?: string | null
    errorCode?: string | null
    eventKey: string
    detail: Record<string, unknown>
  }>
  unsupportedUnits: Array<Record<string, unknown>>
}

/**
 * Verifies X-Hub-Signature-256 header against the raw body bytes using HMAC-SHA256 (§6).
 * Uses Web Crypto API in constant time.
 */
export async function verifyHmacSignature(
  rawBytes: Uint8Array,
  signatureHeader: string | null | undefined,
  appSecret: string
): Promise<boolean> {
  if (!signatureHeader || !appSecret) return false

  const prefix = 'sha256='
  if (!signatureHeader.startsWith(prefix)) return false

  const providedHex = signatureHeader.slice(prefix.length).trim()
  if (providedHex.length !== 64) return false

  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(appSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    )

    // Convert provided hex string to byte array
    const signatureBytes = new Uint8Array(32)
    for (let i = 0; i < 32; i++) {
      signatureBytes[i] = parseInt(providedHex.substr(i * 2, 2), 16)
    }

    return await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as BufferSource,
      rawBytes as unknown as BufferSource
    )
  } catch {
    return false
  }
}

/**
 * Computes SHA-256 hex string of raw bytes for payload deduplication (§6).
 */
export async function computeSha256Hex(rawBytes: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', rawBytes as unknown as BufferSource)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

export interface MetaWebhookPayload {
  object?: string
  entry?: Array<{
    id?: string
    changes?: Array<{
      field?: string
      value?: {
        metadata?: {
          phone_number_id?: string
          display_phone_number?: string
        }
        contacts?: Array<{
          wa_id?: string
          profile?: { name?: string }
        }>
        messages?: Array<{
          id?: string
          from?: string
          timestamp?: string
          type?: string
          text?: { body?: string }
          image?: { id?: string; mime_type?: string; caption?: string }
          document?: { id?: string; mime_type?: string; caption?: string; filename?: string }
          audio?: { id?: string; mime_type?: string }
          interactive?: {
            button_reply?: { id?: string; title?: string }
            list_reply?: { id?: string; title?: string; description?: string }
          }
          context?: { id?: string }
          identity?: {
            customer_identity_changed?: { wa_id?: string }
          }
          [key: string]: unknown
        }>
        statuses?: Array<{
          id?: string
          status?: string
          timestamp?: string
          recipient_id?: string
          conversation?: {
            id?: string
            origin?: { type?: string }
            expiration_timestamp?: string
          }
          pricing?: {
            billable?: boolean
            pricing_model?: string
            category?: string
          }
          errors?: Array<{
            code?: number
            title?: string
            message?: string
            error_data?: { details?: string }
          }>
          biz_opaque_callback_data?: string
          [key: string]: unknown
        }>
        errors?: Array<{
          code?: number
          title?: string
          message?: string
        }>
      }
    }>
  }>
}

/**
 * Traverses all entries, changes, messages and statuses in the payload (§6, §8, §9).
 * Extracts normalized units mapped to the resolved accountId.
 */
export function parseWebhookUnits(
  payload: MetaWebhookPayload | null | undefined,
  accountResolver: (wabaId?: string, phoneNumberId?: string) => string | null
): ParsedWebhookUnits {
  const inboundUnits: ParsedWebhookUnits['inboundUnits'] = []
  const statusUnits: ParsedWebhookUnits['statusUnits'] = []
  const unsupportedUnits: ParsedWebhookUnits['unsupportedUnits'] = []

  if (!payload || payload.object !== 'whatsapp_business_account' || !Array.isArray(payload.entry)) {
    return { inboundUnits, statusUnits, unsupportedUnits }
  }

  for (let entryIdx = 0; entryIdx < payload.entry.length; entryIdx++) {
    const entry = payload.entry[entryIdx]
    const wabaId = entry?.id

    if (!Array.isArray(entry?.changes)) continue

    for (let changeIdx = 0; changeIdx < entry.changes.length; changeIdx++) {
      const change = entry.changes[changeIdx]
      if (change?.field !== 'messages') continue

      const value = change?.value
      const phoneNumberId = value?.metadata?.phone_number_id
      const accountId = accountResolver(wabaId, phoneNumberId)

      if (!accountId) {
        unsupportedUnits.push({
          reason: 'UNKNOWN_ACCOUNT',
          wabaId,
          phoneNumberId,
          change,
        })
        continue
      }

      // 1. Process Messages (Inbound)
      if (Array.isArray(value?.messages)) {
        for (let msgIdx = 0; msgIdx < value.messages.length; msgIdx++) {
          const msg = value.messages[msgIdx]
          const wamid = msg?.id
          const from = msg?.from
          const timestampUnix = parseInt(msg?.timestamp || '', 10)
          const rawType = msg?.type

          if (!wamid || !from || isNaN(timestampUnix)) {
            unsupportedUnits.push({ reason: 'MALFORMED_MESSAGE', msg })
            continue
          }

          // Format phone as E.164 with '+'
          const fromE164 = from.startsWith('+') ? from : `+${from}`
          const providerTimestamp = new Date(timestampUnix * 1000).toISOString()
          const replyToWamid = msg?.context?.id || null
          const metaContact = value.contacts?.find((contact) => contact.wa_id === from)
            ?? value.contacts?.[0]

          let type: ParsedWebhookUnits['inboundUnits'][0]['type'] = 'unsupported'
          let body: string | null = null
          const content: Record<string, unknown> = {}

          if (rawType === 'text') {
            type = 'text'
            body = msg.text?.body ?? null
          } else if (rawType === 'image') {
            type = 'image'
            body = msg.image?.caption ?? '[Imagem recebida]'
            content.mediaId = msg.image?.id
            content.mimeType = msg.image?.mime_type
          } else if (rawType === 'document') {
            type = 'document'
            body = msg.document?.caption ?? msg.document?.filename ?? '[Documento recebido]'
            content.mediaId = msg.document?.id
            content.filename = msg.document?.filename
          } else if (rawType === 'audio') {
            type = 'audio'
            body = '[Áudio recebido]'
            content.mediaId = msg.audio?.id
          } else if (rawType === 'interactive') {
            type = 'interactive'
            body = msg.interactive?.button_reply?.title ?? msg.interactive?.list_reply?.title ?? '[Resposta interativa]'
            content.interactive = msg.interactive
          } else {
            type = 'unsupported'
            body = `[Mensagem tipo ${rawType || 'desconhecido'}]`
            content.rawType = rawType
          }

          inboundUnits.push({
            accountId,
            wamid,
            from: fromE164,
            waId: msg?.identity?.customer_identity_changed?.wa_id ?? metaContact?.wa_id,
            profileName: metaContact?.profile?.name?.trim() || undefined,
            providerTimestamp,
            type,
            body,
            content,
            replyToWamid,
            unitKey: `entry_${entryIdx}_change_${changeIdx}_msg_${msgIdx}`,
          })
        }
      }

      // 2. Process Statuses (Outbound updates)
      if (Array.isArray(value?.statuses)) {
        for (let statIdx = 0; statIdx < value.statuses.length; statIdx++) {
          const stat = value.statuses[statIdx]
          const wamid = stat?.id
          const rawStatus = stat?.status
          const timestampUnix = parseInt(stat?.timestamp || '', 10)

          if (!wamid || !rawStatus || isNaN(timestampUnix)) {
            unsupportedUnits.push({ reason: 'MALFORMED_STATUS', stat })
            continue
          }

          if (!['sent', 'delivered', 'read', 'failed'].includes(rawStatus)) {
            unsupportedUnits.push({ reason: 'UNSUPPORTED_STATUS_VALUE', stat })
            continue
          }

          const providerTimestamp = new Date(timestampUnix * 1000).toISOString()
          const errorCode = stat.errors && stat.errors[0]?.code ? String(stat.errors[0].code) : null
          const callbackMessageId = stat.biz_opaque_callback_data || null

          const eventKey = `${accountId}|${wamid}|${rawStatus}|${providerTimestamp}|${errorCode || ''}`

          statusUnits.push({
            accountId,
            wamid,
            status: rawStatus as 'sent' | 'delivered' | 'read' | 'failed',
            providerTimestamp,
            recipientId: stat.recipient_id || null,
            callbackMessageId,
            errorCode,
            eventKey,
            detail: {
              pricing: stat.pricing,
              conversation: stat.conversation,
              errors: stat.errors,
            },
          })
        }
      }
    }
  }

  return { inboundUnits, statusUnits, unsupportedUnits }
}
