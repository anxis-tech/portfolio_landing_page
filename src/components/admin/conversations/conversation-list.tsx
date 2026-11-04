'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { WhatsAppInboxConversationDTO } from '@/modules/prospecting/types/whatsapp'
import {
  Search,
  Clock,
  UserCheck,
  CheckCircle2,
  PanelLeftOpen,
  UserPlus,
} from 'lucide-react'

interface ConversationListProps {
  conversations: WhatsAppInboxConversationDTO[]
  selectedConversationId: string | null
  onSelectConversation: (conversationId: string) => void
  onToggleFilters?: () => void
  isFiltersCollapsed?: boolean
  currentFilterLabel?: string
  onNewContact?: () => void
}

function formatConversationDate(isoString: string | null): string {
  if (!isoString) return ''
  try {
    const d = new Date(isoString)
    const now = new Date()
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 0 && d.getDate() === now.getDate()) {
      return d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }
    if (diffDays <= 1) {
      return 'Ontem'
    }
    if (diffDays < 7) {
      return d.toLocaleDateString('pt-BR', { weekday: 'short' })
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  } catch {
    return ''
  }
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onToggleFilters,
  isFiltersCollapsed,
  currentFilterLabel,
  onNewContact,
}: ConversationListProps) {
  const [search, setSearch] = useState('')

  const filteredConversations = useMemo(() => {
    if (!search.trim()) return conversations
    const q = search.toLowerCase()
    return conversations.filter((c) => {
      const name = (c.contactName || '').toLowerCase()
      const company = (c.companyName || '').toLowerCase()
      const phone = (c.phoneE164 || '').toLowerCase()
      const snippet = (c.lastMessageSnippet || '').toLowerCase()
      return (
        name.includes(q) ||
        company.includes(q) ||
        phone.includes(q) ||
        snippet.includes(q)
      )
    })
  }, [conversations, search])

  return (
    <div className="w-full md:w-80 lg:w-84 xl:w-92 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] flex flex-col shrink-0">
      {/* LIST HEADER WITH SEARCH */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2 bg-white dark:bg-[#111622] z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            {onToggleFilters && (
              <button
                type="button"
                onClick={onToggleFilters}
                className={cn(
                  'p-1 rounded-md transition-colors cursor-pointer mr-0.5 shrink-0',
                  isFiltersCollapsed
                    ? 'text-[#182331] bg-slate-100 dark:bg-slate-800 dark:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden'
                )}
                title="Filtros da Inbox"
              >
                <PanelLeftOpen size={16} />
              </button>
            )}
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Conversas
            </span>
            {currentFilterLabel && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#182331] dark:text-slate-200 truncate max-w-[100px]">
                {currentFilterLabel}
              </span>
            )}
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
              {filteredConversations.length}
            </span>
          </div>

          {onNewContact ? (
            <button
              type="button"
              onClick={onNewContact}
              className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg bg-[#2E3E4F] px-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-[#182331]"
              title="Criar contato do WhatsApp"
            >
              <UserPlus size={13} />
              Novo contato
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium">Recentes</span>
          )}
        </div>

        {/* SEARCH BOX */}
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por nome, empresa ou telefone..."
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/70 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#2E3E4F] focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
        </div>
      </div>

      {/* CONVERSATION ITEMS (DENSE & EFFICIENT) */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Nenhuma conversa encontrada.
            </p>
            <p className="text-[11px] text-slate-400">
              {search
                ? 'Tente ajustar sua busca de contatos.'
                : 'Não há conversas neste filtro.'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = conv.id === selectedConversationId
            const isUnread = conv.unreadCount > 0

            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  'w-full text-left p-3 transition-colors cursor-pointer flex gap-3 relative group',
                  isSelected
                    ? 'bg-slate-100/90 dark:bg-slate-800/60 border-l-2 border-[#2E3E4F]'
                    : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                )}
              >
                {/* AVATAR */}
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                    {conv.contactName?.charAt(0) || 'W'}
                  </div>

                  {/* 24h Window status badge dot */}
                  {conv.isWindowOpen && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#111622]"
                      title="Janela de 24h aberta"
                    />
                  )}
                </div>

                {/* CONTENT */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1 mb-0.5">
                    <span
                      className={cn(
                        'text-xs truncate font-semibold',
                        isSelected
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-800 dark:text-slate-200',
                        isUnread && 'font-bold text-[#182331] dark:text-white'
                      )}
                    >
                      {conv.contactName}
                    </span>

                    <span
                      className={cn(
                        'text-[10px] shrink-0 font-mono',
                        isUnread
                          ? 'text-[#182331] dark:text-sky-400 font-bold'
                          : 'text-slate-400'
                      )}
                    >
                      {formatConversationDate(conv.lastMessageAt)}
                    </span>
                  </div>

                  {/* COMPANY & PHONE */}
                  {(conv.companyName || conv.phoneE164) && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-1">
                      {conv.companyName ? (
                        <span>{conv.companyName}</span>
                      ) : (
                        <span className="font-mono text-[10px]">
                          {conv.phoneE164}
                        </span>
                      )}
                    </div>
                  )}

                  {/* PREVIEW SNIPPET */}
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        'text-xs truncate',
                        isUnread
                          ? 'text-slate-900 dark:text-slate-100 font-medium'
                          : 'text-slate-500 dark:text-slate-400'
                      )}
                    >
                      {conv.lastMessageSnippet ||
                        (conv.status === 'closed'
                          ? 'Conversa encerrada'
                          : 'Conversa iniciada')}
                    </p>

                    {/* UNREAD BADGE OR STATUS ICON */}
                    {isUnread ? (
                      <span className="shrink-0 h-4 min-w-[16px] px-1 rounded-full bg-[#2E3E4F] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                        {conv.unreadCount}
                      </span>
                    ) : conv.status === 'waiting_agent' ? (
                      <span
                        className="shrink-0 text-[10px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1"
                        title="Precisa responder"
                      >
                        <Clock size={10} />
                        <span>Responder</span>
                      </span>
                    ) : conv.status === 'waiting_customer' ? (
                      <span
                        className="shrink-0 text-[10px] text-slate-400 flex items-center gap-0.5"
                        title="Aguardando cliente"
                      >
                        <UserCheck size={11} />
                      </span>
                    ) : conv.status === 'closed' ? (
                      <span
                        className="shrink-0 text-[10px] text-slate-400"
                        title="Encerrada"
                      >
                        <CheckCircle2 size={11} />
                      </span>
                    ) : null}
                  </div>

                  {/* ASSIGNEE BADGE (WHEN ASSIGNED) */}
                  {conv.assignedName && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <span className="truncate">{conv.assignedName}</span>
                    </div>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
