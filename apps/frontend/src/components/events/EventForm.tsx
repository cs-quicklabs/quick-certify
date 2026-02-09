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
import { Eye, Images, Plus, SquarePen, Trash, Loader2, X } from 'lucide-react';
import { useDesignList } from '@/hooks/useDesigns';
import { Design } from '@/types';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { getApiErrorMessage } from '@/lib/api-error';
import { Event } from '@/services';

// Maximum number of items to fetch for dropdown lists
const DROPDOWN_PAGE_SIZE = 100;

// Maximum number of skills allowed
const MAX_SKILLS = 20;

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
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Step 0 data storage (core data for stepper validation)
  const [step0CoreData, setStep0CoreData] = useState<Step0Data>({ name: '' });

  // Step 0 UI data storage (includes display fields)
  const [step0FormData, setStep0FormData] = useState<Step0FormData>({ name: '' });

  // Step 1 data storage
  const [step1Data, setStep1Data] = useState<Step1FormData>({});

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
    isStep1Partial,
    steps,
  } = useEventStepper(initialStep, step0CoreData, step1Data, selectedSkillIds);

  // Skills search UI state
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);
  const skillDropdownRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);

  // Form refs
  const step0FormRef = useRef<HTMLFormElement>(null);

  // Fetch event data if in edit mode
  const shouldFetchEvent = isEditMode && !!eventUuid && !initialEventData;
  const { data: eventData, isLoading: isLoadingEvent } = useEvent(
    eventUuid ?? '',
    shouldFetchEvent
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

  const isLoadingDropdowns = isLoadingTypes || isLoadingLevels || isLoadingFormats || isLoadingSkills;

  // Filter skills based on search query
  const filteredSkills = skillSearchQuery.trim()
    ? skills.filter((skill) =>
      skill.name.toLowerCase().includes(skillSearchQuery.toLowerCase())
    )
    : skills;

  // Get selected skill objects
  const selectedSkills = skills.filter((skill) => selectedSkillIds.includes(skill.uuid));

  // Track if form has been initialized to prevent infinite loops
  const isInitializedRef = useRef(false);

  // Reset initialization when mode or eventUuid changes
  useEffect(() => {
    isInitializedRef.current = false;
  }, [mode, eventUuid]);

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
        learningLink: (apiData.learning_link as string) || (apiData.learningLink as string) || undefined,
        typeId: eventData.event_type?.uuid,
        levelId: eventData.event_level?.uuid,
        formatId: eventData.event_format?.uuid,
      });

      // Populate skills from event data
      if (eventData.skills && eventData.skills.length > 0) {
        setSelectedSkillIds(eventData.skills.map((skill) => skill.uuid));
      }

      // Mark as initialized to prevent re-running
      isInitializedRef.current = true;
    }
  }, [isEditMode, eventData]);

  // Stepper navigation with toast for restricted steps
  const handleStepSelect = useCallback((step: number) => {
    if (canNavigateToStep(step)) {
      setCurrentStep(step);
    } else {
      toast.info('Please complete the current step first');
    }
  }, [canNavigateToStep, setCurrentStep]);

  /**
   * Add a skill to the list
   */
  const addSkill = useCallback((skillUuid: string) => {
    if (selectedSkillIds.length >= MAX_SKILLS) {
      toast.error(`Maximum ${MAX_SKILLS} skills allowed`);
      return;
    }

    if (selectedSkillIds.includes(skillUuid)) {
      toast.error('This skill has already been added');
      return;
    }

    setSelectedSkillIds((prev) => [...prev, skillUuid]);
    setSkillSearchQuery('');
    setIsSkillDropdownOpen(false);
  }, [selectedSkillIds]);

  /**
   * Remove a skill from the list
   */
  const removeSkill = useCallback((skillUuid: string) => {
    setSelectedSkillIds((prev) => prev.filter((id) => id !== skillUuid));
  }, []);

  /**
   * Handle click outside to close dropdown
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (skillDropdownRef.current && !skillDropdownRef.current.contains(event.target as Node)) {
        setIsSkillDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
   * Handle Step 0 submission - Create or validate event
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
        toast.error('Please select a design');
        return;
      }

      if (isEditMode) {
        // In edit mode, just go next (stepper hook will auto-mark as complete)
        goToNextStep();
      } else {
        // In create mode, create the event
        setIsCreating(true);

        try {
          const createdEvent = await createEvent.mutateAsync({
            name: formData.name,
            designId: step0FormData.designUuid,
          });

          // Navigate to edit page with step=1 to go directly to Enhanced details
          router.replace(`/events/edit?id=${createdEvent.uuid}&step=1`);
        } catch (error) {
          const message = getApiErrorMessage(error, 'Failed to create event');
          toast.error(message);
        } finally {
          setIsCreating(false);
        }
      }
    },
    [createEvent, goToNextStep, step0CoreData, step0FormData.designUuid, isEditMode, router],
  );

  /**
   * Handle Step 1 submission - Update the event with full details
   */
  const handleStep1Submit = useCallback(
    async (formData: Step1FormData) => {
      if (!eventUuid) {
        toast.error('Event not found. Please start over.');
        return;
      }

      setIsUpdating(true);

      try {
        // Store form data for persistence
        setStep1Data(formData);

        // Update event with full details including skills
        await updateEvent.mutateAsync({
          name: step0CoreData.name,
          designId: step0FormData.designUuid,
          eventTypeId: formData.typeId || null,
          eventLevelId: formData.levelId || null,
          eventFormatId: formData.formatId || null,
          description: formData.description || null,
          learningLink: formData.learningLink || null,
          skillIds: selectedSkillIds,
        });

        // Mark Step 1 as completed
        markStepCompleted(1);

        toast.success(isEditMode ? 'Event updated successfully!' : 'Event saved successfully!');
        router.push('/events');
      } catch (error) {
        const message = getApiErrorMessage(error, 'Failed to update event');
        toast.error(message);
        console.error('Failed to update event:', error);
      } finally {
        setIsUpdating(false);
      }
    },
    [eventUuid, updateEvent, step0CoreData.name, step0FormData.designUuid, selectedSkillIds, router, markStepCompleted, isEditMode],
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
    subtitle: isEditMode ? 'Edit the event details.' : 'Create a new event to issue credentials on specific occasions.',
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'text' as FormFieldConfig['type'],
        placeholder: 'Event name',
        required: true,
        description: 'Specify the name of the occasion on which you would like to issue credentials. '
      },
    ] as FormFieldConfig[],
    schema: step0Schema,
    submitLabel: 'Next',
    onSubmit: handleStep0Submit,
    // Show checkmark when step is complete
    isComplete: isStep0Complete,
  };

  // Step 1 schema and config
  const step1Schema = z.object({
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
    typeId: z.string().optional(),
    levelId: z.string().optional(),
    formatId: z.string().optional(),
  });

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
      },
      {
        name: 'levelId',
        label: 'Event Level',
        type: 'select' as FormFieldConfig['type'],
        placeholder: isLoadingLevels ? 'Loading...' : 'Select level',
        options: levels.map((l) => ({ label: l.name, value: l.uuid })),
        disabled: isLoadingLevels,
      },
      {
        name: 'formatId',
        label: 'Event Format',
        type: 'select' as FormFieldConfig['type'],
        placeholder: isLoadingFormats ? 'Loading...' : 'Select format',
        options: formats.map((f) => ({ label: f.name, value: f.uuid })),
        disabled: isLoadingFormats,
      },
    ] as FormFieldConfig[],
    schema: step1Schema,
    submitLabel: isUpdating ? 'Saving...' : isEditMode ? 'Update Event' : 'Save Event',
    onSubmit: handleStep1Submit,
    onCancel: () => router.push('/events'),
    // Show checkmark when step is complete
    isComplete: isStep1Complete,
  };

  // Show loading state when fetching event data in edit mode
  if (isEditMode && isLoadingEvent && !initialEventData) {
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
                key={step0FormData.name || 'empty'} // Force remount when data loads
                config={{ ...step0Config, showSubmit: false }}
                initialValues={step0FormData}
                formRef={step0FormRef}
                isLoading={isCreating}
              />

              {/* Design Selection */}
              <div className="mt-4">
                <div className="mb-2">
                  <label className="form-input-label">
                    Appearance
                  </label>
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
                        <Link
                          href={`/designs/preview/${step0FormData.designUuid}`}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Eye size={16} strokeWidth={1} />
                          <span className="text-xs font-medium ml-1">Preview</span>
                        </Link>
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
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary ml-3 flex items-center gap-2"
                  onClick={triggerStep0Submit}
                  disabled={isCreating}
                >
                  {isCreating && <Loader2 size={16} className="animate-spin" />}
                  {isEditMode ? 'Next' : isCreating ? 'Creating...' : 'Next'}
                </button>
              </div>
            </div>
          )}

          {/* Step 1: Enhanced Details */}
          {currentStep === 1 && (
            <main className="max-w-xl pb-12 px-4 lg:col-span-6">
              <ConfigForm
                key={step1Data.learningLink || step1Data.description || 'empty'} // Force remount when data loads
                config={step1Config}
                initialValues={step1Data}
                isLoading={isUpdating || isLoadingDropdowns}
              >
                {/* Skills Selection */}
                <div className="w-full col-span-3" ref={skillDropdownRef}>
                  <label className="form-input-label">
                    Skills
                    <span className="text-gray-400 font-normal ml-1">
                      ({selectedSkillIds.length}/{MAX_SKILLS})
                    </span>
                    {selectedSkillIds.length > 0 && (
                      <span className="ml-2 text-green-600 text-xs">✓</span>
                    )}
                  </label>

                  {/* Selected Skills Chips */}
                  <div className="form-input-field flex flex-wrap items-center gap-2 min-h-13">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill.uuid}
                        className='ps-1.5 pe-0.5 py-0.5 inline-flex items-center bg-neutral-secondary-medium border border-default-medium text-heading text-xs font-medium  rounded gap-1 m-0.5'>
                        {skill.name}
                        <X size={'15'} strokeWidth={'2.3'} className='hover:bg-neutral-quaternary rounded-xs p-0.5'
                          onClick={() => removeSkill(skill.uuid)} />
                      </span>
                    ))}

                    {/* Skill Search Input */}
                    {selectedSkillIds.length < MAX_SKILLS && (
                      <div className="relative flex-1 min-w-50">
                        <input
                          className="w-full h-10 border-0 outline-none bg-transparent"
                          type="text"
                          placeholder={isLoadingSkills ? 'Loading skills...' : 'Search and select skills...'}
                          value={skillSearchQuery}
                          onChange={(e) => {
                            setSkillSearchQuery(e.target.value);
                            setIsSkillDropdownOpen(true);
                          }}
                          onFocus={() => setIsSkillDropdownOpen(true)}
                          disabled={isLoadingSkills}
                        />

                        {/* Skills Dropdown */}
                        {isSkillDropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredSkills.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-gray-500">
                                {skillSearchQuery.trim() ? 'No matching skills found' : 'No skills available'}
                              </div>
                            ) : (
                              filteredSkills.map((skill) => {
                                const isSelected = selectedSkillIds.includes(skill.uuid);
                                return (
                                  <button
                                    key={skill.uuid}
                                    type="button"
                                    onClick={() => !isSelected && addSkill(skill.uuid)}
                                    disabled={isSelected}
                                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between ${isSelected ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'text-gray-900'
                                      }`}
                                  >
                                    <span>{skill.name}</span>
                                    {isSelected && <span className="text-xs">Already added</span>}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="form-input-description mt-2">
                    Select skills associated with this event from the available options.
                  </p>
                </div>
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
        </section>
      </div>
    </div>
  );
}
