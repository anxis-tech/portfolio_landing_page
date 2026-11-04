'use client'

import { useState, useMemo } from 'react'
import { ClientProject } from '@/types/client-project.types'
import { SavedQuote } from '@/types/pricing.types'
import { Contract } from '@/types/contract.types'
import { Payment } from '@/types/payment.types'
import { UserProfileWithRole } from '@/lib/auth/permissions'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Dollar01Icon,
  Calendar01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  AlertCircleIcon,
  Search01Icon,
  FilterIcon,
  UserIcon,
  File01Icon,
  Link01Icon,
  Download01Icon,
  Cancel01Icon,
  ArrowUp01Icon,
  PieChartIcon,
  Briefcase01Icon,
  Globe02Icon,
  Settings01Icon,
  CreditCardIcon,
  Invoice01Icon,
} from '@hugeicons/core-free-icons'
import { cn } from '@/lib/utils'
import { getFinanceProjectSummary } from './finance-project-summary'

export type PeriodFilterOption =
  | 'hoje'
  | 'ultimos_7_dias'
  | 'este_mes'
  | 'mes_anterior'
  | 'ultimos_3_meses'
  | 'este_ano'
  | 'custom'

interface FinanceTabProps {
  projects: ClientProject[]
  quotes: SavedQuote[]
  contracts: Contract[]
  payments: Payment[]
  teamUsers: UserProfileWithRole[]
  userProfile: UserProfileWithRole | null
  canViewValues?: boolean
  canViewPayments?: boolean
  onOpenProjectDetail?: (project: ClientProject) => void
  isDarkMode?: boolean
}

