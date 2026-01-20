import DesignFormPage from '../_components/DesignFormPage';

export default function AddDesignPage({
  searchParams,
}: {
  searchParams: { type?: 'certificate' | 'badge' };
}) {
  return (
    <DesignFormPage
      mode="add"
      designType={searchParams.type ?? 'certificate'}
    />
  );
}
