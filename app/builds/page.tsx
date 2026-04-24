import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BuildsContent } from '@/components/builds/builds-content'
import { BuildCardSkeleton } from '@/components/build-card'

export const metadata: Metadata = {
  title: 'Builds',
  description: 'Browse and discover Hero Siege builds for every class. Filter by class, sort by popularity, and find your perfect build.',
}

export default function BuildsPage() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<BuildsLoadingSkeleton />}>
        <BuildsContent />
      </Suspense>
    </div>
  )
}

function BuildsLoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        
        {/* Filters Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 flex-1 bg-muted animate-pulse rounded" />
          <div className="h-10 w-40 bg-muted animate-pulse rounded" />
          <div className="h-10 w-40 bg-muted animate-pulse rounded" />
        </div>
      </div>
      
      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <BuildCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
