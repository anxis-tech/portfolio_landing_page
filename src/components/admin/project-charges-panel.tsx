'use client'

import { useEffect, useState } from 'react'
import { checkPaymentStatusAction, createPaymentLinkAction, getProjectChargesAction } from '@/lib/actions/payments'
import type { ProjectCharge } from '@/types/payment.types'
import type { Contract } from '@/types/contract.types'

const currency = (cents: number) => (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const statuses = { pending: 'Pendente', available: 'Disponível', awaiting_payment: 'Aguardando pagamento', paid: 'Pago', cancelled: 'Cancelado', error: 'Erro' }

export function ProjectChargesPanel({ projectId, contract, canCreate, canCheck }: { projectId: string; contract: Contract; canCreate: boolean; canCheck: boolean }) {
  const [charges, setCharges] = useState<ProjectCharge[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    void getProjectChargesAction(projectId).then((items) => { if (active) setCharges(items) }).catch(() => { if (active) setMessage('Não foi possível consultar as cobranças.') }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [projectId])
  const current = charges.filter((charge) => charge.contract_id === contract.id && charge.status !== 'cancelled')
  const received = current.reduce((sum,charge) => sum + (charge.paid_amount || 0), 0)
  const total = contract.contract_amount ?? Math.round(contract.final_value * 100)
  async function createLink(chargeId: string) {
    setBusy(chargeId)
    try {
      const result = await createPaymentLinkAction({ projectId, chargeId })
      setMessage(result.message || (result.success ? 'Cobrança gerada.' : 'Não foi possível gerar a cobrança.'))
      if (result.success) setCharges(await getProjectChargesAction(projectId))
    } catch { setMessage('Não foi possível gerar a cobrança.') } finally { setBusy(null) }
  }
  async function checkPayment(charge: ProjectCharge) {
    setBusy(charge.id)
    try {
      const result = await checkPaymentStatusAction(charge.order_nsu)
      setMessage(result.message || (result.success ? result.isPaid ? 'Pagamento confirmado.' : 'O pagamento continua pendente.' : 'Não foi possível consultar o pagamento.'))
      if (result.success) setCharges(await getProjectChargesAction(projectId))
    } catch { setMessage('Não foi possível consultar o pagamento.') } finally { setBusy(null) }
  }
  return <div className="space-y-4 text-xs">
    <h4 className="text-sm font-extrabold">Cobranças do projeto</h4>
    <dl className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700"><div><dt className="text-slate-500">Contrato</dt><dd className="font-bold">Versão {contract.version} · {currency(total)}</dd></div><div><dt className="text-slate-500">Condição</dt><dd className="font-bold">{contract.payment_condition === 'split_50_50' ? '50% entrada / 50% saldo' : 'À vista — 100%'}</dd></div><div><dt className="text-slate-500">Recebido</dt><dd className="font-bold text-emerald-700">{currency(received)}</dd></div><div><dt className="text-slate-500">Pendente</dt><dd className="font-bold">{currency(Math.max(0,total - received))}</dd></div></dl>
    {message && <p role="status">{message}</p>}
    {loading ? <p>Consultando cobranças...</p> : current.length === 0 ? <p className="text-slate-500">Nenhuma cobrança disponível.</p> : current.map((charge) => <div key={charge.id} className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
      <div className="flex justify-between gap-3"><strong>{charge.type === 'advance' ? 'Entrada — 50%' : charge.type === 'final' ? 'Saldo — 50%' : 'Pagamento integral — 100%'}</strong><span>{statuses[charge.status]}</span></div><p>{currency(charge.amount)}</p>
      {charge.status === 'pending' && <p className="text-slate-500">{charge.type === 'final' ? 'Disponível após a conclusão do projeto.' : 'Aguardando assinatura do contrato.'}</p>}
      {charge.status === 'error' && charge.error_message && <p className="text-rose-700 dark:text-rose-300">{charge.error_message}</p>}
      {charge.payment_url && charge.status === 'awaiting_payment' && <a target="_blank" rel="noreferrer" href={charge.payment_url} className="inline-block rounded-lg border border-slate-300 px-3 py-2 font-bold">Abrir cobrança</a>}
      {canCheck && ['awaiting_payment','paid'].includes(charge.status) && <button type="button" disabled={busy === charge.id} onClick={() => void checkPayment(charge)} className="ml-2 rounded-lg border border-slate-300 px-3 py-2 font-bold disabled:opacity-50">{busy === charge.id ? 'Consultando...' : 'Consultar pagamento'}</button>}
      {canCreate && ['available','error'].includes(charge.status) && <button type="button" disabled={busy === charge.id} onClick={() => void createLink(charge.id)} className="rounded-lg bg-[#2E3E4F] px-3 py-2 font-bold text-white disabled:opacity-50">{busy === charge.id ? 'Gerando...' : 'Gerar link'}</button>}
    </div>)}
  </div>
}
