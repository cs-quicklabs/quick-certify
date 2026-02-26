'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Users,
  Award,
  Copy,
  Check,
  ChevronDown,
  ExternalLink,
  Save,
  Pencil,
  X,
  Trash2,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import {
  useCreateBatchCredentials,
  useUpdateCredential,
  useDeleteCredential,
  useResendCredential,
} from '@/hooks/useCredentials';
import { useEvent } from '@/hooks/useEvents';
import { useDesignById } from '@/hooks/useDesigns';
import { ROUTES } from '@/config/routes';
import { showErrorToast, showSuccessToast } from '@/lib/toast';
import type { IssueFormData } from '@/app/(dashboard)/credentials/issue/page';
import { CredentialStatus, type Credential } from '@/types/credential.types';
import type { Design } from '@/types';

/* ───── Props ───── */

interface IssueMode {
  mode: 'issue';
  formData: IssueFormData;
  setFormData: React.Dispatch<React.SetStateAction<IssueFormData>>;
  onBack: () => void;
  onCancel: () => void;
}

interface DetailMode {
  mode: 'detail';
  credential: Credential;
}

type StepReviewIssueProps = IssueMode | DetailMode;

type TabKey = 'credential' | 'public-link';

export function StepReviewIssue(props: StepReviewIssueProps) {
  const isIssueMode = props.mode === 'issue';

  if (isIssueMode) {
    return <IssueView {...props} />;
  }
  return <DetailView {...props} />;
}

/* ═══════════════════════════════════════════════════
   Issue View — batch creation flow (step 2)
   ═══════════════════════════════════════════════════ */

