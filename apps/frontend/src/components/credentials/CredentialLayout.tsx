'use client';

import { Calendar, Users, Award, ChevronDown } from 'lucide-react';
import type { Design } from '@/types';
import { CertificateDesignPreview } from './preview/CertificateDesignPreview';
import { CredentialPreview } from './preview/CredentialPreview';
import { PublicLinkPreview } from './preview/PublicLinkPreview';

export type TabKey = 'credential' | 'public-link';

export interface RecipientOption {
  id: string;
  name: string;
  email: string;
}

export interface RecipientEditFields {
  name: string;
  email: string;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
}

export interface CredentialLayoutProps {
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

export function formatDate(dateStr: string | null) {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function CredentialLayout({
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
    <div className="bg-white shadow-md rounded-sm overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left Section - Summary / Details */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-gray-200">
          <div className="px-4 sm:px-5 h-12 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">{summaryTitle}</h2>
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
                <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{eventName}</p>
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
                    <p className="text-sm font-medium text-gray-900">{recipientLabel}</p>
                    {recipientSublabel && (
                      <p className="text-xs text-gray-500 truncate">{recipientSublabel}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

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
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
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
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
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
          <div className="px-4 sm:px-5 h-12 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
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
                ) : design?.url ? (
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
