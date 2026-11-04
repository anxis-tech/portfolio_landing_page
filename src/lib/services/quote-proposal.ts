import type { SavedQuote } from '@/types/pricing.types'
import type {
  ProposalContactSnapshot,
  ProposalDraftContext,
  ProposalStatus,
  ProposalVersionHistoryEntry,
  QuoteProposalSnapshot,
} from '@/types/proposal.types'

const publicProposalTokenPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const platformBenefits: Record<string, string[]> = {
  'Next.js': ['Alta performance e carregamento otimizado', 'Base escalável em React e TypeScript', 'SEO técnico e experiência responsiva'],
  React: ['Componentes reutilizáveis', 'Interações fluidas', 'Ecossistema maduro e escalável'],
  Tray: ['Operação de e-commerce consolidada', 'Gestão centralizada de catálogo e pedidos', 'Integrações comerciais do ecossistema'],
  Nuvemshop: ['Gestão simples do catálogo', 'Ecossistema de pagamentos e logística', 'Operação adequada para evolução comercial'],
  WordPress: ['Gestão editorial acessível', 'Ecossistema amplo de integrações', 'Autonomia para atualização de conteúdo'],
  WooCommerce: ['E-commerce integrado ao WordPress', 'Flexibilidade de catálogo e checkout', 'Amplo ecossistema de extensões'],
  'Desenvolvimento personalizado': ['Arquitetura orientada ao problema real', 'Integrações e regras de negócio sob medida', 'Evolução técnica planejada'],
}

function normalizePlatform(platform: string) {
  if (platform.toLowerCase().includes('next')) return 'Next.js'
  if (platform.toLowerCase().includes('wordpress')) return 'WordPress'
  return platform
}

