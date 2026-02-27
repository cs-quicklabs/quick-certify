'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { usePathwayParticipants } from '@/hooks/usePathways';
import { Pagination } from '@/components/ui/pagination';
import { AddParticipantModal } from './AddParticipantModal';
import { ArrowUpDown, Check } from 'lucide-react';

const PARTICIPANT_STATUS: Record<string, { style: string; label: string }> = {
  completed: { style: 'bg-green-100 text-green-800', label: 'Completed' },
  in_progress: { style: 'bg-blue-100 text-blue-800', label: 'In Progress' },
  invited: { style: 'bg-yellow-100 text-yellow-800', label: 'Invited' },
};

interface ParticipantsTabProps {
  pathwayId: string;
}

export function ParticipantsTab({ pathwayId }: ParticipantsTabProps) {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput);
  const [participantPage, setParticipantPage] = useState(1);
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setParticipantPage(1);
  }, [debouncedSearch]);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const sortParams = {
    az: { sortBy: 'name', sortOrder: 'ASC' },
    za: { sortBy: 'name', sortOrder: 'DESC' },
    newest: { sortBy: 'created_at', sortOrder: 'DESC' },
    oldest: { sortBy: 'created_at', sortOrder: 'ASC' },
  }[sortOption];

  const { data: participantsData } = usePathwayParticipants(pathwayId, {
    page: participantPage,
    limit: 10,
    search: debouncedSearch || undefined,
    sortBy: sortParams.sortBy,
    sortOrder: sortParams.sortOrder,
  });

  const participants = participantsData?.data ?? [];
  const participantsMeta = participantsData?.meta;

  return (
    <div className="p-4 sm:p-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="form-title">Participants</h3>
          <p className="form-subtitle">{participantsMeta?.total ?? 0} total participants</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="form-input-field w-full sm:w-56"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          {/* Sort Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              type="button"
              className="btn-secondary flex items-center gap-1.5 whitespace-nowrap"
              onClick={() => setShowSortDropdown((v) => !v)}
            >
              <ArrowUpDown className="w-4 h-4" />
              Sort
            </button>
            {showSortDropdown && (
              <div className="absolute right-0 z-10 mt-1 w-40 bg-white border border-gray-200 rounded-sm shadow-lg dark:bg-gray-700 dark:border-gray-600">
                <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                  {(
                    [
                      { value: 'az', label: 'A-Z' },
                      { value: 'za', label: 'Z-A' },
                      { value: 'newest', label: 'Newest' },
                      { value: 'oldest', label: 'Oldest' },
                    ] as const
                  ).map((opt) => (
                    <li key={opt.value}>
                      <button
                        type="button"
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer flex items-center justify-between ${
                          sortOption === opt.value
                            ? 'font-medium text-primary-600 bg-primary-50 dark:bg-gray-600'
                            : ''
                        }`}
                        onClick={() => {
                          setSortOption(opt.value);
                          setParticipantPage(1);
                          setShowSortDropdown(false);
                        }}
                      >
                        {opt.label}
                        {sortOption === opt.value && <Check className="w-4 h-4 text-primary-600" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button className="btn-primary whitespace-nowrap" onClick={() => setShowModal(true)}>
            Add Participant
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block border border-gray-200 rounded-sm overflow-hidden">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 font-medium text-xs uppercase text-gray-500">Name</th>
              <th className="px-4 py-3 font-medium text-xs uppercase text-gray-500">Email</th>
              <th className="px-4 py-3 font-medium text-xs uppercase text-gray-500">Status</th>
              <th className="px-4 py-3 font-medium text-xs uppercase text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {participants.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                  No participants yet.
                </td>
              </tr>
            ) : (
              participants.map((participant) => (
                <tr key={participant.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-gray-900">{participant.recipient.name}</span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{participant.recipient.email}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-sm ${
                        PARTICIPANT_STATUS[participant.status]?.style ?? 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {PARTICIPANT_STATUS[participant.status]?.label ?? participant.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <button className="text-primary-600 hover:text-primary-700 text-xs font-medium">
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Layout */}
      <div className="sm:hidden divide-y divide-gray-200 border border-gray-200 rounded-sm overflow-hidden">
        {participants.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500">No participants yet.</div>
        ) : (
          participants.map((participant) => (
            <div key={participant.id} className="px-4 py-3 bg-white hover:bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-gray-900">
                  {participant.recipient.name}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-sm ${
                    PARTICIPANT_STATUS[participant.status]?.style ?? 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {PARTICIPANT_STATUS[participant.status]?.label ?? participant.status}
                </span>
              </div>
              <p className="text-xs text-gray-500">{participant.recipient.email}</p>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {participantsMeta && participantsMeta.totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={participantsMeta.page}
            totalPages={participantsMeta.totalPages}
            onPageChange={setParticipantPage}
          />
        </div>
      )}

      <AddParticipantModal
        pathwayId={pathwayId}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
