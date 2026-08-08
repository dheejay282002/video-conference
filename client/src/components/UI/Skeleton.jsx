import React from 'react';

const Skeleton = ({ className = '', count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`animate-pulse bg-surface-200 rounded-xl ${className}`} />
    ))}
  </>
);

export const SkeletonCard = () => (
  <div className="card space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-14 h-14 rounded-2xl flex-shrink-0" />
      <div className="space-y-2.5 flex-1">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
    <Skeleton className="h-12 w-full rounded-xl" />
    <Skeleton className="h-12 w-full rounded-xl" />
  </div>
);

export const SkeletonDashboard = () => (
  <div className="min-h-screen bg-surface-0">
    {/* Nav skeleton */}
    <div className="h-16 border-b border-surface-200/60 bg-surface-0/80 backdrop-blur-2xl">
      <div className="page-container h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-surface-200 rounded-xl animate-pulse" />
          <div className="h-5 w-20 bg-surface-200 rounded-lg animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-32 bg-surface-200 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>

    <div className="page-container py-8">
      {/* Tabs skeleton */}
      <div className="flex gap-1 p-1 bg-surface-100 rounded-xl w-fit mb-8">
        <div className="h-10 w-20 bg-white rounded-lg animate-pulse" />
        <div className="h-10 w-24 bg-transparent rounded-lg animate-pulse" />
      </div>

      {/* Cards skeleton */}
      <div className="grid md:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  </div>
);

export const SkeletonLogin = () => (
  <div className="min-h-screen bg-surface-0 mesh-bg flex items-center justify-center px-4">
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-3">
        <div className="w-14 h-14 bg-surface-200 rounded-2xl mx-auto animate-pulse" />
        <div className="h-8 w-40 bg-surface-200 rounded-xl mx-auto animate-pulse" />
        <div className="h-5 w-56 bg-surface-200 rounded-lg mx-auto animate-pulse" />
      </div>
      <div className="card space-y-4">
        <div className="h-12 bg-surface-200 rounded-xl animate-pulse" />
        <div className="h-px bg-surface-200 my-2" />
        <div className="space-y-2.5">
          <Skeleton className="h-5 w-16" />
          <div className="h-12 bg-surface-200 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-2.5">
          <Skeleton className="h-5 w-20" />
          <div className="h-12 bg-surface-200 rounded-xl animate-pulse" />
        </div>
        <div className="h-12 bg-brand-600 rounded-xl animate-pulse" />
      </div>
    </div>
  </div>
);

export const SkeletonRoom = () => (
  <div className="h-screen bg-surface-0 flex flex-col">
    <div className="h-14 border-b border-surface-200/60 bg-surface-0/80 backdrop-blur-2xl">
      <div className="page-container h-full flex items-center gap-3">
        <div className="w-8 h-8 bg-surface-200 rounded-xl animate-pulse" />
        <div className="h-px w-px bg-surface-200" />
        <div className="space-y-1.5">
          <div className="h-4 w-36 bg-surface-200 rounded-lg animate-pulse" />
          <div className="h-3 w-24 bg-surface-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
    <div className="flex-1 p-3 grid grid-cols-2 gap-3">
      <Skeleton className="w-full h-full rounded-2xl" />
      <Skeleton className="w-full h-full rounded-2xl" />
    </div>
    <div className="h-20 border-t border-surface-200/60 bg-surface-0/80 backdrop-blur-2xl flex items-center justify-center gap-3">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`h-12 ${i === 5 ? 'w-14' : 'w-12'} bg-surface-200 rounded-2xl animate-pulse`} />
      ))}
    </div>
  </div>
);

export const SkeletonProfile = () => (
  <div className="min-h-screen bg-surface-0">
    <div className="h-16 border-b border-surface-200/60 bg-surface-0/80 backdrop-blur-2xl">
      <div className="page-container h-full flex items-center gap-4">
        <div className="w-8 h-8 bg-surface-200 rounded-xl animate-pulse" />
        <div className="h-5 w-36 bg-surface-200 rounded-lg animate-pulse" />
      </div>
    </div>
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="card space-y-6">
        <div className="h-4 w-28 bg-surface-200 rounded animate-pulse" />
        <div className="flex flex-col items-center gap-4">
          <div className="w-28 h-28 bg-surface-200 rounded-full animate-pulse" />
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-surface-200 rounded-xl animate-pulse" />
            <div className="h-10 w-20 bg-surface-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
      <div className="card space-y-4">
        <div className="h-4 w-28 bg-surface-200 rounded animate-pulse" />
        <div className="space-y-2.5">
          <Skeleton className="h-5 w-24" />
          <div className="h-12 bg-surface-200 rounded-xl animate-pulse" />
        </div>
        <div className="space-y-2.5">
          <Skeleton className="h-5 w-12" />
          <div className="h-12 bg-surface-200 rounded-xl animate-pulse" />
        </div>
        <div className="h-12 bg-brand-600 rounded-xl animate-pulse w-full" />
      </div>
    </div>
  </div>
);

export default Skeleton;