function compact<T>(values: Array<T | false | null | undefined>): T[] {
  return values.filter((value): value is T => Boolean(value))
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function fnv1a(value: string) {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

function normalizeContactSnapshot(contact: ProposalContactSnapshot) {
  return {
    email: contact.email.trim().toLowerCase(),
    whatsapp: contact.whatsapp.replace(/\D/g, ''),
  }
}

function buildProposalPaymentOptions(finalValue: number) {
  const integralCents = Math.max(0, Math.round(finalValue * 100))
  const splitTotalCents = Math.round((integralCents * 110) / 100)
  const firstInstallmentCents = Math.ceil(splitTotalCents / 2)
  const secondInstallmentCents = splitTotalCents - firstInstallmentCents

  return {
    integral: { total: integralCents / 100 },
    split50_50: {
      surchargeRate: 0.1,
      total: splitTotalCents / 100,
      installments: [firstInstallmentCents / 100, secondInstallmentCents / 100] as [number, number],
    },
  }
}

export function isPublicProposalToken(token: string | null | undefined): token is string {
  return Boolean(token && publicProposalTokenPattern.test(token))
}

export function buildProposalPublicUrl(appUrl: string, publicToken: string) {
  const baseUrl = new URL(appUrl)
  return new URL(`/proposta/${encodeURIComponent(publicToken)}`, baseUrl).toString()
}

export function buildProposalWhatsAppMessage(quote: Pick<SavedQuote, 'project_name'>) {
  return `Olá, ANXIS! Tenho uma dúvida sobre a proposta "${quote.project_name}".`
}

export function buildProposalSnapshot(
  quote: SavedQuote,
  context: ProposalDraftContext,
  contact: ProposalContactSnapshot,
  generatedAt: string,
  validUntil: string | null
): QuoteProposalSnapshot {
  const normalizedContact = normalizeContactSnapshot(contact)
  const platform = normalizePlatform(quote.platform || quote.form_data.platform || 'Desenvolvimento personalizado')
  const deliverables = compact<string>([
    quote.form_data.pageCount > 0 && `${quote.form_data.pageCount} páginas principais`,
    quote.form_data.additionalPageCount > 0 && `${quote.form_data.additionalPageCount} páginas adicionais`,
    quote.form_data.hasCustomCode && 'Desenvolvimento em código personalizado',
    quote.form_data.hasBlogModule && 'Módulo de blog',
    quote.form_data.contentOption,
  ])
  const breakdown = compact([
    quote.calculation_breakdown.baseValue > 0 && { label: 'Estrutura base do projeto', value: quote.calculation_breakdown.baseValue },
    quote.calculation_breakdown.additionalPagesValue > 0 && { label: 'Páginas adicionais', value: quote.calculation_breakdown.additionalPagesValue },
    quote.calculation_breakdown.customCodeValue > 0 && { label: 'Código personalizado', value: quote.calculation_breakdown.customCodeValue },
    quote.calculation_breakdown.blogModuleValue > 0 && { label: 'Módulo de blog', value: quote.calculation_breakdown.blogModuleValue },
    quote.calculation_breakdown.contentValue > 0 && { label: 'Conteúdo e copy', value: quote.calculation_breakdown.contentValue },
    quote.additional_costs > 0 && { label: 'Custos adicionais', value: quote.additional_costs },
  ])

  return {
    schemaVersion: 1,
    generatedAt,
    brand: {
      name: 'ANXIS',
      positioning: 'Estratégia, design e tecnologia para experiências digitais que movem negócios.',
      email: normalizedContact.email,
      whatsapp: normalizedContact.whatsapp,
    },
    client: {
      name: quote.client_name,
      company: quote.company || null,
      email: context.clientEmail?.trim() || null,
      phone: context.clientPhone?.trim() || null,
    },
    project: {
      name: quote.project_name,
      type: quote.project_type,
      platform,
      description: context.projectDescription?.trim() || quote.form_data.notes?.trim() || `${quote.project_name} · ${quote.project_type}.`,
      objective: context.objective?.trim() || null,
      targetAudience: context.targetAudience?.trim() || null,
      segment: context.segment?.trim() || null,
    },
    executive: {
      eyebrow: `ANXIS × ${quote.company || quote.client_name}`,
      title: `Uma proposta preparada especialmente para ${quote.company || quote.client_name}`,
      summary: `Esta proposta reúne o escopo, a tecnologia e o investimento definidos para ${quote.project_name}.`,
      challenge: context.objective?.trim() || '',
      solution: context.projectDescription?.trim() || quote.form_data.notes?.trim() || '',
      whyAnxis: [
        'Decisões de produto guiadas pelo objetivo comercial',
        'Design responsivo com foco em clareza e conversão',
        'Implementação técnica preparada para performance e evolução',
      ],
    },
    scope: {
      pageCount: quote.form_data.pageCount,
      additionalPageCount: quote.form_data.additionalPageCount,
      contentOption: quote.form_data.contentOption,
      urgency: quote.form_data.urgency,
      deliverables,
    },
    technology: {
      platform,
      summary: `A solução será implementada em ${platform}, considerando desempenho, segurança, manutenção e adequação ao fluxo operacional do projeto.`,
      benefits: platformBenefits[platform] || platformBenefits['Desenvolvimento personalizado'],
      details: [
        'Interface responsiva e acessível',
        'Boas práticas de performance e SEO técnico',
        'Ambiente preparado para publicação e evolução',
      ],
    },
    timeline: [
      { title: 'Descoberta e alinhamento', description: 'Validação de objetivos, conteúdo, referências e critérios de sucesso.' },
      { title: 'Estratégia e experiência', description: 'Estrutura da informação, direcionamento visual e prototipação das jornadas principais.' },
      { title: 'Desenvolvimento', description: `Implementação em ${platform}, integrações e validações técnicas.` },
      { title: 'Revisão e publicação', description: 'Testes finais, ajustes aprovados e acompanhamento da entrada em produção.' },
    ],
    investment: {
      subtotal: quote.subtotal,
      additionalCosts: quote.additional_costs,
      discount: quote.discount,
      taxes: quote.taxes,
      finalValue: quote.final_value,
      paymentTerms: quote.form_data.paymentTerms || 'Condições a combinar',
      paymentOptions: buildProposalPaymentOptions(quote.final_value),
      breakdown,
    },
    conditions: {
      validUntil,
      deliveryTerm: context.deliveryTerm?.trim() || quote.form_data.desiredDeadline || null,
      notes: quote.notes?.trim() || quote.form_data.notes?.trim() || null,
      disclaimer: 'Esta proposta registra escopo, investimento e condições comerciais. Contrato, assinatura e pagamento seguem fluxos próprios após a aprovação interna do projeto.',
    },
  }
}

export function hashProposalSnapshot(snapshot: QuoteProposalSnapshot) {
  const comparable = {
    ...snapshot,
    generatedAt: undefined,
  }
  return fnv1a(stableStringify(comparable))
}

export function hashProposalDraft(
  quote: SavedQuote,
  context: ProposalDraftContext,
  contact: ProposalContactSnapshot
) {
  return hashProposalSnapshot(buildProposalSnapshot(
    quote,
    context,
    normalizeContactSnapshot(contact),
    '2000-01-01T00:00:00.000Z',
    context.validUntil || null
  ))
}

export function getEffectiveProposalStatus(
  status: ProposalStatus,
  expiresAt: string | null,
  now = new Date().toISOString()
): ProposalStatus {
  if (status === 'accepted') return status
  if (!expiresAt) return status
  return new Date(expiresAt).getTime() <= new Date(now).getTime() ? 'expired' : status
}

export function buildProposalVersionHistory(
  versions: Array<{ id: string; version: number; createdAt: string }>,
  acceptances: Array<{ versionId: string; acceptedAt: string }>,
  currentVersion: number,
  currentStatus: ProposalStatus
): ProposalVersionHistoryEntry[] {
  const acceptanceByVersion = new Map(acceptances.map((acceptance) => [acceptance.versionId, acceptance.acceptedAt]))

  return [...versions]
    .sort((left, right) => right.version - left.version)
    .map((version) => {
      const acceptedAt = acceptanceByVersion.get(version.id) || null
      const superseded = version.version !== currentVersion
      return {
        version: version.version,
        status: superseded
          ? (acceptedAt ? 'accepted' : 'superseded')
          : currentStatus,
        createdAt: version.createdAt,
        acceptedAt,
        superseded,
      }
    })
}
