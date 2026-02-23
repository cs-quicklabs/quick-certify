'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { usePathway, usePathwayParticipants, useAddParticipant } from '@/hooks/usePathways';
import { Pagination } from '@/components/ui/pagination';
import { createRoute } from '@/config/routes';
import { PathwayStatus } from '@/types/pathway.types';
import { showSuccessToast } from '@/lib/toast';

interface PathwayDetailPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_BADGE: Record<
  PathwayStatus,
  { dot: string; bg: string; text: string; label: string }
> = {
  [PathwayStatus.ACTIVE]: {
    dot: 'bg-green-500',
    bg: 'bg-green-100',
    text: 'text-green-800',
    label: 'Active',
  },
  [PathwayStatus.DRAFT]: {
    dot: 'bg-yellow-400',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    label: 'Draft',
  },
  [PathwayStatus.ARCHIVED]: {
    dot: 'bg-gray-400',
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    label: 'Archived',
  },
};

const PARTICIPANT_STATUS_STYLE: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  invited: 'bg-yellow-100 text-yellow-800',
};

export default function PathwayDetailPage({ params }: PathwayDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: pathway, isLoading } = usePathway(id);

  const [activeTab, setActiveTab] = useState<'credentials' | 'participants'>('credentials');
  const [expandedIndex, setExpandedIndex] = useState(-1);
  const [showModal, setShowModal] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantPage, setParticipantPage] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce participant search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setParticipantPage(1);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  const { data: participantsData } = usePathwayParticipants(id, {
    page: participantPage,
    limit: 10,
    search: debouncedSearch || undefined,
  });
  const addParticipant = useAddParticipant();

  const participants = participantsData?.data ?? [];
  const participantsMeta = participantsData?.meta;

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

  // Close modal on backdrop click
  useEffect(() => {
    if (!showModal) return;
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowModal(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showModal]);

  if (isLoading) {
    return (
      <main>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </main>
    );
  }

  if (!pathway) {
    return (
      <main>
        <div className="py-12 text-center text-gray-500">Pathway not found.</div>
      </main>
    );
  }

  const statusConfig = STATUS_BADGE[pathway.status] ?? STATUS_BADGE[PathwayStatus.DRAFT];
  const credentials = pathway.events ?? [];

  const finalCredential = {
    name: `${pathway.name} Certification`,
    description: `This certification validates mastery across all credentials in the ${pathway.name} pathway.`,
    image: '',
  };

  return (
    <main>
      {/* Banner Section */}
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="px-4 mx-auto max-w-screen-2xl lg:px-8 pt-4">
          <div className="rounded-sm border border-gray-200 bg-white overflow-hidden">
            <div className="relative">
              <div className="h-32 w-full bg-gradient-to-r from-gray-200 to-gray-300 lg:h-48" />
            </div>

            {/* Title block */}
            <div className="px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl sm:tracking-tight">
                    {pathway.name}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {pathway.description || ''}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    {/* Status badge */}
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-sm ${statusConfig.bg} ${statusConfig.text} border border-green-200`}
                    >
                      <div className={`w-2 h-2 mr-1.5 ${statusConfig.dot} rounded-full`} />
                      {statusConfig.label}
                    </span>

                    {/* Duration */}
                    {pathway.duration && (
                      <span className="text-gray-500 text-sm flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {pathway.duration}
                      </span>
                    )}

                    {/* Participants */}
                    <span className="text-gray-500 text-sm flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                        />
                      </svg>
                      {pathway.participants?.length ?? 0} participants
                    </span>

                    {/* Credentials count */}
                    <span className="text-gray-500 text-sm flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                      {credentials.length} credentials
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(createRoute.pathwayEdit(id))}
                  className="btn-secondary shrink-0 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                    />
                  </svg>
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final Credential Card */}
      <div className="px-4 mx-auto max-w-screen-2xl lg:px-8 mt-4 mb-6">
        <div className="bg-white rounded-sm shadow-md border border-gray-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row">
            {/* Left: Certificate Image */}
            <div className="sm:w-64 lg:w-80 shrink-0 bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
              {finalCredential.image ? (
                <img
                  src={finalCredential.image}
                  alt="Final Credential Certificate"
                  className="rounded-sm w-full max-w-60 object-cover"
                />
              ) : (
                <div className="w-full max-w-60 h-40 bg-gray-200 rounded-sm flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z"
                    />
                  </svg>
                </div>
              )}
            </div>
            {/* Right: Details */}
            <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-sm bg-green-100 text-green-800 border border-green-200">
                  Final Credential
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {finalCredential.name}
              </h2>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {finalCredential.description}
              </p>
              <div className="flex flex-wrap gap-2">
                <button className="btn-primary text-sm">
                  <span className="flex items-center gap-1.5">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    View Credential
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="px-4 mx-auto max-w-screen-2xl lg:px-8 mb-8">
        <div className="bg-white shadow-md rounded-sm border border-gray-200 overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <ul className="flex -mb-px">
              <li>
                <button
                  className={`cursor-pointer ${activeTab === 'credentials' ? 'selected-tab' : 'unselected-tab'}`}
                  onClick={() => setActiveTab('credentials')}
                >
                  Credentials
                  <span
                    className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-sm ${
                      activeTab === 'credentials'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {credentials.length}
                  </span>
                </button>
              </li>
              <li>
                <button
                  className={`cursor-pointer ${activeTab === 'participants' ? 'selected-tab' : 'unselected-tab'}`}
                  onClick={() => setActiveTab('participants')}
                >
                  Participants
                  <span
                    className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-sm ${
                      activeTab === 'participants'
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {participantsMeta?.total ?? 0}
                  </span>
                </button>
              </li>
            </ul>
          </div>

          {/* Credentials Tab */}
          {activeTab === 'credentials' && (
            <div className="p-4 sm:p-6">
              <div className="mb-4">
                <h3 className="form-title">Pathway Credentials</h3>
                <p className="form-subtitle">
                  Complete these credentials in order to earn the final certification.
                </p>
              </div>

              {/* Timeline / Stepper */}
              <ol className="relative border-l-2 border-gray-200 ml-4 sm:ml-6">
                {credentials.map((credential, index) => (
                  <li
                    key={credential.uuid}
                    className={`mb-0 ml-6 sm:ml-8 ${index === credentials.length - 1 ? '' : 'pb-8'}`}
                  >
                    {/* Step number circle */}
                    <span
                      className={`absolute -left-4 flex items-center justify-center w-7 h-7 rounded-full ring-4 ring-white ${
                        expandedIndex === index
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <span className="text-xs font-semibold">{index + 1}</span>
                    </span>

                    {/* Credential Card (Accordion) */}
                    <div className="border border-gray-200 rounded-sm overflow-hidden bg-white hover:shadow-sm transition-shadow">
                      {/* Accordion Header */}
                      <button
                        type="button"
                        className="cursor-pointer w-full text-left px-4 py-3 flex items-center gap-3 sm:gap-4 hover:bg-gray-50"
                        onClick={() => toggleAccordion(index)}
                      >
                        {/* Placeholder thumbnail */}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-gray-200 shrink-0 border border-gray-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-500">
                            {index + 1}
                          </span>
                        </div>

                        {/* Name & Summary */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {credential.name}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            Credential {index + 1} of {credentials.length}
                          </p>
                        </div>

                        {/* Chevron */}
                        <svg
                          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
                            expandedIndex === index ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </button>

                      {/* Accordion Body */}
                      {expandedIndex === index && (
                        <div className="border-t border-gray-200 px-4 py-4 bg-gray-50/50">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-32 h-24 rounded-sm bg-gray-200 border border-gray-100 flex items-center justify-center shrink-0">
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                {credential.name} - Credential details will be available when backend is connected.
                              </p>
                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <svg
                                    className="w-3.5 h-3.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"
                                    />
                                  </svg>
                                  Step {index + 1} of {credentials.length}
                                </span>
                              </div>
                              <div className="mt-3">
                                <button className="text-primary-600 hover:text-primary-700 text-xs font-medium">
                                  View credential details &rarr;
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Participants Tab */}
          {activeTab === 'participants' && (
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
                  <button
                    className="btn-primary whitespace-nowrap"
                    onClick={() => setShowModal(true)}
                  >
                    Add Participant
                  </button>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden sm:block border border-gray-200 rounded-sm overflow-hidden">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-medium text-xs uppercase text-gray-500">
                        Name
                      </th>
                      <th className="px-4 py-3 font-medium text-xs uppercase text-gray-500">
                        Email
                      </th>
                      <th className="px-4 py-3 font-medium text-xs uppercase text-gray-500">
                        Status
                      </th>
                      <th className="px-4 py-3 font-medium text-xs uppercase text-gray-500">
                        Action
                      </th>
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
                              className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-sm capitalize ${
                                PARTICIPANT_STATUS_STYLE[participant.status] ?? 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {participant.status}
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
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No participants yet.
                  </div>
                ) : (
                  participants.map((participant) => (
                    <div key={participant.id} className="px-4 py-3 bg-white hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {participant.recipient.name}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-sm capitalize ${
                            PARTICIPANT_STATUS_STYLE[participant.status] ?? 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {participant.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{participant.recipient.email}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Participant Pagination */}
              {participantsMeta && participantsMeta.totalPages > 1 && (
                <div className="mt-4">
                  <Pagination
                    currentPage={participantsMeta.page}
                    totalPages={participantsMeta.totalPages}
                    onPageChange={setParticipantPage}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Participant Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            ref={modalRef}
            className="relative w-full max-w-md bg-white rounded-sm shadow-lg"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Participant</h3>
              <button
                className="cursor-pointer p-1 rounded-sm hover:bg-gray-100"
                onClick={() => setShowModal(false)}
              >
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 14 14"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form
              className="p-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!participantName.trim() || !participantEmail.trim()) return;
                addParticipant.mutate(
                  {
                    pathwayUuid: id,
                    name: participantName.trim(),
                    email: participantEmail.trim(),
                  },
                  {
                    onSuccess: () => {
                      showSuccessToast('Participant added successfully');
                      setParticipantName('');
                      setParticipantEmail('');
                      setShowModal(false);
                    },
                  },
                );
              }}
            >
              <div>
                <label htmlFor="participant-name" className="form-input-label">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="participant-name"
                  type="text"
                  required
                  className="form-input-field w-full"
                  placeholder="Enter full name"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="participant-email" className="form-input-label">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="participant-email"
                  type="email"
                  required
                  className="form-input-field w-full"
                  placeholder="name@company.com"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                />
                <p className="form-input-description">
                  An invitation will be sent to this email address.
                </p>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={addParticipant.isPending}
                >
                  {addParticipant.isPending ? 'Adding...' : 'Send Invite'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
