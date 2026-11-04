import { z } from 'zod'
import { normalizeToE164 } from '../services/whatsapp-phone'

export const createStandaloneContactSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(120),
  phone: z
    .string()
    .trim()
    .min(8, 'Informe um telefone válido')
    .max(30, 'Telefone inválido')
    .refine((value) => normalizeToE164(value) !== null, 'Informe um telefone válido com código do país ou DDD'),
  requestId: z.string().uuid(),
}).strict()

export const openConversationSchema = z.object({
  campaignLeadId: z.string().uuid().nullable().optional(),
  phoneE164: z.string().regex(/^\+[1-9][0-9]{7,14}$/, 'Formato de telefone deve ser E.164 válido'),
  prospectingContactId: z.string().uuid().nullable().optional(),
  requestId: z.string().uuid(),
}).strict()

export const firstContactSchema = z.object({
  campaignLeadId: z.string().uuid(),
  phoneE164: z.string().regex(/^\+[1-9][0-9]{7,14}$/, 'Formato de telefone deve ser E.164 válido'),
  prospectingContactId: z.string().uuid().nullable().optional(),
  requestId: z.string().uuid(),
}).strict()

export const enqueueMessageSchema = z.object({
  conversationId: z.string().uuid(),
  requestId: z.string().uuid(),
  type: z.enum(['text', 'template']),
  body: z.string().max(4096).nullable().optional(),
  templateId: z.string().uuid().nullable().optional(),
  parameters: z.record(z.string(), z.unknown()).nullable().optional(),
  replyToId: z.string().uuid().nullable().optional(),
}).strict().superRefine((data, ctx) => {
  if (data.type === 'text') {
    if (!data.body || data.body.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Mensagem de texto não pode ser vazia',
        path: ['body'],
      })
    }
  }
  if (data.type === 'template') {
    if (!data.templateId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'templateId é obrigatório para mensagens de template',
        path: ['templateId'],
      })
    }
  }
})

export const markReadSchema = z.object({
  conversationId: z.string().uuid(),
  upToSeq: z.number().int().min(0),
}).strict()

export const assignSchema = z.object({
  conversationId: z.string().uuid(),
  assignedTo: z.string().uuid().nullable(),
  requestId: z.string().uuid(),
}).strict()

export const commercialActionSchema = z.object({
  conversationId: z.string().uuid(),
  action: z.enum(['lost', 'interested', 'meeting', 'proposal']),
  requestId: z.string().uuid(),
  data: z.record(z.string(), z.unknown()).optional(),
}).strict().superRefine((val, ctx) => {
  if (val.action === 'meeting') {
    const scheduledAt = val.data?.scheduled_at
    if (!scheduledAt || typeof scheduledAt !== 'string') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'scheduled_at é obrigatório para agendamento de reunião',
        path: ['data', 'scheduled_at'],
      })
    }
  }
})

export const setConversationClosedSchema = z.object({
  conversationId: z.string().uuid(),
  closed: z.boolean(),
  requestId: z.string().uuid(),
}).strict()

export const recordConsentSchema = z.object({
  contactId: z.string().uuid(),
  status: z.enum(['granted', 'revoked']),
  source: z.enum(['form', 'written_request', 'verbal_record', 'manual_evidence', 'inbound_keyword']),
  proof: z.object({
    description: z.string().min(1, 'Descrição da prova é obrigatória'),
    evidenceRef: z.string().optional(),
  }).passthrough(),
  occurredAt: z.string().datetime(),
  requestId: z.string().uuid(),
}).strict().superRefine((val, ctx) => {
  const ts = new Date(val.occurredAt).getTime()
  if (ts > Date.now() + 60000) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Data de ocorrência do consentimento não pode ser futura',
      path: ['occurredAt'],
    })
  }
})

export const linkConversationSchema = z.object({
  conversationId: z.string().uuid(),
  campaignLeadId: z.string().uuid(),
  prospectingContactId: z.string().uuid().nullable().optional(),
  requestId: z.string().uuid(),
}).strict()

export const unlinkConversationSchema = z.object({
  conversationId: z.string().uuid(),
  reason: z.string().min(3, 'Motivo de desvinculação deve ter pelo menos 3 caracteres'),
  requestId: z.string().uuid(),
}).strict()

export const listMessagesSchema = z.object({
  conversationId: z.string().uuid(),
  cursor: z.object({
    occurredAt: z.string(),
    id: z.string().uuid(),
  }).nullable().optional(),
  limit: z.number().int().min(1).max(100).default(50),
}).strict()

export const inboundUnitSchema = z.object({
  accountId: z.string().uuid(),
  wamid: z.string().min(1),
  from: z.string().regex(/^\+[1-9][0-9]{7,14}$/),
  waId: z.string().optional().nullable(),
  profileName: z.string().trim().min(1).max(120).optional().nullable(),
  providerTimestamp: z.string().datetime(),
  type: z.enum(['text', 'image', 'document', 'audio', 'interactive', 'unsupported']),
  body: z.string().nullable().optional(),
  content: z.record(z.string(), z.unknown()).default({}),
  replyToWamid: z.string().nullable().optional(),
  unitKey: z.string().optional(),
}).strict()

export const statusUnitSchema = z.object({
  accountId: z.string().uuid(),
  wamid: z.string().min(1),
  status: z.enum(['sent', 'delivered', 'read', 'failed']),
  providerTimestamp: z.string().datetime(),
  recipientId: z.string().optional().nullable(),
  callbackMessageId: z.string().uuid().optional().nullable(),
  errorCode: z.string().optional().nullable(),
  eventKey: z.string().optional().nullable(),
  detail: z.record(z.string(), z.unknown()).optional(),
}).strict()

export const finishOutboundSchema = z.discriminatedUnion('outcome', [
  z.object({
    outcome: z.literal('accepted'),
    wamid: z.string().min(1),
    acceptedAt: z.string().datetime().optional(),
    waId: z.string().optional(),
  }),
  z.object({
    outcome: z.literal('rejected'),
    code: z.string().min(1),
    retryable: z.boolean(),
    retryAfterSeconds: z.number().int().positive().optional(),
  }),
  z.object({
    outcome: z.literal('uncertain'),
    code: z.string().min(1),
  }),
])
