import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Clock } from 'lucide-react';

export interface DisabledTimeInterval {
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

export interface TimeInputProps {
  label?: string;
  value: string; // "HH:mm" format e.g. "19:00"
  onChange: (value: string) => void;
  minTime?: string; // Giờ tối thiểu cho phép chọn (e.g. "08:00")
  maxTime?: string; // Giờ tối đa cho phép chọn (e.g. "22:00")
  disabledIntervals?: DisabledTimeInterval[]; // Danh sách các khung giờ bận/đã có lịch
  minuteStep?: 15 | 30 | 5 | 1; // Bước nhảy phút (mặc định là 15)
  error?: string;
  className?: string;
}

const ALL_BASE_HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

const ITEM_HEIGHT = 40; // 40px mỗi hàng
const CONTAINER_HEIGHT = 200; // 5 hàng = 200px
const CENTER_OFFSET = 80; // Tâm ở 80px (2 * 40px)

const getMinutesByStep = (step: number = 15): string[] => {
  const result: string[] = [];
  for (let i = 0; i < 60; i += step) {
    result.push(String(i).padStart(2, '0'));
  }
  return result;
};

const roundMinuteToStep = (minute: number, step: number = 15): number => {
  if (step <= 1) return minute;
  const snapped = Math.round(minute / step) * step;
  return snapped >= 60 ? 60 - step : snapped;
};

const format24Hour = (time24: string, step: number = 15) => {
  if (!time24) return '19:00';
  const [hStr, mStr] = time24.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return time24;
  const snappedM = roundMinuteToStep(m, step);
  return `${String(h).padStart(2, '0')}:${String(snappedM).padStart(2, '0')}`;
};

export const TimeInput: React.FC<TimeInputProps> = ({
  label,
  value = '19:00',
  onChange,
  minTime,
  maxTime,
  disabledIntervals = [],
  minuteStep = 15,
  error,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const availableHours = ALL_BASE_HOURS;
  const availableMinutes = useMemo(() => getMinutesByStep(minuteStep), [minuteStep]);

  const [propHour, propMinute] = (value || '19:00').split(':');
  const normalizedMinute = useMemo(() => {
    const rawM = parseInt(propMinute || '00', 10);
    const snapped = roundMinuteToStep(rawM, minuteStep);
    return String(snapped).padStart(2, '0');
  }, [propMinute, minuteStep]);

  const [activeHour, setActiveHour] = useState(propHour || '19');
  const [activeMinute, setActiveMinute] = useState(normalizedMinute);

  const hourListRef = useRef<HTMLDivElement>(null);
  const minuteListRef = useRef<HTMLDivElement>(null);
  const isInternalScrollRef = useRef(false);

  // Đồng bộ giá trị từ prop vào state nội bộ
  useEffect(() => {
    const [h, m] = (value || '19:00').split(':');
    if (h && h !== activeHour) setActiveHour(h);
    if (m && m !== activeMinute) setActiveMinute(m);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOpen = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpward(spaceBelow < 300);
    }
    setIsOpen(!isOpen);
  };

  // Cuộn mượt đến mục được chọn
  const scrollToHour = useCallback((hVal: string, smooth = false) => {
    if (!hourListRef.current) return;
    const idx = availableHours.indexOf(hVal);
    if (idx >= 0) {
      isInternalScrollRef.current = true;
      hourListRef.current.scrollTo({
        top: idx * ITEM_HEIGHT,
        behavior: smooth ? 'smooth' : 'auto',
      });
      setTimeout(() => {
        isInternalScrollRef.current = false;
      }, 150);
    }
  }, [availableHours]);

  const scrollToMinute = useCallback((mVal: string, smooth = false) => {
    if (!minuteListRef.current) return;
    const idx = availableMinutes.indexOf(mVal);
    if (idx >= 0) {
      isInternalScrollRef.current = true;
      minuteListRef.current.scrollTo({
        top: idx * ITEM_HEIGHT,
        behavior: smooth ? 'smooth' : 'auto',
      });
      setTimeout(() => {
        isInternalScrollRef.current = false;
      }, 150);
    }
  }, [availableMinutes]);

  // Định vị khi mở popup
  useEffect(() => {
    if (isOpen) {
      const [h, m] = (value || '19:00').split(':');
      requestAnimationFrame(() => {
        scrollToHour(h || availableHours[0], false);
        scrollToMinute(m || availableMinutes[0], false);
      });
    }
  }, [isOpen, scrollToHour, scrollToMinute, value, availableHours, availableMinutes]);

  // Kiểm tra giờ bị khóa
  const isHourBlocked = useCallback(
    (hStr: string) => {
      const h = parseInt(hStr, 10);

      if (minTime) {
        const [minHStr, minMStr] = minTime.split(':');
        const minH = parseInt(minHStr, 10);
        const minM = parseInt(minMStr, 10);
        if (h < minH) return true;
        if (h === minH && minM >= 59) return true;
      }

      if (maxTime) {
        const [maxHStr, maxMStr] = maxTime.split(':');
        const maxH = parseInt(maxHStr, 10);
        const maxM = parseInt(maxMStr, 10);
        if (h > maxH) return true;
        if (h === maxH && maxM === 0) return true;
      }

      if (disabledIntervals && disabledIntervals.length > 0) {
        const allMinutesBlocked = availableMinutes.every((m) => {
          const timeStr = `${hStr}:${m}`;
          return disabledIntervals.some(
            (inv) => inv.startTime <= timeStr && timeStr < inv.endTime,
          );
        });
        if (allMinutesBlocked) return true;
      }

      return false;
    },
    [minTime, maxTime, disabledIntervals, availableMinutes],
  );

  // Kiểm tra phút bị khóa
  const isMinuteBlocked = useCallback(
    (mStr: string) => {
      const timeStr = `${activeHour}:${mStr}`;

      if (minTime && timeStr <= minTime) return true;
      if (maxTime && timeStr >= maxTime) return true;

      if (disabledIntervals && disabledIntervals.length > 0) {
        return disabledIntervals.some(
          (inv) => inv.startTime <= timeStr && timeStr < inv.endTime,
        );
      }

      return false;
    },
    [activeHour, minTime, maxTime, disabledIntervals],
  );

  const isCurrentValueBlocked = useCallback(
    (val: string) => {
      if (minTime && val <= minTime) return true;
      if (maxTime && val >= maxTime) return true;
      if (disabledIntervals && disabledIntervals.length > 0) {
        return disabledIntervals.some(
          (inv) => inv.startTime <= val && val < inv.endTime,
        );
      }
      return false;
    },
    [minTime, maxTime, disabledIntervals],
  );

  // Xử lý chọn giờ
  const handleSelectHour = (h: string, idx: number) => {
    setActiveHour(h);
    if (hourListRef.current) {
      hourListRef.current.scrollTop = idx * ITEM_HEIGHT;
    }
    onChange(`${h}:${activeMinute || '00'}`);
  };

  // Xử lý chọn phút
  const handleSelectMinute = (m: string, idx: number) => {
    setActiveMinute(m);
    if (minuteListRef.current) {
      minuteListRef.current.scrollTop = idx * ITEM_HEIGHT;
    }
    onChange(`${activeHour || '19'}:${m}`);
  };

  // Khóa cứng nấc lăn chuột (Wheel): Mỗi nấc nhảy chính xác đúng 40.0px, vừa cuộn nhanh vừa không bao giờ lệch tâm
  useEffect(() => {
    if (!isOpen) return;
    const hourEl = hourListRef.current;
    const minEl = minuteListRef.current;
    if (!hourEl || !minEl) return;

    const onHourWheel = (e: WheelEvent) => {
      e.preventDefault();
      const currentIdx = Math.round(hourEl.scrollTop / ITEM_HEIGHT);
      const step = e.deltaY > 0 ? 1 : -1;
      const nextIdx = Math.max(0, Math.min(availableHours.length - 1, currentIdx + step));
      hourEl.scrollTop = nextIdx * ITEM_HEIGHT;

      const selectedH = availableHours[nextIdx];
      if (selectedH) {
        setActiveHour(selectedH);
        onChange(`${selectedH}:${activeMinute || '00'}`);
      }
    };

    const onMinWheel = (e: WheelEvent) => {
      e.preventDefault();
      const currentIdx = Math.round(minEl.scrollTop / ITEM_HEIGHT);
      const step = e.deltaY > 0 ? 1 : -1;
      const nextIdx = Math.max(0, Math.min(availableMinutes.length - 1, currentIdx + step));
      minEl.scrollTop = nextIdx * ITEM_HEIGHT;

      const selectedM = availableMinutes[nextIdx];
      if (selectedM) {
        setActiveMinute(selectedM);
        onChange(`${activeHour || '19'}:${selectedM}`);
      }
    };

    hourEl.addEventListener('wheel', onHourWheel, { passive: false });
    minEl.addEventListener('wheel', onMinWheel, { passive: false });

    return () => {
      hourEl.removeEventListener('wheel', onHourWheel);
      minEl.removeEventListener('wheel', onMinWheel);
    };
  }, [isOpen, onChange, availableHours, availableMinutes, activeHour, activeMinute]);

  // Snap khi thả chuột hoặc kết thúc cuộn
  const handleSnapHour = () => {
    if (!hourListRef.current) return;
    const currentIdx = Math.round(hourListRef.current.scrollTop / ITEM_HEIGHT);
    const nextIdx = Math.max(0, Math.min(availableHours.length - 1, currentIdx));
    hourListRef.current.scrollTop = nextIdx * ITEM_HEIGHT;
    const selectedH = availableHours[nextIdx];
    if (selectedH && selectedH !== activeHour) {
      setActiveHour(selectedH);
      onChange(`${selectedH}:${activeMinute || '00'}`);
    }
  };

  const handleSnapMin = () => {
    if (!minuteListRef.current) return;
    const currentIdx = Math.round(minuteListRef.current.scrollTop / ITEM_HEIGHT);
    const nextIdx = Math.max(0, Math.min(availableMinutes.length - 1, currentIdx));
    minuteListRef.current.scrollTop = nextIdx * ITEM_HEIGHT;
    const selectedM = availableMinutes[nextIdx];
    if (selectedM && selectedM !== activeMinute) {
      setActiveMinute(selectedM);
      onChange(`${activeHour || '19'}:${selectedM}`);
    }
  };

  const isBlockedValue = isCurrentValueBlocked(value);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
          {typeof label === 'string' && label.includes('*') ? (
            <>
              {label.replace(/\s*\*/, '')} <span className="text-red-500">*</span>
            </>
          ) : (
            label
          )}
        </label>
      )}

