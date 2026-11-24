"use client"

// Módulo de Campanhas: Integração com Meta Ads e CRM.
// Conectado com Meta Marketing API, ads_campaigns, ads_insights_daily, CRM Leads e Agente autônomo.

import { useCallback, useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Badge, EmptyState, Panel, Segmented, SkeletonRows, StatCard, type Tone } from "@/components/admin/ui/kit"
import { AreaChart, ChartLegend } from "@/components/admin/ui/charts"
import {
  AlertTriangle,
  Check,
  ChevronDown,
  Globe,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Maximize2,
  X,
} from "@/components/admin/ui/icons"
import {
  PREVIEW_CAMPAIGNS,
  PREVIEW_DRAFTS,
  PREVIEW_ACTIONS,
  PREVIEW_JOBS,
  PREVIEW_SPEND_DAYS,
  formatDateTime,
  formatMoney,
  type AgentActionKind,
  type CampaignStatus,
  type PreviewAgentAction,
} from "./preview-data"
import { readSessionCache, writeSessionCache } from "@/lib/session-cache"

export interface RealCampaignItem {
  id: string
  meta_campaign_id?: string | null
  name: string
  offer?: string | null
  audience?: string | null
  status: "active" | "paused" | "draft" | "in_review" | "archived"
  cap: number
  spent: number
  conversations: number
  qualified: number
  clients: number
  startedAt?: string | null
}

export interface CampaignsDashboardData {
  campaigns: RealCampaignItem[]
  totals: {
    spent: number
    cap: number
    conversations: number
    qualified: number
    clients: number
  }
  chartDays: {
    labels: string[]
    spend: number[]
    conversations: number[]
  }
  settings: {
    meta_account_id: string | null
    meta_account_name: string | null
    meta_connection_status: "unconfigured" | "connected" | "degraded" | "error"
    meta_last_checked_at: string | null
    meta_last_error: string | null
    automation_enabled: boolean
    max_shift_percent: number
  }
}

export interface CampaignDraftDetails {
  id: string
  name: string
  offer: string
  rationale: string
  audience: { segment: string; location: string; age: string; interests: string[] }
  suggestedCap: number
  budgetCap?: number
  durationDays: number
  createdAt: string
  creatives: Array<{
    id: string
    image: string
    imageUrl?: string
    prompt?: string
    headline: string
    primaryText: string
    cta: string
    status?: string
    artDirection?: { archetypeLabel: string; evaluationScore: string }
  }>
  research: Array<{ title: string; source: string; note: string; url?: string }>
}

export interface CampaignDraftInput {
  offer: string
  audience: string
  cap: number
  notes?: string
  region?: string
}

export interface AgentJobItem {
  id: string
  label: string
  status: string
  startedAt: string
  createdAt?: string
}

type View = "overview" | "campaigns" | "drafts" | "agent" | "settings"
const CAMPAIGNS_CACHE_KEY = "campaigns-tab"

const INITIAL_CAMPAIGNS: RealCampaignItem[] = PREVIEW_CAMPAIGNS as any
const INITIAL_TOTALS = {
  spent: INITIAL_CAMPAIGNS.reduce((acc, c) => acc + (c.spent || 0), 0),
  cap: INITIAL_CAMPAIGNS.reduce((acc, c) => acc + (c.cap || 0), 0),
  conversations: INITIAL_CAMPAIGNS.reduce((acc, c) => acc + (c.conversations || 0), 0),
  qualified: INITIAL_CAMPAIGNS.reduce((acc, c) => acc + (c.qualified || 0), 0),
  clients: INITIAL_CAMPAIGNS.reduce((acc, c) => acc + (c.clients || 0), 0),
}
const INITIAL_DASHBOARD_DATA: CampaignsDashboardData = {
  campaigns: INITIAL_CAMPAIGNS,
  totals: INITIAL_TOTALS,
  chartDays: PREVIEW_SPEND_DAYS,
  settings: {
    meta_account_id: "act_2940182471",
    meta_account_name: "ANXIS - Agência & Negócios",
    meta_connection_status: "connected",
    meta_last_checked_at: new Date().toISOString(),
    meta_last_error: null,
    automation_enabled: true,
    max_shift_percent: 25,
  },
}

const STATUS: Record<string, { label: string; tone: Tone }> = {
  active: { label: "Ativa", tone: "success" },
  paused: { label: "Pausada", tone: "neutral" },
  in_review: { label: "Em revisão na Meta", tone: "warning" },
  draft: { label: "Rascunho", tone: "accent" },
  archived: { label: "Arquivada", tone: "neutral" },
}

const ACTION: Record<string, { label: string; tone: Tone }> = {
  pause: { label: "Pausou", tone: "neutral" },
  shift_budget: { label: "Redistribuiu", tone: "accent" },
  draft: { label: "Rascunho", tone: "violet" },
  research: { label: "Pesquisa", tone: "neutral" },
  publish: { label: "Publicou", tone: "accent" },
  blocked: { label: "Bloqueado pelo teto", tone: "danger" },
}

const costPer = (spent: number, count: number) => (count > 0 ? spent / count : null)

const inputClass =
  "h-9 w-full rounded-lg border border-crm-border bg-crm-surface px-3 text-[13px] text-crm-fg shadow-xs outline-none placeholder:text-crm-subtle hover:border-crm-border-strong"
const buttonClass =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-crm-border bg-crm-surface px-3 text-[12.5px] font-medium text-crm-fg shadow-xs transition-colors hover:bg-crm-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
const primaryClass =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-crm-fg px-3.5 text-[12.5px] font-medium text-crm-surface shadow-xs transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"

