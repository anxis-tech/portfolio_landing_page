'use server'

import type {
  WhatsAppActionResult,
  WhatsAppInboxConversationDTO,
  WhatsAppAssigneeDTO,
  WhatsAppContextDTO,
  WhatsAppConversationPageDTO,
  WhatsAppMessageDTO,
} from "../types/whatsapp"

const MOCK_ASSIGNEES: WhatsAppAssigneeDTO[] = [
  { id: "usr-1", fullName: "Mateus Oliveira" },
  { id: "usr-2", fullName: "Ana Beatriz" },
  { id: "usr-3", fullName: "Lucas Ferreira" },
]

const MOCK_INBOX_CONVERSATIONS: WhatsAppInboxConversationDTO[] = [
  {
    id: "conv-1",
    accountId: "acc-1",
    contactId: "ct-1",
    leadId: "lead-1",
    campaignLeadId: null,
    prospectingContactId: null,
    assignedTo: "usr-1",
    assignedName: "Mateus Oliveira",
    status: "waiting_agent",
    lastInboundAt: "2026-11-04T11:42:00Z",
    lastOutboundAt: "2026-11-04T10:15:00Z",
    lastMessageAt: "2026-11-04T11:42:00Z",
    customerWindowExpiresAt: "2026-11-05T11:42:00Z",
    inboundSeq: 3,
    readSeq: 2,
    unreadCount: 1,
    phoneE164: "+5511987654321",
    optInStatus: "granted",
    contactName: "Dra. Camila Vasconcelos",
    companyName: "Clínica Dermatológica Harmonia",
    city: "São Paulo",
    state: "SP",
    website: "https://clinicaharmonia.med.br",
    email: "contato@clinicaharmonia.med.br",
    pipelineStage: "proposal_sent",
    classification: "High",
    opportunityType: "Landing Page & Sistema Web",
    campaignName: "Inbound Saúde VIP",
    lastMessageSnippet: "Mateus, você conseguiu verificar a prévia do seletor de procedimentos?",
    lastMessageType: "text",
    lastMessageStatus: "delivered",
    lastMessageDirection: "inbound",
    isWindowOpen: true,
  },
  {
    id: "conv-2",
    accountId: "acc-1",
    contactId: "ct-2",
    leadId: "lead-2",
    campaignLeadId: null,
    prospectingContactId: null,
    assignedTo: "usr-3",
    assignedName: "Lucas Ferreira",
    status: "waiting_customer",
    lastInboundAt: "2026-11-03T16:20:00Z",
    lastOutboundAt: "2026-11-03T16:45:00Z",
    lastMessageAt: "2026-11-03T16:45:00Z",
    customerWindowExpiresAt: "2026-11-04T16:20:00Z",
    inboundSeq: 2,
    readSeq: 2,
    unreadCount: 0,
    phoneE164: "+5521998812233",
    optInStatus: "granted",
    contactName: "Rodrigo Medeiros",
    companyName: "Nexus Tech Store",
    city: "Rio de Janeiro",
    state: "RJ",
    website: "https://nexustech.com.br",
    email: "financeiro@nexustech.com.br",
    pipelineStage: "negotiating",
    classification: "High",
    opportunityType: "E-commerce & Catálogo Gamer",
    campaignName: "E-commerce Brasil",
    lastMessageSnippet: "Perfeito Rodrigo, configurei a taxa de parcelamento do checkout. Testa no link!",
    lastMessageType: "text",
    lastMessageStatus: "read",
    lastMessageDirection: "outbound",
    isWindowOpen: true,
  },
  {
    id: "conv-3",
    accountId: "acc-1",
    contactId: "ct-3",
    leadId: "lead-3",
    campaignLeadId: null,
    prospectingContactId: null,
    assignedTo: "usr-1",
    assignedName: "Mateus Oliveira",
    status: "open",
    lastInboundAt: "2026-11-04T09:15:00Z",
    lastOutboundAt: null,
    lastMessageAt: "2026-11-04T09:15:00Z",
    customerWindowExpiresAt: "2026-11-05T09:15:00Z",
    inboundSeq: 1,
    readSeq: 1,
    unreadCount: 0,
    phoneE164: "+5511965438899",
    optInStatus: "granted",
    contactName: "Guilherme Prado",
    companyName: "Prado Empreendimentos Imobiliários",
    city: "São Paulo",
    state: "SP",
    website: "https://pradoimoveis.com.br",
    email: "diretoria@pradoimoveis.com.br",
    pipelineStage: "contacted",
    classification: "Medium",
    opportunityType: "Portal Institucional",
    campaignName: "Prospecção Imobiliária",
    lastMessageSnippet: "Recebemos o contrato assinado via Autentique. Quando iniciamos a etapa de design?",
    lastMessageType: "text",
    lastMessageStatus: "delivered",
    lastMessageDirection: "inbound",
    isWindowOpen: true,
  },
]

