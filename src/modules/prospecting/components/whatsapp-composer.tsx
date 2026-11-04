'use client'

import { useState, useRef, useTransition } from 'react'
import { Send, RefreshCw, AlertCircle, FileText, MessageSquare } from 'lucide-react'
import {
  WhatsAppOptInStatus,
  WhatsAppTemplateDTO,
  WhatsAppMessageType,
} from '../types/whatsapp'
import { canSendText, canSendTemplate } from '../services/whatsapp-policy'
import { primaryClass, inputClass } from './shared'

interface WhatsAppComposerProps {
  isWindowOpen: boolean
  optInStatus: WhatsAppOptInStatus
  templates: WhatsAppTemplateDTO[]
  canManage: boolean
  isConversationClosed: boolean
  accountEnabled?: boolean
  onSendMessage: (params: {
    type: WhatsAppMessageType
    body?: string | null
    templateId?: string | null
    parameters?: Record<string, unknown> | null
  }) => Promise<{ ok: boolean; error?: string }>
  onSyncTemplates?: () => Promise<{ ok: boolean; error?: string }>
}

export function WhatsAppComposer({
  isWindowOpen,
  optInStatus,
  templates,
  canManage,
  isConversationClosed,
  accountEnabled = true,
  onSendMessage,
  onSyncTemplates,
}: WhatsAppComposerProps) {
  const textAllowed = canSendText(optInStatus, isWindowOpen)
  const templateAllowed = canSendTemplate(optInStatus, isWindowOpen)

  // Inside the customer window the operator may choose text or an approved template.
  const [grantedMode, setGrantedMode] = useState<'text' | 'template'>('text')

  const mode: 'text' | 'template' =
    textAllowed && templateAllowed
      ? grantedMode
      : templateAllowed
        ? 'template'
        : 'text'

  const [textBody, setTextBody] = useState('')
  const availableTemplates = templates.filter((template) => template.name !== 'hello_world')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [templateParams, setTemplateParams] = useState<Record<string, string>>({})
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncNotice, setSyncNotice] = useState<string | null>(null)
  const [isSyncing, startSyncTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Catalogs load asynchronously and may replace a selection after a sync.
  const selectedTemplate = availableTemplates.find((t) => t.id === selectedTemplateId) || availableTemplates[0]
  const isFirstContact = selectedTemplate?.name === 'primeiro_contato_anxis'

  // Extract variables (e.g. {{1}}, {{2}}) from template body
  const bodyComponent = selectedTemplate?.components.find((c) => c.type === 'BODY')
  const bodyText = bodyComponent?.text || ''
  const variableMatches = Array.from(bodyText.matchAll(/\{\{(\d+)\}\}/g)).map((m) => m[1])
  const uniqueVarIndices = Array.from(new Set(variableMatches))

  const handleTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSend = async () => {
    if (isSending) return
    setError(null)

    if (mode === 'text') {
      if (!textAllowed) {
        setError('Envio de texto livre não permitido para as condições atuais.')
        return
      }
      if (!textBody.trim()) return

      setIsSending(true)
      const res = await onSendMessage({
        type: 'text',
        body: textBody.trim(),
      })
      setIsSending(false)

      if (res.ok) {
        setTextBody('')
      } else {
        setError(res.error || 'Falha ao enviar mensagem.')
      }
    } else if (mode === 'template') {
      if (!templateAllowed) {
        setError('Envio de template não permitido para este contato.')
        return
      }
      if (!selectedTemplate) {
        setError('Selecione um template válido.')
        return
      }
      if (!selectedTemplate.supported) {
        setError('Este template aguarda atualização e sincronização da integração. Ainda não está disponível para envio.')
        return
      }

      // Validate that all required template variables are filled
      for (const idx of isFirstContact ? [] : uniqueVarIndices) {
        if (!templateParams[idx]?.trim()) {
          setError(`Preencha o parâmetro {{${idx}}} do template.`)
          return
        }
      }

      setIsSending(true)
      const res = await onSendMessage({
        type: 'template',
        templateId: selectedTemplate.id,
        body: isFirstContact ? undefined : getTemplatePreview(),
        parameters: isFirstContact ? undefined : {
          components: [
            {
              type: 'body',
              parameters: uniqueVarIndices.map((idx) => ({
                type: 'text',
                text: templateParams[idx],
              })),
            },
          ],
        },
      })
      setIsSending(false)

      if (res.ok) {
        setTemplateParams({})
      } else {
        setError(res.error || 'Falha ao enviar template.')
      }
    }
  }

  const getTemplatePreview = (): string => {
    if (!bodyText) return ''
    let preview = bodyText
    for (const idx of uniqueVarIndices) {
      const val = isFirstContact ? '[seu primeiro nome]' : templateParams[idx] || `{{${idx}}}`
      preview = preview.replace(new RegExp(`\\{\\{${idx}\\}\\}`, 'g'), val)
    }
    return preview
  }

  const handleSyncTemplates = () => {
    if (!onSyncTemplates) return
    startSyncTransition(async () => {
      setError(null)
      setSyncNotice(null)
      const res = await onSyncTemplates()
      if (!res.ok) {
        setError(res.error || 'Falha ao sincronizar templates.')
      } else {
        setSyncNotice('Sincronização solicitada. Se o catálogo ainda não mudou, reabra a conversa após o processamento.')
      }
    })
  }

  if (isConversationClosed) {
    return (
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111622] p-4 text-center text-sm text-slate-500 dark:text-slate-400">
        Esta conversa está encerrada. Para enviar novas mensagens, reabra-a através do menu de ações.
      </div>
    )
  }

  if (accountEnabled === false) {
    return (
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#111622] p-4 text-center text-sm text-slate-500 dark:text-slate-400">
        A conta de WhatsApp está desabilitada para envio de mensagens.
      </div>
    )
  }

  if (optInStatus === 'revoked') {
    return (
      <div className="border-t border-slate-200 dark:border-slate-800 bg-rose-50 dark:bg-rose-950/40 p-4 text-center text-sm text-rose-700 dark:text-rose-300 font-medium">
        Envio bloqueado: o contato solicitou a revogação de comunicação (Opt-out).
      </div>
    )
  }

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111622] p-3 space-y-2">
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 p-2 text-xs text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {syncNotice && <p className="text-xs text-slate-500 dark:text-slate-400" role="status">{syncNotice}</p>}

      {/* Mode toggle when both text and templates are allowed inside the 24h window */}
      {textAllowed && templateAllowed && (
        <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
            <button
              type="button"
              className={`flex items-center gap-1 rounded-md px-2 py-1 font-medium ${
                mode === 'text' ? 'bg-white dark:bg-[#161B26] text-slate-800 dark:text-slate-100 shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              onClick={() => setGrantedMode('text')}
            >
              <MessageSquare size={13} />
              Texto livre
            </button>
            <button
              type="button"
              className={`flex items-center gap-1 rounded-md px-2 py-1 font-medium ${
                mode === 'template' ? 'bg-white dark:bg-[#161B26] text-slate-800 dark:text-slate-100 shadow-2xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              onClick={() => setGrantedMode('template')}
            >
              <FileText size={13} />
              Template aprovado
            </button>
          </div>
        </div>
      )}

      {/* Free Text Mode */}
      {mode === 'text' && textAllowed && (
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={textBody}
            onChange={(e) => setTextBody(e.target.value)}
            onKeyDown={handleTextKeyDown}
            placeholder="Digite uma mensagem... (Enter para enviar, Shift+Enter para quebra)"
            maxLength={4096}
            rows={2}
            className={`${inputClass} flex-1 resize-none py-2 text-sm`}
            disabled={isSending || !canManage}
          />
          <button
            type="button"
            className={`${primaryClass} h-10 w-10 p-0 shrink-0`}
            onClick={handleSend}
            disabled={!textBody.trim() || isSending || !canManage}
            title="Enviar mensagem"
          >
            <Send size={16} />
          </button>
        </div>
      )}

      {/* Template Mode (Mandatory when window is closed, or chosen when granted) */}
      {mode === 'template' && templateAllowed && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Template Meta homologado {!isWindowOpen && '(Obrigatório fora da janela de 24h)'}
            </label>

            {canManage && (
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-[#2E3E4F] dark:text-slate-300 hover:underline"
                onClick={handleSyncTemplates}
                disabled={isSyncing}
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                Sincronizar templates
              </button>
            )}
          </div>

          {availableTemplates.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-4 text-center text-xs text-slate-500 dark:text-slate-400">
              Nenhum template aprovado disponível nesta conta. Sincronize com a Meta ou crie templates no WhatsApp Business Manager.
            </div>
          ) : (
            <>
              <select
                value={selectedTemplate?.id || ''}
                onChange={(e) => {
                  setSelectedTemplateId(e.target.value)
                  setTemplateParams({})
                }}
                className={`${inputClass} w-full text-xs`}
                disabled={isSending || !canManage}
              >
                {availableTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.language}) - {t.category}{!t.supported && ' — Aguardando sincronização'}
                  </option>
                ))}
              </select>

              {/* Template variables inputs */}
              {isFirstContact && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  O nome do consultor será preenchido automaticamente com seu nome de perfil.
                </p>
              )}
              {selectedTemplate && !selectedTemplate.supported && (
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Template aprovado pela Meta. A integração precisa ser atualizada e sincronizada para habilitar o envio.
                </p>
              )}
              {!isFirstContact && uniqueVarIndices.length > 0 && (
                <div className="space-y-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 p-2.5">
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Variáveis do template:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {uniqueVarIndices.map((idx) => (
                      <div key={idx}>
                        <label className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          Variável {'{{'}{idx}{'}}'}
                        </label>
                        <input
                          type="text"
                          value={templateParams[idx] || ''}
                          onChange={(e) =>
                            setTemplateParams((prev) => ({
                              ...prev,
                              [idx]: e.target.value,
                            }))
                          }
                          placeholder={`Valor para {{${idx}}}`}
                          className={`${inputClass} mt-0.5 h-8 w-full text-xs`}
                          disabled={isSending || !canManage}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Template preview */}
              {bodyText && (
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-2.5 text-xs text-slate-700 dark:text-slate-300">
                  <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400">
                    Pré-visualização da mensagem
                  </p>
                  <p className="whitespace-pre-wrap">{getTemplatePreview()}</p>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  className={`${primaryClass} text-xs`}
                  onClick={handleSend}
                  disabled={isSending || !selectedTemplate?.supported || !canManage}
                >
                  <Send size={14} />
                  Enviar template
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
