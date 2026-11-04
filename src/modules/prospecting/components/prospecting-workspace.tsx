'use client'
import { memo, useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  LoaderCircle,
  Mail,
  Pause,
  Play,
  RefreshCw,
  Search,
  Snowflake,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  campaignControlAction,
  createCampaignAction,
  getLeadRowAction,
  loadProspectingAction,
  refreshAggregatesAction,
} from '../actions'
import type { LeadFilters } from '../schemas/lead.schema'
import { segments, type Segment } from '../schemas/campaign.schema'
import {
  emptyMetrics,
  type Campaign,
  type Job,
  type LeadRow,
  type Metrics,
} from '../types/index'
import { CampaignForm } from './campaign-form'
import { LeadFiltersPanel } from './lead-filters'
import { ContactActions } from './contact-actions'
import { LeadDrawer } from './lead-drawer'
import { WhatsAppDrawer } from './whatsapp-drawer'
import { useWhatsAppSummaries } from '../hooks/use-whatsapp-summaries'
import { WhatsAppSummaryDTO } from '../types/whatsapp'
import { ProcessingDetailsModal } from './processing-details-modal'
import {
  buttonClass,
  dateLabel,
  getWebsiteDisplayStatus,
  inputClass,
  ClassificationBadge,
} from './shared'
import { LeadCommercialStatusBadge } from './lead-commercial-status-badge'
import { PAGE_SIZE } from '../repositories/lead.repository'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WorkspaceData = Extract<
  Awaited<ReturnType<typeof loadProspectingAction>>,
  { ok: true }
>['data']

const initialData: WorkspaceData = {
  campaigns: [],
  campaign: null,
  leads: [],
  total: 0,
  metrics: emptyMetrics,
  jobs: [],
}

// Aggregate data updated by the light poller (30 s), separate from the lead list.
interface AggregateState {
  campaign: Campaign | null
  metrics: Metrics
  jobs: Job[]
}

// ---------------------------------------------------------------------------
// Memoised table row — only re-renders when its own lead data, selection
// state or WhatsApp summary changes. Stable object reference equality is enough
// because getLeadRowAction returns a new object only when a field changed.
// ---------------------------------------------------------------------------

interface LeadRowProps {
  lead: LeadRow
  isSelected: boolean
  summary?: WhatsAppSummaryDTO
  onToggle: (id: string) => void
  onDetail: (id: string) => void
  onContact: (channel: 'WhatsApp' | 'E-mail') => void
  onWhatsApp?: (leadId: string) => void
}

const LeadTableRow = memo(function LeadTableRow({
  lead,
  isSelected,
  summary,
  onToggle,
  onDetail,
  onContact,
  onWhatsApp,
}: LeadRowProps) {
  return (
    <tr key={lead.id} className="hover:bg-slate-50/70">
      <td className="p-3">
        <input
          type="checkbox"
          aria-label={`Selecionar ${lead.name}`}
          checked={isSelected}
          onChange={() => onToggle(lead.id)}
        />
      </td>
      <td className="max-w-56 px-3 py-3">
        <button
          onClick={() => onDetail(lead.id)}
          className="text-left font-medium text-slate-800 hover:text-[#233141]"
        >
          {lead.name}
        </button>
        <p className="mt-1 text-[11px] text-slate-400">
          {segments[lead.segment as Segment]?.label ?? lead.segment}
          {lead.ai_analyzed && ' · IA'}
        </p>
      </td>
      <td className="whitespace-nowrap px-3">
        {lead.city ?? '—'}/{lead.state ?? '—'}
      </td>
      <td className="whitespace-nowrap px-3">
        <div className="flex flex-col items-start gap-1 [&>span]:font-medium">
          <ClassificationBadge lead={lead} />
          {lead.manually_discarded && (
            <span className="text-[10px] font-medium text-slate-500">Arquivado</span>
          )}
        </div>
      </td>
      <td className="px-3">{lead.rating ?? '—'}</td>
      <td className="px-3">{lead.reviews?.toLocaleString('pt-BR') ?? '—'}</td>
      <td className="whitespace-nowrap px-3">
        {(() => {
          const status = getWebsiteDisplayStatus(lead)
          const color =
            status === 'Site disponível'
              ? 'text-[#233141] font-medium'
              : status === 'Site indisponível'
                ? 'text-slate-600 font-medium'
                : 'text-slate-500'
          return <span className={color}>{status}</span>
        })()}
      </td>
      <td className="px-3">
        <ContactActions
          compact
          summary={summary}
          whatsAppDisabled={!summary?.hasCandidate && !summary?.hasConversation}
          onWhatsApp={onWhatsApp ? () => onWhatsApp(lead.id) : undefined}
          onEmail={() => onContact('E-mail')}
          onContact={onContact}
        />
      </td>
      <td className="whitespace-nowrap px-3 text-slate-500">
        {dateLabel(lead.last_contact_at)}
      </td>
      <td className="px-3">
        <LeadCommercialStatusBadge status={summary?.commercialStatus} />
      </td>
      <td className="px-3">
        <button
          className="font-medium text-[#233141] hover:underline"
          onClick={() => onDetail(lead.id)}
        >
          Detalhes
        </button>
      </td>
    </tr>
  )
},
// Custom comparator — avoids renders when nothing visible changed.
(prev, next) =>
  prev.lead === next.lead &&
  prev.isSelected === next.isSelected &&
  prev.summary === next.summary
)

