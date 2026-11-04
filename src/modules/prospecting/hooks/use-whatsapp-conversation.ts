'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  WhatsAppConversationPageDTO,
  WhatsAppMessageDTO,
  WhatsAppCursor,
  WhatsAppMessageType,
  WhatsAppMessageStatus,
  WhatsAppSendState,
} from '../types/whatsapp'
import {
  loadWhatsAppConversationAction,
  loadWhatsAppMessagesAction,
  sendWhatsAppMessageAction,
  markWhatsAppReadAction,
} from '../actions/whatsapp.actions'

interface RealtimeMessageInsertPayload {
  id: string
  conversation_id: string
  direction: 'inbound' | 'outbound'
  type: WhatsAppMessageType
  body: string | null
  content?: Record<string, unknown> | null
  template_id?: string | null
  wamid?: string | null
  status: WhatsAppMessageStatus
  send_state: WhatsAppSendState
  inbound_seq?: number | null
  sent_by_name?: string | null
  occurred_at: string
  accepted_at?: string | null
  sent_at?: string | null
  delivered_at?: string | null
  read_at?: string | null
  failed_at?: string | null
  error_code?: string | null
  error_message?: string | null
  uncertainty_acknowledged_at?: string | null
  client_request_id?: string | null
}

interface RealtimeMessageUpdatePayload {
  id: string
  status: WhatsAppMessageStatus
  send_state: WhatsAppSendState
  wamid?: string | null
  accepted_at?: string | null
  sent_at?: string | null
  delivered_at?: string | null
  read_at?: string | null
  failed_at?: string | null
  error_code?: string | null
  error_message?: string | null
  uncertainty_acknowledged_at?: string | null
}

interface RealtimeConversationUpdatePayload {
  status: 'open' | 'waiting_customer' | 'waiting_agent' | 'closed'
  inbound_seq?: number | null
  read_seq?: number | null
  unread_count?: number | null
  last_inbound_at?: string | null
  customer_window_expires_at?: string | null
}

