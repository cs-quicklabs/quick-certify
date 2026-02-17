'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/routes';
import { Stepper } from '@/components/Stepper';
import { StepCreateCredentials } from '@/components/credentials/StepCreateCredentials';
import { StepReviewIssue } from '@/components/credentials/StepReviewIssue';
import type { RecipientRow } from '@/schemas/credential.schema';

const STEPS = [
  { title: 'Create Credentials', subtitle: 'Add recipients' },
  { title: 'Review & Issue', subtitle: 'Confirm and issue' },
];

export interface IssueFormData {
  eventId: string;
  eventName: string;
  recipients: RecipientRow[];
  issuedDate: string;
  expirationDate: string;
  noExpiration: boolean;
}

export default function IssueCredentialPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<IssueFormData>({
    eventId: '',
    eventName: '',
    recipients: [{ id: crypto.randomUUID(), name: '', email: '' }],
    issuedDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    noExpiration: true,
  });

  const completedSteps = activeStep > 0 ? [0] : [];

  const handleStep1Continue = useCallback(
    (data: { eventId: string; eventName: string; recipients: RecipientRow[] }) => {
      setFormData((prev) => ({ ...prev, ...data }));
      setActiveStep(1);
    },
    [],
  );

  const handleBack = useCallback(() => {
    if (activeStep === 0) {
      router.push(ROUTES.CREDENTIALS);
    } else {
      setActiveStep(0);
    }
  }, [activeStep, router]);

  const handleCancel = useCallback(() => {
    router.push(ROUTES.CREDENTIALS);
  }, [router]);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10 sm:px-6 lg:py-12 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stepper Sidebar */}
        <Stepper
          steps={STEPS}
          activeIndex={activeStep}
          completedSteps={completedSteps}
          onSelect={(i) => {
            if (i < activeStep || completedSteps.includes(i)) {
              setActiveStep(i);
            }
          }}
        />

        {/* Main Content */}
        <div className="lg:col-span-9">
          {activeStep === 0 && (
            <StepCreateCredentials
              initialData={formData}
              onContinue={handleStep1Continue}
              onCancel={handleCancel}
            />
          )}

          {activeStep === 1 && (
            <StepReviewIssue
              mode="issue"
              formData={formData}
              setFormData={setFormData}
              onBack={handleBack}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>
    </div>
  );
}
