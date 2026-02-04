'use client';

import { useEffect, useState } from 'react';
import DesignForm from './DesignForm';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useCreateDesign, useDesignById, useUpdateDesign } from '@/hooks/useDesigns';
import { DesignType } from '@/types';

export function DesignFormPage({
  mode,
  designType,
  id,
}: {
  mode: 'add' | 'edit';
  designType: DesignType;
  id?: string;
}) {
  const isEdit = mode === 'edit';

  const { data: design, isLoading } = useDesignById(id ?? '');
  const createDesign = useCreateDesign();
  const updateDesign = useUpdateDesign();

  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [initialName, setInitialName] = useState('');
  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const {
    upload,
    isUploading,
    error: uploadError,
  } = useImageUpload({
    category: 'design',
    onSuccess: (url) => setImageUrl(url),
  });

  useEffect(() => {
    if (isEdit && design) {
      setName(design.name);
      setImageUrl(design.url);

      setInitialName(design.name);
      setInitialImageUrl(design.url);
    }
  }, [isEdit, design]);

  const isDirty = isEdit
    ? name !== initialName || imageChanged || imageUrl !== initialImageUrl
    : Boolean(name.trim()) && Boolean(imageUrl || selectedFile);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    setImageChanged(true);
  };

  const handleSubmit = async ({ name }: { name: string }) => {
    if (isUploading || !isDirty) return;

    let resolvedImageUrl = imageUrl;

    try {
      if (selectedFile && imageChanged) {
        resolvedImageUrl = await upload(selectedFile);
      }

      if (!resolvedImageUrl) return;

      if (isEdit && id) {
        await updateDesign.mutateAsync({
          id,
          name,
          designType,
          designUrl: resolvedImageUrl,
        });

        setInitialName(name);
        setInitialImageUrl(resolvedImageUrl);
        setImageChanged(false);
      } else {
        await createDesign.mutateAsync({
          name,
          type: designType,
          url: resolvedImageUrl,
        });

        setSelectedFile(null);
        setImageUrl(null);
        setFormKey((k) => k + 1);
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Failed to save design. Please try again.');
    }
  };

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [success]);

  if (isEdit && isLoading) {
    return <div className="p-6 text-sm text-gray-500">Loading design…</div>;
  }

  return (
    <div>
      {success && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          Design saved successfully
        </div>
      )}
      <main className="flex justify-center max-w-7xl mx-auto pb-10 lg:px-8">
        <div className="w-full max-w-xl">
          <DesignForm
            key={formKey}
            mode={mode}
            designType={designType}
            title={
              isEdit
                ? `Edit ${designType === 'certificate' ? 'Certificate' : 'Badge'} Design`
                : `Add New ${designType === 'certificate' ? 'Certificate' : 'Badge'}`
            }
            subtitle={
              isEdit
                ? 'Drag and edit name directly on the certificate'
                : 'Upload image and provide a name'
            }
            name={name}
            onNameChangeAction={setName}
            imageUrl={imageUrl ?? undefined}
            isUploading={isUploading}
            uploadError={uploadError}
            isSaveDisabled={!isDirty || isUploading}
            onImageSelectAction={handleImageSelect}
            onSubmitAction={handleSubmit}
          />
        </div>
      </main>
    </div>
  );
}
