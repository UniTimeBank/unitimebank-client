import React from 'react';

export const AllPostsSkeletonGrid: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-80 rounded-3xl bg-white border border-slate-200 p-5 animate-pulse flex flex-col justify-between"
        >
          <div className="h-44 bg-slate-100 rounded-2xl w-full" />
          <div className="space-y-3 pt-3">
            <div className="h-4 bg-slate-100 rounded-md w-3/4" />
            <div className="h-3 bg-slate-100 rounded-md w-full" />
          </div>
          <div className="h-9 bg-slate-100 rounded-xl w-full mt-2" />
        </div>
      ))}
    </div>
  );
};
