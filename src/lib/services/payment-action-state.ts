export type PaymentActionState = 'paid' | 'existing' | 'ready' | 'blocked'

export type PaymentActionStateInput = {
  paymentUnlockedAt: string | null | undefined
  paymentLink: string | null | undefined
  paymentStatus: string | null | undefined
}

const COMPLETED_PAYMENT_STATUSES = new Set(['pago', 'paid', 'completed', 'complete'])

export function isPaymentCompletedStatus(status: string | null | undefined) {
  return Boolean(status && COMPLETED_PAYMENT_STATUSES.has(status.trim().toLowerCase()))
}

export function getPaymentReceiptUrl(receiptUrl: string | null | undefined) {
  const normalizedReceiptUrl = receiptUrl?.trim()
  return normalizedReceiptUrl || null
}

export function getPaymentActionState({
  paymentUnlockedAt,
  paymentLink,
  paymentStatus,
}: PaymentActionStateInput): PaymentActionState {
  if (isPaymentCompletedStatus(paymentStatus)) return 'paid'
  if (paymentLink) return 'existing'
  return paymentUnlockedAt ? 'ready' : 'blocked'
}
