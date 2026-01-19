import DesignsList from './_components/DesignsList';
import Link from 'next/link';

export default function DesignsPage() {
  return (
    <div>
      <div className="flex px-6 py-5 items-center justify-between border-b border-gray-200 shadow-sm mt-5">
        <div>
          <h1 className="text-shadow-md font-semibold">Designs Library</h1>
          <p className="text-xs text-gray-600">
            Manage certificate and badge designs
          </p>
        </div>

        <Link
          href="/designs/add"
          className="bg-blue-800 text-white px-4 py-2 rounded-md text-sm"
        >
          Add New Design
        </Link>
      </div>

      <DesignsList />
    </div>
  );
}
