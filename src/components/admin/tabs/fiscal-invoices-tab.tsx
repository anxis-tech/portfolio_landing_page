'use client'

import { useEffect, useState } from 'react'
import { createManualFiscalInvoiceAction, downloadFiscalInvoiceAction, getFiscalInvoiceListAction } from '@/lib/actions/fiscal'
import type { ClientProject } from '@/types/client-project.types'
import type { Contract } from '@/types/contract.types'
import type { FiscalInvoiceListItem, ManualFiscalInvoiceInput } from '@/modules/fiscal/types'

type Filters = { status?: string; source?: string; from?: string; to?: string }
const statusLabel: Record<string,string> = { pending: 'Pendente', configuration_required: 'Configuração necessária', processing: 'Em processamento', authorized: 'Autorizada', rejected: 'Rejeitada', error: 'Erro', cancelled: 'Cancelada', blocked: 'Aguardando configuração' }
const emptyClient: NonNullable<ManualFiscalInvoiceInput['client']> = { personType: 'pf', cpfCnpj: '', name: '', email: '', cep: '', address: '', number: '', complement: '', neighborhood: '', city: '', state: '' }
type Draft = { clientMode: 'manual' | 'project'; clientProjectId: string; projectId: string; contractId: string; client: NonNullable<ManualFiscalInvoiceInput['client']>; serviceDescription: string; amount: string; competenceDate: string }
const emptyDraft: Draft = { clientMode: 'manual', clientProjectId: '', projectId: '', contractId: '', client: emptyClient, serviceDescription: '', amount: '', competenceDate: '' }
const currency = (amount: number | null) => amount == null ? 'Valor não definido' : (amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const localDate = (date: string | null) => date ? new Date(`${date.slice(0,10)}T12:00:00`).toLocaleDateString('pt-BR') : '—'
function newRequestKey() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 15) | 64
  bytes[8] = (bytes[8] & 63) | 128
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`
}

export function FiscalInvoicesTab({ projects, contracts, canView, canIssue }: { projects: ClientProject[]; contracts: Contract[]; canView: boolean; canIssue: boolean }) {
  const [section, setSection] = useState<'list' | 'issue'>(canView ? 'list' : 'issue')
  const visibleSection = section === 'list' && !canView ? 'issue' : section === 'issue' && !canIssue ? 'list' : section
  const [filters, setFilters] = useState<Filters>({})
  const [applied, setApplied] = useState<Filters>({})
  const [refresh, setRefresh] = useState(0)
  const [invoices, setInvoices] = useState<FiscalInvoiceListItem[]>([])
  const [listLoading, setListLoading] = useState(canView)
  const [listError, setListError] = useState('')
  const [truncated, setTruncated] = useState(false)
  const [draft, setDraft] = useState(emptyDraft)
  const [submitting, setSubmitting] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [fileMessage, setFileMessage] = useState('')
  const [requestKey, setRequestKey] = useState(newRequestKey)

  useEffect(() => {
    if (!canView) return
    let active = true
    void getFiscalInvoiceListAction(applied).then((result) => {
      if (!active) return
      if (result.success) { setInvoices(result.invoices); setTruncated(result.truncated); setListError('') }
      else setListError(result.message || 'Não foi possível carregar as notas fiscais.')
    }).catch(() => { if (active) setListError('Não foi possível carregar as notas fiscais.') }).finally(() => { if (active) setListLoading(false) })
    return () => { active = false }
  }, [applied, canView, refresh])

  const relatedProject = draft.projectId
  const availableContracts = contracts.filter((contract) => contract.project_id === relatedProject && !contract.voided_at)
  function updateDraft(next: Draft) { setFormMessage(''); setDraft(next) }
  function applyFilters(event: React.FormEvent) { event.preventDefault(); setListLoading(true); setApplied({ ...filters }) }

  async function issue(event: React.FormEvent) {
    event.preventDefault()
    if (submitting || !requestKey) return
    if (draft.clientMode === 'project' && !draft.clientProjectId) { setFormMessage('Selecione o projeto que contém os dados do tomador.'); return }
    if (draft.clientMode === 'manual' && !draft.client.cpfCnpj.trim()) { setFormMessage('Informe o CPF ou CNPJ do tomador.'); return }
    const payload: Omit<ManualFiscalInvoiceInput, 'idempotencyKey'> = {
      clientMode: draft.clientMode,
      ...(draft.clientMode === 'project' ? { clientProjectId: draft.clientProjectId } : { client: { ...draft.client, state: draft.client.state.toUpperCase() } }),
      serviceDescription: draft.serviceDescription.trim(), amount: draft.amount.trim(), competenceDate: draft.competenceDate,
      ...(draft.projectId ? { projectId: draft.projectId } : {}),
      ...(draft.contractId ? { contractId: draft.contractId } : {}),
    }
    setSubmitting(true)
    setFormMessage('')
    try {
      const result = await createManualFiscalInvoiceAction({ ...payload, idempotencyKey: requestKey } as ManualFiscalInvoiceInput)
      setFormMessage(result.message || (result.success ? 'Solicitação registrada.' : 'Não foi possível solicitar a emissão.'))
      if (result.success) { setRequestKey(newRequestKey()); setDraft(emptyDraft); setRefresh((value) => value + 1); setSection(canView ? 'list' : 'issue') }
    } catch { setFormMessage('Não foi possível solicitar a emissão. Tente novamente.') } finally { setSubmitting(false) }
  }

  async function download(invoiceId: string, kind: 'pdf' | 'xml') {
    try {
      const result = await downloadFiscalInvoiceAction(invoiceId, kind)
      if (result.success && result.signedUrl) window.open(result.signedUrl, '_blank', 'noopener,noreferrer')
      else setFileMessage(result.message || 'Arquivo indisponível.')
    } catch { setFileMessage('Arquivo indisponível.') }
  }

  const field = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
  return <div className="space-y-5 text-xs">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800"><div><h2 className="text-lg font-bold">Notas fiscais de serviço</h2><p className="mt-1 text-slate-500">Emissões automáticas e solicitações manuais. Fiscal Contora aguarda configuração para transmitir.</p></div>{canIssue && visibleSection === 'list' && <button type="button" onClick={() => setSection('issue')} className="rounded-lg bg-[#2E3E4F] px-4 py-2 font-bold text-white">Registrar NFS-e manual</button>}</div>
    {canView && canIssue && <div className="flex gap-2"><button type="button" onClick={() => setSection('list')} className={visibleSection === 'list' ? 'rounded-lg bg-[#2E3E4F] px-3 py-2 font-bold text-white' : 'rounded-lg border border-slate-200 px-3 py-2 font-bold'}>Notas</button><button type="button" onClick={() => setSection('issue')} className={visibleSection === 'issue' ? 'rounded-lg bg-[#2E3E4F] px-3 py-2 font-bold text-white' : 'rounded-lg border border-slate-200 px-3 py-2 font-bold'}>Emissão manual</button></div>}
    {visibleSection === 'list' && canView && <>
      <form onSubmit={applyFilters} className="grid grid-cols-2 items-end gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700 sm:grid-cols-5">
        <label><span className="mb-1 block font-bold">Status</span><select aria-label="Filtrar status" value={filters.status || ''} onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })} className={field}><option value="">Todos</option>{Object.entries(statusLabel).map(([key,value]) => <option key={key} value={key}>{value}</option>)}</select></label>
        <label><span className="mb-1 block font-bold">Origem</span><select aria-label="Filtrar origem" value={filters.source || ''} onChange={(e) => setFilters({ ...filters, source: e.target.value || undefined })} className={field}><option value="">Todas</option><option value="automatic">Automática</option><option value="manual">Manual</option></select></label>
        <label><span className="mb-1 block font-bold">Competência de</span><input type="date" value={filters.from || ''} onChange={(e) => setFilters({ ...filters, from: e.target.value || undefined })} className={field} /></label>
        <label><span className="mb-1 block font-bold">Competência até</span><input type="date" min={filters.from} value={filters.to || ''} onChange={(e) => setFilters({ ...filters, to: e.target.value || undefined })} className={field} /></label>
        <button type="submit" className="rounded-lg border border-slate-300 px-3 py-2 font-bold dark:border-slate-600">Filtrar</button>
      </form>
      {truncated && <p role="status" className="rounded-lg border border-slate-200 p-3 text-slate-600 dark:border-slate-700">Exibindo as 200 notas mais recentes. Use os filtros para restringir o período.</p>}
      {listError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">{listError}</p>}
      {fileMessage && <p role="status" className="rounded-lg border border-amber-200 p-3 text-amber-700">{fileMessage}</p>}
      {formMessage && <p role="status" className="rounded-lg border border-emerald-200 p-3 text-emerald-700">{formMessage}</p>}
      {listLoading ? <p>Carregando notas fiscais...</p> : invoices.length === 0 ? <p className="rounded-xl border border-dashed border-slate-200 p-5 text-slate-500">Nenhuma nota fiscal encontrada.</p> : <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700"><table className="min-w-full text-left"><thead className="bg-slate-50 text-slate-500 dark:bg-slate-800"><tr>{['Tomador','Serviço','Valor','Origem','Status','Competência','Emissão','Arquivos'].map((label) => <th key={label} className="px-3 py-2 font-bold">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{invoices.map((invoice) => <tr key={invoice.id}><td className="px-3 py-3 font-semibold">{invoice.clientName || 'Tomador não informado'}</td><td className="max-w-52 px-3 py-3">{invoice.service_description || 'Descrição não informada'}</td><td className="whitespace-nowrap px-3 py-3">{currency(invoice.amount)}</td><td className="px-3 py-3">{invoice.source === 'manual' ? 'Manual' : 'Automática'}</td><td className="px-3 py-3">{statusLabel[invoice.status] || invoice.status}{invoice.invoice_number && <span className="block text-slate-500">Nº {invoice.invoice_number}</span>}</td><td className="whitespace-nowrap px-3 py-3">{localDate(invoice.competence_date)}</td><td className="whitespace-nowrap px-3 py-3">{localDate(invoice.issued_at)}</td><td className="whitespace-nowrap px-3 py-3">{invoice.pdf_path && <button type="button" onClick={() => void download(invoice.id, 'pdf')} className="mr-2 font-bold text-sky-700">PDF</button>}{invoice.xml_path && <button type="button" onClick={() => void download(invoice.id, 'xml')} className="font-bold text-sky-700">XML</button>}{!invoice.pdf_path && !invoice.xml_path && '—'}</td></tr>)}</tbody></table></div>}
    </>}
    {visibleSection === 'issue' && canIssue && <form onSubmit={(event) => void issue(event)} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#16181D]">
      <div><h3 className="text-sm font-bold">Registrar solicitação manual</h3><p className="mt-1 text-slate-500">A solicitação ficará aguardando a configuração da Fiscal Contora para transmissão. Projeto e contrato são vínculos opcionais.</p></div>
      <fieldset className="space-y-3"><legend className="mb-2 font-bold">Tomador</legend><div className="flex gap-4"><label className="flex items-center gap-2"><input type="radio" name="clientMode" checked={draft.clientMode === 'manual'} onChange={() => updateDraft({ ...draft, clientMode: 'manual', clientProjectId: '', projectId: '', contractId: '' })} />Informar manualmente</label><label className="flex items-center gap-2"><input type="radio" name="clientMode" checked={draft.clientMode === 'project'} onChange={() => updateDraft({ ...draft, clientMode: 'project' })} />Usar dados de projeto</label></div>
        {draft.clientMode === 'project' ? <label className="block max-w-lg"><span className="mb-1 block font-bold">Projeto do cliente *</span><select required value={draft.clientProjectId} onChange={(e) => updateDraft({ ...draft, clientProjectId: e.target.value, projectId: e.target.value, contractId: '' })} className={field}><option value="">Selecione</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.client_name} — {project.title}</option>)}</select></label> : <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label><span className="mb-1 block font-bold">Pessoa *</span><select value={draft.client.personType} onChange={(e) => updateDraft({ ...draft, client: { ...draft.client, personType: e.target.value as 'pf' | 'pj' } })} className={field}><option value="pf">Pessoa física</option><option value="pj">Pessoa jurídica</option></select></label>
          {([['cpfCnpj','CPF / CNPJ'],['name','Nome / razão social'],['email','E-mail'],['cep','CEP'],['address','Logradouro'],['number','Número'],['complement','Complemento'],['neighborhood','Bairro'],['city','Cidade'],['state','UF']] as const).map(([key,label]) => <label key={key}><span className="mb-1 block font-bold">{label}{key !== 'complement' ? ' *' : ''}</span><input required={key !== 'complement'} type={key === 'email' ? 'email' : 'text'} maxLength={key === 'state' ? 2 : undefined} value={draft.client[key]} onChange={(e) => updateDraft({ ...draft, client: { ...draft.client, [key]: key === 'state' ? e.target.value.toUpperCase() : e.target.value } })} className={field} /></label>)}
        </div>}
      </fieldset>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><label className="sm:col-span-3"><span className="mb-1 block font-bold">Descrição do serviço *</span><textarea required rows={3} value={draft.serviceDescription} onChange={(e) => updateDraft({ ...draft, serviceDescription: e.target.value })} className={field} /></label><label><span className="mb-1 block font-bold">Valor do serviço (R$) *</span><input required inputMode="decimal" placeholder="4.000,00" value={draft.amount} onChange={(e) => updateDraft({ ...draft, amount: e.target.value })} className={field} /></label><label><span className="mb-1 block font-bold">Competência *</span><input required type="date" value={draft.competenceDate} onChange={(e) => updateDraft({ ...draft, competenceDate: e.target.value })} className={field} /></label></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><label><span className="mb-1 block font-bold">Vincular ao projeto (opcional)</span><select value={draft.projectId} onChange={(e) => updateDraft({ ...draft, projectId: e.target.value, contractId: '' })} className={field}><option value="">Sem vínculo</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></label><label><span className="mb-1 block font-bold">Contrato (opcional)</span><select disabled={!relatedProject} value={draft.contractId} onChange={(e) => updateDraft({ ...draft, contractId: e.target.value })} className={field}><option value="">Sem vínculo</option>{availableContracts.map((contract) => <option key={contract.id} value={contract.id}>Versão {contract.version}</option>)}</select></label></div>
      {formMessage && <p role="status" className="rounded-lg border border-slate-200 p-3">{formMessage}</p>}
      <div className="flex justify-end"><button type="submit" disabled={submitting || !requestKey} className="rounded-lg bg-[#2E3E4F] px-4 py-2.5 font-bold text-white disabled:opacity-50">{submitting ? 'Solicitando...' : 'Registrar solicitação'}</button></div>
    </form>}
  </div>
}
