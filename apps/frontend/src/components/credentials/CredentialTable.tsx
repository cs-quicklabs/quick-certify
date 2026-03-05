'use client';

import { useRouter } from 'next/navigation';
import { createRoute } from '@/config/routes';
import { Credential } from '@/types/credential.types';
import { CredentialStatusBadge } from './CredentialStatusBadge';
import { formatDate } from './CredentialLayout';

interface CredentialTableProps {
  credentials: Credential[];
  isLoading: boolean;
}

export function CredentialTable({ credentials, isLoading }: CredentialTableProps) {
  const router = useRouter();

  return (
    <div className="hidden sm:block overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-left font-black text-gray-600 bg-gray-50 border-b border-gray-200">
          <tr>
            <th scope="col" className="px-6 py-3 font-medium">
              Name
            </th>
            <th scope="col" className="px-6 py-3 font-medium">
              Email
            </th>
            <th scope="col" className="px-6 py-3 font-medium">
              Events
            </th>
            <th scope="col" className="px-6 py-3 font-medium">
              Issue Date
            </th>
            <th scope="col" className="px-6 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-6 py-3 font-medium">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                </div>
              </td>
            </tr>
          ) : credentials.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                No credentials found
              </td>
            </tr>
          ) : (
            credentials.map((item) => (
              <tr key={item.uuid} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-2 text-gray-900">{item.recipient?.name}</td>
                <td className="px-6 py-3 text-gray-500">{item.recipient?.email}</td>
                <td className="px-6 py-3">
                  {item.event ? (
                    <button
                      onClick={() => router.push(createRoute.eventDetail(item.event!.uuid))}
                      className="text-gray-900 hover:text-blue-600 hover:underline cursor-pointer"
                    >
                      {item.event.name}
                    </button>
                  ) : (
                    <span className="text-gray-400">--</span>
                  )}
                </td>
                <td className="px-6 py-2 text-gray-900">{formatDate(item.issued_date)}</td>
                <td className="px-6 py-2">
                  <CredentialStatusBadge status={item.status} />
                </td>
                <td className="px-6 py-3">
                  <a
                    href={createRoute.credentialDetail(item.uuid)}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(createRoute.credentialDetail(item.uuid));
                    }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
