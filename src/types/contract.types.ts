export type ContractStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type PaymentCondition = 'upfront' | 'split_50_50'
export type ContractSignatureStatus =
  | 'draft'
  | 'generated'
  | 'pending_signature'
  | 'client_signed'
  | 'completed'
  | 'rejected'
  | 'error'

export interface Contract {
  id: string
  project_id: string
  quote_id?: string | null
  status: ContractStatus
  client_data_snapshot: {
    client_name?: string
    company?: string
    email?: string
    phone?: string
    whatsapp?: string
    contact_name?: string
    contact_role?: string
  }
  project_data_snapshot: {
    title?: string
    project_type?: string
    platform?: string
    description?: string
    scope_objective?: string
    target_audience?: string
    start_date?: string
    deadline?: string
    responsible_name?: string
  }
  pricing_snapshot: {
    project_type?: string
    page_count?: number
    additional_page_count?: number
    content_option?: string
    urgency?: string
    base_value?: number
    discount_amount?: number
    additional_costs?: number
    tax_amount?: number
    final_value?: number
    notes?: string
  }
  final_value: number
  payment_condition: PaymentCondition
  /** Immutable total agreed in the contract, in integer cents. */
  contract_amount: number | null
  billing_managed: boolean
  voided_at?: string | null
  void_reason?: string | null
  storage_path?: string | null
  file_name?: string | null
  file_size?: number
  version: number
  generated_at?: string | null
  error_message?: string | null
  autentique_document_id?: string | null
  autentique_signer_id?: string | null
  autentique_signing_url?: string | null
  signature_status: ContractSignatureStatus
  signature_requested_at?: string | null
  client_signed_at?: string | null
  document_finished_at?: string | null
  signed_document_path?: string | null
  payment_unlocked_at?: string | null
  created_by?: string
  created_at: string
  updated_at: string
}

export interface ContractGenerationJob {
  id: string
  contract_id: string
  project_id: string
  status: ContractStatus
  attempts: number
  started_at?: string | null
  completed_at?: string | null
  last_error?: string | null
  created_at: string
  updated_at: string
}

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  pending: 'Pendente',
  processing: 'Processando',
  completed: 'Concluído',
  failed: 'Falhou',
}

export const CONTRACT_SIGNATURE_STATUS_LABELS: Record<ContractSignatureStatus, string> = {
  draft: 'Rascunho',
  generated: 'Aguardando envio',
  pending_signature: 'Aguardando assinatura',
  client_signed: 'Assinado',
  completed: 'Assinatura concluída',
  rejected: 'Assinatura recusada',
  error: 'Erro na assinatura',
}
