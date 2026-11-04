/**
 * Meta Cloud API Client (§5.2, §7.2, §8 of docs/whatsapp-crm-implementation-plan.md).
 * Injected fetch and clock. Shared between Node, Deno and tests without direct env dependency.
 */

export interface MetaClientOptions {
  graphApiVersion: string
  fetchFn?: typeof fetch
  clock?: () => number
  timeoutMs?: number
}

export type MetaDispatchResult =
  | { outcome: 'accepted'; wamid: string; acceptedAt: string }
  | { outcome: 'rejected'; code: string; retryable: boolean; retryAfterSeconds?: number }
  | { outcome: 'uncertain'; code: string }

export interface MetaTemplateRecord {
  id: string
  name: string
  language: string
  category: string
  status: string
  components: Array<Record<string, unknown>>
}

export interface MetaTemplatesResponse {
  data: MetaTemplateRecord[]
  paging?: {
    cursors?: {
      after?: string
      before?: string
    }
    next?: string
  }
}

export class WhatsAppMetaService {
  private readonly version: string
  private readonly fetchFn: typeof fetch
  private readonly clock: () => number
  private readonly timeoutMs: number

  constructor(options: MetaClientOptions) {
    if (!options?.graphApiVersion || typeof options.graphApiVersion !== 'string' || options.graphApiVersion.trim() === '') {
      throw new Error('CONFIG_ERROR: WHATSAPP_GRAPH_API_VERSION is mandatory')
    }
    this.version = options.graphApiVersion
    this.fetchFn = options.fetchFn ?? fetch
    this.clock = options.clock ?? (() => Date.now())
    this.timeoutMs = options.timeoutMs ?? 10000
  }

  private getBaseUrl(): string {
    return `https://graph.facebook.com/${this.version}`
  }

  /**
   * Sends a 1:1 outbound text message (§5.2).
   */
  async sendTextMessage(params: {
    phoneNumberId: string
    accessToken: string
    to: string
    body: string
    messageId: string
    replyToWamid?: string | null
  }): Promise<MetaDispatchResult> {
    const payload: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'text',
      text: {
        preview_url: false,
        body: params.body,
      },
      biz_opaque_callback_data: params.messageId,
    }

    if (params.replyToWamid) {
      payload.context = {
        message_id: params.replyToWamid,
      }
    }

