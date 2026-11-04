/**
 * WhatsApp CRM Error codes, user-facing PT-BR messages and sanitized logger (§14).
 */

export const WHATSAPP_ERROR_MESSAGES: Record<string, string> = {
  // Authorization & Permissions
  UNAUTHORIZED: 'Você não tem permissão para acessar o módulo de WhatsApp.',
  MANAGE_PERMISSION_REQUIRED: 'Permissão de gestão necessária para realizar esta ação.',
  SENDER_INACTIVE: 'Usuário remetente inativo ou sem permissão de envio.',
  INVALID_ASSIGNEE: 'Usuário atribuído inválido ou inativo.',

  // Account & Configuration
  ACCOUNT_DISABLED: 'A conta do WhatsApp está desabilitada nas configurações.',
  NO_ENABLED_ACCOUNT: 'Nenhuma conta oficial do WhatsApp configurada ou habilitada.',
  UNCONFIGURED_ACCOUNT: 'WhatsApp ainda não configurado no sistema.',

  // Conversation & Links
  CONVERSATION_NOT_FOUND: 'Conversa não encontrada.',
  CONVERSATION_CLOSED: 'Esta conversa está encerrada. Reabra-a antes de enviar uma mensagem.',
  CONVERSATION_UNLINKED: 'A conversa precisa estar vinculada a um lead antes de iniciar envios.',
  LINK_CONFLICT: 'Esta conversa já está vinculada a outro lead da campanha.',
  DISPATCH_IN_PROGRESS: 'Não é possível desvincular enquanto houver mensagem em envio.',

  // Consent & 24-hour Window
  OPT_IN_REVOKED: 'O contato revogou a autorização para receber mensagens (opt-out).',
  WINDOW_CLOSED_UNKNOWN_OPT_IN: 'Janela de 24h fechada. Registre autorização de contato ou aguarde mensagem do cliente.',
  WINDOW_CLOSED_TEMPLATE_REQUIRED: 'Janela de 24h fechada. Apenas mensagens de template homologado podem ser enviadas.',
  TEMPLATE_PROACTIVE_BLOCKED_FOR_UNKNOWN: 'Envio proativo de template bloqueado para contato com autorização desconhecida.',
  INVALID_CONSENT_SOURCE: 'Origem de consentimento inválida. Números de Google Places não equivalem a opt-in.',
  FUTURE_CONSENT_DATE: 'A data do consentimento não pode estar no futuro.',

  // Validation & Idempotency
  IDEMPOTENCY_CONFLICT: 'Conflito de envio: requisição duplicada com parâmetros diferentes.',
  INVALID_PHONE: 'Número de telefone inválido. Formato E.164 exigido (+55...).',
  INVALID_BODY: 'O corpo da mensagem deve ter entre 1 e 4096 caracteres.',
  INVALID_TIMESTAMP: 'Timestamp da mensagem inválido ou adiantado no futuro.',
  UNSUPPORTED_IDENTITY: 'Não foi possível identificar o número de telefone do remetente.',

  // Templates
  TEMPLATE_NOT_FOUND: 'Template selecionado não encontrado.',
  TEMPLATE_NOT_SUPPORTED: 'Este template possui componentes ainda não suportados para envio.',
  TEMPLATE_SYNC_UNAVAILABLE: 'Sincronização de templates indisponível no momento.',
  FIRST_CONTACT_ALREADY_STARTED: 'O primeiro contato já foi enviado para este contato. Continue pela conversa existente.',
  FIRST_CONTACT_PHONE_NOT_FOUND: 'Selecione um telefone cadastrado para este lead.',
  FIRST_CONTACT_NAME_REQUIRED: 'Cadastre seu nome no perfil antes de enviar o primeiro contato.',
  FIRST_CONTACT_TEMPLATE_UNAVAILABLE: 'O template primeiro_contato_anxis não está aprovado ou disponível nesta conta. Sincronize os templates e tente novamente.',
  FIRST_CONTACT_TEMPLATE_CHANGED: 'O template primeiro_contato_anxis exige parâmetros diferentes dos aprovados. Confira a versão na Meta.',
  FIRST_CONTACT_USE_ACTION: 'Use o envio de primeiro contato do CRM para enviar este template.',

  // Network & Dispatch
  DISPATCH_UNCERTAIN: 'Não foi possível confirmar o envio da mensagem. Aguarde a confirmação da Meta.',
  DISPATCH_TIMEOUT: 'Tempo limite excedido ao comunicar com o WhatsApp.',
  RATE_LIMIT: 'Limite de envios do WhatsApp atingido. Tente novamente em alguns instantes.',
  INTERNAL_ERROR: 'Ocorreu um erro interno ao processar a mensagem.',
}

export function getPublicErrorMessage(code: string | null | undefined, fallback?: string): string {
  if (!code) return fallback || WHATSAPP_ERROR_MESSAGES.INTERNAL_ERROR
  return WHATSAPP_ERROR_MESSAGES[code] || fallback || WHATSAPP_ERROR_MESSAGES.INTERNAL_ERROR
}

export interface SanitizedLogEntry {
  event: string
  requestId?: string
  accountId?: string
  conversationId?: string
  messageId?: string
  code?: string
  httpStatus?: number
  durationMs?: number
  attempt?: number
  [key: string]: unknown
}

const ALLOWED_LOG_KEYS = new Set([
  'event',
  'requestId',
  'accountId',
  'conversationId',
  'messageId',
  'code',
  'httpStatus',
  'durationMs',
  'attempt',
  'wamid',
  'reason',
  'action',
])

/**
 * Sanitized logger enforcing allowlist fields (§14).
 * Never logs bodies, phone numbers, tokens, proofs or full webhook payloads.
 */
export function logWhatsAppEvent(entry: SanitizedLogEntry): void {
  const sanitized: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(entry)) {
    if (ALLOWED_LOG_KEYS.has(k)) {
      sanitized[k] = v
    }
  }
  console.log(JSON.stringify({ ...sanitized, timestamp: new Date().toISOString() }))
}
