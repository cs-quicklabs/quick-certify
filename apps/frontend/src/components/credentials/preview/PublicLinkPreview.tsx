'use client';

import { Copy, Check, ExternalLink, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PublicLinkPreviewProps {
  recipientName: string;
  eventName: string;
  linkId: string;
  onCopy: () => void;
  copied: boolean;
  isDraft?: boolean;
}

export function PublicLinkPreview({
  recipientName,
  eventName,
  linkId,
  onCopy,
  copied,
  isDraft,
}: PublicLinkPreviewProps) {
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
