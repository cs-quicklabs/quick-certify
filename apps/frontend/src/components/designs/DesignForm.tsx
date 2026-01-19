import { ImageUpload } from "./ImageUpload";

type Props = {
  title: string;
  subtitle: string;
  defaultName?: string;
  imageUrl?: string;
  onSubmit: (data: { name: string; image: File | null }) => void;
  loading?: boolean;
};

export function DesignForm({
  title,
  subtitle,
  defaultName = "",
  imageUrl,
  onSubmit,
  loading,
}: Props) {
  let image: File | null = null;

  return (
    <form
      className="max-w-2xl space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const name = (e.currentTarget.elements.namedItem(
          "name"
        ) as HTMLInputElement).value;

        onSubmit({ name, image });
      }}
    >
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {title.includes("Edit") ? "Edit Name" : "Add Name"}
        </label>
        <input
          name="name"
          defaultValue={defaultName}
          className="w-full border rounded-md px-3 py-2"
          placeholder="Name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Upload Image
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Upload A4 (11008×800) or (440×400) for badge
        </p>

        <ImageUpload
          imageUrl={imageUrl}
          onChange={(file) => (image = file)}
        />
      </div>

      <div className="flex gap-4">
        <button
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md"
        >
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
