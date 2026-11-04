export type SignedContractDownloadInput = {
  id: string
  signedDocumentPath: string | null
}

export function getSignedContractDownload(contract: SignedContractDownloadInput) {
  if (!contract.signedDocumentPath) return null

  return {
    storagePath: contract.signedDocumentPath,
    fileName: `contrato-assinado-${contract.id}.pdf`,
  }
}
