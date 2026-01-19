import DesignsList from './_components/DesignsList';
import Link from 'next/link';

export default function DesignsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Designs Library</h1>
          <p className="text-sm text-gray-600">
            Manage certificate and badge designs
          </p>
        </div>

        <Link
          href="/designs/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
        >
          Add New Design
        </Link>
      </div>

      <DesignsList />
    </div>
  );
}
