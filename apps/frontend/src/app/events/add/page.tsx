'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { ConfigForm } from '@/components/ConfigForm';
import type { FormFieldConfig } from '@/types/form.types';
import { Stepper } from '@/components/Stepper';
import { useEventTypes, useEventLevels, useEventFormats, useCreateEvent } from '@/hooks/useEvents';
import { FileDropzone } from '@/components';
import { useOrganizationSettings } from '@/hooks/useAccountSettings';

export default function CreateEventPage() {
  const router = useRouter();
  // stepper state
  const [step, setStep] = useState<number>(0);

  // temporary storage for step0 (info + appearance) values
  const [step0Data, setStep0Data] = useState<{ name: string; design?: string }>({ name: '' });
  const { data: settings } = useOrganizationSettings();

  const createEvent = useCreateEvent();

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const { data: typesData } = useEventTypes({ page: 1, limit: 100 });
  const { data: levelsData } = useEventLevels({ page: 1, limit: 100 });
  const { data: formatsData } = useEventFormats({ page: 1, limit: 100 });

  const types = typesData?.data || [];
  const levels = levelsData?.data || [];
  const formats = formatsData?.data || [];
  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !skills.includes(v)) {
      setSkills((s) => [...s, v]);
      setSkillInput('');
    }
  };

  const removeSkill = (sToRemove: string) => {
    setSkills((s) => s.filter((x) => x !== sToRemove));
  };

  const goNext = () => setStep((s) => Math.min(1, s + 1));

  // Step 0 form schema and config (Info + Appearance)
  const step0Schema = z.object({
    name: z.string().min(1, 'Name is required'),
    design: z.string().optional(),
  });

  const step0Config = {
    title: 'Info & Appearance',
    subtitle: 'Provide a name and attach a design for this event',
    fields: [{ name: 'name', label: 'Name', type: 'text' as FormFieldConfig['type'], placeholder: 'Name of Event', required: true }] as FormFieldConfig[],
    schema: step0Schema,
    submitLabel: 'Next',
    onSubmit: async (data: z.infer<typeof step0Schema>) => {
      setStep0Data({ name: data.name, design: data.design });
      goNext();
    },
  };

  // Step 1 schema and config (Enhanced details + types)
  const step1Schema = z.object({
    description: z.string().optional(),
    website: z.string().optional(),
    typeId: z.string().optional(),
    levelId: z.string().optional(),
    formatId: z.string().optional(),
  });

  const step1Config = {
    title: 'About',
    subtitle: 'Add details and type information',
    layout: 'grid-3' as const,
    fields: [
      { name: 'description', label: 'Description', type: 'textarea' as FormFieldConfig['type'], placeholder: 'Write more description here...', className: 'col-span-3', rows: 5 },
      { name: 'website', label: 'Learning Events Link', type: 'text' as FormFieldConfig['type'], className: 'col-span-3' },
      { name: 'typeId', label: 'Event Type', type: 'select' as FormFieldConfig['type'], options: types.map((t) => ({ label: t.name, value: t.id })) },
      { name: 'levelId', label: 'Events Level', type: 'select' as FormFieldConfig['type'], options: levels.map((l) => ({ label: l.name, value: l.id })) },
      { name: 'formatId', label: 'Events Format', type: 'select' as FormFieldConfig['type'], options: formats.map((f) => ({ label: f.name, value: f.id })) },
    ] as FormFieldConfig[],
    schema: step1Schema,
    submitLabel: 'Save Event',
    onSubmit: async (data: z.infer<typeof step1Schema>) => {
      // combine form values and submit
      const payload = {
        name: step0Data.name,
        appearance: step0Data.design,
        eventTypeId: data.typeId || undefined,
        eventLevelId: data.levelId || undefined,
        eventFormatId: data.formatId || undefined,
        description: data.description || undefined,
        website: data.website || undefined,
        skills: skills.length ? skills : undefined,
      } as unknown as Parameters<typeof createEvent.mutate>[0];

      await createEvent.mutateAsync(payload);
      router.push('/events');
    },
    onCancel: () => router.push('/events'),
  };

  const [isUploading, setIsUploading] = useState(false);

  const step0FormRef = useRef<HTMLFormElement>(null);

  const handleBannerChange = async (url: string | null) => {
    // FileDropzone will call this with the uploaded file url. Save into step0Data so it is included in payload.
    setStep0Data((s) => ({ ...s, design: url || undefined }));
    setIsUploading(false);
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 lg:py-12 lg:px-8">
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Stepper steps={[{ title: 'Info & Appearance', subtitle: 'Basic event information' }, { title: 'Enhanced details', subtitle: 'Description, links and tags' }]}
            activeIndex={step}
            onSelect={(i) => setStep(i)} />

          {/* Content (right) */}
          <section className="lg:col-span-9">
            {step === 0 && (
              <div className="max-w-xl pb-12 px-4 lg:col-span-6">
                <div>
                  <ConfigForm
                    config={{ ...step0Config, showSubmit: false }}
                    initialValues={step0Data}
                    formRef={step0FormRef}
                  />
                  <div className='mt-4' />
                  <FileDropzone
                    label="Appearance"
                    description="Attach a design to this group. If it contains multiple pages, all of them will be included."
                    accept="image/png,image/jpg,image/jpeg"
                    currentImage={settings?.banner_url || null}
                    onImageChange={handleBannerChange}
                    category="banner"
                    maxSizeMB={1}
                    imageSize="large"
                    dropzoneHeight="large"
                    dropzoneWidth="full"
                    isUploading={isUploading}
                    setIsUploading={setIsUploading}
                  />

                  <div className="flex justify-between items-center mt-4">
                    <div />
                    <div className="flex gap-2">
                      <button type="button" className="btn-secondary" onClick={() => router.push('/events')}>Cancel</button>
                      <button type="button" className="btn-primary" onClick={() => { if (!isUploading) step0FormRef.current?.requestSubmit(); }} disabled={isUploading}>
                        {isUploading ? 'Uploading...' : 'Next'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}



            {step === 1 && (
              <main className="max-w-xl pb-12 px-4 lg:col-span-6">
                <ConfigForm config={step1Config}>
                  <div className="w-full">
                    <label className="form-input-label">Skills</label>
                    <div className="form-input-field flex flex-wrap items-center gap-2 min-h-13">
                      {skills.map((s) => (
                        <span key={s} className="inline-flex m-1 items-center bg-neutral-secondary-medium border border-default-medium text-heading text-xs font-medium px-2 py-0.5 rounded gap-1">
                          {s}
                          <button type="button" onClick={() => removeSkill(s)} className="ml-1 text-sm">×</button>
                        </span>
                      ))}
                      <input className="flex-1 w-full h-10 border-0 outline-none bg-transparent"
                        type="text" placeholder="Name of skill" value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      />
                      {/* <button type="button" onClick={addSkill} className="btn-outline">Add</button> */}
                    </div>
                    <p className="form-input-description mt-2">Specify the name of the skills associated with this event</p>
                  </div>
                </ConfigForm>
              </main>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
