'use client'

import { useState, useEffect, useCallback, useMemo, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserProfileWithRole } from '@/lib/auth/permissions'
import {
  WhatsAppInboxConversationDTO,
  WhatsAppAssigneeDTO,
} from '@/modules/prospecting/types/whatsapp'
import {
  loadWhatsAppInboxConversationsAction,
  listWhatsAppAssigneesAction,
  createStandaloneWhatsAppContactAction,
} from '@/modules/prospecting/actions/whatsapp.actions'
import { ConversationFilters } from './conversation-filters'
import { ConversationList } from './conversation-list'
import { ConversationChat } from './conversation-chat'
import { ConversationContactPanel } from './conversation-contact-panel'
import { ConversationFilterStatus, ConversationFilterCounts } from './types'
import { LeadDrawer } from '@/modules/prospecting/components/lead-drawer'
import { Loading01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { AlertCircle, X } from 'lucide-react'

interface ConversationsTabProps {
  userProfile: UserProfileWithRole | null
  canManage: boolean
  isDarkMode?: boolean
}

export function ConversationsTab({
  userProfile,
  canManage,
}: ConversationsTabProps) {
  const [conversations, setConversations] = useState<WhatsAppInboxConversationDTO[]>([])
  const [assignees, setAssignees] = useState<WhatsAppAssigneeDTO[]>([])
  const [activeFilter, setActiveFilter] = useState<ConversationFilterStatus>('all')
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [isContactPanelOpen, setIsContactPanelOpen] = useState(true)
  const [selectedLeadIdForDrawer, setSelectedLeadIdForDrawer] = useState<string | null>(null)
  const [isNewContactOpen, setIsNewContactOpen] = useState(false)
  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContactError, setNewContactError] = useState<string | null>(null)
  const [isCreatingContact, startCreateContactTransition] = useTransition()

  // Fetch conversations and assignees
  const fetchConversations = useCallback(async (background = false) => {
    if (!background) setIsLoading(true)
    else setIsRefreshing(true)

    try {
      const [convRes, assigneesRes] = await Promise.all([
        loadWhatsAppInboxConversationsAction(),
        listWhatsAppAssigneesAction(),
      ])

      if (convRes.ok) {
        setConversations(convRes.data)
        // Do not auto-select first conversation on initial load
        setSelectedConversationId((prev) => {
          if (prev && convRes.data.some((c) => c.id === prev)) {
            return prev
          }
          return null
        })
      }

      if (assigneesRes.ok) {
        setAssignees(assigneesRes.data)
      }
    } catch (err) {
      console.error('Failed to load conversations inbox:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let ignore = false
    void (async () => {
      try {
        const [convRes, assigneesRes] = await Promise.all([
          loadWhatsAppInboxConversationsAction(),
          listWhatsAppAssigneesAction(),
        ])
        if (ignore) return
        if (convRes.ok) {
          setConversations(convRes.data)
          setSelectedConversationId((prev) => {
            if (prev && convRes.data.some((c) => c.id === prev)) {
              return prev
            }
            return null
          })
        }
        if (assigneesRes.ok) {
          setAssignees(assigneesRes.data)
        }
      } catch (err) {
        console.error('Failed to load conversations inbox:', err)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    })()

    // Debounced realtime scheduler to avoid rapid re-fetches on bursts
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    const scheduleFetch = () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        if (!ignore) fetchConversations(true)
      }, 300)
    }

    // Setup Supabase Realtime subscription on whatsapp_conversations and whatsapp_messages
    const supabase = createClient()
    const channel = supabase
      .channel('conversations-inbox-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_conversations' },
        () => {
          scheduleFetch()
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'whatsapp_messages' },
        () => {
          scheduleFetch()
        }
      )
      .subscribe()

    return () => {
      ignore = true
      if (debounceTimer) clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    }
  }, [fetchConversations])

  // Filter calculations & counts
  const counts: ConversationFilterCounts = useMemo(() => {
    const currentUserId = userProfile?.user_id
    let waiting_agent = 0
    let waiting_customer = 0
    let closed = 0
    let unassigned = 0
    let assigned_to_me = 0

    for (const c of conversations) {
      const isActive = c.status !== 'closed'
      if (c.status === 'waiting_agent') waiting_agent++
      if (c.status === 'waiting_customer') waiting_customer++
      if (c.status === 'closed') closed++
      if (isActive && !c.assignedTo) unassigned++
      if (isActive && currentUserId && c.assignedTo === currentUserId) assigned_to_me++
    }

    return {
      all: conversations.length - closed,
      waiting_agent,
      waiting_customer,
      closed,
      unassigned,
      assigned_to_me,
    }
  }, [conversations, userProfile?.user_id])

  const filteredConversations = useMemo(() => {
    const currentUserId = userProfile?.user_id
    switch (activeFilter) {
      case 'waiting_agent':
        return conversations.filter((c) => c.status === 'waiting_agent')
      case 'waiting_customer':
        return conversations.filter((c) => c.status === 'waiting_customer')
      case 'closed':
        return conversations.filter((c) => c.status === 'closed')
      case 'unassigned':
        return conversations.filter((c) => c.status !== 'closed' && !c.assignedTo)
      case 'assigned_to_me':
        return conversations.filter(
          (c) => c.status !== 'closed' && currentUserId && c.assignedTo === currentUserId
        )
      case 'all':
      default:
        return conversations.filter((c) => c.status !== 'closed')
    }
  }, [conversations, activeFilter, userProfile?.user_id])

  const displayedConversationId = useMemo(() => {
    if (selectedConversationId === null) return null
    if (filteredConversations.some((conversation) => conversation.id === selectedConversationId)) {
      return selectedConversationId
    }
    return null
  }, [filteredConversations, selectedConversationId])

  const selectedConversation = useMemo(() => {
    return conversations.find((c) => c.id === displayedConversationId) || null
  }, [conversations, displayedConversationId])

  const handleCreateContact = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canManage || isCreatingContact) return

    startCreateContactTransition(async () => {
      setNewContactError(null)
      const result = await createStandaloneWhatsAppContactAction({
        name: newContactName,
        phone: newContactPhone,
        requestId: crypto.randomUUID(),
      })

      if (!result.ok) {
        setNewContactError(result.error)
        return
      }

      setSelectedConversationId(result.data.conversationId)
      setNewContactName('')
      setNewContactPhone('')
      setIsNewContactOpen(false)
      await fetchConversations(true)
    })
  }

  if (isLoading && conversations.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 space-y-3 bg-white dark:bg-[#0E121B]">
        <HugeiconsIcon
          icon={Loading01Icon}
          className="w-6 h-6 animate-spin text-[#2E3E4F] dark:text-sky-400"
          strokeWidth={1.5}
        />
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Carregando Inbox de conversas do WhatsApp...
        </span>
      </div>
    )
  }

  const FILTER_LABELS: Record<ConversationFilterStatus, string> = {
    all: 'Ativas',
    waiting_agent: 'Precisa responder',
    waiting_customer: 'Aguardando cliente',
    unassigned: 'Não atribuídas',
    assigned_to_me: 'Atribuídas a mim',
    closed: 'Encerradas',
  }

  return (
    <div className="h-full w-full flex overflow-hidden font-sans select-none bg-[#fdfdfd] dark:bg-[#0B0F19] md:rounded-tl-lg">
      {/* 
        COLUMN 1: FILTERS (Inbox HubSpot sidebar)
        Visible on large screens, collapsible on smaller screens
      */}
      <div className="hidden lg:block h-full shrink-0">
        <ConversationFilters
          currentFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          counts={counts}
          isCollapsed={isFiltersCollapsed}
          onToggleCollapse={() => setIsFiltersCollapsed(true)}
          onRefresh={() => fetchConversations(true)}
          isLoading={isRefreshing}
        />
      </div>

      {/* 
        TABLET & MOBILE OVERLAY DRAWER FOR FILTERS (< 1024px)
      */}
      {isMobileFiltersOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-start"
          onClick={() => setIsMobileFiltersOpen(false)}
        >
          <div
            className="h-full animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <ConversationFilters
              currentFilter={activeFilter}
              onSelectFilter={(f) => {
                setActiveFilter(f)
                setIsMobileFiltersOpen(false)
              }}
              counts={counts}
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileFiltersOpen(false)}
              onRefresh={() => fetchConversations(true)}
              isLoading={isRefreshing}
            />
          </div>
        </div>
      )}

      {/* 
        COLUMN 2: CONVERSATION LIST
        On mobile: visible when no conversation is active
        On tablet+: always visible side by side with Chat
      */}
      <div
        className={`h-full shrink-0 ${
          displayedConversationId ? 'hidden md:block' : 'w-full md:block'
        }`}
      >
        <ConversationList
          conversations={filteredConversations}
          selectedConversationId={displayedConversationId}
          onSelectConversation={(id) => setSelectedConversationId(id)}
          isFiltersCollapsed={isFiltersCollapsed}
          currentFilterLabel={FILTER_LABELS[activeFilter]}
          onNewContact={canManage ? () => {
            setNewContactError(null)
            setIsNewContactOpen(true)
          } : undefined}
          onToggleFilters={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
              setIsMobileFiltersOpen((prev) => !prev)
            } else {
              setIsFiltersCollapsed((prev) => !prev)
            }
          }}
        />
      </div>

      {/* 
        COLUMN 3: CHAT CONVERSATION WORKSPACE
        On mobile: visible when a conversation is selected
        On tablet+: always visible in the center
      */}
      <div
        className={`flex-1 h-full flex flex-col min-w-0 ${
          displayedConversationId ? 'block' : 'hidden md:block'
        }`}
      >
        <ConversationChat
          conversationId={displayedConversationId}
          canManage={canManage}
          assignees={assignees}
          onBackToList={() => setSelectedConversationId(null)}
          onToggleContactPanel={() => setIsContactPanelOpen((prev) => !prev)}
          isContactPanelOpen={isContactPanelOpen}
          onConversationChanged={() => fetchConversations(true)}
          onOpenLeadDetail={(leadId) => setSelectedLeadIdForDrawer(leadId)}
        />
      </div>

      {/* 
        COLUMN 4: CONTACT DETAILS PANEL ("About this Contact")
        On desktop (>= 1280px): visible side by side if isContactPanelOpen
        On tablet/mobile: rendered in overlay drawer if open
      */}
      {isContactPanelOpen && selectedConversation && (
        <>
          {/* Desktop side panel */}
          <div className="hidden xl:block h-full shrink-0">
            <ConversationContactPanel
              conversation={selectedConversation}
              onClose={() => setIsContactPanelOpen(false)}
              onOpenLeadDetail={(leadId) => setSelectedLeadIdForDrawer(leadId)}
              canManage={canManage}
            />
          </div>

          {/* Tablet & Mobile overlay drawer */}
          <div className="xl:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
            <div className="h-full animate-in slide-in-from-right duration-200">
              <ConversationContactPanel
                conversation={selectedConversation}
                onClose={() => setIsContactPanelOpen(false)}
                onOpenLeadDetail={(leadId) => setSelectedLeadIdForDrawer(leadId)}
                canManage={canManage}
              />
            </div>
          </div>
        </>
      )}

      {/* FULL LEAD DRAWER OVERLAY (when requested from contact panel) */}
      {selectedLeadIdForDrawer && (
        <LeadDrawer
          id={selectedLeadIdForDrawer}
          canManage={canManage}
          onClose={() => setSelectedLeadIdForDrawer(null)}
          onChanged={() => fetchConversations(true)}
        />
      )}

      {isNewContactOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isCreatingContact) {
              setIsNewContactOpen(false)
            }
          }}
        >
          <form
            onSubmit={handleCreateContact}
            className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-[#16181D]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Novo contato</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Crie ou reutilize um contato do WhatsApp sem gerar um lead de prospecção.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewContactOpen(false)}
                disabled={isCreatingContact}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Fechar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nome
                <input
                  type="text"
                  value={newContactName}
                  onChange={(event) => setNewContactName(event.target.value)}
                  minLength={2}
                  maxLength={120}
                  autoFocus
                  required
                  disabled={isCreatingContact}
                  placeholder="Nome do contato"
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal text-slate-900 outline-none transition-colors focus:border-[#2E3E4F] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </label>

              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Telefone / WhatsApp
                <input
                  type="tel"
                  value={newContactPhone}
                  onChange={(event) => setNewContactPhone(event.target.value)}
                  required
                  disabled={isCreatingContact}
                  placeholder="+55 11 99999-9999"
                  className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal text-slate-900 outline-none transition-colors focus:border-[#2E3E4F] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                <span className="mt-1 block text-[10px] font-normal text-slate-400">
                  Inclua o código do país ou informe um número brasileiro com DDD.
                </span>
              </label>
            </div>

            {newContactError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                <AlertCircle size={14} className="shrink-0" />
                <span>{newContactError}</span>
              </div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNewContactOpen(false)}
                disabled={isCreatingContact}
                className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreatingContact || !newContactName.trim() || !newContactPhone.trim()}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#2E3E4F] px-4 text-xs font-bold text-white transition-colors hover:bg-[#182331] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreatingContact && (
                  <HugeiconsIcon icon={Loading01Icon} className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                )}
                Criar contato
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