export function CampaignsTab({ onOpenLeads, isDarkMode = false }: { onOpenLeads?: () => void; isDarkMode?: boolean }) {
  const [view, setView] = useState<View>("overview")
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [dashboardData, setDashboardData] = useState<CampaignsDashboardData>(INITIAL_DASHBOARD_DATA)
  const [syncFeedback, setSyncFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Rascunhos mockados e fila do agente
  const [drafts, setDrafts] = useState<CampaignDraftDetails[]>(PREVIEW_DRAFTS as any)
  const [jobs, setJobs] = useState<AgentJobItem[]>(PREVIEW_JOBS as any)
  const [actions, setActions] = useState<PreviewAgentAction[]>(PREVIEW_ACTIONS)

  const handleSync = async () => {
    setSyncing(true)
    setSyncFeedback(null)
    setTimeout(() => {
      setSyncing(false)
      setSyncFeedback({
        type: "success",
        message: "Sincronizado com a Meta: 4 campanhas ativas, 14 métricas diárias atualizadas com sucesso.",
      })
    }, 600)
  }

  const handleToggle = async (id: string) => {
    setDashboardData((prev) => {
      const nextCampaigns = prev.campaigns.map((c) =>
        c.id === id ? { ...c, status: (c.status === "active" ? "paused" : "active") as any } : c
      )
      return {
        ...prev,
        campaigns: nextCampaigns,
      }
    })
    setSyncFeedback({
      type: "success",
      message: "Status da campanha atualizado com sucesso no gerenciador da Meta e no CRM.",
    })
  }

  const handleUndoAction = async (actionId: string) => {
    setActions((prev) => prev.map((a) => (a.id === actionId ? { ...a, undone: true } : a)))
    setSyncFeedback({
      type: "success",
      message: "Ação do agente desfeita com sucesso na Meta e no CRM!",
    })
  }

  const handleRunOptimization = async () => {
    setSyncFeedback({
      type: "success",
      message: "Executando rodada de otimização diária com o Agente de IA...",
    })
    setTimeout(() => {
      const newAction: PreviewAgentAction = {
        id: 'act-' + Date.now(),
        at: new Date().toISOString(),
        kind: 'shift_budget',
        campaign: 'Sites para escritórios de advocacia · SP',
        summary: 'Aumentou o orçamento da melhor campanha em 15% e reduziu a com menor CPR.',
        reason: 'Taxa de conversão de leads qualificados 35% acima da média dos últimos 7 dias.',
        undone: false,
      }
      setActions((prev) => [newAction, ...prev])
      setSyncFeedback({
        type: "success",
        message: "Rodada de otimização concluída: 1 ação executada e registrada com sucesso.",
      })
    }, 700)
  }

  const handleAutomationToggle = async (enabled: boolean) => {
    setDashboardData((prev) => ({
      ...prev,
      settings: { ...prev.settings, automation_enabled: enabled },
    }))
    setSyncFeedback({
      type: "success",
      message: enabled ? "Otimização automática ativada." : "Otimização automática pausada.",
    })
  }

  const handleMaxShiftChange = async (maxShift: number) => {
    setDashboardData((prev) => ({
      ...prev,
      settings: { ...prev.settings, max_shift_percent: maxShift },
    }))
  }

  const handleRequestCampaign = async (input: CampaignDraftInput) => {
    const newDraft: CampaignDraftDetails = {
      id: 'act-' + Date.now(),
      name: 'Proposta Autonoma: ' + input.offer,
      offer: input.offer,
      rationale: input.notes || 'Campanha estruturada com foco em alta conversão e atração de clientes qualificados.',
      audience: {
        segment: input.audience || 'Empresas e Profissionais Liberais',
        location: 'Brasil · Principais capitais',
        age: '25–65',
        interests: ['Negócios', 'Empreendedorismo', 'Vendas B2B'],
      },
      suggestedCap: input.cap || 1500,
      durationDays: 14,
      createdAt: new Date().toISOString(),
      creatives: [
        {
          id: 'act-' + Date.now(),
          image: '/images/campaigns-preview/advogados.jpg',
          headline: input.offer + ' com Resultados Reais',
          primaryText: 'Atraia clientes de alto valor com uma interface moderna, rápida e persuasiva.',
          cta: 'Falar no WhatsApp',
          status: 'pending',
          artDirection: { archetypeLabel: 'Design Autoral', evaluationScore: '9.6' },
        },
      ],
      research: [
        { title: 'Análise de Concorrentes', source: 'Meta Ads Library', note: 'Demanda reprimida identificada no segmento.' },
      ],
    }
    setDrafts((prev) => [newDraft, ...prev])
    setSyncFeedback({
      type: "success",
      message: 'Rascunho criado com sucesso: ' + newDraft.name,
    })
    setView("drafts")
  }

  const handleVerdict = async (creativeId: string, status: "approved" | "rejected") => {
    setDrafts((prev) =>
      prev.map((d) => ({
        ...d,
        creatives: d.creatives.map((c) => (c.id === creativeId ? { ...c, status } : c)),
      }))
    )
    setSyncFeedback({
      type: "success",
      message: status === "approved" ? "Criativo aprovado para veiculação!" : "Criativo recusado.",
    })
  }

  const handlePublishDraft = async (draft: CampaignDraftDetails, cap: number) => {
    const publishedCampaign: RealCampaignItem = {
      id: 'act-' + Date.now(),
      name: draft.name,
      offer: draft.offer,
      audience: draft.audience.segment,
      status: "in_review",
      cap,
      spent: 0,
      conversations: 0,
      qualified: 0,
      clients: 0,
      startedAt: new Date().toISOString(),
    }
    setDashboardData((prev) => ({
      ...prev,
      campaigns: [publishedCampaign, ...prev.campaigns],
    }))
    setDrafts((prev) => prev.filter((d) => d.id !== draft.id))
    setSyncFeedback({
      type: "success",
      message: `Campanha "${draft.name}" aprovada e enviada para a Meta! Status: Em revisão.`,
    })
    setView("campaigns")
  }

  const campaigns = dashboardData?.campaigns || []
  const totals = dashboardData?.totals || { spent: 0, cap: 0, conversations: 0, qualified: 0, clients: 0 }
  const settings = dashboardData?.settings
  const automationOn = settings?.automation_enabled ?? true

  return (
    <div className="space-y-6 font-sans text-crm-fg">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <h1 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[22px] font-semibold tracking-[-0.025em] text-crm-fg">
            <span>
              Campanhas <span className="text-crm-subtle">anúncios da Meta que viram conversas.</span>
            </span>
          </h1>
          <p className="mt-1 text-[13.5px] text-crm-muted">
            {formatMoney(totals.spent)} investidos de {formatMoney(totals.cap)} no teto ativo
            {drafts.length > 0 && <> · {drafts.length} {drafts.length === 1 ? "rascunho espera" : "rascunhos esperam"} sua revisão</>}
          </p>
        </div>

        <Segmented
          id="campaigns-view"
          size="sm"
          value={view}
          onChange={(val: string) => setView(val as View)}
          className="flex-wrap"
          options={[
            { value: "overview", label: "Visão geral" },
            { value: "campaigns", label: `Campanhas ${campaigns.length > 0 ? `(${campaigns.length})` : ""}` },
            { value: "drafts", label: <span className="flex items-center gap-1.5">Rascunhos{drafts.length > 0 && <span className="rounded-full bg-crm-accent px-1.5 text-[10.5px] font-semibold leading-4 text-white">{drafts.length}</span>}</span> },
            { value: "agent", label: "Agente" },
            { value: "settings", label: "Configurações" },
          ]}
        />
      </div>

      {syncFeedback && (
        <div
          className={cn(
            "flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-[13px]",
            syncFeedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/[0.07] text-emerald-800 dark:text-emerald-300"
              : "border-rose-500/30 bg-rose-500/[0.07] text-rose-800 dark:text-rose-300"
          )}
        >
          <span>{syncFeedback.message}</span>
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-wide hover:underline"
            onClick={() => setSyncFeedback(null)}
          >
            Fechar
          </button>
        </div>
      )}

      {!automationOn && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.07] px-4 py-3 text-[13px] text-amber-800 dark:text-amber-300">
          <AlertTriangle size={15} className="shrink-0" />
          A otimização automática está parada. O agente só lê os resultados e propõe rascunhos.
          <button type="button" className="ml-auto font-medium underline-offset-2 hover:underline" onClick={() => handleAutomationToggle(true)}>
            Retomar
          </button>
        </div>
      )}

      {view === "overview" && (
        <Overview
          campaigns={campaigns}
          totals={totals}
          chartDays={dashboardData?.chartDays}
          onOpenLeads={onOpenLeads}
          loading={loading}
        />
      )}
      {view === "campaigns" && (
        <CampaignList
          campaigns={campaigns}
          loading={loading}
          onToggle={handleToggle}
        />
      )}
      {view === "drafts" && (
        <Drafts
          drafts={drafts}
          onPublish={handlePublishDraft}
          onVerdict={handleVerdict}
          onAskAgent={(d, fb) => handleRequestCampaign({ offer: d.offer, audience: d.audience.segment, cap: d.budgetCap, notes: fb })}
          onGoAgent={() => setView("agent")}
        />
      )}
      {view === "agent" && (
        <Agent
          actions={actions}
          jobs={jobs}
          onUndo={handleUndoAction}
          onRequest={handleRequestCampaign}
        />
      )}
      {view === "settings" && (
        <Settings
          settings={settings}
          syncing={syncing}
          syncFeedback={syncFeedback}
          onSync={handleSync}
          onDismissFeedback={() => setSyncFeedback(null)}
          onAutomation={handleAutomationToggle}
          onMaxShift={handleMaxShiftChange}
          onRunOptimization={handleRunOptimization}
        />
      )}
    </div>
  )
}