    return this.dispatchMessage(params.phoneNumberId, params.accessToken, payload)
  }

  /**
   * Sends a 1:1 outbound template message (§5.2).
   */
  async sendTemplateMessage(params: {
    phoneNumberId: string
    accessToken: string
    to: string
    templateName: string
    languageCode: string
    components?: Array<Record<string, unknown>> | null
    messageId: string
    replyToWamid?: string | null
  }): Promise<MetaDispatchResult> {
    const templatePayload: Record<string, unknown> = {
      name: params.templateName,
      language: {
        code: params.languageCode,
      },
    }

    if (params.components && params.components.length > 0) {
      templatePayload.components = params.components
    }

    const payload: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: params.to,
      type: 'template',
      template: templatePayload,
      biz_opaque_callback_data: params.messageId,
    }

    if (params.replyToWamid) {
      payload.context = {
        message_id: params.replyToWamid,
      }
    }

    return this.dispatchMessage(params.phoneNumberId, params.accessToken, payload)
  }

  /**
   * Internal message dispatcher with strict uncertain handling (§7.2, §7.4).
   * Timeout, connection drops, or 5xx return outcome: 'uncertain' without blind automatic retries.
   */
  private async dispatchMessage(
    phoneNumberId: string,
    accessToken: string,
    payload: Record<string, unknown>
  ): Promise<MetaDispatchResult> {
    const url = `${this.getBaseUrl()}/${encodeURIComponent(phoneNumberId)}/messages`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const response = await this.fetchFn(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timer)

      // Ambiguous server error: cannot know if Meta processed the message -> uncertain
      if (response.status >= 500) {
        return {
          outcome: 'uncertain',
          code: `META_5XX_SERVER_ERROR_${response.status}`,
        }
      }

      // Explicit rate limit: retryable
      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('Retry-After')
        const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : undefined
        return {
          outcome: 'rejected',
          code: 'META_RATE_LIMIT_429',
          retryable: true,
          retryAfterSeconds: isNaN(retryAfterSeconds ?? NaN) ? 30 : retryAfterSeconds,
        }
      }

      let data: Record<string, unknown> | null = null
      try {
        data = (await response.json()) as Record<string, unknown>
      } catch {
        return {
          outcome: 'uncertain',
          code: 'INVALID_JSON_RESPONSE',
        }
      }

      const msgs = data && Array.isArray(data.messages) ? data.messages : null
      const firstMsg = msgs && typeof msgs[0] === 'object' && msgs[0] !== null ? (msgs[0] as Record<string, unknown>) : null

      if (response.ok && firstMsg?.id) {
        return {
          outcome: 'accepted',
          wamid: String(firstMsg.id),
          acceptedAt: new Date(this.clock()).toISOString(),
        }
      }

      // 200 OK without wamid is uncertain (§5.2: "Sem wamid em resposta supostamente exitosa = resultado incerto")
      if (response.ok) {
        return {
          outcome: 'uncertain',
          code: 'MISSING_WAMID_IN_SUCCESS_RESPONSE',
        }
      }

      // Graph API error block
      const errObj = data && typeof data.error === 'object' && data.error !== null ? (data.error as Record<string, unknown>) : null
      const errorCode = errObj?.code ? `META_ERR_${String(errObj.code)}` : `META_HTTP_${response.status}`
      return {
        outcome: 'rejected',
        code: errorCode,
        retryable: false,
      }
    } catch (err: unknown) {
      clearTimeout(timer)
      if (err instanceof Error && err.name === 'AbortError') {
        return {
          outcome: 'uncertain',
          code: 'DISPATCH_TIMEOUT',
        }
      }
      return {
        outcome: 'uncertain',
        code: 'NETWORK_ERROR',
      }
    }
  }

  /**
   * Fetches paginated template records from WABA (§5.2).
   */
  async fetchTemplates(params: {
    wabaId: string
    accessToken: string
    limit?: number
    after?: string
  }): Promise<MetaTemplatesResponse> {
    const query = new URLSearchParams({
      fields: 'id,name,language,category,status,components',
      limit: String(params.limit ?? 100),
    })
    if (params.after) {
      query.set('after', params.after)
    }

    const url = `${this.getBaseUrl()}/${encodeURIComponent(params.wabaId)}/message_templates?${query.toString()}`
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const response = await this.fetchFn(url, {
        headers: {
          Authorization: `Bearer ${params.accessToken}`,
        },
        signal: controller.signal,
      })
      clearTimeout(timer)

      if (!response.ok) {
        throw new Error(`Meta API error fetching templates: HTTP ${response.status}`)
      }

      return (await response.json()) as MetaTemplatesResponse
    } catch (err) {
      clearTimeout(timer)
      throw err
    }
  }

  /**
   * Traverses all pages of templates in memory reconstructing cursor URLs on the fixed base URL (§5.2).
   */
  async fetchAllTemplates(params: {
    wabaId: string
    accessToken: string
  }): Promise<MetaTemplateRecord[]> {
    const allTemplates: MetaTemplateRecord[] = []
    let nextCursor: string | undefined = undefined

    do {
      const page = await this.fetchTemplates({
        wabaId: params.wabaId,
        accessToken: params.accessToken,
        limit: 100,
        after: nextCursor,
      })

      if (page.data && Array.isArray(page.data)) {
        allTemplates.push(...page.data)
      }

      nextCursor = page.paging?.cursors?.after
      // If there's no next cursor or no data, finish pagination
      if (!page.paging?.next || !nextCursor) {
        break
      }
    } while (nextCursor)

    return allTemplates
  }

  /**
   * Discovers phone numbers associated with a WABA (§5.2).
   */
  async getPhoneNumbers(params: {
    wabaId: string
    accessToken: string
  }): Promise<{ data: Array<{ id: string; display_phone_number?: string; verified_name?: string }> }> {
    const url = `${this.getBaseUrl()}/${encodeURIComponent(params.wabaId)}/phone_numbers`
    const response = await this.fetchFn(url, {
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
      },
    })
    if (!response.ok) {
      throw new Error(`Meta API error fetching phone numbers: HTTP ${response.status}`)
    }
    return (await response.json()) as { data: Array<{ id: string; display_phone_number?: string; verified_name?: string }> }
  }

  /**
   * Subscribes WABA to app webhooks (§5.2).
   */
  async subscribeApps(params: {
    wabaId: string
    accessToken: string
  }): Promise<boolean> {
    const url = `${this.getBaseUrl()}/${encodeURIComponent(params.wabaId)}/subscribed_apps`
    const response = await this.fetchFn(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${params.accessToken}`,
      },
    })
    if (!response.ok) {
      throw new Error(`Meta API error subscribing apps: HTTP ${response.status}`)
    }
    const data = await response.json()
    return Boolean(data?.success)
  }
}

