interface MetaTemplateComponent {
  type?: string
  format?: string
  text?: string
  buttons?: Array<{ type?: string; text?: string; url?: string }>
  [key: string]: unknown
}

export interface MetaTemplateRaw {
  id: string
  name: string
  language: string
  category: string
  status: string
  components?: MetaTemplateComponent[]
}

/** Only the audited, parameter-free button shape of the approved template. */
export function isSupportedFirstContactTemplate(template: MetaTemplateRaw): boolean {
  if (template.name !== 'primeiro_contato_anxis' || template.language !== 'pt_BR'
      || template.category !== 'MARKETING' || template.status !== 'APPROVED'
      || template.components?.length !== 2) return false

  const body = template.components.find((component) => component.type?.toUpperCase() === 'BODY')
  const buttons = template.components.find((component) => component.type?.toUpperCase() === 'BUTTONS')?.buttons
  if (!body?.text || (body.format && body.format.toUpperCase() !== 'TEXT') || buttons?.length !== 2) return false

  const withoutName = body.text.replace('{{1}}', '')
  if (withoutName === body.text || withoutName.includes('{{') || withoutName.includes('}}')) return false

  const quickReplies = buttons.filter((button) => button.type === 'QUICK_REPLY')
  const urls = buttons.filter((button) => button.type === 'URL')
  return quickReplies.length === 1 && urls.length === 1
    && buttons.every((button) => Boolean(button.text?.trim()) && !JSON.stringify(button).includes('{{'))
    && /^https:\/\/\S+$/.test(urls[0].url ?? '')
}
