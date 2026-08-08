import React from 'react';

const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-700/50 rounded ${className}`}
        />
      ))}
    </>
  );
};

export const SkeletonCard = () => (
  <div className="bg-zoom-darker p-6 rounded-2xl border border-gray-700 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton className="w-16 h-16 rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
    <Skeleton className="h-10 w-full rounded-lg" />
    <Skeleton className="h-10 w-full rounded-lg" />
  </div>
);

export const SkeletonDashboard = () => (
  <div className="min-h-screen bg-zoom-dark">
    {/* Nav skeleton */}
    <div className="bg-zoom-darker border-b border-gray-700 px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-7 w-28" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Tabs skeleton */}
      <div className="flex gap-4 mb-8 border-b border-gray-700 pb-4">
        <Skeleton className="h-10 w-24 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>

      {/* Cards skeleton */}
      <div className="grid md:grid-cols-2 gap-8">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  </div>
);

export const SkeletonLogin = () => (
  <div className="min-h-screen bg-zoom-dark flex items-center justify-center px-4">
    <div className="max-w-md w-full space-y-6">
      <div className="text-center space-y-3">
        <Skeleton className="w-12 h-12 rounded-xl mx-auto" />
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      <div className="bg-zoom-darker p-8 rounded-2xl border border-gray-700 space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-1 w-full" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

export const SkeletonRoom = () => (
  <div className="h-screen bg-zoom-dark flex flex-col">
    <div className="bg-zoom-darker border-b border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-6 h-6 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <div className="flex-1 grid grid-cols-2 gap-2 p-2">
      <Skeleton className="w-full h-full rounded-xl" />
      <Skeleton className="w-full h-full rounded-xl" />
    </div>
    <div className="bg-zoom-darker border-t border-gray-700 px-4 py-3">
      <div className="flex items-center justify-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <Skeleton className="w-12 h-12 rounded-full" />
        <Skeleton className="w-12 h-12 rounded-full" />
        <Skeleton className="w-16 h-12 rounded-full" />
      </div>
    </div>
  </div>
);

export const SkeletonProfile = () => (
  <div className="min-h-screen bg-zoom-dark">
    <div className="bg-zoom-darker border-b border-gray-700 px-4 py-4">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <Skeleton className="w-5 h-5" />
        <Skeleton className="h-6 w-40" />
      </div>
    </div>
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-zoom-darker p-8 rounded-2xl border border-gray-700 space-y-6">
        <Skeleton className="h-5 w-32" />
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="w-32 h-32 rounded-full" />
          <div className="flex gap-3">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="bg-zoom-darker p-8 rounded-2xl border border-gray-700 space-y-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  </div>
);

export default Skeleton;
