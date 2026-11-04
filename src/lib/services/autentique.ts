const AUTENTIQUE_GRAPHQL_URL = 'https://api.autentique.com.br/v2/graphql'

type AutentiqueGraphQLError = {
  message?: string
}

type AutentiqueCreateDocumentPayload = {
  data?: {
    createDocument?: {
      id?: string
      signatures?: Array<{
        public_id?: string
        name?: string | null
        email?: string | null
        delivery_method?: string | null
        email_events?: {
          sent?: string | null
        } | null
        link?: {
          short_link?: string | null
        } | null
      }>
    }
  }
  errors?: AutentiqueGraphQLError[]
}

export type AutentiqueEnvironment = 'sandbox' | 'production'

export type AutentiqueDocumentRequest = {
  documentName: string
  message: string
  fileName: string
  pdfBytes: Uint8Array
  signer: {
    name: string
    email: string
  }
}

export type AutentiqueDocumentResult = {
  documentId: string
  signerId: string
  signingUrl: string
}

export class AutentiqueApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AutentiqueApiError'
  }
}

function assertServerRuntime() {
  if (typeof window !== 'undefined') {
    throw new AutentiqueApiError('O cliente Autentique só pode ser executado no servidor.')
  }
}

function getConfig() {
  assertServerRuntime()
  const token = process.env.AUTENTIQUE_API_TOKEN?.trim()
  const envValue = process.env.AUTENTIQUE_ENV?.trim().toLowerCase()

  if (!token) {
    throw new AutentiqueApiError('AUTENTIQUE_API_TOKEN não está configurado no servidor.')
  }

  if (envValue !== 'sandbox' && envValue !== 'production') {
    throw new AutentiqueApiError('AUTENTIQUE_ENV deve ser "sandbox" ou "production".')
  }

  return {
    token,
    environment: envValue as AutentiqueEnvironment,
  }
}

function firstGraphQLError(payload: AutentiqueCreateDocumentPayload | null) {
  return payload?.errors?.find((error) => error.message)?.message || null
}

function createMultipartBody(request: AutentiqueDocumentRequest, sandbox: boolean) {
  const form = new FormData()
  const pdfBuffer = new ArrayBuffer(request.pdfBytes.byteLength)
  new Uint8Array(pdfBuffer).set(request.pdfBytes)
  const operations = {
    query: `
      mutation CreateDocumentMutation(
        $document: DocumentInput!
        $signers: [SignerInput!]!
        $file: Upload!
        $sandbox: Boolean!
      ) {
        createDocument(
          document: $document
          signers: $signers
          file: $file
          sandbox: $sandbox
        ) {
          id
          signatures {
            public_id
            name
            email
            delivery_method
            link {
              short_link
            }
            email_events {
              sent
            }
          }
        }
      }
    `,
    variables: {
      document: {
        name: request.documentName,
        message: request.message,
        refusable: true,
        stop_on_rejected: true,
      },
      signers: [
        {
          name: request.signer.name,
          email: request.signer.email,
          action: 'SIGN',
          delivery_method: 'DELIVERY_METHOD_LINK',
        },
      ],
      file: null,
      sandbox,
    },
  }

  form.append('operations', JSON.stringify(operations))
  form.append('map', JSON.stringify({ '0': ['variables.file'] }))
  form.append(
    '0',
    new Blob([pdfBuffer], { type: 'application/pdf' }),
    request.fileName
  )

  return form
}

export async function createAutentiqueDocument(
  request: AutentiqueDocumentRequest
): Promise<AutentiqueDocumentResult> {
  if (!request.pdfBytes.byteLength) {
    throw new AutentiqueApiError('O PDF do contrato está vazio.')
  }

  if (!request.signer.name.trim() || !request.signer.email.trim()) {
    throw new AutentiqueApiError('O nome e o e-mail do signatário do cliente são obrigatórios.')
  }

  const { token, environment } = getConfig()
  const normalizedEmail = request.signer.email.trim().toLowerCase()
  const response = await fetch(AUTENTIQUE_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: createMultipartBody(request, environment === 'sandbox'),
  })

  const payload = (await response.json().catch(() => null)) as AutentiqueCreateDocumentPayload | null
  const apiError = firstGraphQLError(payload)
  if (!response.ok || apiError) {
    throw new AutentiqueApiError(
      apiError || `Não foi possível enviar o contrato ao Autentique (HTTP ${response.status}).`
    )
  }

  const document = payload?.data?.createDocument
  // The provider may return an internal owner signer before the customer signer.
  // DELIVERY_METHOD_LINK guarantees a short link for the customer signer while
  // preserving its e-mail identity.
  const signer = document?.signatures?.find(
    (candidate) => candidate.email?.trim().toLowerCase() === normalizedEmail
      && Boolean(candidate.link?.short_link)
  )
  const documentId = document?.id?.trim()
  const signerId = signer?.public_id?.trim()
  const signingUrl = signer?.link?.short_link?.trim()

  if (!documentId || !signerId || !signingUrl) {
    throw new AutentiqueApiError(
      'O Autentique não retornou os identificadores e o link do signatário esperado.'
    )
  }

  return { documentId, signerId, signingUrl }
}

