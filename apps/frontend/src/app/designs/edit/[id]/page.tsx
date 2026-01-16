import DesignFormPage from '../../_components/DesignFormPage';

export default function EditDesignPage({
  params,
}: {
  params: { id: string };
}) {
  return <DesignFormPage mode="edit" id={params.id} />;
}
