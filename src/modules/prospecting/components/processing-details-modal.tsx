'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import {
  X,
  RefreshCw,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Clock,
  RotateCcw,
  Copy,
  Check,
} from 'lucide-react'
import { getProcessingDetailsAction, leadControlAction } from '../actions'
import type { ProcessingDetails, ProcessingLeadItem } from '../types/index'
import { buttonClass } from './shared'
import {
  buildTechnicalErrorsMarkdown,
  buildTechnicalErrorMarkdown,
} from '../utils/markdown-errors'

function copyToClipboardFallback(text: string) {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.opacity = '0'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  try {
    document.execCommand('copy')
  } finally {
    document.body.removeChild(textArea)
  }
}

export function ProcessingDetailsModal({
  isOpen,
  onClose,
  campaignId,
  canManage,
  onRefreshAggregates,
}: {
  isOpen: boolean
  onClose: () => void
  campaignId: string
  canManage: boolean
  onRefreshAggregates?: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [tab, setTab] = useState<'processing' | 'failed'>('processing')
  const [data, setData] = useState<ProcessingDetails>({ processing: [], failed: [] })
  const [error, setError] = useState('')
  const [loading, startLoading] = useTransition()
  const [retryingId, setRetryingId] = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const load = useCallback(async () => {
    if (!campaignId) return
    const res = await getProcessingDetailsAction(campaignId)
    if (res.ok) {
      setData(res.data)
      setError('')
    } else {
      setError(res.error)
    }
  }, [campaignId])

  useEffect(() => {
    const el = dialogRef.current
    if (isOpen) {
      if (!el?.open) el?.showModal()
      startLoading(load)
    } else {
      if (el?.open) el?.close()
    }
  }, [isOpen, load])

  const handleRetry = async (leadId: string) => {
    if (!canManage) return
    setRetryingId(leadId)
    setError('')
    try {
      const res = await leadControlAction({ id: leadId, action: 'retry' })
      if (!res.ok) {
        setError(res.error)
      } else {
        await load()
        onRefreshAggregates?.()
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao reenviar lead.')
    } finally {
      setRetryingId(null)
    }
  }

  const handleCopyAll = async () => {
    if (data.failed.length === 0) return
    const md = buildTechnicalErrorsMarkdown(data.failed)
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(md)
      } else {
        copyToClipboardFallback(md)
      }
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 1800)
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Não foi possível copiar os erros para a área de transferência.'
      )
    }
  }

  const processingCount = data.processing.length
  const failedCount = data.failed.length

  if (!isOpen) return null

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="processing-modal-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 m-auto h-fit max-h-[85vh] w-full max-w-4xl rounded-xl border border-slate-200 bg-[#FDFDFD] p-0 text-[#182331] shadow-2xl backdrop:bg-slate-950/50"
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
        <div>
          <h2 id="processing-modal-title" className="text-base font-bold text-[#182331]">Processamento da campanha</h2>
          <p className="mt-0.5 text-xs text-slate-500">Itens que ainda precisam de processamento ou revisão.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => startLoading(load)}
            disabled={loading}
            className={buttonClass}
            title="Atualizar detalhes"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className={buttonClass}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-5 mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:mx-6">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs & Section Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 pt-2 sm:px-6">
        <div role="tablist" aria-label="Status do processamento" className="flex">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'processing'}
            onClick={() => setTab('processing')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              tab === 'processing'
                ? 'border-[#233141] text-[#182331]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock size={16} />
            <span>Em processamento</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {processingCount}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'failed'}
            onClick={() => setTab('failed')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
              tab === 'failed'
                ? 'border-[#233141] text-[#182331]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle size={16} />
            <span>Falhas técnicas</span>
            <span
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600"
            >
              {failedCount}
            </span>
          </button>
        </div>

        {/* Action Button: Copiar erros (somente na aba de falhas e se houver falhas) */}
        {tab === 'failed' && failedCount > 0 && (
          <div className="py-2">
            <button
              type="button"
              onClick={handleCopyAll}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors shadow-xs ${
                copiedAll
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title="Copiar todas as falhas técnicas em formato Markdown para colar no ChatGPT"
              aria-label="Copiar todos os erros técnicos em Markdown"
            >
              {copiedAll ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span>Copiado ✓</span>
                </>
              ) : (
                <>
                  <Copy size={14} className="text-slate-500" />
                  <span>Copiar erros</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Content list */}
      <div className="max-h-[55vh] divide-y divide-slate-100 overflow-y-auto px-5 sm:px-6">
        {loading && data.processing.length === 0 && data.failed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Loader2 size={24} className="animate-spin mb-2" />
            <span className="text-sm">Carregando detalhes operacionais...</span>
          </div>
        ) : tab === 'processing' ? (
          data.processing.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
              <p className="text-sm font-medium text-slate-700">Tudo em dia</p>
              <p className="text-xs text-slate-500">
                Nenhum estabelecimento aguardando enriquecimento no momento.
              </p>
            </div>
          ) : (
            data.processing.map((item) => <ProcessingItemRow key={item.id} item={item} />)
          )
        ) : data.failed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
            <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
            <p className="text-sm font-medium text-slate-700">Nenhuma falha técnica no momento.</p>
            <p className="text-xs text-slate-500">
              Não há registros com problemas bloqueantes de enriquecimento.
            </p>
          </div>
        ) : (
          data.failed.map((item) => (
            <FailedItemRow
              key={item.id}
              item={item}
              canManage={canManage}
              retrying={retryingId === item.id}
              onRetry={() => handleRetry(item.id)}
            />
          ))
        )}
      </div>

      <div className="flex justify-end rounded-b-xl border-t border-slate-200 bg-white px-5 py-3 sm:px-6">
        <button type="button" onClick={onClose} className={buttonClass}>
          Fechar
        </button>
      </div>
    </dialog>
  )
}

