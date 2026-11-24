'use client'

// Módulo Leads: contatos que chegaram pelo WhatsApp vindos de anúncios da Meta,
// de empresas da Prospecção que responderam ou de formulários do site.

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { Badge, EmptyState, Panel, Segmented, SkeletonRows, StatCard, type Tone } from '@/components/admin/ui/kit'
import { MessageCircle, Phone, Search, X } from '@/components/admin/ui/icons'
import { ContactAvatar } from '@/components/admin/conversations/contact-avatar'
import { PREVIEW_LEADS, formatDateTime, formatMoney, type LeadIntent, type LeadStatus } from './preview-data'
import { readSessionCache, writeSessionCache } from '@/lib/session-cache'
export type MarketingLeadItem = (typeof PREVIEW_LEADS)[number]

const LEADS_CACHE_KEY = 'leads'

const STATUSES: LeadStatus[] = ['Novo', 'Em contato', 'Orçamento', 'Fechado', 'Perdido']
const STATUS_TONE: Record<LeadStatus, Tone> = { Novo: 'accent', 'Em contato': 'violet', Orçamento: 'warning', Fechado: 'success', Perdido: 'neutral' }
const INTENT: Record<NonNullable<LeadIntent>, { label: string; tone: Tone }> = {
  qualified: { label: 'Interessado', tone: 'success' },
  not_interested: { label: 'Sem interesse', tone: 'danger' },
  unclear: { label: 'Indefinido', tone: 'warning' },
  auto_reply: { label: 'Resposta automática', tone: 'neutral' },
}

type Origin = 'all' | 'ads' | 'prospecting'

