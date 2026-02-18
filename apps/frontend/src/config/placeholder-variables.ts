import type { PlaceholderKey } from '@/types/design.types';

export interface PlaceholderVariable {
  key: PlaceholderKey;
  label: string;
  template: string;
  sampleValue: string;
}

export const PLACEHOLDER_VARIABLES: PlaceholderVariable[] = [
  {
    key: 'recipient.name',
    label: 'Recipient Name',
    template: '{{name}}',
    sampleValue: 'John Doe',
  },
  {
    key: 'recipient.email',
    label: 'Recipient Email',
    template: '{{email}}',
    sampleValue: 'john@example.com',
  },
  {
    key: 'credential.id',
    label: 'Credential ID',
    template: '{{credential_id}}',
    sampleValue: 'CERT-2026-001',
  },
  {
    key: 'credential.issue_date',
    label: 'Issue Date',
    template: '{{issue_date}}',
    sampleValue: '16 February 2026',
  },
  {
    key: 'credential.expiration_date',
    label: 'Expiration Date',
    template: '{{expiration_date}}',
    sampleValue: '16 February 2027',
  },
  {
    key: 'event.name',
    label: 'Event Name',
    template: '{{event_name}}',
    sampleValue: 'Advanced React Workshop',
  },
];
