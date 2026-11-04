'use client'

import { useState, useTransition } from 'react'
import { ShieldCheck, ShieldAlert, ShieldX, Check, AlertCircle } from 'lucide-react'
import { WhatsAppOptInStatus, WhatsAppConsentSource } from '../types/whatsapp'
import { recordWhatsAppConsentAction } from '../actions/whatsapp.actions'
import { inputClass, buttonClass, primaryClass } from './shared'

interface WhatsAppConsentFormProps {
  contactId: string
  optInStatus: WhatsAppOptInStatus
  canManage: boolean
  onUpdated: () => void
}

export function WhatsAppConsentForm({
  contactId,
  optInStatus,
  canManage,
  onUpdated,
}: WhatsAppConsentFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [source, setSource] = useState<WhatsAppConsentSource>('form')
  const [description, setDescription] = useState('')
  const [evidenceRef, setEvidenceRef] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleGrantConsent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      setError('Por favor, descreva a evidência de autorização do contato.')
      return
    }

    startTransition(async () => {
      setError(null)
      const res = await recordWhatsAppConsentAction({
        contactId,
        status: 'granted',
        source,
        proof: {
          description: description.trim(),
          evidenceRef: evidenceRef.trim() || undefined,
        },
        occurredAt: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      })

      if (res.ok) {
        setIsOpen(false)
        setDescription('')
        setEvidenceRef('')
        onUpdated()
      } else {
        setError(res.error)
      }
    })
  }

  const handleRevokeConsent = () => {
    if (!confirm('Tem certeza que deseja registrar a revogação de autorização deste contato? O envio de novas mensagens será bloqueado.')) {
      return
    }

    startTransition(async () => {
      setError(null)
      const res = await recordWhatsAppConsentAction({
        contactId,
        status: 'revoked',
        source: 'manual_evidence',
        proof: {
          description: 'Revogação de consentimento registrada manualmente pelo atendente.',
        },
        occurredAt: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      })

      if (res.ok) {
        setIsOpen(false)
        onUpdated()
      } else {
        setError(res.error)
      }
    })
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {optInStatus === 'granted' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              <ShieldCheck size={13} />
              Consentimento registrado (Opt-in ativo)
            </span>
          )}
          {optInStatus === 'revoked' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
              <ShieldX size={13} />
              Autorização revogada (Opt-out)
            </span>
          )}
          {optInStatus === 'unknown' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              <ShieldAlert size={13} />
              Consentimento não registrado
            </span>
          )}
        </div>

        {canManage && (
          <button
            type="button"
            className="text-xs font-semibold text-[#2E3E4F] dark:text-slate-300 hover:underline"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? 'Fechar' : 'Gerenciar autorização'}
          </button>
        )}
      </div>

      {optInStatus === 'unknown' && !isOpen && (
        <p className="mt-2 text-xs text-slate-500">
          Registro informativo do CRM. Respostas dentro da janela de 24h não dependem deste cadastro; fora dela, utilize um template aprovado pela Meta.
        </p>
      )}

      {optInStatus === 'revoked' && !isOpen && (
        <p className="mt-2 text-xs text-rose-600 font-medium">
          O contato solicitou a interrupção de mensagens. O envio ativo está permanentemente bloqueado.
        </p>
      )}

      {isOpen && canManage && (
        <div className="mt-3 border-t border-slate-200 pt-3">
          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-rose-50 p-2 text-xs text-rose-700">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {optInStatus !== 'granted' ? (
            <form onSubmit={handleGrantConsent} className="space-y-3">
              <p className="text-xs font-semibold text-slate-700">
                Registrar comprovação de consentimento (Opt-in)
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Origem do consentimento
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as WhatsAppConsentSource)}
                  className={`${inputClass} mt-1 w-full text-xs`}
                  disabled={isPending}
                >
                  <option value="form">Formulário no site / Landing Page</option>
                  <option value="written_request">Solicitação escrita (E-mail / Mensagem)</option>
                  <option value="verbal_record">Autorização verbal registrada</option>
                  <option value="manual_evidence">Outra evidência documental</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Descrição da evidência *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex.: Cliente preencheu formulário de contato concordando com comunicação via WhatsApp."
                  className={`${inputClass} mt-1 h-16 w-full text-xs`}
                  disabled={isPending}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600">
                  Referência / Link do registro (opcional)
                </label>
                <input
                  type="text"
                  value={evidenceRef}
                  onChange={(e) => setEvidenceRef(e.target.value)}
                  placeholder="Ex.: ID de lead no CRM, link do formulário, etc."
                  className={`${inputClass} mt-1 w-full text-xs`}
                  disabled={isPending}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  className={`${buttonClass} text-xs`}
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`${primaryClass} text-xs`}
                  disabled={isPending}
                >
                  <Check size={14} />
                  Salvar Opt-in
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Este contato possui opt-in registrado. Se o contato solicitar não receber mais mensagens, registre a revogação abaixo.
              </p>
              <button
                type="button"
                className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                onClick={handleRevokeConsent}
                disabled={isPending}
              >
                <ShieldX size={14} />
                Registrar revogação (Opt-out)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