const MOCK_MESSAGES: Record<string, WhatsAppMessageDTO[]> = {
  "conv-1": [
    {
      id: "msg-1",
      conversationId: "conv-1",
      direction: "outbound",
      type: "text",
      body: "Olá Dra. Camila, bom dia! Atualizamos a versão do site no link de homologação com as cores ajustadas.",
      content: {},
      templateId: null,
      wamid: "wamid-1",
      status: "read",
      sendState: "read",
      inboundSeq: null,
      sentByName: "Mateus Oliveira",
      occurredAt: "2026-11-04T10:15:00Z",
      acceptedAt: "2026-11-04T10:15:05Z",
      sentAt: "2026-11-04T10:15:10Z",
      deliveredAt: "2026-11-04T10:15:15Z",
      readAt: "2026-11-04T10:16:00Z",
      failedAt: null,
      errorCode: null,
      errorMessage: null,
      uncertaintyAcknowledgedAt: null,
      isUncertain: false,
    },
    {
      id: "msg-2",
      conversationId: "conv-1",
      direction: "inbound",
      type: "text",
      body: "Ficou maravilhoso! Adorei a elegância da tipografia serifada no topo.",
      content: {},
      templateId: null,
      wamid: "wamid-2",
      status: "delivered",
      sendState: "delivered",
      inboundSeq: 1,
      sentByName: null,
      occurredAt: "2026-11-04T10:30:00Z",
      acceptedAt: null,
      sentAt: null,
      deliveredAt: "2026-11-04T10:30:00Z",
      readAt: null,
      failedAt: null,
      errorCode: null,
      errorMessage: null,
      uncertaintyAcknowledgedAt: null,
      isUncertain: false,
    },
    {
      id: "msg-3",
      conversationId: "conv-1",
      direction: "inbound",
      type: "text",
      body: "Mateus, você conseguiu verificar a prévia do seletor de procedimentos?",
      content: {},
      templateId: null,
      wamid: "wamid-3",
      status: "delivered",
      sendState: "delivered",
      inboundSeq: 2,
      sentByName: null,
      occurredAt: "2026-11-04T11:42:00Z",
      acceptedAt: null,
      sentAt: null,
      deliveredAt: "2026-11-04T11:42:00Z",
      readAt: null,
      failedAt: null,
      errorCode: null,
      errorMessage: null,
      uncertaintyAcknowledgedAt: null,
      isUncertain: false,
    },
  ],
  "conv-2": [
    {
      id: "msg-4",
      conversationId: "conv-2",
      direction: "inbound",
      type: "text",
      body: "Conseguimos habilitar 12x no cartão com repasse de juros para o cliente?",
      content: {},
      templateId: null,
      wamid: "wamid-4",
      status: "delivered",
      sendState: "delivered",
      inboundSeq: 1,
      sentByName: null,
      occurredAt: "2026-11-03T16:20:00Z",
      acceptedAt: null,
      sentAt: null,
      deliveredAt: "2026-11-03T16:20:00Z",
      readAt: null,
      failedAt: null,
      errorCode: null,
      errorMessage: null,
      uncertaintyAcknowledgedAt: null,
      isUncertain: false,
    },
    {
      id: "msg-5",
      conversationId: "conv-2",
      direction: "outbound",
      type: "text",
      body: "Perfeito Rodrigo, configurei a taxa de parcelamento do checkout. Testa no link!",
      content: {},
      templateId: null,
      wamid: "wamid-5",
      status: "read",
      sendState: "read",
      inboundSeq: null,
      sentByName: "Lucas Ferreira",
      occurredAt: "2026-11-03T16:45:00Z",
      acceptedAt: "2026-11-03T16:45:05Z",
      sentAt: "2026-11-03T16:45:10Z",
      deliveredAt: "2026-11-03T16:45:15Z",
      readAt: "2026-11-03T16:46:00Z",
      failedAt: null,
      errorCode: null,
      errorMessage: null,
      uncertaintyAcknowledgedAt: null,
      isUncertain: false,
    },
  ],
  "conv-3": [
    {
      id: "msg-6",
      conversationId: "conv-3",
      direction: "inbound",
      type: "text",
      body: "Recebemos o contrato assinado via Autentique. Quando iniciamos a etapa de design?",
      content: {},
      templateId: null,
      wamid: "wamid-6",
      status: "delivered",
      sendState: "delivered",
      inboundSeq: 1,
      sentByName: null,
      occurredAt: "2026-11-04T09:15:00Z",
      acceptedAt: null,
      sentAt: null,
      deliveredAt: "2026-11-04T09:15:00Z",
      readAt: null,
      failedAt: null,
      errorCode: null,
      errorMessage: null,
      uncertaintyAcknowledgedAt: null,
      isUncertain: false,
    },
  ],
}

