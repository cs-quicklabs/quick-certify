export default function DesignPreview({
  name,
  imageUrl,
}: {
  name: string;
  imageUrl: string;
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">{name}</h1>
      <div className="border rounded-lg overflow-hidden">
        <img src={imageUrl} className="w-full" />
      </div>
    </div>
  );
}
