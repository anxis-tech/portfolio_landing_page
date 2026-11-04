'use client'

import { Mail } from 'lucide-react'
import { WhatsAppIcon } from '@/components/ui/whatsapp-icon'
import { buttonClass } from './shared'
import { WhatsAppSummaryDTO } from '../types/whatsapp'

interface ContactActionsProps {
  onWhatsApp?: () => void
  onEmail?: () => void
  onContact?: (channel: 'WhatsApp' | 'E-mail') => void
  summary?: WhatsAppSummaryDTO
  compact?: boolean
  disabled?: boolean
  whatsAppDisabled?: boolean
}

export function ContactActions({
  onWhatsApp,
  onEmail,
  onContact,
  summary,
  compact = false,
  disabled = false,
  whatsAppDisabled = false,
}: ContactActionsProps) {
  const handleWhatsApp = () => {
    if (onWhatsApp) onWhatsApp()
    else if (onContact) onContact('WhatsApp')
  }

  const handleEmail = () => {
    if (onEmail) onEmail()
    else if (onContact) onContact('E-mail')
  }

  const unreadCount = summary?.unreadCount || 0
  const isFailed = summary?.lastMessageStatus === 'failed'
  const isWhatsAppDisabled = disabled || whatsAppDisabled

  let whatsappTitle = isWhatsAppDisabled
    ? 'Nenhum telefone disponível para contato pelo WhatsApp'
    : 'Abrir conversa no WhatsApp'
  if (!isWhatsAppDisabled && isFailed) {
    whatsappTitle = 'WhatsApp — falha no último envio'
  } else if (!isWhatsAppDisabled && unreadCount > 0) {
    whatsappTitle = `WhatsApp — ${unreadCount} mensagem(ns) não lida(s)`
  } else if (!isWhatsAppDisabled && summary?.hasConversation) {
    whatsappTitle = 'WhatsApp — conversa em andamento'
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        className={`${buttonClass} relative ${
          compact
            ? isWhatsAppDisabled
              ? 'border-slate-200 !bg-slate-100 text-slate-400 opacity-60 cursor-not-allowed'
              : 'border-[#25D366] !bg-[#25D366] text-white hover:bg-[#20BD5A]'
            : unreadCount > 0
              ? 'border-[#2E3E4F]/30 bg-[#2E3E4F]/10 text-[#2E3E4F]'
              : ''
        }`}
        title={whatsappTitle}
        aria-label={isWhatsAppDisabled ? whatsappTitle : 'Contato por WhatsApp'}
        onClick={handleWhatsApp}
        disabled={isWhatsAppDisabled}
      >
        <WhatsAppIcon
          size={14}
          className={
            isWhatsAppDisabled ? 'text-slate-400' : compact ? 'text-white' : 'text-[#25D366]'
          }
        />
        {!compact && 'WhatsApp'}

        {isFailed && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white">
            !
          </span>
        )}

        {unreadCount > 0 && !isFailed && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2E3E4F] px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <button
        type="button"
        className={buttonClass}
        title="E-mail — integração não configurada"
        aria-label="Contato por e-mail"
        onClick={handleEmail}
        disabled={disabled}
      >
        <Mail size={14} />
        {!compact && 'E-mail'}
      </button>
    </div>
  )
}
