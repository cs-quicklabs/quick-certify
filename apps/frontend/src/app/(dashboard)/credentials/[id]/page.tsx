'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useCredential } from '@/hooks/useCredentials';
import { ROUTES } from '@/config/routes';
import { StepReviewIssue } from '@/components/credentials/StepReviewIssue';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CredentialDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CredentialDetailPage({ params }: CredentialDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: credential, isLoading, error } = useCredential(id);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 lg:py-12 lg:px-8">
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  if (error || !credential) {
    return (
      <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 lg:py-12 lg:px-8">
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">Credential not found</p>
          <Button variant="outline" onClick={() => router.push(ROUTES.CREDENTIALS)}>
            Back to Credentials
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 lg:py-12 lg:px-8">
      {/* Back Navigation */}
      <button
        onClick={() => router.push(ROUTES.CREDENTIALS)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6 cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Credentials
      </button>

      <StepReviewIssue mode="detail" credential={credential} />
    </div>
  );
}
