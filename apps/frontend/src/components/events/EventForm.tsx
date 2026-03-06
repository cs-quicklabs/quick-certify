'use client';

import { useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Stepper } from '@/components/Stepper';
import type { FormFieldConfig } from '@/types/form.types';
import { useCreateEvent, useUpdateEvent, useEvent } from '@/hooks/useEvents';
import { useEventTypes } from '@/hooks/useEventTypes';
import { useEventLevels } from '@/hooks/useEventLevels';
import { useEventFormats } from '@/hooks/useEventFormats';
import { useSkills } from '@/hooks/useSkills';
import { useEventStepper, type Step0Data, type Step1Data } from '@/hooks/useEventStepper';
import { useEventFormInitialization } from '@/hooks/useEventFormInitialization';
import { DesignSelectorModal } from '@/components/designs/DesignSelectorModal';
import { useDesignList } from '@/hooks/useDesigns';
import { type Design, type Event } from '@/types';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import { ROUTES } from '@/config/routes';
import { step0Schema, step1Schema } from '@/schemas/eventForm.schemas';
import { EventFormStep0 } from './EventFormStep0';
import { EventFormStep1 } from './EventFormStep1';

const DROPDOWN_PAGE_SIZE = 100;

interface Step0FormData extends Step0Data {
  design?: string;
  designId?: string;
  designTitle?: string;
  designType?: string;
}

type Step1FormData = Step1Data;

interface EventFormProps {
  mode: 'create' | 'edit';
  eventUuid?: string;
  initialEventData?: Event;
  initialStep?: number;
}