export async function loadWhatsAppInboxConversationsAction(): Promise<
  WhatsAppActionResult<WhatsAppInboxConversationDTO[]>
> {
  return { ok: true, data: MOCK_INBOX_CONVERSATIONS }
}

export async function listWhatsAppAssigneesAction(): Promise<
  WhatsAppActionResult<WhatsAppAssigneeDTO[]>
> {
  return { ok: true, data: MOCK_ASSIGNEES }
}

export async function createStandaloneWhatsAppContactAction(data: any): Promise<
  WhatsAppActionResult<any>
> {
  const newId = `conv-${Date.now()}`
  const newContactId = `ct-${Date.now()}`
  const newConv: WhatsAppInboxConversationDTO = {
    id: newId,
    accountId: "acc-1",
    contactId: newContactId,
    leadId: null,
    campaignLeadId: null,
    prospectingContactId: null,
    assignedTo: "usr-1",
    assignedName: "Mateus Oliveira",
    status: "open",
    lastInboundAt: null,
    lastOutboundAt: null,
    lastMessageAt: new Date().toISOString(),
    customerWindowExpiresAt: null,
    inboundSeq: 0,
    readSeq: 0,
    unreadCount: 0,
    phoneE164: data.phone || "+5511999999999",
    optInStatus: "granted",
    contactName: data.name || "Novo Contato",
    isWindowOpen: true,
  }
  MOCK_INBOX_CONVERSATIONS.unshift(newConv)
  MOCK_MESSAGES[newId] = []
  return {
    ok: true,
    data: {
      contactId: newConv.contactId,
      conversationId: newConv.id,
      phoneE164: newConv.phoneE164,
      displayName: newConv.contactName,
      reusedContact: false,
      reusedConversation: false,
    },
  }
}

export async function loadWhatsAppConversationAction(id: string): Promise<
  WhatsAppActionResult<WhatsAppConversationPageDTO>
> {
  const conv = MOCK_INBOX_CONVERSATIONS.find((c) => c.id === id) || MOCK_INBOX_CONVERSATIONS[0]
  const messages = MOCK_MESSAGES[conv.id] || []
  return {
    ok: true,
    data: {
      conversation: {
        id: conv.id,
        accountId: conv.accountId,
        contactId: conv.contactId,
        leadId: conv.leadId,
        campaignLeadId: conv.campaignLeadId,
        prospectingContactId: conv.prospectingContactId,
        assignedTo: conv.assignedTo,
        assignedName: conv.assignedName,
        status: conv.status as any,
        lastInboundAt: conv.lastInboundAt,
        lastOutboundAt: conv.lastOutboundAt,
        customerWindowExpiresAt: conv.customerWindowExpiresAt,
        inboundSeq: conv.inboundSeq,
        readSeq: conv.readSeq,
        unreadCount: conv.unreadCount,
        lastReadAt: null,
        closedAt: null,
        phoneE164: conv.phoneE164,
        optInStatus: conv.optInStatus as any,
        isWindowOpen: conv.isWindowOpen,
      },
      contact: {
        id: conv.contactId,
        phoneE164: conv.phoneE164,
        displayName: conv.contactName,
        optInStatus: conv.optInStatus as any,
        capability: "whatsapp" as any,
      },
      lead: conv.leadId ? {
        id: conv.leadId,
        name: conv.contactName,
        companyName: conv.companyName,
        city: conv.city,
        state: conv.state,
        stage: conv.pipelineStage,
        classification: conv.classification as any,
      } : null,
      messages: messages,
      nextCursor: null,
      templates: [
        {
          id: "tpl-1",
          name: "confirmacao_proposta",
          language: "pt_BR",
          status: "APPROVED",
          components: [],
          supported: true,
        },
        {
          id: "tpl-2",
          name: "agendamento_reuniao",
          language: "pt_BR",
          status: "APPROVED",
          components: [],
          supported: true,
        },
      ],
      serverNow: new Date().toISOString(),
    },
  }
}

