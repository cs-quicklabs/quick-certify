import { useState, useCallback, useMemo, useEffect } from 'react';

/**
 * Step 0 (Info & Appearance) data interface
 */
export interface Step0Data {
  name: string;
  designUuid?: string;
}

/**
 * Step 1 (Enhanced Details) data interface
 */
export interface Step1Data {
  description?: string;
  learningLink?: string;
  typeId?: string;
  levelId?: string;
  formatId?: string;
}

/**
 * Step validation result
 */
export interface StepValidation {
  isComplete: boolean;
  isPartial: boolean;
  missingFields: string[];
}

/**
 * Step configuration
 */
export interface StepConfig {
  id: number;
  title: string;
  subtitle: string;
  requiredFields: string[];
}

/**
 * Validation rules for each step
 */
const STEP_VALIDATIONS = {
  0: (data: Step0Data): StepValidation => {
    const missingFields: string[] = [];

    if (!data.name?.trim()) {
      missingFields.push('name');
    }
    if (!data.designUuid) {
      missingFields.push('design');
    }

    const isComplete = missingFields.length === 0;
    const isPartial = !isComplete && !!(data.name?.trim() || data.designUuid);

    return {
      isComplete,
      isPartial,
      missingFields,
    };
  },
  1: (data: Step1Data, skillIds: string[]): StepValidation => {
    // Step 1: ALL fields must be filled to show checkmark, otherwise show dot (partial)
    const hasDescription = !!data.description?.trim();
    const hasLearningLink = !!data.learningLink?.trim();
    const hasTypeId = !!data.typeId;
    const hasLevelId = !!data.levelId;
    const hasFormatId = !!data.formatId;
    const hasSkills = skillIds.length > 0;

    const missingFields: string[] = [];
    if (!hasDescription) missingFields.push('description');
    if (!hasLearningLink) missingFields.push('learningLink');
    if (!hasTypeId) missingFields.push('typeId');
    if (!hasLevelId) missingFields.push('levelId');
    if (!hasFormatId) missingFields.push('formatId');
    if (!hasSkills) missingFields.push('skills');

    const isComplete = missingFields.length === 0;

    // Partial if at least one field is filled but not all
    const filledCount = [
      hasDescription,
      hasLearningLink,
      hasTypeId,
      hasLevelId,
      hasFormatId,
      hasSkills,
    ].filter(Boolean).length;
    const isPartial = !isComplete && filledCount > 0;

    return {
      isComplete,
      isPartial,
      missingFields,
    };
  },
};

/**
 * Step definitions
 */
export const EVENT_STEPS: StepConfig[] = [
  {
    id: 0,
    title: 'Info & Appearance',
    subtitle: 'Basic event information',
    requiredFields: ['name', 'design'],
  },
  {
    id: 1,
    title: 'Enhanced details',
    subtitle: 'Description, links and tags',
    requiredFields: ['description', 'learningLink', 'type', 'level', 'format', 'skills'],
  },
];

/**
 * Hook return type
 */
export interface UseEventStepperReturn {
  /** Current active step */
  currentStep: number;
  /** Set current step directly */
  setCurrentStep: (step: number) => void;
  /** Navigate to next step */
  goToNextStep: () => void;
  /** Navigate to previous step */
  goToPreviousStep: () => void;
  /** Check if a step can be navigated to */
  canNavigateToStep: (step: number) => boolean;
  /** Get list of completed step indices */
  completedSteps: number[];
  /** Get list of partially completed step indices (dot indicator) */
  partialSteps: number[];
  /** Manually mark a step as completed */
  markStepCompleted: (stepIndex: number) => void;
  /** Check if step 1 is partial (some fields filled but not all) */
  isStep1Partial: boolean;
  /** Get validation status for a specific step */
  getStepValidation: (stepIndex: number) => StepValidation;
  /** Check if step 0 is complete based on current data */
  isStep0Complete: boolean;
  /** Check if step 1 is complete based on current data */
  isStep1Complete: boolean;
  /** Step configuration */
  steps: StepConfig[];
}

/**
 * Custom hook for managing event form stepper
 *
 * Follows SOLID principles:
 * - Single Responsibility: Manages only stepper state and validation
 * - Open/Closed: Easy to add more steps via STEP_VALIDATIONS
 * - Dependency Inversion: Depends on data interfaces, not concrete implementations
 *
 * @param initialStep - Starting step index
 * @param step0Data - Current step 0 data
 * @param step1Data - Current step 1 data
 * @param skillIds - Selected skill IDs
 * @returns Stepper state and control functions
 */
