'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { ConfigForm } from '@/components/ConfigForm';
import type { FormFieldConfig } from '@/types/form.types';
import { Stepper } from '@/components/Stepper';
import {
  useEventTypes,
  useEventLevels,
  useEventFormats,
  useCreateEvent,
  useUpdateEvent,
  useEvent,
} from '@/hooks/useEvents';
import { useSkills } from '@/hooks/useSkills';
import { useEventStepper, Step0Data, Step1Data } from '@/hooks/useEventStepper';
import { DesignSelectorModal } from '@/components/designs/DesignSelectorModal';
import { SkillSelector } from '@/components/events/SkillSelector';
import { Eye, Images, Plus, SquarePen, Trash, Loader2 } from 'lucide-react';
import { useDesignList } from '@/hooks/useDesigns';
import { Design } from '@/types';
import { toast } from 'react-toastify';
import { Event } from '@/types';
import { showSuccessToast } from '@/lib/toast';

// Maximum number of items to fetch for dropdown lists
const DROPDOWN_PAGE_SIZE = 100;

/**
 * Extended Step0Data with UI-specific fields
 */
interface Step0FormData extends Step0Data {
  design?: string;
  designId?: string;
  designTitle?: string;
  designType?: string;
}

/**
 * Extended Step1Data (same as hook's interface)
 */
type Step1FormData = Step1Data;

interface EventFormProps {
  mode: 'create' | 'edit';
  eventUuid?: string;
  initialEventData?: Event;
  initialStep?: number;
}

/**
 * Event Form Component
 * Handles both creating new events and editing existing events
 */
