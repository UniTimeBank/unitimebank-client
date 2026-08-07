import React, { useState } from 'react';
import { Calendar, Repeat, CalendarOff } from 'lucide-react';
import { useMentorSchedule } from '../hooks/useMentorSchedule';
import { RecurringScheduleTab } from './RecurringScheduleTab';
import { ScheduleExceptionsTab } from './ScheduleExceptionsTab';

export const MentorScheduleManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RECURRING' | 'EXCEPTIONS'>('RECURRING');

  const {
    recurringSchedules,
    isRecurringLoading,
    createRecurring,
    isCreatingRecurring,
    updateRecurring,
    deleteRecurring,

    exceptions,
    isExceptionsLoading,
    createException,
    isCreatingException,
    deleteException,
  } = useMentorSchedule();

  const handleToggleRecurring = async (id: string, currentActive: boolean) => {
    try {
      await updateRecurring(id, { isActive: !currentActive });
    } catch (err) {
      console.error('Lỗi khi bật/tắt lịch lặp lại:', err);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-primary-50 text-primary-600">
              <Calendar className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Quản Lý Lịch Dạy Rảnh Rỗi
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Thiết lập các khung giờ bạn rảnh cố định hàng tuần và cài đặt các ngày bận/rảnh đột xuất.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('RECURRING')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'RECURRING'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Lịch Tuần Lặp Lại</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('EXCEPTIONS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'EXCEPTIONS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarOff className="w-3.5 h-3.5" />
            <span>Ngày Bận / Đặc Biệt</span>
          </button>
        </div>
      </div>

      {activeTab === 'RECURRING' ? (
        <RecurringScheduleTab
          recurringList={recurringSchedules}
          isLoading={isRecurringLoading}
          onCreate={createRecurring}
          onToggle={handleToggleRecurring}
          onDelete={deleteRecurring}
          isCreating={isCreatingRecurring}
        />
      ) : (
        <ScheduleExceptionsTab
          exceptionsList={exceptions}
          isLoading={isExceptionsLoading}
          onCreate={createException}
          onDelete={deleteException}
          isCreating={isCreatingException}
        />
      )}
    </div>
  );
};
