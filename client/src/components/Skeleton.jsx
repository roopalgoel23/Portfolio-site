import React from 'react';

/**
 * Skeleton placeholder block.
 *
 * @param {string} className — tailwind classes for shape/size
 */
export default function Skeleton({ className = 'h-6 w-full' }) {
  return <div className={`skeleton rounded-lg ${className}`} />;
}