function ProcessingItemRow({ item }: { item: ProcessingLeadItem }) {
  const isPlaceholder =
    !item.name ||
    ['Estabelecimento em enriquecimento', 'Carregando empresa...'].includes(item.name.trim())
  const displayName = isPlaceholder
    ? item.google_place_id
      ? `Local ${item.google_place_id.slice(0, 16)}...`
      : 'Estabelecimento descoberto'
    : item.name

  return (
    <div className="flex items-center justify-between py-4">
      <div className="min-w-0 pr-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-900 truncate">{displayName}</span>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {item.data_status === 'enriching' ? 'Enriquecendo dados' : 'Descoberto'}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>{item.segment}</span>
          {item.job && (
            <>
              <span>•</span>
              <span>Etapa: {item.job.type}</span>
              <span>•</span>
              <span>
                Tentativa {item.job.attempts} de {item.job.max_attempts}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <Loader2 size={13} className="animate-spin text-[#233141]" />
        <span>Em andamento</span>
      </div>
    </div>
  )
}

function FailedItemRow({
  item,
  canManage,
  retrying,
  onRetry,
}: {
  item: ProcessingLeadItem
  canManage: boolean
  retrying: boolean
  onRetry: () => void
}) {
  const [copied, setCopied] = useState(false)
  const isPlaceholder =
    !item.name ||
    ['Estabelecimento em enriquecimento', 'Carregando empresa...'].includes(item.name.trim())
  const displayName = isPlaceholder
    ? item.google_place_id
      ? `Local ${item.google_place_id.slice(0, 16)}...`
      : 'Estabelecimento'
    : item.name
  const errorMsg =
    item.job?.error_message || 'Falha ao buscar dados mínimos do estabelecimento no Google Places.'

  const handleCopySingle = async () => {
    const md = buildTechnicalErrorMarkdown(item)
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(md)
      } else {
        copyToClipboardFallback(md)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch (e) {
      console.error('Erro ao copiar erro individual', e)
    }
  }

  return (
    <div className="flex items-start justify-between gap-3 py-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-slate-900 truncate">{displayName}</span>
          <span className="rounded bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
            Falha no enriquecimento
          </span>
        </div>
        <p className="mt-1 rounded border border-slate-200 bg-slate-50 p-1.5 font-mono text-xs break-words whitespace-pre-wrap text-slate-600">
          {errorMsg}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <span>{item.segment}</span>
          {item.job && (
            <>
              <span>•</span>
              <span>
                Tentativas esgotadas ({item.job.attempts}/{item.job.max_attempts})
              </span>
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-1.5">
        {/* Botão de cópia individual em Markdown */}
        <button
          type="button"
          onClick={handleCopySingle}
          className={`inline-flex items-center justify-center rounded-lg border p-1.5 text-xs font-semibold transition-colors ${
            copied
              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
              : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
          title={copied ? 'Erro copiado!' : 'Copiar erro técnico em Markdown'}
          aria-label="Copiar erro técnico"
        >
          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
        </button>

        {canManage && (
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            title="Tentar enriquecer novamente"
          >
            {retrying ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RotateCcw size={13} />
            )}
            <span>{retrying ? 'Reenviando...' : 'Tentar novamente'}</span>
          </button>
        )}
      </div>
    </div>
  )
}
