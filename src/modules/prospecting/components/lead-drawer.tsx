'use client'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { X, ExternalLink } from 'lucide-react'
import { leadDetailsAction, leadControlAction } from '../actions'
import {
  buttonClass,
  dateLabel,
  getWebsiteDisplayStatus,
  isTlsCertFailure,
  opportunityLabels,
  safeLink,
  ClassificationBadge,
} from './shared'
import { pipelineLabels, type PipelineStage } from '../types/index'
import type { WhatsAppSummaryDTO } from '../types/whatsapp'
import { LeadCommercialStatusBadge } from './lead-commercial-status-badge'
type DetailResult = Awaited<ReturnType<typeof leadDetailsAction>>
type Detail = Extract<DetailResult, { ok: true }>['data']
export function LeadDrawer({
  id,
  canManage,
  onClose,
  onChanged,
  onOpenWhatsApp,
  whatsAppAvailable = true,
  commercialStatus,
}: {
  id: string
  canManage: boolean
  onClose: () => void
  onChanged: () => void
  onOpenWhatsApp?: (id: string) => void
  whatsAppAvailable?: boolean
  commercialStatus?: WhatsAppSummaryDTO['commercialStatus']
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [error, setError] = useState('')
  const [busy, startTransition] = useTransition()
  const load = useCallback(async () => {
    const result = await leadDetailsAction(id)
    if (result.ok) {
      setDetail(result.data)
      setError('')
    } else setError(result.error)
  }, [id])
  useEffect(() => {
    dialog.current?.showModal()
    startTransition(load)
  }, [load])
  const mutate = (action: 'retry' | 'refresh' | 'discard' | 'restore') =>
    startTransition(async () => {
      const result = await leadControlAction({ id, action })
      if (!result.ok) setError(result.error)
      else {
        await load()
        onChanged()
      }
    })
  const lead = detail?.lead

  const siteCrawlFailed =
    lead?.digital?.crawlStatus === 'failed' ||
    lead?.digital?.contactExtractionStatus === 'unavailable' ||
    lead?.digital?.contactExtractionStatus === 'failed'

  const extractedWhatsapp = [
    ...(lead?.digital?.extractedContacts?.whatsapp ?? []),
    ...(lead?.digital?.whatsappNumber ? [lead.digital.whatsappNumber] : []),
  ].filter((v, idx, arr) => arr.indexOf(v) === idx)

  const extractedEmails = [
    ...(lead?.digital?.extractedContacts?.emails ?? []),
    ...(lead?.digital?.email ? [lead.digital.email] : []),
  ].filter((v, idx, arr) => arr.indexOf(v) === idx)

  const extractedPhones = (lead?.digital?.extractedContacts?.phones ?? []).filter(
    (v, idx, arr) => arr.indexOf(v) === idx
  )

  const extractedCtaLinks = lead?.digital?.extractedContacts?.ctaLinks ?? []

  const hasExtractedContacts =
    extractedWhatsapp.length > 0 ||
    extractedEmails.length > 0 ||
    extractedPhones.length > 0 ||
    extractedCtaLinks.length > 0
  return (
    <dialog
      ref={dialog}
      aria-labelledby="lead-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close()
      }}
      className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-dvh w-full max-w-3xl border-l border-slate-200 bg-white p-0 text-slate-800 shadow-2xl backdrop:bg-slate-950/40"
    >
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white p-5">
        <div>
          <p className="text-xs text-slate-500">Detalhe da oportunidade</p>
          <h2 id="lead-title" className="mt-1 text-xl font-bold">
            {lead?.name ?? 'Carregando lead…'}
          </h2>
        </div>
        <button
          aria-label="Fechar detalhe"
          onClick={() => dialog.current?.close()}
          className={buttonClass}
        >
          <X size={18} />
        </button>
      </div>
      <div className="space-y-6 p-5">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {lead && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <ClassificationBadge lead={lead} />
              {lead.manually_discarded && (
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                  Arquivado
                </span>
              )}
              <span className="text-sm font-medium text-slate-700">
                Site: {getWebsiteDisplayStatus(lead)}
              </span>
              {onOpenWhatsApp ? (
                <LeadCommercialStatusBadge status={commercialStatus} />
              ) : (
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs">
                  Comercial: {pipelineLabels[lead.pipeline_stage]}
                </span>
              )}
            </div>
            <section aria-label="Motivo da classificação">
              <h3 className="mb-3 font-semibold">
                Por que esse lead é {lead.classification === 'hot' ? 'quente' : 'frio'}?
              </h3>
              <ul className="grid gap-2 text-sm sm:grid-cols-3">
                {([
                  [!lead.has_website, lead.has_website ? 'Possui site' : 'Sem site'],
                  [lead.has_contact, lead.has_contact ? 'Contato encontrado' : 'Nenhum contato válido encontrado'],
                  [lead.has_social, lead.has_social ? 'Rede social encontrada' : 'Nenhuma rede social encontrada'],
                ] as const).map(([met, label]) => (
                  <li
                    key={label}
                    className={`rounded-lg border px-3 py-2 ${met ? 'border-[#233141]/20 bg-[#233141]/5 text-[#182331]' : 'border-slate-200 bg-slate-50 text-slate-600'}`}
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </section>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <Fact label="Categoria" value={lead.business.category} />
              <Fact label="Localização" value={`${lead.city ?? '—'} / ${lead.state ?? '—'}`} />
              <Fact
                label="Rating / avaliações"
                value={`${lead.rating ?? '—'} / ${lead.reviews ?? '—'}`}
              />
              <Fact label="Telefone" value={lead.phone} />
              <Fact label="E-mail" value={lead.email} />
              <Fact
                label="Oportunidade"
                value={lead.opportunity_type ? opportunityLabels[lead.opportunity_type] : null}
              />
            </dl>
            {safeLink(lead.website) && (
              <div className="space-y-1">
                <a
                  href={safeLink(lead.website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex max-w-full items-center gap-2 break-all text-sm text-[#2E3E4F] hover:underline"
                >
                  {lead.website}
                  <ExternalLink size={14} className="shrink-0" />
                </a>
                {lead.digital?.websiteKind &&
                  lead.digital.websiteKind !== 'website' &&
                  lead.digital.websiteKind !== 'none' && (
                    <p className="text-xs text-slate-500">
                      Presença detectada:{' '}
                      <strong className="text-slate-700">
                        {lead.digital.websiteKind === 'messaging_only'
                          ? 'Somente WhatsApp / Mensagem'
                          : lead.digital.websiteKind === 'social_only' ||
                              lead.digital.websiteKind === 'social'
                            ? 'Rede Social'
                            : lead.digital.websiteKind === 'link_aggregator'
                              ? 'Agregador de Links (Linktree/Bio)'
                              : 'Encurtador de Link'}
                      </strong>
                      {lead.digital.finalUrl && lead.digital.finalUrl !== lead.website && (
                        <span className="block truncate text-slate-400 mt-0.5">
                          Destino final: {lead.digital.finalUrl}
                        </span>
                      )}
                    </p>
                  )}
              </div>
            )}
            {(lead.audit_failure_code || lead.digital) && (
              <details className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs">
                <summary className="cursor-pointer font-semibold text-slate-800 hover:text-blue-600">
                  Detalhes técnicos da auditoria
                </summary>
                <div className="mt-3 space-y-2.5 border-t border-slate-200 pt-3 text-slate-600">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    <div>
                      <span className="text-slate-400">Status do site:</span>
                      <p className="font-medium text-slate-800">{getWebsiteDisplayStatus(lead)}</p>
                    </div>
                    {lead.audit_failure_code &&
                      !isTlsCertFailure(lead.audit_failure_code, lead.audit_failure_detail) && (
                      <div>
                        <span className="text-slate-400">Código da falha:</span>
                        <p className="font-mono text-[11px] text-slate-800">
                          {lead.audit_failure_code}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-slate-400">HTTP:</span>
                      <p className="font-mono text-[11px] text-slate-800">{lead.digital?.httpStatus ?? '—'}</p>
                    </div>
                    {lead.digital?.selectedAddress && (
                      <div>
                        <span className="text-slate-400">IP conectado:</span>
                        <p className="font-mono text-[11px] text-slate-800">
                          {lead.digital.selectedAddress} ({lead.digital.addressFamily ?? 'IP'})
                        </p>
                      </div>
                    )}
                    {lead.digital?.robotsStatus && (
                      <div>
                        <span className="text-slate-400">Robots.txt:</span>
                        <p className="font-medium text-slate-800">{lead.digital.robotsStatus}</p>
                      </div>
                    )}
                    {lead.digital?.crawlStatus && (
                      <div>
                        <span className="text-slate-400">Crawler:</span>
                        <p className="font-medium text-slate-800">{lead.digital.crawlStatus}</p>
                      </div>
                    )}
                  </div>

                  {lead.audit_failure_code &&
                    !isTlsCertFailure(lead.audit_failure_code, lead.audit_failure_detail) && (
                    <div className="rounded-md bg-white p-2.5 border border-slate-200">
                      <span className="text-slate-400">Motivo técnico:</span>
                      <p className="mt-0.5 text-slate-700 font-medium">
                        {lead.audit_failure_code === 'AUDIT_LEASE_EXPIRED'
                          ? 'Execução interrompida durante o processamento.'
                          : lead.audit_failure_code === 'AUDIT_INTERNAL_ERROR'
                            ? 'Falha interna durante a auditoria.'
                            : lead.audit_failure_code === 'AUDIT_CLIENT_ERROR'
                              ? 'Erro interno ao construir ou executar a requisição.'
                              : lead.audit_failure_detail ?? 'Falha externa de conexão.'}
                      </p>
                    </div>
                  )}

                  {lead.digital?.finalUrl && lead.digital.finalUrl !== lead.website && (
                    <div>
                      <span className="text-slate-400">URL final após redirecionamento:</span>
                      <p className="font-mono text-[11px] text-slate-800 break-all">{lead.digital.finalUrl}</p>
                    </div>
                  )}

                  {lead.digital?.redirectChain && lead.digital.redirectChain.length > 1 && (
                    <div>
                      <span className="text-slate-400">Cadeia de redirecionamento:</span>
                      <p className="font-mono text-[11px] text-slate-700 break-all">
                        {lead.digital.redirectChain.join(' → ')}
                      </p>
                    </div>
                  )}

                  {lead.digital?.attempts && lead.digital.attempts.length > 0 && (
                    <div>
                      <span className="text-slate-400">Tentativas por IP:</span>
                      <ul className="mt-1 space-y-1">
                        {lead.digital.attempts.map((att, i) => (
                          <li key={i} className="font-mono text-[11px] text-slate-700">
                            {att.address} ({att.family ?? 'IP'}) — {att.durationMs}ms
                            {att.error ? ` — ${att.error}` : ' (sucesso)'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(lead.digital?.crawlerDurationMs !== undefined ||
                    lead.digital?.auditTotalDurationMs !== undefined) && (
                    <div className="text-[11px] text-slate-500 pt-1">
                      Duração: Crawler {lead.digital?.crawlerDurationMs ?? '—'}ms · Total{' '}
                      {lead.digital?.auditTotalDurationMs ?? '—'}ms
                    </div>
                  )}
                </div>
              </details>
            )}
            {lead.website && (
              <section>
                <h3 className="mb-3 font-semibold">Contatos encontrados no site</h3>
                {siteCrawlFailed ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                    Não foi possível extrair contatos adicionais deste site.
                  </div>
                ) : !hasExtractedContacts ? (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
                    Nenhum contato adicional encontrado no site.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {extractedWhatsapp.length > 0 && (
                      <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                            WhatsApp
                          </span>
                          {onOpenWhatsApp && (
                            <button
                              type="button"
                              className={`text-xs font-semibold ${whatsAppAvailable ? 'text-emerald-700 hover:underline' : 'cursor-not-allowed text-slate-400'}`}
                              disabled={!whatsAppAvailable}
                              title={
                                whatsAppAvailable
                                  ? 'Abrir conversa no CRM'
                                  : 'Nenhum telefone disponível para contato pelo WhatsApp'
                              }
                              onClick={() => {
                                onClose()
                                onOpenWhatsApp(id)
                              }}
                            >
                              Abrir conversa no CRM
                            </button>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {extractedWhatsapp.map((num) => (
                            <a
                              key={num}
                              href={`https://wa.me/${num.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-mono font-medium text-emerald-700 hover:underline"
                            >
                              {num}
                              <ExternalLink size={12} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {extractedEmails.length > 0 && (
                      <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-blue-800">
                          E-mail
                        </span>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {extractedEmails.map((email) => (
                            <a
                              key={email}
                              href={`mailto:${email}`}
                              className="inline-flex items-center gap-1 font-medium text-blue-700 hover:underline"
                            >
                              {email}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {extractedPhones.length > 0 && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Telefone
                        </span>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {extractedPhones.map((phone) => (
                            <a
                              key={phone}
                              href={`tel:${phone.replace(/\D/g, '')}`}
                              className="inline-flex items-center gap-1 font-mono font-medium text-slate-700 hover:underline"
                            >
                              {phone}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {extractedCtaLinks.length > 0 && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                          Links de contato / CTA
                        </span>
                        <ul className="mt-1.5 space-y-1">
                          {extractedCtaLinks.map((link, idx) => (
                            <li key={idx} className="truncate">
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                              >
                                {link.text || link.href}
                                <ExternalLink size={11} className="shrink-0" />
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {lead.digital?.warnings?.filter((w) => !/pagespeed|lighthouse/i.test(w)).map((w) => (
                  <p key={w} className="mt-3 text-xs text-amber-700">
                    {w}
                  </p>
                ))}
              </section>
            )}
            {detail?.analysis && (
              <section className="rounded-xl border border-purple-200 bg-purple-50/40 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-semibold">Abordagem comercial</h3>
                  <span className="text-xs text-purple-700">Gerado por IA</span>
                </div>
                <dl className="space-y-3 text-sm">
                  {[
                    ['Potencial comercial', detail.analysis.analysis.commercialPotential],
                    ['Problema principal', detail.analysis.analysis.mainProblem],
                    ['Solução recomendada', detail.analysis.analysis.recommendedSolution],
                    ['Argumento comercial', detail.analysis.analysis.salesAngle],
                    ['Resumo', detail.analysis.analysis.summary],
                  ].map(([label, value]) => (
                    <Fact key={label} label={label} value={value} />
                  ))}
                </dl>
                <p className="mt-3 text-xs text-slate-500">
                  Confiança: {Math.round(detail.analysis.analysis.confidence * 100)}% ·{' '}
                  {detail.analysis.model} · {dateLabel(detail.analysis.created_at)}
                </p>
              </section>
            )}
            {detail?.jobs
              .filter((j) => j.error_message)
              .map((job) => (
                <section
                  key={job.id}
                  className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm"
                >
                  <h3 className="font-semibold">
                    Não foi possível concluir{' '}
                    {job.type === 'audit_website' ? 'a auditoria deste site' : 'esta etapa'}.
                  </h3>
                  <p className="mt-2">
                    Tentativa: {job.attempts} de {job.max_attempts}
                  </p>
                  <p className="mt-1">{job.error_message}</p>
                  <p className="mt-2 text-xs">
                    {job.status === 'failed'
                      ? 'Tentativas automáticas esgotadas.'
                      : `Nova tentativa automática a partir de ${dateLabel(job.run_after)}.`}
                  </p>
                  {job.status === 'failed' && canManage && (
                    <button
                      disabled={busy}
                      className={`${buttonClass} mt-3`}
                      onClick={() => mutate('retry')}
                    >
                      Tentar novamente
                    </button>
                  )}
                </section>
              ))}
            <details>
              <summary className="cursor-pointer text-sm font-semibold">
                Histórico comercial
              </summary>
              <ul className="mt-2 space-y-2 text-sm">
                {detail?.events.map((event) => (
                  <li key={event.id}>
                    {dateLabel(event.created_at)} ·{' '}
                    {pipelineLabels[event.from_stage as PipelineStage]} →{' '}
                    {pipelineLabels[event.to_stage as PipelineStage]}
                  </li>
                ))}
              </ul>
            </details>
            {canManage && (
              <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                <button disabled={busy} className={buttonClass} onClick={() => mutate('refresh')}>
                  Atualizar dados
                </button>
                <button
                  disabled={busy}
                  className={buttonClass}
                  onClick={() => mutate(lead.manually_discarded ? 'restore' : 'discard')}
                >
                  {lead.manually_discarded ? 'Restaurar lead' : 'Descartar lead'}
                </button>
              </div>
            )}
            <p className="text-xs text-slate-400">
              Dados de estabelecimentos: Google Maps.
              {lead.business.attributions?.map((a) => (
                <span key={a.provider}> {a.provider}</span>
              ))}
            </p>
          </>
        )}
      </div>
    </dialog>
  )
}
function Fact({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 break-words">{value || 'Não verificado'}</dd>
    </div>
  )
}
