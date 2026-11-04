export interface ResolvedAddress {
  address: string
  family: 'IPv4' | 'IPv6'
}

export interface IPAttempt {
  address: string
  family?: 'IPv4' | 'IPv6'
  durationMs: number
  error?: string
}

export interface TransportOptions {
  originalUrl: URL
  approvedAddress: string
  approvedFamily: 'IPv4' | 'IPv6'
  port: number
  timeout: number
  servername: string
  headers?: Record<string, string>
  maxBodyBytes?: number
}

export interface TransportResponse {
  status: number
  location?: string
  type: string
  body: string
  bodyTruncated?: boolean
  headers: Record<string, string | string[] | undefined>
  connectionDurationMs?: number
  tlsDurationMs?: number
  totalDurationMs: number
}

export interface WebsiteTransport {
  request(options: TransportOptions): Promise<TransportResponse>
}

