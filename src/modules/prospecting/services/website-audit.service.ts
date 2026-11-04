import { parseHTML } from 'linkedom'
import robotsParser from 'robots-parser'
// The package exposes CommonJS at runtime; its ambient declaration differs in Deno.
const parseRobots = robotsParser as unknown as (
  url: string,
  text: string
) => { isAllowed(url: string, agent: string): boolean | undefined }
import type { AuditFailureCode, DigitalPresence } from '../types/index.ts'
import { fetchWebsite, validateWebsiteURL } from './safe-http.ts'
export function normalizeWhatsAppNumber(raw: string): string | null {
  if (!raw) return null
  let decoded = raw
  try {
    decoded = decodeURIComponent(raw)
  } catch {}
  const digits = decoded.replace(/\D/g, '')
  if (!digits) return null
  // Se tiver 10 ou 11 dígitos (DDD + número brasileiro sem DDI), adiciona DDI 55
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`
  }
  // Se tiver entre 10 e 15 dígitos válidos (formato E.164)
  if (digits.length >= 10 && digits.length <= 15) {
    return digits
  }
  return null
}

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false
  const trimmed = email.trim().toLowerCase()
  // Ignora extensões de assets e arquivos estáticos comuns
  if (/\.(png|jpg|jpeg|gif|svg|webp|js|css|woff|woff2|ttf|eot|ico)$/i.test(trimmed)) {
    return false
  }
  // Ignora domínios de placeholders e trackers conhecidos
  if (/(?:example\.com|domain\.com|sentry\.io|wixpress\.com)/i.test(trimmed)) {
    return false
  }
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)
}

export function extractWhatsAppNumberFromHref(href: string): string | null {
  if (!href) return null
  try {
    if (href.startsWith('whatsapp:')) {
      const dummy = new URL(href.replace(/^whatsapp:\/\/send\/?/i, 'http://dummy/'))
      const phoneParam = dummy.searchParams.get('phone')
      if (phoneParam) return normalizeWhatsAppNumber(phoneParam)
    }
    const url = new URL(href, 'http://dummy')
    if (/api\.whatsapp\.com|web\.whatsapp\.com/i.test(url.hostname)) {
      const phoneParam = url.searchParams.get('phone')
      if (phoneParam) return normalizeWhatsAppNumber(phoneParam)
    }
    if (/wa\.me/i.test(url.hostname)) {
      const phoneParam = url.searchParams.get('phone')
      if (phoneParam) return normalizeWhatsAppNumber(phoneParam)
      const pathPart = url.pathname.replace(/^\//, '').split('/')[0]
      if (pathPart) return normalizeWhatsAppNumber(pathPart)
    }
  } catch {
    const match = href.match(/phone=([0-9+]+)/i) || href.match(/wa\.me\/([0-9+]+)/i)
    if (match?.[1]) return normalizeWhatsAppNumber(match[1])
  }
  return null
}

export function parseWebsite(html: string, url: string): DigitalPresence {
  const { document } = parseHTML(html) as any
  const docText =
    document.body?.textContent ?? document.documentElement?.textContent ?? document.textContent ?? ''
  const cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
  const text = `${docText} ${cleanHtml}`.replace(/\s+/g, ' ').trim()
  const links = [...document.querySelectorAll('a[href]')].map((a: any) => ({
    href: a.getAttribute('href') ?? '',
    text: (a.textContent ?? '').trim(),
  }))

  const whatsappNumbers = new Set<string>()
  const emails = new Set<string>()
  const phones = new Set<string>()
  const ctaLinks: Array<{ href: string; text?: string; type: string }> = []

  // 1. Analisa links para WhatsApp, Email (mailto), Telefone (tel) e CTAs
  for (const { href, text: linkText } of links) {
    const isWa = /(?:wa\.me|api\.whatsapp\.com|web\.whatsapp\.com|whatsapp:\/\/)/i.test(href)
    if (isWa) {
      const normalizedNum = extractWhatsAppNumberFromHref(href)
      if (normalizedNum) whatsappNumbers.add(normalizedNum)
      ctaLinks.push({ href, text: linkText || 'WhatsApp', type: 'whatsapp' })
    } else if (href.toLowerCase().startsWith('mailto:')) {
      const rawMail = href.slice(7).split('?')[0].trim().toLowerCase()
      if (isValidEmail(rawMail)) {
        emails.add(rawMail)
        ctaLinks.push({ href, text: linkText || rawMail, type: 'email' })
      }
    } else if (href.toLowerCase().startsWith('tel:')) {
      const rawPhone = href.slice(4).split('?')[0].trim()
      if (rawPhone.length >= 8) {
        phones.add(rawPhone)
        ctaLinks.push({ href, text: linkText || rawPhone, type: 'phone' })
      }
    } else {
      const isCta =
        /agend|orçamento|contato|fale|comprar|contratar|solicitar|reserv|doctoralia|calendly/i.test(
          linkText
        ) || /contato|fale-conosco|agendamento|calendly|doctoralia/i.test(href)
      const isSocial = /(?:instagram\.com|facebook\.com|linkedin\.com)/i.test(href)
      if (isCta || isSocial) {
        ctaLinks.push({
          href,
          text: linkText || (isSocial ? 'Rede Social' : 'Contato'),
          type: isSocial ? 'social' : 'cta',
        })
      }
    }
  }

  // 2. Extrai e-mail textual visível no HTML (com validação anti-falso-positivo)
  const textMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
  for (const match of textMatches) {
    const candidate = match.trim().toLowerCase()
    if (isValidEmail(candidate)) {
      emails.add(candidate)
    }
  }

  const whatsappList = [...whatsappNumbers]
  const emailList = [...emails]
  const phoneList = [...phones]

  // Deduplica CTAs mantendo os primeiros destinos únicos
  const seenHrefs = new Set<string>()
  const uniqueCtaLinks = ctaLinks
    .filter((c) => {
      if (seenHrefs.has(c.href)) return false
      seenHrefs.add(c.href)
      return true
    })
    .slice(0, 15)

  const primaryWhatsapp = whatsappList[0] || null
  const primaryEmail = emailList[0] || null
  const primaryPhone = phoneList[0] || null

  const hasAnyContact =
    whatsappList.length > 0 ||
    emailList.length > 0 ||
    phoneList.length > 0 ||
    uniqueCtaLinks.length > 0

  const title = (document.querySelector('title')?.textContent ?? '').trim() || null

  return {
    websiteKind: 'website',
    title,
    email: primaryEmail,
    whatsappNumber: primaryWhatsapp,
    hasWhatsapp: whatsappList.length > 0,
    hasPhone: phoneList.length > 0,
    hasEmail: emailList.length > 0,
    contactExtractionStatus: hasAnyContact ? 'success' : 'partial',
    extractedContacts: {
      whatsapp: whatsappList,
      emails: emailList,
      phones: phoneList,
      ctaLinks: uniqueCtaLinks,
    },
    crawlStatus: 'success',
    finalUrl: url,
    crawledAt: new Date().toISOString(),
  }
}

export interface AuditTerminalFailureResult {
  auditFailed: true
  failureCode: AuditFailureCode
  failureDetail: string
  signals: { code: string; source: string; evidence?: Record<string, unknown> }[]
  digital: DigitalPresence
}

export type AuditWebsiteResult = DigitalPresence | AuditTerminalFailureResult

export function classifyAuditError(err: unknown): {
  terminal: boolean
  code: AuditFailureCode
  detail: string
} {
  const msg = err instanceof Error ? err.message : String(err)

  // 0. Erros internos do cliente / crawler / runtime (Invalid URL etc.) -> Terminal operacional
  if (/AUDIT_CLIENT_ERROR|Invalid URL|ERR_INVALID_URL/i.test(msg)) {
    return {
      terminal: true,
      code: 'AUDIT_CLIENT_ERROR',
      detail: 'Erro interno ao construir ou executar a requisição',
    }
  }

  // 1. DNS / NXDOMAIN / ENOTFOUND
  if (/ENOTFOUND|NXDOMAIN|EAI_NONAME|EAI_NODATA|Domínio não encontrado no DNS/i.test(msg)) {
    return {
      terminal: true,
      code: 'WEBSITE_DNS_NOT_FOUND',
      detail: 'Domínio não encontrado no DNS (ENOTFOUND)',
    }
  }

  // 2. SSRF / Endereço bloqueado por política de segurança
  if (
    /Endereço bloqueado por política de segurança|DNS não público|Endereço privado bloqueado|Endereço de website não público/i.test(
      msg
    )
  ) {
    return {
      terminal: true,
      code: 'WEBSITE_ADDRESS_BLOCKED',
      detail: 'Endereço bloqueado por política de segurança (SSRF)',
    }
  }

  // 3. URL de website não permitida
  if (/Endereço de website não permitido/i.test(msg)) {
    return {
      terminal: true,
      code: 'WEBSITE_URL_NOT_ALLOWED',
      detail: 'URL de website não permitida',
    }
  }

  // 4. TLS: Certificado inválido / expirado / mismatch / UnknownIssuer
  if (
    /UnknownIssuer|UntrustedCert|InvalidCertificate|CertNotValidForName|CertExpired|BadDer|HOSTNAME_MISMATCH|ERR_TLS_CERT|CERTIFICATE_ERROR|CERT_|DEPTH_|SELF_SIGNED|UNABLE_TO_VERIFY|ALTNAME_INVALID|certificado SSL\/TLS/i.test(
      msg
    )
  ) {
    return {
      terminal: true,
      code: 'WEBSITE_CERTIFICATE_ERROR',
      detail: /UnknownIssuer/i.test(msg)
        ? 'Certificado SSL/TLS com emissor desconhecido (UnknownIssuer)'
        : 'Certificado SSL/TLS inválido ou expirado',
    }
  }

  // 5. TLS: Handshake / negociação / protocolo
  if (
    /HANDSHAKE_ERROR|HANDSHAKE|negociação TLS|SSL_ERROR_SSL|ERR_SSL_PROTOCOL_ERROR|EPROTO/i.test(
      msg
    )
  ) {
    return {
      terminal: true,
      code: 'WEBSITE_TLS_HANDSHAKE_ERROR',
      detail: 'Falha na negociação de protocolo TLS (Handshake)',
    }
  }

  // 6. ECONNREFUSED -> Terminal
  if (/ECONNREFUSED|Conexão recusada/i.test(msg)) {
    return {
      terminal: true,
      code: 'WEBSITE_UNREACHABLE',
      detail: 'Servidor recusou conexão (ECONNREFUSED)',
    }
  }

  // 7. HTTP 403 / 401 / 429 / Bot protection / robots.txt -> Terminal / Bloqueado
  if (/não autorizou a leitura de robots|não permitida pelo robots|Auditoria não permitida/i.test(msg)) {
    return {
      terminal: true,
      code: 'AUDIT_BLOCKED',
      detail: 'Auditoria não permitida pelo robots.txt deste website',
    }
  }
  if (/HTTP 403|HTTP 401/i.test(msg)) {
    return {
      terminal: true,
      code: 'AUDIT_BLOCKED',
      detail: 'Acesso bloqueado por proteção do website (HTTP 403)',
    }
  }
  if (/HTTP 429/i.test(msg)) {
    return {
      terminal: true,
      code: 'AUDIT_BLOCKED',
      detail: 'Taxa limite de requisições excedida no website (HTTP 429)',
    }
  }

  // 8. HTTP 404 / 410 -> Terminal
  if (/HTTP 404|HTTP 410/i.test(msg)) {
    return {
      terminal: true,
      code: 'WEBSITE_HTTP_ERROR',
      detail: /HTTP 410/i.test(msg) ? 'Página permanentemente removida (HTTP 410)' : 'Página não encontrada (HTTP 404)',
    }
  }

  // 8b. HTTP 5xx (500, 502, 503, etc.) -> Falha HTTP
  if (/HTTP 5\d{2}/i.test(msg)) {
    return {
      terminal: false,
      code: 'WEBSITE_HTTP_ERROR',
      detail: `Servidor retornou erro interno (${msg.match(/HTTP 5\d{2}/i)?.[0] ?? 'HTTP 5xx'})`,
    }
  }

  // 9. Redirection loop / Não HTML -> Terminal
  if (/limite de redirecionamentos|não retornou uma página HTML/i.test(msg)) {
    return {
      terminal: true,
      code: 'WEBSITE_HTTP_ERROR',
      detail: msg,
    }
  }

  // 10. Body > 1 MB (truncado mas sem HTML analisável) -> Terminal
  if (/excedeu o limite de 1 MB|BODY_LIMIT_EXCEEDED/i.test(msg)) {
    return {
      terminal: true,
      code: 'BODY_LIMIT_EXCEEDED',
      detail: 'Website excedeu o limite de 1 MB. Conteúdo parcial insuficiente para análise.',
    }
  }

  // 11. Timeout de rede -> Transiente curto (máx. 2 tentativas via [audit-timeout] tag)
  if (/Timeout ao acessar o website|ETIMEDOUT|ECONNABORTED/i.test(msg)) {
    return {
      terminal: false,
      code: 'AUDIT_TIMEOUT',
      detail: msg,
    }
  }

  // 12. Demais erros transientes: ECONNRESET, HTTP 429, HTTP 5xx, etc.
  return {
    terminal: false,
    code: 'WEBSITE_UNREACHABLE',
    detail: msg,
  }
}

export async function auditWebsite(
  website: string,
  dependencies = { fetchWebsite }
): Promise<AuditWebsiteResult> {
  const auditStartTime = Date.now()
  let robotsStatus: 'allowed' | 'disallowed' | 'unavailable' | 'blocked' | 'error' = 'allowed'
  try {
    validateWebsiteURL(website)
    const deadline = Date.now() + 20000
    const policies = new Map<string, ReturnType<typeof parseRobots>>()
    const checkedOrigins = new Set<string>()
    const crawlerStartTime = Date.now()
    const response = await dependencies.fetchWebsite(website, 0, deadline, async (url) => {
      if (!checkedOrigins.has(url.origin)) {
        checkedOrigins.add(url.origin)
        const robotsURL = new URL('/robots.txt', url).href
        const robotsDeadline = Date.now() + 3000 // Orçamento curto e independente (3s) para robots
        try {
          const robots = await dependencies.fetchWebsite(robotsURL, 0, robotsDeadline)
          if (robots.status === 200) {
            const parsed = parseRobots(robotsURL, robots.body)
            policies.set(url.origin, parsed)
            if (parsed.isAllowed(url.href, 'AnxisProspecting') === false) {
              robotsStatus = 'disallowed'
              throw new Error('Auditoria não permitida pelo robots.txt deste website.')
            }
            robotsStatus = 'allowed'
          } else if ([401, 403].includes(robots.status)) {
            robotsStatus = 'blocked'
          } else {
            robotsStatus = 'unavailable'
          }
        } catch (err: any) {
          if (err?.message?.includes('não permitida pelo robots.txt')) {
            throw err
          }
          // Falhas de rede, 404 ou timeout de 3s no robots.txt não devem impedir auditoria da homepage
          robotsStatus = 'unavailable'
        }
      } else {
        const policy = policies.get(url.origin)
        if (policy && policy.isAllowed(url.href, 'AnxisProspecting') === false) {
          robotsStatus = 'disallowed'
          throw new Error('Auditoria não permitida pelo robots.txt deste website.')
        }
      }
    })
    const crawlerDurationMs = Date.now() - crawlerStartTime

    if (response.status === 204) {
      const auditTotalDurationMs = Date.now() - auditStartTime
      let host: string | undefined
      try { host = new URL(response.url).hostname } catch {}
      return {
        websiteKind: 'website',
        crawlStatus: 'success',
        contactExtractionStatus: 'unavailable',
        httpStatus: 204,
        initialUrl: website,
        finalUrl: response.url,
        hostname: host,
        transportVersion: '2.0',
        crawledAt: new Date().toISOString(),
        auditTotalDurationMs,
        attempts: response.attempts,
        extractedContacts: { whatsapp: [], emails: [], phones: [], ctaLinks: [] },
      }
    }

    if ([401, 403, 429].includes(response.status)) {
      const auditTotalDurationMs = Date.now() - auditStartTime
      let host: string | undefined
      try { host = new URL(response.url).hostname } catch {}
      return {
        auditFailed: true,
        failureCode: 'AUDIT_BLOCKED',
        failureDetail: `Acesso bloqueado por proteção do website (HTTP ${response.status})`,
        signals: [
          {
            code: 'AUDIT_BLOCKED',
            source: 'website_audit',
            evidence: { detail: `HTTP ${response.status}`, status: response.status },
          },
        ],
        digital: {
          websiteKind: 'website',
          crawlStatus: 'failed',
          contactExtractionStatus: 'unavailable',
          warnings: [`Acesso bloqueado por proteção do website (HTTP ${response.status})`],
          initialUrl: website,
          finalUrl: response.url,
          hostname: host,
          httpStatus: response.status,
          transportVersion: '2.0',
          crawledAt: new Date().toISOString(),
          auditFailureCode: 'AUDIT_BLOCKED',
          auditTotalDurationMs,
          attempts: response.attempts,
          extractedContacts: { whatsapp: [], emails: [], phones: [], ctaLinks: [] },
        },
      }
    }

    if (response.status < 200 || response.status >= 300) {
      const err: any = new Error(`Website retornou HTTP ${response.status}.`)
      err.status = response.status
      err.httpStatus = response.status
      throw err
    }
    if (!/text\/html|application\/xhtml\+xml/i.test(response.type))
      throw new Error('O endereço não retornou uma página HTML.')

    // Se o body foi truncado sem conteúdo HTML útil, retorna resultado sem contatos
    if (response.bodyTruncated && !response.body.trim()) {
      const auditTotalDurationMs = Date.now() - auditStartTime
      let host: string | undefined
      try { host = new URL(website).hostname } catch {}
      return {
        auditFailed: true,
        failureCode: 'BODY_LIMIT_EXCEEDED',
        failureDetail: 'Website excedeu o limite de 1 MB. Conteúdo parcial insuficiente para análise.',
        signals: [{ code: 'BODY_LIMIT_EXCEEDED', source: 'website_audit', evidence: { detail: 'Body truncado sem conteúdo HTML' } }],
        digital: {
          websiteKind: 'website',
          crawlStatus: 'failed',
          contactExtractionStatus: 'unavailable',
          warnings: ['Website excedeu o limite de 1 MB. Conteúdo parcial insuficiente para análise.'],
          initialUrl: website,
          finalUrl: response.url,
          hostname: host,
          transportVersion: '2.0',
          crawledAt: new Date().toISOString(),
          auditFailureCode: 'BODY_LIMIT_EXCEEDED',
          auditTotalDurationMs,
          attempts: response.attempts,
          extractedContacts: { whatsapp: [], emails: [], phones: [], ctaLinks: [] },
        },
      }
    }

    let digital: ReturnType<typeof parseWebsite>
    try {
      digital = parseWebsite(response.body, response.url)
    } catch {
      // Se o parse falhar em body truncado, retorna falha de extração sem quebrar o pipeline
      const auditTotalDurationMs = Date.now() - auditStartTime
      let host: string | undefined
      try { host = new URL(website).hostname } catch {}
      return {
        auditFailed: true,
        failureCode: 'BODY_LIMIT_EXCEEDED',
        failureDetail: 'Website excedeu o limite de 1 MB. Análise do conteúdo parcial falhou.',
        signals: [{ code: 'BODY_LIMIT_EXCEEDED', source: 'website_audit' }],
        digital: {
          websiteKind: 'website',
          crawlStatus: 'failed',
          contactExtractionStatus: 'unavailable',
          warnings: ['Website excedeu o limite de 1 MB. Análise do conteúdo parcial falhou.'],
          initialUrl: website,
          finalUrl: response.url,
          hostname: host,
          transportVersion: '2.0',
          crawledAt: new Date().toISOString(),
          auditFailureCode: 'BODY_LIMIT_EXCEEDED',
          auditTotalDurationMs,
          attempts: response.attempts,
          extractedContacts: { whatsapp: [], emails: [], phones: [], ctaLinks: [] },
        },
      }
    }

    const auditTotalDurationMs = Date.now() - auditStartTime
    const parsedUrl = new URL(response.url)

    const truncationWarnings: string[] = response.bodyTruncated
      ? ['Conteúdo parcial: página excedeu 1 MB. Extração de contatos limitada ao primeiro 1 MB.']
      : []

    return {
      ...digital,
      httpStatus: response.status,
      initialUrl: website,
      finalUrl: response.url,
      hostname: parsedUrl.hostname,
      transportVersion: '2.0',
      redirectChain: response.redirectChain,
      addressFamily: response.addressFamily,
      selectedAddress: response.address,
      connectionDurationMs: response.connectionDurationMs,
      tlsDurationMs: response.tlsDurationMs,
      robotsStatus,
      crawlerDurationMs,
      auditTotalDurationMs,
      attempts: response.attempts,
      warnings: [
        ...(digital.warnings ?? []),
        ...truncationWarnings,
      ],
    }
  } catch (err) {
    const classified = classifyAuditError(err)
    const rawMsg = err instanceof Error ? err.message : String(err)
    const auditTotalDurationMs = Date.now() - auditStartTime
    let host: string | undefined
    try {
      host = new URL(website).hostname
    } catch {}

    const httpStatusMatch = rawMsg.match(/HTTP (\d{3})/i)
    const errStatus = (err as any)?.status ?? (err as any)?.httpStatus
    const httpStatus = errStatus ?? (httpStatusMatch ? parseInt(httpStatusMatch[1], 10) : undefined)

    const isTlsError =
      classified.code === 'WEBSITE_CERTIFICATE_ERROR' ||
      classified.code === 'WEBSITE_TLS_ERROR' ||
      /UnknownIssuer|CERTIFICATE_ERROR|CERT_HAS_EXPIRED|HOSTNAME_MISMATCH/i.test(rawMsg)

    return {
      auditFailed: true,
      failureCode: classified.code,
      failureDetail: classified.detail,
      signals: [
        {
          code: classified.code,
          source: 'website_audit',
          evidence: { detail: classified.detail, error: rawMsg },
        },
      ],
      digital: {
        websiteKind: 'website',
        crawlStatus: 'failed',
        contactExtractionStatus: 'unavailable',
        warnings: [classified.detail],
        initialUrl: website,
        finalUrl: website,
        hostname: host,
        transportVersion: '2.0',
        crawledAt: new Date().toISOString(),
        auditFailureCode: classified.code,
        dnsFailure:
          classified.code === 'WEBSITE_DNS_NOT_FOUND' ||
          classified.code === 'WEBSITE_DNS_FAILURE',
        tlsError: isTlsError,
        unreachable: classified.code === 'WEBSITE_UNREACHABLE',
        httpError: classified.code === 'WEBSITE_HTTP_ERROR',
        httpStatus,
        robotsStatus,
        auditTotalDurationMs,
        attempts: (err as any)?.attempts,
        extractedContacts: { whatsapp: [], emails: [], phones: [], ctaLinks: [] },
      },
    }
  }
}
