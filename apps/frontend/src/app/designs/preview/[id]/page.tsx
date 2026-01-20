import DesignPreview from '@/app/designs/_components/DesignPreview';


export default async function PreviewDesignPage({
  params,
}: {
  params: { id: string };
}) {
  const design = await getDesignById(params.id);

  return (
    <DesignPreview
      name={design.name}
      imageUrl={design.thumbnail}
    />
  );
}

/* -------------------------------------------
   TEMP MOCK (replace with service/db call)
-------------------------------------------- */
async function getDesignById(id: string) {
  return {
    id,
    name: 'Customer Centricity',
    thumbnail:
      'https://dev.quick-certify.sfo3.digitaloceanspaces.com/organizations/r/avatar/WE7o9qv0SOFQ65ab0OZv3.png',
  };
}
