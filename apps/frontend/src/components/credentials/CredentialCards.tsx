'use client';

import { useRouter } from 'next/navigation';
import { createRoute } from '@/config/routes';
import { Credential } from '@/types/credential.types';
import { CredentialStatusBadge } from './CredentialStatusBadge';
import { formatDate } from './CredentialLayout';

interface CredentialCardsProps {
  credentials: Credential[];
  isLoading: boolean;
}

export function CredentialCards({ credentials, isLoading }: CredentialCardsProps) {
  const router = useRouter();

  return (
    <div className="sm:hidden divide-y divide-gray-200">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        </div>
      ) : credentials.length === 0 ? (
        <p className="text-center py-12 text-gray-500 text-sm">No credentials found</p>
      ) : (
        credentials.map((item) => (
          <div key={item.uuid} className="block px-4 py-2 hover:bg-gray-50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-sm text-gray-900">{item.recipient?.name}</span>
              <CredentialStatusBadge status={item.status} />
            </div>
            <p className="text-xs text-gray-500 mb-2">{item.recipient?.email}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>
                {item.event ? (
                  <button
                    onClick={() => router.push(createRoute.eventDetail(item.event!.uuid))}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    {item.event.name}
                  </button>
                ) : (
                  '--'
                )}
              </span>
              <span>{formatDate(item.issued_date)}</span>
              <a
                href={createRoute.publicCredential(item.uuid)}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-blue-600 hover:underline font-medium"
              >
                View
              </a>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
