import DesignFormPage from '@/app/designs/_components/DesignFormPage';
import { getDesignById } from '@/services/api/design.service';

export default async function EditDesignPage({
  params,
}: {
  params: { id: string };
}) {
  const design = await getDesignById(params.id);

  return (
    <DesignFormPage
      mode="edit"
      id={params.id}
      designType={design.type}
    />
  );
}
