'use client';

import { Award } from 'lucide-react';

interface CredentialPreviewProps {
  recipientName: string;
  recipientEmail: string;
  eventName: string;
  issuedDate: string;
  expirationDate: string;
  isDraft?: boolean;
}

export function CredentialPreview({
  recipientName,
  recipientEmail,
  eventName,
  issuedDate,
  expirationDate,
  isDraft,
}: CredentialPreviewProps) {
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
