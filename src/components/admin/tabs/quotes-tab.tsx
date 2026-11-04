'use client'

import { notify } from '@/components/admin/ui/notifications'

import { useEffect, useMemo, useState } from 'react'
import { SavedQuote } from '@/types/pricing.types'

import { formatDateBR } from '@/components/admin/tabs/kanban-board-tab'
import { STRICT_PROJECT_TYPES, QUOTE_STATUSES } from '@/lib/validations/quote-schema'
import { deleteQuoteAction } from '@/lib/actions/quotes'
import { getQuoteProposalStatesAction } from '@/lib/actions/proposals'
import type { ProposalAdminState, ProposalStatus, ProposalVersionStatus } from '@/types/proposal.types'
import { Icon } from '@/components/ui/icon'

import {
  AddActionIcon,
  EditActionIcon,
  DeleteActionIcon,
  ViewActionIcon,
  SearchActionIcon,
  CancelActionIcon,
} from '@/lib/icons/actions'
import { MetricQuoteIcon } from '@/lib/icons/dashboard'
import { cn } from '@/lib/utils'

interface QuotesTabProps {
  quotes: SavedQuote[]
  onUpdateQuotes: (quotes: SavedQuote[]) => void
  onEditQuoteInCalculator: (quote: SavedQuote) => void
  onConvertToProject: (quote: SavedQuote) => void
  onOpenCreateQuote: () => void
  isDarkMode?: boolean
}

