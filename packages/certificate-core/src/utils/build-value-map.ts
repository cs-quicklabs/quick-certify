import type { PlaceholderKey } from '../types/design-layout.types';
import type { CertificateGenerationParams } from '../types/certificate-params.types';
import { formatDate } from './format-date';

/**
 * Builds a complete key-to-value map for resolving all certificate placeholders.
 * Used by both the certificate renderer (backend) and the live preview (frontend)
 * to ensure consistent text substitution.
 */
export function buildValueMap(params: CertificateGenerationParams): Record<PlaceholderKey, string> {
  return {
    'recipient.name': params.recipientName,
    'recipient.email': params.recipientEmail,
    'credential.id': params.credentialUuid,
    'credential.issue_date': formatDate(params.issuedDate, 'N/A'),
    'credential.expiration_date': formatDate(params.expirationDate, 'No Expiration'),
    'event.name': params.eventName,
  };
}
