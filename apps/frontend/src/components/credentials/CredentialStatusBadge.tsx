'use client';

import { CredentialStatus } from '@/types/credential.types';

export const STATUS_CONFIG: Record<
  CredentialStatus,
  { label: string; dotColor: string; textColor: string }
> = {
  [CredentialStatus.ISSUED]: {
    label: 'Issued',
    dotColor: 'bg-green-500',
    textColor: 'text-green-700',
  },
  [CredentialStatus.PENDING]: {
    label: 'Pending',
    dotColor: 'bg-yellow-400',
    textColor: 'text-yellow-700',
  },
  [CredentialStatus.PROCESSING]: {
    label: 'Processing',
    dotColor: 'bg-blue-500',
    textColor: 'text-blue-700',
  },
  [CredentialStatus.FAILED]: {
    label: 'Failed',
    dotColor: 'bg-red-500',
    textColor: 'text-red-700',
  },
  [CredentialStatus.DRAFT]: {
    label: 'Draft',
    dotColor: 'bg-gray-400',
    textColor: 'text-gray-500',
  },
};

interface CredentialStatusBadgeProps {
  status: CredentialStatus;
}

export function CredentialStatusBadge({ status }: CredentialStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${config.textColor}`}>
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
}