export function useWhatsAppConversation(conversationId: string | null) {
  const [prevConversationId, setPrevConversationId] = useState(conversationId)
  const [data, setData] = useState<WhatsAppConversationPageDTO | null>(null)
  const [messages, setMessages] = useState<WhatsAppMessageDTO[]>([])
  const [nextCursor, setNextCursor] = useState<WhatsAppCursor | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(conversationId))
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(true)

  if (prevConversationId !== conversationId) {
    setPrevConversationId(conversationId)
    setData(null)
    setMessages([])
    setNextCursor(null)
    setIsLoading(Boolean(conversationId))
    setError(null)
  }

  const activeConvIdRef = useRef<string | null>(conversationId)

  // Initial fetch and subscription (§12)
  const fetchSnapshot = useCallback(async (convId: string) => {
    const res = await loadWhatsAppConversationAction(convId)
    if (activeConvIdRef.current !== convId) return

    if (res.ok) {
      setData(res.data)
      setMessages(res.data?.messages || [])
      setNextCursor(res.data?.nextCursor || null)
      setError(null)
    } else {
      setError(res.error)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    activeConvIdRef.current = conversationId
    if (!conversationId) {
      return
    }
    let cancelled = false
    void (async () => {
      const res = await loadWhatsAppConversationAction(conversationId)
      if (cancelled || activeConvIdRef.current !== conversationId) return

      if (res.ok) {
        setData(res.data)
        setMessages(res.data.messages)
        setNextCursor(res.data.nextCursor)
        setError(null)
      } else {
        setError(res.error)
      }
      setIsLoading(false)
    })()

    const supabase = createClient()
    const channelName = `whatsapp-conv-${conversationId}`
    const channel = supabase.channel(channelName)

    // Scoped Realtime bindings (§12)
    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as unknown as RealtimeMessageInsertPayload
          if (!newMsg) return

          setMessages((prev) => {
            // Dedupe by id or replace optimistic by client_request_id
            const existingIdx = prev.findIndex(
              (m) =>
                m.id === newMsg.id ||
                (newMsg.client_request_id && m.id === newMsg.client_request_id)
            )

            const formatted: WhatsAppMessageDTO = {
              id: newMsg.id,
              conversationId: newMsg.conversation_id,
              direction: newMsg.direction,
              type: newMsg.type,
              body: newMsg.body,
              content: newMsg.content || {},
              templateId: newMsg.template_id ?? null,
              wamid: newMsg.wamid ?? null,
              status: newMsg.status,
              sendState: newMsg.send_state,
              inboundSeq: newMsg.inbound_seq ?? null,
              sentByName: newMsg.sent_by_name ?? null,
              occurredAt: newMsg.occurred_at,
              acceptedAt: newMsg.accepted_at ?? null,
              sentAt: newMsg.sent_at ?? null,
              deliveredAt: newMsg.delivered_at ?? null,
              readAt: newMsg.read_at ?? null,
              failedAt: newMsg.failed_at ?? null,
              errorCode: newMsg.error_code ?? null,
              errorMessage: newMsg.error_message ?? null,
              uncertaintyAcknowledgedAt: newMsg.uncertainty_acknowledged_at ?? null,
              isUncertain: newMsg.send_state === 'uncertain' && !newMsg.uncertainty_acknowledged_at,
            }

            if (existingIdx >= 0) {
              const copy = [...prev]
              copy[existingIdx] = formatted
              return copy
            }
            return [formatted, ...prev]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updated = payload.new as unknown as RealtimeMessageUpdatePayload
          if (!updated) return

          setMessages((prev) =>
            prev.map((m) => {
              if (m.id === updated.id) {
                return {
                  ...m,
                  status: updated.status,
                  sendState: updated.send_state,
                  wamid: updated.wamid ?? m.wamid,
                  acceptedAt: updated.accepted_at ?? m.acceptedAt,
                  sentAt: updated.sent_at ?? m.sentAt,
                  deliveredAt: updated.delivered_at ?? m.deliveredAt,
                  readAt: updated.read_at ?? m.readAt,
                  failedAt: updated.failed_at ?? m.failedAt,
                  errorCode: updated.error_code !== undefined ? updated.error_code : m.errorCode,
                  errorMessage: updated.error_message !== undefined ? updated.error_message : m.errorMessage,
                  isUncertain: updated.send_state === 'uncertain' && !updated.uncertainty_acknowledged_at,
                }
              }
              return m
            })
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'whatsapp_conversations',
          filter: `id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedConv = payload.new as unknown as RealtimeConversationUpdatePayload
          if (!updatedConv) return

          setData((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              conversation: {
                ...prev.conversation,
                status: updatedConv.status,
                inboundSeq: Number(updatedConv.inbound_seq ?? prev.conversation.inboundSeq),
                readSeq: Number(updatedConv.read_seq ?? prev.conversation.readSeq),
                unreadCount: Math.max(0, Number(updatedConv.unread_count ?? prev.conversation.unreadCount)),
                lastInboundAt: updatedConv.last_inbound_at ?? prev.conversation.lastInboundAt,
                customerWindowExpiresAt: updatedConv.customer_window_expires_at ?? prev.conversation.customerWindowExpiresAt,
              },
            }
          })
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          fetchSnapshot(conversationId)
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false)
        }
      })

    // Reconnection handling on visibility or online (§12)
    const handleOnline = () => {
      setIsConnected(true)
      fetchSnapshot(conversationId)
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchSnapshot(conversationId)
      }
    }

    window.addEventListener('online', handleOnline)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
      window.removeEventListener('online', handleOnline)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [conversationId, fetchSnapshot])

  // Pagination for older messages (§7.1)
  const loadMore = useCallback(async () => {
    if (!conversationId || !nextCursor || isLoadingMore) return
    setIsLoadingMore(true)

    const res = await loadWhatsAppMessagesAction({
      conversationId,
      cursor: nextCursor,
      limit: 50,
    })

    if (res.ok) {
      setMessages((prev) => [...prev, ...res.data.messages])
      setNextCursor(res.data.nextCursor)
    }
    setIsLoadingMore(false)
  }, [conversationId, nextCursor, isLoadingMore])

  // Send message
  const sendMessage = useCallback(
    async (params: {
      type: WhatsAppMessageType
      body?: string | null
      templateId?: string | null
      parameters?: Record<string, unknown> | null
      replyToId?: string | null
    }): Promise<{ ok: boolean; error?: string }> => {
      if (!conversationId) return { ok: false, error: 'Sem conversa ativa' }

      const requestId = crypto.randomUUID()

      // Optimistic message addition (§12)
      const optimisticMsg: WhatsAppMessageDTO = {
        id: requestId,
        conversationId,
        direction: 'outbound',
        type: params.type,
        body: params.body ?? null,
        content: params.parameters ?? {},
        templateId: params.templateId ?? null,
        wamid: null,
        status: 'pending',
        sendState: 'queued',
        inboundSeq: null,
        sentByName: 'Você',
        occurredAt: new Date().toISOString(),
        acceptedAt: null,
        sentAt: null,
        deliveredAt: null,
        readAt: null,
        failedAt: null,
        errorCode: null,
        errorMessage: null,
        uncertaintyAcknowledgedAt: null,
        isUncertain: false,
      }

      // Template text may be personalized server-side. Only render its persisted
      // message rather than a blank placeholder that could be mistaken for a send.
      if (params.type !== 'template') setMessages((prev) => [optimisticMsg, ...prev])

      let res
      try {
        res = await sendWhatsAppMessageAction({
          conversationId,
          requestId,
          type: params.type,
          body: params.body,
          templateId: params.templateId,
          parameters: params.parameters,
          replyToId: params.replyToId,
        })
      } catch {
        if (activeConvIdRef.current === conversationId) {
          setMessages((prev) => prev.filter((message) => message.id !== requestId))
        }
        return { ok: false, error: 'Não foi possível confirmar a solicitação de envio. Verifique a conexão e atualize a conversa antes de tentar novamente.' }
      }

      if (!res.ok) {
        // A rejected request is not a message. The composer reports this error
        // once; actual provider failures remain on the persisted CRM message.
        if (activeConvIdRef.current === conversationId) {
          setMessages((prev) => prev.filter((message) => message.id !== requestId))
        }
        return { ok: false, error: res.error }
      }

      if (activeConvIdRef.current !== conversationId) return { ok: true }

      if (params.type === 'template') {
        await fetchSnapshot(conversationId)
        return { ok: true }
      }

      // Replace optimistic id with returned messageId
      setMessages((prev) => {
        if (prev.some((message) => message.id === res.data.messageId)) {
          return prev.filter((message) => message.id !== requestId)
        }
        return prev.map((m) =>
          m.id === requestId
            ? { ...m, id: res.data.messageId, status: res.data.status, sendState: res.data.sendState }
            : m
        )
      })

      return { ok: true }
    },
    [conversationId, fetchSnapshot]
  )

  // Mark read
  const markAsRead = useCallback(
    async (upToSeq: number) => {
      if (!conversationId || upToSeq <= 0) return
      await markWhatsAppReadAction({ conversationId, upToSeq })
    },
    [conversationId]
  )

  return {
    data,
    messages,
    isLoading,
    isLoadingMore,
    error,
    isConnected,
    hasMore: Boolean(nextCursor),
    loadMore,
    sendMessage,
    markAsRead,
    refetch: () => conversationId && fetchSnapshot(conversationId),
  }
}
