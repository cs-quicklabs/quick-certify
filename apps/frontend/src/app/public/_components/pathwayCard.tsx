import Image from 'next/image';
import Link from 'next/link';

export interface PathwayCardProps {
  name: string;
  imageUrl: string;
  credentialCount: number;
  participantCount: number;
  duration?: string;
  href: string;
}

export function PathwayCard({
  name,
  imageUrl,
  credentialCount,
  participantCount,
  duration,
  href,
}: PathwayCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white border max-w-sm border-gray-200 rounded-sm shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
        <Image
          src={imageUrl}
          alt={name}
          height={480}
          width={270}
          className="rounded-t-sm w-full object-cover"
        />
        <div className="p-5">
          <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 line-clamp-2">
            {name}
          </h5>
          <p className="text-sm font-normal text-gray-700">
            {credentialCount} Credentials &middot; {participantCount} Participants
            {duration && <> &middot; {duration}</>}
          </p>
        </div>
      </div>
    </Link>
  );
}
