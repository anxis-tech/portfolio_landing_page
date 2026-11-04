import type { ClientProject } from '@/types/client-project.types'
import type { Contract } from '@/types/contract.types'
import type { Payment } from '@/types/payment.types'

/** Present managed billing from the active immutable contract and verified payments. */
export function getFinanceProjectSummary(project: ClientProject, contracts: Contract[], payments: Payment[]) {
  const contract = contracts.filter((item) => item.project_id === project.id && !item.voided_at).sort((a,b) => b.version - a.version)[0]
  if (!contract?.billing_managed || contract.contract_amount == null) return { project, contract }
  const verified = payments.filter((item) => item.project_id === project.id && item.contract_id === contract.id && item.status === 'Pago')
  const paidCents = verified.reduce((sum,item) => sum + item.paid_amount, 0)
  const paidAt = verified.map((item) => item.paid_at).filter((date): date is string => Boolean(date)).sort().at(-1)
  return { contract, project: { ...project, approved_value: contract.contract_amount / 100, paid_value: paidCents / 100, paid_at: paidAt, payment_status: paidCents >= contract.contract_amount ? 'Pago' : 'Pendente' } }
}
