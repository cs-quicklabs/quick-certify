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
      <div className="bg-white border max-w-sm min-h-67.5 border-gray-200 rounded-sm shadow-sm flex flex-col h-full">
        <img src={imageUrl} alt={title} className="rounded-t-sm max-h-67.5 w-full object-cover" />

        {/* BODY */}
        <div className="p-5 flex min-h-34 flex-col justify-between flex-1">
          <div>
            <h5 className="text-xl font-bold tracking-tight text-gray-900 mb-2 line-clamp-2">
              {title}
            </h5>
            <p className="text-sm mb-3 font-normal text-gray-700">Created on {createdOn}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