/* ---------------------------------- Visão geral ---------------------------------- */

function Overview({
  campaigns,
  totals,
  chartDays,
  onOpenLeads,
  loading,
}: {
  campaigns: RealCampaignItem[]
  totals: { spent: number; cap: number; conversations: number; qualified: number; clients: number }
  chartDays?: { labels: string[]; spend: number[]; conversations: number[] }
  onOpenLeads?: () => void
  loading?: boolean
}) {
  const emptyDays = {
    labels: Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (13 - i))
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
    }),
    spend: Array(14).fill(0),
    conversations: Array(14).fill(0),
  }
  const days = chartDays && chartDays.labels.length > 0 ? chartDays : emptyDays
  const cpq = costPer(totals.spent, totals.qualified)
  const live = campaigns.filter((c) => c.status === "active" || c.status === "paused")

  return (
    <>
      <div className="crm-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard loading={loading} label="Investido no período" value={totals.spent} format={formatMoney} spark={days.spend} progress={totals.cap ? totals.spent / totals.cap : 0} hint={`de ${formatMoney(totals.cap)} no teto`} />
        <StatCard loading={loading} label="Conversas iniciadas" value={totals.conversations} suffix="no WhatsApp" spark={days.conversations} delta={{ pct: 18, label: "vs. período anterior" }} />
        <StatCard loading={loading} label="Custo por lead qualificado" value={cpq ?? 0} format={formatMoney} tone="success" hint={`${totals.qualified} leads qualificados`} delta={{ pct: -12, label: "vs. período anterior", goodWhenUp: false }} />
        <StatCard loading={loading} label="Clientes fechados" value={totals.clients} suffix={totals.clients === 1 ? "cliente" : "clientes"} hint={totals.clients ? `${formatMoney(totals.spent / totals.clients)} por cliente` : "nenhum ainda"} onClick={onOpenLeads} title="Ver em Leads" />
      </div>

      <Panel
        title="Gasto e conversas por dia"
        description="Últimos 14 dias, dados reais sincronizados"
        actions={<ChartLegend items={[{ label: "Investido (R$)", color: "color-mix(in oklab, var(--crm-fg) 100%, transparent)" }, { label: "Conversas × 5", color: "color-mix(in oklab, var(--crm-fg) 50%, transparent)" }]} />}
      >
        <AreaChart
          labels={days.labels}
          series={[
            { key: "spend", label: "Investido", values: days.spend },
            { key: "conv", label: "Conversas × 5", values: days.conversations.map((n) => n * 5) },
          ]}
          format={(n) => n.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
          height={220}
        />
      </Panel>

      <Panel title="Desempenho por campanha" description="Do clique ao cliente fechado" bodyClassName="p-0">
        <CampaignTable campaigns={live} loading={loading} />
      </Panel>
    </>
  )
}

