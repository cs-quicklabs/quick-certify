import Image from 'next/image';

interface FinalCredentialCardProps {
  name: string;
  description: string;
  imageUrl: string;
}

export function FinalCredentialCard({ name, description, imageUrl }: FinalCredentialCardProps) {
  return (
    <div className="max-w-7xl mx-auto p-2 rounded-sm border border-gray-200 bg-white mt-4">
      <div className="flex flex-col sm:flex-row">
        {/* Certificate Image */}
        <div className="sm:w-64 lg:w-80 shrink-0 bg-gray-50 p-4 sm:p-6 flex items-center justify-center">
          <Image
            src={imageUrl}
            alt="Final Credential Certificate"
            width={240}
            height={240}
            className="rounded-sm w-full max-w-60 object-cover"
          />
        </div>
        {/* Details */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-sm bg-green-100 text-green-800 border border-green-200">
              Final Credential
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{name}</h2>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
