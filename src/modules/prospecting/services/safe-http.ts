import { lookup } from 'node:dns/promises'
import ipaddr from 'ipaddr.js'
import type { ResolvedAddress, IPAttempt, WebsiteTransport } from './transport/types.ts'
import { defaultTransport } from './transport/website-transport.ts'

export type { ResolvedAddress, IPAttempt }

export function isPublicAddress(address: string): boolean {
  try {
    return ipaddr.process(address).range() === 'unicast'
  } catch {
    return false
  }
}

export function validateWebsiteURL(raw: string): URL {
  const url = new URL(raw)
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.port && !['80', '443'].includes(url.port))
  )
    throw new Error('Endereço de website não permitido.')
  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (
    (!host.includes('.') && !host.includes(':')) ||
    /(?:^|\.)(localhost|local|internal|test|invalid)$/.test(host)
  )
    throw new Error('Endereço de website não público.')
  if (ipaddr.isValid(host) && !isPublicAddress(host))
    throw new Error('Endereço de website não público.')
  return url
}

export async function publicAddresses(url: URL): Promise<ResolvedAddress[]> {
  const hostname = url.hostname.replace(/^\[|\]$/g, '')
  if (ipaddr.isValid(hostname)) {
    if (!isPublicAddress(hostname)) {
      throw new Error(`Endereço privado bloqueado por política de segurança (SSRF): ${hostname}`)
    }
    const family = ipaddr.process(hostname).kind() === 'ipv6' ? 'IPv6' : 'IPv4'
    return [{ address: hostname, family }]
  }

  let addresses: { address: string; family: number }[]
  try {
    addresses = await Promise.race([
      lookup(hostname, { all: true }),
      new Promise<never>((_, reject) => {
        const timer = setTimeout(() => reject(new Error('Timeout DNS.')), 5000)
        timer.unref?.()
      }),
    ])
  } catch (err: any) {
    const msg = err?.message || ''
    const code = err?.code || ''
    if (
      code === 'ENOTFOUND' ||
      /ENOTFOUND|EAI_NONAME|EAI_NODATA|NXDOMAIN/i.test(msg) ||
      /getaddrinfo ENOTFOUND/i.test(msg)
    ) {
      throw new Error(`Domínio não encontrado no DNS (ENOTFOUND): ${hostname}`)
    }
    throw err
  }

  if (!addresses || !addresses.length) {
    throw new Error(`Domínio não encontrado no DNS (ENOTFOUND): ${hostname}`)
  }

  if (addresses.some((a) => !isPublicAddress(a.address))) {
    throw new Error(`Endereço bloqueado por política de segurança (SSRF): DNS contém endereço não público.`)
  }

  const approved: ResolvedAddress[] = addresses.map((a) => ({
    address: a.address,
    family: a.family === 6 ? 'IPv6' : 'IPv4',
  }))

  return approved
}

export async function publicAddress(url: URL): Promise<string> {
  const list = await publicAddresses(url)
  return list[0].address
}

export interface FetchWebsiteResult {
  url: string
  body: string
  status: number
  type: string
  bodyTruncated?: boolean
  address?: string
  addressFamily?: 'IPv4' | 'IPv6'
  redirectChain?: string[]
  attempts?: IPAttempt[]
  durationMs?: number
  connectionDurationMs?: number
  tlsDurationMs?: number
}

export async function fetchWebsite(
  raw: string,
  redirects = 0,
  deadline = Date.now() + 20000,
  beforeRequest?: (url: URL) => Promise<void>,
  redirectChain: string[] = [],
  previousAttempts: IPAttempt[] = [],
  transport: WebsiteTransport = defaultTransport,
  dnsResolver: (url: URL) => Promise<ResolvedAddress[]> = publicAddresses
): Promise<FetchWebsiteResult> {
  if (redirects > 3) throw new Error('Website excedeu o limite de redirecionamentos.')
  const url = validateWebsiteURL(raw)
  redirectChain.push(url.href)
  if (Date.now() >= deadline) throw new Error('Timeout ao acessar o website.')
  if (beforeRequest) await beforeRequest(url)

  const approvedAddresses = await dnsResolver(url)
  if (!approvedAddresses || !approvedAddresses.length) {
    throw new Error(`Domínio não encontrado no DNS (ENOTFOUND): ${url.hostname}`)
  }
  for (const a of approvedAddresses) {
    if (!isPublicAddress(a.address)) {
      throw new Error('Endereço bloqueado por política de segurança (SSRF): DNS contém endereço não público.')
    }
  }
  const perAddressTimeout = 8000
  const attempts: IPAttempt[] = [...previousAttempts]

  let lastError: any = null
  let response: Awaited<ReturnType<WebsiteTransport['request']>> | null = null
  let usedAddress: string | undefined
  let usedFamily: 'IPv4' | 'IPv6' | undefined
  const fetchStart = Date.now()
  const port = url.port ? parseInt(url.port, 10) : url.protocol === 'https:' ? 443 : 80
  const servername = url.hostname.replace(/^\[|\]$/g, '')

  for (let i = 0; i < approvedAddresses.length; i++) {
    const remaining = deadline - Date.now()
    if (remaining <= 0) {
      if (!lastError) {
        lastError = new Error('Timeout ao acessar o website.')
      }
      break
    }
    const timeout = Math.min(perAddressTimeout, remaining)
    const candidate = approvedAddresses[i]
    const attemptStart = Date.now()
    try {
      response = await transport.request({
        originalUrl: url,
        approvedAddress: candidate.address,
        approvedFamily: candidate.family,
        port,
        timeout,
        servername,
      })
      usedAddress = candidate.address
      usedFamily = candidate.family
      attempts.push({
        address: candidate.address,
        family: candidate.family,
        durationMs: Date.now() - attemptStart,
      })
      break
    } catch (err: any) {
      lastError = err
      attempts.push({
        address: candidate.address,
        family: candidate.family,
        durationMs: Date.now() - attemptStart,
        error: err?.message || 'Erro desconhecido',
      })
      if (i < approvedAddresses.length - 1) {
        continue
      }
    }
  }

  if (!response) {
    const finalErr = lastError || new Error('Falha ao conectar aos endereços IP aprovados.')
    ;(finalErr as any).attempts = attempts
    throw finalErr
  }

  if ([301, 302, 303, 307, 308].includes(response.status) && response.location) {
    return fetchWebsite(
      new URL(response.location, url).href,
      redirects + 1,
      deadline,
      beforeRequest,
      redirectChain,
      attempts,
      transport,
      dnsResolver
    )
  }

  return {
    url: url.href,
    body: response.body,
    status: response.status,
    type: response.type,
    bodyTruncated: response.bodyTruncated,
    address: usedAddress,
    addressFamily: usedFamily,
    redirectChain,
    attempts,
    durationMs: Date.now() - fetchStart,
    connectionDurationMs: response.connectionDurationMs,
    tlsDurationMs: response.tlsDurationMs,
  }
}