export function useEventStepper(
  initialStep: number,
  step0Data: Step0Data,
  step1Data: Step1Data,
  skillIds: string[] = [],
): UseEventStepperReturn {
  // Current active step
  const [currentStep, setCurrentStepState] = useState<number>(initialStep);

  // Track manually completed steps (for navigation history)
  const [manuallyCompletedSteps, setManuallyCompletedSteps] = useState<number[]>(
    initialStep > 0 ? Array.from({ length: initialStep }, (_, i) => i) : [],
  );

  // Update current step when initialStep changes (e.g., from URL)
  useEffect(() => {
    if (initialStep !== currentStep) {
      setCurrentStepState(initialStep);
      // Ensure all previous steps are marked as completed
      setManuallyCompletedSteps((prev) => {
        const newCompleted = Array.from({ length: initialStep }, (_, i) => i);
        return [...new Set([...prev, ...newCompleted])];
      });
    }
  }, [initialStep]);

  /**
   * Get validation for step 0
   */
  const step0Validation = useMemo(
    () => STEP_VALIDATIONS[0](step0Data),
    [step0Data.name, step0Data.designUuid],
  );

  /**
   * Get validation for step 1
   */
  const step1Validation = useMemo(
    () => STEP_VALIDATIONS[1](step1Data, skillIds),
    [step1Data, skillIds],
  );

  /**
   * Computed list of completed steps based on data validation
   */
  const completedSteps = useMemo(() => {
    const completed: number[] = [];

    if (step0Validation.isComplete) {
      completed.push(0);
    }
    if (step1Validation.isComplete) {
      completed.push(1);
    }

    // Merge with manually completed steps (for navigation history)
    return [...new Set([...completed, ...manuallyCompletedSteps])].sort((a, b) => a - b);
  }, [step0Validation.isComplete, step1Validation.isComplete, manuallyCompletedSteps]);

  /**
   * Computed list of partial steps (for dot indicator)
   */
  const partialSteps = useMemo(() => {
    const partial: number[] = [];

    // Step 0 doesn't show partial, only complete or empty
    // Step 1 shows partial when some fields are filled but not all
    if (step1Validation.isPartial && !step1Validation.isComplete) {
      partial.push(1);
    }

    return partial;
  }, [step1Validation.isPartial, step1Validation.isComplete]);

  /**
   * Check if step 0 is complete
   */
  const isStep0Complete = step0Validation.isComplete;

  /**
   * Check if step 1 is complete
   */
  const isStep1Complete = step1Validation.isComplete;

  /**
   * Check if step 1 is partial (some fields filled but not all)
   */
  const isStep1Partial = step1Validation.isPartial && !step1Validation.isComplete;

  /**
   * Set current step with validation
   */
  const setCurrentStep = useCallback(
    (step: number) => {
      setCurrentStepState((prev) => {
        const maxStep = Math.max(prev, ...manuallyCompletedSteps) + 1;
        const clampedStep = Math.min(Math.max(0, step), maxStep);
        return clampedStep;
      });
    },
    [manuallyCompletedSteps],
  );

  /**
   * Navigate to next step
   */
  const goToNextStep = useCallback(() => {
    setCurrentStepState((prev) => {
      const nextStep = Math.min(EVENT_STEPS.length - 1, prev + 1);
      // Mark current step as completed when moving forward
      setManuallyCompletedSteps((completed) =>
        completed.includes(prev) ? completed : [...completed, prev].sort((a, b) => a - b),
      );
      return nextStep;
    });
  }, []);

  /**
   * Navigate to previous step
   */
  const goToPreviousStep = useCallback(() => {
    setCurrentStepState((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Check if user can navigate to a specific step
   */
  const canNavigateToStep = useCallback(
    (step: number): boolean => {
      // Can always navigate to completed steps
      if (completedSteps.includes(step)) {
        return true;
      }
      // Can navigate to the next immediate step after the last completed
      const lastCompleted = Math.max(-1, ...completedSteps);
      return step === lastCompleted + 1;
    },
    [completedSteps],
  );

  /**
   * Mark a step as completed (manual override)
   */
  const markStepCompleted = useCallback((stepIndex: number) => {
    setManuallyCompletedSteps((prev) =>
      prev.includes(stepIndex) ? prev : [...prev, stepIndex].sort((a, b) => a - b),
    );
  }, []);

  /**
   * Get validation for a specific step
   */
  const getStepValidation = useCallback(
    (stepIndex: number): StepValidation => {
      if (stepIndex === 0) return step0Validation;
      if (stepIndex === 1) return step1Validation;
      return { isComplete: false, isPartial: false, missingFields: [] };
    },
    [step0Validation, step1Validation],
  );

  return {
    currentStep,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    canNavigateToStep,
    completedSteps,
    partialSteps,
    markStepCompleted,
    getStepValidation,
    isStep0Complete,
    isStep1Complete,
    isStep1Partial,
    steps: EVENT_STEPS,
  };
}
