import { createHmac, timingSafeEqual } from 'node:crypto'

export type AutentiqueWebhookEvent = {
  id: string
  type: 'signature.accepted' | 'signature.rejected' | 'document.finished' | string
  documentId: string
  signerId: string | null
  occurredAt: string
  rawPayload: Record<string, unknown>
}

export type AutentiqueWebhookContract = {
  id: string
  projectId: string
  autentiqueDocumentId: string
  autentiqueSignerId: string | null
  signatureStatus: 'draft' | 'generated' | 'pending_signature' | 'client_signed' | 'completed' | 'rejected' | 'error'
  clientSignedAt: string | null
  documentFinishedAt: string | null
  paymentUnlockedAt: string | null
  signedDocumentPath: string | null
  voidedAt?: string | null
}

export type AutentiqueWebhookDependencies = {
  reserveEvent: (event: AutentiqueWebhookEvent) => Promise<'reserved' | 'duplicate'>
  findContractByDocumentId: (documentId: string) => Promise<AutentiqueWebhookContract | null>
  updateContract: (
    contractId: string,
    changes: Partial<AutentiqueWebhookContract>
  ) => Promise<void>
  downloadSignedPdf: (documentId: string) => Promise<Uint8Array>
  storeSignedPdf: (contract: AutentiqueWebhookContract, pdfBytes: Uint8Array) => Promise<string>
  finalizeEvent: (eventId: string, status: 'processed' | 'failed', error?: string) => Promise<void>
}

type WebhookEnvelope = {
  event?: {
    id?: string
    type?: string
    created_at?: string
    data?: unknown
  }
}

type SignatureEventData = {
  public_id?: string
  document?: string
  signed?: string
  rejected?: string
}

type DocumentEventData = {
  id?: string
  document?: string
}

function normalizeAutentiqueSignerId(value: string | null) {
  const normalized = value?.trim().toLowerCase().replace(/-/g, '')
  return normalized || null
}

export function verifyAutentiqueWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string
) {
  if (!signature || !secret || !/^[a-fA-F0-9]{64}$/.test(signature)) {
    return false
  }

  const calculated = createHmac('sha256', secret).update(rawBody, 'utf8').digest()
  const provided = Buffer.from(signature, 'hex')

  return provided.length === calculated.length && timingSafeEqual(calculated, provided)
}

export function parseAutentiqueWebhookEvent(payload: unknown): AutentiqueWebhookEvent | null {
  if (!payload || typeof payload !== 'object') return null

  const envelope = payload as WebhookEnvelope
  const event = envelope.event
  if (!event?.id || !event.type) return null

  const eventData = event.data && typeof event.data === 'object'
    ? event.data as Record<string, unknown>
    : null
  const objectData = eventData?.object && typeof eventData.object === 'object'
    ? eventData.object as Record<string, unknown>
    : eventData

  if (!objectData) return null

  const isSignatureEvent = event.type.startsWith('signature.')
  const signatureData = objectData as SignatureEventData
  const documentData = objectData as DocumentEventData
  const documentId = isSignatureEvent
    ? signatureData.document
    : documentData.id || documentData.document

  if (!documentId || typeof documentId !== 'string') return null

  return {
    id: event.id,
    type: event.type,
    documentId,
    signerId: isSignatureEvent && typeof signatureData.public_id === 'string'
      ? signatureData.public_id
      : null,
    occurredAt: isSignatureEvent && event.type === 'signature.accepted' && typeof signatureData.signed === 'string'
      ? signatureData.signed
      : isSignatureEvent && event.type === 'signature.rejected' && typeof signatureData.rejected === 'string'
        ? signatureData.rejected
        : event.created_at || new Date().toISOString(),
    rawPayload: payload as Record<string, unknown>,
  }
}

export async function processAutentiqueWebhookEvent(
  event: AutentiqueWebhookEvent,
  dependencies: AutentiqueWebhookDependencies
) {
  const reservation = await dependencies.reserveEvent(event)
  if (reservation === 'duplicate') {
    return { status: 'duplicate' as const }
  }

  const contract = await dependencies.findContractByDocumentId(event.documentId)
  if (!contract || contract.autentiqueDocumentId !== event.documentId) {
    await dependencies.finalizeEvent(event.id, 'failed', 'Contrato não encontrado para o documento Autentique.')
    return { status: 'ignored' as const }
  }
  if (contract.voidedAt) {
    await dependencies.finalizeEvent(event.id, 'processed')
    return { status: 'ignored' as const }
  }

  const requiresClientSigner = event.type === 'signature.accepted' || event.type === 'signature.rejected'
  const eventSignerId = normalizeAutentiqueSignerId(event.signerId)
  const contractSignerId = normalizeAutentiqueSignerId(contract.autentiqueSignerId)
  if (
    requiresClientSigner &&
    (!eventSignerId || !contractSignerId || eventSignerId !== contractSignerId)
  ) {
    await dependencies.finalizeEvent(event.id, 'failed', 'Signatário Autentique não corresponde ao cliente do contrato.')
    return { status: 'ignored' as const }
  }

  try {
    if (event.type === 'signature.accepted') {
      const changes: Partial<AutentiqueWebhookContract> = {}
      if (!contract.clientSignedAt) changes.clientSignedAt = event.occurredAt
      if (!contract.paymentUnlockedAt) changes.paymentUnlockedAt = event.occurredAt
      if (contract.signatureStatus !== 'completed') changes.signatureStatus = 'client_signed'
      if (Object.keys(changes).length > 0) {
        await dependencies.updateContract(contract.id, changes)
      }
    } else if (event.type === 'document.finished') {
      const changes: Partial<AutentiqueWebhookContract> = {}
      if (!contract.documentFinishedAt) changes.documentFinishedAt = event.occurredAt
      if (contract.signatureStatus !== 'completed') changes.signatureStatus = 'completed'

      if (!contract.signedDocumentPath) {
        const signedPdf = await dependencies.downloadSignedPdf(contract.autentiqueDocumentId)
        changes.signedDocumentPath = await dependencies.storeSignedPdf(contract, signedPdf)
      }

      if (Object.keys(changes).length > 0) {
        await dependencies.updateContract(contract.id, changes)
      }
    } else if (event.type === 'signature.rejected') {
      if (contract.signatureStatus === 'pending_signature') {
        await dependencies.updateContract(contract.id, { signatureStatus: 'rejected' })
      }
    }

    await dependencies.finalizeEvent(event.id, 'processed')
    return { status: 'processed' as const }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido ao processar webhook Autentique.'
    await dependencies.finalizeEvent(event.id, 'failed', message)
    return { status: 'failed' as const }
  }
}