export function QuotesTab({
  quotes = [],
  onUpdateQuotes,
  onEditQuoteInCalculator,
  onConvertToProject,
  onOpenCreateQuote,
  isDarkMode = false,
}: QuotesTabProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [typeFilter, setTypeFilter] = useState('todos')
  const [selectedQuoteDetail, setSelectedQuoteDetail] = useState<SavedQuote | null>(null)
  const [proposalStates, setProposalStates] = useState<ProposalAdminState[]>([])

  useEffect(() => {
    let active = true
    void getQuoteProposalStatesAction().then((states) => {
      if (active) setProposalStates(states)
    })
    return () => { active = false }
  }, [quotes])

  const proposalsByQuote = useMemo(
    () => new Map(proposalStates.map((state) => [state.quoteId, state])),
    [proposalStates]
  )

  // Filter quotes from Supabase DB
  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.company && q.company.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'todos' || q.status === statusFilter
    const matchesType = typeFilter === 'todos' || q.project_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Delete quote handler
  const handleDeleteQuote = async (quoteId: string, projectName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o orçamento do projeto "${projectName}"?`)) return

    const result = await deleteQuoteAction(quoteId)
    if (!result.success) {
      notify.error(result.message || 'Não foi possível excluir o orçamento.')
      return
    }
    onUpdateQuotes(quotes.filter((q) => q.id !== quoteId))

    if (selectedQuoteDetail?.id === quoteId) {
      setSelectedQuoteDetail(null)
    }

    notify.success('Orçamento excluído com sucesso.')
  }

  // Status badge styling
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40'
      case 'Convertido em Projeto':
        return 'bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40'
      case 'Recusado':
        return 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    }
  }

  const proposalLabel = (status: ProposalStatus) => ({
    sent: 'Enviada',
    viewed: 'Visualizada',
    accepted: 'Aceita',
    expired: 'Expirada',
  })[status]

  const proposalStyle = (status: ProposalStatus) => ({
    sent: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    viewed: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800',
    accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    expired: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  })[status]

  const versionStatusLabel = (status: ProposalVersionStatus) => ({
    sent: 'Enviada',
    viewed: 'Visualizada',
    accepted: 'Aceita',
    expired: 'Expirada',
    superseded: 'Substituída',
  })[status]

  return (
    <div className={cn('space-y-5 max-w-full font-sans transition-colors', isDarkMode ? 'text-white' : 'text-[#0C1D36]')}>
      {/* HEADER */}
      <div className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b', isDarkMode ? 'border-slate-800' : 'border-slate-200/80')}>
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className={cn('text-lg font-bold tracking-tight', isDarkMode ? 'text-white' : 'text-[#0C1D36]')}>
              Histórico de Orçamentos
            </h2>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600')}>
              {filteredQuotes.length} {filteredQuotes.length === 1 ? 'proposta' : 'propostas'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Propostas comerciais geradas e registradas no sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateQuote}
          className="inline-flex items-center justify-center px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-[#2E3E4F] hover:bg-[#182331] shadow-xs transition-colors shrink-0 gap-1.5 cursor-pointer"
        >
          <Icon icon={AddActionIcon} size={15} />
          <span>Novo Orçamento</span>
        </button>
      </div>

      {/* FILTERS & SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon icon={SearchActionIcon} size={15} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar cliente ou projeto..."
            className={cn(
              'w-full h-9 pl-9 pr-3 rounded-lg text-xs outline-none transition-colors border',
              isDarkMode
                ? 'bg-[#111622] border-slate-800 text-slate-100 placeholder:text-slate-500 focus:border-slate-600'
                : 'bg-white border-slate-200 text-[#0C1D36] placeholder:text-slate-400 focus:border-[#2E3E4F]'
            )}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={cn(
              'h-9 px-3 rounded-lg border text-xs outline-none transition-colors cursor-pointer',
              isDarkMode
                ? 'bg-[#111622] border-slate-800 text-slate-200 focus:border-slate-600'
                : 'bg-white border-slate-200 text-slate-700 focus:border-[#2E3E4F]'
            )}
          >
            <option value="todos">Todos os Status</option>
            {QUOTE_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={cn(
              'h-9 px-3 rounded-lg border text-xs outline-none transition-colors cursor-pointer',
              isDarkMode
                ? 'bg-[#111622] border-slate-800 text-slate-200 focus:border-slate-600'
                : 'bg-white border-slate-200 text-slate-700 focus:border-[#2E3E4F]'
            )}
          >
            <option value="todos">Todos os Tipos</option>
            {STRICT_PROJECT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* QUOTES LIST */}
      {filteredQuotes.length === 0 ? (
        <div className={cn('text-center py-12 rounded-xl border border-dashed space-y-2', isDarkMode ? 'bg-[#111622] border-slate-800' : 'bg-slate-50 border-slate-200')}>
          <Icon icon={MetricQuoteIcon} size={32} className="text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-400">Nenhum orçamento encontrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto min-w-full">
          <table className="w-full text-left text-xs border-collapse min-w-[750px]">
            <thead>
              <tr className={cn('border-b font-medium uppercase tracking-wider text-[11px]', isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200/80 text-slate-400')}>
                <th className="py-2.5 px-3 whitespace-nowrap">Projeto & Cliente</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Tipo</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Valor Final</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Proposta</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Data</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody className={cn('divide-y', isDarkMode ? 'divide-slate-800/60' : 'divide-slate-100')}>
              {filteredQuotes.map((quote) => {
                const proposal = proposalsByQuote.get(quote.id)
                return (
                <tr key={quote.id} className={cn('transition-colors group', isDarkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/80')}>
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => setSelectedQuoteDetail(quote)}
                      className={cn('font-semibold text-xs truncate text-left block hover:text-[#2E3E4F] transition-colors cursor-pointer', isDarkMode ? 'text-slate-100 hover:text-sky-400' : 'text-[#0C1D36]')}
                    >
                      {quote.project_name}
                    </button>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                      {quote.client_name} {quote.company ? `(${quote.company})` : ''}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{quote.project_type}</td>
                  <td className="py-3 px-3 font-semibold font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {quote.final_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border', getStatusBadgeStyle(quote.status))}>
                      {quote.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {proposal ? <div><span className={cn('inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold', proposalStyle(proposal.status))}>{proposalLabel(proposal.status)} · v{proposal.version}</span>{proposal.viewCount > 0 && <p className="mt-1 text-[10px] text-slate-400">{proposal.viewCount} {proposal.viewCount === 1 ? 'visualização' : 'visualizações'}</p>}</div> : <span className="text-[11px] text-slate-400">Rascunho</span>}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400 dark:text-slate-500 text-xs whitespace-nowrap">
                    {formatDateBR(quote.created_at)}
                  </td>
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setSelectedQuoteDetail(quote)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#2E3E4F] hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title="Ver Detalhes do Orçamento"
                      >
                        <Icon icon={ViewActionIcon} size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditQuoteInCalculator(quote)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Editar no Calculador"
                      >
                        <Icon icon={EditActionIcon} size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuote(quote.id, quote.project_name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Excluir Orçamento"
                      >
                        <Icon icon={DeleteActionIcon} size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedQuoteDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={cn(
              'w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto border',
              isDarkMode ? 'bg-[#16181D] text-white border-slate-800' : 'bg-white text-[#0C1D36] border-slate-200'
            )}
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-700">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2E3E4F] dark:text-sky-400">
                  Orçamento #{selectedQuoteDetail.id}
                </span>
                <h3 className="text-lg font-extrabold">{selectedQuoteDetail.project_name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuoteDetail(null)}
                className="p-1.5 rounded-full hover:bg-slate-700 text-slate-400"
              >
                <Icon icon={CancelActionIcon} size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#1A1E26] border border-slate-800">
                <div>
                  <span className="text-slate-400 block">Cliente:</span>
                  <span className="font-bold">{selectedQuoteDetail.client_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Empresa:</span>
                  <span className="font-bold">{selectedQuoteDetail.company || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tipo:</span>
                  <span className="font-bold text-[#2E3E4F] dark:text-sky-400">{selectedQuoteDetail.project_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Status:</span>
                  <span className="font-bold text-emerald-400">{selectedQuoteDetail.status}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between font-mono">
                <span className="font-bold">Valor Final Calculado:</span>
                <span className="text-base font-black">
                  {selectedQuoteDetail.final_value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              {proposalsByQuote.get(selectedQuoteDetail.id) && (() => {
                const proposal = proposalsByQuote.get(selectedQuoteDetail.id)!
                return (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold">Proposta comercial</span>
                      <span className={cn('rounded border px-2 py-0.5 text-[11px] font-semibold', proposalStyle(proposal.status))}>{proposalLabel(proposal.status)} · v{proposal.version}</span>
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">{proposal.viewCount} {proposal.viewCount === 1 ? 'visualização registrada' : 'visualizações registradas'}{proposal.acceptedName ? ` · aceite por ${proposal.acceptedName}` : ''}</p>
                    {proposal.firstViewedAt && <p className="mt-1 text-[10px] text-slate-400">Primeira: {formatDateBR(proposal.firstViewedAt)} · Última: {formatDateBR(proposal.lastViewedAt || proposal.firstViewedAt)}</p>}
                    {proposal.history && proposal.history.length > 1 && (
                      <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Histórico de versões</p>
                        <ul className="mt-2 space-y-1.5">
                          {proposal.history.map((version) => (
                            <li key={version.version} className="flex items-center justify-between text-[11px]">
                              <span>v{version.version} · {versionStatusLabel(version.status)}{version.superseded && version.status === 'accepted' ? ' (substituída)' : ''}</span>
                              <span className="text-slate-400">{formatDateBR(version.acceptedAt || version.createdAt)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <a href={`/proposta/${proposal.publicToken}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-lg bg-[#2E3E4F] px-3 py-2 text-[11px] font-extrabold text-white">Abrir proposta</a>
                  </div>
                )
              })()}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-700">
              <button
                type="button"
                onClick={() => onConvertToProject(selectedQuoteDetail)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2E3E4F] hover:bg-[#182331] shadow-md transition-colors"
              >
                Gerar Projeto / Contrato
              </button>
              <button
                type="button"
                onClick={() => setSelectedQuoteDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-700 text-slate-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
