import DesignsList from "../../components/designs/DesignsList";

export default function DesignsPage() {
  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Designs Library</h1>
          <p className="text-sm text-gray-600">
            Manage certificate and badge designs
          </p>
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Add New Design
        </button>
      </div>

      {/* List */}
      <DesignsList />
    </div>
  );
}
