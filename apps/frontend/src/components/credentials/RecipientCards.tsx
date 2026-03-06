'use client';

import { Trash2, CheckCircle2, XCircle } from 'lucide-react';
import type { RecipientRow } from '@/schemas/credential.schema';

interface RecipientCardsProps {
  recipients: RecipientRow[];
  errors: Record<string, string>;
  onRecipientChange: (id: string, field: 'name' | 'email', value: string) => void;
  onRemove: (id: string) => void;
  validateRecipient: (recipient: RecipientRow) => boolean;
}

export function RecipientCards({
  recipients,
  errors,
  onRecipientChange,
  onRemove,
  validateRecipient,
}: RecipientCardsProps) {
  return (
    <div className="sm:hidden space-y-3">
      {recipients.map((recipient, index) => {
        const isValid = validateRecipient(recipient);
        const isEmpty = !recipient.name && !recipient.email;
        const nameError = errors[`${recipient.id}-name`];
        const emailError = errors[`${recipient.id}-email`];

        return (
          <div key={recipient.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Recipient #{index + 1}</span>
              <div className="flex items-center gap-2">
                {!isEmpty &&
                  (isValid ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  ))}
                <button
                  type="button"
                  onClick={() => onRemove(recipient.id)}
                  disabled={recipients.length <= 1}
                  className="text-gray-400 hover:text-red-500 disabled:opacity-30 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <input
                type="text"
                placeholder="Recipient name"
                value={recipient.name}
                onChange={(e) => onRecipientChange(recipient.id, 'name', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:outline-none ${
                  nameError
                    ? 'border-red-400 focus:ring-red-300'
                    : 'border-gray-200 focus:ring-blue-300'
                }`}
              />
              {nameError && <p className="mt-0.5 text-xs text-red-500">{nameError}</p>}
            </div>
            <div>
              <input
                type="email"
                placeholder="recipient@email.com"
                value={recipient.email}
                onChange={(e) => onRecipientChange(recipient.id, 'email', e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:ring-1 focus:outline-none ${
                  emailError
                    ? 'border-red-400 focus:ring-red-300'
                    : 'border-gray-200 focus:ring-blue-300'
                }`}
              />
              {emailError && <p className="mt-0.5 text-xs text-red-500">{emailError}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
