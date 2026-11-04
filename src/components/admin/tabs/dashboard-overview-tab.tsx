'use client'

import { useState, useEffect, useMemo } from 'react'
import { ClientProject } from '@/types/client-project.types'
import { UserProfileWithRole } from '@/lib/auth/permissions'
import { normalizeProjectStage, formatDateBR } from '@/components/admin/tabs/kanban-board-tab'
import { getDashboardMetricsAction, DashboardMetricsDTO } from '@/lib/actions/dashboard'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Calculator01Icon,
  EyeIcon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  BubbleChatDelayIcon,
  UserCheck01Icon,
  Folder01Icon,
  Comment01Icon,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'

interface DashboardOverviewTabProps {
  projects: ClientProject[]
  userProfile: UserProfileWithRole | null
  onOpenProjectDetail: (project: ClientProject) => void
  onNavigateToTab: (tabId: string) => void
  onOpenCreateModal: () => void
  onLogout?: () => void
  isDarkMode?: boolean
}

export function DashboardOverviewTab({
  projects = [],
  userProfile,
  onOpenProjectDetail,
  onNavigateToTab,
  isDarkMode = false,
}: DashboardOverviewTabProps) {
  const [statusFilter, setStatusFilter] = useState('todos')
  const [responsibleFilter, setResponsibleFilter] = useState('todos')
  const [metrics, setMetrics] = useState<DashboardMetricsDTO | null>(null)
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true)

  useEffect(() => {
    let isMounted = true
    getDashboardMetricsAction()
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setMetrics(res.data)
        }
      })
      .catch((err) => {
        console.error('Falha ao carregar métricas do dashboard:', err)
      })
      .finally(() => {
        if (isMounted) setIsLoadingMetrics(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  // Project Metrics
  const totalProjectsCount = projects.length

  const completedProjectsCount = useMemo(() => {
    return projects.filter((p) => normalizeProjectStage(p.status) === 'Concluído').length
  }, [projects])

  const inProgressProjectsCount = useMemo(() => {
    return projects.filter((p) => normalizeProjectStage(p.status) === 'Em desenvolvimento').length
  }, [projects])

  // Active Projects (excluding Concluído and Cancelado)
  const activeProjects = useMemo(() => {
    return projects.filter((p) => {
      const stage = normalizeProjectStage(p.status)
      return stage !== 'Concluído' && stage !== 'Cancelado'
    })
  }, [projects])

  // Unique responsibles among active projects
  const uniqueResponsibles = useMemo(() => {
    return Array.from(new Set(activeProjects.map((p) => p.responsible_user_name).filter(Boolean))) as string[]
  }, [activeProjects])

  // Filtered active projects
  const filteredActiveProjects = useMemo(() => {
    return activeProjects.filter((p) => {
      const stage = normalizeProjectStage(p.status)
      const matchesStatus = statusFilter === 'todos' || stage === statusFilter
      const matchesResp = responsibleFilter === 'todos' || p.responsible_user_name === responsibleFilter
      return matchesStatus && matchesResp
    })
  }, [activeProjects, statusFilter, responsibleFilter])

  const getStatusPillStyle = (stage: string) => {
    switch (stage) {
      case 'Concluído':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60'
      case 'Em desenvolvimento':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60'
      case 'Aguardando revisão':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60'
      case 'Novo projeto':
        return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60'
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-700/60'
    }
  }

  return (
    <div
      className={cn(
        'max-w-full space-y-6 overflow-hidden font-sans transition-colors lg:flex lg:h-[calc(100dvh-7.5rem)] lg:min-h-[600px] lg:flex-col lg:gap-6 lg:space-y-0',
        isDarkMode ? 'text-white' : 'text-slate-900'
      )}
    >
      {/* 1. TOP HEADER ROW */}
      <div className="flex shrink-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className={cn('text-xl font-bold tracking-tight flex items-center gap-2', isDarkMode ? 'text-white' : 'text-slate-900')}>
            <span>Olá, {userProfile?.full_name || 'Administrador'}</span>
            <span>👋</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visão geral operacional de conversas, prospecção e projetos da ANXIS.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateToTab('pricing_calculator')}
          className={cn(
            'h-9 px-4 rounded-lg text-xs font-semibold text-white shadow-xs transition-colors shrink-0 flex items-center gap-2 cursor-pointer',
            isDarkMode
              ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
              : 'bg-[#2E3E4F] hover:bg-[#182331]'
          )}
          title="Ir para a aba de Precificação e gerar orçamento"
        >
          <HugeiconsIcon icon={Calculator01Icon} className="w-4 h-4" strokeWidth={1.5} />
          <span>Gerar orçamento</span>
        </button>
      </div>

      {/* 2. 4-CARD METRIC GRID (Ordem exata solicitada) */}
      <div className="grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* CARD 1: AGUARDANDO RESPOSTA */}
        <div
          onClick={() => onNavigateToTab('conversations')}
          className={cn(
            'rounded-lg p-5 border shadow-xs transition-all cursor-pointer group',
            isDarkMode
              ? 'bg-[#16181D] border-slate-800 hover:border-slate-700'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          )}
          title="Ver conversas aguardando resposta"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Aguardando resposta</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <HugeiconsIcon icon={BubbleChatDelayIcon} className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {isLoadingMetrics ? '—' : (metrics?.conversations.waiting_agent ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400 font-normal mt-1">Aguardando retorno da equipe</div>
        </div>

        {/* CARD 2: LEADS QUENTES */}
        <div
          onClick={() => onNavigateToTab('prospecting')}
          className={cn(
            'rounded-lg p-5 border shadow-xs transition-all cursor-pointer group',
            isDarkMode
              ? 'bg-[#16181D] border-slate-800 hover:border-slate-700'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          )}
          title="Ver leads quentes"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Leads quentes</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <HugeiconsIcon icon={UserCheck01Icon} className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {isLoadingMetrics ? '—' : (metrics?.commercial.qualified ?? 0)}
          </div>
          <div className="text-[11px] text-slate-400 font-normal mt-1">Prontos para prospecção</div>
        </div>

        {/* CARD 3: PROJETOS EM ANDAMENTO */}
        <div
          onClick={() => onNavigateToTab('kanban_board')}
          className={cn(
            'rounded-lg p-5 border shadow-xs transition-all cursor-pointer group',
            isDarkMode
              ? 'bg-[#16181D] border-slate-800 hover:border-slate-700'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          )}
          title="Ver quadro Kanban"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Projetos em andamento</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <HugeiconsIcon icon={Folder01Icon} className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className={cn('text-2xl font-bold tracking-tight', isDarkMode ? 'text-white' : 'text-slate-900')}>
            {inProgressProjectsCount} <span className="text-xs font-normal text-slate-400">ativos</span>
          </div>
          <div className="text-[11px] text-slate-400 font-normal mt-1">Em desenvolvimento ativo</div>
        </div>

        {/* CARD 4: PROJETOS CONCLUÍDOS */}
        <div
          onClick={() => onNavigateToTab('client_projects')}
          className={cn(
            'rounded-lg p-5 border shadow-xs transition-all cursor-pointer group',
            isDarkMode
              ? 'bg-[#16181D] border-slate-800 hover:border-slate-700'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          )}
          title="Ver histórico de projetos"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Projetos concluídos</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className={cn('text-2xl font-bold tracking-tight', isDarkMode ? 'text-white' : 'text-slate-900')}>
            {completedProjectsCount} <span className="text-xs font-normal text-slate-400">de {totalProjectsCount}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-normal mt-1">Entregas finalizadas</div>
        </div>
      </div>

      {/* 3. LOWER SECTION: PROJETOS EM ANDAMENTO (ESQUERDA) + CONVERSAS & COMERCIAL (DIREITA) */}
      <div className="grid min-h-0 grid-cols-1 items-stretch gap-5 lg:h-full lg:flex-1 lg:grid-cols-12">
        {/* ESQUERDA: PROJETOS EM ANDAMENTO (Tabela limpa, ocupa toda a altura) */}
        <div
          className={cn(
            'flex min-h-[420px] flex-col rounded-lg border p-4 shadow-xs transition-all sm:p-5 lg:col-span-7 lg:h-full lg:min-h-0 xl:col-span-8',
            isDarkMode ? 'bg-[#16181D] border-slate-800' : 'bg-white border-slate-200/80'
          )}
        >
          <div className="flex min-h-0 flex-1 flex-col">
            {/* CABEÇALHO DO BLOCO */}
            <div className={cn('flex shrink-0 flex-col justify-between gap-3 border-b pb-3.5 xl:flex-row xl:items-center', isDarkMode ? 'border-slate-800' : 'border-slate-100')}>
              <div>
                <h3 className={cn('text-sm font-semibold', isDarkMode ? 'text-white' : 'text-slate-900')}>
                  Projetos em andamento
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Acompanhamento de entregas e demandas ativas.
                </p>
              </div>

              {/* FILTROS */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-0 flex-1 sm:flex-none">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={cn(
                      'w-full pl-3 pr-7 py-1 rounded-lg border text-xs font-medium appearance-none outline-none cursor-pointer transition-colors sm:w-auto',
                      isDarkMode
                        ? 'bg-[#1C202B] border-slate-700 text-slate-300'
                        : 'bg-white border-slate-200 text-slate-700'
                    )}
                  >
                    <option value="todos">Status: Todos ativos</option>
                    <option value="Novo projeto">Novo projeto</option>
                    <option value="Em desenvolvimento">Em desenvolvimento</option>
                    <option value="Aguardando revisão">Aguardando revisão</option>
                  </select>
                  <HugeiconsIcon icon={ArrowDown01Icon} className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" strokeWidth={1.5} />
                </div>

                <div className="relative min-w-0 flex-1 sm:flex-none">
                  <select
                    value={responsibleFilter}
                    onChange={(e) => setResponsibleFilter(e.target.value)}
                    className={cn(
                      'w-full pl-3 pr-7 py-1 rounded-lg border text-xs font-medium appearance-none outline-none cursor-pointer transition-colors sm:w-auto',
                      isDarkMode
                        ? 'bg-[#1C202B] border-slate-700 text-slate-300'
                        : 'bg-white border-slate-200 text-slate-700'
                    )}
                  >
                    <option value="todos">Responsável: Todos</option>
                    {uniqueResponsibles.map((resp) => (
                      <option key={resp} value={resp}>
                        {resp}
                      </option>
                    ))}
                  </select>
                  <HugeiconsIcon icon={ArrowDown01Icon} className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" strokeWidth={1.5} />
                </div>
              </div>
            </div>

            {/* TABELA DE PROJETOS ATIVOS */}
            <div className="mt-4 min-h-0 flex-1 overflow-auto overscroll-contain">
              <table className="w-full text-left text-xs border-collapse min-w-[480px]">
                <thead>
                  <tr className={cn('font-semibold uppercase tracking-wider text-[10px] border-b', isDarkMode ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-100')}>
                    <th className={cn('sticky top-0 z-10 pb-2.5 whitespace-nowrap', isDarkMode ? 'bg-[#16181D]' : 'bg-white')}>Projeto & Cliente</th>
                    <th className={cn('sticky top-0 z-10 pb-2.5 whitespace-nowrap', isDarkMode ? 'bg-[#16181D]' : 'bg-white')}>Prazo</th>
                    <th className={cn('sticky top-0 z-10 pb-2.5 whitespace-nowrap', isDarkMode ? 'bg-[#16181D]' : 'bg-white')}>Status</th>
                    <th className={cn('sticky top-0 z-10 pb-2.5 text-right whitespace-nowrap', isDarkMode ? 'bg-[#16181D]' : 'bg-white')}>Ação</th>
                  </tr>
                </thead>
                <tbody className={cn('divide-y font-normal', isDarkMode ? 'divide-slate-800/80' : 'divide-slate-100')}>
                  {filteredActiveProjects.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400 text-xs italic">
                        Nenhum projeto ativo em andamento no momento.
                      </td>
                    </tr>
                  ) : (
                    filteredActiveProjects.map((project) => {
                      const normStage = normalizeProjectStage(project.status)
                      const pillClass = getStatusPillStyle(normStage)

                      return (
                        <tr key={project.id} className={cn('transition-colors', isDarkMode ? 'hover:bg-[#202530]' : 'hover:bg-slate-50/80')}>
                          {/* PROJETO & CLIENTE */}
                          <td className="py-3 max-w-[240px]">
                            <div className={cn('font-semibold text-xs truncate', isDarkMode ? 'text-white' : 'text-slate-900')}>
                              {project.title}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">{project.client_name}</div>
                          </td>

                          {/* PRAZO FORMATADO */}
                          <td className={cn('py-3 font-medium whitespace-nowrap text-[11px]', isDarkMode ? 'text-slate-300' : 'text-slate-600')}>
                            {formatDateBR(project.deadline)}
                          </td>

                          {/* STATUS */}
                          <td className="py-3 whitespace-nowrap">
                            <span
                              className={cn(
                                'inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border',
                                pillClass
                              )}
                            >
                              {normStage}
                            </span>
                          </td>

                          {/* AÇÃO */}
                          <td className="py-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onOpenProjectDetail(project)}
                              className={cn(
                                'p-1.5 rounded-md transition-colors cursor-pointer border',
                                isDarkMode
                                  ? 'bg-[#1C202B] border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              )}
                              title="Ver Detalhes do Projeto"
                            >
                              <HugeiconsIcon icon={EyeIcon} className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RODAPÉ DO BLOCO DE PROJETOS */}
          <div className={cn('mt-4 flex shrink-0 items-center justify-between gap-3 border-t pt-4', isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500')}>
            <span className="text-xs">
              Exibindo <span className="font-semibold">{filteredActiveProjects.length}</span> de <span className="font-semibold">{activeProjects.length}</span> ativos
            </span>
            <button
              type="button"
              onClick={() => onNavigateToTab('kanban_board')}
              className={cn(
                'text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer hover:underline',
                isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
              )}
            >
              <span>Ver quadro Kanban</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* DIREITA: 2 BLOCOS EMPILHADOS (Conversas e Comercial, ~50% cada, mesma altura visual) */}
        <div className="grid min-h-0 gap-4 lg:col-span-5 lg:h-full lg:grid-rows-2 xl:col-span-4">
          {/* BLOCO 1: CONVERSAS */}
          <div
            className={cn(
              'flex min-h-0 flex-col overflow-hidden rounded-lg border p-4 shadow-xs transition-all xl:p-5',
              isDarkMode ? 'bg-[#16181D] border-slate-800' : 'bg-white border-slate-200/80'
            )}
          >
            {/* CABEÇALHO */}
            <div className={cn('flex shrink-0 items-center justify-between border-b pb-3', isDarkMode ? 'border-slate-800' : 'border-slate-100')}>
                <div>
                  <h3 className={cn('text-sm font-semibold', isDarkMode ? 'text-white' : 'text-slate-900')}>
                    Conversas
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Atendimento e retorno no WhatsApp</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <HugeiconsIcon icon={Comment01Icon} className="w-4 h-4" strokeWidth={1.5} />
                </div>
            </div>

            {/* MÉTRICAS DE CONVERSAS */}
            <div className="mt-2 min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto overscroll-contain pr-1 dark:divide-slate-800/80">
                {/* Aguardando resposta */}
                <div className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className={cn('text-xs font-medium flex items-center gap-1.5', isDarkMode ? 'text-slate-200' : 'text-slate-800')}>
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span>Aguardando resposta</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-3.5">Aguardando ação da equipe</p>
                  </div>
                  <span className="text-sm font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                    {isLoadingMetrics ? '—' : (metrics?.conversations.waiting_agent ?? 0)}
                  </span>
                </div>

                {/* Aguardando cliente */}
                <div className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className={cn('text-xs font-medium flex items-center gap-1.5', isDarkMode ? 'text-slate-200' : 'text-slate-800')}>
                      <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                      <span>Aguardando cliente</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-3.5">Resposta enviada ao lead</p>
                  </div>
                  <span className={cn('text-sm font-bold px-2 py-0.5 rounded-md border', isDarkMode ? 'bg-[#1C202B] border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700')}>
                    {isLoadingMetrics ? '—' : (metrics?.conversations.waiting_customer ?? 0)}
                  </span>
                </div>

                {/* Não atribuídas */}
                <div className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className={cn('text-xs font-medium flex items-center gap-1.5', isDarkMode ? 'text-slate-200' : 'text-slate-800')}>
                      <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                      <span>Não atribuídas</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-3.5">Sem operador responsável</p>
                  </div>
                  <span className={cn('text-sm font-bold px-2 py-0.5 rounded-md border', isDarkMode ? 'bg-[#1C202B] border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700')}>
                    {isLoadingMetrics ? '—' : (metrics?.conversations.unassigned ?? 0)}
                  </span>
                </div>
            </div>

            {/* AÇÃO CONVERSAS */}
            <button
              type="button"
              onClick={() => onNavigateToTab('conversations')}
              className={cn(
                'mt-3 flex h-8 w-full shrink-0 items-center justify-between rounded-lg border px-3 text-xs font-medium transition-colors group cursor-pointer',
                isDarkMode
                  ? 'bg-[#1C202B] hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
              )}
            >
              <span>Ver todas as conversas</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
            </button>
          </div>

          {/* BLOCO 2: COMERCIAL */}
          <div
            className={cn(
              'flex min-h-0 flex-col overflow-hidden rounded-lg border p-4 shadow-xs transition-all xl:p-5',
              isDarkMode ? 'bg-[#16181D] border-slate-800' : 'bg-white border-slate-200/80'
            )}
          >
            {/* CABEÇALHO */}
            <div className={cn('flex shrink-0 items-center justify-between border-b pb-3', isDarkMode ? 'border-slate-800' : 'border-slate-100')}>
                <div>
                  <h3 className={cn('text-sm font-semibold', isDarkMode ? 'text-white' : 'text-slate-900')}>
                    Comercial
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Pipeline de Leads e Prospecção</p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <HugeiconsIcon icon={UserCheck01Icon} className="w-4 h-4" strokeWidth={1.5} />
                </div>
            </div>

            {/* GRID DE ESTÁGIOS DO PIPELINE (Sem qualquer dado financeiro) */}
            <div className="mt-3 grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-y-auto overscroll-contain pr-1">
                {/* Novos */}
                <div className={cn('p-2.5 rounded-lg border flex flex-col justify-between', isDarkMode ? 'bg-[#1C202B]/60 border-slate-800/80' : 'bg-slate-50/70 border-slate-100')}>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Novos</span>
                  <span className={cn('text-base font-bold tracking-tight mt-0.5', isDarkMode ? 'text-white' : 'text-slate-900')}>
                    {isLoadingMetrics ? '—' : (metrics?.commercial.new ?? 0)}
                  </span>
                </div>

                {/* Quentes */}
                <div className={cn('p-2.5 rounded-lg border flex flex-col justify-between', isDarkMode ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' : 'bg-emerald-50/50 border-emerald-100 text-emerald-800')}>
                  <span className="text-[11px] font-medium">Quentes</span>
                  <span className="text-base font-bold tracking-tight mt-0.5 text-emerald-600 dark:text-emerald-400">
                    {isLoadingMetrics ? '—' : (metrics?.commercial.qualified ?? 0)}
                  </span>
                </div>

                {/* Contatados */}
                <div className={cn('p-2.5 rounded-lg border flex flex-col justify-between', isDarkMode ? 'bg-[#1C202B]/60 border-slate-800/80' : 'bg-slate-50/70 border-slate-100')}>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Contatados</span>
                  <span className={cn('text-base font-bold tracking-tight mt-0.5', isDarkMode ? 'text-white' : 'text-slate-900')}>
                    {isLoadingMetrics ? '—' : (metrics?.commercial.contacted ?? 0)}
                  </span>
                </div>

                {/* Responderam */}
                <div className={cn('p-2.5 rounded-lg border flex flex-col justify-between', isDarkMode ? 'bg-[#1C202B]/60 border-slate-800/80' : 'bg-slate-50/70 border-slate-100')}>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Responderam</span>
                  <span className={cn('text-base font-bold tracking-tight mt-0.5', isDarkMode ? 'text-white' : 'text-slate-900')}>
                    {isLoadingMetrics ? '—' : (metrics?.commercial.replied ?? 0)}
                  </span>
                </div>

                {/* Propostas */}
                <div className={cn('col-span-2 p-2.5 rounded-lg border flex items-center justify-between', isDarkMode ? 'bg-[#1C202B]/60 border-slate-800/80' : 'bg-slate-50/70 border-slate-100')}>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Propostas em negociação</span>
                  <span className={cn('text-base font-bold tracking-tight', isDarkMode ? 'text-white' : 'text-slate-900')}>
                    {isLoadingMetrics ? '—' : (metrics?.commercial.proposals ?? 0)}
                  </span>
                </div>
            </div>

            {/* AÇÃO COMERCIAL */}
            <button
              type="button"
              onClick={() => onNavigateToTab('prospecting')}
              className={cn(
                'mt-3 flex h-8 w-full shrink-0 items-center justify-between rounded-lg border px-3 text-xs font-medium transition-colors group cursor-pointer',
                isDarkMode
                  ? 'bg-[#1C202B] hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900'
              )}
            >
              <span>Acessar Workspace de Leads</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
