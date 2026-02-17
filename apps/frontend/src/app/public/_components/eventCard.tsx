// components/EventCard.tsx
import Link from 'next/link';

export interface EventCardProps {
  id: string;
  imageUrl: string;
  title: string;
  createdOn: string;
  href: string;
}

export default function EventCard({ id, imageUrl, title, createdOn, href }: EventCardProps) {
  return (
    <Link href={href} key={id}>
      <div className="bg-white border min-h-67.5 border-gray-200 rounded-sm shadow-sm flex flex-col h-full">
        <img src={imageUrl} alt={title} className="rounded-t-sm w-full object-cover" />

        {/* BODY */}
        <div className="p-4 flex min-h-34 flex-col justify-between flex-1">
          <div>
            <h5 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{title}</h5>
            <p className="text-sm text-gray-700">Created on {createdOn}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
