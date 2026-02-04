'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { ConfigForm } from '@/components/ConfigForm';
import type { FormFieldConfig } from '@/types/form.types';
import { Stepper } from '@/components/Stepper';
import { useEventTypes, useEventLevels, useEventFormats, useCreateEvent } from '@/hooks/useEvents';
import { /*FileDropzone,*/ } from '@/components';
import { DesignSelectorModal } from '@/components/designs/DesignSelectorModal';
import { CloudUpload } from 'lucide-react';

export default function CreateEventPage() {
  const router = useRouter();
  // stepper state
  const [step, setStep] = useState<number>(0);

  // temporary storage for step0 (info + appearance) values
  const [step0Data, setStep0Data] = useState<{ name: string; design?: string; designId?: string; designTitle?: string; designType?: string }>({ name: '' });

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
    designId: z.string().optional(),
    designTitle: z.string().optional(),
    designType: z.string().optional(),
  });

  const step0Config = {
    title: 'Info & Appearance',
    subtitle: 'Provide a name and attach a design for this event',
    fields: [{ name: 'name', label: 'Name', type: 'text' as FormFieldConfig['type'], placeholder: 'Name of Event', required: true }] as FormFieldConfig[],
    schema: step0Schema,
    submitLabel: 'Next',
    onSubmit: async (data: z.infer<typeof step0Schema>) => {
      // preserve design selected via modal if form field's design is empty
      setStep0Data((prev) => ({
        ...prev,
        name: data.name,
        design: data.design ?? prev.design,
        designId: data.designId ?? prev.designId,
        designTitle: data.designTitle ?? prev.designTitle,
        designType: data.designType ?? prev.designType,
      }));
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

  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const step0FormRef = useRef<HTMLFormElement>(null);

  const handleDesignSelect = (design: { id: string; title: string; type: string; thumbnail: string }) => {
    setStep0Data((s) => ({ ...s, design: design.thumbnail, designId: design.id, designTitle: design.title, designType: design.type }));
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

                  {/* Design placeholder - opens modal on click */}
                  <div className="mt-4"
                    tabIndex={0}
                    role='button'
                    onClick={() => setIsDesignModalOpen(true)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setIsDesignModalOpen(true); }}>
                    <div className="mb-2">
                      <label htmlFor="dropzone-file" className="form-input-label">Appearence</label>
                      <p className="form-input-description -mt-2 mb-2">Attach a design to this group. If it contains multiple pages, all of them will be included.</p>
                    </div>
                    {step0Data.design ? (
                      <div className="w-full cursor-pointer rounded border border-dashed border-gray-300 p-4 flex items-center gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                            <img src={step0Data.design} alt={step0Data.designTitle || 'Design'} className="object-contain max-h-full" />
                          </div>
                          <div>
                            <div className="text-sm font-medium">{step0Data.designTitle || 'Selected design'}</div>
                            <div className="text-xs text-muted mt-1">{step0Data.designType}</div>
                          </div>
                        </div>
                      </div>
                    ) :

                      <div className="flex justify-center items-center w-full cursor-pointer"
                      >
                        <label htmlFor="dropzone-file" className="flex flex-col justify-center items-center w-full h-40 bg-gray-50 rounded-sm border-2 border-gray-300 border-dashed cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                          <div className="flex flex-col justify-center items-center pt-5 pb-6">
                            {/* <svg aria-hidden="true" className="mb-3 w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12">
                            </path>
                          </svg> */}
                            <CloudUpload className="mb-3" size={'42'} strokeWidth={'2'} color='#99a1af' />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">Size: 1920x300</p></div>
                          <input id="dropzone-file" type="file" className="hidden" />
                        </label>
                      </div>
                    }
                  </div>

                  {/* <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsDesignModalOpen(true)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setIsDesignModalOpen(true); }}
                    className="w-full cursor-pointer rounded border border-dashed border-gray-300 p-4 flex items-center gap-4"
                  >
                    {step0Data.design ? (
                      <div className="flex items-center gap-4">
                        <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                          <img src={step0Data.design} alt={step0Data.designTitle || 'Design'} className="object-contain max-h-full" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{step0Data.designTitle || 'Selected design'}</div>
                          <div className="text-xs text-muted mt-1">{step0Data.designType}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-28 h-20 bg-gray-50 rounded border border-gray-100 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5h18M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Select a design</div>
                          <div className="text-xs text-muted mt-1">Click to choose from your designs library</div>
                        </div>
                      </div>
                    )}
                  </div> */}

                  <div className="flex justify-between items-center mt-4">
                    <div />
                    <div className="flex gap-2">
                      <button type="button" className="btn-secondary" onClick={() => router.push('/events')}>Cancel</button>
                      <button type="button" className="btn-primary" onClick={() => step0FormRef.current?.requestSubmit()}>
                        Next
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

            {/* Design selector modal - render once so it can be opened from any step */}
            <DesignSelectorModal isOpen={isDesignModalOpen} onClose={() => setIsDesignModalOpen(false)} onSelect={handleDesignSelect} />
          </section>
        </div>
      </div>
    </div>
  );
}
