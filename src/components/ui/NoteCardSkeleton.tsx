'use client';

import React from 'react';

export const NoteCardSkeleton: React.FC = () => {
  return (
    <div className="bg-light-card dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-light-border dark:border-dark-border animate-pulse">
      {/* Title skeleton */}
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 w-3/4"></div>
      
      {/* Content skeleton - 3 lines */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
      </div>
      
      {/* Tags skeleton */}
      <div className="flex gap-2 mb-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
      </div>
      
      {/* Date skeleton */}
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
    </div>
  );
};

interface NoteGridSkeletonProps {
  count?: number;
}

export const NoteGridSkeleton: React.FC<NoteGridSkeletonProps> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, index) => (
        <NoteCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default NoteCardSkeleton;