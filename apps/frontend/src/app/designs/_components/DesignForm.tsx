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
      className="max-w-xl mx-auto py-6 px-5"
    >
      <div className="mb-4">
        <h1 className="text-medium font-semibold">{title}</h1>
        <p className="text-xs font-medium text-gray-500">{subtitle}</p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-1">
          {title.includes('Edit') ? 'Edit Name' : 'Add Name'}
        </label>
        <input
          name="name"
          defaultValue={defaultName}
          className="w-full border text-sm border-gray-200 font-semibold rounded-md px-3 py-2"
          placeholder="Name"
        />
      </div>

      <div className="mb-8">
        <label className="block text-sm font-semibold mb-1">
          Upload Image
        </label>
        <p className="text-xs text-gray-400 mb-2 font-semibold">
          Upload A4 (11008×800) or (440×400) for badge
        </p>

        <label className="border-2 border-dashed  rounded-lg transition-colors cursor-pointer border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-dark-600 p-10 text-center  block">
          {imageUrl ? (
            <img src={imageUrl} className="mx-auto max-h-100" />
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

      <div className="flex gap-4 items-center justify-between" >
        <button className="bg-blue-800 pre font-semibold text-sm text-white px-6 py-2 rounded-md">
          Save Design
        </button>
        <button
          type="button"
          className="border px-6 py-2 rounded-md font-semibold text-sm border-gray-200 hover:border-gray-400"
        >
          Replace Image
        </button>
      </div>
    </form>
  );
}
