import { getPaymentActionState } from '@/lib/services/payment-action-state'
import type { Contract, ContractSignatureStatus } from '@/types/contract.types'

export type ContractActionAvailabilityInput = {
  voidedAt?: string | null
  signatureStatus: ContractSignatureStatus
  signingUrl: string | null | undefined
  paymentUnlockedAt: string | null | undefined
  paymentLink: string | null | undefined
  paymentStatus: string | null | undefined
}

export function getContractActionAvailability({
  voidedAt,
  signatureStatus,
  signingUrl,
  paymentUnlockedAt,
  paymentLink,
  paymentStatus,
}: ContractActionAvailabilityInput) {
  return {
    canAccessSignatureLink: !voidedAt && signatureStatus === 'pending_signature' && Boolean(signingUrl),
    paymentAction: voidedAt ? 'blocked' : getPaymentActionState({ paymentUnlockedAt, paymentLink, paymentStatus }),
  } as const
}

export function mergeContractUpdate(
  contracts: Record<string, Contract>,
  updatedContract: Contract
): Record<string, Contract> {
  const currentContract = contracts[updatedContract.project_id]

  if (
    currentContract &&
    currentContract.id !== updatedContract.id &&
    currentContract.version > updatedContract.version
  ) {
    return contracts
  }

  return {
    ...contracts,
    [updatedContract.project_id]: updatedContract,
  }
}