export function FinanceTab({
  projects: sourceProjects = [],
  quotes = [],
  contracts = [],
  payments = [],
  teamUsers = [],
  userProfile,
  canViewValues = true,
  canViewPayments = true,
  onOpenProjectDetail,
  isDarkMode = false,
}: FinanceTabProps) {
  const projects = useMemo(() => sourceProjects.map((project) => getFinanceProjectSummary(project, contracts, payments).project), [sourceProjects, contracts, payments])

  // PERIOD FILTER STATE
  const [period, setPeriod] = useState<PeriodFilterOption>('este_mes')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  // Table Search & Filters State
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [responsibleFilter, setResponsibleFilter] = useState<string>('todos')
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>('todos')
  const [activePendencyFilter, setActivePendencyFilter] = useState<string | null>(null)

  // Chart Grouping State
  const [chartGrouping, setChartGrouping] = useState<'dia' | 'semana' | 'mes'>('dia')

  // Date Range Calculation based on Period
  const dateRange = useMemo(() => {
    const now = new Date()
    let start: Date
    let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    switch (period) {
      case 'hoje':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
        break
      case 'ultimos_7_dias':
        start = new Date(now)
        start.setDate(now.getDate() - 7)
        start.setHours(0, 0, 0, 0)
        break
      case 'este_mes':
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
        break
      case 'mes_anterior':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0)
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
        break
      case 'ultimos_3_meses':
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1, 0, 0, 0, 0)
        break
      case 'este_ano':
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
        break
      case 'custom':
        start = customStartDate ? new Date(customStartDate) : new Date(2020, 0, 1)
        end = customEndDate ? new Date(customEndDate) : new Date(2030, 11, 31)
        break
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    }

    return { start, end }
  }, [period, customStartDate, customEndDate])

  // Helper to check if a date string is within the active dateRange
  const isInPeriod = (dateStr?: string | null) => {
    if (!dateStr) return false
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return false
    return d >= dateRange.start && d <= dateRange.end
  }

  const contractsMapByProjectId = useMemo(() => {
    const map: Record<string, Contract> = {}
    projects.forEach((project) => {
      const active = getFinanceProjectSummary(project, contracts, payments).contract
      if (active) map[project.id] = active
    })
    return map
  }, [projects, contracts, payments])

  const paymentsMapByProjectId = useMemo(() => {
    const map: Record<string, Payment> = {}
    projects.forEach((project) => {
      const contract = contractsMapByProjectId[project.id]
      const relevant = payments.filter((payment) => payment.project_id === project.id && (!contract?.billing_managed || payment.contract_id === contract.id)).sort((a,b) => b.created_at.localeCompare(a.created_at))
      const latest = relevant[0]
      if (!latest) return
      map[project.id] = contract?.billing_managed ? { ...latest, status: project.payment_status === 'Pago' ? 'Pago' : 'Pendente', expected_amount: contract.contract_amount || latest.expected_amount, paid_amount: Math.round((project.paid_value || 0) * 100), paid_at: project.paid_at || null } : latest
    })
    return map
  }, [projects, payments, contractsMapByProjectId])

  // MAIN METRICS ACCORDING TO PERIOD
  const metrics = useMemo(() => {
    let revenueReceived = 0
    let pendingAmount = 0
    let paidProjectsCount = 0
    let pendingProjectsCount = 0

    projects.forEach((p) => {
      const pm = paymentsMapByProjectId[p.id]
      const isPaid = p.payment_status === 'Pago' || pm?.status === 'Pago'
      const isPending = p.payment_status === 'Pendente' || pm?.status === 'Pendente'

      const paidVal = p.paid_value || (pm && pm.status === 'Pago' ? pm.expected_amount / 100 : 0)
      const approvedVal = p.approved_value || (pm ? pm.expected_amount / 100 : 0)

      const paidDate = pm?.paid_at || pm?.created_at || p.updated_at
      const isRecordInPeriod = isInPeriod(paidDate)

      if (paidVal > 0 && isRecordInPeriod) revenueReceived += paidVal
      if (isPaid && isRecordInPeriod) paidProjectsCount++
      if (isPending && isRecordInPeriod) { pendingAmount += Math.max(0, approvedVal - paidVal); pendingProjectsCount++ }
    })

    return {
      revenueReceived,
      pendingAmount,
      paidProjectsCount,
      pendingProjectsCount,
    }
  }, [projects, paymentsMapByProjectId, dateRange])

  // REVENUE EVOLUTION CHART DATA
  const chartData = useMemo(() => {
    const points: Record<string, number> = {}

    projects.forEach((p) => {
      const pm = paymentsMapByProjectId[p.id]
      const isPaid = p.payment_status === 'Pago' || pm?.status === 'Pago'
      if (!isPaid && !(p.paid_value && p.paid_value > 0)) return

      const paidDate = pm?.paid_at || pm?.created_at || p.updated_at
      if (!isInPeriod(paidDate)) return

      const d = new Date(paidDate)
      const amount = p.paid_value || p.approved_value || (pm ? (pm.paid_amount || pm.expected_amount) / 100 : 0)

      let key = ''
      if (chartGrouping === 'dia') {
        key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
      } else if (chartGrouping === 'semana') {
        const weekNum = Math.ceil(d.getDate() / 7)
        key = `Sem ${weekNum} (${(d.getMonth() + 1).toString().padStart(2, '0')})`
      } else {
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        key = `${months[d.getMonth()]}/${d.getFullYear().toString().slice(-2)}`
      }

      points[key] = (points[key] || 0) + amount
    })

    const labels = Object.keys(points)
    const values = Object.values(points)
    const maxVal = Math.max(...values, 1)

    return { labels, values, maxVal }
  }, [projects, paymentsMapByProjectId, dateRange, chartGrouping])

  // REVENUE BY PROJECT TYPE
  const revenueByType = useMemo(() => {
    const typeMap: Record<string, { total: number; count: number }> = {}

    projects.forEach((p) => {
      const pm = paymentsMapByProjectId[p.id]
      const isPaid = p.payment_status === 'Pago' || pm?.status === 'Pago'
      if (!isPaid && !(p.paid_value && p.paid_value > 0)) return
      if (!isInPeriod(pm?.paid_at || p.updated_at)) return

      const type = p.project_type || 'Outros'
      const amount = p.paid_value || p.approved_value || (pm ? pm.expected_amount / 100 : 0)

      if (!typeMap[type]) {
        typeMap[type] = { total: 0, count: 0 }
      }
      typeMap[type].total += amount
      typeMap[type].count += 1
    })

    return Object.entries(typeMap).map(([type, data]) => ({
      type,
      total: data.total,
      count: data.count,
    }))
  }, [projects, paymentsMapByProjectId, dateRange])

  // REVENUE BY RESPONSIBLE USER
  const revenueByResponsible = useMemo(() => {
    const respMap: Record<string, { name: string; revenue: number; pending: number; paidProjects: number; totalProjects: number }> = {}

    projects.forEach((p) => {
      const pm = paymentsMapByProjectId[p.id]
      const isPaid = p.payment_status === 'Pago' || pm?.status === 'Pago'
      const name = p.responsible_user_name || 'Sem responsável'

      if (!respMap[name]) {
        respMap[name] = { name, revenue: 0, pending: 0, paidProjects: 0, totalProjects: 0 }
      }

      respMap[name].totalProjects += 1

      if (isPaid || (p.paid_value && p.paid_value > 0)) {
        if (isInPeriod(pm?.paid_at || p.updated_at)) {
          respMap[name].revenue += p.paid_value || p.approved_value || (pm ? pm.expected_amount / 100 : 0)
          if (isPaid) respMap[name].paidProjects += 1
        }
      }
      if (!isPaid) respMap[name].pending += Math.max(0, (p.approved_value || (pm ? pm.expected_amount / 100 : 0)) - (p.paid_value || 0))
    })

    return Object.values(respMap)
  }, [projects, paymentsMapByProjectId, dateRange])

  // QUOTES vs REVENUE CONVERSION
  const filteredQuotesInPeriod = useMemo(() => {
    return quotes.filter((q) => isInPeriod(q.created_at))
  }, [quotes, dateRange])

  const quotesConversionMetrics = useMemo(() => {
    const totalCreated = filteredQuotesInPeriod.length
    let totalConverted = 0
    let totalConvertedValue = 0

    quotes.forEach((q) => {
      if (!isInPeriod(q.created_at)) return
      if (q.converted_project_id || q.status === 'Convertido em Projeto') {
        totalConverted++
        totalConvertedValue += q.form_data?.final_value || 0
      }
    })

    const conversionRate = totalCreated > 0 ? ((totalConverted / totalCreated) * 100).toFixed(1) : '0'

    return {
      totalCreated,
      totalConverted,
      totalConvertedValue,
      conversionRate,
    }
  }, [quotes, filteredQuotesInPeriod, dateRange])

  // PENDENCIES & ATTENTION INDICATORS
  const pendencies = useMemo(() => {
    const pendingPaymentsList = projects.filter((p) => {
      const pm = paymentsMapByProjectId[p.id]
      return p.payment_status === 'Pendente' || pm?.status === 'Pendente' || (p.payment_link && p.payment_status !== 'Pago')
    })

    const contractNoPaymentList = projects.filter((p) => {
      const hasContract = Boolean(contractsMapByProjectId[p.id])
      const pm = paymentsMapByProjectId[p.id]
      const hasPayment = Boolean(pm || p.payment_link)
      return hasContract && !hasPayment
    })

    const unconfirmedFailedList = projects.filter((p) => {
      const pm = paymentsMapByProjectId[p.id]
      return pm?.status === 'Falha na geração' || pm?.status === 'Falha na confirmação'
    })

    return {
      pendingPaymentsList,
      contractNoPaymentList,
      unconfirmedFailedList,
    }
  }, [projects, paymentsMapByProjectId, contractsMapByProjectId])

  // RECENT PAYMENTS TABLE FILTERING
  const tableData = useMemo(() => {
    return projects.filter((p) => {
      const pm = paymentsMapByProjectId[p.id]
      const contract = contractsMapByProjectId[p.id]

      // Search match
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.responsible_user_name && p.responsible_user_name.toLowerCase().includes(searchTerm.toLowerCase()))

      // Status match
      const isPaid = p.payment_status === 'Pago' || pm?.status === 'Pago'
      const isFailed = pm?.status === 'Falha na geração' || pm?.status === 'Falha na confirmação'
      const matchesStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'pago' && isPaid) ||
        (statusFilter === 'pendente' && !isPaid && !isFailed) ||
        (statusFilter === 'falha' && isFailed)

      // Responsible match
      const matchesResp =
        responsibleFilter === 'todos' || p.responsible_user_id === responsibleFilter

      // Project type match
      const matchesType =
        projectTypeFilter === 'todos' || p.project_type === projectTypeFilter

      // Active Pendency Filter match
      let matchesPendency = true
      if (activePendencyFilter === 'pendente') {
        matchesPendency = p.payment_status === 'Pendente' || pm?.status === 'Pendente'
      } else if (activePendencyFilter === 'contrato_sem_cobranca') {
        matchesPendency = Boolean(contract) && !pm && !p.payment_link
      } else if (activePendencyFilter === 'falha') {
        matchesPendency = isFailed
      }

      return matchesSearch && matchesStatus && matchesResp && matchesType && matchesPendency
    })
  }, [projects, paymentsMapByProjectId, contractsMapByProjectId, searchTerm, statusFilter, responsibleFilter, projectTypeFilter, activePendencyFilter])

  // Format currency helper
  const formatMoney = (val?: number | null) => {
    if (!canViewValues) return '••••••'
    if (val === undefined || val === null) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  // Format date helper
  const formatDateBR = (dateStr?: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('pt-BR')
  }

  return (
    <div className={cn('space-y-6 font-sans transition-colors', isDarkMode ? 'text-white' : 'text-slate-900')}>
      {/* 1. MODULE HEADER & PERIOD FILTER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className={cn('text-xl font-bold tracking-tight', isDarkMode ? 'text-white' : 'text-slate-900')}>
            Módulo Financeiro
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Acompanhamento de faturamento, receita recebida e cobranças da ANXIS.
          </p>
        </div>

        {/* PERIOD SELECTOR BUTTONS */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
          <div className={cn('flex items-center gap-0.5 p-1 rounded-lg border flex-wrap', isDarkMode ? 'bg-[#1A1E26] border-slate-800' : 'bg-slate-100/80 border-slate-200/80')}>
            {[
              { id: 'hoje', label: 'Hoje' },
              { id: 'ultimos_7_dias', label: '7 dias' },
              { id: 'este_mes', label: 'Este mês' },
              { id: 'mes_anterior', label: 'Mês anterior' },
              { id: 'ultimos_3_meses', label: '3 meses' },
              { id: 'este_ano', label: 'Este ano' },
              { id: 'custom', label: 'Personalizado' },
            ].map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => setPeriod(op.id as PeriodFilterOption)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer',
                  period === op.id
                    ? 'bg-white dark:bg-[#202530] text-slate-900 dark:text-white shadow-xs font-semibold'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-white hover:bg-[#282E3D]/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                )}
              >
                {op.label}
              </button>
            ))}
          </div>

          {/* CUSTOM DATE RANGE INPUTS */}
          {period === 'custom' && (
            <div className={cn('flex items-center gap-2 p-1.5 rounded-lg border text-xs', isDarkMode ? 'bg-[#1A1E26] border-slate-800' : 'bg-white border-slate-200')}>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className={cn('px-2 py-0.5 rounded border outline-none text-xs font-medium', isDarkMode ? 'bg-[#202530] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700')}
              />
              <span className="text-slate-400 font-medium">até</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className={cn('px-2 py-0.5 rounded border outline-none text-xs font-medium', isDarkMode ? 'bg-[#202530] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700')}
              />
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: RECEITA RECEBIDA */}
        <div className={cn('rounded-xl p-5 border shadow-xs transition-all', isDarkMode ? 'bg-[#16181D] border-slate-800' : 'bg-white border-slate-200/80')}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Receita Recebida</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatMoney(metrics.revenueReceived)}
          </div>
          <div className="text-[11px] text-slate-400 font-normal mt-1">
            Pagamentos reais confirmados no período
          </div>
        </div>

        {/* CARD 2: VALORES PENDENTES */}
        <div className={cn('rounded-xl p-5 border shadow-xs transition-all', isDarkMode ? 'bg-[#16181D] border-slate-800' : 'bg-white border-slate-200/80')}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Valores Pendentes</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <HugeiconsIcon icon={Clock01Icon} className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 tracking-tight">
            {formatMoney(metrics.pendingAmount)}
          </div>
          <div className="text-[11px] text-slate-400 font-normal mt-1">
            Cobranças geradas aguardando pagamento
          </div>
        </div>

        {/* CARD 3: PROJETOS PAGOS */}
        <div className={cn('rounded-xl p-5 border shadow-xs transition-all', isDarkMode ? 'bg-[#16181D] border-slate-800' : 'bg-white border-slate-200/80')}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Projetos Pagos</span>
            <div className="w-7 h-7 rounded-lg bg-[#2E3E4F]/10 text-[#2E3E4F] dark:bg-sky-500/15 dark:text-sky-400 flex items-center justify-center">
              <HugeiconsIcon icon={Briefcase01Icon} className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className={cn('text-2xl font-bold tracking-tight', isDarkMode ? 'text-white' : 'text-slate-900')}>
            {metrics.paidProjectsCount} <span className="text-xs font-normal text-slate-400">projetos</span>
          </div>
          <div className="text-[11px] text-slate-400 font-normal mt-1">
            Com pagamento total liquidado
          </div>
        </div>

        {/* CARD 4: PROJETOS AGUARDANDO PAGAMENTO */}
        <div className={cn('rounded-xl p-5 border shadow-xs transition-all', isDarkMode ? 'bg-[#16181D] border-slate-800' : 'bg-white border-slate-200/80')}>
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Aguardando Pagamento</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <HugeiconsIcon icon={CreditCardIcon} className="w-4 h-4" strokeWidth={1.5} />
            </div>
          </div>
          <div className={cn('text-2xl font-bold tracking-tight', isDarkMode ? 'text-white' : 'text-slate-900')}>
            {metrics.pendingProjectsCount} <span className="text-xs font-normal text-slate-400">projetos</span>
          </div>
          <div className="text-[11px] text-slate-400 font-normal mt-1">
            Links ativos aguardando liquidação
          </div>
        </div>
      </div>

      {/* 3. ATTENTION INDICATORS / FINANCIAL PENDENCIES */}
      <div className="space-y-3.5">
        <div className={cn('flex items-center justify-between border-b pb-3', isDarkMode ? 'border-slate-800' : 'border-slate-200/80')}>
          <h3 className={cn('text-sm font-semibold flex items-center gap-2', isDarkMode ? 'text-white' : 'text-slate-900')}>
            <HugeiconsIcon icon={AlertCircleIcon} className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
            <span>Indicadores de Atenção Financeira</span>
          </h3>
          {activePendencyFilter && (
            <button
              type="button"
              onClick={() => setActivePendencyFilter(null)}
              className="text-xs font-medium text-[#2E3E4F] dark:text-sky-400 hover:underline cursor-pointer"
            >
              Limpar filtro de atenção ✕
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* PENDENCY 1 */}
          <button
            type="button"
            onClick={() => setActivePendencyFilter(activePendencyFilter === 'pendente' ? null : 'pendente')}
            className={cn(
              'p-3.5 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-3',
              activePendencyFilter === 'pendente'
                ? 'bg-amber-500/10 border-amber-400/80 ring-1 ring-amber-400/30'
                : isDarkMode
                  ? 'bg-[#1A1E26] border-slate-800 hover:border-slate-700'
                  : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
            )}
          >
            <div className="w-7 h-7 rounded-md bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0 font-bold text-xs">
              {pendencies.pendingPaymentsList.length}
            </div>
            <div>
              <div className={cn('font-semibold text-xs', isDarkMode ? 'text-white' : 'text-slate-900')}>Pagamentos Pendentes</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Projetos com cobrança gerada aguardando confirmação.
              </div>
            </div>
          </button>

          {/* PENDENCY 2 */}
          <button
            type="button"
            onClick={() => setActivePendencyFilter(activePendencyFilter === 'contrato_sem_cobranca' ? null : 'contrato_sem_cobranca')}
            className={cn(
              'p-3.5 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-3',
              activePendencyFilter === 'contrato_sem_cobranca'
                ? 'bg-blue-500/10 border-blue-400/80 ring-1 ring-blue-400/30'
                : isDarkMode
                  ? 'bg-[#1A1E26] border-slate-800 hover:border-slate-700'
                  : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
            )}
          >
            <div className="w-7 h-7 rounded-md bg-[#2E3E4F]/10 text-[#2E3E4F] dark:bg-sky-500/15 dark:text-sky-400 flex items-center justify-center shrink-0 font-bold text-xs">
              {pendencies.contractNoPaymentList.length}
            </div>
            <div>
              <div className={cn('font-semibold text-xs', isDarkMode ? 'text-white' : 'text-slate-900')}>Contrato sem Cobrança</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Projetos com contrato mas sem link de pagamento gerado.
              </div>
            </div>
          </button>

          {/* PENDENCY 3 */}
          <button
            type="button"
            onClick={() => setActivePendencyFilter(activePendencyFilter === 'falha' ? null : 'falha')}
            className={cn(
              'p-3.5 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-3',
              activePendencyFilter === 'falha'
                ? 'bg-rose-500/10 border-rose-400/80 ring-1 ring-rose-400/30'
                : isDarkMode
                  ? 'bg-[#1A1E26] border-slate-800 hover:border-slate-700'
                  : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
            )}
          >
            <div className="w-7 h-7 rounded-md bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 font-bold text-xs">
              {pendencies.unconfirmedFailedList.length}
            </div>
            <div>
              <div className={cn('font-semibold text-xs', isDarkMode ? 'text-white' : 'text-slate-900')}>Falhas ou Erros</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Cobranças com erro na geração ou falha de confirmação.
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 4. REVENUE EVOLUTION CHART */}
      <div className="space-y-4">
        <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-3.5', isDarkMode ? 'border-slate-800' : 'border-slate-200/80')}>
          <div>
            <h3 className={cn('text-sm font-semibold flex items-center gap-2', isDarkMode ? 'text-white' : 'text-slate-900')}>
              <HugeiconsIcon icon={ArrowUp01Icon} className="w-4 h-4 text-[#2E3E4F] dark:text-sky-400" strokeWidth={1.5} />
              <span>Evolução da Receita no Período</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualização temporal exclusiva de recebimentos reais confirmados.
            </p>
          </div>

          <div className={cn('flex items-center gap-0.5 p-1 rounded-lg border text-xs', isDarkMode ? 'bg-[#1A1E26] border-slate-800' : 'bg-slate-100/80 border-slate-200/80')}>
            {[
              { id: 'dia', label: 'Por Dia' },
              { id: 'semana', label: 'Por Semana' },
              { id: 'mes', label: 'Por Mês' },
            ].map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setChartGrouping(g.id as any)}
                className={cn(
                  'px-2.5 py-1 rounded-md font-medium text-xs transition-all cursor-pointer',
                  chartGrouping === g.id
                    ? 'bg-white dark:bg-[#202530] text-slate-900 dark:text-white shadow-xs font-semibold'
                    : isDarkMode
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* SVG BAR CHART */}
        {chartData.labels.length === 0 ? (
          <div className={cn('p-10 text-center font-normal text-xs rounded-lg border border-dashed', isDarkMode ? 'bg-[#181B22] border-slate-800 text-slate-400' : 'bg-slate-50/50 border-slate-200 text-slate-400')}>
            Nenhum pagamento confirmado registrado no período selecionado.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-44 w-full flex items-end justify-between gap-2 pt-4 px-2">
              {chartData.labels.map((label, idx) => {
                const val = chartData.values[idx]
                const heightPct = Math.max((val / chartData.maxVal) * 100, 8)

                return (
                  <div key={label} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                    {/* TOOLTIP ON HOVER */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-medium px-2 py-1 rounded-md shadow-md whitespace-nowrap pointer-events-none z-10">
                      {formatMoney(val)}
                    </div>

                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full max-w-[36px] bg-[#2E3E4F] hover:bg-[#182331] dark:bg-sky-600 dark:hover:bg-sky-500 rounded-t-md transition-all"
                    />
                    <span className="text-[10px] font-medium text-slate-400 truncate max-w-full">
                      {label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. BREAKDOWN GRID: PROJECT TYPES & RESPONSIBLES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* REVENUE BY PROJECT TYPE */}
        <div className={cn('rounded-xl border p-4 sm:p-5 space-y-3.5', isDarkMode ? 'bg-[#16181D] border-slate-800' : 'bg-white border-slate-200/80')}>
          <h3 className={cn('text-sm font-semibold flex items-center gap-2 border-b pb-3', isDarkMode ? 'text-white border-slate-800' : 'text-slate-900 border-slate-100')}>
            <HugeiconsIcon icon={PieChartIcon} className="w-4 h-4 text-[#2E3E4F] dark:text-sky-400" strokeWidth={1.5} />
            <span>Receita por Tipo de Projeto</span>
          </h3>

          <div className="space-y-2">
            {revenueByType.map((item) => (
              <div
                key={item.type}
                className={cn('flex items-center justify-between p-2.5 rounded-lg border text-xs', isDarkMode ? 'bg-[#181B22] border-slate-800' : 'bg-slate-50/60 border-slate-200/60')}
              >
                <div>
                  <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-slate-900')}>{item.type}</div>
                  <div className="text-[10px] text-slate-400">
                    {item.count} {item.count === 1 ? 'projeto pago' : 'projetos pagos'}
                  </div>
                </div>
                <div className="font-semibold text-[#2E3E4F] dark:text-sky-400 text-xs">
                  {formatMoney(item.total)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* REVENUE BY RESPONSIBLE */}
        <div className={cn('rounded-xl border p-4 sm:p-5 space-y-3.5', isDarkMode ? 'bg-[#16181D] border-slate-800' : 'bg-white border-slate-200/80')}>
          <h3 className={cn('text-sm font-semibold flex items-center gap-2 border-b pb-3', isDarkMode ? 'text-white border-slate-800' : 'text-slate-900 border-slate-100')}>
            <HugeiconsIcon icon={UserIcon} className="w-4 h-4 text-[#2E3E4F] dark:text-sky-400" strokeWidth={1.5} />
            <span>Acompanhamento por Responsável</span>
          </h3>

          {revenueByResponsible.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 font-normal">
              Nenhum projeto com responsável registrado no período.
            </div>
          ) : (
            <div className="space-y-2">
              {revenueByResponsible.map((resp) => (
                <div
                  key={resp.name}
                  className={cn('flex items-center justify-between p-2.5 rounded-lg border text-xs', isDarkMode ? 'bg-[#181B22] border-slate-800' : 'bg-slate-50/60 border-slate-200/60')}
                >
                  <div>
                    <div className={cn('font-medium', isDarkMode ? 'text-white' : 'text-slate-900')}>{resp.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {resp.paidProjects} de {resp.totalProjects} projetos pagos
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                      {formatMoney(resp.revenue)}
                    </div>
                    {resp.pending > 0 && (
                      <div className="text-[10px] text-amber-500 font-medium">
                        {formatMoney(resp.pending)} pendente
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. QUOTES vs REVENUE CONVERSION */}
      <div className="space-y-3.5">
        <div className={cn('flex items-center justify-between border-b pb-3', isDarkMode ? 'border-slate-800' : 'border-slate-200/80')}>
          <h3 className={cn('text-sm font-semibold flex items-center gap-2', isDarkMode ? 'text-white' : 'text-slate-900')}>
            <HugeiconsIcon icon={File01Icon} className="w-4 h-4 text-[#2E3E4F] dark:text-sky-400" strokeWidth={1.5} />
            <span>Relação entre Orçamentos e Conversão</span>
          </h3>
          <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-[#2E3E4F] dark:text-slate-200 font-medium px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
            Taxa de conversão: {quotesConversionMetrics.conversionRate}%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className={cn('p-3.5 rounded-lg border', isDarkMode ? 'bg-[#181B22] border-slate-800' : 'bg-white border-slate-200/80')}>
            <div className="text-slate-400 font-medium">Orçamentos Criados</div>
            <div className={cn('text-xl font-bold mt-1', isDarkMode ? 'text-white' : 'text-slate-900')}>
              {quotesConversionMetrics.totalCreated}
            </div>
          </div>

          <div className={cn('p-3.5 rounded-lg border', isDarkMode ? 'bg-[#181B22] border-slate-800' : 'bg-white border-slate-200/80')}>
            <div className="text-slate-400 font-medium">Orçamentos Convertidos</div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {quotesConversionMetrics.totalConverted}
            </div>
          </div>

          <div className={cn('p-3.5 rounded-lg border', isDarkMode ? 'bg-[#181B22] border-slate-800' : 'bg-white border-slate-200/80')}>
            <div className="text-slate-400 font-medium">Valor dos Convertidos</div>
            <div className="text-xl font-bold text-[#2E3E4F] dark:text-sky-400 mt-1">
              {formatMoney(quotesConversionMetrics.totalConvertedValue)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
