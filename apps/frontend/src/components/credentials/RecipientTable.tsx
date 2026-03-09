'use client';

import { Trash2, CheckCircle2, XCircle } from 'lucide-react';
import type { RecipientRow } from '@/schemas/credential.schema';

interface RecipientTableProps {
  recipients: RecipientRow[];
  errors: Record<string, string>;
  onRecipientChange: (id: string, field: 'name' | 'email', value: string) => void;
  onRemove: (id: string) => void;
  validateRecipient: (recipient: RecipientRow) => boolean;
}

export function RecipientTable({
  recipients,
  errors,
  onRecipientChange,
  onRemove,
  validateRecipient,
}: RecipientTableProps) {
  return (
    <div className="hidden sm:block border border-gray-200 rounded-md overflow-hidden">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="px-4 py-3 font-medium w-12">#</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium w-24 text-center">Status</th>
            <th className="px-4 py-3 font-medium w-16"></th>
          </tr>
        </thead>
        <tbody>
          {recipients.map((recipient, index) => {
            const isValid = validateRecipient(recipient);
            const isEmpty = !recipient.name && !recipient.email;
            const nameError = errors[`${recipient.id}-name`];
            const emailError = errors[`${recipient.id}-email`];

            return (
              <tr key={recipient.id} className="border-b border-gray-200 last:border-b-0">
                <td className="px-4 py-3 text-gray-400 font-medium">{index + 1}</td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Recipient name"
                    value={recipient.name}
                    maxLength={50}
                    onChange={(e) => onRecipientChange(recipient.id, 'name', e.target.value)}
                    className={`w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:outline-none ${
                      nameError
                        ? 'border-red-400 focus:ring-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:ring-blue-300 focus:border-blue-400'
                    }`}
                  />
                  {nameError && <p className="mt-0.5 text-xs text-red-500">{nameError}</p>}
                </td>
                <td className="px-4 py-2">
                  <input
                    type="email"
                    placeholder="recipient@email.com"
                    value={recipient.email}
                    onChange={(e) => onRecipientChange(recipient.id, 'email', e.target.value)}
                    className={`w-full px-3 py-1.5 text-sm border rounded-md focus:ring-1 focus:outline-none ${
                      emailError
                        ? 'border-red-400 focus:ring-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:ring-blue-300 focus:border-blue-400'
                    }`}
                  />
                  {emailError && <p className="mt-0.5 text-xs text-red-500">{emailError}</p>}
                </td>
                <td className="px-4 py-3 text-center">
                  {isEmpty ? (
                    <span className="text-gray-300">--</span>
                  ) : isValid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400 mx-auto" />
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => onRemove(recipient.id)}
                    disabled={recipients.length <= 1}
                    className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
