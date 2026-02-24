'use client';

import { useRouter } from 'next/navigation';
import { createRoute } from '@/config/routes';
import { Pathway, PathwayStatus } from '@/types/pathway.types';

const MAX_VISIBLE_CREDENTIALS = 2;

const STATUS_DOT: Record<PathwayStatus, string> = {
  [PathwayStatus.ACTIVE]: 'bg-green-500',
  [PathwayStatus.DRAFT]: 'bg-yellow-400',
  [PathwayStatus.ARCHIVED]: 'bg-gray-400',
};

const STATUS_LABEL: Record<PathwayStatus, string> = {
  [PathwayStatus.ACTIVE]: 'Active',
  [PathwayStatus.DRAFT]: 'Draft',
  [PathwayStatus.ARCHIVED]: 'Archived',
};

interface PathwaysTableProps {
  pathways: Pathway[];
  isLoading: boolean;
}

export function PathwaysTable({ pathways, isLoading }: PathwaysTableProps) {
  const router = useRouter();

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-4 py-3">Name</th>
              <th scope="col" className="px-4 py-3">Credentials</th>
              <th scope="col" className="px-4 py-3">Participants</th>
              <th scope="col" className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                  </div>
                </td>
              </tr>
            ) : pathways.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                  No pathways found
                </td>
              </tr>
            ) : (
              pathways.map((pathway) => (
                <tr
                  key={pathway.uuid}
                  onClick={() => router.push(createRoute.pathwayDetail(pathway.uuid))}
                  className="border-b border-gray-200 dark:border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <th scope="row" className="px-4 py-2 form-text-normal">
                    <div className="flex items-center">
                      <span className="hover:underline font-semibold text-gray-900">
                        {pathway.name}
                      </span>
                    </div>
                  </th>
                  <td className="px-4 py-2">
                    <CredentialBadges events={pathway.events} />
                  </td>
                  <td className="px-4 py-2 form-text-normal">
                    {pathway.participants?.length || '-'}
                  </td>
                  <td className="px-4 py-2 form-text-normal">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 mr-2 ${STATUS_DOT[pathway.status]} rounded-full`} />
                      {STATUS_LABEL[pathway.status]}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        ) : pathways.length === 0 ? (
          <p className="text-center py-12 text-gray-500 text-sm">No pathways found</p>
        ) : (
          pathways.map((pathway) => (
            <button
              key={pathway.uuid}
              type="button"
              onClick={() => router.push(createRoute.pathwayDetail(pathway.uuid))}
              className="block w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                  {pathway.name}
                </span>
                <div className="flex items-center text-xs">
                  <div className={`w-2 h-2 mr-1.5 ${STATUS_DOT[pathway.status]} rounded-full`} />
                  <span className="text-gray-500">{STATUS_LABEL[pathway.status]}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                <CredentialBadges events={pathway.events} />
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{pathway.participants?.length ?? 0} participants</span>
              </div>
            </button>
          ))
        )}
      </div>
    </>
  );
}

function CredentialBadges({ events }: { events: Pathway['events'] }) {
  return (
    <>
      {events.slice(0, MAX_VISIBLE_CREDENTIALS).map((credential) => (
        <span
          key={credential.uuid}
          className="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
        >
          {credential.name}
        </span>
      ))}
      {events.length > MAX_VISIBLE_CREDENTIALS && (
        <span
          className="inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 cursor-default"
          title={events
            .slice(MAX_VISIBLE_CREDENTIALS)
            .map((c) => c.name)
            .join(', ')}
        >
          +{events.length - MAX_VISIBLE_CREDENTIALS}
        </span>
      )}
    </>
  );
}
