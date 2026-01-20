'use client';

import DesignForm from './DesignForm';

type DesignType = 'certificate' | 'badge';

export default function DesignFormPage({
  mode,
  designType,
  id,
}: {
  mode: 'add' | 'edit';
  designType: DesignType;
  id?: string;
}) {
  const isEdit = mode === 'edit';

  // Mock data for edit (replace with API)
  const design = isEdit
    ? {
        name: 'Course Completion Certificate',
        imageUrl: 'https://dev-quick-certify.sfo3.cdn.digitaloceanspaces.com/organizations/r/avatar/H7COHto2giyXNx7J8Ak5m.png',
        type: 'certificate' as DesignType,
      }
    : null;

  const isCertificate = designType === 'certificate';

  return (
    <DesignForm
      title={
        isEdit
          ? `Edit ${isCertificate ? 'Certificate' : 'Badge'} Design`
          : `Add New ${isCertificate ? 'Certificate' : 'Badge'}`
      }
      subtitle={
        isEdit
          ? `Edit ${isCertificate ? 'certificate' : 'badge'} design by updating name and image`
          : `Add new ${isCertificate ? 'certificate' : 'badge'} design by selecting name and image`
      }
      defaultName={design?.name}
      imageUrl={design?.imageUrl}
      designType={designType}
      onSubmit={(data) => {
        console.log({
          mode,
          designType,
          id,
          payload: data,
        });
      }}
    />
  );
}
