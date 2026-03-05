import { useEffect, useRef } from 'react';
import type { Event } from '@/types';
import type { Step0Data, Step1Data } from '@/hooks/useEventStepper';

interface Step0FormData extends Step0Data {
  design?: string;
  designId?: string;
  designTitle?: string;
  designType?: string;
}

interface UseEventFormInitializationProps {
  isEditMode: boolean;
  eventUuid: string | undefined;
  eventData: Event | undefined;
  setStep0CoreData: React.Dispatch<React.SetStateAction<Step0Data>>;
  setStep0FormData: React.Dispatch<React.SetStateAction<Step0FormData>>;
  setStep1Data: React.Dispatch<React.SetStateAction<Step1Data>>;
  setSelectedSkillIds: React.Dispatch<React.SetStateAction<string[]>>;
  setIsFormReady: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useEventFormInitialization({
  isEditMode,
  eventUuid,
  eventData,
  setStep0CoreData,
  setStep0FormData,
  setStep1Data,
  setSelectedSkillIds,
  setIsFormReady,
}: UseEventFormInitializationProps) {
  const isInitializedRef = useRef(false);

  // Reset when mode or eventUuid changes
  useEffect(() => {
    isInitializedRef.current = false;
    setIsFormReady(!isEditMode);
  }, [isEditMode, eventUuid, setIsFormReady]);

  // Populate form when event data loads in edit mode
  useEffect(() => {
    if (isEditMode && eventData && !isInitializedRef.current) {
      const apiData = eventData as unknown as Record<string, unknown>;
      const designData = apiData.design as {
        url?: string;
        id?: string;
        name?: string;
        type?: string;
        uuid?: string;
      } | null;

      setStep0CoreData({
        name: (apiData.name as string) || '',
        designUuid: designData?.uuid,
      });

      setStep0FormData({
        name: (apiData.name as string) || '',
        design: designData?.url,
        designId: designData?.id,
        designTitle: designData?.name,
        designType: designData?.type,
        designUuid: designData?.uuid,
      });

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

      if (eventData.skills && eventData.skills.length > 0) {
        setSelectedSkillIds(eventData.skills.map((skill) => skill.uuid));
      }

      isInitializedRef.current = true;
      setIsFormReady(true);
    }
  }, [
    isEditMode,
    eventData,
    setStep0CoreData,
    setStep0FormData,
    setStep1Data,
    setSelectedSkillIds,
    setIsFormReady,
  ]);
}
