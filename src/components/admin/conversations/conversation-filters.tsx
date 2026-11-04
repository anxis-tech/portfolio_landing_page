'use client'

import { cn } from '@/lib/utils'
import { ConversationFilterStatus, ConversationFilterCounts } from './types'
import {
  Inbox,
  Clock,
  UserCheck,
  CheckCircle2,
  UserX,
  User,
  PanelLeftClose,
  RefreshCw,
} from 'lucide-react'

interface ConversationFiltersProps {
  currentFilter: ConversationFilterStatus
  onSelectFilter: (filter: ConversationFilterStatus) => void
  counts: ConversationFilterCounts
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  onRefresh?: () => void
  isLoading?: boolean
}

export function ConversationFilters({
  currentFilter,
  onSelectFilter,
  counts,
  isCollapsed = false,
  onToggleCollapse,
  onRefresh,
  isLoading = false,
}: ConversationFiltersProps) {
  const filterItems = [
    {
      id: 'all' as ConversationFilterStatus,
      label: 'Ativas',
      icon: Inbox,
      count: counts.all,
    },
    {
      id: 'waiting_agent' as ConversationFilterStatus,
      label: 'Precisa responder',
      icon: Clock,
      count: counts.waiting_agent,
    },
    {
      id: 'waiting_customer' as ConversationFilterStatus,
      label: 'Aguardando cliente',
      icon: UserCheck,
      count: counts.waiting_customer,
    },
    {
      id: 'unassigned' as ConversationFilterStatus,
      label: 'Não atribuídas',
      icon: UserX,
      count: counts.unassigned,
    },
    {
      id: 'assigned_to_me' as ConversationFilterStatus,
      label: 'Atribuídas a mim',
      icon: User,
      count: counts.assigned_to_me,
    },
    {
      id: 'closed' as ConversationFilterStatus,
      label: 'Encerradas',
      icon: CheckCircle2,
      count: counts.closed,
    },
  ]

  if (isCollapsed) {
    return null
  }

  return (
    <div className="w-56 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E121B] flex flex-col justify-between select-none shrink-0 transition-all md:rounded-tl-lg">
      {/* HEADER */}
      <div>
        <div className="h-12 px-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 md:rounded-tl-lg">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Inbox
            </h2>
          </div>

          <div className="flex items-center gap-1">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Atualizar lista"
              >
                <RefreshCw size={13} className={cn(isLoading && 'animate-spin')} />
              </button>
            )}

            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Recolher filtros"
              >
                <PanelLeftClose size={14} />
              </button>
            )}
          </div>
        </div>

        {/* FILTER ITEMS LIST */}
        <div className="p-2 space-y-0.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 pt-1 pb-1">
            Filtrar por Estado
          </div>

          {filterItems.map((item) => {
            const Icon = item.icon
            const isActive = currentFilter === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectFilter(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left cursor-pointer',
                  isActive
                    ? 'bg-[#2E3E4F]/10 dark:bg-slate-800 text-[#182331] dark:text-slate-100 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <Icon
                    size={14}
                    className={cn(
                      'shrink-0',
                      isActive ? 'text-[#182331] dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <span
                  className={cn(
                    'text-[11px] font-mono shrink-0',
                    isActive
                      ? 'text-[#182331] dark:text-slate-100 font-bold'
                      : 'text-slate-400 dark:text-slate-500 font-normal'
                  )}
                >
                  {item.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
        <span>Total de conversas</span>
        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
          {counts.all}
        </span>
      </div>
    </div>
  )
}
