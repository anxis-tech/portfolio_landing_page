'use client'

import { cn } from '@/lib/utils'
import { WhatsAppInboxConversationDTO } from '@/modules/prospecting/types/whatsapp'
import { pipelineLabels, PipelineStage } from '@/modules/prospecting/types/index'
import { ExternalLink, X } from 'lucide-react'

interface ConversationContactPanelProps {
  conversation: WhatsAppInboxConversationDTO | null
  onClose?: () => void
  onOpenLeadDetail?: (campaignLeadId: string) => void
  canManage?: boolean
}

function conversationStatusLabel(status: string) {
  return status === 'closed' ? 'Encerrada' : 'Aberta'
}

function optInStatusLabel(status: WhatsAppInboxConversationDTO['optInStatus']) {
  if (status === 'granted') return 'Concedido'
  if (status === 'revoked') return 'Revogado'
  return 'Desconhecido'
}

function pipelineStageClass(stage: string | null | undefined) {
  switch (stage) {
    case 'contacted':
    case 'replied':
      return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/50 dark:bg-sky-950/50 dark:text-sky-300'
    case 'meeting':
    case 'proposal':
      return 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/50 dark:bg-violet-950/50 dark:text-violet-300'
    case 'won':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/60 dark:text-emerald-300'
    case 'lost':
      return 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/50 dark:bg-rose-950/60 dark:text-rose-300'
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
}

function conversationStatusClass(status: string) {
  return status === 'closed'
    ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/50 dark:text-amber-300'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/60 dark:text-emerald-300'
}

export function ConversationContactPanel({
  conversation,
  onClose,
  onOpenLeadDetail,
}: ConversationContactPanelProps) {
  if (!conversation) {
    return (
      <div className="flex h-full w-72 items-center justify-center border-l border-slate-200 bg-white p-6 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-[#111622]">
        Selecione uma conversa para ver informações do contato.
      </div>
    )
  }

  const optInClass =
    conversation.optInStatus === 'granted'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/60 dark:text-emerald-300'
      : conversation.optInStatus === 'revoked'
        ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/60 dark:text-rose-300'
        : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col overflow-y-auto border-l border-slate-200 bg-white select-none dark:border-slate-800 dark:bg-[#111622]">
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-slate-100 text-sm font-bold text-slate-700 dark:border-slate-700/80 dark:bg-slate-800 dark:text-slate-200">
            {conversation.contactName.charAt(0)}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
              {conversation.contactName}
            </h3>
            <p className="mt-0.5 truncate font-mono text-xs text-slate-500 dark:text-slate-400">
              {conversation.phoneE164}
            </p>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Fechar painel"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {conversation.campaignLeadId && conversation.leadId && onOpenLeadDetail && (
          <button
            type="button"
            onClick={() => onOpenLeadDetail(conversation.campaignLeadId!)}
            className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700/80 dark:bg-[#161B26] dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Ver detalhes completos do lead
            <ExternalLink size={12} className="opacity-60" />
          </button>
        )}
      </div>

      <dl className="divide-y divide-slate-100 px-4 dark:divide-slate-800/70">
        <div className="flex items-center justify-between gap-4 py-2.5 text-xs">
          <dt className="text-slate-500 dark:text-slate-400">Responsável</dt>
          <dd className="truncate text-right font-medium text-slate-800 dark:text-slate-200">
            {conversation.assignedName || '—'}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-2.5 text-xs">
          <dt className="text-slate-500 dark:text-slate-400">Estágio do funil</dt>
          <dd className="max-w-[58%] truncate text-right">
            <span className={cn('inline-flex max-w-full truncate rounded border px-1.5 py-0.5 text-[10px] font-bold', pipelineStageClass(conversation.pipelineStage))}>
              {conversation.pipelineStage
                ? pipelineLabels[conversation.pipelineStage as PipelineStage] || conversation.pipelineStage
                : '—'}
            </span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-2.5 text-xs">
          <dt className="text-slate-500 dark:text-slate-400">Status da conversa</dt>
          <dd>
            <span className={cn('inline-flex rounded border px-1.5 py-0.5 text-[10px] font-bold', conversationStatusClass(conversation.status))}>
              {conversationStatusLabel(conversation.status)}
            </span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-2.5 text-xs">
          <dt className="text-slate-500 dark:text-slate-400">Consentimento</dt>
          <dd>
            <span className={cn('inline-flex rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase', optInClass)}>
              {optInStatusLabel(conversation.optInStatus)}
            </span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-2.5 text-xs">
          <dt className="text-slate-500 dark:text-slate-400">Mensagens não lidas</dt>
          <dd className="font-mono font-semibold text-slate-800 dark:text-slate-200">
            {conversation.unreadCount}
          </dd>
        </div>
      </dl>
    </aside>
  )
}