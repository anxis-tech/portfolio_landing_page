import type { PaymentCondition } from '@/types/contract.types'

/** The agreed quote/project value is the base. The split total gets the same 10% as the proposal, once. */
export function getContractBillingAmounts(baseValue: number, condition: PaymentCondition) {
  const baseAmount = Math.round(baseValue * 100)
  if (!Number.isSafeInteger(baseAmount) || baseAmount <= 0) {
    throw new Error('O contrato precisa de um valor aprovado positivo e válido.')
  }
  const totalAmount = condition === 'split_50_50' ? Math.round(baseAmount * 110 / 100) : baseAmount
  const advanceAmount = condition === 'split_50_50' ? Math.ceil(totalAmount / 2) : totalAmount
  return { baseAmount, totalAmount, advanceAmount, finalAmount: totalAmount - advanceAmount,
    surchargeRate: condition === 'split_50_50' ? 0.1 : 0 }
}
