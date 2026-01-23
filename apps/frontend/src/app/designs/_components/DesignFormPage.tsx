'use client';

import { useEffect, useState } from 'react';
import DesignForm from './DesignForm';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useCreateDesign, useDesignById, useUpdateDesign } from '@/hooks/useDesigns';

type DesignType = 'certificate' | 'badge';

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

  const { design, loading } = useDesignById(id ?? '');
  const [name, setName] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  // Populate fields once design loads
  useEffect(() => {
    if (isEdit && design) {
      setName(design.name);
      setUploadedUrl(design.url); // existing image
    }
  }, [isEdit, design]);


  const {
    upload,
    isUploading,
    error: uploadError,
  } = useImageUpload({
    category: 'design',
    onSuccess: (url) => setUploadedUrl(url),
  });

  const createDesign = useCreateDesign();

  const handleImageSelect = async (file: File) => {
    await upload(file, uploadedUrl ?? undefined);
  };

  const updateDesign = useUpdateDesign();

  const handleSubmit = async ({ name }: { name: string }) => {
    if (!uploadedUrl) return;

    if (isEdit && id) {
      await updateDesign.mutateAsync({
        id,
        name,
        designType,
        designUrl: uploadedUrl,
      });
    } else {
      await createDesign.mutateAsync({
        name,
        type: designType,
        url: uploadedUrl,
      });
    }
  };


  if (isEdit && loading) {
    return <div className="p-6 text-sm text-gray-500">Loading design…</div>;
  }

  return (
    <>
      <DesignForm
        mode={mode}
        designType={designType}
        title={
          isEdit
            ? `Edit ${designType === 'certificate' ? 'Certificate' : 'Badge'} Design`
            : `Add New ${designType === 'certificate' ? 'Certificate' : 'Badge'}`
        }
        subtitle={
          isEdit
            ? 'Update design name or replace image'
            : 'Upload image and provide a name'
        }
        defaultName={name}
        imageUrl={uploadedUrl ?? undefined}
        isUploading={isUploading}
        uploadComplete={!!uploadedUrl}
        onImageSelectAction={handleImageSelect}
        onSubmitAction={handleSubmit}
      />

      {uploadError && (
        <p className="mt-3 text-center text-sm text-red-600">
          {uploadError}
        </p>
      )}
    </>
  );
}
