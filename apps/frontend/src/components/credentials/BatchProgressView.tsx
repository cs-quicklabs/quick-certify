'use client';

import { useBatchStatus } from '@/hooks/useCredentials';
import { BatchStatusEnum } from '@/types/credential.types';
import { CheckCircle, XCircle, Loader2, AlertTriangle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/config/routes';

type Props = {
  batchUuid: string;
};

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  PROCESSING: { label: 'Processing', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  COMPLETED: { label: 'Completed', color: 'text-green-600', bgColor: 'bg-green-100' },
  PARTIAL_FAILURE: { label: 'Partial Failure', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  FAILED: { label: 'Failed', color: 'text-red-600', bgColor: 'bg-red-100' },
} as const;

export function BatchProgressView({ batchUuid }: Props) {
  const { data: status, isLoading } = useBatchStatus(batchUuid);
  const [showErrors, setShowErrors] = useState(false);

  if (isLoading || !status) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading batch status...
      </div>
    );
  }

  const config = STATUS_CONFIG[status.status];
  const progress =
    status.totalCount > 0 ? Math.round((status.processedCount / status.totalCount) * 100) : 0;

  const isTerminal = [
    BatchStatusEnum.COMPLETED,
    BatchStatusEnum.PARTIAL_FAILURE,
    BatchStatusEnum.FAILED,
  ].includes(status.status);

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      {/* Status header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status.status === BatchStatusEnum.PROCESSING && (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          )}
          {status.status === BatchStatusEnum.COMPLETED && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          {status.status === BatchStatusEnum.FAILED && <XCircle className="h-5 w-5 text-red-500" />}
          {status.status === BatchStatusEnum.PARTIAL_FAILURE && (
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          )}
          {status.status === BatchStatusEnum.PENDING && (
            <Loader2 className="h-5 w-5 text-gray-400" />
          )}

          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
        </div>

        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bgColor} ${config.color}`}
        >
          {status.processedCount} / {status.totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full rounded-full bg-gray-200 h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            status.status === BatchStatusEnum.FAILED
              ? 'bg-red-500'
              : status.status === BatchStatusEnum.PARTIAL_FAILURE
                ? 'bg-orange-500'
                : status.status === BatchStatusEnum.COMPLETED
                  ? 'bg-green-500'
                  : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Counts */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-gray-600">{status.successCount} successful</span>
        </div>
        {status.failedCount > 0 && (
          <div className="flex items-center gap-1.5">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-gray-600">{status.failedCount} failed</span>
          </div>
        )}
      </div>

      {/* Error details (expandable) */}
      {status.errorDetails && status.errorDetails.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowErrors(!showErrors)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showErrors ? 'rotate-180' : ''}`}
            />
            View error details ({status.errorDetails.length})
          </button>

          {showErrors && (
            <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-red-100 bg-red-50 p-3">
              {status.errorDetails.map((err, i) => (
                <div key={i} className="text-xs text-red-700 py-0.5">
                  Credential #{err.credentialId}: {err.error}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action button when complete */}
      {isTerminal && (
        <div className="pt-2 border-t border-gray-100">
          <Link
            href={ROUTES.CREDENTIALS}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            View Credentials
          </Link>
        </div>
      )}
    </div>
  );
}
