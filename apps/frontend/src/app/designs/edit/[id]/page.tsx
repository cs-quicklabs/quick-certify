import DesignFormPage from '@/app/designs/_components/DesignFormPage';
import { getDesignById } from '@/services/api/design.service';

export default async function EditDesignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const design = await getDesignById(id);

  return (
    <DesignFormPage
      mode="edit"
      id={id}
      designType={design.type}
    />
  );
}
