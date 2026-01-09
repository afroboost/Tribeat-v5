/**
 * AdminSkeleton - Loading state pour l'admin
 * S'affiche pendant le chargement auth
 */

interface AdminSkeletonProps {
  message?: string;
}

export function AdminSkeleton({ message = 'Chargement...' }: AdminSkeletonProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar skeleton */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gray-800 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="h-8 w-32 bg-gray-700 rounded animate-pulse" />
          </div>
          <nav className="mt-8 flex-1 px-4 space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-700 rounded animate-pulse" />
            ))}
          </nav>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="lg:pl-64">
        {/* Header skeleton */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </header>

        {/* Content area */}
        <main className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-500">{message}</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
