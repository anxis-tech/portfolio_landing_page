'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'motion/react'
import { ClientProject } from '@/types/client-project.types'
import { UserProfileWithRole } from '@/lib/auth/permissions'
import { normalizeProjectStage, formatDateBR } from '@/components/admin/tabs/kanban-board-tab'
export interface DashboardMetricsDTO {
  conversations: {
    waiting_agent: number
    waiting_customer: number
    unassigned: number
    open: number
    unread: number
    window_expiring: number
    total: number
  }
  commercial: {
    new: number
    qualified: number
    contacted: number
    replied: number
    proposals: number
    total: number
  }
}

export const DEFAULT_CRM_METRICS: DashboardMetricsDTO = {
  conversations: {
    waiting_agent: 3,
    waiting_customer: 14,
    unassigned: 2,
    open: 19,
    unread: 2,
    window_expiring: 1,
    total: 19,
  },
  commercial: {
    new: 64,
    qualified: 28,
    contacted: 22,
    replied: 18,
    proposals: 8,
    total: 64,
  },
}


import { HugeiconsIcon } from '@hugeicons/react'
import {
  Calculator01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  BubbleChatDelayIcon,
  UserCheck01Icon,
  Folder01Icon,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { Badge, EmptyState, Panel, Segmented, StatCard, type Tone } from '@/components/admin/ui/kit'

interface DashboardOverviewTabProps {
  projects: ClientProject[]
  userProfile: UserProfileWithRole | null
  onOpenProjectDetail: (project: ClientProject) => void
  onNavigateToTab: (tabId: string) => void
  onOpenCreateModal: () => void
  onLogout?: () => void
  isDarkMode?: boolean
}

const ACTIVE_STAGES = ['Novo projeto', 'Em desenvolvimento', 'Aguardando revisão'] as const
type StageFilter = 'todos' | (typeof ACTIVE_STAGES)[number]

const STAGE_TONE: Record<string, Tone> = {
  'Novo projeto': 'violet',
  'Em desenvolvimento': 'accent',
  'Aguardando revisão': 'warning',
  'Concluído': 'success',
}
const STAGE_BAR: Record<string, string> = {
  'Novo projeto': 'bg-violet-500',
  'Em desenvolvimento': 'bg-crm-accent',
  'Aguardando revisão': 'bg-amber-500',
}

const DAY_MS = 24 * 60 * 60 * 1000
const METRICS_CACHE_KEY = 'dashboard-metrics'

/** Days from today until the deadline (negative when overdue); null without a valid date. */
function daysUntil(deadline?: string | null) {
  if (!deadline) return null
  const date = new Date(deadline.length === 10 ? `${deadline}T00:00:00` : deadline)
  if (isNaN(date.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return Math.round((date.getTime() - today.getTime()) / DAY_MS)
}

function DeadlineCell({ deadline }: { deadline?: string | null }) {
  const days = daysUntil(deadline)
  if (days === null) return <span className="text-crm-subtle">Sem prazo</span>
  return (
    <span className="flex flex-col gap-0.5">
      <span className="tabular-nums text-crm-muted">{formatDateBR(deadline ?? undefined)}</span>
      {days < 0 ? (
        <span className="text-[11.5px] font-medium text-rose-600 dark:text-rose-400">Atrasado {Math.abs(days)} {Math.abs(days) === 1 ? 'dia' : 'dias'}</span>
      ) : days <= 7 ? (
        <span className="text-[11.5px] font-medium text-amber-700 dark:text-amber-400">{days === 0 ? 'Vence hoje' : `Em ${days} ${days === 1 ? 'dia' : 'dias'}`}</span>
      ) : (
        <span className="text-[11.5px] text-crm-subtle">Em {days} dias</span>
      )}
    </span>
  )
}

function CountRow({ color, label, hint, value, loading, onClick }: { color: string; label: string; hint: string; value: number; loading: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-crm-surface-2"
    >
      <span className="min-w-0">
        <span className="flex items-center gap-2 text-[13px] font-medium text-crm-fg">
          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', color)} />
          {label}
        </span>
        <span className="mt-0.5 block pl-3.5 text-[12px] text-crm-subtle">{hint}</span>
      </span>
      <span className="text-[18px] font-semibold tabular-nums tracking-[-0.02em] text-crm-fg">
        {loading ? <span className="crm-shimmer inline-block h-5 w-8 rounded-md align-middle" /> : value}
      </span>
    </button>
  )
}

export function DashboardOverviewTab({
  projects = [],
  userProfile,
  onOpenProjectDetail,
  onNavigateToTab,
}: DashboardOverviewTabProps) {
  const [statusFilter, setStatusFilter] = useState<StageFilter>('todos')
  const [responsibleFilter, setResponsibleFilter] = useState('todos')
  // Cached counters paint at once after a reload; fresh ones replace them when they arrive.
  const [metrics, setMetrics] = useState<DashboardMetricsDTO>(DEFAULT_CRM_METRICS)
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)

  useEffect(() => {}, [])

  const totalProjectsCount = projects.length

  const completedProjectsCount = useMemo(() => {
    return projects.filter((p) => normalizeProjectStage(p.status) === 'Concluído').length
  }, [projects])

  const inProgressProjectsCount = useMemo(() => {
    return projects.filter((p) => normalizeProjectStage(p.status) === 'Em desenvolvimento').length
  }, [projects])

  // Active Projects (excluding Concluído and Cancelado), closest deadline first
  const activeProjects = useMemo(() => {
    return projects
      .filter((p) => {
        const stage = normalizeProjectStage(p.status)
        return stage !== 'Concluído' && stage !== 'Cancelado'
      })
      .sort((a, b) => (daysUntil(a.deadline) ?? Infinity) - (daysUntil(b.deadline) ?? Infinity))
  }, [projects])

  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    activeProjects.forEach((p) => {
      const stage = normalizeProjectStage(p.status)
      counts[stage] = (counts[stage] ?? 0) + 1
    })
    return counts
  }, [activeProjects])

  const overdueCount = useMemo(() => activeProjects.filter((p) => (daysUntil(p.deadline) ?? 0) < 0).length, [activeProjects])
  const dueThisWeekCount = useMemo(() => activeProjects.filter((p) => {
    const days = daysUntil(p.deadline)
    return days !== null && days >= 0 && days <= 7
  }).length, [activeProjects])

  const uniqueResponsibles = useMemo(() => {
    return Array.from(new Set(activeProjects.map((p) => p.responsible_user_name).filter(Boolean))) as string[]
  }, [activeProjects])

  const filteredActiveProjects = useMemo(() => {
    return activeProjects.filter((p) => {
      const stage = normalizeProjectStage(p.status)
      const matchesStatus = statusFilter === 'todos' || stage === statusFilter
      const matchesResp = responsibleFilter === 'todos' || p.responsible_user_name === responsibleFilter
      return matchesStatus && matchesResp
    })
  }, [activeProjects, statusFilter, responsibleFilter])

  const commercial = metrics?.commercial
  const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0)
  // Pipeline stages are cumulative downstream: a lead that replied was also contacted.
  const reachedContact = (commercial?.contacted ?? 0) + (commercial?.replied ?? 0) + (commercial?.proposals ?? 0)
  const reachedReply = (commercial?.replied ?? 0) + (commercial?.proposals ?? 0)
  const funnel: { label: string; value: number; rate?: number; rateLabel?: string; highlight?: boolean }[] = [
    { label: 'Novos', value: commercial?.new ?? 0 },
    { label: 'Quentes', value: commercial?.qualified ?? 0, rate: pct(commercial?.qualified ?? 0, commercial?.total ?? 0), rateLabel: 'da base', highlight: true },
    { label: 'Contatados', value: commercial?.contacted ?? 0, rate: pct(reachedContact, commercial?.total ?? 0), rateLabel: 'da base' },
    { label: 'Responderam', value: commercial?.replied ?? 0, rate: pct(reachedReply, reachedContact), rateLabel: 'de resposta' },
    { label: 'Propostas', value: commercial?.proposals ?? 0, rate: pct(commercial?.proposals ?? 0, reachedReply), rateLabel: 'convertidos' },
  ]
  const conversationStats = [
    { label: 'Abertas', value: metrics?.conversations.open ?? 0 },
    { label: 'Não lidas', value: metrics?.conversations.unread ?? 0 },
    { label: 'Janela 24h acabando', value: metrics?.conversations.window_expiring ?? 0, alert: (metrics?.conversations.window_expiring ?? 0) > 0 },
  ]
  const funnelMax = Math.max(1, ...funnel.map((step) => step.value))

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const summary = [
    overdueCount > 0 && `${overdueCount} ${overdueCount === 1 ? 'projeto atrasado' : 'projetos atrasados'}`,
    dueThisWeekCount > 0 && `${dueThisWeekCount} ${dueThisWeekCount === 1 ? 'entrega' : 'entregas'} nos próximos 7 dias`,
  ].filter(Boolean).join(' · ')

  return (
    <div className="flex flex-col gap-6 font-sans text-crm-fg xl:min-h-[calc(100dvh-7.5rem)]">
      {/* 1. Cabeçalho */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.025em] text-crm-fg">
            Olá, {userProfile?.full_name?.split(' ')[0] || 'Administrador'}.{' '}
            <span className="text-crm-subtle">Este é o dia da ANXIS.</span>
          </h1>
          <p className="mt-1 text-[13.5px] text-crm-muted">
            <span className="first-letter:uppercase inline-block">{today}</span>
            {summary && <> · {summary}</>}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToTab('pricing_calculator')}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg bg-crm-primary px-4 text-[12.5px] font-medium text-white shadow-sm transition-colors hover:bg-crm-primary-hover dark:bg-crm-fg dark:text-crm-canvas dark:hover:bg-crm-muted"
          title="Ir para a Precificação e gerar orçamento"
        >
          <HugeiconsIcon icon={Calculator01Icon} className="h-4 w-4" strokeWidth={1.6} />
          Gerar orçamento
        </button>
      </div>

      {/* 2. Indicadores do dia */}
      <div className="crm-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Aguardando resposta"
          value={metrics?.conversations.waiting_agent ?? 0}
          loading={isLoadingMetrics}
          tone="warning"
          hint="Contatos qualificados aguardando retorno"
          icon={<HugeiconsIcon icon={BubbleChatDelayIcon} strokeWidth={1.6} />}
          onClick={() => onNavigateToTab('conversations')}
          title="Ver contatos qualificados aguardando resposta"
        />
        <StatCard
          label="Leads quentes"
          value={metrics?.commercial.qualified ?? 0}
          loading={isLoadingMetrics}
          tone="success"
          hint="Prontos para prospecção"
          icon={<HugeiconsIcon icon={UserCheck01Icon} strokeWidth={1.6} />}
          onClick={() => onNavigateToTab('prospecting')}
          title="Ver leads quentes"
        />
        <StatCard
          label="Projetos em andamento"
          value={inProgressProjectsCount}
          suffix="ativos"
          tone={overdueCount > 0 ? 'danger' : 'accent'}
          hint={overdueCount > 0 ? `${overdueCount} com prazo vencido` : 'Em desenvolvimento ativo'}
          icon={<HugeiconsIcon icon={Folder01Icon} strokeWidth={1.6} />}
          onClick={() => onNavigateToTab('kanban_board')}
          title="Ver quadro Kanban"
        />
        <StatCard
          label="Projetos concluídos"
          value={completedProjectsCount}
          suffix={`de ${totalProjectsCount}`}
          tone="success"
          progress={totalProjectsCount ? completedProjectsCount / totalProjectsCount : 0}
          icon={<HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={1.6} />}
          onClick={() => onNavigateToTab('client_projects')}
          title="Ver histórico de projetos"
        />
      </div>

      {/* 3. Projetos + Conversas + Comercial lado a lado, mesma altura */}
      <div className="grid flex-1 grid-cols-1 gap-5 xl:grid-cols-12">
        <Panel
          className="xl:col-span-7"
          title="Projetos em andamento"
          description="Ordenados pelo prazo mais próximo"
          bodyClassName="flex flex-col p-0"
          actions={
            <>
              <Segmented
                id="dashboard-stage"
                size="sm"
                value={statusFilter}
                onChange={setStatusFilter}
                className="flex-wrap"
                options={[
                  { value: 'todos', label: `Todos ${activeProjects.length}` },
                  ...ACTIVE_STAGES.map((stage) => ({ value: stage, label: `${stage === 'Aguardando revisão' ? 'Em revisão' : stage === 'Novo projeto' ? 'Novos' : 'Em dev.'} ${stageCounts[stage] ?? 0}` })),
                ]}
              />
              {uniqueResponsibles.length > 0 && (
                <div className="relative">
                  <select
                    value={responsibleFilter}
                    onChange={(e) => setResponsibleFilter(e.target.value)}
                    aria-label="Filtrar por responsável"
                    className="h-8 cursor-pointer appearance-none rounded-lg border border-crm-border bg-crm-surface pl-3 pr-7 text-[12px] font-medium text-crm-muted outline-none transition-colors hover:border-crm-border-strong"
                  >
                    <option value="todos">Todos os responsáveis</option>
                    {uniqueResponsibles.map((resp) => (
                      <option key={resp} value={resp}>{resp}</option>
                    ))}
                  </select>
                  <HugeiconsIcon icon={ArrowDown01Icon} className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-crm-subtle" strokeWidth={1.6} />
                </div>
              )}
            </>
          }
        >
          {/* Distribuição por etapa */}
          {activeProjects.length > 0 && (
            <div className="border-b border-crm-border px-5 py-4">
              <div className="flex h-1.5 overflow-hidden rounded-full bg-crm-fg/[0.06]">
                {ACTIVE_STAGES.map((stage) => (
                  <motion.span
                    key={stage}
                    className={cn('h-full', STAGE_BAR[stage])}
                    initial={{ width: 0 }}
                    animate={{ width: `${((stageCounts[stage] ?? 0) / activeProjects.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                ))}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-crm-subtle">
                {ACTIVE_STAGES.map((stage) => (
                  <span key={stage} className="flex items-center gap-1.5">
                    <span className={cn('h-1.5 w-1.5 rounded-full', STAGE_BAR[stage])} />
                    {stage} <span className="tabular-nums text-crm-fg">{stageCounts[stage] ?? 0}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {filteredActiveProjects.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
            <EmptyState
              icon={<HugeiconsIcon icon={Folder01Icon} strokeWidth={1.6} />}
              title={activeProjects.length ? 'Nenhum projeto neste filtro' : 'Nenhum projeto em andamento'}
              description={activeProjects.length ? 'Troque a etapa ou o responsável para ver outros projetos.' : 'Os projetos criados a partir dos orçamentos aparecem aqui.'}
            />
            </div>
          ) : (
            <div className="max-h-[360px] flex-1 overflow-auto overscroll-contain">
              <table className="w-full min-w-[560px] border-collapse text-left text-[13px]">
                <thead>
                  <tr className="text-[12px] text-crm-subtle">
                    <th className="sticky top-0 z-10 border-b border-crm-border bg-crm-surface px-5 py-2.5 font-medium">Projeto</th>
                    <th className="sticky top-0 z-10 border-b border-crm-border bg-crm-surface px-3 py-2.5 font-medium">Responsável</th>
                    <th className="sticky top-0 z-10 border-b border-crm-border bg-crm-surface px-3 py-2.5 font-medium">Prazo</th>
                    <th className="sticky top-0 z-10 border-b border-crm-border bg-crm-surface px-5 py-2.5 font-medium">Etapa</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActiveProjects.map((project) => {
                    const stage = normalizeProjectStage(project.status)
                    return (
                      <tr
                        key={project.id}
                        onClick={() => onOpenProjectDetail(project)}
                        className="group cursor-pointer border-b border-crm-border/70 transition-colors last:border-0 hover:bg-crm-surface-2"
                        title="Abrir detalhes do projeto"
                      >
                        <td className="max-w-[280px] px-5 py-3">
                          <div className="truncate font-medium text-crm-fg">{project.title}</div>
                          <div className="truncate text-[12px] text-crm-subtle">{project.client_name}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-crm-muted">{project.responsible_user_name || <span className="text-crm-subtle">—</span>}</td>
                        <td className="whitespace-nowrap px-3 py-3"><DeadlineCell deadline={project.deadline} /></td>
                        <td className="whitespace-nowrap px-5 py-3">
                          <span className="flex items-center justify-between gap-3">
                            <Badge tone={STAGE_TONE[stage] ?? 'neutral'} dot>{stage}</Badge>
                            <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5 text-crm-subtle opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" strokeWidth={1.6} />
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-crm-border px-5 py-3 text-[12px] text-crm-subtle">
            <span>
              <span className="tabular-nums text-crm-fg">{filteredActiveProjects.length}</span> de <span className="tabular-nums text-crm-fg">{activeProjects.length}</span> ativos
            </span>
            <button
              type="button"
              onClick={() => onNavigateToTab('kanban_board')}
              className="group flex items-center gap-1 font-medium text-crm-muted transition-colors hover:text-crm-fg"
            >
              Ver quadro Kanban
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.6} />
            </button>
          </div>
        </Panel>

        <Panel className="xl:col-span-5" title="Conversas" description="Atendimento e retorno no WhatsApp" bodyClassName="flex flex-col p-0">
          <div className="p-3">
            <CountRow
              color="bg-amber-500"
              label="Aguardando resposta"
              hint="Contatos qualificados aguardando a equipe"
              value={metrics?.conversations.waiting_agent ?? 0}
              loading={isLoadingMetrics}
              onClick={() => onNavigateToTab('conversations')}
            />
            <CountRow
              color="bg-crm-accent"
              label="Aguardando cliente"
              hint="Resposta enviada ao lead"
              value={metrics?.conversations.waiting_customer ?? 0}
              loading={isLoadingMetrics}
              onClick={() => onNavigateToTab('conversations')}
            />
            <CountRow
              color="bg-crm-subtle"
              label="Não atribuídas"
              hint="Sem operador responsável"
              value={metrics?.conversations.unassigned ?? 0}
              loading={isLoadingMetrics}
              onClick={() => onNavigateToTab('conversations')}
            />
          </div>
          <dl className="mt-auto grid grid-cols-3 divide-x divide-crm-border border-t border-crm-border">
            {conversationStats.map((stat) => (
              <div key={stat.label} className="px-4 py-3">
                <dt className="text-[11.5px] text-crm-subtle">{stat.label}</dt>
                <dd className={cn('mt-0.5 text-[16px] font-semibold tabular-nums tracking-[-0.02em]', stat.alert ? 'text-rose-600 dark:text-rose-400' : 'text-crm-fg')}>
                  {isLoadingMetrics ? '—' : stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      {/* 4. Funil comercial em largura total */}
      <Panel
        title="Comercial"
        description="Funil de prospecção e conversão entre etapas"
        bodyClassName="p-0"
        actions={
          <button
            type="button"
            onClick={() => onNavigateToTab('prospecting')}
            className="group flex items-center gap-1 text-[12px] font-medium text-crm-muted transition-colors hover:text-crm-fg"
          >
            Abrir Leads
            <HugeiconsIcon icon={ArrowRight01Icon} className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.6} />
          </button>
        }
      >
        <ol className="grid grid-cols-2 divide-crm-border sm:grid-cols-3 xl:grid-cols-5 xl:divide-x">
          {funnel.map((step, index) => (
            <li key={step.label} className="flex flex-col gap-2 px-5 py-4">
              <div className="flex items-baseline justify-between gap-2 text-[12.5px]">
                <span className="text-crm-muted">{step.label}</span>
                {step.rate !== undefined && !isLoadingMetrics && (
                  <span className="text-[11.5px] tabular-nums text-crm-subtle">{step.rate}% {step.rateLabel}</span>
                )}
              </div>
              <span className="text-[22px] font-semibold tabular-nums tracking-[-0.02em] text-crm-fg">
                {isLoadingMetrics ? <span className="crm-shimmer inline-block h-6 w-12 rounded-md align-middle" /> : step.value}
              </span>
              <div className="h-1.5 overflow-hidden rounded-full bg-crm-fg/[0.06]">
                <motion.div
                  className={cn('h-full rounded-full', step.highlight ? 'bg-emerald-500' : 'bg-crm-fg/70')}
                  initial={{ width: 0 }}
                  animate={{ width: isLoadingMetrics ? 0 : `${(step.value / funnelMax) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  )
}
