import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import type { TimeSlot } from '../../types';

const DAY_MAP: Record<string, string> = {
  MONDAY: 'Thứ Hai',
  TUESDAY: 'Thứ Ba',
  WEDNESDAY: 'Thứ Tư',
  THURSDAY: 'Thứ Năm',
  FRIDAY: 'Thứ Sáu',
  SATURDAY: 'Thứ Bảy',
  SUNDAY: 'Chủ Nhật',
  MON: 'Thứ Hai',
  TUE: 'Thứ Ba',
  WED: 'Thứ Tư',
  THU: 'Thứ Năm',
  FRI: 'Thứ Sáu',
  SAT: 'Thứ Bảy',
  SUN: 'Chủ Nhật',
};

interface MentorScheduleTableProps {
  slots?: TimeSlot[];
}

export const MentorScheduleTable: React.FC<MentorScheduleTableProps> = ({ slots = [] }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs space-y-4">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <Calendar className="w-5 h-5 text-primary-500" />
        <h3 className="text-base font-black text-gray-900">Lịch Rảnh Nhận Dạy Của Mentor</h3>
      </div>

      {slots.length === 0 ? (
        <div className="p-4 rounded-2xl bg-gray-50 text-center text-xs font-semibold text-gray-500">
          Mentor sẵn sàng linh hoạt thu xếp lịch dạy theo thỏa thuận trực tiếp.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {slots.map((slot, index) => (
            <div
              key={index}
              className="p-3.5 rounded-2xl bg-primary-50/50 border border-primary-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-primary-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {DAY_MAP[slot.dayOfWeek]?.substring(0, 5) || 'Thứ'}
                </span>
                <div>
                  <div className="text-xs font-black text-gray-900">
                    {DAY_MAP[slot.dayOfWeek] || slot.dayOfWeek}
                  </div>
                  <div className="text-2xs font-bold text-primary-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary-500" />
                    <span>
                      {slot.startTime} - {slot.endTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
