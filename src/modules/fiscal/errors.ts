export class FiscalError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly retryable = false,
    public readonly ambiguousSubmission = false,
  ) {
    super(message)
    this.name = 'FiscalError'
  }
}

/** Provider bodies, credentials and customer data never appear in persisted errors or UI responses. */
export function safeFiscalError(error: unknown): FiscalError {
  return error instanceof FiscalError ? error : new FiscalError('FISCAL_INTERNAL_ERROR', 'Não foi possível processar a nota fiscal. Tente novamente.', true)
}
