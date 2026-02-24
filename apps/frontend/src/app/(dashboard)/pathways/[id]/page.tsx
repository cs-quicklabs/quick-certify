'use client';

import { use, useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePathway, usePathwayParticipants, useAddParticipant } from '@/hooks/usePathways';
import { Pagination } from '@/components/ui/pagination';
import { createRoute } from '@/config/routes';
import { PathwayStatus } from '@/types/pathway.types';
import { showSuccessToast } from '@/lib/toast';
import {
  Clock,
  Users,
  FileText,
  Pencil,
  ImageIcon,
  Eye,
  ChevronDown,
  ClipboardList,
  ArrowUpDown,
  Check,
  X,
} from 'lucide-react';

interface PathwayDetailPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_BADGE: Record<
  PathwayStatus,
  { dot: string; bg: string; text: string; border: string; label: string }
> = {
  [PathwayStatus.ACTIVE]: {
    dot: 'bg-green-500',
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    label: 'Active',
  },
  [PathwayStatus.DRAFT]: {
    dot: 'bg-yellow-400',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    label: 'Draft',
  },
  [PathwayStatus.ARCHIVED]: {
    dot: 'bg-gray-400',
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    label: 'Archived',
  },
};

const PARTICIPANT_STATUS: Record<string, { style: string; label: string }> = {
  completed: { style: 'bg-green-100 text-green-800', label: 'Completed' },
  in_progress: { style: 'bg-blue-100 text-blue-800', label: 'In Progress' },
  invited: { style: 'bg-yellow-100 text-yellow-800', label: 'Invited' },
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
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);

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

  const sortParams = {
    az: { sortBy: 'name', sortOrder: 'ASC' },
    za: { sortBy: 'name', sortOrder: 'DESC' },
    newest: { sortBy: 'created_at', sortOrder: 'DESC' },
    oldest: { sortBy: 'created_at', sortOrder: 'ASC' },
  }[sortOption];

  const { data: participantsData } = usePathwayParticipants(id, {
    page: participantPage,
    limit: 10,
    search: debouncedSearch || undefined,
    sortBy: sortParams.sortBy,
    sortOrder: sortParams.sortOrder,
  });
  const addParticipant = useAddParticipant();

  const participants = participantsData?.data ?? [];
  const participantsMeta = participantsData?.meta;

  const toggleAccordion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? -1 : index);
  };

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

  // Compute accumulated estimated time from all credentials
  const totalEstimatedTime = useMemo(() => {
    const events = pathway?.events ?? [];
    let totalWeeks = 0;
    for (const event of events) {
      if (event.duration_value && event.duration_type) {
        switch (event.duration_type) {
          case 'day':
            totalWeeks += event.duration_value / 7;
            break;
          case 'week':
            totalWeeks += event.duration_value;
            break;
          case 'month':
            totalWeeks += event.duration_value * 4;
            break;
        }
      }
    }
    if (totalWeeks === 0) return null;
    if (totalWeeks >= 4) {
      const months = Math.round(totalWeeks / 4);
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    const weeks = Math.round(totalWeeks);
    return `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }, [pathway?.events]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 lg:py-12 lg:px-8">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (!pathway) {
    return (
      <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 lg:py-12 lg:px-8">
        <div className="text-center py-20">
          <p className="text-gray-500">Pathway not found.</p>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_BADGE[pathway.status] ?? STATUS_BADGE[PathwayStatus.DRAFT];
  const credentials = [...(pathway.events ?? [])].sort(
    (a, b) => (a.pathway_event?.order ?? 0) - (b.pathway_event?.order ?? 0),
  );

  const finalEvent = credentials.find((c) => c.pathway_event?.is_final);
  const finalCredential = {
    name: finalEvent?.name ?? `${pathway.name} Certification`,
    description: finalEvent
      ? `Complete all required credentials to earn the ${finalEvent.name} certification.`
      : `This certification validates mastery across all credentials in the ${pathway.name} pathway.`,
    image: finalEvent?.design?.url ?? '',
  };

  return (
    <main>
      {/* Banner Section */}
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="px-4 mx-auto max-w-screen-2xl lg:px-8 pt-4">
          <div className="rounded-sm border border-gray-200 bg-white overflow-hidden">
            <div className="relative">
              {pathway.banner_url ? (
                <img
                  src={pathway.banner_url}
                  alt={`${pathway.name} banner`}
                  className="h-32 w-full object-cover lg:h-48"
                />
              ) : (
                <div className="h-32 w-full bg-gradient-to-r from-gray-200 to-gray-300 lg:h-48" />
              )}
            </div>

            {/* Title block */}
            <div className="px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl sm:tracking-tight">
                    {pathway.name}
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">{pathway.description || ''}</p>
                  <div className="flex flex-wrap items-center gap-3 mt-3">
                    {/* Status badge */}
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-sm ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}
                    >
                      <div className={`w-2 h-2 mr-1.5 ${statusConfig.dot} rounded-full`} />
                      {statusConfig.label}
                    </span>

                    {/* Estimated Time */}
                    {totalEstimatedTime && (
                      <span className="text-gray-500 text-sm flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {totalEstimatedTime}
                      </span>
                    )}

                    {/* Participants */}
                    <span className="text-gray-500 text-sm flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      {participantsMeta?.total ?? pathway.participants?.length ?? 0} participants
                    </span>

                    {/* Credentials count */}
                    <span className="text-gray-500 text-sm flex items-center gap-1.5">
                      <FileText className="w-4 h-4" />
                      {credentials.length} credentials
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => router.push(createRoute.pathwayEdit(id))}
                  className="btn-secondary shrink-0 flex items-center"
                >
                  <Pencil className="w-4 h-4 mr-1.5" />
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
                  <ImageIcon className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
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
                    <Eye className="w-4 h-4" />
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
        <div className="bg-white shadow-md rounded-sm border border-gray-200">
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
                        {/* Credential thumbnail */}
                        {credential.design?.url ? (
                          <img
                            src={credential.design.url}
                            alt={credential.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm shrink-0 border border-gray-100 object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-gray-200 shrink-0 border border-gray-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-500">{index + 1}</span>
                          </div>
                        )}

                        {/* Name & Description */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 truncate">
                            {credential.name}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {credential.description ||
                              `Credential ${index + 1} of ${credentials.length}`}
                          </p>
                        </div>

                        {/* Duration */}
                        {credential.duration_value && credential.duration_type && (
                          <span className="shrink-0 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-md hidden sm:block">
                            {credential.duration_value} {credential.duration_type}
                            {credential.duration_value > 1 ? 's' : ''}
                          </span>
                        )}

                        {/* Chevron */}
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
                            expandedIndex === index ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Accordion Body */}
                      {expandedIndex === index && (
                        <div className="border-t border-gray-200 px-4 py-4 bg-gray-50/50">
                          <div className="flex flex-col sm:flex-row gap-4">
                            {credential.design?.url ? (
                              <img
                                src={credential.design.url}
                                alt={credential.name}
                                className="w-full sm:w-32 h-24 rounded-sm border border-gray-100 object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-full sm:w-32 h-24 rounded-sm bg-gray-200 border border-gray-100 flex items-center justify-center shrink-0">
                                <ImageIcon className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                              </div>
                            )}
                            <div className="flex-1">
                              {credential.description && (
                                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                  {credential.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                {credential.duration_value && credential.duration_type && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    Duration: {credential.duration_value} {credential.duration_type}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <ClipboardList className="w-3.5 h-3.5" />
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
                                {sortOption === opt.value && (
                                  <Check className="w-4 h-4 text-primary-600" />
                                )}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

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
                            <span className="font-medium text-gray-900">
                              {participant.recipient.name}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-gray-500">
                            {participant.recipient.email}
                          </td>
                          <td className="px-4 py-2.5">
                            <span
                              className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-sm ${
                                PARTICIPANT_STATUS[participant.status]?.style ??
                                'bg-gray-100 text-gray-800'
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
                          className={`text-xs font-medium px-2 py-0.5 rounded-sm ${
                            PARTICIPANT_STATUS[participant.status]?.style ??
                            'bg-gray-100 text-gray-800'
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
          <div ref={modalRef} className="relative w-full max-w-md bg-white rounded-sm shadow-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Participant</h3>
              <button
                className="cursor-pointer p-1 rounded-sm hover:bg-gray-100"
                onClick={() => setShowModal(false)}
              >
                <X className="w-4 h-4 text-gray-500" />
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
                <button type="submit" className="btn-primary" disabled={addParticipant.isPending}>
                  {addParticipant.isPending ? 'Adding...' : 'Send Invite'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
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
