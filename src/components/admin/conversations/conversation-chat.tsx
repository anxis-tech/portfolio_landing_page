'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import {
  useWhatsAppConversation,
} from '@/modules/prospecting/hooks/use-whatsapp-conversation'
import { WhatsAppMessageList } from '@/modules/prospecting/components/whatsapp-message-list'
import { WhatsAppComposer } from '@/modules/prospecting/components/whatsapp-composer'
import { checkCustomerWindow } from '@/modules/prospecting/services/whatsapp-policy'
import {
  assignWhatsAppConversationAction,
  setWhatsAppConversationClosedAction,
  whatsappCommercialAction,
  unlinkWhatsAppConversationAction,
  requestWhatsAppTemplateSyncAction,
} from '@/modules/prospecting/actions/whatsapp.actions'
import {
  WhatsAppAssigneeDTO,
  WhatsAppCommercialActionType,
} from '@/modules/prospecting/types/whatsapp'
import {
  Phone,
  User,
  MoreVertical,
  Calendar,
  DollarSign,
  ThumbsDown,
  CheckCircle2,
  Unlock,
  Unlink,
  ExternalLink,
  ArrowLeft,
  PanelRightOpen,
  PanelRightClose,
  Sparkles,
} from 'lucide-react'

interface ConversationChatProps {
  conversationId: string | null
  canManage: boolean
  assignees: WhatsAppAssigneeDTO[]
  onBackToList?: () => void
  onToggleContactPanel?: () => void
  isContactPanelOpen?: boolean
  onConversationChanged?: () => void
  onOpenLeadDetail?: (leadId: string) => void
}

