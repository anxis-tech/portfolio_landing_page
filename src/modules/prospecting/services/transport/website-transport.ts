import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import net from 'node:net'
import tls from 'node:tls'
import { Buffer } from 'node:buffer'
import type { TransportOptions, TransportResponse, WebsiteTransport } from './types.ts'

/**
 * Common error classifier for network, TLS, timeout and protocol failures.
 */
export function classifyTransportError(error: any): Error {
  if (!error) return new Error('Falha desconhecida ao acessar o website.')
  const msg = String(error?.message || error)
  const code = String(error?.code || '')
  const name = String(error?.name || '')

  if (/Invalid URL|ERR_INVALID_URL/i.test(msg) || /ERR_INVALID_URL/i.test(code)) {
    return new Error(`Erro de URL do crawler (AUDIT_CLIENT_ERROR): ${msg}`)
  }
  if (msg.startsWith('Timeout') || msg.startsWith('Website excedeu')) {
    return new Error(msg)
  }
  if (
    name === 'ConnectionRefused' ||
    code === 'ECONNREFUSED' ||
    /ECONNREFUSED|connection refused|recusada/i.test(msg)
  ) {
    return new Error('Conexão recusada (ECONNREFUSED) ao acessar o website.')
  }
  if (
    name === 'ConnectionReset' ||
    code === 'ECONNRESET' ||
    /ECONNRESET|connection reset|reiniciada/i.test(msg)
  ) {
    return new Error('Conexão reiniciada (ECONNRESET) ao acessar o website.')
  }
  if (
    name === 'TimedOut' ||
    code === 'ETIMEDOUT' ||
    /ETIMEDOUT|timed out|tempo limite esgotado/i.test(msg)
  ) {
    return new Error('Timeout de conexão (ETIMEDOUT) ao acessar o website.')
  }
  if (
    /CERT_|DEPTH_|SELF_SIGNED|UNABLE_TO_VERIFY|ALTNAME_INVALID/i.test(code) ||
    /certificate|altname|self-signed|expired|unable to verify|bad certificate|invalid peer certificate|unknown issuer/i.test(
      msg
    )
  ) {
    return new Error(`Falha de certificado SSL/TLS (CERTIFICATE_ERROR): ${code || msg}`)
  }
  if (
    /HANDSHAKE|SSL_ERROR_SSL|ERR_SSL_PROTOCOL_ERROR|EPROTO|ECONNABORTED/i.test(code) ||
    /handshake|negociação TLS|SSL alert|protocol error|ssl routine|tls alert/i.test(msg) ||
    /TLS|SSL/i.test(code) ||
    /TLS|SSL/i.test(msg)
  ) {
    return new Error(`Falha de negociação TLS (HANDSHAKE_ERROR): ${code || msg}`)
  }
  return new Error(`Falha de conexão (${code || name || msg}) ao acessar o website.`)
}

// ─────────────────────────────────────────────────────────────────────────────
// DENO EDGE RUNTIME TRANSPORT (Deno.connect + Deno.startTls + Pure Web Standards)
// ─────────────────────────────────────────────────────────────────────────────

function concatUint8Arrays(chunks: Uint8Array[], totalLen?: number): Uint8Array {
  const len = totalLen ?? chunks.reduce((a, b) => a + b.length, 0)
  const res = new Uint8Array(len)
  let offset = 0
  for (const c of chunks) {
    res.set(c, offset)
    offset += c.length
  }
  return res
}

function findHeaderDelimiter(bytes: Uint8Array): { index: number; length: number } | -1 {
  for (let i = 0; i < bytes.length - 1; i++) {
    if (bytes[i] === 10 && bytes[i + 1] === 10) {
      return { index: i, length: 2 }
    }
    if (
      i < bytes.length - 3 &&
      bytes[i] === 13 &&
      bytes[i + 1] === 10 &&
      bytes[i + 2] === 13 &&
      bytes[i + 3] === 10
    ) {
      return { index: i, length: 4 }
    }
  }
  return -1
}

