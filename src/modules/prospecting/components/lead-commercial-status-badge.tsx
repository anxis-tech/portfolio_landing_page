import type { WhatsAppSummaryDTO } from '../types/whatsapp'

const statuses = {
  new: {
    label: 'Novo',
    color: 'border-slate-200 bg-slate-50 text-slate-600',
    detail: 'Nenhum envio confirmado ou resposta recebida pelo WhatsApp.',
  },
  contacted: {
    label: 'Contatado',
    color: 'border-sky-200 bg-sky-50 text-sky-700',
    detail: 'Envio confirmado pelo WhatsApp.',
  },
  replied: {
    label: 'Respondeu',
    color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    detail: 'Mensagem recebida do lead pelo WhatsApp.',
  },
} as const

export function LeadCommercialStatusBadge({ status }: { status?: WhatsAppSummaryDTO['commercialStatus'] }) {
  const display = status ? statuses[status] : null
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${display?.color ?? 'border-slate-200 bg-slate-50 text-slate-400'}`}
      title={display?.detail ?? 'Carregando status comercial…'}
      aria-label={`Status comercial: ${display?.label ?? 'carregando'}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {display?.label ?? '—'}
    </span>
  )
}
