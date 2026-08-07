import React from 'react';

export const ExpertiseTrackCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
        Theo dõi chuyên môn
      </h3>

      <div className="space-y-4 text-xs">
        <div>
          <div className="flex justify-between font-bold text-gray-900 mb-1.5">
            <span>Trình độ kỹ thuật</span>
            <span className="text-primary-500">Nâng cao</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full w-[85%]" />
          </div>
        </div>

        <div>
          <div className="flex justify-between font-bold text-gray-900 mb-1.5">
            <span>Kỹ năng giao tiếp</span>
            <span className="text-primary-500">Chuyên gia</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full w-[95%]" />
          </div>
        </div>
      </div>
    </div>
  );
};