function IssueView({ formData, setFormData, onBack, onCancel }: IssueMode) {
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

/* ═══════════════════════════════════════════════════
   Detail View — view / edit a single credential
   ═══════════════════════════════════════════════════ */

function DetailView({ credential }: DetailMode) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('credential');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Editable fields
  const [editName, setEditName] = useState(credential.recipient?.name ?? '');
  const [editEmail, setEditEmail] = useState(credential.recipient?.email ?? '');
  const [editIssuedDate, setEditIssuedDate] = useState(credential.issued_date?.split('T')[0] ?? '');
  const [editExpirationDate, setEditExpirationDate] = useState(
    credential.expiration_date?.split('T')[0] ?? '',
  );
  const [editNoExpiration, setEditNoExpiration] = useState(!credential.expiration_date);

  const updateCredential = useUpdateCredential();
  const deleteCredential = useDeleteCredential();
  const resendCredential = useResendCredential();

  const isDraft = credential.status === CredentialStatus.DRAFT;
  const isIssued = credential.status === CredentialStatus.ISSUED;
  const isFailed = credential.status === CredentialStatus.FAILED;

  const { data: event } = useEvent(credential.event?.uuid ?? '', !!credential.event?.uuid);
  const { data: design } = useDesignById(event?.design?.uuid ?? undefined);

  const handleCancelEdit = useCallback(() => {
    setEditName(credential.recipient?.name ?? '');
    setEditEmail(credential.recipient?.email ?? '');
    setEditIssuedDate(credential.issued_date?.split('T')[0] ?? '');
    setEditExpirationDate(credential.expiration_date?.split('T')[0] ?? '');
    setEditNoExpiration(!credential.expiration_date);
    setIsEditing(false);
  }, [credential]);

  const handleSave = useCallback(async () => {
    await updateCredential.mutateAsync({
      id: credential.uuid,
      recipientName: editName,
      recipientEmail: editEmail,
      issuedDate: editIssuedDate,
      expirationDate: editNoExpiration ? undefined : editExpirationDate || undefined,
    });
    setIsEditing(false);
  }, [
    updateCredential,
    credential.uuid,
    editName,
    editEmail,
    editIssuedDate,
    editExpirationDate,
    editNoExpiration,
  ]);

  const handleIssue = useCallback(async () => {
    await updateCredential.mutateAsync({
      id: credential.uuid,
      status: CredentialStatus.ISSUED,
    });
  }, [updateCredential, credential.uuid]);

  const handleDelete = useCallback(async () => {
    await deleteCredential.mutateAsync(credential.uuid);
    router.push(ROUTES.CREDENTIALS);
  }, [deleteCredential, credential.uuid, router]);

  const displayName = isEditing ? editName : (credential.recipient?.name ?? '');
  const displayEmail = isEditing ? editEmail : (credential.recipient?.email ?? '');
  const displayIssuedDate = isEditing
    ? editIssuedDate
    : (credential.issued_date?.split('T')[0] ?? '');
  const displayExpirationDate = isEditing
    ? editExpirationDate
    : (credential.expiration_date?.split('T')[0] ?? '');
  const displayNoExpiration = isEditing ? editNoExpiration : !credential.expiration_date;

  return (
    <div className="space-y-4 sm:space-y-6">
      <CredentialLayout
        /* Left summary */
        summaryTitle="Details"
        summaryHeaderRight={
          <div className="flex items-center gap-2">
            {isDraft && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Draft
              </span>
            )}
            {isIssued && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Issued
              </span>
            )}
            {isFailed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                Failed
              </span>
            )}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
          </div>
        }
        eventName={credential.event?.name ?? '--'}
        /* Recipient – editable in edit mode */
        recipientLabel={isEditing ? undefined : displayName}
        recipientSublabel={isEditing ? undefined : displayEmail}
        recipientEditFields={
          isEditing
            ? {
                name: editName,
                email: editEmail,
                onNameChange: setEditName,
                onEmailChange: setEditEmail,
              }
            : undefined
        }
        issuedDate={displayIssuedDate}
        expirationDate={displayExpirationDate}
        noExpiration={displayNoExpiration}
        onIssuedDateChange={isEditing ? setEditIssuedDate : undefined}
        onExpirationDateChange={
          isEditing
            ? (v: string) => {
                setEditExpirationDate(v);
                setEditNoExpiration(false);
              }
            : undefined
        }
        onNoExpirationToggle={
          isEditing
            ? () => {
                const next = !editNoExpiration;
                setEditNoExpiration(next);
                if (next) setEditExpirationDate('');
              }
            : undefined
        }
        editable={isEditing}
        editActions={
          isEditing ? (
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                isLoading={updateCredential.isPending}
                disabled={updateCredential.isPending}
                leftIcon={<Save className="h-3.5 w-3.5" />}
                fullWidth
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                disabled={updateCredential.isPending}
                leftIcon={<X className="h-3.5 w-3.5" />}
                fullWidth
              >
                Cancel
              </Button>
            </div>
          ) : undefined
        }
        /* Right preview */
        activeTab={activeTab}
        onTabChange={setActiveTab}
        previewName={displayName}
        previewEmail={displayEmail}
        previewEventName={credential.event?.name ?? ''}
        previewIssuedDate={formatDate(displayIssuedDate)}
        previewExpirationDate={
          displayNoExpiration ? 'No Expiration' : formatDate(displayExpirationDate)
        }
        hidePublicLink
        certificatePreviewUrl={credential.certificate_url ?? undefined}
        design={design}
        isDraft={isDraft}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete Credential"
        message="Are you sure you want to delete this credential? This action cannot be undone."
        confirmLabel="Delete"
        confirmLoadingLabel="Deleting..."
        cancelLabel="Cancel"
        confirmVariant="danger"
        isLoading={deleteCredential.isPending}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Footer Actions */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
        <Button
          variant="outline"
          onClick={() => setShowDeleteConfirm(true)}
          leftIcon={<Trash2 className="h-4 w-4" />}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          Delete
        </Button>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={() => router.push(ROUTES.CREDENTIALS)}
            fullWidth
            className="sm:w-auto"
          >
            Back to List
          </Button>
          {(isIssued || isFailed) && (
            <Button
              variant="outline"
              onClick={() => {
                resendCredential.mutate(credential.uuid, {
                  onSuccess: () => {
                    showSuccessToast(
                      isFailed
                        ? 'Credential resent successfully.'
                        : 'Credential resent to recipient.',
                    );
                  },
                  onError: () => {
                    showErrorToast('Failed to resend credential. Please try again.');
                  },
                });
              }}
              isLoading={resendCredential.isPending}
              disabled={resendCredential.isPending}
              leftIcon={<Send className="h-4 w-4" />}
              fullWidth
              className="sm:w-auto"
            >
              {isFailed ? 'Retry & Send' : 'Resend Credential'}
            </Button>
          )}
          {isDraft && (
            <Button
              variant="primary"
              onClick={handleIssue}
              isLoading={updateCredential.isPending}
              disabled={updateCredential.isPending}
              fullWidth
              className="sm:w-auto"
            >
              Issue Credential
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Shared Layout — single solid box, two sections
   ═══════════════════════════════════════════════════ */

interface RecipientOption {
  id: string;
  name: string;
  email: string;
}

interface RecipientEditFields {
  name: string;
  email: string;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
}

interface CredentialLayoutProps {
  // Left summary
  summaryTitle: string;
  summaryHeaderRight?: React.ReactNode;
  eventName: string;
  recipientLabel?: string;
  recipientSublabel?: string;
  recipientEditFields?: RecipientEditFields;
  issuedDate: string;
  expirationDate: string;
  noExpiration: boolean;
  onIssuedDateChange?: (value: string) => void;
  onExpirationDateChange?: (value: string) => void;
  onNoExpirationToggle?: () => void;
  editable?: boolean;
  editActions?: React.ReactNode;
  // Right preview
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  previewName: string;
  previewEmail: string;
  previewEventName: string;
  previewIssuedDate: string;
  previewExpirationDate: string;
  publicLinkId?: string;
  onCopyLink?: () => void;
  copiedLink?: boolean;
  isDraft?: boolean;
  hidePublicLink?: boolean;
  // Certificate preview
  certificatePreviewUrl?: string;
  design?: Design;
  // Recipient dropdown (issue mode)
  recipients?: RecipientOption[];
  selectedRecipientIndex?: number;
  recipientDropdownOpen?: boolean;
  onRecipientDropdownToggle?: () => void;
  onSelectRecipient?: (index: number) => void;
}

function CredentialLayout({
  summaryTitle,
  summaryHeaderRight,
  eventName,
  recipientLabel,
  recipientSublabel,
  recipientEditFields,
  issuedDate,
  expirationDate,
  noExpiration,
  onIssuedDateChange,
  onExpirationDateChange,
  onNoExpirationToggle,
  editable,
  editActions,
  activeTab,
  onTabChange,
  previewName,
  previewEmail,
  previewEventName,
  previewIssuedDate,
  previewExpirationDate,
  publicLinkId,
  onCopyLink,
  copiedLink,
  isDraft,
  certificatePreviewUrl,
  design,
  recipients,
  selectedRecipientIndex,
  recipientDropdownOpen,
  onRecipientDropdownToggle,
  onSelectRecipient,
  hidePublicLink,
}: CredentialLayoutProps) {
  const hasRecipientDropdown =
    recipients && recipients.length > 0 && onRecipientDropdownToggle && onSelectRecipient;

  return (
    <div className="bg-white shadow-md dark:bg-gray-800 rounded-sm overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Section - Summary / Details */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-5 h-12 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{summaryTitle}</h2>
            {summaryHeaderRight}
          </div>

          <div className="px-4 py-4 sm:px-5 sm:py-5 space-y-5">
            {/* Event Name */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Award className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Event</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5 truncate">
                  {eventName}
                </p>
              </div>
            </div>

            {/* Recipient */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {recipientEditFields ? 'Recipient' : 'Recipients'}
                </p>
                {recipientEditFields ? (
                  <div className="mt-1.5 space-y-2">
                    <input
                      type="text"
                      value={recipientEditFields.name}
                      onChange={(e) => recipientEditFields.onNameChange(e.target.value)}
                      placeholder="Recipient name"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none transition-colors"
                    />
                    <input
                      type="email"
                      value={recipientEditFields.email}
                      onChange={(e) => recipientEditFields.onEmailChange(e.target.value)}
                      placeholder="Recipient email"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none transition-colors"
                    />
                  </div>
                ) : (
                  <div className="mt-0.5">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {recipientLabel}
                    </p>
                    {recipientSublabel && (
                      <p className="text-xs text-gray-500 truncate">{recipientSublabel}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-gray-700" />

            {/* Issue Date */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-50">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Issue Date
                </p>
                {editable && onIssuedDateChange ? (
                  <input
                    type="date"
                    value={issuedDate}
                    onChange={(e) => onIssuedDateChange(e.target.value)}
                    className="mt-1.5 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none transition-colors"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {formatDate(issuedDate)}
                  </p>
                )}
              </div>
            </div>

            {/* Expiration Date */}
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                <Calendar className="h-4 w-4 text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Expiration Date
                </p>
                {editable && onExpirationDateChange && onNoExpirationToggle ? (
                  <div className="mt-1.5 space-y-2">
                    <input
                      type="date"
                      value={expirationDate}
                      onChange={(e) => onExpirationDateChange(e.target.value)}
                      disabled={noExpiration}
                      min={issuedDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    />
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={noExpiration}
                        onChange={onNoExpirationToggle}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-500">No expiration</span>
                    </label>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                    {noExpiration ? 'No Expiration' : formatDate(expirationDate)}
                  </p>
                )}
              </div>
            </div>

            {/* Edit actions (save/cancel for detail mode) */}
            {editActions}
          </div>
        </div>

        {/* Right Section - Preview */}
        <div className="lg:col-span-8">
          {/* Tab Header */}
          <div className="px-4 sm:px-5 h-12 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            {/* Tabs */}
            <div className="flex -mb-px overflow-x-auto">
              <button
                type="button"
                onClick={() => onTabChange('credential')}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'credential'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Credential View
              </button>
              {!hidePublicLink && (
                <button
                  type="button"
                  onClick={() => onTabChange('public-link')}
                  className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'public-link'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Public Link
                </button>
              )}
            </div>

            {/* Recipient Dropdown (issue mode only) */}
            {hasRecipientDropdown && (
              <div className="relative py-2 sm:py-0">
                <button
                  type="button"
                  onClick={onRecipientDropdownToggle}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer w-full sm:w-auto transition-colors"
                >
                  <span className="max-w-[200px] sm:max-w-[150px] truncate">
                    {recipients[selectedRecipientIndex!]?.name || 'Select recipient'}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-auto sm:ml-0" />
                </button>

                {recipientDropdownOpen && (
                  <div className="absolute left-0 sm:left-auto sm:right-0 z-50 mt-1 w-full sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="max-h-48 overflow-y-auto p-1">
                      {recipients.map((r, i) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => onSelectRecipient!(i)}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-blue-50 ${
                            i === selectedRecipientIndex
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700'
                          }`}
                        >
                          <p className="font-medium truncate">{r.name}</p>
                          <p className="text-xs text-gray-500 truncate">{r.email}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeTab === 'credential' && (
              <>
                {certificatePreviewUrl ? (
                  <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img
                      src={certificatePreviewUrl}
                      alt="Certificate preview"
                      className="w-full h-auto"
                    />
                  </div>
                ) : design?.layout ? (
                  <CertificateDesignPreview
                    design={design}
                    recipientName={previewName}
                    recipientEmail={previewEmail}
                    eventName={previewEventName}
                    issuedDate={previewIssuedDate}
                    expirationDate={previewExpirationDate}
                    isDraft={isDraft}
                  />
                ) : (
                  <CredentialPreview
                    recipientName={previewName}
                    recipientEmail={previewEmail}
                    eventName={previewEventName}
                    issuedDate={previewIssuedDate}
                    expirationDate={previewExpirationDate}
                    isDraft={isDraft}
                  />
                )}
              </>
            )}

            {!hidePublicLink && activeTab === 'public-link' && publicLinkId && onCopyLink && (
              <PublicLinkPreview
                recipientName={previewName}
                eventName={previewEventName}
                linkId={publicLinkId}
                onCopy={onCopyLink}
                copied={copiedLink ?? false}
                isDraft={isDraft}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───── Real Certificate Design Preview ───── */

function CertificateDesignPreview({
  design,
  recipientName,
  recipientEmail,
  eventName,
  issuedDate,
  expirationDate,
  isDraft,
}: Readonly<{
  design: Design;
  recipientName: string;
  recipientEmail: string;
  eventName: string;
  issuedDate: string;
  expirationDate: string;
  isDraft?: boolean;
}>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const layout = design.layout;

  useEffect(() => {
    if (!layout) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setScale(width / layout.canvasWidth);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [layout]);

  if (!layout) return null;

  const { canvasWidth, canvasHeight, placeholders } = layout;

  const valueMap: Record<string, string> = {
    'recipient.name': recipientName,
    'recipient.email': recipientEmail,
    'credential.id': '',
    'credential.issue_date': issuedDate,
    'credential.expiration_date': expirationDate,
    'event.name': eventName,
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      {isDraft && (
        <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-200 text-center">
          <span className="text-xs font-medium text-amber-700">Draft Preview</span>
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: canvasHeight * scale, position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            width: canvasWidth,
            height: canvasHeight,
            position: 'absolute',
            top: 0,
            left: 0,
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
          }}
        >
          <img
            src={design.url}
            alt="Certificate background"
            style={{ width: '100%', height: '100%', objectFit: 'fill', display: 'block' }}
          />
          {placeholders.map((p) => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: p.x,
                top: p.y,
                transform: `translate(-50%, -50%) scale(${p.scaleX ?? 1}, ${p.scaleY ?? 1})`,
                fontSize: p.fontSize,
                fontFamily: p.fontFamily,
                fontWeight: p.fontWeight ?? 'normal',
                fontStyle: p.fontStyle ?? 'normal',
                color: p.color,
                textAlign: p.align ?? 'left',
                maxWidth: p.maxWidth ?? undefined,
                whiteSpace: p.maxWidth ? 'normal' : 'nowrap',
                lineHeight: 1.2,
                pointerEvents: 'none',
              }}
            >
              {valueMap[p.key] ?? p.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───── Credential Preview Sub-component ───── */

function CredentialPreview({
  recipientName,
  recipientEmail,
  eventName,
  issuedDate,
  expirationDate,
  isDraft,
}: {
  recipientName: string;
  recipientEmail: string;
  eventName: string;
  issuedDate: string;
  expirationDate: string;
  isDraft?: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      {/* Certificate Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 px-4 py-8 sm:px-6 sm:py-10 text-center text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-white/5 rounded-full -translate-x-8 -translate-y-8" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 translate-y-10" />

        <div className="relative">
          {isDraft && (
            <span className="inline-block mb-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white/90">
              Draft Preview
            </span>
          )}
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/15 mb-3">
            <Award className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight">Certificate of Completion</h3>
          <p className="text-sm text-blue-100 mt-1.5">{eventName}</p>
        </div>
      </div>

      {/* Certificate Body */}
      <div className="px-4 py-6 sm:px-6 sm:py-8 text-center bg-white">
        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              Awarded to
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1.5">{recipientName}</p>
            <p className="text-sm text-gray-500 break-all mt-0.5">{recipientEmail}</p>
          </div>

          <div className="mx-auto max-w-xs">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          </div>

          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-0 text-sm text-gray-600">
            <div className="text-center px-6">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Issued
              </p>
              <p className="font-semibold text-gray-700 mt-0.5">{issuedDate}</p>
            </div>
            <div className="hidden sm:block h-10 w-px bg-gray-200" />
            <div className="sm:hidden w-12 h-px bg-gray-200" />
            <div className="text-center px-6">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Expires
              </p>
              <p className="font-semibold text-gray-700 mt-0.5">{expirationDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───── Public Link Preview Sub-component ───── */

function PublicLinkPreview({
  recipientName,
  eventName,
  linkId,
  onCopy,
  copied,
  isDraft,
}: {
  recipientName: string;
  eventName: string;
  linkId: string;
  onCopy: () => void;
  copied: boolean;
  isDraft?: boolean;
}) {
  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${linkId}`;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-gray-900">Public Credential Link</h4>
        <p className="text-sm text-gray-500 mt-1">
          {isDraft
            ? 'This link will become active once the credential is issued.'
            : 'Recipients and verifiers can view the credential at this URL.'}
        </p>
      </div>

      {/* URL Preview */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1 min-w-0 px-3 py-2.5 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-600 truncate font-mono">
          {publicUrl}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
          fullWidth
          className="sm:w-auto"
          leftIcon={
            copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />
          }
        >
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>

      {/* Public Page Preview */}
      <div className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-gray-50/50">
        <div className="flex items-center gap-2 mb-4">
          <ExternalLink className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-400">Public credential page preview</span>
        </div>

        <div className="text-center space-y-3">
          <div className="h-12 w-12 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
            <Award className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{recipientName}</p>
            <p className="text-sm text-gray-500">has successfully completed</p>
            <p className="text-sm font-medium text-blue-600 mt-1">{eventName}</p>
          </div>
          {isDraft ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
              Draft - Not Yet Issued
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              <Check className="h-3.5 w-3.5" />
              Verified Credential
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───── Utility ───── */

function formatDate(dateStr: string | null) {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
