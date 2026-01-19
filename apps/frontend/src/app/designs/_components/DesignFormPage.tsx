'use client';

import DesignForm from './DesignForm';

export default function DesignFormPage({
  mode,
  id,
}: {
  mode: 'add' | 'edit';
  id?: string;
}) {
  const isEdit = mode === 'edit';

  const design = isEdit
    ? {
      name: 'Course Completion Certificate',
      imageUrl: '/certificate.png',
    }
    : null;

  return (
    <DesignForm
      title={isEdit ? 'Edit Design' : 'Add New Design'}
      subtitle={
        isEdit
          ? 'Edit certificate or badge design by Updating Name and Image'
          : 'Add new certificate or badge design by selecting Name and Image'
      }
      defaultName={design?.name}
      imageUrl={design?.imageUrl}
      onSubmit={(data) => {
        console.log(mode.toUpperCase(), data);
      }}
    />
  );
}