// ---------------------------------------------------------------------------
// Main workspace
// ---------------------------------------------------------------------------

export function ProspectingWorkspace({ canManage }: { canManage: boolean }) {
  // ── Full data state (set on initial load and filter/page changes only) ───
  const [leads, setLeads] = useState<LeadRow[]>([])
  const [total, setTotal] = useState(0)
  const [campaigns, setCampaigns] = useState<WorkspaceData['campaigns']>([])

  // ── Aggregate state (set by light 30-s poller and after mutations) ───────
  const [agg, setAgg] = useState<AggregateState>({
    campaign: null,
    metrics: emptyMetrics,
    jobs: [],
  })

  // ── UI state ──────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<LeadFilters>({ page: 1, sort: 'classification' })
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [leadListRevision, setLeadListRevision] = useState(0)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [whatsAppLeadId, setWhatsAppLeadId] = useState<string | null>(null)
  const [whatsAppConvId, setWhatsAppConvId] = useState<string | null>(null)
  const [processingModalOpen, setProcessingModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, startTransition] = useTransition()

  const leadIds = useMemo(() => leads.map((l) => l.id), [leads])
  const { summaries: whatsappSummaries } = useWhatsAppSummaries(leadIds, leadListRevision)

  // ── Sequence counter — cancels stale async responses ─────────────────────
  const sequence = useRef(0)

  // ── Refs for cleanup ──────────────────────────────────────────────────────
  const realtimeChannelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const aggPollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Pending Realtime invalidation IDs (deduplication) ────────────────────
  // We batch rapid successive events for the same lead so we don't fire
  // multiple concurrent fetches for a single row.
  const filtersRef = useRef(filters)
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  const refetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // =========================================================================
  // Full load — campaigns + leads + metrics + jobs
  // Called on: mount, filter change, campaign change, pagination, manual refresh
  // =========================================================================
  const load = useCallback(async (filtersArg: LeadFilters) => {
    const current = ++sequence.current
    const result = await loadProspectingAction(filtersArg)
    if (current !== sequence.current) return   // superseded
    if (result.ok) {
      const d = result.data
      setCampaigns(d.campaigns)
      setLeads(d.leads)
      // Contact eligibility may change without changing the visible lead IDs.
      setLeadListRevision((revision) => revision + 1)
      setTotal(d.total)
      setAgg({ campaign: d.campaign, metrics: d.metrics, jobs: d.jobs })
      setSelected((prev) => new Set([...prev].filter((id) => d.leads.some((l) => l.id === id))))
      setError('')
    } else {
      setError(result.error)
    }
    setLoading(false)
  }, [])

  // =========================================================================
  // Light aggregate refresh — campaign status + metrics + jobs only
  // Does NOT touch the lead list. Called by the 30-s interval.
  // =========================================================================
  const refreshAggregates = useCallback(async (campaignId: string) => {
    const result = await refreshAggregatesAction(campaignId)
    if (result.ok) {
      setAgg((prev) => ({
        campaign: result.data.campaign,
        metrics: result.data.metrics,
        jobs: result.data.jobs,
      }))
    }
  }, [])

  // =========================================================================
  // Debounced active page refetch — preserves filters, sort, page and pageSize
  // Called when Realtime delivers events that may alter presence or classification order
  // =========================================================================
  const schedulePageRefetch = useCallback(() => {
    if (refetchTimerRef.current) {
      clearTimeout(refetchTimerRef.current)
    }
    refetchTimerRef.current = setTimeout(() => {
      startTransition(() => {
        void load(filtersRef.current)
      })
    }, 300)
  }, [load])

  // =========================================================================
  // Realtime subscription — scoped to the active campaign
  // =========================================================================
  const subscribeToLeads = useCallback((campaignId: string) => {
    // Remove previous channel before creating a new one.
    if (realtimeChannelRef.current) {
      createClient().removeChannel(realtimeChannelRef.current)
      realtimeChannelRef.current = null
    }

    const supabase = createClient()
    const channel = supabase
      .channel(`prospecting_leads:${campaignId}`)
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'prospecting_campaign_leads',
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => {
          // Invalidate and refetch active page with debounce, preserving filters & sort order
          schedulePageRefetch()
        }
      )
      .subscribe()

    realtimeChannelRef.current = channel
  }, [schedulePageRefetch])

  // =========================================================================
  // Light aggregate poller — 30 s, only while campaign is running
  // =========================================================================
  useEffect(() => {
    const campaignId = agg.campaign?.id
    const isRunning = agg.campaign?.status === 'running'

    if (aggPollRef.current) {
      clearInterval(aggPollRef.current)
      aggPollRef.current = null
    }

    if (!campaignId || !isRunning) return

    aggPollRef.current = setInterval(() => {
      startTransition(() => { void refreshAggregates(campaignId) })
    }, 30_000)

    return () => {
      if (aggPollRef.current) clearInterval(aggPollRef.current)
    }
  }, [agg.campaign?.id, agg.campaign?.status, refreshAggregates])

  // =========================================================================
  // Subscribe / unsubscribe when campaign changes
  // =========================================================================
  useEffect(() => {
    const campaignId = agg.campaign?.id
    if (!campaignId) return
    subscribeToLeads(campaignId)
  }, [agg.campaign?.id, subscribeToLeads])

  // =========================================================================
  // Initial load
  // =========================================================================
  useEffect(() => {
    setLoading(true)
    startTransition(() => { void load(filters) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only on mount; filter changes handled by changeFilters below.

  // =========================================================================
  // Global cleanup on unmount
  // =========================================================================
  useEffect(() => {
    return () => {
      if (realtimeChannelRef.current) {
        createClient().removeChannel(realtimeChannelRef.current)
      }
      if (aggPollRef.current) {
        clearInterval(aggPollRef.current)
      }
      if (refetchTimerRef.current) {
        clearTimeout(refetchTimerRef.current)
      }
      sequence.current++ // cancel any in-flight load()
    }
  }, [])

  // =========================================================================
  // Helpers
  // =========================================================================

  function changeFilters(next: LeadFilters) {
    setSelected(new Set())
    setFilters(next)
    setLoading(true)
    startTransition(() => { void load(next) })
  }

  const create = (raw: unknown) =>
    startTransition(async () => {
      const result = await createCampaignAction(raw)
      if (result.ok) {
        setNotice('Campanha criada. O worker iniciará a busca no próximo ciclo.')
        const next: LeadFilters = { page: 1, sort: 'classification', campaignId: result.data }
        setFilters(next)
        setLoading(true)
        await load(next)
      } else setError(result.error)
    })

  const controlCampaign = () =>
    startTransition(async () => {
      if (!agg.campaign) return
      const result = await campaignControlAction({
        id: agg.campaign.id,
        status: agg.campaign.status === 'paused' ? 'running' : 'paused',
      })
      if (!result.ok) {
        setError(result.error)
      } else {
        await refreshAggregates(agg.campaign.id)
      }
    })

  const contact = (channel: 'WhatsApp' | 'E-mail') =>
    setNotice(
      `${channel}: integração não configurada. Nenhuma mensagem foi enviada. ${selected.size ? `${selected.size} leads selecionados para uma futura campanha de contato.` : 'O envio por API oficial será habilitado em uma próxima etapa.'}`
    )

  const allChecked = leads.length > 0 && leads.every((l) => selected.has(l.id))

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const isCampaignProcessing = agg.campaign?.status === 'running'
  const collectionProgress =
    agg.campaign?.status === 'completed'
      ? 100
      : agg.campaign && agg.campaign.volume > 0
      ? Math.min(100, Math.round((agg.metrics.found / agg.campaign.volume) * 100))
      : 0
  const progressStatus =
    agg.campaign?.status === 'completed'
      ? 'Processamento concluído'
      : agg.campaign?.status === 'paused'
        ? 'Processamento pausado'
        : agg.campaign?.status === 'error'
          ? 'Processamento interrompido'
          : 'Processando leads...'

  // =========================================================================
  // Render
  // =========================================================================
  return (
    <div className="w-full font-sans text-[#182331]">
      <div className="mx-auto max-w-[1800px] space-y-5">
        <header className="border-b border-slate-200/80 pb-4">
          <h1 className="text-lg font-bold tracking-tight text-[#182331]">Leads</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Prospecção, qualificação e acompanhamento comercial.
          </p>
        </header>

        {/* Campaign form — static, never re-renders due to polling */}
        <CampaignForm
          disabled={!canManage || isCampaignProcessing}
          busy={busy}
          onCreate={create}
        />
        {!canManage && (
          <p className="text-xs text-slate-500">
            Acesso de leitura. Para criar campanhas e atualizar leads, solicite a permissão
            Gerenciar Prospecção.
          </p>
        )}

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <p>{error}</p>
            <button
              className={buttonClass}
              onClick={() => {
                setLoading(true)
                startTransition(() => { void load(filters) })
              }}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Notice banner */}
        {notice && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-lg border border-slate-300 bg-slate-100 p-3 text-sm text-slate-800"
          >
            <p>{notice}</p>
            <button onClick={() => setNotice('')} className="shrink-0 text-xs underline">
              Fechar
            </button>
          </div>
        )}

        {/* Active campaign */}
        <section
          aria-label="Campanha em acompanhamento"
          className="rounded-xl border border-slate-200 bg-[#FDFDFD] px-4 py-3"
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-sm font-semibold text-[#182331]">Campanha atual</h2>
            <label className="sr-only" htmlFor="current-campaign">
              Campanha
            </label>
            <select
              id="current-campaign"
              value={agg.campaign?.id ?? ''}
              onChange={(e) =>
                changeFilters({ campaignId: e.target.value, page: 1, sort: 'classification' })
              }
              className={`${inputClass} min-w-0 flex-1 font-medium sm:max-w-xl`}
              disabled={!campaigns.length}
            >
              <option value="" disabled>
                Nenhuma campanha
              </option>
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {segments[c.segment as Segment]?.label ?? c.segment} · {c.city}/{c.state} ·{' '}
                  {dateLabel(c.created_at)}
                </option>
              ))}
            </select>
            <div className="ml-auto flex items-center gap-2">
              {canManage &&
                agg.campaign &&
                ['running', 'paused'].includes(agg.campaign.status) && (
                  <button onClick={controlCampaign} disabled={busy} className={buttonClass}>
                    {agg.campaign.status === 'paused' ? <Play size={14} /> : <Pause size={14} />}
                    {agg.campaign.status === 'paused' ? 'Retomar' : 'Pausar'}
                  </button>
                )}
              <button
                title="Atualizar dados"
                aria-label="Atualizar dados"
                disabled={busy}
                onClick={() => {
                  setLoading(true)
                  startTransition(() => { void load(filters) })
                }}
                className={buttonClass}
              >
                <RefreshCw size={15} className={busy ? 'animate-spin' : ''} />
              </button>
              {agg.campaign && (
                <button
                  type="button"
                  onClick={() => setProcessingModalOpen(true)}
                  className="text-xs font-medium text-[#233141] hover:underline"
                >
                  Ver detalhes
                </button>
              )}
            </div>
          </div>
          {agg.campaign && (
            <div className="mt-4 grid gap-5 border-t border-slate-200 pt-3 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
              <div className="max-w-2xl">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{progressStatus}</span>
                  <span>{collectionProgress}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Progresso da coleta"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={collectionProgress}
                  className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
                >
                  <div
                    className="h-full rounded-full bg-[#233141] transition-[width]"
                    style={{ width: `${collectionProgress}%` }}
                  />
                </div>
              </div>
              <dl className="grid w-full grid-cols-2 border-y border-slate-200 lg:border-y-0 [&>div:nth-child(even)]:border-l [&>div:nth-child(even)]:border-slate-200">
                <div className="min-w-24 px-4 py-2">
                  <dt className="flex items-center gap-1 text-[11px] text-orange-700">
                    <Flame size={12} aria-hidden="true" /> Quentes
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-orange-700">{agg.metrics.hot}</dd>
                </div>
                <div className="min-w-28 px-4 py-2 pr-0">
                  <dt className="flex items-center gap-1 text-[11px] text-sky-700">
                    <Snowflake size={12} aria-hidden="true" /> Frios
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-sky-700">{agg.metrics.cold}</dd>
                </div>
                <div className="min-w-24 px-4 py-2">
                  <dt className="text-[11px] text-slate-500">Prontos</dt>
                  <dd className="mt-1 text-lg font-semibold text-[#182331]">{agg.metrics.ready}</dd>
                </div>
                <div className="min-w-28 px-4 py-2 pr-0">
                  <dt className="text-[11px] text-slate-500">Falhas técnicas</dt>
                  <dd className="mt-1 text-lg font-semibold text-[#182331]">{agg.metrics.failed}</dd>
                </div>
              </dl>
            </div>
          )}
        </section>

        {/* Filters — static structure, changeFilters triggers load() */}
        <LeadFiltersPanel filters={filters} onChange={changeFilters} />

        {/* Lead table */}
        <section
          aria-label="Leads encontrados"
          className="overflow-hidden"
        >
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-xs font-semibold text-slate-800">
                {selected.size} leads selecionados nesta página
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => contact('E-mail')}
              >
                <Mail size={13} />
                E-mail
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] border-collapse text-left text-xs">
              <thead className="border-b border-slate-200/80 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="p-3">
                    <input
                      type="checkbox"
                      aria-label="Selecionar todos os leads desta página"
                      checked={allChecked}
                      onChange={() =>
                        setSelected(allChecked ? new Set() : new Set(leads.map((l) => l.id)))
                      }
                    />
                  </th>
                  {[
                    'Empresa',
                    'Cidade',
                    'Classificação',
                    'Rating',
                    'Avaliações',
                    'Site',
                    'Contato',
                    'Último contato',
                    'Status comercial',
                    'Ações',
                  ].map((label) => (
                    <th key={label} className="whitespace-nowrap px-3 py-2.5 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <LeadTableRow
                    key={lead.id}
                    lead={lead}
                    isSelected={selected.has(lead.id)}
                    summary={whatsappSummaries[lead.id]}
                    onToggle={toggle}
                    onDetail={setDetailId}
                    onContact={contact}
                    onWhatsApp={(id) => setWhatsAppLeadId(id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {leads.length === 0 && (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3 px-5 py-10 text-center">
              {loading ? (
                <LoaderCircle className="animate-spin text-slate-400" size={24} />
              ) : (
                <Search className="text-slate-300" size={28} />
              )}
              <p className="font-medium text-slate-700">
                {loading
                  ? 'Carregando oportunidades…'
                  : error
                    ? 'Não foi possível carregar os leads.'
                    : !agg.campaign
                      ? 'Nenhuma campanha executada ainda.'
                      : 'Nenhum lead encontrado com esses filtros.'}
              </p>
              <p className="max-w-lg text-sm text-slate-500">
                {!agg.campaign
                  ? 'Selecione segmento e localização acima para encontrar suas primeiras oportunidades.'
                  : agg.campaign.status === 'running'
                    ? 'Os resultados aparecerão automaticamente conforme o processamento avançar.'
                    : 'Ajuste os filtros para consultar outras oportunidades.'}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
            <span>
              Página {filters.page} de {Math.max(1, Math.ceil(total / PAGE_SIZE))} · {total} leads
            </span>
            <div className="flex gap-2">
              <button
                aria-label="Página anterior"
                className={buttonClass}
                disabled={filters.page <= 1 || loading}
                onClick={() => changeFilters({ ...filters, page: filters.page - 1 })}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                aria-label="Próxima página"
                className={buttonClass}
                disabled={filters.page * PAGE_SIZE >= total || loading}
                onClick={() => changeFilters({ ...filters, page: filters.page + 1 })}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </section>

        <p className="text-xs text-slate-400">
          Dados de estabelecimentos fornecidos pelo Google Maps. Leads quentes: sem site, com
          contato válido e rede social encontrada.
        </p>
      </div>

      {detailId && (
        <LeadDrawer
          key={detailId}
          id={detailId}
          canManage={canManage}
          commercialStatus={whatsappSummaries[detailId]?.commercialStatus}
          whatsAppAvailable={Boolean(
            whatsappSummaries[detailId]?.hasCandidate ||
            whatsappSummaries[detailId]?.hasConversation
          )}
          onClose={() => setDetailId(null)}
          onOpenWhatsApp={(id) => {
            setDetailId(null)
            setWhatsAppLeadId(id)
          }}
          onChanged={() => {
            // The drawer mutated a lead — the Realtime subscription will
            // deliver the change automatically. No manual load() needed.
          }}
        />
      )}

      {(whatsAppLeadId || whatsAppConvId) && (
        <WhatsAppDrawer
          campaignLeadId={whatsAppLeadId ?? undefined}
          conversationId={whatsAppConvId ?? undefined}
          canManage={canManage}
          onClose={() => {
            setWhatsAppLeadId(null)
            setWhatsAppConvId(null)
          }}
        />
      )}

      {processingModalOpen && agg.campaign && (
        <ProcessingDetailsModal
          isOpen={processingModalOpen}
          onClose={() => setProcessingModalOpen(false)}
          campaignId={agg.campaign.id}
          canManage={canManage}
          onRefreshAggregates={() => {
            if (agg.campaign?.id) void refreshAggregates(agg.campaign.id)
          }}
        />
      )}
    </div>
  )
}
