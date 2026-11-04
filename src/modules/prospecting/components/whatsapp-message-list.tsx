'use client'

import { useRef, useEffect } from 'react'
import { Check, CheckCheck, Clock, AlertCircle, HelpCircle } from 'lucide-react'
import { WhatsAppMessageDTO, WhatsAppMessageStatus } from '../types/whatsapp'

interface WhatsAppMessageListProps {
  messages: WhatsAppMessageDTO[]
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
  onVisibleUpTo?: (inboundSeq: number) => void
}

function formatMessageTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

function failedMessageReason(message: WhatsAppMessageDTO): string {
  if (message.errorCode === '131042') {
    return 'A Meta bloqueou a entrega por configuração de cobrança da conta WhatsApp Business. Configure a moeda e a forma de pagamento no Gerenciador do WhatsApp.'
  }
  return message.errorMessage || (message.errorCode
    ? `Não foi possível enviar a mensagem. Código: ${message.errorCode}.`
    : 'Não foi possível enviar a mensagem. Consulte o status da integração.')
}

function StatusIndicator({ status, isUncertain }: { status: WhatsAppMessageStatus; isUncertain: boolean }) {
  if (isUncertain) {
    return (
      <span className="inline-flex items-center text-amber-500" title="Envio incerto - aguardando confirmação">
        <HelpCircle size={13} />
      </span>
    )
  }

  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center text-slate-400" title="Pendente de envio">
          <Clock size={12} />
        </span>
      )
    case 'accepted':
      return (
        <span className="inline-flex items-center text-slate-400" title="Aceita pela Meta">
          <Check size={13} />
        </span>
      )
    case 'sent':
      return (
        <span className="inline-flex items-center text-slate-400" title="Enviada">
          <Check size={13} />
        </span>
      )
    case 'delivered':
      return (
        <span className="inline-flex items-center text-slate-400" title="Entregue ao destinatário">
          <CheckCheck size={13} />
        </span>
      )
    case 'read':
      return (
        <span className="inline-flex items-center text-blue-500" title="Lida pelo cliente">
          <CheckCheck size={13} />
        </span>
      )
    case 'failed':
      return (
        <span className="inline-flex items-center text-rose-500" title="Falha no envio">
          <AlertCircle size={13} />
        </span>
      )
    default:
      return null
  }
}

export function WhatsAppMessageList({
  messages,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onVisibleUpTo,
}: WhatsAppMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Chronological order: reverse from the API query (which is ordered DESC for keyset pagination)
  const chronological = [...(messages || [])].reverse()

  // Track max visible inbound seq to report read status (§12, §13)
  useEffect(() => {
    if (!onVisibleUpTo) return
    let maxInboundSeq = 0
    for (const m of (messages || [])) {
      if (m.direction === 'inbound' && m.inboundSeq && m.inboundSeq > maxInboundSeq) {
        maxInboundSeq = m.inboundSeq
      }
    }
    if (maxInboundSeq > 0) {
      onVisibleUpTo(maxInboundSeq)
    }
  }, [messages, onVisibleUpTo])

  // Scroll to bottom on first load or new message
  useEffect(() => {
    if (!isLoadingMore && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages.length, isLoadingMore])

  return (
    <div
      ref={containerRef}
      className="flex flex-1 flex-col overflow-y-auto p-4 space-y-3"
      role="log"
      aria-live="polite"
      tabIndex={0}
    >
      {hasMore && (
        <div className="flex justify-center py-2">
          <button
            type="button"
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-50"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Carregando anteriores…' : 'Carregar mensagens anteriores'}
          </button>
        </div>
      )}

      {chronological.length === 0 && (
        <div className="flex flex-1 items-center justify-center text-center p-8 text-slate-400 text-sm">
          Nenhuma mensagem nesta conversa ainda.
        </div>
      )}

      {chronological.map((msg) => {
        const isInbound = msg.direction === 'inbound'
        return (
          <div
            key={msg.id}
            className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-2xs text-sm ${
                isInbound
                  ? 'bg-white dark:bg-[#161B26] text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-bl-xs'
                  : 'bg-[#2E3E4F] dark:bg-[#1E293B] text-white rounded-br-xs'
              }`}
            >
              {!isInbound && msg.sentByName && (
                <p className="mb-0.5 text-[10px] font-medium text-slate-300">
                  {msg.sentByName}
                </p>
              )}

              {/* Render message body safely as text child to prevent XSS (§14) */}
              <p className="whitespace-pre-wrap break-words">{msg.body || '[Sem conteúdo de texto]'}</p>

              <div
                className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] ${
                  isInbound ? 'text-slate-400 dark:text-slate-500' : 'text-slate-300'
                }`}
              >
                <span>{formatMessageTime(msg.occurredAt)}</span>
                {!isInbound && (
                  <StatusIndicator status={msg.status} isUncertain={msg.isUncertain} />
                )}
              </div>
            </div>

            {msg.status === 'failed' && (
              <p className="mt-1 text-xs text-rose-600">
                {failedMessageReason(msg)}
              </p>
            )}

            {msg.isUncertain && (
              <p className="mt-1 text-xs text-amber-600">
                Não foi possível confirmar o envio. Aguarde a atualização.
              </p>
            )}
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