export function LeadsTab({
  onOpenConversations,
  initialLeadId,
}: {
  onOpenConversations?: (conversationId?: string) => void
  initialLeadId?: string | null
}) {
  const [leads, setLeads] = useState<MarketingLeadItem[]>(() => readSessionCache<MarketingLeadItem[]>(LEADS_CACHE_KEY) ?? (PREVIEW_LEADS as MarketingLeadItem[]))
  // With cached leads from this browser tab there is nothing to wait for; the read refreshes them.
  const [isLoading, setIsLoading] = useState(() => readSessionCache(LEADS_CACHE_KEY) === undefined)
  const [origin, setOrigin] = useState<Origin>('all')
  const [status, setStatus] = useState<'all' | LeadStatus>('all')
  const [search, setSearch] = useState('')
  const [openId, setOpenId] = useState<string | null>(initialLeadId || null)
  const [, startTransition] = useTransition()

  const loadLeads = useCallback(async () => {
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  useEffect(() => {
    if (initialLeadId) setOpenId(initialLeadId)
  }, [initialLeadId])

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase()
    return leads.filter((l) =>
      (origin === 'all' || l.origin.kind === origin) &&
      (status === 'all' || l.status === status) &&
      (!term || [l.name, l.company, l.phone].some((v) => v.toLowerCase().includes(term))))
  }, [leads, origin, status, search])

  const count = (s: LeadStatus) => leads.filter((l) => l.status === s).length
  const fromAds = leads.filter((l) => l.origin.kind === 'ads').length
  const closed = leads.filter((l) => l.status === 'Fechado')
  const open = leads.find((l) => l.id === openId) ?? null

  const handleStatusChange = (newStatus: LeadStatus) => {
    if (!open) return
    const leadId = open.id
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)))
    // Local state updated
  }

  return (
    <div className="space-y-6 font-sans text-crm-fg">
      <div>
        <h1 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[22px] font-semibold tracking-[-0.025em]">
          <span>Leads <span className="text-crm-subtle">quem chamou no WhatsApp.</span></span>
        </h1>
        <p className="mt-1 text-[13px] text-crm-subtle">
          Contatos gerados automaticamente a partir de anúncios da Meta e respostas na Prospecção.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard loading={isLoading} label="Total de leads" value={String(leads.length)} hint={`${fromAds} vindos de anúncios da Meta`} tone="accent" />
        <StatCard loading={isLoading} label="Novos / Em contato" value={String(count('Novo') + count('Em contato'))} hint={`${count('Novo')} novos aguardando resposta`} />
        <StatCard loading={isLoading} label="Em orçamento" value={String(count('Orçamento'))} hint="Proposta enviada" tone="violet" />
        <StatCard loading={isLoading} label="Fechados" value={String(closed.length)} hint={formatMoney(closed.reduce((acc, l) => acc + (l.value ?? 0), 0))} tone="success" />
      </div>

      <Panel
        title="Todos os leads"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Segmented id="leads-origin" size="sm" value={origin} onChange={(v: string) => setOrigin(v as Origin)} options={[
              { value: "all", label: "Todos" },
              { value: "ads", label: "Campanhas" },
              { value: "prospecting", label: "Prospecção" },
            ]} />
            <Segmented id="leads-status" size="sm" value={status} onChange={(v: string) => setStatus(v as any)} className="flex-wrap" options={[
              { value: "all", label: "Todos" },
              ...STATUSES.map((s) => ({ value: s, label: s })),
            ]} />
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-crm-subtle" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome, empresa ou telefone" className="h-8 w-56 rounded-lg border border-crm-border bg-crm-surface pl-8 pr-3 text-[12.5px] outline-none placeholder:text-crm-subtle" />
            </div>
          </div>
        }>
        {isLoading ? (
          <SkeletonRows />
        ) : shown.length === 0 ? (
          <EmptyState title="Nenhum lead com esses filtros" description="Mude a origem, o status ou a busca." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-crm-border text-[11.5px] text-crm-subtle">
                  <th className="px-5 py-2.5 font-medium">Lead</th>
                  <th className="px-3 py-2.5 font-medium">Origem</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">IA</th>
                  <th className="px-3 py-2.5 font-medium">Última mensagem</th>
                  <th className="px-5 py-2.5 font-medium">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-crm-border">
                {shown.map((l) => (
                  <tr key={l.id} onClick={() => setOpenId(l.id)} className="cursor-pointer transition-colors hover:bg-crm-surface-2">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <ContactAvatar name={l.name} className="h-8 w-8" />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{l.name}</p>
                          <p className="truncate text-[12px] text-crm-subtle">{l.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3"><OriginLabel lead={l} /></td>
                    <td className="px-3 py-3"><Badge tone={STATUS_TONE[l.status]} dot>{l.status}</Badge></td>
                    <td className="px-3 py-3">{l.intent ? <Badge tone={INTENT[l.intent].tone}>{INTENT[l.intent].label}</Badge> : <span className="text-crm-subtle">—</span>}</td>
                    <td className="max-w-[280px] px-3 py-3">
                      <p className="truncate text-crm-muted">{l.lastMessage}</p>
                      <p className="text-[11.5px] text-crm-subtle">{formatDateTime(l.lastMessageAt)}</p>
                    </td>
                    <td className="px-5 py-3 text-crm-muted">{l.assignee ?? <span className="text-crm-subtle">Não atribuído</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {open && (
        <LeadDrawer
          lead={open}
          onClose={() => setOpenId(null)}
          onStatus={handleStatusChange}
          onOpenConversations={() => onOpenConversations?.(open.whatsappConversationId ?? undefined)}
        />
      )}
    </div>
  )
}

function OriginLabel({ lead }: { lead: MarketingLeadItem }) {
  return lead.origin.kind === 'ads' ? (
    <div className="min-w-0">
      <Badge tone="accent">Anúncio</Badge>
      <p className="mt-1 max-w-[220px] truncate text-[12px] text-crm-subtle">{lead.origin.campaign}</p>
    </div>
  ) : lead.origin.kind === 'prospecting' ? (
    <div className="min-w-0">
      <Badge tone="violet">Prospecção</Badge>
      <p className="mt-1 max-w-[220px] truncate text-[12px] text-crm-subtle">{lead.origin.campaign}</p>
    </div>
  ) : (
    <div className="min-w-0">
      <Badge tone="neutral">Site</Badge>
      <p className="mt-1 max-w-[220px] truncate text-[12px] text-crm-subtle">{lead.origin.campaign}</p>
    </div>
  )
}

function LeadDrawer({
  lead,
  onClose,
  onStatus,
  onOpenConversations,
}: {
  lead: MarketingLeadItem
  onClose: () => void
  onStatus: (s: LeadStatus) => void
  onOpenConversations?: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="flex h-full w-full max-w-md flex-col border-l border-crm-border bg-crm-surface shadow-2xl animate-in slide-in-from-right duration-200">
        <header className="flex items-start gap-3 border-b border-crm-border p-5">
          <ContactAvatar name={lead.name} className="h-10 w-10 text-sm" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[15px] font-semibold">{lead.name}</h2>
            <p className="truncate text-[12.5px] text-crm-subtle">{lead.company}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-crm-subtle hover:bg-crm-surface-3 hover:text-crm-fg" aria-label="Fechar">
            <X size={16} />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <div className="space-y-2">
            <p className="text-[12.5px] font-medium">Etapa</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onStatus(s)}
                  className={cn('rounded-lg border px-2.5 py-1 text-[12px] font-medium transition-colors', lead.status === s ? 'border-crm-fg bg-crm-fg text-crm-surface' : 'border-crm-border text-crm-muted hover:bg-crm-surface-2')}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <dl className="space-y-2.5 rounded-xl border border-crm-border p-4 text-[13px]">
            <div className="flex gap-3"><dt className="w-24 shrink-0 text-crm-subtle">Telefone</dt><dd className="flex items-center gap-1.5 font-mono"><Phone size={12} className="text-crm-subtle" />{lead.phone}</dd></div>
            <div className="flex gap-3"><dt className="w-24 shrink-0 text-crm-subtle">Origem</dt><dd className="min-w-0">{lead.origin.kind === 'ads' ? `Anúncio "${lead.origin.ad}"` : lead.origin.kind === 'prospecting' ? 'Prospecção' : 'Site'}<span className="block text-[12px] text-crm-subtle">{lead.origin.campaign}</span></dd></div>
            <div className="flex gap-3"><dt className="w-24 shrink-0 text-crm-subtle">Entrou em</dt><dd>{formatDateTime(lead.enteredAt)}</dd></div>
            <div className="flex gap-3"><dt className="w-24 shrink-0 text-crm-subtle">IA</dt><dd>{lead.intent ? INTENT[lead.intent].label : '—'}</dd></div>
            {lead.value && <div className="flex gap-3"><dt className="w-24 shrink-0 text-crm-subtle">Valor</dt><dd className="font-mono">{formatMoney(lead.value)}</dd></div>}
          </dl>

          <div className="space-y-2">
            <p className="text-[12.5px] font-medium">Última mensagem</p>
            <div className="rounded-2xl rounded-bl-md border border-crm-border bg-crm-surface-2 px-3.5 py-2.5 text-[13px] text-crm-fg">
              {lead.lastMessage}
              <p className="mt-1 text-right text-[11px] text-crm-subtle">{formatDateTime(lead.lastMessageAt)}</p>
            </div>
          </div>
        </div>

        <footer className="flex gap-2 border-t border-crm-border p-4">
          <button type="button" onClick={onOpenConversations} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-crm-fg text-[12.5px] font-medium text-crm-surface hover:opacity-90">
            <MessageCircle size={14} /> Abrir conversa
          </button>
        </footer>
      </aside>
    </div>
  )
}
