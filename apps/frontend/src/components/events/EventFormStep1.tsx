'use client';

import { ConfigForm } from '@/components/ConfigForm';
import { SkillSelector } from '@/components/events/SkillSelector';
import type { FormConfig } from '@/types/form.types';
import type { Skill } from '@/services/api/skill.service';
import type { ZodTypeAny } from 'zod';

interface EventFormStep1Props {
  config: FormConfig<ZodTypeAny>;
  initialValues: Record<string, unknown>;
  formKey: string;
  skills: Skill[];
  selectedSkillIds: string[];
  onSkillAdd: (uuid: string) => void;
  onSkillRemove: (uuid: string) => void;
  isLoadingSkills: boolean;
  isLoading: boolean;
}

export function EventFormStep1({
  config,
  initialValues,
  formKey,
  skills,
  selectedSkillIds,
  onSkillAdd,
  onSkillRemove,
  isLoadingSkills,
  isLoading,
}: EventFormStep1Props) {
  return (
    <main className="max-w-xl pb-12 px-4 lg:col-span-6">
      <ConfigForm key={formKey} config={config} initialValues={initialValues} isLoading={isLoading}>
        <SkillSelector
          skills={skills}
          selectedSkillIds={selectedSkillIds}
          onAdd={onSkillAdd}
          onRemove={onSkillRemove}
          isLoading={isLoadingSkills}
        />
      </ConfigForm>
    </main>
  );
}