export function EventForm({ mode, eventUuid, initialEventData, initialStep = 0 }: EventFormProps) {
  const router = useRouter();
  const isEditMode = mode === 'edit';

  const [isFormReady, setIsFormReady] = useState(!isEditMode);
  const [step0CoreData, setStep0CoreData] = useState<Step0Data>({ name: '' });
  const [step0FormData, setStep0FormData] = useState<Step0FormData>({ name: '' });
  const [step1Data, setStep1Data] = useState<Step1FormData>({
    description: '',
    learningLink: '',
    levelId: '',
    formatId: '',
    typeId: '',
  });
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);

  const step0FormRef = useRef<HTMLFormElement>(null);

  const {
    currentStep,
    setCurrentStep,
    goToNextStep,
    canNavigateToStep,
    completedSteps,
    partialSteps,
    markStepCompleted,
    isStep0Complete,
    isStep1Complete,
    steps,
  } = useEventStepper(initialStep, step0CoreData, step1Data, selectedSkillIds);

  const shouldFetchEvent = isEditMode && !!eventUuid && !initialEventData;
  const { data: eventData, isLoading: isLoadingEvent } = useEvent(
    eventUuid ?? '',
    shouldFetchEvent,
  );

  const { data: typesData, isLoading: isLoadingTypes } = useEventTypes({
    page: 1,
    limit: DROPDOWN_PAGE_SIZE,
  });
  const { data: levelsData, isLoading: isLoadingLevels } = useEventLevels({
    page: 1,
    limit: DROPDOWN_PAGE_SIZE,
  });
  const { data: formatsData, isLoading: isLoadingFormats } = useEventFormats({
    page: 1,
    limit: DROPDOWN_PAGE_SIZE,
  });
  const { designs } = useDesignList({ page: 1, limit: DROPDOWN_PAGE_SIZE });
  const { data: skillsData, isLoading: isLoadingSkills } = useSkills({
    page: 1,
    limit: DROPDOWN_PAGE_SIZE,
  });

  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent(eventUuid ?? '');

  const types = typesData?.data ?? [];
  const levels = levelsData?.data ?? [];
  const formats = formatsData?.data ?? [];
  const skills = skillsData?.data ?? [];
  const isLoadingDropdowns =
    isLoadingTypes || isLoadingLevels || isLoadingFormats || isLoadingSkills;

  useEventFormInitialization({
    isEditMode,
    eventUuid,
    eventData,
    setStep0CoreData,
    setStep0FormData,
    setStep1Data,
    setSelectedSkillIds,
    setIsFormReady,
  });

  const handleStepSelect = useCallback(
    (step: number) => {
      if (canNavigateToStep(step)) {
        setCurrentStep(step);
      } else {
        showErrorToast('Please complete the current step first');
      }
    },
    [canNavigateToStep, setCurrentStep],
  );

  const handleAddSkill = useCallback((skillUuid: string) => {
    setSelectedSkillIds((prev) => [...prev, skillUuid]);
  }, []);

  const handleRemoveSkill = useCallback((skillUuid: string) => {
    setSelectedSkillIds((prev) => prev.filter((id) => id !== skillUuid));
  }, []);

  const handleDesignSelect = useCallback((design: Design) => {
    setStep0CoreData((prev) => ({ ...prev, designUuid: design.uuid }));
    setStep0FormData((prev) => ({
      ...prev,
      design: design.url,
      designId: design.id,
      designTitle: design.name,
      designType: design.type,
      designUuid: design.uuid,
    }));
  }, []);

  const handleDeleteDesign = useCallback((e: React.MouseEvent<SVGElement>) => {
    e.stopPropagation();
    setStep0CoreData((prev) => ({ ...prev, designUuid: undefined }));
    setStep0FormData((prev) => ({
      ...prev,
      design: undefined,
      designId: undefined,
      designTitle: undefined,
      designType: undefined,
      designUuid: undefined,
    }));
  }, []);

  const handleEditDesign = useCallback((e: React.MouseEvent<SVGElement>) => {
    e.stopPropagation();
    setIsDesignModalOpen(true);
  }, []);

  const triggerStep0Submit = useCallback(() => {
    step0FormRef.current?.requestSubmit();
  }, []);

  const handleStep0Submit = useCallback(
    async (formData: { name: string }) => {
      const updatedCoreData: Step0Data = { ...step0CoreData, name: formData.name };
      setStep0CoreData(updatedCoreData);
      setStep0FormData((prev) => ({ ...prev, name: formData.name }));
      if (!step0FormData.designUuid) {
        throw new Error('Please select a design');
      }
      goToNextStep();
    },
    [goToNextStep, step0CoreData, step0FormData.designUuid],
  );

  const handleStep1Submit = useCallback(
    async (formData: Step1FormData) => {
      setStep1Data(formData);
      if (isEditMode && eventUuid) {
        await updateEvent.mutateAsync({
          name: step0CoreData.name,
          designId: step0FormData.designUuid || null,
          eventTypeId: formData.typeId || null,
          eventLevelId: formData.levelId || null,
          eventFormatId: formData.formatId || null,
          description: formData.description || null,
          learningLink: formData.learningLink || null,
          durationType: formData.durationType || null,
          durationValue: formData.durationValue ?? null,
          skillIds: selectedSkillIds,
        });
        showSuccessToast('Event updated successfully');
      } else {
        await createEvent.mutateAsync({
          name: step0CoreData.name,
          designId: step0FormData.designUuid || '',
          eventTypeId: formData.typeId || '',
          eventLevelId: formData.levelId || '',
          eventFormatId: formData.formatId || '',
          description: formData.description || undefined,
          learningLink: formData.learningLink || undefined,
          durationType: formData.durationType || undefined,
          durationValue: formData.durationValue ?? undefined,
          skillIds: selectedSkillIds,
        });
        showSuccessToast('Event created successfully');
      }
      markStepCompleted(1);
      router.push(ROUTES.EVENTS);
    },
    [
      eventUuid,
      createEvent,
      updateEvent,
      step0CoreData.name,
      step0FormData.designUuid,
      selectedSkillIds,
      router,
      markStepCompleted,
      isEditMode,
    ],
  );

  const step0Config = {
    title: isEditMode ? 'Edit Event' : 'Add New Event',
    subtitle: isEditMode
      ? 'Edit the event details.'
      : 'Create a new event to issue credentials on specific occasions.',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'text' as FormFieldConfig['type'],
        placeholder: 'Event name',
        required: true,
        description:
          'Specify the name of the occasion on which you would like to issue credentials. ',
      },
    ] as FormFieldConfig[],
    schema: step0Schema,
    submitLabel: 'Next',
    onSubmit: handleStep0Submit,
    isComplete: isStep0Complete,
  };

  const step1Config = {
    title: 'About',
    subtitle: 'Add a detailed description of your event and a link to its website.',
    layout: 'grid-3' as const,
    fields: [
      {
        name: 'description',
        label: 'Description',
        type: 'textarea' as FormFieldConfig['type'],
        placeholder: 'Write a description for this event...',
        className: 'col-span-3',
        rows: 5,
        tooltipText:
          'Provide a detailed description of your event that will appear on the issuer portal. This helps recipients understand the context and significance of the credentials they receive.',
      },
      {
        name: 'learningLink',
        label: 'Learning Resources Link',
        type: 'text' as FormFieldConfig['type'],
        placeholder: 'https://example.com/course',
        className: 'col-span-3',
      },
      {
        name: 'typeId',
        label: 'Event Type',
        type: 'select' as FormFieldConfig['type'],
        placeholder: isLoadingTypes ? 'Loading...' : 'Select type',
        options: types.map((t) => ({ label: t.name, value: t.uuid })),
        disabled: isLoadingTypes,
        required: true,
      },
      {
        name: 'levelId',
        label: 'Event Level',
        type: 'select' as FormFieldConfig['type'],
        placeholder: isLoadingLevels ? 'Loading...' : 'Select level',
        options: levels.map((l) => ({ label: l.name, value: l.uuid })),
        disabled: isLoadingLevels,
        required: true,
      },
      {
        name: 'formatId',
        label: 'Event Format',
        type: 'select' as FormFieldConfig['type'],
        placeholder: isLoadingFormats ? 'Loading...' : 'Select format',
        options: formats.map((f) => ({ label: f.name, value: f.uuid })),
        disabled: isLoadingFormats,
        required: true,
      },
      {
        name: 'durationType',
        label: 'Duration Type',
        type: 'select' as FormFieldConfig['type'],
        placeholder: 'Select duration type',
        options: [
          { label: 'Day', value: 'day' },
          { label: 'Week', value: 'week' },
          { label: 'Month', value: 'month' },
        ],
        description: 'Optional',
      },
      {
        name: 'durationValue',
        label: 'Duration',
        type: 'number' as FormFieldConfig['type'],
        placeholder: 'e.g. 4',
        required: true,
        min: 1,
        max: 999,
        visibleWhen: (formData) => !!formData.durationType,
      },
    ] as FormFieldConfig[],
    schema: step1Schema,
    submitLabel:
      createEvent.isPending || updateEvent.isPending
        ? 'Saving...'
        : isEditMode
          ? 'Update Event'
          : 'Save Event',
    onSubmit: handleStep1Submit,
    onCancel: () => router.push(ROUTES.EVENTS),
    isComplete: isStep1Complete,
  };

  if (!isFormReady || (isEditMode && isLoadingEvent && !initialEventData)) {
    return (
      <div className="max-w-7xl mx-auto pb-10 lg:py-12 lg:px-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-gray-400" size={32} />
          <span className="ml-2 text-gray-500">Loading event...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10 lg:py-12 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Stepper
          steps={steps}
          activeIndex={currentStep}
          completedSteps={completedSteps}
          partialSteps={partialSteps}
          onSelect={handleStepSelect}
        />

        <section className="lg:col-span-9">
          {currentStep === 0 && (
            <EventFormStep0
              config={step0Config as Parameters<typeof EventFormStep0>[0]['config']}
              initialValues={step0FormData as unknown as Record<string, unknown>}
              formRef={step0FormRef}
              onFormChange={(values) => {
                const name = (values.name as string) || '';
                setStep0CoreData((prev) => (prev.name === name ? prev : { ...prev, name }));
                setStep0FormData((prev) => (prev.name === name ? prev : { ...prev, name }));
              }}
              hasDesign={!!step0FormData.design}
              designUrl={step0FormData.design}
              designTitle={step0FormData.designTitle}
              designType={step0FormData.designType}
              onDesignAdd={() => setIsDesignModalOpen(true)}
              onDesignEdit={handleEditDesign}
              onDesignDelete={handleDeleteDesign}
              onCancel={() => router.push(ROUTES.EVENTS)}
              onNext={triggerStep0Submit}
            />
          )}

          {currentStep === 1 && (
            <EventFormStep1
              config={step1Config as Parameters<typeof EventFormStep1>[0]['config']}
              initialValues={step1Data as unknown as Record<string, unknown>}
              formKey={eventUuid ?? 'create'}
              skills={skills}
              selectedSkillIds={selectedSkillIds}
              onSkillAdd={handleAddSkill}
              onSkillRemove={handleRemoveSkill}
              isLoadingSkills={isLoadingSkills}
              isLoading={createEvent.isPending || updateEvent.isPending || isLoadingDropdowns}
            />
          )}

          <DesignSelectorModal
            isOpen={isDesignModalOpen}
            designsList={designs}
            onClose={() => setIsDesignModalOpen(false)}
            onSelect={handleDesignSelect}
          />
        </section>
      </div>
    </div>
  );
}
