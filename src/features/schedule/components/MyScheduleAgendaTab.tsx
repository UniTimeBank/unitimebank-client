import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  User,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ListFilter,
  Sparkles,
} from 'lucide-react';
import { useGetMyBookingsQuery, BookingStatus, type BookingItem } from '@/core/api/booking/bookingApi';
import { useUserProfile } from '@/features/user/hooks';
import { useAppSelector } from '@/shared/hooks';
import { selectCurrentUser } from '@/core/store';
import { Button } from '@/shared/components/ui';
import { toast } from '@/shared/utils';
import { Link, useNavigate } from 'react-router-dom';
import { checkBookingSessionJoinable } from '@/features/session';

const DAYS_OF_WEEK = [
  { key: 1, label: 'Thứ 2', short: 'T2' },
  { key: 2, label: 'Thứ 3', short: 'T3' },
  { key: 3, label: 'Thứ 4', short: 'T4' },
  { key: 4, label: 'Thứ 5', short: 'T5' },
  { key: 5, label: 'Thứ 6', short: 'T6' },
  { key: 6, label: 'Thứ 7', short: 'T7' },
  { key: 0, label: 'Chủ nhật', short: 'CN' },
];

/** Helper to format local date as YYYY-MM-DD avoiding UTC timezone offset */
const formatLocalDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Helper to get Monday 00:00:00 of the week for a given date */
const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const MyScheduleAgendaTab: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const authUser = useAppSelector(selectCurrentUser);
  const currentUserId = profile?.userId || authUser?.id;

  const [viewMode, setViewMode] = useState<'WEEK' | 'TIMELINE'>('WEEK');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getMonday(new Date()));

  // Query confirmed bookings (Smart 15s polling while calendar is open)
  const { data: apiResponse, isLoading } = useGetMyBookingsQuery(undefined, {
    pollingInterval: 15000,
    refetchOnFocus: true,
  });

  const confirmedBookings = useMemo(() => {
    const items = apiResponse?.items || [];
    return items
      .filter((b) => b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.STARTED)
      .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());
  }, [apiResponse]);

  // Week days array (Monday -> Sunday)
  const weekDays = useMemo(() => {
    const todayStr = formatLocalDate(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      const dateStr = formatLocalDate(d);
      return {
        date: d,
        dateStr,
        dayNumber: d.getDate(),
        monthNumber: d.getMonth() + 1,
        dayOfWeek: d.getDay(),
        isToday: dateStr === todayStr,
      };
    });
  }, [currentWeekStart]);

  const weekEnd = useMemo(() => {
    const d = new Date(currentWeekStart);
    d.setDate(currentWeekStart.getDate() + 6);
    return d;
  }, [currentWeekStart]);

  // Navigate Weeks
  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(prev.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(prev.getDate() + 7);
      return d;
    });
  };

  const handleToday = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  const handleJoinClass = (bookingId: string) => {
    navigate(`/rooms/one-on-one/${bookingId}`);
  };

  const formatWeekRange = () => {
    const startStr = `${currentWeekStart.getDate()}/${currentWeekStart.getMonth() + 1}`;
    const endStr = `${weekEnd.getDate()}/${weekEnd.getMonth() + 1}/${weekEnd.getFullYear()}`;
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="space-y-6">
      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 1. TOOLBAR: WEEK CONTROLS & VIEW SWITCHER */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/80 p-3.5 sm:p-4 rounded-2xl border border-slate-100">
        {/* Navigation buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border-slate-200 hover:bg-white bg-white/70 text-slate-700"
          >
            Hôm nay
          </Button>

          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Tuần trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-slate-700 tracking-tight whitespace-nowrap">
              {formatWeekRange()}
            </span>
            <button
              type="button"
              onClick={handleNextWeek}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Tuần sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('WEEK')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'WEEK'
                ? 'bg-primary-700 text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Lịch tuần</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('TIMELINE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'TIMELINE'
                ? 'bg-primary-700 text-white shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Dòng thời gian</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* 2. MAIN VIEW: WEEK GRID OR TIMELINE */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Đang tải lịch trình của bạn...</p>
        </div>
      ) : confirmedBookings.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50/60 rounded-3xl border border-dashed border-slate-200">
          <div className="w-14 h-14 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <CalendarIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1">
            Bạn chưa có lịch học nào được xác nhận
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            Các buổi dạy hoặc buổi học sau khi được duyệt sẽ tự động đồng bộ vào thời khóa biểu tại đây.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/explore">
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-medium text-xs px-4 py-2"
              >
                Khám phá lớp học ngay
              </Button>
            </Link>
            <Link to="/manage/posts">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl border-slate-200 font-medium text-xs px-4 py-2"
              >
                Xem bài đăng của bạn
              </Button>
            </Link>
          </div>
        </div>
      ) : viewMode === 'WEEK' ? (
        /* WEEK GRID VIEW (With horizontal scroll support to avoid squeezing) */
        <div className="overflow-x-auto pb-3 -mx-2 px-2">
          <div className="grid grid-cols-7 gap-3 min-w-[840px]">
            {weekDays.map((day) => {
              const shortLabel = DAYS_OF_WEEK.find((d) => d.key === day.dayOfWeek)?.short || '';

              // Filter bookings for this day using timezone-safe local date string
              const dayBookings = confirmedBookings.filter((b) => {
                const bDateStr = formatLocalDate(new Date(b.scheduledStart));
                return bDateStr === day.dateStr;
              });

              return (
                <div
                  key={day.dateStr}
                  className={`rounded-2xl p-3 min-h-[260px] flex flex-col justify-between border transition-all ${
                    day.isToday
                      ? 'bg-primary-50/30 border-primary-200 ring-1 ring-primary-500/20'
                      : 'bg-white border-slate-200/90'
                  }`}
                >
                  {/* Day Header (Single Horizontal Row) */}
                  <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-100 mb-2.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        {shortLabel}
                      </span>
                      <span className="text-xs text-slate-300">·</span>
                      <span
                        className={`text-xs font-bold leading-none ${
                          day.isToday ? 'text-primary-700' : 'text-slate-700'
                        }`}
                      >
                        {day.dayNumber}/{day.monthNumber}
                      </span>
                    </div>
                    {day.isToday && (
                      <span className="px-1.5 py-0.5 rounded-md bg-primary-700 text-white text-[9px] font-semibold shrink-0">
                        Hôm nay
                      </span>
                    )}
                  </div>

                  {/* Day Content (List of sessions) */}
                  <div className="flex-1 space-y-2.5">
                    {dayBookings.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-center py-6">
                        <span className="text-[11px] text-slate-300 font-normal italic">
                          Trống
                        </span>
                      </div>
                    ) : (
                      dayBookings.map((b) => {
                        const isMentorRole = b.mentorId === currentUserId;
                        const partnerName = isMentorRole ? b.learnerName : b.mentorName;
                        const partnerAvatar = isMentorRole ? b.learnerAvatar : b.mentorAvatar;
                        const startTime = new Date(b.scheduledStart).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        const endTime = new Date(b.scheduledEnd).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <div
                            key={b.id}
                            className={`p-2.5 rounded-xl border text-left flex flex-col justify-between gap-2 transition-all shadow-2xs ${
                              isMentorRole
                                ? 'bg-blue-50/40 border-blue-200/80 border-l-4 border-l-blue-600'
                                : 'bg-emerald-50/40 border-emerald-200/80 border-l-4 border-l-emerald-600'
                            }`}
                          >
                            <div>
                              {/* 1. Header: Time & Role Pill */}
                              <div className="flex items-center justify-between gap-1 mb-1.5">
                                <span className="text-[11px] font-semibold text-slate-700 tracking-tight whitespace-nowrap">
                                  {startTime} - {endTime}
                                </span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase shrink-0 ${
                                    isMentorRole
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-emerald-600 text-white'
                                  }`}
                                >
                                  {isMentorRole ? 'Dạy' : 'Học'}
                                </span>
                              </div>

                              {/* 2. Session Title */}
                              <h4 className="text-xs font-medium text-slate-800 line-clamp-2 leading-snug mb-1.5">
                                {b.title}
                              </h4>

                              {/* 3. Partner Info */}
                              <div className="flex items-center gap-1.5 pt-0.5">
                                {partnerAvatar ? (
                                  <img
                                    src={partnerAvatar}
                                    alt={partnerName}
                                    className="w-4 h-4 rounded-full object-cover shrink-0"
                                  />
                                ) : (
                                  <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-bold shrink-0">
                                    {partnerName?.charAt(0) || 'U'}
                                  </div>
                                )}
                                <span className="text-[11px] text-slate-500 truncate font-normal">
                                  {partnerName}
                                </span>
                              </div>
                            </div>

                            {/* 4. Join Class Button */}
                            {(() => {
                              const canJoin = checkBookingSessionJoinable(b);
                              return (
                                <button
                                  type="button"
                                  disabled={!canJoin}
                                  onClick={() => canJoin && handleJoinClass(b.id)}
                                  className={`w-full mt-1 flex items-center justify-center gap-1.5 rounded-xl text-[11px] font-semibold py-1.5 transition-all duration-200 shadow-2xs ${
                                    isMentorRole
                                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  } ${
                                    !canJoin
                                      ? 'opacity-40 cursor-not-allowed pointer-events-none'
                                      : 'cursor-pointer active:scale-[0.98]'
                                  }`}
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  <span>Vào phòng</span>
                                </button>
                              );
                            })()}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TIMELINE / LIST VIEW */
        <div className="space-y-4">
          {confirmedBookings.map((b) => {
            const isMentorRole = b.mentorId === currentUserId;
            const partnerName = isMentorRole ? b.learnerName : b.mentorName;
            const partnerAvatar = isMentorRole ? b.learnerAvatar : b.mentorAvatar;

            const startDateObj = new Date(b.scheduledStart);
            const formattedDate = startDateObj.toLocaleDateString('vi-VN', {
              weekday: 'long',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
            const startTime = startDateObj.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            });
            const endTime = new Date(b.scheduledEnd).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            });
            const canJoin = checkBookingSessionJoinable(b);

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Side: Date / Role / Details */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-center shrink-0 font-extrabold shadow-xs ${
                      isMentorRole
                        ? 'bg-blue-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    <span className="text-[10px] leading-tight opacity-90 uppercase">
                      {isMentorRole ? 'DẠY' : 'HỌC'}
                    </span>
                    <span className="text-base leading-none">{startDateObj.getDate()}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-700 capitalize">
                        {formattedDate}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-normal flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {startTime} - {endTime} ({b.durationMinutes || 60} phút)
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200/60">
                        {b.totalCreditEscrowed || 60} Credit
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-semibold text-slate-800 leading-snug">
                      {b.title}
                    </h4>

                    {/* Partner details */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-xs text-slate-400 font-normal">
                        {isMentorRole ? 'Học viên:' : 'Gia sư:'}
                      </span>
                      {partnerAvatar ? (
                        <img
                          src={partnerAvatar}
                          alt={partnerName}
                          className="w-4 h-4 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-bold shrink-0">
                          {partnerName?.charAt(0) || 'U'}
                        </div>
                      )}
                      <span className="text-xs font-medium text-slate-700">{partnerName}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Action Button */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={!canJoin}
                    onClick={() => canJoin && handleJoinClass(b.id)}
                    className={`rounded-xl font-bold text-xs py-2 px-4 shadow-xs flex items-center gap-2 bg-primary-700 hover:bg-primary-800 text-white ${
                      !canJoin
                        ? 'opacity-40 cursor-not-allowed pointer-events-none'
                        : 'cursor-pointer'
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Vào phòng học 1-1</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

