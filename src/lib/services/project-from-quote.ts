import type { ClientProject } from '@/types/client-project.types'
import type { SavedQuote } from '@/types/pricing.types'

export interface ProjectConversionDetails {
  description: string
  deadline: string
  contact: {
    email: string
    phone: string
    cep: string
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
  }
  responsible?: {
    userId: string
    name: string
    email: string
  }
  commercial?: {
    userId: string
    name: string
  }
  scope?: {
    objective?: string
    targetAudience?: string
    segment?: string
  }
  internalNotes?: string
}

export function buildProjectFromQuote(
  quote: SavedQuote,
  details: ProjectConversionDetails
): Partial<ClientProject> {
  const form = quote.form_data
  const contactName = quote.client_name || form.clientName

  return {
    title: quote.project_name ? `Projeto: ${quote.project_name}` : `Projeto para ${contactName}`,
    client_name: contactName,
    company: quote.company || form.company || '',
    email: details.contact.email,
    phone: details.contact.phone,
    whatsapp: details.contact.phone,
    project_type: quote.project_type,
    platform: quote.platform || form.platform || 'Next.js',
    status: 'Novo projeto',
    kanban_stage_name: 'Novo projeto',
    priority: 'Normal',
    responsible_user_id: details.responsible?.userId || '',
    responsible_user_name: details.responsible?.name || '',
    responsible_user_email: details.responsible?.email || '',
    professional_user_id: details.responsible?.userId || '',
    professional_user_name: details.responsible?.name || '',
    commercial_user_id: details.commercial?.userId || '',
    commercial_user_name: details.commercial?.name || '',
    deadline: details.deadline,
    description: details.description,
    internal_notes: details.internalNotes || '',
    quote_id: quote.id,
    approved_value: quote.final_value || 0,
    quote_data: {
      quote_id: quote.id,
      project_type: quote.project_type,
      page_count: form.pageCount || 0,
      additional_page_count: form.additionalPageCount || 0,
      content_option: form.contentOption || '',
      urgency: form.urgency || '',
      base_value: quote.calculation_breakdown?.baseValue || quote.subtotal || 0,
      discount_amount: quote.discount || 0,
      final_value: quote.final_value || 0,
      additional_costs: quote.additional_costs || 0,
      tax_amount: quote.taxes || 0,
      notes: quote.notes || form.notes || '',
      created_at: quote.created_at,
    },
    client_contact_json: {
      contact_name: contactName,
      company: quote.company || form.company || '',
      email: details.contact.email,
      phone: details.contact.phone,
      whatsapp: details.contact.phone,
      cep: details.contact.cep,
      street: details.contact.street,
      number: details.contact.number,
      neighborhood: details.contact.neighborhood,
      city: details.contact.city,
      state: details.contact.state,
    },
    scope_briefing_json: {
      objective: details.scope?.objective || '',
      target_audience: details.scope?.targetAudience || '',
      segment: details.scope?.segment || '',
      requested_pages: [],
      requested_features: [],
      requested_integrations: [],
      visual_references: [],
      technical_requirements: '',
      client_notes: '',
    },
    files: [],
    links: [],
  }
}
