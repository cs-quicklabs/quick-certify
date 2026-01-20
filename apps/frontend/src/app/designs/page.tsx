import DesignsList from './_components/DesignsList';
import Link from 'next/link';

export default function DesignsPage() {
  return (
    <div>
      <div className="flex flex-row bg-white items-center justify-between p-4 space-y-3 sm:flex sm:space-y-0 sm:space-x-4">
        <div>
          <h1 className="mr-3 text-lg font-bold dark:text-white">Designs Library</h1>
          <p className="text-sm text-gray-500">
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