export function EventForm({ mode, eventUuid, initialEventData, initialStep = 0 }: EventFormProps) {
  const router = useRouter();
  const isEditMode = mode === 'edit';

  // Loading states
  const [isFormReady, setIsFormReady] = useState(!isEditMode);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Step 0 data storage (core data for stepper validation)
  const [step0CoreData, setStep0CoreData] = useState<Step0Data>({ name: '' });

  // Step 0 UI data storage (includes display fields)
  const [step0FormData, setStep0FormData] = useState<Step0FormData>({ name: '' });

  // Step 1 data storage
  const [step1Data, setStep1Data] = useState<Step1FormData>({
    description: '',
    learningLink: '',
    levelId: '',
    formatId: '',
    typeId: '',
  });

  // Skills state - stores selected skill UUIDs
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  // Stepper hook - manages step state based on field completion
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

  // Modal state
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);

  // Form refs
  const step0FormRef = useRef<HTMLFormElement>(null);

  // Fetch event data if in edit mode
  const shouldFetchEvent = isEditMode && !!eventUuid && !initialEventData;
  const { data: eventData, isLoading: isLoadingEvent } = useEvent(
    eventUuid ?? '',
    shouldFetchEvent,
  );

  // Data fetching for dropdowns
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
  const { designs } = useDesignList({
    page: 1,
    limit: DROPDOWN_PAGE_SIZE,
  });

  // Fetch skills for dropdown
  const { data: skillsData, isLoading: isLoadingSkills } = useSkills({
    page: 1,
    limit: DROPDOWN_PAGE_SIZE,
  });

  // Mutations
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent(eventUuid ?? '');

  const types = typesData?.data ?? [];
  const levels = levelsData?.data ?? [];
  const formats = formatsData?.data ?? [];
  const skills = skillsData?.data ?? [];

  const isLoadingDropdowns =
    isLoadingTypes || isLoadingLevels || isLoadingFormats || isLoadingSkills;

  // Track if form has been initialized to prevent infinite loops
  const isInitializedRef = useRef(false);

  // Reset initialization when mode or eventUuid changes
  useEffect(() => {
    isInitializedRef.current = false;
    setIsFormReady(!isEditMode);
  }, [mode, eventUuid, isEditMode]);

  // Initialize form data when event data is loaded (edit mode)
  useEffect(() => {
    if (isEditMode && eventData && !isInitializedRef.current) {
      // Handle both snake_case and camelCase from API
      const apiData = eventData as unknown as Record<string, unknown>;
      const designData = apiData.design as {
        url?: string;
        id?: string;
        name?: string;
        type?: string;
        uuid?: string;
      } | null;

      // Populate Step 0 core data (for stepper validation)
      setStep0CoreData({
        name: (apiData.name as string) || '',
        designUuid: designData?.uuid,
      });

      // Populate Step 0 UI data (for display)
      setStep0FormData({
        name: (apiData.name as string) || '',
        design: designData?.url,
        designId: designData?.id,
        designTitle: designData?.name,
        designType: designData?.type,
        designUuid: designData?.uuid,
      });

      // Populate Step 1 data
      // Note: API may return snake_case fields
      setStep1Data({
        description: (apiData.description as string) || undefined,
        learningLink:
          (apiData.learning_link as string) || (apiData.learningLink as string) || undefined,
        typeId: eventData.event_type?.uuid,
        levelId: eventData.event_level?.uuid,
        formatId: eventData.event_format?.uuid,
        durationType: (apiData.duration_type as string) || undefined,
        durationValue: (apiData.duration_value as number) || undefined,
      });

      // Populate skills from event data
      if (eventData.skills && eventData.skills.length > 0) {
        setSelectedSkillIds(eventData.skills.map((skill) => skill.uuid));
      }

      // Mark as initialized and ready to render form
      isInitializedRef.current = true;
      setIsFormReady(true);
    }
  }, [isEditMode, eventData]);

  // Stepper navigation with toast for restricted steps
  const handleStepSelect = useCallback(
    (step: number) => {
      if (canNavigateToStep(step)) {
        setCurrentStep(step);
      } else {
        toast.info('Please complete the current step first');
      }
    },
    [canNavigateToStep, setCurrentStep],
  );

  /**
   * Add/remove skill handlers for SkillSelector
   */
  const handleAddSkill = useCallback((skillUuid: string) => {
    setSelectedSkillIds((prev) => [...prev, skillUuid]);
  }, []);

  const handleRemoveSkill = useCallback((skillUuid: string) => {
    setSelectedSkillIds((prev) => prev.filter((id) => id !== skillUuid));
  }, []);

  /**
   * Handle design selection from modal
   */
  const handleDesignSelect = useCallback((design: Design) => {
    // Update core data for stepper validation
    setStep0CoreData((prev) => ({
      ...prev,
      designUuid: design.uuid,
    }));

    // Update UI data for display
    setStep0FormData((prev) => ({
      ...prev,
      design: design.url,
      designId: design.id,
      designTitle: design.name,
      designType: design.type,
      designUuid: design.uuid,
    }));
  }, []);

  /**
   * Handle design removal
   */
  const handleDeleteDesign = useCallback((e: React.MouseEvent<SVGElement>) => {
    e.stopPropagation();
    // Update core data for stepper validation
    setStep0CoreData((prev) => ({
      ...prev,
      designUuid: undefined,
    }));

    // Update UI data for display
    setStep0FormData((prev) => ({
      ...prev,
      design: undefined,
      designId: undefined,
      designTitle: undefined,
      designType: undefined,
      designUuid: undefined,
    }));
  }, []);

  /**
   * Handle design edit (reopen modal)
   */
  const handleEditDesign = useCallback((e: React.MouseEvent<SVGElement>) => {
    e.stopPropagation();
    setIsDesignModalOpen(true);
  }, []);

  /**
   * Trigger form submission via ref
   */
  const triggerStep0Submit = useCallback(() => {
    step0FormRef.current?.requestSubmit();
  }, []);

  /**
   * Handle Step 0 submission - Validate and navigate to Step 1
   */
  const handleStep0Submit = useCallback(
    async (formData: { name: string }) => {
      // Update core data for stepper validation
      const updatedCoreData: Step0Data = {
        ...step0CoreData,
        name: formData.name,
      };
      setStep0CoreData(updatedCoreData);

      // Update UI data for display
      setStep0FormData((prev) => ({
        ...prev,
        name: formData.name,
      }));

      // Validate that design is selected (required)
      if (!step0FormData.designUuid) {
        throw new Error('Please select a design'); // ← tells ConfigForm it failed
      }

      // In both create and edit mode, just navigate to Step 1
      // Event creation happens on final submit in Step 1
      goToNextStep();
    },
    [goToNextStep, step0CoreData, step0FormData.designUuid],
  );

  /**
   * Handle Step 1 submission - Update the event with full details
   */
  const handleStep1Submit = useCallback(
    async (formData: Step1FormData) => {
      // Store form data for persistence
      setStep1Data(formData);

      if (isEditMode && eventUuid) {
        // Edit mode: update existing event (supports null to clear optional fields)
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
        // Create mode: create event with all data from both steps
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

      // Mark Step 1 as completed
      markStepCompleted(1);
      router.push('/events');
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

  // Step 0 form schema and config
  const step0Schema = z.object({
    name: z
      .string()
      .min(1, 'Name is required')
      .max(255, 'Name must not exceed 255 characters')
      .transform((val) => val.trim()),
  });

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
    // Show checkmark when step is complete
    isComplete: isStep0Complete,
  };

  // Step 1 schema and config
  const step1Schema = z
    .object({
      description: z
        .string()
        .max(5000, 'Description must not exceed 5000 characters')
        .optional()
        .transform((val) => val?.trim() || undefined),
      learningLink: z
        .string()
        .max(500, 'Learning link must not exceed 500 characters')
        .url('Please enter a valid URL')
        .optional()
        .or(z.literal('')),
      typeId: z.string().min(1, 'Event type is required'),
      levelId: z.string().min(1, 'Event level is required'),
      formatId: z.string().min(1, 'Event format is required'),
      durationType: z.string().optional(),
      durationValue: z.coerce
        .number()
        .int('Must be a whole number')
        .min(0, 'Must be 0 or greater')
        .optional(),
    })
    .refine(
      (data) => {
        if (
          data.durationType &&
          (data.durationValue === undefined || data.durationValue === null)
        ) {
          return false;
        }
        return true;
      },
      {
        message: 'Duration is required when duration type is selected',
        path: ['durationValue'],
      },
    );

  const step1Config = {
    title: 'About',
    subtitle: 'Add a detailed description of your event.',
    layout: 'grid-3' as const,
    fields: [
      {
        name: 'description',
        label: 'Description',
        type: 'textarea' as FormFieldConfig['type'],
        placeholder: 'Write a description for this event...',
        className: 'col-span-3',
        rows: 5,
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
    onCancel: () => router.push('/events'),
    // Show checkmark when step is complete
    isComplete: isStep1Complete,
  };

  // Show loading state until form data is populated
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
        {/* Stepper Sidebar */}
        <Stepper
          steps={steps}
          activeIndex={currentStep}
          completedSteps={completedSteps}
          partialSteps={partialSteps}
          onSelect={handleStepSelect}
        />

        {/* Main Content */}
        <section className="lg:col-span-9">
          {/* Step 0: Info & Appearance */}
          {currentStep === 0 && (
            <div className="max-w-xl pb-12 px-4 lg:col-span-6">
              <ConfigForm
                config={{ ...step0Config, showSubmit: false }}
                initialValues={step0FormData}
                formRef={step0FormRef}
                isLoading={false}
                onChange={(values) => {
                  const name = (values.name as string) || '';
                  setStep0CoreData((prev) => (prev.name === name ? prev : { ...prev, name }));
                  setStep0FormData((prev) => (prev.name === name ? prev : { ...prev, name }));
                }}
              />

              {/* Design Selection */}
              <div className="mt-4">
                <div className="mb-2">
                  <label className="form-input-label">Appearance</label>
                  <p className="form-input-description -mt-2 mb-2">
                    Add a design to this event (required)
                  </p>
                </div>

                {step0FormData.design ? (
                  <div className="relative flex overflow-hidden rounded-lg border border-gray-300">
                    <div className="relative flex h-30 w-40 items-center justify-center overflow-hidden bg-gray-100 p-2">
                      <img
                        alt={step0FormData.designTitle}
                        src={step0FormData.design}
                        className="size-full object-contain"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h4 className="mb-1 text-sm font-medium">{step0FormData.designTitle}</h4>
                      <div className="flex items-center gap-x-1.5 text-gray-600">
                        <span className="capitalize bg-brand-softer border border-brand-subtle text-fg-brand-strong text-xs font-medium px-1.5 py-0.5 rounded">
                          {step0FormData.designType}
                        </span>
                      </div>
                      <div className="w-full mt-auto flex justify-between">
                        <button
                          type="button"
                          onClick={() => setIsPreviewOpen(true)}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Eye size={16} strokeWidth={1} />
                          <span className="text-xs font-medium ml-1">Preview</span>
                        </button>
                        <div className="flex items-center gap-2">
                          <SquarePen
                            size={16}
                            strokeWidth={1}
                            className="cursor-pointer hover:text-blue-600"
                            onClick={handleEditDesign}
                          />
                          <Trash
                            size={16}
                            strokeWidth={1}
                            className="cursor-pointer hover:text-red-600"
                            onClick={handleDeleteDesign}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsDesignModalOpen(true)}
                    className="w-full flex flex-col items-center rounded-lg border border-dashed border-gray-400 bg-gray-50 p-5 transition-colors hover:border-blue-500 hover:bg-gray-100"
                  >
                    <div className="mb-3">
                      <Images size={48} strokeWidth={1} className="text-gray-400" />
                    </div>
                    <div className="flex items-center gap-x-2 text-gray-600">
                      <Plus size={16} strokeWidth={1} />
                      <span className="text-sm">Add Design</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Step 0 Actions */}
              <div className="flex justify-end items-center mt-6">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => router.push('/events')}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary ml-3 flex items-center gap-2"
                  onClick={triggerStep0Submit}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Enhanced Details */}
          {currentStep === 1 && (
            <main className="max-w-xl pb-12 px-4 lg:col-span-6">
              <ConfigForm
                key={eventUuid ?? 'create'}
                config={step1Config}
                initialValues={step1Data}
                isLoading={createEvent.isPending || updateEvent.isPending || isLoadingDropdowns}
              >
                <SkillSelector
                  skills={skills}
                  selectedSkillIds={selectedSkillIds}
                  onAdd={handleAddSkill}
                  onRemove={handleRemoveSkill}
                  isLoading={isLoadingSkills}
                />
              </ConfigForm>
            </main>
          )}

          {/* Design Selector Modal */}
          <DesignSelectorModal
            isOpen={isDesignModalOpen}
            designsList={designs}
            onClose={() => setIsDesignModalOpen(false)}
            onSelect={handleDesignSelect}
          />

          {/* Design Preview Modal */}
          {isPreviewOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
              onClick={() => setIsPreviewOpen(false)}
            >
              <div
                className="relative bg-white rounded-lg shadow-xl p-6 max-w-3xl w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ✕
                </button>
                <h3 className="text-lg font-semibold mb-4">{step0FormData.designTitle}</h3>
                <div className="flex items-center justify-center bg-gray-50 rounded-lg p-6 min-h-64">
                  <img
                    src={step0FormData.design}
                    alt={step0FormData.designTitle}
                    className="max-h-[60vh] object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
