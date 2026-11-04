import { randomUUID } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Payment, ProjectCharge } from '@/types/payment.types'
import { getServerAppUrl } from '@/lib/config/app-url'

type BillingJob = { id: string; charge_id: string; lease_token: string; submission_uncertain: boolean }

function paymentUrl(response: Record<string, unknown>) {
  const raw = response.url || response.checkout_url || response.link
    || (typeof response.slug === 'string' ? `https://checkout.infinitepay.io/${response.slug}` : null)
  return typeof raw === 'string' && /^https:\/\//.test(raw) ? raw : null
}

/** One durable charge/NSU. A timeout never results in another create-link POST. */
export async function processProjectBillingJob(db: SupabaseClient, job: BillingJob, actor?: string) {
  const { data: charge, error: chargeError } = await db.from('project_charges').select('*').eq('id', job.charge_id).single()
  if (chargeError || !charge) throw new Error('Cobrança persistida não encontrada.')
  if (charge.status === 'paid' || charge.status === 'cancelled') {
    throw new Error('Cobrança não disponível para criação de link.')
  }
  const { data: project, error: projectError } = await db.from('client_projects').select('title,client_name,email,phone,whatsapp,client_contact_json').eq('id', charge.project_id).single()
  if (projectError || !project) throw new Error('Projeto da cobrança não encontrado.')
  const handle = process.env.INFINITEPAY_HANDLE?.replace(/^\$/, '').trim()
  if (!handle) throw new Error('INFINITEPAY_HANDLE não configurado no servidor.')
  const baseUrl = getServerAppUrl()
  const existing = await db.from('payments').select('*').eq('charge_id', charge.id).maybeSingle()
  if (existing.error) throw new Error('Não foi possível verificar o pagamento reservado.')
  if (existing.data?.payment_url) {
    await db.rpc('persist_project_charge_link', { p_job_id: job.id, p_lease_token: job.lease_token,
      p_url: existing.data.payment_url, p_provider_response: existing.data.provider_response || {} }).then(({ error }) => { if (error) throw error })
    return existing.data as Payment
  }
  if (job.submission_uncertain) {
    // The official check may recover an existing link. An unpaid/unknown result
    // cannot prove absence of a prior POST and never authorizes a second POST.
    const response = await fetch('https://api.checkout.infinitepay.io/payment_check', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(15000),
      body: JSON.stringify({ handle, order_nsu: charge.order_nsu, slug: existing.data?.invoice_slug || undefined }),
    })
    const payload = await response.json() as Record<string, unknown>
    const recovered = response.ok ? paymentUrl(payload) : null
    if (!recovered) throw new Error('Resultado da criação de link incerto. Nenhuma nova cobrança foi enviada; concilie a referência na InfinitePay.')
    const { data, error } = await db.rpc('persist_project_charge_link', { p_job_id: job.id,
      p_lease_token: job.lease_token, p_url: recovered, p_provider_response: payload })
    if (error) throw error
    return data as Payment
  }
  const { error: reserveError } = await db.rpc('reserve_project_charge_payment', {
    p_job_id: job.id, p_lease_token: job.lease_token, p_actor: actor || null,
  })
  if (reserveError) throw reserveError
  const contact = project.client_contact_json || {}
  const response = await fetch('https://api.checkout.infinitepay.io/links', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(20000),
    body: JSON.stringify({ handle, redirect_url: `${baseUrl}/pagamento/retorno`, webhook_url: `${baseUrl}/api/webhooks/infinitepay`,
      order_nsu: charge.order_nsu, customer: { name: contact.contact_name || project.client_name,
        email: contact.email || project.email || undefined,
        phone: String(contact.phone || project.phone || project.whatsapp || '').replace(/\D/g, '') || undefined },
      items: [{ description: `${charge.type === 'final' ? 'Saldo final' : charge.type === 'advance' ? 'Entrada' : 'Pagamento integral'} — ${project.title}`,
        quantity: 1, price: charge.amount }],
    }),
  })
  const payload = await response.json() as Record<string, unknown>
  const url = response.ok ? paymentUrl(payload) : null
  if (!url) throw new Error('A InfinitePay não confirmou um link de pagamento. A referência foi preservada para conciliação segura.')
  const { data, error } = await db.rpc('persist_project_charge_link', {
    p_job_id: job.id, p_lease_token: job.lease_token, p_url: url, p_provider_response: payload,
  })
  if (error) throw error
  return data as Payment
}

export async function processBillingBatch(db: SupabaseClient, options: { limit?: number } = {}) {
  const { data: jobs, error } = await db.rpc('claim_project_billing_jobs', {
    p_worker: randomUUID(), p_limit: Math.min(10, options.limit ?? 5),
  })
  if (error) throw error
  let completed = 0
  let failed = 0
  for (const job of (jobs || []) as BillingJob[]) {
    try {
      await processProjectBillingJob(db, job)
      const result = await db.rpc('finish_project_billing_job', { p_job_id: job.id, p_lease_token: job.lease_token, p_success: true })
      if (result.error) throw result.error
      completed++
    } catch (error) {
      failed++
      await db.rpc('finish_project_billing_job', { p_job_id: job.id, p_lease_token: job.lease_token,
        p_success: false, p_error: error instanceof Error ? error.message : 'Falha de cobrança.', p_uncertain: false })
    }
  }
  return { claimed: jobs?.length || 0, completed, failed }
}

export async function createProjectChargeLink(db: SupabaseClient, charge: ProjectCharge, actor: string) {
  if (charge.payment_url && charge.status === 'awaiting_payment') {
    const { data, error } = await db.from('payments').select('*').eq('charge_id', charge.id).single()
    if (error) throw error
    return data as Payment
  }
  const { data: jobs, error } = await db.rpc('claim_project_charge_job', { p_charge_id: charge.id, p_worker: randomUUID() })
  if (error) throw error
  const job = Array.isArray(jobs) ? jobs[0] : jobs
  if (!job) throw new Error('A cobrança está em processamento ou ainda não foi liberada.')
  try {
    const payment = await processProjectBillingJob(db, job, actor)
    const finished = await db.rpc('finish_project_billing_job', { p_job_id: job.id, p_lease_token: job.lease_token, p_success: true })
    if (finished.error) throw finished.error
    return payment
  } catch (error) {
    await db.rpc('finish_project_billing_job', { p_job_id: job.id, p_lease_token: job.lease_token,
      p_success: false, p_error: error instanceof Error ? error.message : 'Falha de cobrança.', p_uncertain: false })
    throw error
  }
}
