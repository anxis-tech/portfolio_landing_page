import { FiscalError } from './errors'
import type { FiscalProvider, FiscalProviderInvoice } from './types'

/**
 * Fiscal Contora is the selected provider, but its A1 certificate and fiscal
 * parameters have not been configured. Every transmission method fails closed.
 * The provider can be replaced with a real adapter after its contract is confirmed.
 */
export class FiscalContoraProvider implements FiscalProvider {
  getConfigurationState(): 'configuration_required' { return 'configuration_required' }

  private unavailable(): never {
    throw new FiscalError('PROVIDER_CONFIGURATION_REQUIRED', 'Configure certificado A1 e parâmetros fiscais da Fiscal Contora antes de transmitir a NFS-e.')
  }

  async validateIssuerConfiguration(): Promise<void> { this.unavailable() }
  async issueInvoice(): Promise<FiscalProviderInvoice> { this.unavailable() }
  async findInvoice(): Promise<FiscalProviderInvoice | null> { this.unavailable() }
  async getInvoice(): Promise<FiscalProviderInvoice> { this.unavailable() }
  async cancelInvoice(): Promise<void> { this.unavailable() }
  async getPdf(): Promise<Uint8Array> { this.unavailable() }
  async getXml(): Promise<Uint8Array> { this.unavailable() }
  async getCertificateStatus(): Promise<{ status: 'missing' }> { return { status: 'missing' } }
}
