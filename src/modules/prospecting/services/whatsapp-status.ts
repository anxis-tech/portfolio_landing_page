import { WhatsAppMessageStatus } from '../types/whatsapp'

export interface MessageStatusInput {
  status?: WhatsAppMessageStatus
  acceptedAt?: Date | string | null
  sentAt?: Date | string | null
  deliveredAt?: Date | string | null
  readAt?: Date | string | null
  failedAt?: Date | string | null
  errorCode?: string | null
}

export interface MessageStatusEvent {
  kind: 'accepted' | 'sent' | 'delivered' | 'read' | 'failed'
  providerTimestamp?: Date | string | null
  errorCode?: string | null
}

/**
 * Pure status reducer mirroring SQL §9.1.
 * Priority: read > delivered > failed > sent > accepted > pending.
 * Uses the earliest timestamp for each respective fact.
 */
export function reduceMessageStatus(
  current: MessageStatusInput,
  newEvent?: MessageStatusEvent
): {
  status: WhatsAppMessageStatus
  acceptedAt: string | null
  sentAt: string | null
  deliveredAt: string | null
  readAt: string | null
  failedAt: string | null
  errorCode: string | null
} {
  const parseTs = (ts?: Date | string | null): number | null => {
    if (!ts) return null
    const d = typeof ts === 'string' ? new Date(ts) : ts
    return isNaN(d.getTime()) ? null : d.getTime()
  }

  const formatTs = (ms: number | null): string | null => {
    return ms ? new Date(ms).toISOString() : null
  }

  let acceptedMs = parseTs(current.acceptedAt)
  let sentMs = parseTs(current.sentAt)
  let deliveredMs = parseTs(current.deliveredAt)
  let readMs = parseTs(current.readAt)
  let failedMs = parseTs(current.failedAt)
  let errorCode = current.errorCode ?? null

  if (newEvent) {
    const eventMs = parseTs(newEvent.providerTimestamp) ?? Date.now()

    if (newEvent.kind === 'accepted') {
      acceptedMs = acceptedMs ? Math.min(acceptedMs, eventMs) : eventMs
    } else if (newEvent.kind === 'sent') {
      sentMs = sentMs ? Math.min(sentMs, eventMs) : eventMs
    } else if (newEvent.kind === 'delivered') {
      deliveredMs = deliveredMs ? Math.min(deliveredMs, eventMs) : eventMs
    } else if (newEvent.kind === 'read') {
      readMs = readMs ? Math.min(readMs, eventMs) : eventMs
    } else if (newEvent.kind === 'failed') {
      failedMs = failedMs ? Math.min(failedMs, eventMs) : eventMs
      if (newEvent.errorCode) {
        errorCode = newEvent.errorCode
      }
    }
  }

  let derivedStatus: WhatsAppMessageStatus = 'pending'
  if (readMs !== null) {
    derivedStatus = 'read'
  } else if (deliveredMs !== null) {
    derivedStatus = 'delivered'
  } else if (failedMs !== null) {
    derivedStatus = 'failed'
  } else if (sentMs !== null) {
    derivedStatus = 'sent'
  } else if (acceptedMs !== null) {
    derivedStatus = 'accepted'
  }

  return {
    status: derivedStatus,
    acceptedAt: formatTs(acceptedMs),
    sentAt: formatTs(sentMs),
    deliveredAt: formatTs(deliveredMs),
    readAt: formatTs(readMs),
    failedAt: formatTs(failedMs),
    errorCode,
  }
}

