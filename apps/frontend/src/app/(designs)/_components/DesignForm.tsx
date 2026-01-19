'use client';

type Props = {
  title: string;
  subtitle: string;
  defaultName?: string;
  imageUrl?: string;
  onSubmit: (data: { name: string; image: File | null }) => void;
};

export default function DesignForm({
  title,
  subtitle,
  defaultName = '',
  imageUrl,
  onSubmit,
}: Props) {
  let image: File | null = null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const name = (e.currentTarget.elements.namedItem(
          'name'
        ) as HTMLInputElement).value;
        onSubmit({ name, image });
      }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">
          {title.includes('Edit') ? 'Edit Name' : 'Add Name'}
        </label>
        <input
          name="name"
          defaultValue={defaultName}
          className="w-full border rounded-md px-3 py-2"
          placeholder="Name"
        />
      </div>

      <div className="mb-8">
        <label className="block text-sm font-medium mb-1">
          Upload Image
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Upload A4 (11008×800) or (440×400) for badge
        </p>

        <label className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer block">
          {imageUrl ? (
            <img src={imageUrl} className="mx-auto max-h-40" />
          ) : (
            <>
              <p className="text-gray-400">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400">Size: 1920x300</p>
            </>
          )}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) image = e.target.files[0];
            }}
          />
        </label>
      </div>

      <div className="flex gap-4">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md">
          Save Design
        </button>
        <button
          type="button"
          className="border px-6 py-2 rounded-md"
        >
          Replace Image
        </button>
      </div>
    </form>
  );
}
