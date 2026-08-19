import React from 'react';

interface BookingPriceHeaderProps {
  creditCost?: number | string;
  creditRateText?: string;
  freeTrialText?: string;
}

export const BookingPriceHeader: React.FC<BookingPriceHeaderProps> = ({
  creditCost = '1',
  creditRateText = 'credit / phút',
  freeTrialText = 'Miễn phí 5 phút đầu',
}) => {
  return (
    <div className="p-5 border-b border-slate-700/60 flex items-center justify-between">
      <div>
        <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase block">
          Chi phí học
        </span>
        <div className="text-xl font-bold mt-0.5 text-white">
          {creditCost}{' '}
          <span className="text-xs font-normal text-gray-300">{creditRateText}</span>
        </div>
      </div>

      {freeTrialText && (
        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-semibold text-[11px] rounded-full border border-emerald-400/30">
          {freeTrialText}
        </span>
      )}
    </div>
  );
};
