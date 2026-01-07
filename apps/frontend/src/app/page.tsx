export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">Welcome to Your App</h1>
        <p className="text-xl text-gray-600 mb-8">Your fullstack boilerplate is ready to go!</p>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">What's Included</h2>
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">TanStack Query</h3>
              <p className="text-sm text-blue-700">Server state management</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Zustand</h3>
              <p className="text-sm text-purple-700">Client state management</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Zod</h3>
              <p className="text-sm text-green-700">Schema validation</p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <h3 className="font-semibold text-pink-900 mb-2">Tailwind CSS</h3>
              <p className="text-sm text-pink-700">Utility-first styling</p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-gray-600 text-sm">
              Start building your app by editing{' '}
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                apps/frontend/src/app/page.tsx
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
