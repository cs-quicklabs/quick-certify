import DesignFormPage from '../_components/DesignFormPage';

type DesignType = 'certificate' | 'badge';

export default function AddDesignPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const designType: DesignType =
    searchParams.type === 'badge' ? 'badge' : 'certificate';

  return (
    <DesignFormPage
      mode="add"
      designType={designType}
    />
  );
}
