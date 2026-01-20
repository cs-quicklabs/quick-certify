import DesignPreview from '@/app/designs/_components/DesignPreview';
import { getDesignById } from '@/services/api/design.service';
export default async function PreviewModalPage({
  params,
}: {
  params: { id: string };
}) {
  const design = await getDesignById(params.id);

  return (
    <DesignPreview
      name={design.name}
      imageUrl={design.imageUrl}
    />
  );
}