      {/* Input Display Box */}
      <button
        type="button"
        onClick={handleToggleOpen}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm flex items-center justify-between bg-white transition-all duration-150 outline-none cursor-pointer ${
          isOpen
            ? 'border-primary-600 ring-2 ring-primary-600/20 shadow-xs'
            : 'border-slate-200 hover:border-slate-300'
        } ${error ? 'border-red-500 ring-2 ring-red-100' : ''}`}
      >
        <span
          className={`text-sm tracking-wide ${
            isBlockedValue ? 'text-red-500 font-semibold' : 'font-medium text-slate-800'
          }`}
        >
          {format24Hour(value, minuteStep)}
        </span>

        <Clock
          className={`w-4 h-4 shrink-0 ${
            isBlockedValue ? 'text-red-500' : 'text-slate-500'
          }`}
        />
      </button>

      {/* Bảng chọn giờ siêu mượt mà không bao giờ lệch tâm */}
      {isOpen && (
        <div
          className={`absolute z-50 left-0 right-0 bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl p-4 min-w-[220px] ${
            openUpward ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'
          }`}
        >
          {/* Header Tiêu Đề Cột */}
          <div className="grid grid-cols-2 text-center pb-2 mb-2 border-b border-slate-100 font-medium text-[11px] text-slate-500 uppercase tracking-wider">
            <span>GIỜ</span>
            <span className="border-l border-slate-100">PHÚT</span>
          </div>

          {/* Wheel Container (Cao 200px hiển thị 5 hàng chuẩn) */}
          <div
            style={{ height: `${CONTAINER_HEIGHT}px` }}
            className="relative grid grid-cols-2 gap-2 select-none overflow-hidden"
          >
            {/* Khung Highlight cố định ở giữa (Tâm y=80px, Cao 40px) */}
            <div
              style={{ top: `${CENTER_OFFSET}px`, height: `${ITEM_HEIGHT}px` }}
              className="absolute left-0 right-0 bg-primary-50/60 border border-primary-600/60 pointer-events-none rounded-xl z-0"
            />

            {/* Lớp phủ Gradient mờ nhẹ trên & dưới */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white via-white/30 to-transparent z-20" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white via-white/30 to-transparent z-20" />

            {/* Cột GIỜ (24H: 00 -> 23) */}
            <div
              ref={hourListRef}
              onMouseUp={handleSnapHour}
              onTouchEnd={handleSnapHour}
              className="relative z-10 overflow-y-auto space-y-0 text-center [overscroll-behavior:contain] [scrollbar-width:none] [-ms-overflow-style:none] [::-webkit-scrollbar]:hidden"
            >
              {/* Spacer trên đúng 80px để item 00 rơi vào tâm */}
              <div style={{ height: `${CENTER_OFFSET}px` }} className="shrink-0 pointer-events-none" />

              {availableHours.map((h, idx) => {
                const isCenter = h === activeHour;
                const isBlocked = isHourBlocked(h);

                return (
                  <button
                    key={`h-${h}`}
                    type="button"
                    disabled={isBlocked}
                    onClick={() => !isBlocked && handleSelectHour(h, idx)}
                    style={{
                      height: `${ITEM_HEIGHT}px`,
                      lineHeight: `${ITEM_HEIGHT}px`,
                    }}
                    className={`w-full flex items-center justify-center rounded-lg transition-colors text-sm ${
                      isBlocked
                        ? 'text-red-400 line-through decoration-red-300 cursor-not-allowed pointer-events-none'
                        : isCenter
                        ? 'text-slate-900 font-medium text-sm'
                        : 'text-slate-500 hover:text-slate-700 cursor-pointer'
                    }`}
                  >
                    <span>{h}</span>
                  </button>
                );
              })}

              {/* Spacer dưới đúng 80px */}
              <div style={{ height: `${CENTER_OFFSET}px` }} className="shrink-0 pointer-events-none" />
            </div>

            {/* Cột PHÚT (00, 15, 30, 45) */}
            <div
              ref={minuteListRef}
              onMouseUp={handleSnapMin}
              onTouchEnd={handleSnapMin}
              className="relative z-10 overflow-y-auto space-y-0 text-center border-l border-slate-100 [overscroll-behavior:contain] [scrollbar-width:none] [-ms-overflow-style:none] [::-webkit-scrollbar]:hidden"
            >
              {/* Spacer trên đúng 80px */}
              <div style={{ height: `${CENTER_OFFSET}px` }} className="shrink-0 pointer-events-none" />

              {availableMinutes.map((m, idx) => {
                const isCenter = m === activeMinute;
                const isBlocked = isMinuteBlocked(m);

                return (
                  <button
                    key={`m-${m}`}
                    type="button"
                    disabled={isBlocked}
                    onClick={() => !isBlocked && handleSelectMinute(m, idx)}
                    style={{
                      height: `${ITEM_HEIGHT}px`,
                      lineHeight: `${ITEM_HEIGHT}px`,
                    }}
                    className={`w-full flex items-center justify-center rounded-lg transition-colors text-sm ${
                      isBlocked
                        ? 'text-red-400 line-through decoration-red-300 cursor-not-allowed pointer-events-none'
                        : isCenter
                        ? 'text-slate-900 font-medium text-sm'
                        : 'text-slate-500 hover:text-slate-700 cursor-pointer'
                    }`}
                  >
                    <span>{m}</span>
                  </button>
                );
              })}

              {/* Spacer dưới đúng 80px */}
              <div style={{ height: `${CENTER_OFFSET}px` }} className="shrink-0 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
