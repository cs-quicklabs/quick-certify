'use client';

import { ImageIcon, Eye } from 'lucide-react';

interface FinalCredentialCardProps {
  finalCredential: {
    name: string;
    description: string;
    image: string;
  };
}

export function FinalCredentialCard({ finalCredential }: FinalCredentialCardProps) {
  return (
    <div className="px-4 mx-auto max-w-screen-2xl lg:px-8 mt-4 mb-6">
      <div className="bg-white rounded-sm shadow-md border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row">
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
  );
}
