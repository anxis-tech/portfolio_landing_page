import { createHash } from 'node:crypto'

import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { downloadSignedAutentiqueDocument } from '@/lib/services/autentique'
import {
  parseAutentiqueWebhookEvent,
  processAutentiqueWebhookEvent,
  verifyAutentiqueWebhookSignature,
  type AutentiqueWebhookContract,
  type AutentiqueWebhookEvent,
} from '@/lib/services/autentique-webhook'
import { createAdminClient } from '@/lib/supabase/admin'

type AutentiqueWebhookRouteConfig = {
  secret: string | undefined
  missingSecretMessage: string
  allowedEventTypes: readonly AutentiqueWebhookEvent['type'][]
}

function isUniqueViolation(error: { code?: string } | null) {
  return error?.code === '23505'
}

export async function handleAutentiqueWebhookRequest(
  request: Request,
  config: AutentiqueWebhookRouteConfig
) {
  if (!config.secret) {
    return NextResponse.json(
      { success: false, message: config.missingSecretMessage },
      { status: 503 }
    )
  }

  const rawBody = await request.text()
  const signature = request.headers.get('x-autentique-signature')

  if (!verifyAutentiqueWebhookSignature(rawBody, signature, config.secret)) {
    return NextResponse.json({ success: false, message: 'Assinatura HMAC inválida.' }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ success: false, message: 'Payload JSON inválido.' }, { status: 400 })
  }

  const event = parseAutentiqueWebhookEvent(payload)
  if (!event) {
    return NextResponse.json({ success: false, message: 'Evento Autentique inválido.' }, { status: 400 })
  }

  if (!config.allowedEventTypes.includes(event.type)) {
    return NextResponse.json(
      { success: false, message: 'Evento Autentique não permitido neste webhook.' },
      { status: 400 }
    )
  }

  const adminSupabase = createAdminClient()
  const payloadHash = createHash('sha256').update(rawBody, 'utf8').digest('hex')

  const reserveEvent = async (receivedEvent: AutentiqueWebhookEvent) => {
    const { error: insertError } = await adminSupabase
      .from('autentique_webhook_events')
      .insert({
        event_id: receivedEvent.id,
        event_type: receivedEvent.type,
        autentique_document_id: receivedEvent.documentId,
        autentique_signer_id: receivedEvent.signerId,
        payload_hash: payloadHash,
        raw_payload: rawBody,
        payload: receivedEvent.rawPayload,
        processing_status: 'processing',
      })

    if (!insertError) return 'reserved' as const

    if (!isUniqueViolation(insertError)) {
      throw new Error('Não foi possível registrar o evento Autentique para auditoria.')
    }

    const { data: existingEvent, error: lookupError } = await adminSupabase
      .from('autentique_webhook_events')
      .select('processing_status')
      .eq('event_id', receivedEvent.id)
      .single()

    if (lookupError || !existingEvent || existingEvent.processing_status !== 'failed') {
      return 'duplicate' as const
    }

    const { error: retryError } = await adminSupabase
      .from('autentique_webhook_events')
      .update({ processing_status: 'processing', processing_error: null })
      .eq('event_id', receivedEvent.id)
      .eq('processing_status', 'failed')

    if (retryError) {
      throw new Error('Não foi possível retomar o processamento do evento Autentique.')
    }

    return 'reserved' as const
  }

  try {
    const result = await processAutentiqueWebhookEvent(event, {
      reserveEvent,
      findContractByDocumentId: async (documentId): Promise<AutentiqueWebhookContract | null> => {
        const { data: contract, error } = await adminSupabase
          .from('contracts')
          .select('id,project_id,autentique_document_id,autentique_signer_id,signature_status,client_signed_at,document_finished_at,payment_unlocked_at,signed_document_path,voided_at')
          .eq('autentique_document_id', documentId)
          .maybeSingle()

        if (error || !contract) return null

        return {
          id: contract.id,
          projectId: contract.project_id,
          autentiqueDocumentId: contract.autentique_document_id,
          autentiqueSignerId: contract.autentique_signer_id,
          signatureStatus: contract.signature_status,
          clientSignedAt: contract.client_signed_at,
          documentFinishedAt: contract.document_finished_at,
          paymentUnlockedAt: contract.payment_unlocked_at,
          voidedAt: contract.voided_at,
          signedDocumentPath: contract.signed_document_path,
        }
      },
      updateContract: async (contractId, changes) => {
        const update = {
          ...(changes.signatureStatus ? { signature_status: changes.signatureStatus } : {}),
          ...(changes.clientSignedAt ? { client_signed_at: changes.clientSignedAt } : {}),
          ...(changes.documentFinishedAt ? { document_finished_at: changes.documentFinishedAt } : {}),
          ...(changes.paymentUnlockedAt ? { payment_unlocked_at: changes.paymentUnlockedAt } : {}),
          ...(changes.signedDocumentPath ? { signed_document_path: changes.signedDocumentPath } : {}),
        }

        const { error } = await adminSupabase.from('contracts').update(update).eq('id', contractId)
        if (error) throw new Error('Não foi possível atualizar o contrato após o webhook Autentique.')
      },
      downloadSignedPdf: downloadSignedAutentiqueDocument,
      storeSignedPdf: async (contract, pdfBytes) => {
        const storagePath = `contracts/${contract.projectId}/${contract.id}/signed.pdf`
        const { error } = await adminSupabase.storage
          .from('contracts')
          .upload(storagePath, pdfBytes, { contentType: 'application/pdf', upsert: false })

        if (error) throw new Error('Não foi possível armazenar o PDF assinado do contrato.')
        return storagePath
      },
      finalizeEvent: async (eventId, status, error) => {
        const { error: updateError } = await adminSupabase
          .from('autentique_webhook_events')
          .update({
            processing_status: status,
            processing_error: error || null,
            processed_at: new Date().toISOString(),
          })
          .eq('event_id', eventId)

        if (updateError) throw new Error('Não foi possível finalizar o evento Autentique.')
      },
    })

    if (result.status === 'processed') revalidatePath('/admin')
    return NextResponse.json({ success: true, status: result.status }, { status: 200 })
  } catch {
    return NextResponse.json({ success: false, message: 'Erro ao processar webhook Autentique.' }, { status: 500 })
  }
}
