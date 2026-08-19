import React, { useState } from 'react';
import { Calendar, Repeat, CalendarOff, Clock } from 'lucide-react';
import { useMentorSchedule } from '../hooks/useMentorSchedule';
import { MyScheduleAgendaTab } from './MyScheduleAgendaTab';
import { RecurringScheduleTab } from './RecurringScheduleTab';
import { ScheduleExceptionsTab } from './ScheduleExceptionsTab';
import { useGetMyBookingsQuery, BookingStatus } from '@/core/api/booking/bookingApi';

export type ScheduleTabType = 'AGENDA' | 'RECURRING' | 'EXCEPTIONS';

export const MentorScheduleManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ScheduleTabType>('AGENDA');

  // Query confirmed bookings count
  const { data: bookingsData } = useGetMyBookingsQuery(undefined, {
    refetchOnFocus: true,
  });

  const confirmedCount = (bookingsData?.items || []).filter(
    (b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.STARTED,
  ).length;

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
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xs p-6 sm:p-8 relative animate-in fade-in duration-200">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 1. HEADER BAR & TAB SWITCHER */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
            Lịch Trình & Thời Khóa Biểu
          </h2>
          <p className="text-xs text-slate-500">
            Xem thời khóa biểu các lớp học đã xác nhận và quản lý khung giờ rảnh hàng tuần của bạn.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('AGENDA')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap ${
              activeTab === 'AGENDA'
                ? 'bg-white text-primary-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-primary-700" />
            <span>Lịch Trình Của Tôi</span>
            {confirmedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-primary-700 text-white text-[10px] font-bold">
                {confirmedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RECURRING')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap ${
              activeTab === 'RECURRING'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Repeat className="w-3.5 h-3.5 text-slate-700" />
            <span>Khung Giờ Rảnh Cố Định</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('EXCEPTIONS')}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap ${
              activeTab === 'EXCEPTIONS'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarOff className="w-3.5 h-3.5 text-slate-700" />
            <span>Ngày Bận / Đột Xuất</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 2. TAB CONTENTS */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === 'AGENDA' ? (
        <MyScheduleAgendaTab />
      ) : activeTab === 'RECURRING' ? (
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