export async function downloadSignedAutentiqueDocument(documentId: string): Promise<Uint8Array> {
  if (!documentId.trim()) {
    throw new AutentiqueApiError('O identificador do documento Autentique é obrigatório.')
  }

  const { token } = getConfig()
  const response = await fetch(AUTENTIQUE_GRAPHQL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: `
        query SignedDocument($id: UUID!) {
          document(id: $id) {
            files {
              signed
            }
          }
        }
      `,
      variables: { id: documentId },
    }),
  })

  const payload = await response.json().catch(() => null) as {
    data?: { document?: { files?: { signed?: string | null } | null } | null }
    errors?: AutentiqueGraphQLError[]
  } | null
  const apiError = payload?.errors?.find((error) => error.message)?.message
  const signedUrl = payload?.data?.document?.files?.signed

  if (!response.ok || apiError || !signedUrl) {
    throw new AutentiqueApiError(
      apiError || 'O Autentique não retornou a URL do documento assinado.'
    )
  }

  const signedFileResponse = await fetch(signedUrl)
  if (!signedFileResponse.ok) {
    throw new AutentiqueApiError(
      `Não foi possível baixar o documento assinado do Autentique (HTTP ${signedFileResponse.status}).`
    )
  }

  const pdfBytes = new Uint8Array(await signedFileResponse.arrayBuffer())
  if (!pdfBytes.byteLength) {
    throw new AutentiqueApiError('O documento assinado retornado pelo Autentique está vazio.')
  }

  return pdfBytes
}

/** Expire the signing deadline. deleteDocument only moves signed documents to trash. */
export async function blockAutentiqueDocument(documentId: string, clientSignerId: string) {
  if (!documentId.trim() || !clientSignerId.trim()) throw new AutentiqueApiError('Documento e signatário do cliente são obrigatórios para inutilização segura.')
  const { token } = getConfig()
  type DocumentState = { id: string; deadline_at?: string | null; signatures?: Array<{ public_id?: string; signed?: { created_at?: string } | null }> }
  const request = async (query: string, variables: Record<string, unknown>) => {
    const response = await fetch(AUTENTIQUE_GRAPHQL_URL, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(15000),
    })
    const payload = await response.json() as { data?: { document?: DocumentState; updateDocument?: DocumentState }; errors?: AutentiqueGraphQLError[] }
    if (!response.ok || payload.errors?.length) throw new AutentiqueApiError(payload.errors?.[0]?.message || 'Não foi possível inutilizar o documento no Autentique.')
    return payload.data
  }
  const query = 'query ContractSigningState($id:UUID!){document(id:$id){id deadline_at signatures{public_id signed{created_at}}}}'
  const normalize = (id: string) => id.replace(/-/g, '').toLowerCase()
  const assertUnsigned = (document?: DocumentState) => {
    if (!document || document.id !== documentId) throw new AutentiqueApiError('O Autentique não confirmou a identidade do documento.')
    const client = document.signatures?.find(signer => normalize(signer.public_id || '') === normalize(clientSignerId))
    if (!client) throw new AutentiqueApiError('O signatário do cliente não foi encontrado no Autentique.')
    if (client.signed?.created_at) throw new AutentiqueApiError('O cliente já assinou o contrato. Não é possível alterar a condição contratada.')
  }
  const before = await request(query, { id: documentId })
  assertUnsigned(before?.document)
  const deadline = new Date(Date.now() - 1000).toISOString()
  const updated = await request('mutation BlockContract($id:UUID!,$document:UpdateDocumentInput!){updateDocument(id:$id,document:$document){id deadline_at}}',
    { id: documentId, document: { deadline_at: deadline } })
  const confirmedDeadline = Date.parse(updated?.updateDocument?.deadline_at || '')
  if (!Number.isFinite(confirmedDeadline) || confirmedDeadline > Date.now()) {
    throw new AutentiqueApiError('O Autentique não confirmou o bloqueio do link de assinatura.')
  }
  const after = await request(query, { id: documentId })
  assertUnsigned(after?.document)
}
