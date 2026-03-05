'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCreateBatchCredentials } from '@/hooks/useCredentials';
import { useEvent } from '@/hooks/useEvents';
import { useDesignById } from '@/hooks/useDesigns';
import { ROUTES } from '@/config/routes';
import { showSuccessToast } from '@/lib/toast';
import type { IssueFormData } from '@/app/(dashboard)/credentials/issue/page';
import { CredentialStatus } from '@/types/credential.types';
import { CredentialLayout, formatDate, type TabKey } from './CredentialLayout';

export interface IssueMode {
  mode: 'issue';
  formData: IssueFormData;
  setFormData: React.Dispatch<React.SetStateAction<IssueFormData>>;
  onBack: () => void;
  onCancel: () => void;
}

export function IssueCredentialView({ formData, setFormData, onBack, onCancel }: IssueMode) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('credential');
  const [selectedRecipientIndex, setSelectedRecipientIndex] = useState(0);
  const [recipientDropdownOpen, setRecipientDropdownOpen] = useState(false);

  const batchCreate = useCreateBatchCredentials();
  const { data: event } = useEvent(formData.eventId, !!formData.eventId);
  const { data: design } = useDesignById(event?.design?.uuid ?? undefined);

  const selectedRecipient = formData.recipients[selectedRecipientIndex];

  const handleIssuedDateChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({ ...prev, issuedDate: value }));
    },
    [setFormData],
  );

  const handleExpirationDateChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({
        ...prev,
        expirationDate: value,
        noExpiration: false,
      }));
    },
    [setFormData],
  );

  const handleNoExpirationToggle = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      noExpiration: !prev.noExpiration,
      expirationDate: !prev.noExpiration ? '' : prev.expirationDate,
    }));
  }, [setFormData]);

  const buildPayload = useCallback(
    (status: CredentialStatus) => ({
      eventId: formData.eventId,
      recipients: formData.recipients.map((r) => ({
        name: r.name,
        email: r.email,
      })),
      issuedDate: formData.issuedDate,
      expirationDate: formData.noExpiration ? undefined : formData.expirationDate || undefined,
      status,
    }),
    [formData],
  );

  const handleSaveDraft = useCallback(async () => {
    await batchCreate.mutateAsync(buildPayload(CredentialStatus.DRAFT));
    showSuccessToast('Credentials saved as draft.');
    router.push(ROUTES.CREDENTIALS);
  }, [batchCreate, buildPayload, router]);

  const handleIssueCredentials = useCallback(async () => {
    await batchCreate.mutateAsync(buildPayload(CredentialStatus.ISSUED));
    showSuccessToast('Credentials are being issued.');
    router.push(ROUTES.CREDENTIALS);
  }, [batchCreate, buildPayload, router]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <CredentialLayout
        /* Left summary */
        summaryTitle="Summary"
        eventName={formData.eventName}
        recipientLabel={`${formData.recipients.length} recipient${formData.recipients.length !== 1 ? 's' : ''}`}
        issuedDate={formData.issuedDate}
        expirationDate={formData.expirationDate}
        noExpiration={formData.noExpiration}
        onIssuedDateChange={handleIssuedDateChange}
        onExpirationDateChange={handleExpirationDateChange}
        onNoExpirationToggle={handleNoExpirationToggle}
        editable
        /* Right preview */
        activeTab={activeTab}
        onTabChange={setActiveTab}
        previewName={selectedRecipient?.name ?? ''}
        previewEmail={selectedRecipient?.email ?? ''}
        previewEventName={formData.eventName}
        previewIssuedDate={formatDate(formData.issuedDate)}
        previewExpirationDate={
          formData.noExpiration ? 'No Expiration' : formatDate(formData.expirationDate)
        }
        hidePublicLink
        design={design}
        /* Recipient dropdown */
        recipients={formData.recipients}
        selectedRecipientIndex={selectedRecipientIndex}
        recipientDropdownOpen={recipientDropdownOpen}
        onRecipientDropdownToggle={() => setRecipientDropdownOpen(!recipientDropdownOpen)}
        onSelectRecipient={(i) => {
          setSelectedRecipientIndex(i);
          setRecipientDropdownOpen(false);
        }}
      />

      {/* Footer Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
        <Button variant="outline" onClick={onCancel} fullWidth className="sm:w-auto">
          Cancel
        </Button>

        <Button variant="outline" onClick={onBack} fullWidth className="sm:w-auto">
          Back
        </Button>

        <Button
          variant="outline"
          onClick={handleSaveDraft}
          isLoading={batchCreate.isPending}
          disabled={batchCreate.isPending}
          leftIcon={<Save className="h-4 w-4" />}
          fullWidth
          className="sm:w-auto"
        >
          Save as Draft
        </Button>

        <Button
          variant="primary"
          onClick={handleIssueCredentials}
          isLoading={batchCreate.isPending}
          disabled={batchCreate.isPending}
          leftIcon={<Send className="h-4 w-4" />}
          fullWidth
          className="sm:w-auto"
        >
          Issue {formData.recipients.length} Credential
          {formData.recipients.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
}
