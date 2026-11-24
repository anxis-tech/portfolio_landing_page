'use client'

import React, { useEffect, useState, useMemo } from 'react'
import {
  createManualFiscalInvoiceAction,
  downloadFiscalInvoiceAction,
  getFiscalInvoiceListAction,
} from '@/lib/actions/fiscal'
import type { ClientProject } from '@/types/client-project.types'
import type { Contract } from '@/types/contract.types'
import type { FiscalInvoiceListItem, ManualFiscalInvoiceInput } from '@/modules/fiscal/types'
import { MOCK_FISCAL_INVOICES, MOCK_CLIENT_PROJECTS } from '@/components/admin/mock-crm-data'
import { cn } from '@/lib/utils'
import { notify } from '@/components/admin/ui/notifications'
import {
  FileText,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  PlusCircle,
  Search,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react'

type Filters = { status?: string; source?: string; search?: string }

const currency = (amount: number | null) =>
  amount == null ? 'R$ 0,00' : (amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const localDate = (date: string | null) =>
  date ? new Date(date).toLocaleDateString('pt-BR') : '—'

export function FiscalInvoicesTab({
  projects = MOCK_CLIENT_PROJECTS,
  contracts = [],
  canView = true,
  canIssue = true,
}: {
  projects: ClientProject[]
  contracts: Contract[]
  canView: boolean
  canIssue: boolean
}) {
  const [section, setSection] = useState<'list' | 'issue'>('list')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [invoices, setInvoices] = useState<FiscalInvoiceListItem[]>(() => MOCK_FISCAL_INVOICES)
  const [listLoading, setListLoading] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  // Form State for Manual NFS-e
  const [draft, setDraft] = useState({
    clientMode: 'project' as 'manual' | 'project',
    clientProjectId: '',
    clientName: '',
    cpfCnpj: '',
    email: '',
    serviceDescription: '',
    amount: '',
    competenceDate: new Date().toISOString().slice(0, 10),
  })
  const [submitting, setSubmitting] = useState(false)

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'authorized' && inv.status === 'authorized') ||
        (filterStatus === 'processing' && inv.status === 'processing') ||
        (filterStatus === 'manual' && inv.source === 'manual') ||
        (filterStatus === 'automatic' && inv.source === 'automatic')

      const term = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !term ||
        inv.clientName.toLowerCase().includes(term) ||
        (inv.service_description && inv.service_description.toLowerCase().includes(term)) ||
        (inv.invoice_number && inv.invoice_number.toLowerCase().includes(term))

      return matchesStatus && matchesSearch
    })
  }, [invoices, filterStatus, searchTerm])

  const totals = useMemo(() => {
    const totalAmount = invoices
      .filter((i) => i.status === 'authorized')
      .reduce((acc, i) => acc + (i.amount || 0), 0)
    const authorizedCount = invoices.filter((i) => i.status === 'authorized').length
    const processingCount = invoices.filter((i) => i.status === 'processing').length
    const totalTax = Math.round(totalAmount * 0.05) // ISS 5%

    return { totalAmount, authorizedCount, processingCount, totalTax }
  }, [invoices])

  const handleDownload = (invoiceNumber: string | null, format: 'pdf' | 'xml') => {
    notify.success(`Download do arquivo ${format.toUpperCase()} da NFS-e ${invoiceNumber || ''} iniciado!`)
  }

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    let finalClientName = draft.clientName
    if (draft.clientMode === 'project' && draft.clientProjectId) {
      const p = projects.find((proj) => proj.id === draft.clientProjectId)
      if (p) finalClientName = `${p.client_name} — ${p.title}`
    }

    const cleanAmount = Math.round(parseFloat(draft.amount.replace(/\./g, '').replace(',', '.')) * 100) || 350000

    setTimeout(() => {
      const newInv: FiscalInvoiceListItem = {
        id: `inv-${Date.now()}`,
        project_id: draft.clientProjectId || null,
        contract_id: null,
        clientName: finalClientName || 'Cliente Direto',
        service_description: draft.serviceDescription || 'Serviços de desenvolvimento de software e web design',
        amount: cleanAmount,
        source: 'manual',
        status: 'processing',
        competence_date: draft.competenceDate,
        issued_at: new Date().toISOString(),
        invoice_number: `2026/00${143 + invoices.length}`,
        verification_code: 'F81C-99B2',
        pdf_path: null,
        xml_path: null,
        created_at: new Date().toISOString(),
      }

      setInvoices((prev) => [newInv, ...prev])
      setSubmitting(false)
      notify.success(`Solicitação de NFS-e nº ${newInv.invoice_number} registrada com sucesso!`)
      setSection('list')
    }, 600)
  }

  const fieldClass =
    'h-9 w-full rounded-lg border border-crm-border bg-crm-canvas px-3 text-xs text-crm-fg shadow-xs outline-none transition-colors placeholder:text-crm-subtle focus:border-crm-accent'

  return (
    <div className="space-y-6">
      {/* 1. CARDS DE MÉTRICAS FISCAIS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-crm-border bg-crm-surface">
          <span className="text-[11px] font-mono text-crm-subtle uppercase block">Total Emitido (NFS-e)</span>
          <span className="text-xl font-bold font-mono text-crm-fg mt-1 block">
            {currency(totals.totalAmount)}
          </span>
          <span className="text-[11px] text-crm-subtle mt-0.5 block">Transmitidas e homologadas</span>
        </div>
        <div className="p-4 rounded-xl border border-crm-border bg-crm-surface">
          <span className="text-[11px] font-mono text-crm-subtle uppercase block">Notas Autorizadas</span>
          <span className="text-xl font-bold font-mono text-emerald-500 mt-1 block">
            {totals.authorizedCount} notas
          </span>
          <span className="text-[11px] text-crm-subtle mt-0.5 block">100% validadas na prefeitura</span>
        </div>
        <div className="p-4 rounded-xl border border-crm-border bg-crm-surface">
          <span className="text-[11px] font-mono text-crm-subtle uppercase block">Em Processamento</span>
          <span className="text-xl font-bold font-mono text-amber-500 mt-1 block">
            {totals.processingCount} nota
          </span>
          <span className="text-[11px] text-crm-subtle mt-0.5 block">Aguardando lote Contora</span>
        </div>
        <div className="p-4 rounded-xl border border-crm-border bg-crm-surface">
          <span className="text-[11px] font-mono text-crm-subtle uppercase block">ISS Retido / Apurado (5%)</span>
          <span className="text-xl font-bold font-mono text-crm-accent mt-1 block">
            {currency(totals.totalTax)}
          </span>
          <span className="text-[11px] text-crm-subtle mt-0.5 block">Tributação Simples Nacional</span>
        </div>
      </div>

      {/* 2. SUB-BARRA DE AÇÕES (TABELA VS SOLICITAÇÃO MANUAL) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-crm-border bg-crm-surface">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSection('list')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
              section === 'list'
                ? 'bg-crm-accent text-white shadow-xs font-semibold'
                : 'text-crm-muted hover:text-crm-fg hover:bg-crm-canvas'
            )}
          >
            <FileText size={14} />
            <span>Consultar Notas ({invoices.length})</span>
          </button>
          {canIssue && (
            <button
              type="button"
              onClick={() => setSection('issue')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
                section === 'issue'
                  ? 'bg-crm-accent text-white shadow-xs font-semibold'
                  : 'text-crm-muted hover:text-crm-fg hover:bg-crm-canvas'
              )}
            >
              <PlusCircle size={14} />
              <span>Registrar Solicitação Manual</span>
            </button>
          )}
        </div>

        {section === 'list' && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-full sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-crm-subtle pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar tomador ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-crm-canvas border border-crm-border text-xs text-crm-fg placeholder:text-crm-subtle focus:outline-hidden focus:border-crm-accent"
              />
            </div>

            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'authorized', label: 'Autorizadas' },
                { id: 'processing', label: 'Em processamento' },
                { id: 'manual', label: 'Manual' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setFilterStatus(pill.id)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border',
                    filterStatus === pill.id
                      ? 'bg-crm-primary text-white border-crm-primary'
                      : 'border-crm-border text-crm-muted hover:text-crm-fg hover:bg-crm-canvas'
                  )}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. VISÃO: TABELA DE NOTAS FISCAIS */}
      {section === 'list' && (
        <div className="rounded-2xl border border-crm-border bg-crm-surface overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[850px]">
              <thead className="bg-crm-surface-2 border-b border-crm-border text-crm-subtle font-mono uppercase text-[10.5px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Tomador & Razão Social</th>
                  <th className="py-3 px-4 font-semibold">Descrição do Serviço</th>
                  <th className="py-3 px-4 font-semibold">Valor Bruto</th>
                  <th className="py-3 px-4 font-semibold">Origem</th>
                  <th className="py-3 px-4 font-semibold">Status & Nº</th>
                  <th className="py-3 px-4 font-semibold">Competência</th>
                  <th className="py-3 px-4 font-semibold">Emissão</th>
                  <th className="py-3 px-4 text-right font-semibold">Arquivos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-crm-border text-crm-fg">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-crm-surface-2/60">
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="font-semibold text-xs text-crm-fg truncate">{inv.clientName}</div>
                      <div className="text-[11px] font-mono text-crm-subtle mt-0.5">
                        {inv.project_id ? `Vínculo: ${inv.project_id}` : 'Tomador avulso'}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-[260px]">
                      <div className="text-xs text-crm-muted line-clamp-2 leading-relaxed">
                        {inv.service_description || 'Serviços de desenvolvimento e tecnologia'}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold font-mono text-crm-fg">{currency(inv.amount)}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase border border-crm-border bg-crm-canvas text-crm-muted">
                        {inv.source === 'automatic' ? 'Automática' : 'Manual'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        {inv.status === 'authorized' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 size={12} /> Autorizada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            <Clock size={12} /> Em processamento
                          </span>
                        )}
                        {inv.invoice_number && (
                          <span className="text-[10px] font-mono text-crm-subtle">
                            Nº {inv.invoice_number}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-crm-subtle text-[11.5px]">
                      {localDate(inv.competence_date)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-crm-subtle text-[11.5px]">
                      {localDate(inv.issued_at)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {inv.pdf_path ? (
                          <button
                            type="button"
                            onClick={() => handleDownload(inv.invoice_number, 'pdf')}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-crm-canvas hover:bg-crm-surface-2 border border-crm-border text-xs font-semibold text-crm-fg transition-colors"
                            title="Baixar PDF"
                          >
                            <Download size={11} /> PDF
                          </button>
                        ) : (
                          <span className="text-[11px] text-crm-subtle">Gerando...</span>
                        )}
                        {inv.xml_path && (
                          <button
                            type="button"
                            onClick={() => handleDownload(inv.invoice_number, 'xml')}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-crm-canvas hover:bg-crm-surface-2 border border-crm-border text-xs font-semibold text-crm-subtle hover:text-crm-fg transition-colors"
                            title="Baixar XML"
                          >
                            XML
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. VISÃO: REGISTRAR NOVA SOLICITAÇÃO MANUAL */}
      {section === 'issue' && canIssue && (
        <form onSubmit={handleIssueSubmit} className="rounded-2xl border border-crm-border bg-crm-surface p-5 sm:p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-crm-fg">Registrar solicitação de NFS-e</h3>
            <p className="text-xs text-crm-muted mt-0.5">
              A nota será gerada com os parâmetros municipais da ANXIS e vinculada ao financeiro.
            </p>
          </div>

          <fieldset className="space-y-4">
            <legend className="text-xs font-bold uppercase tracking-wider text-crm-subtle mb-2">Dados do Tomador</legend>
            <div className="flex gap-4 text-xs font-medium text-crm-fg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="clientMode"
                  checked={draft.clientMode === 'project'}
                  onChange={() => setDraft((prev) => ({ ...prev, clientMode: 'project' }))}
                />
                Vincular a projeto existente
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="clientMode"
                  checked={draft.clientMode === 'manual'}
                  onChange={() => setDraft((prev) => ({ ...prev, clientMode: 'manual', clientProjectId: '' }))}
                />
                Informar cliente avulso
              </label>
            </div>

            {draft.clientMode === 'project' ? (
              <div className="max-w-md">
                <label className="block text-xs font-semibold text-crm-fg mb-1">Projeto do cliente *</label>
                <select
                  required
                  value={draft.clientProjectId}
                  onChange={(e) => {
                    const pid = e.target.value
                    const found = projects.find((p) => p.id === pid)
                    setDraft((prev) => ({
                      ...prev,
                      clientProjectId: pid,
                      clientName: found ? `${found.client_name} (${found.company || 'PJ'})` : '',
                      amount: found ? String(found.approved_value || '3500') : '3500',
                    }))
                  }}
                  className={fieldClass}
                >
                  <option value="">Selecione o projeto</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.client_name} — {p.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-crm-fg mb-1">Nome / Razão Social *</label>
                  <input
                    required
                    type="text"
                    placeholder="Empresa Exemplo Ltda"
                    value={draft.clientName}
                    onChange={(e) => setDraft((prev) => ({ ...prev, clientName: e.target.value }))}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-crm-fg mb-1">CPF / CNPJ *</label>
                  <input
                    required
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={draft.cpfCnpj}
                    onChange={(e) => setDraft((prev) => ({ ...prev, cpfCnpj: e.target.value }))}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-crm-fg mb-1">E-mail do Tomador *</label>
                  <input
                    required
                    type="email"
                    placeholder="financeiro@empresa.com.br"
                    value={draft.email}
                    onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
                    className={fieldClass}
                  />
                </div>
              </div>
            )}
          </fieldset>

          <div className="space-y-4 pt-2 border-t border-crm-border">
            <div>
              <label className="block text-xs font-semibold text-crm-fg mb-1">Descrição do Serviço (NFS-e) *</label>
              <textarea
                required
                rows={2}
                placeholder="Desenvolvimento de software sob medida, landing page responsiva e consultoria técnica."
                value={draft.serviceDescription}
                onChange={(e) => setDraft((prev) => ({ ...prev, serviceDescription: e.target.value }))}
                className="w-full rounded-lg border border-crm-border bg-crm-canvas p-3 text-xs text-crm-fg shadow-xs outline-none transition-colors placeholder:text-crm-subtle focus:border-crm-accent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-crm-fg mb-1">Valor do Serviço (R$) *</label>
                <input
                  required
                  type="text"
                  placeholder="3.500,00"
                  value={draft.amount}
                  onChange={(e) => setDraft((prev) => ({ ...prev, amount: e.target.value }))}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-crm-fg mb-1">Data de Competência *</label>
                <input
                  required
                  type="date"
                  value={draft.competenceDate}
                  onChange={(e) => setDraft((prev) => ({ ...prev, competenceDate: e.target.value }))}
                  className={fieldClass}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-crm-border">
            <button
              type="button"
              onClick={() => setSection('list')}
              className="px-4 py-2 rounded-lg border border-crm-border text-xs font-medium text-crm-muted hover:text-crm-fg hover:bg-crm-canvas transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-crm-accent text-white text-xs font-semibold shadow-xs hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-1.5"
            >
              {submitting ? 'Registrando...' : 'Emitir Solicitação de NFS-e'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
