import React from 'react';

export const GroupCardSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div
          key={idx}
          className="bg-white rounded-3xl h-72 border border-gray-100 shadow-2xs animate-pulse p-4 space-y-4"
        >
          <div className="h-32 bg-gray-200 rounded-2xl w-full" />
          <div className="h-4 bg-gray-200 rounded-md w-3/4" />
          <div className="h-3 bg-gray-200 rounded-md w-full" />
          <div className="h-8 bg-gray-200 rounded-xl w-full" />
        </div>
      ))}
    </div>
  );
};
