'use client';

import { RecipientCard } from './recipientCard';

interface Recipient {
  uuid: string;
  name: string;
}

interface RecipientGridProps {
  recipients: Recipient[];
  isLoading: boolean;
  error: Error | null;
  search: string;
  slug: string;
}

export function RecipientGrid({ recipients, isLoading, error, search, slug }: RecipientGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600">Failed to load recipients. Please try again.</p>
      </div>
    );
  }

  if (recipients.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-gray-500">
          {search ? `No recipients found for "${search}"` : 'No recipients available yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {recipients.map((recipient) => (
        <RecipientCard
          key={recipient.uuid}
          uuid={recipient.uuid}
          name={recipient.name}
          href={`/public/company/${slug}/recipients/${recipient.uuid}`}
        />
      ))}
    </div>
  );
}