async function writeAll(conn: any, data: Uint8Array): Promise<void> {
  let offset = 0
  while (offset < data.length) {
    const n = await conn.write(data.subarray(offset))
    if (n === null || n === 0) {
      throw new Error('Conexão fechada durante o envio da requisição.')
    }
    offset += n
  }
}

async function decompressStream(
  data: Uint8Array,
  format: 'gzip' | 'deflate',
  maxBytes: number
): Promise<{ bytes: Uint8Array; truncated: boolean }> {
  try {
    const ds = new DecompressionStream(format)
    const stream = new Response(data as any).body!.pipeThrough(ds)
    const reader = stream.getReader()
    const chunks: Uint8Array[] = []
    let total = 0
    let truncated = false
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        if (total + value.length > maxBytes) {
          // Aceita apenas o que cabe dentro do limite
          const remaining = maxBytes - total
          if (remaining > 0) chunks.push(value.slice(0, remaining))
          total = maxBytes
          truncated = true
          try { reader.cancel() } catch {}
          break
        }
        total += value.length
        chunks.push(value)
      }
    }
    return { bytes: concatUint8Arrays(chunks, total), truncated }
  } catch (err: any) {
    // Fallback if data was not compressed or corrupted
    return { bytes: data.slice(0, Math.min(data.length, maxBytes)), truncated: data.length > maxBytes }
  }
}

async function readChunkedBody(
  conn: any,
  initialChunk: Uint8Array,
  maxBodyBytes: number
): Promise<{ bytes: Uint8Array; truncated: boolean }> {
  const chunks: Uint8Array[] = []
  let totalBodyBytes = 0
  let buffer = initialChunk
  const readBuf = new Uint8Array(8192)

  const ensureBytes = async (minBytes: number): Promise<boolean> => {
    while (buffer.length < minBytes) {
      const n = await conn.read(readBuf)
      if (n === null || n === 0) return false
      buffer = concatUint8Arrays([buffer, readBuf.slice(0, n)])
    }
    return true
  }

  const findLineBreak = (): { index: number; length: number } | -1 => {
    for (let i = 0; i < buffer.length; i++) {
      if (buffer[i] === 10) {
        if (i > 0 && buffer[i - 1] === 13) {
          return { index: i - 1, length: 2 }
        }
        return { index: i, length: 1 }
      }
    }
    return -1
  }

  while (true) {
    let lb = findLineBreak()
    while (lb === -1) {
      const hasMore = await ensureBytes(buffer.length + 1)
      if (!hasMore) {
        throw new Error('Conexão encerrada inesperadamente durante a leitura do chunk.')
      }
      lb = findLineBreak()
    }

    const lineBytes = buffer.subarray(0, lb.index)
    const lineStr = new TextDecoder('utf-8').decode(lineBytes).trim()
    buffer = buffer.subarray(lb.index + lb.length)

    if (lineStr === '') continue

    const hexSize = lineStr.split(';')[0].trim()
    const chunkSize = parseInt(hexSize, 16)
    if (isNaN(chunkSize) || chunkSize < 0) {
      throw new Error(`Chunk size inválido: "${hexSize}"`)
    }

    if (chunkSize === 0) {
      // Terminal chunk: read trailer headers until empty line
      while (true) {
        let trailerLb = findLineBreak()
        while (trailerLb === -1) {
          const hasMore = await ensureBytes(buffer.length + 1)
          if (!hasMore) break
          trailerLb = findLineBreak()
        }
        if (trailerLb === -1) break
        const trailerLine = new TextDecoder('utf-8')
          .decode(buffer.subarray(0, trailerLb.index))
          .trim()
        buffer = buffer.subarray(trailerLb.index + trailerLb.length)
        if (trailerLine === '') break
      }
      break
    }

    if (totalBodyBytes + chunkSize > maxBodyBytes) {
      // Truncate: aceitar o que já recebemos e encerrar
      const remaining = maxBodyBytes - totalBodyBytes
      if (remaining > 0 && buffer.length > 0) {
        chunks.push(buffer.slice(0, Math.min(remaining, buffer.length)))
      }
      return { bytes: concatUint8Arrays(chunks, Math.min(totalBodyBytes + chunkSize, maxBodyBytes)), truncated: true }
    }

    const hasChunkData = await ensureBytes(chunkSize)
    if (!hasChunkData && buffer.length < chunkSize) {
      throw new Error('Conexão encerrada antes do término do chunk de dados.')
    }

    const chunkData = buffer.slice(0, chunkSize)
    chunks.push(chunkData)
    totalBodyBytes += chunkSize
    buffer = buffer.subarray(chunkSize)

    // Consume trailing \r\n or \n
    if (buffer.length === 0) await ensureBytes(1)
    if (buffer.length > 0 && buffer[0] === 13) buffer = buffer.subarray(1)
    if (buffer.length === 0) await ensureBytes(1)
    if (buffer.length > 0 && buffer[0] === 10) buffer = buffer.subarray(1)
  }

  return { bytes: concatUint8Arrays(chunks, totalBodyBytes), truncated: false }
}