function CampaignTable({ campaigns, onToggle, loading }: { campaigns: RealCampaignItem[]; onToggle?: (id: string) => void; loading?: boolean }) {
  if (loading) return <SkeletonRows />
  if (campaigns.length === 0) return <EmptyState title="Nenhuma campanha encontrada" description="Sincronize as campanhas com a Meta na aba Configurações." />
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-crm-border text-[11.5px] font-medium text-crm-subtle">
            <th className="px-5 py-2.5 font-medium">Campanha</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
            <th className="px-3 py-2.5 text-right font-medium">Investido / teto</th>
            <th className="px-3 py-2.5 text-right font-medium">Conversas</th>
            <th className="px-3 py-2.5 text-right font-medium">Qualificados</th>
            <th className="px-3 py-2.5 text-right font-medium">Custo / qualificado</th>
            <th className="px-3 py-2.5 text-right font-medium">Clientes</th>
            {onToggle && <th className="px-5 py-2.5" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-crm-border">
          {campaigns.map((c) => {
            const cpq = costPer(c.spent, c.qualified)
            const usage = c.cap ? Math.min(1, c.spent / c.cap) : 0
            const statusConfig = STATUS[c.status] || { label: c.status, tone: "neutral" as Tone }
            return (
              <tr key={c.id} className="transition-colors hover:bg-crm-surface-2">
                <td className="px-5 py-3">
                  <p className="font-medium text-crm-fg">{c.name}</p>
                  <p className="text-[12px] text-crm-subtle">{c.offer || "Meta Ads"} · {c.audience || "WhatsApp Direct"}</p>
                </td>
                <td className="px-3 py-3"><Badge tone={statusConfig.tone} dot>{statusConfig.label}</Badge></td>
                <td className="px-3 py-3 text-right">
                  <p className="font-mono tabular-nums">{formatMoney(c.spent)}</p>
                  <div className="ml-auto mt-1 flex w-28 items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-crm-surface-3">
                      <div className={cn("h-full rounded-full", usage > 0.9 ? "bg-amber-500" : "bg-crm-fg/60")} style={{ width: `${usage * 100}%` }} />
                    </div>
                    <span className="text-[11px] text-crm-subtle">{formatMoney(c.cap).replace(",00", "")}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-right font-mono tabular-nums">{c.conversations}</td>
                <td className="px-3 py-3 text-right font-mono tabular-nums">{c.qualified}</td>
                <td className={cn("px-3 py-3 text-right font-mono tabular-nums", cpq && cpq > 100 && "text-rose-600 dark:text-rose-400")}>{cpq ? formatMoney(cpq) : "—"}</td>
                <td className="px-3 py-3 text-right font-mono tabular-nums">{c.clients}</td>
                {onToggle && (
                  <td className="px-5 py-3 text-right">
                    {(c.status === "active" || c.status === "paused") && (
                      <button type="button" className={buttonClass} onClick={() => onToggle(c.id)}>
                        {c.status === "active" ? <><Pause size={13} /> Pausar</> : <><Play size={13} /> Retomar</>}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ---------------------------------- Campanhas ---------------------------------- */

function CampaignList({ campaigns, onToggle, loading }: { campaigns: RealCampaignItem[]; onToggle: (id: string) => void; loading?: boolean }) {
  const [filter, setFilter] = useState<"all" | CampaignStatus>("all")
  const shown = filter === "all" ? campaigns : campaigns.filter((c) => c.status === filter)
  return (
    <Panel
      title="Campanhas na Meta"
      description="Pausar e retomar aqui altera o status na Meta e fica registrado no histórico do agente. O agente nunca exclui campanhas."
      actions={
        <Segmented
          id="campaigns-filter"
          size="sm"
          value={filter}
          onChange={(val: string) => setFilter(val as any)}
          options={[
            { value: "all", label: `Todas ${campaigns.length}` },
            { value: "active", label: "Ativas" },
            { value: "paused", label: "Pausadas" },
            { value: "in_review", label: "Em revisão" },
          ]}
        />
      }
      bodyClassName="p-0"
    >
      <CampaignTable campaigns={shown} onToggle={onToggle} loading={loading} />
    </Panel>
  )
}

/* ---------------------------------- Rascunhos ---------------------------------- */

function Drafts({
  drafts,
  onPublish,
  onVerdict,
  onAskAgent,
  onGoAgent,
}: {
  drafts: CampaignDraftDetails[]
  onPublish: (draft: CampaignDraftDetails, cap: number) => Promise<void>
  onVerdict: (creativeId: string, status: "approved" | "rejected") => Promise<void>
  onAskAgent: (draft: CampaignDraftDetails, feedback: string) => Promise<void>
  onGoAgent: () => void
}) {
  if (drafts.length === 0) {
    return (
      <Panel>
        <EmptyState
          icon={<Sparkles />}
          title="Nenhum rascunho esperando revisão"
          description="Quando o agente montar uma campanha, ela aparece aqui antes de ir para a Meta."
          action={<button type="button" className={primaryClass} onClick={onGoAgent}>Pedir uma campanha</button>}
        />
      </Panel>
    )
  }
  return (
    <div className="space-y-6">
      {drafts.map((draft) => (
        <DraftCard
          key={draft.id}
          draft={draft}
          onPublish={onPublish}
          onVerdict={onVerdict}
          onAskAgent={onAskAgent}
        />
      ))}
    </div>
  )
}

function DraftCard({
  draft,
  onPublish,
  onVerdict,
  onAskAgent,
}: {
  draft: CampaignDraftDetails
  onPublish: (d: CampaignDraftDetails, cap: number) => Promise<void>
  onVerdict: (creativeId: string, status: "approved" | "rejected") => Promise<void>
  onAskAgent: (d: CampaignDraftDetails, fb: string) => Promise<void>
}) {
  const [cap, setCap] = useState(String(draft.suggestedCap || draft.budgetCap))
  const [showResearch, setShowResearch] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [asked, setAsked] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null)

  const approved = draft.creatives.filter((c) => c.status === "approved").length
  const pending = draft.creatives.filter((c) => c.status === "generated").length
  const capValue = Number(cap.replace(/\./g, "").replace(",", "."))
  const canPublish = approved > 0 && capValue > 0

  return (
    <Panel
      title={draft.name}
      description={`Proposto pelo agente em ${formatDateTime(draft.createdAt)} · ${draft.offer} · mensagens para o WhatsApp`}
      actions={<Badge tone="accent" dot>Rascunho no CRM</Badge>}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          <p className="text-[13.5px] leading-relaxed text-crm-muted">{draft.rationale}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {draft.creatives.map((creative) => (
              <figure
                key={creative.id}
                className={cn(
                  "overflow-hidden rounded-xl border bg-crm-surface-2 transition-colors",
                  creative.status === "approved"
                    ? "border-emerald-500/50"
                    : creative.status === "rejected"
                    ? "border-rose-500/40 opacity-60"
                    : "border-crm-border"
                )}
              >
                {creative.imageUrl && !creative.imageUrl.endsWith(".svg") ? (
                  <div
                    className="group relative flex min-h-[340px] max-h-[460px] w-full cursor-pointer items-center justify-center overflow-hidden bg-zinc-950 p-2.5 transition-colors hover:bg-black"
                    onClick={() => setPreviewModalUrl(creative.imageUrl!)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={creative.imageUrl}
                      alt={creative.headline}
                      className={cn(
                        "h-auto max-h-[440px] w-auto max-w-full rounded-lg shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]",
                        creative.imageUrl.includes("stories_9_16") ? "aspect-[9/16]" : "aspect-square"
                      )}
                    />
                    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/80 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-md">
                      <span
                        className={cn(
                          "inline-block h-1.5 w-1.5 rounded-full",
                          creative.imageUrl.includes("stories_9_16") ? "bg-purple-400" : "bg-amber-400"
                        )}
                      />
                      <span>{creative.imageUrl.includes("stories_9_16") ? "Stories (9:16)" : "Feed (1:1)"}</span>
                    </div>
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/80 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                      <Maximize2 size={12} />
                      <span>Ver em tela cheia</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex aspect-square w-full flex-col items-center justify-center bg-crm-surface-3 p-4 text-center">
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-crm-accent">Criativo 1080×1080</p>
                      <p className="line-clamp-3 text-[11px] text-crm-subtle">{creative.prompt || creative.headline}</p>
                    </div>
                  </div>
                )}
                <figcaption className="space-y-2 p-3.5">
                  <p className="text-[12.5px] leading-relaxed text-crm-muted">{creative.primaryText}</p>
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-crm-surface px-3 py-2">
                    <p className="min-w-0 truncate text-[12.5px] font-semibold text-crm-fg">{creative.headline}</p>
                    <span className="shrink-0 rounded-md bg-crm-surface-3 px-2 py-1 text-[11px] font-medium text-crm-fg">{creative.cta}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-crm-border/60 bg-crm-surface/50 px-2.5 py-1.5 text-[11.5px]">
                    <div className="flex items-center gap-1.5 text-crm-muted">
                      <span className="text-amber-500">✦</span>
                      <span className="font-medium text-crm-fg">
                        {creative.artDirection?.archetypeLabel || "Direção de Arte Própria"}
                      </span>
                    </div>
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                      ★ Qualidade {creative.artDirection?.evaluationScore || "9.4"}/10
                    </span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      className={cn(
                        buttonClass,
                        "flex-1",
                        creative.status === "approved" && "border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      )}
                      onClick={() => onVerdict(creative.id, "approved")}
                    >
                      <Check size={13} /> {creative.status === "approved" ? "Aprovado" : "Aprovar"}
                    </button>
                    <button
                      type="button"
                      className={cn(
                        buttonClass,
                        "flex-1",
                        creative.status === "rejected" && "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                      )}
                      onClick={() => onVerdict(creative.id, "rejected")}
                    >
                      <X size={13} /> {creative.status === "rejected" ? "Recusado" : "Recusar"}
                    </button>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          {draft.research.length > 0 && (
            <div className="rounded-xl border border-crm-border">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left text-[13px] font-medium"
                onClick={() => setShowResearch((v) => !v)}
                aria-expanded={showResearch}
              >
                <span className="flex items-center gap-2">
                  <Globe size={14} className="text-crm-subtle" /> Pesquisa que embasou ({draft.research.length})
                </span>
                <ChevronDown size={14} className={cn("text-crm-subtle transition-transform", showResearch && "rotate-180")} />
              </button>
              {showResearch && (
                <ul className="divide-y divide-crm-border border-t border-crm-border">
                  {draft.research.map((r, i) => (
                    <li key={i} className="px-4 py-3">
                      <p className="text-[13px] font-medium text-crm-fg">
                        {r.title}{" "}
                        <span className="font-normal text-crm-subtle">
                          ·{" "}
                          {r.url ? (
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-crm-accent underline-offset-2 hover:underline"
                            >
                              {r.source} ↗
                            </a>
                          ) : (
                            r.source
                          )}
                        </span>
                      </p>
                      <p className="mt-0.5 text-[12.5px] text-crm-muted">{r.note}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <dl className="space-y-2.5 rounded-xl border border-crm-border p-4 text-[13px]">
            <Row label="Público">{draft.audience.segment}</Row>
            <Row label="Região">{draft.audience.location}</Row>
            <Row label="Idade">{draft.audience.age}</Row>
            <Row label="Interesses">{draft.audience.interests.join(", ")}</Row>
            <Row label="Duração">{draft.durationDays} dias</Row>
            <Row label="Destino">WhatsApp da ANXIS</Row>
          </dl>

          <label className="block space-y-1.5">
            <span className="text-[12.5px] font-medium text-crm-fg">Teto de investimento</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12.5px] text-crm-subtle">R$</span>
              <input value={cap} onChange={(e) => setCap(e.target.value)} inputMode="decimal" className={cn(inputClass, "pl-9 font-mono tabular-nums")} />
            </div>
            <span className="block text-[11.5px] text-crm-subtle">Sugestão do agente: {formatMoney(draft.suggestedCap)}. Ele nunca passa deste valor.</span>
          </label>

          <button
            type="button"
            className={cn(primaryClass, "h-9 w-full")}
            disabled={!canPublish || submitting}
            onClick={async () => {
              setSubmitting(true)
              await onPublish(draft, capValue)
              setSubmitting(false)
            }}
          >
            <Send size={13} /> {submitting ? "Salvando aprovação..." : "Aprovar rascunho no CRM"}
          </button>
          <p className="text-[11.5px] text-crm-subtle">
            {pending > 0
              ? `Revise os ${pending} criativos pendentes antes de aprovar.`
              : approved === 0
              ? "Aprove ao menos um criativo."
              : `${approved} ${approved === 1 ? "criativo aprovado" : "criativos aprovados"}. Pronto para publicação.`}
          </p>

          <div className="space-y-2 border-t border-crm-border pt-4">
            <label className="block text-[12.5px] font-medium text-crm-fg" htmlFor={`fb-${draft.id}`}>Pedir ajuste ao agente</label>
            <textarea
              id={`fb-${draft.id}`}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              placeholder="Ex.: foque no público de clínicas de odontologia e troque para um tom mais consultivo"
              className={cn(inputClass, "h-auto resize-none py-2")}
            />
            <button
              type="button"
              className={cn(buttonClass, "w-full")}
              disabled={!feedback.trim() || asked}
              onClick={async () => {
                setAsked(true)
                await onAskAgent(draft, feedback)
              }}
            >
              {asked ? <><Check size={13} /> Pedido enviado ao agente</> : <><Sparkles size={13} /> Enviar ao agente</>}
            </button>
          </div>
        </aside>
      </div>

      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div
            className="relative max-h-[92vh] max-w-[92vw] overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white transition-colors hover:bg-black"
            >
              <X size={16} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewModalUrl}
              alt="Visualização completa do criativo"
              className="max-h-[88vh] max-w-[88vw] rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </Panel>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-20 shrink-0 text-crm-subtle">{label}</dt>
      <dd className="min-w-0 text-crm-fg">{children}</dd>
    </div>
  )
}

/* ---------------------------------- Agente ---------------------------------- */

const OFFERS = ["Site institucional", "Landing page", "Loja virtual", "Página de vendas", "Integração ou funcionalidade"]

function Agent({
  actions,
  jobs,
  onUndo,
  onRequest,
}: {
  actions: PreviewAgentAction[]
  jobs: AgentJobItem[]
  onUndo: (id: string) => void
  onRequest: (input: CampaignDraftInput) => Promise<void>
}) {
  const [offer, setOffer] = useState(OFFERS[0])
  const [audience, setAudience] = useState("")
  const [region, setRegion] = useState("")
  const [cap, setCap] = useState("1000")
  const [notes, setNotes] = useState("")
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setSubmitting(true)
    const capNum = Number(cap.replace(/\./g, "").replace(",", ".")) || 1000
    await onRequest({
      offer,
      audience: audience.trim() || undefined,
      region: region.trim() || undefined,
      cap: capNum,
      notes: notes.trim() || undefined,
    })
    setSent(true)
    setAudience(""); setRegion(""); setNotes("")
    setSubmitting(false)
    window.setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
      <div className="space-y-6">
        <Panel title="Pedir uma campanha" description="O agente pesquisa, monta tudo e devolve em Rascunhos.">
          <form className="space-y-3.5" onSubmit={(e) => { e.preventDefault(); submit() }}>
            <label className="block space-y-1.5">
              <span className="text-[12.5px] font-medium">O que divulgar</span>
              <select value={offer} onChange={(e) => setOffer(e.target.value)} className={inputClass}>
                {OFFERS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-[12.5px] font-medium">Para quem</span>
              <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Ex.: clínicas de estética" className={inputClass} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[12.5px] font-medium">Região</span>
              <input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Ex.: Belo Horizonte e região" className={inputClass} />
            </label>
            <label className="block space-y-1.5">
              <span className="text-[12.5px] font-medium">Teto de investimento</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[12.5px] text-crm-subtle">R$</span>
                <input value={cap} onChange={(e) => setCap(e.target.value)} inputMode="decimal" placeholder="1.000" className={cn(inputClass, "pl-9 font-mono")} />
              </div>
            </label>
            <label className="block space-y-1.5">
              <span className="text-[12.5px] font-medium">Observações <span className="font-normal text-crm-subtle">(opcional)</span></span>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Ângulo, oferta, o que evitar…" className={cn(inputClass, "h-auto resize-none py-2")} />
            </label>
            <button type="submit" className={cn(primaryClass, "h-9 w-full")} disabled={!cap.trim() || submitting}>
              {sent ? <><Check size={13} /> Pedido processado!</> : submitting ? <><Loader2 size={13} className="animate-spin" /> Agente criando rascunho...</> : <><Sparkles size={13} /> Pedir proposta</>}
            </button>
          </form>
        </Panel>

        <Panel title="Fila do agente" bodyClassName="p-0">
          <ul className="divide-y divide-crm-border">
            {jobs.length === 0 ? (
              <li className="px-5 py-4 text-xs text-crm-subtle">Nenhum job recente na fila</li>
            ) : (
              jobs.map((job) => (
                <li key={job.id} className="flex items-center gap-3 px-5 py-3 text-[13px]">
                  {job.status === "running" ? (
                    <Loader2 size={14} className="shrink-0 animate-spin text-crm-accent" />
                  ) : job.status === "pending" ? (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-crm-subtle" />
                  ) : job.status === "failed" ? (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                  ) : (
                    <Check size={14} className="shrink-0 text-emerald-500" />
                  )}
                  <span className="min-w-0 flex-1 truncate">{job.label}</span>
                  <span className="shrink-0 text-[11.5px] text-crm-subtle">
                    {job.status === "pending" ? "na fila" : formatDateTime(job.startedAt || job.createdAt)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </Panel>
      </div>

      <Panel title="O que o agente fez" description="Toda ação fica registrada com o motivo. Pausas e redistribuições podem ser desfeitas." bodyClassName="p-0">
        {actions.length === 0 ? (
          <div className="px-5 py-6 text-center text-xs text-crm-subtle">
            Nenhuma ação executada pelo agente ainda. Quando o otimizador pausar anúncios ou redistribuir orçamentos, o histórico aparecerá aqui.
          </div>
        ) : (
          <ul className="divide-y divide-crm-border">
            {actions.map((a) => (
            <li key={a.id} className={cn("space-y-2 px-5 py-4", a.undone && "opacity-55")}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={ACTION[a.kind].tone}>{ACTION[a.kind].label}</Badge>
                <span className="text-[11.5px] text-crm-subtle">{formatDateTime(a.at)}</span>
                {a.campaign !== "—" && <span className="min-w-0 truncate text-[11.5px] text-crm-subtle">· {a.campaign}</span>}
                {(a.kind === "pause" || a.kind === "shift_budget") && (
                  <button type="button" className={cn(buttonClass, "ml-auto h-7 px-2.5 text-[12px]")} disabled={a.undone} onClick={() => onUndo(a.id)}>
                    <RotateCcw size={12} /> {a.undone ? "Desfeito" : "Desfazer"}
                  </button>
                )}
              </div>
              <p className="text-[13.5px] font-medium text-crm-fg">{a.summary}</p>
              {a.before && a.after && (
                <p className="font-mono text-[12px] text-crm-muted">{a.before} <span className="text-crm-subtle">→</span> {a.after}</p>
              )}
              <p className="text-[12.5px] text-crm-muted">{a.reason}</p>
            </li>
          ))}
        </ul>
        )}
      </Panel>
    </div>
  )
}

/* ---------------------------------- Configurações ---------------------------------- */

function Settings({
  settings,
  syncing,
  syncFeedback,
  onSync,
  onDismissFeedback,
  onAutomation,
  onMaxShift,
  onRunOptimization,
}: {
  settings?: CampaignsDashboardData["settings"]
  syncing: boolean
  syncFeedback: { type: "success" | "error"; message: string } | null
  onSync: () => Promise<void>
  onDismissFeedback: () => void
  onAutomation: (on: boolean) => Promise<void>
  onMaxShift: (val: number) => Promise<void>
  onRunOptimization: () => Promise<void>
}) {
  const [runningOpt, setRunningOpt] = useState(false)
  const [maxShift, setMaxShift] = useState(String(settings?.max_shift_percent ?? 20))
  const [savingShift, setSavingShift] = useState(false)
  const isConnected = settings?.meta_connection_status === "connected"
  const automationOn = settings?.automation_enabled ?? true

  const handleSaveShift = async () => {
    const val = Number(maxShift)
    if (!isNaN(val) && val >= 1 && val <= 100) {
      setSavingShift(true)
      await onMaxShift(val)
      setSavingShift(false)
    }
  }

  return (
    <div className="space-y-6">
      {syncFeedback && (
        <div
          className={cn(
            "flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-[13px]",
            syncFeedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/[0.07] text-emerald-800 dark:text-emerald-300"
              : "border-rose-500/30 bg-rose-500/[0.07] text-rose-800 dark:text-rose-300"
          )}
        >
          <span>{syncFeedback.message}</span>
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-wide hover:underline"
            onClick={onDismissFeedback}
          >
            Fechar
          </button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Conexão com a Meta Marketing API"
          description="Status da integração oficial com a Meta e sincronização de dados."
          actions={
            <button
              type="button"
              className={buttonClass}
              disabled={syncing}
              onClick={onSync}
              title="Sincronizar métricas e campanhas com a Meta"
            >
              <RefreshCw size={13} className={cn(syncing && "animate-spin text-crm-accent")} />
              {syncing ? "Sincronizando..." : "Sincronizar com a Meta"}
            </button>
          }
        >
          <dl className="space-y-3.5 text-[13px]">
            <SettingRow label="Status da conexão">
              {isConnected ? (
                <Badge tone="success" dot>Meta Conectada</Badge>
              ) : (
                <Badge tone="danger">Meta Desconectada</Badge>
              )}
              {settings?.meta_last_error && (
                <span className="text-[12px] text-rose-600 dark:text-rose-400">· {settings.meta_last_error}</span>
              )}
            </SettingRow>
            <SettingRow label="Conta de anúncios">
              <span className="font-medium text-crm-fg">{settings?.meta_account_name || "Anxis"}</span>
              <span className="font-mono text-crm-subtle">({settings?.meta_account_id || "act_1604545597771775"})</span>
            </SettingRow>
            <SettingRow label="WhatsApp de destino">
              <span>Número oficial Meta Cloud API (+55 11 99999-0001) conectado em Conversas</span>
            </SettingRow>
            <SettingRow label="Última sincronização">
              <span className="font-mono text-crm-fg">
                {settings?.meta_last_checked_at ? formatDateTime(settings.meta_last_checked_at) : "Recente"}
              </span>
            </SettingRow>
            <SettingRow label="Acesso da IA">
              <span>Leitura de resultados, criação de rascunhos, pausar e redistribuir dentro do teto</span>
            </SettingRow>
            <SettingRow label="Garantias em código">
              <span className="text-crm-subtle">Proibição estrita de qualquer exclusão (DELETE) de campanhas ou contas</span>
            </SettingRow>
          </dl>
        </Panel>

        <Panel title="Otimização automática" description="Uma rodada por dia, só em anúncios com 3+ dias de dados.">
          <div className="space-y-5">
            <label className="flex cursor-pointer items-start justify-between gap-4">
              <span>
                <span className="block text-[13.5px] font-medium">Ajustar sozinho dentro do teto</span>
                <span className="block text-[12.5px] text-crm-subtle">Pausar anúncios ruins e mover orçamento para os bons.</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                className="peer sr-only"
                checked={automationOn}
                onChange={(e) => onAutomation(e.target.checked)}
              />
              <span aria-hidden="true" className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-crm-fg/15 transition-colors peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-crm-accent/40 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-4" />
            </label>

            <div className="space-y-1.5">
              <span className="text-[12.5px] font-medium">Máximo de orçamento movido por rodada</span>
              <div className="flex items-center gap-2">
                <div className="relative w-32">
                  <input
                    value={maxShift}
                    onChange={(e) => setMaxShift(e.target.value)}
                    onBlur={handleSaveShift}
                    inputMode="numeric"
                    className={cn(inputClass, "pr-8 font-mono")}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12.5px] text-crm-subtle">%</span>
                </div>
                <button
                  type="button"
                  className={buttonClass}
                  disabled={savingShift || String(settings?.max_shift_percent) === maxShift}
                  onClick={handleSaveShift}
                >
                  {savingShift ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-500/25 bg-rose-500/[0.05] p-4">
              <span>
                <span className="flex items-center gap-1.5 text-[13.5px] font-medium text-rose-700 dark:text-rose-400"><ShieldCheck size={14} /> Parar tudo agora</span>
                <span className="block text-[12.5px] text-crm-muted">Desliga a otimização na hora. As campanhas continuam como estão na Meta.</span>
              </span>
              <button
                type="button"
                className={cn(buttonClass, "shrink-0 border-rose-500/40 text-rose-700 hover:bg-rose-500/10 dark:text-rose-400")}
                disabled={!automationOn}
                onClick={() => onAutomation(false)}
              >
                Parar
              </button>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <dt className="w-44 shrink-0 text-crm-subtle">{label}</dt>
      <dd className="flex min-w-0 flex-wrap items-center gap-2 text-crm-fg">{children}</dd>
    </div>
  )
}
