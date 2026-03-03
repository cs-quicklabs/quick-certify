'use client';

import { useState, useCallback, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type RecipientRow } from '@/schemas/credential.schema';
import type { IssueFormData } from '@/app/(dashboard)/credentials/issue/page';
import { useRecipientValidation } from '@/hooks/useRecipientValidation';
import { EventSelector } from './EventSelector';
import { RecipientTable } from './RecipientTable';
import { RecipientCards } from './RecipientCards';

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

  const { errors, validateRecipient, validateAll, clearFieldError } = useRecipientValidation();

  // Sync with initialData when redirected with prefill
  useEffect(() => {
    setEventId(initialData.eventId);
    setEventName(initialData.eventName);
    setRecipients(initialData.recipients);
  }, [initialData.eventId, initialData.eventName, initialData.recipients]);

  const handleSelectEvent = useCallback(
    (uuid: string, name: string) => {
      setEventId(uuid);
      setEventName(name);
      clearFieldError('eventId');
    },
    [clearFieldError],
  );

  const handleRecipientChange = useCallback(
    (id: string, field: 'name' | 'email', value: string) => {
      setRecipients((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
      clearFieldError(`${id}-${field}`);
    },
    [clearFieldError],
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

  const handleContinue = useCallback(() => {
    if (!validateAll(eventId, recipients)) return;
    onContinue({ eventId, eventName, recipients });
  }, [eventId, eventName, recipients, validateAll, onContinue]);

  const hasValidRecipients = recipients.some((r) => validateRecipient(r));
  const canContinue = !!eventId && hasValidRecipients;

  return (
    <div className="bg-white shadow-md sm:rounded-sm">
      {/* Header */}
      <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-200">
        <h1 className="form-title">Issue Credentials</h1>
        <p className="form-subtitle">
          Select an event and add the recipients who will receive credentials.
        </p>
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-6">
        <EventSelector
          eventId={eventId}
          eventName={eventName}
          onSelect={handleSelectEvent}
          error={errors.eventId}
        />

        {/* Recipients */}
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

          <RecipientTable
            recipients={recipients}
            errors={errors}
            onRecipientChange={handleRecipientChange}
            onRemove={removeRecipient}
            validateRecipient={validateRecipient}
          />

          <RecipientCards
            recipients={recipients}
            errors={errors}
            onRecipientChange={handleRecipientChange}
            onRemove={removeRecipient}
            validateRecipient={validateRecipient}
          />

          <p className="mt-2 text-xs text-gray-400">
            {recipients.filter((r) => validateRecipient(r)).length} of {recipients.length}{' '}
            recipient{recipients.length !== 1 ? 's' : ''} valid
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-4 sm:px-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
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