export class DenoSocketTransport implements WebsiteTransport {
  constructor(private customDeno?: any) {}

  async request(options: TransportOptions): Promise<TransportResponse> {
    const isHttps = options.originalUrl.protocol === 'https:'
    const maxBytes = options.maxBodyBytes ?? 1024 * 1024
    const port = options.port || (isHttps ? 443 : 80)
    const servername = options.servername || options.originalUrl.hostname.replace(/^\[|\]$/g, '')
    const cleanAddress = options.approvedAddress.replace(/^\[|\]$/g, '')

    let tcpDurationMs: number | undefined
    let tlsDurationMs: number | undefined
    const startTime = Date.now()

    let conn: any = null
    let timer: any = null
    let isDone = false

    return new Promise<TransportResponse>(async (resolve, reject) => {
      const safeReject = (err: any) => {
        if (isDone) return
        isDone = true
        if (timer) clearTimeout(timer)
        try {
          conn?.close()
        } catch {}
        reject(classifyTransportError(err))
      }

      const safeResolve = (val: TransportResponse) => {
        if (isDone) return
        isDone = true
        if (timer) clearTimeout(timer)
        try {
          conn?.close()
        } catch {}
        resolve(val)
      }

      timer = setTimeout(() => {
        safeReject(new Error('Timeout ao acessar o website.'))
      }, options.timeout)

      try {
        const denoApi = this.customDeno || (globalThis as any).Deno
        if (!denoApi || typeof denoApi.connect !== 'function') {
          throw new Error('Deno.connect não está disponível neste ambiente.')
        }

        // 1. Conexão TCP direta ao IP aprovado (SSRF seguro)
        const tcpStart = Date.now()
        conn = await denoApi.connect({
          hostname: cleanAddress,
          port: port,
        })
        tcpDurationMs = Date.now() - tcpStart

        // 2. Handshake TLS com hostname original como SNI e validação estrita
        if (isHttps) {
          const tlsStart = Date.now()
          conn = await denoApi.startTls(conn, {
            hostname: servername,
          })
          tlsDurationMs = Date.now() - tlsStart
        }

        // 3. Montar e enviar requisição HTTP/1.1
        const path = (options.originalUrl.pathname || '/') + (options.originalUrl.search || '')
        const reqLines = [
          `GET ${path} HTTP/1.1`,
          `Host: ${options.originalUrl.host}`,
          'User-Agent: AnxisProspecting/1.0 (website audit)',
          'Accept: text/html,application/xhtml+xml,text/plain',
          'Accept-Encoding: gzip, deflate',
          'Connection: close',
        ]
        if (options.headers) {
          for (const [k, v] of Object.entries(options.headers)) {
            if (v !== undefined) {
              reqLines.push(`${k}: ${v}`)
            }
          }
        }
        reqLines.push('', '')
        const reqBytes = new TextEncoder().encode(reqLines.join('\r\n'))
        await writeAll(conn, reqBytes)

        // 4. Ler cabeçalhos HTTP
        const headerChunks: Uint8Array[] = []
        let totalHeaderBytes = 0
        const headerReadBuf = new Uint8Array(4096)
        let headerDelim = -1
        let remainingBodyChunk = new Uint8Array(0)
        let headerStr = ''

        while (true) {
          const combined = concatUint8Arrays(headerChunks, totalHeaderBytes)
          const delimMatch = findHeaderDelimiter(combined)
          if (delimMatch !== -1) {
            headerDelim = delimMatch.index
            const delimLen = delimMatch.length
            remainingBodyChunk = combined.slice(headerDelim + delimLen)
            headerStr = new TextDecoder('utf-8').decode(combined.slice(0, headerDelim))
            break
          }
          if (totalHeaderBytes > 65536) {
            throw new Error('Cabeçalhos HTTP excederam o limite máximo de 64 KB.')
          }
          const n = await conn.read(headerReadBuf)
          if (n === null || n === 0) {
            throw new Error('Conexão encerrada pelo servidor antes dos cabeçalhos.')
          }
          headerChunks.push(headerReadBuf.slice(0, n))
          totalHeaderBytes += n
        }

        // 5. Interpretar Status Line e Headers
        const headerLines = headerStr.split(/\r?\n/)
        const statusLine = headerLines[0] || ''
        const statusMatch = statusLine.match(/^HTTP\/\d(?:\.\d)?\s+(\d{3})(?:\s+(.*))?$/i)
        const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : 0
        const rawHeaders: Record<string, string> = {}

        for (let i = 1; i < headerLines.length; i++) {
          const line = headerLines[i]
          const colonIdx = line.indexOf(':')
          if (colonIdx !== -1) {
            const key = line.slice(0, colonIdx).trim().toLowerCase()
            const val = line.slice(colonIdx + 1).trim()
            if (rawHeaders[key]) {
              rawHeaders[key] += `, ${val}`
            } else {
              rawHeaders[key] = val
            }
          }
        }

        // 6. Ler Corpo conforme Transfer-Encoding / Content-Length
        let bodyBytes: Uint8Array = new Uint8Array(0)
        let bodyTruncated = false
        if (statusCode !== 204 && statusCode !== 304 && statusCode >= 200) {
          const transferEncoding = (rawHeaders['transfer-encoding'] || '').toLowerCase()
          const isChunked = transferEncoding.includes('chunked')
          const contentLengthHeader = rawHeaders['content-length']

          if (isChunked) {
            const result = await readChunkedBody(conn, remainingBodyChunk, maxBytes)
            bodyBytes = result.bytes
            bodyTruncated = result.truncated
          } else if (contentLengthHeader !== undefined) {
            const expectedLen = parseInt(contentLengthHeader, 10)
            if (isNaN(expectedLen) || expectedLen < 0) {
              throw new Error(`Content-Length inválido: ${contentLengthHeader}`)
            }
            if (expectedLen > maxBytes) {
              // Ler apenas até maxBytes e sinalizar truncamento
              bodyTruncated = true
              const toRead = maxBytes
              if (remainingBodyChunk.length >= toRead) {
                bodyBytes = remainingBodyChunk.slice(0, toRead)
              } else {
                const resArr = new Uint8Array(toRead)
                resArr.set(remainingBodyChunk, 0)
                let received = remainingBodyChunk.length
                const bodyBuf = new Uint8Array(Math.min(8192, toRead - received))
                while (received < toRead) {
                  const n = await conn.read(bodyBuf)
                  if (n === null || n === 0) break
                  resArr.set(bodyBuf.subarray(0, n), received)
                  received += n
                }
                bodyBytes = resArr.slice(0, received)
              }
            } else if (expectedLen === 0) {
              bodyBytes = new Uint8Array(0)
            } else if (remainingBodyChunk.length >= expectedLen) {
              bodyBytes = remainingBodyChunk.slice(0, expectedLen)
            } else {
              const resArr = new Uint8Array(expectedLen)
              resArr.set(remainingBodyChunk, 0)
              let received = remainingBodyChunk.length
              const bodyBuf = new Uint8Array(Math.min(8192, expectedLen - received))
              while (received < expectedLen) {
                const n = await conn.read(bodyBuf)
                if (n === null || n === 0) break
                resArr.set(bodyBuf.subarray(0, n), received)
                received += n
              }
              bodyBytes = received === expectedLen ? resArr : resArr.slice(0, received)
            }
          } else {
            // Ler até encerramento de conexão (EOF), truncando ao atingir maxBytes
            const eofChunks: Uint8Array[] = []
            let totalEof = 0
            if (remainingBodyChunk.length > 0) {
              const toAdd = Math.min(remainingBodyChunk.length, maxBytes)
              eofChunks.push(remainingBodyChunk.slice(0, toAdd))
              totalEof += toAdd
              if (remainingBodyChunk.length > maxBytes) {
                bodyTruncated = true
              }
            }
            if (!bodyTruncated) {
              const eofBuf = new Uint8Array(8192)
              while (true) {
                const n = await conn.read(eofBuf)
                if (n === null || n === 0) break
                const available = maxBytes - totalEof
                if (available <= 0) {
                  bodyTruncated = true
                  break
                }
                const toAdd = Math.min(n, available)
                eofChunks.push(eofBuf.slice(0, toAdd))
                totalEof += toAdd
                if (toAdd < n) {
                  bodyTruncated = true
                  break
                }
              }
            }
            bodyBytes = concatUint8Arrays(eofChunks, totalEof)
          }
        }

        // 7. Descompressão se aplicável (gzip / deflate)
        const encoding = (rawHeaders['content-encoding'] || '').toLowerCase().trim()
        if (encoding.includes('gzip')) {
          const result = await decompressStream(bodyBytes, 'gzip', maxBytes)
          bodyBytes = result.bytes
          if (result.truncated) bodyTruncated = true
        } else if (encoding.includes('deflate')) {
          const result = await decompressStream(bodyBytes, 'deflate', maxBytes)
          bodyBytes = result.bytes
          if (result.truncated) bodyTruncated = true
        }

        // Garantia final de limite (nunca excede maxBytes)
        if (bodyBytes.length > maxBytes) {
          bodyBytes = bodyBytes.slice(0, maxBytes)
          bodyTruncated = true
        }

        // 8. Decodificação de Texto com charset apropriado
        let charset = 'utf-8'
        const contentType = rawHeaders['content-type'] || ''
        const charsetMatch = contentType.match(/charset=([\w-]+)/i)
        if (charsetMatch && charsetMatch[1]) {
          const cs = charsetMatch[1].toLowerCase().trim()
          if (['utf-8', 'iso-8859-1', 'windows-1252', 'latin1', 'ascii'].includes(cs)) {
            charset = cs === 'latin1' ? 'iso-8859-1' : cs
          }
        }

        let bodyText = ''
        try {
          bodyText = new TextDecoder(charset, { fatal: false }).decode(bodyBytes)
        } catch {
          bodyText = new TextDecoder('utf-8', { fatal: false }).decode(bodyBytes)
        }

        safeResolve({
          status: statusCode,
          location: rawHeaders['location'],
          type: rawHeaders['content-type'] || '',
          body: bodyText,
          bodyTruncated: bodyTruncated || undefined,
          headers: rawHeaders,
          connectionDurationMs: tcpDurationMs,
          tlsDurationMs: tlsDurationMs,
          totalDurationMs: Date.now() - startTime,
        })
      } catch (err) {
        safeReject(err)
      }
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// NODE.JS TRANSPORT (Fallback para testes locais 'tsx' e SSR)
// ─────────────────────────────────────────────────────────────────────────────

export class NodeSocketTransport implements WebsiteTransport {
  async request(options: TransportOptions): Promise<TransportResponse> {
    const isHttps = options.originalUrl.protocol === 'https:'
    const maxBytes = options.maxBodyBytes ?? 1024 * 1024
    const port = options.port || (isHttps ? 443 : 80)
    const servername = options.servername || options.originalUrl.hostname.replace(/^\[|\]$/g, '')

    let tcpDurationMs: number | undefined
    let tlsDurationMs: number | undefined
    const startTime = Date.now()

    return new Promise<TransportResponse>((resolve, reject) => {
      let isDone = false
      const safeReject = (err: any) => {
        if (isDone) return
        isDone = true
        clearTimeout(timer)
        reject(classifyTransportError(err))
      }

      const safeResolve = (val: TransportResponse) => {
        if (isDone) return
        isDone = true
        clearTimeout(timer)
        resolve(val)
      }

      const timer = setTimeout(() => {
        const timeoutErr = new Error('Timeout ao acessar o website.')
        safeReject(timeoutErr)
        try {
          req.destroy(timeoutErr)
        } catch {}
      }, options.timeout)

      const createConnection = () => {
        const tcpStart = Date.now()
        const rawSocket = net.connect({
          host: options.approvedAddress,
          port: port,
          family: options.approvedFamily === 'IPv6' ? 6 : 4,
        })

        rawSocket.once('connect', () => {
          tcpDurationMs = Date.now() - tcpStart
        })

        if (!isHttps) {
          return rawSocket
        }

        const tlsStart = Date.now()
        const tlsSocket = tls.connect({
          socket: rawSocket,
          servername: servername,
          rejectUnauthorized: true,
        })

        tlsSocket.once('secureConnect', () => {
          tlsDurationMs = Date.now() - tlsStart
        })

        rawSocket.on('error', (err) => {
          try {
            tlsSocket.emit('error', err)
          } catch {}
        })

        return tlsSocket
      }

      const requestFn = isHttps ? httpsRequest : httpRequest
      const path = (options.originalUrl.pathname || '/') + (options.originalUrl.search || '')

      let req: any
      try {
        req = requestFn(
          {
            protocol: options.originalUrl.protocol,
            hostname: servername,
            port: port,
            path: path,
            method: 'GET',
            headers: {
              Host: options.originalUrl.host,
              'User-Agent': 'AnxisProspecting/1.0 (website audit)',
              Accept: 'text/html,text/plain',
              'Accept-Encoding': 'identity',
              Connection: 'close',
              ...(options.headers || {}),
            },
            agent: false,
            createConnection,
          },
          (res) => {
            const chunks: Buffer[] = []
            let receivedBytes = 0
            let truncated = false

            res.on('data', (chunk: Buffer) => {
              try {
                if (truncated) return
                const available = maxBytes - receivedBytes
                if (chunk.length > available) {
                  // Aceitar apenas o que cabe dentro do limite
                  if (available > 0) chunks.push(chunk.slice(0, available))
                  receivedBytes = maxBytes
                  truncated = true
                  try { res.destroy() } catch {}
                  return
                }
                receivedBytes += chunk.length
                chunks.push(chunk)
              } catch (err) {
                safeReject(err)
              }
            })

            res.on('error', (err: any) => {
              safeReject(err)
            })

            res.on('end', () => {
              try {
                const body = Buffer.concat(chunks).toString('utf8')
                const rawHeaders: Record<string, string | string[] | undefined> = { ...res.headers }
                safeResolve({
                  status: res.statusCode ?? 0,
                  location: res.headers.location,
                  type: (res.headers['content-type'] as string) ?? '',
                  body,
                  bodyTruncated: truncated || undefined,
                  headers: rawHeaders,
                  connectionDurationMs: tcpDurationMs,
                  tlsDurationMs: tlsDurationMs,
                  totalDurationMs: Date.now() - startTime,
                })
              } catch (err) {
                safeReject(err)
              }
            })
          }
        )
      } catch (syncErr: any) {
        return safeReject(syncErr)
      }

      req.on('error', (error: any) => {
        safeReject(error)
      })

      req.end()
    })
  }
}

// Alias for backwards compatibility with tests
export const NativeSocketTransport = NodeSocketTransport

// Detect runtime: Supabase Edge Runtime has Deno.connect, Node.js does not
export const defaultTransport: WebsiteTransport =
  typeof (globalThis as any).Deno !== 'undefined' &&
  typeof (globalThis as any).Deno.connect === 'function'
    ? new DenoSocketTransport()
    : new NodeSocketTransport()
