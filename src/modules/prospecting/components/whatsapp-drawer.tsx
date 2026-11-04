'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import {
  X,
  Phone,
  User,
  MoreVertical,
  Calendar,
  DollarSign,
  ThumbsDown,
  Lock,
  Unlock,
  Unlink,
  ExternalLink,
} from 'lucide-react'
import { useWhatsAppConversation } from '../hooks/use-whatsapp-conversation'
import { WhatsAppMessageList } from './whatsapp-message-list'
import { WhatsAppComposer } from './whatsapp-composer'
import { WhatsAppConsentForm } from './whatsapp-consent-form'
import { ClassificationBadge, buttonClass, primaryClass, inputClass } from './shared'
import { pipelineLabels, PipelineStage } from '../types/index'
import {
  assignWhatsAppConversationAction,
  setWhatsAppConversationClosedAction,
  whatsappCommercialAction,
  unlinkWhatsAppConversationAction,
  listWhatsAppAssigneesAction,
  sendFirstContactWhatsAppAction,
  loadWhatsAppContextAction,
  requestWhatsAppTemplateSyncAction,
} from '../actions/whatsapp.actions'
import { WhatsAppAssigneeDTO, WhatsAppCandidateDTO, WhatsAppCommercialActionType, WhatsAppTemplateDTO } from '../types/whatsapp'
import { checkCustomerWindow } from '../services/whatsapp-policy'

interface WhatsAppDrawerProps {
  campaignLeadId?: string | null
  conversationId?: string | null
  canManage: boolean
  onClose: () => void
  onChanged?: () => void
}

