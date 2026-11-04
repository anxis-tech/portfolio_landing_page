import { WhatsAppOptInStatus, WhatsAppMessageType } from '../types/whatsapp'

export const OPT_OUT_KEYWORDS = ['sair', 'pare', 'parar', 'stop', 'descadastrar', 'cancelar mensagens'] as const

/**
 * Checks the 24-hour customer service window based on last_inbound_at (§10).
 * Equality at the exact instant of expiration is considered closed.
 */
export function checkCustomerWindow(
  lastInboundAt: Date | string | null,
  now: Date = new Date()
): {
  isOpen: boolean
  expiresAt: Date | null
  remainingMs: number
} {
  if (!lastInboundAt) {
    return {
      isOpen: false,
      expiresAt: null,
      remainingMs: 0,
    }
  }

  const inboundDate = typeof lastInboundAt === 'string' ? new Date(lastInboundAt) : lastInboundAt
  if (isNaN(inboundDate.getTime())) {
    return {
      isOpen: false,
      expiresAt: null,
      remainingMs: 0,
    }
  }

  const expiresAt = new Date(inboundDate.getTime() + 24 * 60 * 60 * 1000)
  const remainingMs = expiresAt.getTime() - now.getTime()
  // Equality at expiration instant is closed (§10: "Igualdade no instante de expiração é janela fechada")
  const isOpen = remainingMs > 0

  return {
    isOpen,
    expiresAt,
    remainingMs: Math.max(0, remainingMs),
  }
}

/**
 * Evaluates outbound eligibility using the Meta customer-service window.
 * Internal consent is informational unless an explicit opt-out was recorded.
 */
export function evaluateOutboundEligibility(options: {
  optInStatus: WhatsAppOptInStatus
  isWindowOpen: boolean
  type: WhatsAppMessageType
}): {
  allowed: boolean
  reason?: string
  code?: string
} {
  const { optInStatus, isWindowOpen, type } = options

  if (optInStatus === 'revoked') {
    return {
      allowed: false,
      code: 'OPT_IN_REVOKED',
      reason: 'Contato revogou autorização para recebimento de mensagens.',
    }
  }

  if (isWindowOpen) {
    // Customer initiated the conversation: free text and approved templates are valid.
    return { allowed: true }
  }

  if (type === 'template') {
    return { allowed: true }
  }

  return {
    allowed: false,
    code: 'WINDOW_CLOSED_TEMPLATE_REQUIRED',
    reason: 'Janela de 24h fechada. Apenas mensagens de template homologado podem ser enviadas.',
  }
}

/**
 * Detects if an incoming message is an exact opt-out keyword (§8).
 * Checks whole message after trim and lowercase. Substrings are strictly NOT considered opt-out.
 */
export function isOptOutKeyword(rawText: string | null | undefined): boolean {
  if (!rawText || typeof rawText !== 'string') return false
  const trimmed = rawText.trim().toLowerCase()
  return (OPT_OUT_KEYWORDS as readonly string[]).includes(trimmed)
}

/**
 * Determines whether free text messages can be sent (§10).
 * Allowed when the 24-hour customer window is open AND opt-in is not revoked.
 */
export function canSendText(optInStatus: WhatsAppOptInStatus, isWindowOpen: boolean): boolean {
  return evaluateOutboundEligibility({
    optInStatus,
    isWindowOpen,
    type: 'text',
  }).allowed
}

/**
 * Determines whether proactive template messages can be sent (§10).
 * Approved templates are allowed inside or outside the 24h window unless opt-out was recorded.
 */
export function canSendTemplate(optInStatus: WhatsAppOptInStatus, isWindowOpen: boolean): boolean {
  return evaluateOutboundEligibility({
    optInStatus,
    isWindowOpen,
    type: 'template',
  }).allowed
}
