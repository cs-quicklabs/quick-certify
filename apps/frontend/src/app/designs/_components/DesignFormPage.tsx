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

  const [formKey, setFormKey] = useState(0);
  const [success, setSuccess] = useState(false);

  const { upload, isUploading, error: uploadError } = useImageUpload({
    category: 'design',
    onSuccess: (url) => setUploadedUrl(url),
  });

  const createDesign = useCreateDesign();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);        // store locally
  };

  const updateDesign = useUpdateDesign();

  const handleSubmit = async ({ name }: { name: string }) => {
    let finalUrl = uploadedUrl;

    //Upload ONLY on save
    if (selectedFile) {
      finalUrl = await upload(selectedFile);
    }

    if (!finalUrl) return;

    if (isEdit && id) {
      await updateDesign.mutateAsync({
        id,
        name,
        designType,
        designUrl: finalUrl,
      });
    } else {
      await createDesign.mutateAsync({
        name,
        type: designType,
        url: finalUrl,
      });
    }

    setSuccess(true);
    setSelectedFile(null);
    setUploadedUrl(null);
    setFormKey((k) => k + 1);
  };

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(false), 3000);
    return () => clearTimeout(t);
  }, [success]);


  if (isEdit && loading) {
    return <div className="p-6 text-sm text-gray-500">Loading design…</div>;
  }

  return (
    <>
      {success && (
        <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
          Design saved successfully
        </div>
      )}

      {/* Design Form */}
      <DesignForm
        key={formKey}
        mode={mode}
        designType={designType}
        title={
          mode === 'edit'
            ? `Edit ${designType === 'certificate' ? 'Certificate' : 'Badge'} Design`
            : `Add New ${designType === 'certificate' ? 'Certificate' : 'Badge'}`
        }
        subtitle={
          mode === 'edit'
            ? 'Drag and edit name directly on the certificate'
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
