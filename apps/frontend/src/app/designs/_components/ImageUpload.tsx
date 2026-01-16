type Props = {
  imageUrl?: string;
  onChange: (file: File) => void;
};

export function ImageUpload({ imageUrl, onChange }: Props) {
  return (
    <label className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer block">
      {imageUrl ? (
        <img src={imageUrl} className="mx-auto max-h-48" />
      ) : (
        <>
          <p className="text-gray-400">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-400 mt-1">Size: 1920x300</p>
        </>
      )}
      <input
        type="file"
        hidden
        accept="image/*"
        onChange={(e) =>
          e.target.files && onChange(e.target.files[0])
        }
      />
    </label>
  );
}