export function ConversationChat({
  conversationId,
  canManage,
  assignees,
  onBackToList,
  onToggleContactPanel,
  isContactPanelOpen,
  onConversationChanged,
  onOpenLeadDetail,
}: ConversationChatProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [meetingModalOpen, setMeetingModalOpen] = useState(false)
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingNotes, setMeetingNotes] = useState('')
  const [unlinkModalOpen, setUnlinkModalOpen] = useState(false)
  const [unlinkReason, setUnlinkReason] = useState('')
  const [commercialError, setCommercialError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const {
    data,
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    sendMessage,
    markAsRead,
    refetch,
  } = useWhatsAppConversation(conversationId)

  const conv = data?.conversation
  const contact = data?.contact
  const lead = data?.lead

  const { isOpen: isWindowOpen } = checkCustomerWindow(
    conv?.lastInboundAt ?? null
  )

  const handleAssignChange = (userId: string | null) => {
    if (!conversationId || !canManage) return
    startTransition(async () => {
      await assignWhatsAppConversationAction({
        conversationId,
        assignedTo: userId,
        requestId: crypto.randomUUID(),
      })
      refetch()
      onConversationChanged?.()
    })
  }

  const handleCommercialAction = (
    action: WhatsAppCommercialActionType,
    actionData: Record<string, unknown> = {}
  ) => {
    if (!conversationId || !canManage) return
    startTransition(async () => {
      setCommercialError(null)
      const res = await whatsappCommercialAction({
        conversationId,
        action,
        requestId: crypto.randomUUID(),
        data: actionData,
      })
      setIsMenuOpen(false)
      if (res.ok) {
        refetch()
        onConversationChanged?.()
      } else {
        setCommercialError(res.error)
      }
    })
  }

  const handleConversationClosedChange = (closed: boolean) => {
    if (!conversationId || !canManage) return
    startTransition(async () => {
      setCommercialError(null)
      const res = await setWhatsAppConversationClosedAction({
        conversationId,
        closed,
        requestId: crypto.randomUUID(),
      })
      setIsMenuOpen(false)
      if (res.ok) {
        refetch()
        onConversationChanged?.()
      } else {
        setCommercialError(res.error)
      }
    })
  }

  const handleUnlink = () => {
    if (!conversationId || !unlinkReason.trim() || !canManage) return
    startTransition(async () => {
      setCommercialError(null)
      const res = await unlinkWhatsAppConversationAction({
        conversationId,
        reason: unlinkReason.trim(),
        requestId: crypto.randomUUID(),
      })
      if (res.ok) {
        setUnlinkModalOpen(false)
        setUnlinkReason('')
        refetch()
        onConversationChanged?.()
      } else {
        setCommercialError(res.error)
      }
    })
  }

  if (!conversationId) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center p-8 text-center bg-[#fdfdfd] dark:bg-[#0E121B]">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[#2E3E4F] dark:text-slate-300 flex items-center justify-center mb-3">
          <Sparkles size={24} />
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Selecione uma conversa
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
          Escolha um contato na lista ao lado para visualizar o histórico de mensagens e responder em tempo real.
        </p>
      </div>
    )
  }

  const contactDisplayName =
    contact?.displayName || lead?.name || lead?.companyName || contact?.phoneE164 || 'Conversa WhatsApp'
  const hasLeadContext = Boolean(conv?.leadId && conv?.campaignLeadId)

  return (
    <div className="flex-1 h-full flex flex-col bg-[#fdfdfd] dark:bg-[#0E121B] relative overflow-hidden">
      {/* 1. CHAT HEADER */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 px-4 bg-white dark:bg-[#111622] flex items-center justify-between gap-3 shrink-0 z-10 shadow-2xs">
        {/* LEFT: BACK BUTTON & CONTACT INFO */}
        <div className="flex items-center gap-3 min-w-0">
          {onBackToList && (
            <button
              type="button"
              onClick={onBackToList}
              className="p-1.5 rounded-lg md:hidden text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Voltar para a lista"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center font-bold text-xs shrink-0">
            {contactDisplayName.charAt(0)}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {hasLeadContext && conv?.campaignLeadId && onOpenLeadDetail ? (
                <button
                  type="button"
                  onClick={() => onOpenLeadDetail(conv.campaignLeadId!)}
                  className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-[#2E3E4F] dark:hover:text-sky-400 truncate flex items-center gap-1 cursor-pointer"
                  title="Ver detalhes completos do lead"
                >
                  <span className="truncate">{contactDisplayName}</span>
                  <ExternalLink size={12} className="opacity-60" />
                </button>
              ) : (
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {contactDisplayName}
                </h2>
              )}

              {lead?.companyName && lead?.companyName !== lead?.name && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden sm:inline">
                  • {lead.companyName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {contact?.phoneE164 && (
                <span className="font-mono flex items-center gap-1">
                  <Phone size={10} className="text-slate-400" />
                  {contact.phoneE164}
                </span>
              )}

              {/* Status Badge */}
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-medium',
                  conv?.status === 'waiting_agent'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40'
                    : conv?.status === 'waiting_customer'
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                )}
              >
                {conv?.status === 'waiting_agent'
                  ? 'Precisa responder'
                  : conv?.status === 'waiting_customer'
                    ? 'Aguardando cliente'
                    : conv?.status === 'closed'
                      ? 'Encerrada'
                      : 'Aberta'}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: ASSIGNEE SELECTOR, ACTIONS, THREE DOTS & TOGGLE CONTACT PANEL */}
        <div className="flex items-center gap-2 shrink-0">
          {/* ASSIGNEE DROPDOWN */}
          <div className="hidden lg:flex items-center gap-1 text-xs bg-white dark:bg-[#161B26] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <User size={13} className="text-slate-400 shrink-0" />
            <select
              value={conv?.assignedTo || ''}
              onChange={(e) => handleAssignChange(e.target.value || null)}
              disabled={!canManage}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-300 font-medium focus:outline-none cursor-pointer"
            >
              <option value="">Não atribuído</option>
              {assignees.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* CLOSE / REOPEN ACTION BUTTON */}
          {canManage && conv && (
            conv.status === 'closed' ? (
              <button
                type="button"
                onClick={() => handleConversationClosedChange(false)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B26] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
                title="Reabrir conversa"
              >
                <Unlock size={13} />
                <span>Reabrir</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleConversationClosedChange(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161B26] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium transition-colors cursor-pointer"
                title="Encerrar conversa"
              >
                <CheckCircle2 size={13} />
                <span>Encerrar</span>
              </button>
            )
          )}

          {/* THREE DOTS MENU (COMMERCIAL ACTIONS) */}
          {canManage && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Ações comerciais"
              >
                <MoreVertical size={16} />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#16181D] py-1 shadow-xl text-xs z-50 animate-in fade-in-50 zoom-in-95">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => handleCommercialAction('interested')}
                  >
                    <ExternalLink size={14} className="text-blue-500" />
                    Registrar interesse
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => {
                      setIsMenuOpen(false)
                      setMeetingModalOpen(true)
                    }}
                  >
                    <Calendar size={14} className="text-slate-400" />
                    Agendar reunião
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => handleCommercialAction('proposal')}
                  >
                    <DollarSign size={14} className="text-slate-400" />
                    Registrar proposta
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    onClick={() => handleCommercialAction('lost')}
                  >
                    <ThumbsDown size={14} />
                    Marcar sem interesse
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  {conv?.campaignLeadId && (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={() => {
                        setIsMenuOpen(false)
                        setUnlinkModalOpen(true)
                      }}
                    >
                      <Unlink size={14} />
                      Desvincular conversa
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TOGGLE CONTACT PANEL BUTTON */}
          {onToggleContactPanel && (
            <button
              type="button"
              onClick={onToggleContactPanel}
              className={cn(
                'p-1.5 rounded-lg transition-colors cursor-pointer',
                isContactPanelOpen
                  ? 'bg-slate-100 dark:bg-slate-800 text-[#182331] dark:text-slate-200'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
              title={isContactPanelOpen ? 'Fechar detalhes' : 'Abrir detalhes do contato'}
            >
              {isContactPanelOpen ? (
                <PanelRightClose size={18} />
              ) : (
                <PanelRightOpen size={18} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ERROR NOTICE IF ANY */}
      {commercialError && (
        <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/50 border-b border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between shrink-0">
          <span>{commercialError}</span>
          <button
            type="button"
            onClick={() => setCommercialError(null)}
            className="text-rose-500 hover:text-rose-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* 3. MESSAGES TIMELINE */}
      <div className="flex-1 overflow-y-auto flex flex-col bg-[#efeae2] bg-[linear-gradient(rgba(0,0,0,0.05),rgba(0,0,0,0.05)),url('/images/whatsapp-chat-background-light.jpg')] bg-repeat bg-[length:552px_auto] [.dark_&]:bg-[#0E121B] [.dark_&]:bg-[url('/images/whatsapp-chat-background-dark.jpg')]">
        {isLoading && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
            Carregando mensagens...
          </div>
        ) : (
          <WhatsAppMessageList
            messages={messages}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
            onVisibleUpTo={markAsRead}
          />
        )}
      </div>

      {/* 4. FIXED BOTTOM COMPOSER */}
      <div className="shrink-0 bg-white dark:bg-[#111622] border-t border-slate-200 dark:border-slate-800 z-10">
        <WhatsAppComposer
          isWindowOpen={isWindowOpen}
          optInStatus={contact?.optInStatus || 'unknown'}
          templates={data?.templates || []}
          canManage={canManage}
          isConversationClosed={conv?.status === 'closed'}
          onSendMessage={sendMessage}
          onSyncTemplates={async () => {
            const result = await requestWhatsAppTemplateSyncAction()
            if (result.ok) await refetch()
            return result
          }}
        />
      </div>

      {/* MEETING MODAL */}
      {meetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#16181D] p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Agendar reunião comercial
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Registra a etapa de reunião no pipeline CRM para este lead.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Data e hora *
                </label>
                <input
                  type="datetime-local"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#2E3E4F]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Observações
                </label>
                <textarea
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  placeholder="Pauta da reunião, link de videoconferência ou detalhes..."
                  className="mt-1 h-16 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#2E3E4F]"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMeetingModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!meetingDate}
                onClick={() => {
                  handleCommercialAction('meeting', {
                    scheduled_at: new Date(meetingDate).toISOString(),
                    notes: meetingNotes,
                  })
                  setMeetingModalOpen(false)
                }}
                className="px-4 py-1.5 rounded-lg bg-[#2E3E4F] hover:bg-[#182331] text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                Confirmar reunião
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNLINK MODAL */}
      {unlinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#16181D] p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Desvincular conversa
            </h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              A conversa será mantida no histórico porém desassociada do lead.
            </p>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Motivo *
              </label>
              <textarea
                value={unlinkReason}
                onChange={(e) => setUnlinkReason(e.target.value)}
                placeholder="Ex.: Número pertencia a outro estabelecimento ou contato errado."
                className="mt-1 h-16 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#2E3E4F]"
                required
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUnlinkModalOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!unlinkReason.trim()}
                onClick={handleUnlink}
                className="px-4 py-1.5 rounded-lg bg-[#2E3E4F] hover:bg-[#182331] text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                Confirmar desvinculação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