export async function loadWhatsAppMessagesAction(params: any): Promise<
  WhatsAppActionResult<{ messages: WhatsAppMessageDTO[]; nextCursor: any; hasMore: boolean }>
> {
  const convId = typeof params === "string" ? params : (params?.conversationId || "conv-1")
  const messages = MOCK_MESSAGES[convId] || []
  return {
    ok: true,
    data: {
      messages,
      nextCursor: null,
      hasMore: false,
    },
  }
}

export async function sendWhatsAppMessageAction(data: any): Promise<
  WhatsAppActionResult<{
    messageId: string
    status: any
    sendState: any
  }>
> {
  const msgId = `msg-${Date.now()}`
  const newMsg: WhatsAppMessageDTO = {
    id: msgId,
    conversationId: data.conversationId,
    direction: "outbound",
    type: data.type || "text",
    body: data.body || "",
    content: data.parameters || {},
    templateId: data.templateId || null,
    wamid: `wamid-${Date.now()}`,
    status: "delivered",
    sendState: "delivered",
    inboundSeq: null,
    sentByName: "Você",
    occurredAt: new Date().toISOString(),
    acceptedAt: new Date().toISOString(),
    sentAt: new Date().toISOString(),
    deliveredAt: new Date().toISOString(),
    readAt: null,
    failedAt: null,
    errorCode: null,
    errorMessage: null,
    uncertaintyAcknowledgedAt: null,
    isUncertain: false,
  }

  if (MOCK_MESSAGES[data.conversationId]) {
    MOCK_MESSAGES[data.conversationId].push(newMsg)
  }

  return {
    ok: true,
    data: {
      messageId: msgId,
      status: "delivered",
      sendState: "delivered",
    },
  }
}

export async function sendWhatsAppTextMessageAction(data: any): Promise<
  WhatsAppActionResult<any>
> {
  return sendWhatsAppMessageAction(data)
}

export async function markWhatsAppReadAction(convId: string): Promise<
  WhatsAppActionResult<void>
> {
  return { ok: true, data: undefined }
}

export async function assignWhatsAppConversationAction(data: any): Promise<
  WhatsAppActionResult<void>
> {
  return { ok: true, data: undefined }
}

export async function setWhatsAppConversationClosedAction(data: any): Promise<
  WhatsAppActionResult<void>
> {
  return { ok: true, data: undefined }
}

export async function whatsappCommercialAction(data: any): Promise<
  WhatsAppActionResult<void>
> {
  return { ok: true, data: undefined }
}

export async function unlinkWhatsAppConversationAction(data: any): Promise<
  WhatsAppActionResult<void>
> {
  return { ok: true, data: undefined }
}

export async function requestWhatsAppTemplateSyncAction(): Promise<
  WhatsAppActionResult<void>
> {
  return { ok: true, data: undefined }
}

export async function loadWhatsAppContextAction(): Promise<
  WhatsAppActionResult<WhatsAppContextDTO>
> {
  return {
    ok: true,
    data: {
      accounts: [],
      candidates: [],
      conversations: [],
      canManage: true,
      firstContactTemplate: null,
    },
  }
}

export async function loadWhatsAppSummariesAction(): Promise<
  WhatsAppActionResult<any[]>
> {
  return { ok: true, data: [] }
}

export async function recordWhatsAppConsentAction(): Promise<
  WhatsAppActionResult<void>
> {
  return { ok: true, data: undefined }
}

export async function sendFirstContactWhatsAppAction(): Promise<
  WhatsAppActionResult<any>
> {
  return { ok: true, data: { status: "sent" } }
}
