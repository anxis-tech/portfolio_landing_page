export type PaymentSignatureEligibilityInput = {
  status: string
  paymentUnlockedAt: string | null
}

export type PaymentSignatureEligibility =
  | { eligible: true }
  | { eligible: false; message: string }

export function getPaymentSignatureEligibility(
  contract: PaymentSignatureEligibilityInput
): PaymentSignatureEligibility {
  if (!contract.paymentUnlockedAt) {
    return {
      eligible: false,
      message: 'Não é possível gerar o link de pagamento antes da confirmação da assinatura do cliente.',
    }
  }

  return { eligible: true }
}
