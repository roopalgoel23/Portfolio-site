import React from 'react';
import Skeleton from './Skeleton';

export function SectionSkeleton() {
  return (
    <div className="container-lux py-20">
      <Skeleton className="mx-auto h-6 w-32" />
      <Skeleton className="mx-auto mt-6 h-12 w-80" />
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="mt-6 h-6 w-3/4" />
            <Skeleton className="mt-4 h-20 w-full" />
            <Skeleton className="mt-4 h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SectionSkeleton;
