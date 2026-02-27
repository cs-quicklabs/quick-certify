/**
 * Parameters required to generate a certificate image/PDF.
 */
export interface CertificateGenerationParams {
  recipientName: string;
  recipientEmail: string;
  credentialUuid: string;
  issuedDate: string | null;
  expirationDate: string | null;
  eventName: string;
}

/**
 * Result returned after certificate generation.
 */
export interface CertificateGenerationResult {
  imageUrl: string;
  pdfUrl: string;
}
