'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, XCircle, Search, ChevronDown } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { Button } from '@/components/ui/button';
import {
  recipientRowSchema,
  issueCredentialStep1Schema,
  type RecipientRow,
} from '@/schemas/credential.schema';
import type { IssueFormData } from '@/app/(dashboard)/credentials/issue/page';

interface StepCreateCredentialsProps {
  initialData: IssueFormData;
  onContinue: (data: { eventId: string; eventName: string; recipients: RecipientRow[] }) => void;
  onCancel: () => void;
}

export function StepCreateCredentials({
  initialData,
  onContinue,
  onCancel,
}: StepCreateCredentialsProps) {
  const [eventId, setEventId] = useState(initialData.eventId);
  const [eventName, setEventName] = useState(initialData.eventName);
  const [recipients, setRecipients] = useState<RecipientRow[]>(initialData.recipients);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [eventDropdownOpen, setEventDropdownOpen] = useState(false);
  const [eventSearch, setEventSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: eventsData, isLoading: eventsLoading } = useEvents({ limit: 100 });
  const events = eventsData?.data ?? [];

  const filteredEvents = events.filter((e) =>
    e.name.toLowerCase().includes(eventSearch.toLowerCase()),
  );

  // if from redirect- prefill
  useEffect(() => {
    setEventId(initialData.eventId);
    setEventName(initialData.eventName);
    setRecipients(initialData.recipients);
  }, [initialData.eventId, initialData.eventName, initialData.recipients]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setEventDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateRecipient = useCallback((recipient: RecipientRow) => {
    const result = recipientRowSchema.safeParse(recipient);
    return result.success;
  }, []);

  const handleRecipientChange = useCallback(
    (id: string, field: 'name' | 'email', value: string) => {
      setRecipients((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
      // Clear error for this field
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${id}-${field}`];
        return newErrors;
      });
    },
    [],
  );

  const addRecipient = useCallback(() => {
    setRecipients((prev) => [...prev, { id: crypto.randomUUID(), name: '', email: '' }]);
  }, []);

  const removeRecipient = useCallback(
    (id: string) => {
      if (recipients.length <= 1) return;
      setRecipients((prev) => prev.filter((r) => r.id !== id));
    },
    [recipients.length],
  );

  const handleSelectEvent = useCallback((uuid: string, name: string) => {
    setEventId(uuid);
    setEventName(name);
    setEventDropdownOpen(false);
    setEventSearch('');
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.eventId;
      return newErrors;
    });
  }, []);

  const handleContinue = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!eventId) {
      newErrors.eventId = 'Please select an event';
    }

    // Validate each recipient
    recipients.forEach((r) => {
      const result = recipientRowSchema.safeParse(r);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          newErrors[`${r.id}-${field}`] = issue.message;
        });
      }
    });

    // Check for duplicate emails
    const emailSet = new Set<string>();
    recipients.forEach((r) => {
      if (r.email) {
        const lower = r.email.toLowerCase();
        if (emailSet.has(lower)) {
          newErrors[`${r.id}-email`] = 'Duplicate email address';
        }
        emailSet.add(lower);
      }
    });

    // Check overall step1 validation
    const step1Result = issueCredentialStep1Schema.safeParse({ eventId, recipients });
    if (!step1Result.success && !newErrors.eventId) {
      step1Result.error.issues.forEach((issue) => {
        if (issue.path[0] === 'eventId') {
          newErrors.eventId = issue.message;
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onContinue({ eventId, eventName, recipients });
  }, [eventId, eventName, recipients, onContinue]);

  const hasValidRecipients = recipients.some((r) => validateRecipient(r));
  const canContinue = !!eventId && hasValidRecipients;

  return (
    <div className="bg-white shadow-md dark:bg-gray-800 sm:rounded-sm">
      {/* Header */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200 dark:border-gray-700">
        <h1 className="form-title">Issue Credentials</h1>
        <p className="form-subtitle">
          Select an event and add the recipients who will receive credentials.
        </p>
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        {/* Event Selection */}
        <div>
          <label className="form-input-label">
            Event <span className="text-red-500">*</span>
          </label>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setEventDropdownOpen(!eventDropdownOpen)}
              className={`w-full text-left bg-gray-50 border text-sm rounded-sm px-3 py-2.5 pr-10 cursor-pointer focus:ring-primary-600 focus:border-primary-600 focus:outline-none ${
                errors.eventId
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300'
              }`}
            >
              <span className={`capitalize ${eventId ? 'text-gray-900' : 'text-gray-400'}`}>
                {eventName || 'Select an event...'}
              </span>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </button>

            {eventDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                {/* Search input */}
                <div className="p-2 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-300 focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Event list */}
                <div className="max-h-60 overflow-y-auto p-1">
                  {eventsLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                    </div>
                  ) : filteredEvents.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      {eventSearch ? 'No events match your search' : 'No events available'}
                    </p>
                  ) : (
                    filteredEvents.map((event) => (
                      <button
                        key={event.uuid}
                        type="button"
                        onClick={() => handleSelectEvent(event.uuid, event.name)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-blue-50 capitalize ${
                          eventId === event.uuid
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        {event.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          {errors.eventId && <p className="mt-1 text-sm text-red-600">{errors.eventId}</p>}
        </div>

        {/* Recipients Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="form-input-label mb-0">
              Recipients <span className="text-red-500">*</span>
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={addRecipient}
            >
              Add Recipient
            </Button>
          </div>

          {/* Desktop Table */}
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
                          onChange={(e) =>
                            handleRecipientChange(recipient.id, 'name', e.target.value)
                          }
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
                          onChange={(e) =>
                            handleRecipientChange(recipient.id, 'email', e.target.value)
                          }
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
                          onClick={() => removeRecipient(recipient.id)}
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

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3">
            {recipients.map((recipient, index) => {
              const isValid = validateRecipient(recipient);
              const isEmpty = !recipient.name && !recipient.email;
              const nameError = errors[`${recipient.id}-name`];
              const emailError = errors[`${recipient.id}-email`];

              return (
                <div key={recipient.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Recipient #{index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {!isEmpty &&
                        (isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        ))}
                      <button
                        type="button"
                        onClick={() => removeRecipient(recipient.id)}
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
                      onChange={(e) => handleRecipientChange(recipient.id, 'name', e.target.value)}
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
                      onChange={(e) => handleRecipientChange(recipient.id, 'email', e.target.value)}
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

          <p className="mt-2 text-xs text-gray-400">
            {recipients.filter((r) => validateRecipient(r)).length} of {recipients.length} recipient
            {recipients.length !== 1 ? 's' : ''} valid
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-4 sm:px-6 border-t border-gray-200 dark:border-gray-700 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
        <Button variant="outline" onClick={onCancel} fullWidth className="sm:w-auto">
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleContinue}
          disabled={!canContinue}
          fullWidth
          className="sm:w-auto"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
