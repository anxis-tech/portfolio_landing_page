'use client'

import { useEffect, useState } from 'react'
import { downloadFiscalInvoiceAction, getFiscalInvoicesForProjectAction, retryFiscalInvoiceAction } from '@/lib/actions/fiscal'
import type { FiscalInvoiceSummary } from '@/modules/fiscal/types'

const labels: Record<FiscalInvoiceSummary['status'], string> = { pending: 'Pendente', configuration_required: 'Configuração necessária', processing: 'Em processamento', authorized: 'Autorizada', rejected: 'Rejeitada', error: 'Erro', cancelled: 'Cancelada', blocked: 'Aguardando configuração' }

export function ProjectFiscalPanel({ projectId, canRetry }: { projectId: string; canRetry: boolean }) {
  const [invoices, setInvoices] = useState<FiscalInvoiceSummary[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    void getFiscalInvoicesForProjectAction(projectId).then((result) => {
      if (!active) return
      setInvoices(result.invoices)
      setMessage(result.success ? '' : result.message || 'Não foi possível consultar as notas fiscais.')
    }).catch(() => { if (active) setMessage('Não foi possível consultar as notas fiscais.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [projectId])
  async function download(invoiceId: string, format: 'pdf' | 'xml') {
    setBusy(invoiceId)
    try {
      const result = await downloadFiscalInvoiceAction(invoiceId, format)
      if (result.success && result.signedUrl) window.open(result.signedUrl, '_blank', 'noopener,noreferrer')
      else setMessage(result.message || 'Arquivo fiscal indisponível.')
    } catch { setMessage('Não foi possível baixar o arquivo fiscal.') } finally { setBusy(null) }
  }
  async function retry(invoiceId: string) {
    setBusy(invoiceId)
    try {
      const result = await retryFiscalInvoiceAction(invoiceId)
      setMessage(result.message || (result.success ? 'Nova tentativa solicitada.' : 'Não foi possível solicitar nova tentativa.'))
      if (result.success) { const refreshed = await getFiscalInvoicesForProjectAction(projectId); if (refreshed.success) setInvoices(refreshed.invoices) }
    } catch { setMessage('Não foi possível solicitar nova tentativa.') } finally { setBusy(null) }
  }
  return <div className="space-y-4 text-xs">
    <h4 className="text-sm font-extrabold">Fiscal do projeto</h4>
    {message && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">{message}</p>}
    {loading ? <p className="text-slate-500">Consultando notas fiscais...</p> : invoices.length === 0 ? <p className="rounded-xl border border-dashed border-slate-200 p-5 text-slate-500">Nenhuma nota fiscal vinculada ao projeto.</p> : invoices.map((invoice) => <div key={invoice.id} className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex items-center justify-between gap-3"><strong>NFS-e {invoice.invoice_number || ''}</strong><span className="rounded-full bg-slate-100 px-2 py-1 font-bold dark:bg-slate-800">{invoice.status === 'error' && invoice.issued_at ? 'Autorizada · Documentos pendentes' : labels[invoice.status]}</span></div>
      <p>Valor: {invoice.amount == null ? 'Ainda não definido' : (invoice.amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
      <p className="text-slate-500">Emissão: {invoice.issued_at ? new Date(invoice.issued_at).toLocaleDateString('pt-BR') : 'Ainda não emitida'} · Competência: {invoice.competence_date ? new Date(`${invoice.competence_date}T12:00:00`).toLocaleDateString('pt-BR') : 'Ainda não definida'}</p>
      {invoice.verification_code && <p>Código de verificação: {invoice.verification_code}</p>}
      {invoice.error_message && <p className="text-rose-700 dark:text-rose-300">{invoice.error_message}</p>}
      <div className="flex flex-wrap gap-2">
        {invoice.pdf_path && <button type="button" disabled={busy === invoice.id} onClick={() => void download(invoice.id, 'pdf')} className="rounded-lg border border-slate-300 px-3 py-2 font-bold disabled:opacity-50">Baixar PDF</button>}
        {invoice.xml_path && <button type="button" disabled={busy === invoice.id} onClick={() => void download(invoice.id, 'xml')} className="rounded-lg border border-slate-300 px-3 py-2 font-bold disabled:opacity-50">Baixar XML</button>}
        {canRetry && ['error','rejected','blocked'].includes(invoice.status) && <button type="button" disabled={busy === invoice.id} onClick={() => void retry(invoice.id)} className="rounded-lg bg-[#2E3E4F] px-3 py-2 font-bold text-white disabled:opacity-50">Tentar novamente</button>}
      </div>
    </div>)}
  </div>
}
