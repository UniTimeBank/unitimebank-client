import React from 'react';
import type { SidebarBookingCardProps } from '../types';
import { useSidebarBooking } from '../hooks';
import {
  BookingPriceHeader,
  BookingCalendarHeader,
  BookingCalendarGrid,
  BookingTimeSlotPicker,
  BookingCreditBreakdown,
  BookingActionButton,
} from './booking-sidebar';

export type { SidebarBookingCardProps };

export const SidebarBookingCard: React.FC<SidebarBookingCardProps> = (props) => {
  const {
    title = 'Lịch rảnh',
    creditCost = '1',
    creditRateText = 'credit / phút',
    freeTrialText = 'Miễn phí 5 phút đầu',
    className = '',
  } = props;

  const {
    todayStr,
    isOwner,
    isClosed,
    monthYearLabel,
    dayMonthLabel,
    isPrevMonthDisabled,
    handlePrevMonth,
    handleNextMonth,
    handlePrevYear,
    handleNextYear,
    calendarGrid,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    slotsForSelectedDate,
    blockedExceptionsOnDate,
    isApiMode,
    isAvailabilityLoading,
    exceptions,
    recurringSchedules,
    activeDaysOfWeekSet,
    scheduleType,
    startDate,
    endDate,
    availableCredit,
    requiredCredit,
    isInsufficientCredit,
    primaryButtonText,
    handleBooking,
  } = useSidebarBooking(props);

  return (
    <div
      className={`bg-[#1E293B] text-white rounded-3xl shadow-xs overflow-hidden ${className}`}
    >
      {/* 1. Header: Chi phí học */}
      <BookingPriceHeader
        creditCost={creditCost}
        creditRateText={creditRateText}
        freeTrialText={freeTrialText}
      />

      {/* 2. Calendar Body */}
      <div className="p-5 bg-white text-gray-900 space-y-4">
        {/* Header điều hướng Tháng / Năm */}
        <BookingCalendarHeader
          title={title}
          monthYearLabel={monthYearLabel}
          isPrevMonthDisabled={isPrevMonthDisabled}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onPrevYear={handlePrevYear}
          onNextYear={handleNextYear}
        />

        {/* Ma trận Lịch tháng */}
        <BookingCalendarGrid
          calendarGrid={calendarGrid}
          selectedDate={selectedDate}
          todayStr={todayStr}
          isApiMode={isApiMode}
          isAvailabilityLoading={isAvailabilityLoading}
          recurringSchedules={recurringSchedules}
          exceptions={exceptions}
          activeDaysOfWeekSet={activeDaysOfWeekSet}
          scheduleType={scheduleType}
          startDate={startDate}
          endDate={endDate}
          onSelectDate={(dStr) => {
            setSelectedDate(dStr);
            setSelectedSlot(null);
          }}
        />

        {/* Danh sách khung giờ trống */}
        <BookingTimeSlotPicker
          dayMonthLabel={dayMonthLabel}
          slotsForSelectedDate={slotsForSelectedDate}
          blockedExceptionsOnDate={blockedExceptionsOnDate}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
        />

        {/* Chi tiết Credit & Cảnh báo số dư */}
        <BookingCreditBreakdown
          selectedSlot={selectedSlot}
          requiredCredit={requiredCredit}
          availableCredit={availableCredit}
          isInsufficientCredit={isInsufficientCredit}
        />

        {/* Nút hành động Đặt lịch / Quản lý bài / Đã đóng */}
        <BookingActionButton
          isOwner={isOwner}
          isClosed={isClosed}
          selectedSlot={selectedSlot}
          isInsufficientCredit={isInsufficientCredit}
          primaryButtonText={primaryButtonText}
          onBooking={handleBooking}
        />
      </div>
    </div>
  );
};