export function WhatsAppDrawer({
  campaignLeadId,
  conversationId: initialConvId,
  canManage,
  onClose,
  onChanged,
}: WhatsAppDrawerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConvId ?? null)
  const [candidates, setCandidates] = useState<WhatsAppCandidateDTO[]>([])
  const [firstContactTemplate, setFirstContactTemplate] = useState<WhatsAppTemplateDTO | null>(null)
  const [selectedPhone, setSelectedPhone] = useState('')
  const [selectedFirstContactTemplateId, setSelectedFirstContactTemplateId] = useState('')
  const [contextLoading, setContextLoading] = useState(Boolean(campaignLeadId))
  const [contextError, setContextError] = useState<string | null>(null)
  const [assignees, setAssignees] = useState<WhatsAppAssigneeDTO[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [meetingModalOpen, setMeetingModalOpen] = useState(false)
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingNotes, setMeetingNotes] = useState('')
  const [unlinkModalOpen, setUnlinkModalOpen] = useState(false)
  const [unlinkReason, setUnlinkReason] = useState('')
  const [commercialError, setCommercialError] = useState<string | null>(null)
  const [firstContactNotice, setFirstContactNotice] = useState<string | null>(null)
  const [firstContactNoticeWarning, setFirstContactNoticeWarning] = useState(false)
  const [firstContactPending, setFirstContactPending] = useState(false)
  const firstContactInFlight = useRef(false)
  const firstContactRequestIds = useRef(new Map<string, string>())
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
  } = useWhatsAppConversation(activeConvId)

  // Open native dialog modal
  useEffect(() => {
    dialogRef.current?.showModal()
  }, [])

  // Load context (candidates / assignees)
  useEffect(() => {
    if (campaignLeadId) {
      loadWhatsAppContextAction(campaignLeadId).then((res) => {
        setContextLoading(false)
        if (!res.ok) {
          setContextError(res.error)
          return
        }

        setContextError(null)
        setCandidates(res.data.candidates)
        setFirstContactTemplate(res.data.firstContactTemplate)
        setSelectedPhone((current) =>
          res.data.candidates.some((candidate) => candidate.phoneE164 === current)
            ? current
            : res.data.candidates[0]?.phoneE164 ?? ''
        )

        const enabledAccountIds = new Set(res.data.accounts.map((account) => account.id))
        const currentConversation = activeConvId
          ? res.data.conversations.find((conversation) => conversation.id === activeConvId) ?? null
          : null
        const currentIsEnabled = currentConversation !== null && enabledAccountIds.has(currentConversation.accountId)
        const preferredConversation = res.data.conversations.find(
          (conversation) => enabledAccountIds.has(conversation.accountId)
        )

        if (!currentIsEnabled) {
          setActiveConvId(preferredConversation?.id ?? null)
        }
      }).catch(() => {
        setContextLoading(false)
        setContextError('Verifique a conexão e tente novamente.')
      })
    }

    listWhatsAppAssigneesAction().then((res) => {
      if (res.ok) {
        setAssignees(res.data)
      }
    })
  }, [campaignLeadId, activeConvId])

  const selectedCandidate = candidates.find((candidate) => candidate.phoneE164 === selectedPhone)
  const selectedFirstContactTemplate =
    firstContactTemplate?.id === selectedFirstContactTemplateId ? firstContactTemplate : null
  const firstContactBody = selectedFirstContactTemplate?.components.find(
    (component) => component.type === 'BODY'
  )?.text?.replace(/\{\{1\}\}/g, '[seu primeiro nome]')

  // A first contact is an explicit action, never a side effect of opening the drawer.
  const handleFirstContact = async (phoneE164: string, prospectingContactId?: string | null) => {
    const leadId = campaignLeadId ?? data?.conversation.campaignLeadId
    if (!canManage || !leadId || firstContactInFlight.current) return

    firstContactInFlight.current = true
    setFirstContactPending(true)
    setCommercialError(null)
    setFirstContactNotice(null)
    setFirstContactNoticeWarning(false)

    const requestKey = `${leadId}:${phoneE164}`
    let requestId = firstContactRequestIds.current.get(requestKey)
    if (!requestId) {
      requestId = crypto.randomUUID()
      firstContactRequestIds.current.set(requestKey, requestId)
    }

    try {
      const res = await sendFirstContactWhatsAppAction({
        campaignLeadId: leadId,
        phoneE164,
        prospectingContactId: prospectingContactId ?? null,
        requestId,
      })

      if (res.ok) {
        setActiveConvId(res.data.conversationId)
        if (res.data.sendState === 'failed' || res.data.status === 'failed') {
          setCommercialError('A tentativa de primeiro contato falhou. Consulte o motivo na mensagem da conversa; nenhuma nova mensagem foi criada.')
        } else if (res.data.sendState === 'uncertain') {
          setFirstContactNoticeWarning(true)
          setFirstContactNotice('Não foi possível confirmar o envio do primeiro contato. Aguarde a atualização da Meta antes de tentar novamente.')
        } else {
          setFirstContactNotice(
            res.data.sendState === 'queued'
              ? 'Primeiro contato registrado na fila. Acompanhe o status da mensagem e aguarde a resposta do lead.'
              : 'Primeiro contato registrado. Acompanhe o status da mensagem e aguarde a resposta do lead.'
          )
        }
        if (activeConvId === res.data.conversationId) refetch()
        onChanged?.()
      } else {
        setCommercialError(res.error)
      }
    } catch {
      setCommercialError('Não foi possível solicitar o primeiro contato. Verifique a conexão e tente novamente.')
    } finally {
      firstContactInFlight.current = false
      setFirstContactPending(false)
    }
  }

  // Assignee change
  const handleAssignChange = (userId: string | null) => {
    if (!activeConvId || !canManage) return
    startTransition(async () => {
      await assignWhatsAppConversationAction({
        conversationId: activeConvId,
        assignedTo: userId,
        requestId: crypto.randomUUID(),
      })
      refetch()
    })
  }

  // Commercial Action
  const handleCommercialAction = (action: WhatsAppCommercialActionType, actionData: Record<string, unknown> = {}) => {
    if (!activeConvId || !canManage) return
    startTransition(async () => {
      setCommercialError(null)
      const res = await whatsappCommercialAction({
        conversationId: activeConvId,
        action,
        requestId: crypto.randomUUID(),
        data: actionData,
      })
      setIsMenuOpen(false)
      if (res.ok) {
        refetch()
        onChanged?.()
      } else {
        setCommercialError(res.error)
      }
    })
  }

  const handleConversationClosedChange = (closed: boolean) => {
    if (!activeConvId || !canManage) return
    startTransition(async () => {
      setCommercialError(null)
      const res = await setWhatsAppConversationClosedAction({
        conversationId: activeConvId,
        closed,
        requestId: crypto.randomUUID(),
      })
      setIsMenuOpen(false)
      if (res.ok) {
        refetch()
        onChanged?.()
      } else {
        setCommercialError(res.error)
      }
    })
  }

  // Unlink
  const handleUnlink = () => {
    if (!activeConvId || !unlinkReason.trim() || !canManage) return
    startTransition(async () => {
      setCommercialError(null)
      const res = await unlinkWhatsAppConversationAction({
        conversationId: activeConvId,
        reason: unlinkReason.trim(),
        requestId: crypto.randomUUID(),
      })
      if (res.ok) {
        setUnlinkModalOpen(false)
        setUnlinkReason('')
        refetch()
        onChanged?.()
      } else {
        setCommercialError(res.error)
      }
    })
  }

  const conv = data?.conversation
  const contact = data?.contact
  const lead = data?.lead
  const hasEmptyLeadConversation = Boolean(
    data &&
    (campaignLeadId || conv?.campaignLeadId) &&
    !conv?.lastInboundAt &&
    !conv?.lastOutboundAt &&
    messages.length === 0
  )
  const { isOpen: isWindowOpen } = checkCustomerWindow(conv?.lastInboundAt ?? null)

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="whatsapp-dialog-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-2xl border-l border-slate-200 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/40 focus:outline-none"
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3
                  id="whatsapp-dialog-title"
                  className="truncate text-base font-bold text-slate-900"
                >
                  {lead?.name || lead?.companyName || contact?.phoneE164 || 'Conversa WhatsApp'}
                </h3>
                {lead?.classification && (
                  <ClassificationBadge lead={{ classification: lead.classification }} />
                )}
                {lead?.stage && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                    {pipelineLabels[lead.stage as PipelineStage] || lead.stage}
                  </span>
                )}
              </div>

              {contact?.phoneE164 && (
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <Phone size={13} />
                  <span>{contact.phoneE164}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Menu Actions */}
              {canManage && activeConvId && (
                <div className="relative">
                  <button
                    type="button"
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    title="Ações comerciais"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg text-xs">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                        onClick={() => handleCommercialAction('interested')}
                      >
                        <ExternalLink size={14} />
                        Registrar interesse
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                        onClick={() => {
                          setIsMenuOpen(false)
                          setMeetingModalOpen(true)
                        }}
                      >
                        <Calendar size={14} />
                        Agendar reunião
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                        onClick={() => handleCommercialAction('proposal')}
                      >
                        <DollarSign size={14} />
                        Registrar proposta
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50"
                        onClick={() => handleCommercialAction('lost')}
                      >
                        <ThumbsDown size={14} />
                        Marcar sem interesse
                      </button>
                      <div className="my-1 border-t border-slate-100" />
                      {conv?.status === 'closed' ? (
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                          onClick={() => handleConversationClosedChange(false)}
                        >
                          <Unlock size={14} />
                          Reabrir conversa
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
                          onClick={() => handleConversationClosedChange(true)}
                        >
                          <Lock size={14} />
                          Encerrar conversa
                        </button>
                      )}
                      {conv?.campaignLeadId && (
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50"
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

              <button
                type="button"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                onClick={onClose}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Assignee */}
          <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-2 text-xs">
            {/* Assignee */}
            <div className="flex items-center gap-1.5">
              <User size={13} className="text-slate-400" />
              <select
                value={conv?.assignedTo || ''}
                onChange={(e) => handleAssignChange(e.target.value || null)}
                disabled={!canManage || !activeConvId}
                className="rounded border-0 bg-transparent text-xs text-slate-700 font-medium hover:underline focus:ring-0 cursor-pointer"
              >
                <option value="">Não atribuído</option>
                {assignees.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {commercialError && (
            <div role="alert" className="mt-2 rounded-lg bg-rose-50 p-2 text-xs text-rose-700">
              {commercialError}
            </div>
          )}
          {firstContactNotice && !conv?.lastInboundAt && (
            <div
              role="status"
              className={`mt-2 rounded-lg p-2 text-xs ${firstContactNoticeWarning ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}
            >
              {firstContactNotice}
            </div>
          )}
        </div>

        {/* If no active conversation, show candidate picker */}
        {!activeConvId && (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            <Phone size={36} className="text-[#2E3E4F] mb-3 opacity-80" />
            <h4 className="text-base font-bold text-slate-800">
              Primeiro contato no WhatsApp
            </h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              Selecione um número para enviar o template aprovado de primeiro contato ao lead.
            </p>

            {contextLoading ? (
              <p className="mt-4 text-xs text-slate-500" role="status">Carregando contatos…</p>
            ) : contextError ? (
              <p className="mt-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700" role="alert">
                Não foi possível carregar os contatos: {contextError}
              </p>
            ) : candidates.length > 0 ? (
              <div className="mt-4 w-full max-w-sm space-y-3 text-left">
                <div>
                  <label htmlFor="first-contact-phone" className="mb-1 block text-xs font-semibold text-slate-700">
                    Número do lead
                  </label>
                  <select
                    id="first-contact-phone"
                    className={`${inputClass} w-full text-xs`}
                    value={selectedPhone}
                    onChange={(event) => setSelectedPhone(event.target.value)}
                    disabled={!canManage || firstContactPending}
                  >
                    {candidates.map((candidate) => (
                      <option key={candidate.phoneE164} value={candidate.phoneE164}>
                        {candidate.displayPhone}{candidate.isPrimary ? ' · Principal' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="first-contact-template" className="mb-1 block text-xs font-semibold text-slate-700">
                    Template Meta aprovado
                  </label>
                  <select
                    id="first-contact-template"
                    className={`${inputClass} w-full text-xs`}
                    value={selectedFirstContactTemplateId}
                    onChange={(event) => setSelectedFirstContactTemplateId(event.target.value)}
                    disabled={!canManage || firstContactPending || !firstContactTemplate?.supported}
                  >
                    <option value="">Selecione um template</option>
                    {firstContactTemplate && (
                      <option value={firstContactTemplate.id}>
                        {firstContactTemplate.name} ({firstContactTemplate.language})
                      </option>
                    )}
                  </select>
                </div>

                {!firstContactTemplate?.supported && (
                  <p className="text-xs text-amber-700" role="status">
                    O template de primeiro contato não está disponível nesta conta. Sincronize os templates aprovados antes de enviar.
                  </p>
                )}

                {firstContactBody && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                    <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400">Pré-visualização</p>
                    <p className="whitespace-pre-wrap">{firstContactBody}</p>
                  </div>
                )}

                <button
                  type="button"
                  className={`${primaryClass} w-full justify-center text-xs`}
                  onClick={() => {
                    if (selectedCandidate && selectedFirstContactTemplate?.supported) {
                      void handleFirstContact(selectedCandidate.phoneE164, selectedCandidate.prospectingContactId)
                    }
                  }}
                  disabled={!canManage || firstContactPending || !selectedCandidate || !selectedFirstContactTemplate?.supported}
                >
                  {firstContactPending ? 'Solicitando…' : 'Enviar template'}
                </button>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-400">
                Nenhum número de telefone válido encontrado para este lead.
              </div>
            )}
          </div>
        )}

        {/* Active conversation body */}
        {activeConvId && (
          <>
            {/* Consent Form Banner */}
            {contact && (
              <div className="border-b border-slate-100 px-4 py-2 bg-slate-50/50">
                <WhatsAppConsentForm
                  contactId={contact.id}
                  optInStatus={contact.optInStatus}
                  canManage={canManage}
                  onUpdated={refetch}
                />
              </div>
            )}

            {hasEmptyLeadConversation && canManage && (
              <div className="border-b border-slate-100 px-4 py-3 text-sm">
                <p className="mb-2 text-xs text-slate-600">
                  Esta conversa ainda não tem mensagens. Envie o template aprovado para iniciar o contato.
                </p>
                <button
                  type="button"
                  className={primaryClass}
                  onClick={() => handleFirstContact(contact?.phoneE164 ?? '', conv?.prospectingContactId)}
                  disabled={!contact?.phoneE164 || firstContactPending}
                >
                  {firstContactPending ? 'Solicitando primeiro contato…' : 'Enviar primeiro contato'}
                </button>
              </div>
            )}

            {/* Messages Area */}
            {isLoading && messages.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
                Carregando conversa…
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

            {/* Fixed Composer */}
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
          </>
        )}
      </div>

      {/* Meeting modal */}
      {meetingModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h4 className="font-bold text-sm text-slate-800">Agendar reunião comercial</h4>
            <p className="mt-1 text-xs text-slate-500">
              Registra a etapa de reunião no CRM para este lead.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600">Data e hora *</label>
                <input
                  type="datetime-local"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className={`${inputClass} mt-1 w-full text-xs`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600">Observações</label>
                <textarea
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  placeholder="Assunto da reunião, link ou detalhes..."
                  className={`${inputClass} mt-1 h-16 w-full text-xs`}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className={`${buttonClass} text-xs`}
                onClick={() => setMeetingModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={`${primaryClass} text-xs`}
                disabled={!meetingDate}
                onClick={() => {
                  handleCommercialAction('meeting', {
                    scheduled_at: new Date(meetingDate).toISOString(),
                    notes: meetingNotes,
                  })
                  setMeetingModalOpen(false)
                }}
              >
                Confirmar reunião
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unlink modal */}
      {unlinkModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h4 className="font-bold text-sm text-slate-800">Desvincular conversa</h4>
            <p className="mt-1 text-xs text-slate-500">
              A conversa deixará de estar associada a este lead. O histórico é preservado.
            </p>

            <div className="mt-3">
              <label className="block text-xs font-medium text-slate-600">Motivo *</label>
              <textarea
                value={unlinkReason}
                onChange={(e) => setUnlinkReason(e.target.value)}
                placeholder="Ex.: Número pertencia a outro estabelecimento ou contato errado."
                className={`${inputClass} mt-1 h-16 w-full text-xs`}
                required
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className={`${buttonClass} text-xs`}
                onClick={() => setUnlinkModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                disabled={!unlinkReason.trim()}
                onClick={handleUnlink}
              >
                Desvincular
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
