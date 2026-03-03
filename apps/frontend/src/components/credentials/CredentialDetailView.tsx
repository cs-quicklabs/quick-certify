'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Save, X, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useUpdateCredential, useDeleteCredential, useResendCredential } from '@/hooks/useCredentials';
import { useEvent } from '@/hooks/useEvents';
import { useDesignById } from '@/hooks/useDesigns';
import { ROUTES } from '@/config/routes';
import { showSuccessToast } from '@/lib/toast';
import { CredentialStatus, type Credential } from '@/types/credential.types';
import { CredentialLayout, formatDate, type TabKey } from './CredentialLayout';

export interface DetailMode {
  mode: 'detail';
  credential: Credential;
}

export function CredentialDetailView({ credential }: DetailMode) {
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
