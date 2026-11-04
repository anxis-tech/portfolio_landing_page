'use client'

import { useId } from 'react'

import type { PaymentCondition } from '@/types/contract.types'
import { getContractBillingAmounts } from '@/lib/services/contract-billing'

export function PaymentConditionField({ value, finalValue, onChange, disabled = false }: {
  value: PaymentCondition | ''
  finalValue: number
  onChange: (value: PaymentCondition | '') => void
  disabled?: boolean
}) {
  const id = useId()
  const { baseAmount, totalAmount, advanceAmount, finalAmount } = Number.isFinite(finalValue) && finalValue > 0
    ? getContractBillingAmounts(finalValue, value || 'upfront')
    : { baseAmount: 0, totalAmount: 0, advanceAmount: 0, finalAmount: 0 }
  const currency = (amount: number) => (amount / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return <div className="space-y-2 rounded-xl border border-slate-200 p-4 text-xs dark:border-slate-700">
    <label htmlFor={id} className="block font-bold text-slate-600 dark:text-slate-300">Condição de pagamento do contrato *</label>
    <select id={id} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value as PaymentCondition | '')} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
      <option value="">Selecione antes de gerar o contrato</option>
      <option value="upfront">À vista — 100%</option>
      <option value="split_50_50">50% de entrada e 50% de saldo (+10%)</option>
    </select>
    {value === 'upfront' && <p className="font-semibold">Pagamento integral: {currency(totalAmount)}</p>}
    {value === 'split_50_50' && <><p className="font-semibold">Entrada: {currency(advanceAmount)} · Saldo: {currency(finalAmount)}</p><p className="font-semibold">Total contratado: {currency(totalAmount)} · Acréscimo de 10% aplicado uma vez.</p></>}
    <p className="text-[11px] text-slate-500">Valor aprovado antes da condição: {currency(baseAmount)}.</p>
    {disabled && <p className="text-[11px] text-amber-700 dark:text-amber-300">Condição bloqueada após o envio do contrato para assinatura.</p>}
  </div>
}
